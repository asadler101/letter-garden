const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
function setup({silent=false, muted=false, playError=null, savedState={}, rawSave, readError=false, writeError=false}={}){
  const elements=new Map(), calls=[], spoken=[], writes=[];
  const element=()=>({innerHTML:'',textContent:'',classList:{add(){},remove(){}},setAttribute(){},querySelectorAll(){return []},querySelector(){return null},focus(){},remove(){}});
  const document={getElementById(id){if(!elements.has(id)) elements.set(id,element());return elements.get(id)},querySelectorAll(){return []},createElement:element,body:{append(){}},addEventListener(){}};
  class Audio {pause(){calls.push('pause')} play(){calls.push(this.src);return playError?Promise.reject(playError):Promise.resolve()}}
  const context=vm.createContext({document,Audio,URLSearchParams,location:{search:silent?'?silent=1':''},localStorage:{getItem(){if(readError)throw new Error('blocked');return rawSave !== undefined ? rawSave : JSON.stringify({sound:!muted,...savedState})},setItem(key,value){if(writeError)throw new Error('quota');writes.push({key,value})}},window:{scrollTo(){},speechSynthesis:{cancel(){},resume(){},getVoices(){return []},speak(utterance){spoken.push(utterance)}}},SpeechSynthesisUtterance:class{constructor(text){this.text=text}},setTimeout(){},clearTimeout(){},console});
  context.window.SpeechSynthesisUtterance=context.SpeechSynthesisUtterance;
  vm.runInContext(source,context);
  return {run:code=>vm.runInContext(code,context),calls,spoken,elements,writes};
}
const plays=env=>env.calls.filter(x=>x.startsWith('audio/'));
test('another letter starts exactly one recording, synchronously from its handler',()=>{
 const env=setup(); env.run("mode='find';round()"); assert.equal(plays(env).length,1);
 env.elements.get('next').onclick(); assert.equal(plays(env).length,2);
 assert.match(plays(env)[1],/^audio\/find-[A-Z]\.wav$/);
});
test('muted and quiet previews make no audio or speech requests',()=>{
 for(const options of [{silent:true},{muted:true}]){const env=setup(options);env.run("mode='find';round();speak('hello','sound-on')");assert.equal(plays(env).length,0);assert.equal(env.spoken.length,0);}
});
test('stale failed recordings cannot interrupt a newer tap',async()=>{
 const env=setup({playError:Object.assign(new Error('decode'),{name:'NotSupportedError'})});
 env.run("speak('first','find-A');speak('second','find-B')");
 await new Promise(setImmediate); assert.deepEqual(env.spoken.map(x=>x.text),['second']);
});
test('blocked autoplay gives a visible hint without queuing more audio',async()=>{
 const env=setup({playError:Object.assign(new Error('gesture'),{name:'NotAllowedError'})});
 env.run("mode='find';round()"); await new Promise(setImmediate);
 assert.match(env.elements.get('feedback').textContent,/^Find [A-Z]$/);
 assert.match(env.elements.get('toast').textContent,/Tap Hear the letter/);assert.equal(env.spoken.length,0);
});
test('all 133 bundled recordings are valid non-silent PCM WAVs',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'audio/manifest.json'),'utf8'));
 assert.equal(Object.keys(manifest).length,133);
 for(const name of Object.keys(manifest)){
  const data=fs.readFileSync(path.join(root,'audio',name+'.wav'));
  assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WAVE');
  const at=data.indexOf(Buffer.from('data'));assert.ok(at>0,name);assert.ok(data.length>1000,name);
  let peak=0;for(let i=at+8;i+1<data.length;i+=2)peak=Math.max(peak,Math.abs(data.readInt16LE(i)));assert.ok(peak>100,name);
 }
});

test('picnic narration names each letter once',()=>{
 const env=setup();
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'audio/manifest.json'),'utf8'));
 for(const [letter,word] of env.run('alphabet')) assert.equal(manifest['explore-'+letter],`${letter} is for ${word}.`);
 assert.ok(source.includes('speak(`${item[0]} is for ${item[1]}.`,`explore-${item[0]}`)'));
});

function win(env){env.run("answer({dataset:{letter:target[0]},classList:{add(){},remove(){}}})");}
test('five discoveries celebrate and wait for the child before resetting the patch',()=>{
 const env=setup({silent:true});env.run("mode='find';round()");
 for(let i=1;i<=5;i++){
   win(env);assert.equal(env.run('state.garden.flowers'),i);assert.equal(env.run('state.garden.patchFlowers'),i);
   if(i<5){assert.equal(env.run('mode'),'find');env.elements.get('next').onclick();}
 }
 assert.equal(env.run('mode'),'reward');assert.match(env.elements.get('app').innerHTML,/Your garden is in bloom!/);
 env.run("answer({dataset:{letter:'A'}})");assert.equal(env.run('state.garden.flowers'),5);
 env.elements.get('plant-next').onclick();assert.equal(env.run('state.garden.flowers'),5);assert.equal(env.run('state.garden.patchFlowers'),0);assert.equal(env.run('mode'),'find');
 win(env);assert.equal(env.run('state.garden.flowers'),6);assert.equal(env.run('state.garden.patchFlowers'),1);
});
test('completed garden survives reload and keeps the selected matching game',()=>{
 const env=setup({silent:true,savedState:{flowers:10,patchFlowers:5}});
 env.run("start('match')");assert.equal(env.run('mode'),'reward');assert.equal(env.run('state.garden.flowers'),10);
 env.elements.get('rest').onclick();assert.equal(env.run('state.garden.patchFlowers'),5);
 env.run("start('match')");env.elements.get('plant-next').onclick();assert.equal(env.run('mode'),'match');assert.equal(env.run('state.garden.patchFlowers'),0);assert.equal(env.run('state.garden.flowers'),10);
});
test('older saved totals carry progress into the current patch',()=>{
 const env=setup({silent:true,savedState:{flowers:12}});assert.equal(env.run('state.garden.patchFlowers'),2);
 env.run("mode='find';round()");for(let i=0;i<3;i++){win(env);if(i<2)env.elements.get('next').onclick();}
 assert.equal(env.run('mode'),'reward');assert.equal(env.run('state.garden.flowers'),15);
});
test('milestone plays one celebration recording instead of overlapping cheers',()=>{
 const env=setup({savedState:{flowers:4}});env.run("mode='find';round()");win(env);
 assert.deepEqual(plays(env).slice(1),['audio/garden-complete.wav']);
});

test('an older save with exactly five flowers can claim its completed garden',()=>{
 const env=setup({silent:true,savedState:{flowers:5}});assert.equal(env.run('state.garden.patchFlowers'),5);
 env.run("start('find')");assert.equal(env.run('mode'),'reward');assert.equal(env.run('state.garden.flowers'),5);
});


test('subject navigation preserves saved preferences and a completed garden',()=>{
 const env=setup({silent:true,savedState:{set:'custom',custom:'SAM',case:'lower',sound:false,flowers:15,patchFlowers:5}});
 const before=env.run('JSON.stringify(state)');
 assert.equal(env.run('mode'),'home');
 assert.match(env.elements.get('app').innerHTML,/Welcome to Learning Garden/);
 assert.match(env.elements.get('app').innerHTML,/Number Garden/);
 assert.match(env.elements.get('app').innerHTML,/Coming soon/);
 assert.doesNotMatch(env.elements.get('app').innerHTML,/<button[^>]*id="number-garden"/);
 env.elements.get('letter-garden').onclick();assert.equal(env.run('mode'),'letters');
 assert.match(env.elements.get('app').innerHTML,/Find a letter/);
 env.run("start('match')");assert.equal(env.run('mode'),'reward');
 env.elements.get('back').onclick();assert.equal(env.run('mode'),'letters');
 env.elements.get('subject-home').onclick();assert.equal(env.run('mode'),'home');
 env.elements.get('see-garden').onclick();assert.equal(env.run('mode'),'reward');
 env.elements.get('rest').onclick();assert.equal(env.run('mode'),'home');
 assert.equal(env.run('JSON.stringify(state)'),before);
 assert.equal(plays(env).length,0);
});

test('all letter activities return to the letter menu and the brand returns home',()=>{
 const env=setup({silent:true});
 for(const activity of ['find','match','explore']){
  env.run(`start('${activity}')`);
  env.elements.get('back').onclick();assert.equal(env.run('mode'),'letters');
  env.elements.get('home').onclick();assert.equal(env.run('mode'),'home');
 }
});


test('legacy preferences and completed patch migrate into a versioned save',()=>{
 const env=setup({savedState:{flowers:15,patchFlowers:5,sound:false,set:'custom',custom:'Sam!',case:'lower'}});
 const saved=JSON.parse(env.writes.at(-1).value);
 assert.equal(saved.version,1);assert.deepEqual(saved.garden,{flowers:15,patchFlowers:5});
 assert.deepEqual(saved.preferences,{sound:false,letters:{set:'custom',custom:'SAM',case:'lower'},numbers:{}});
 assert.equal(saved.flowers,undefined);assert.equal(env.writes[0].key,'letter-garden');
 const reload=setup({rawSave:JSON.stringify(saved)});reload.run("start('find')");assert.equal(reload.run('mode'),'reward');
});

test('versioned saves preserve independent preferences and future fields across writes and reset',()=>{
 const saved={version:1,garden:{flowers:7,patchFlowers:2,visitors:['bee']},preferences:{sound:false,letters:{set:'full',custom:'ABC',case:'lower',hint:true},numbers:{max:5}},missions:{active:'hello'},decorations:['pot'],name:'Sam'};
 const env=setup({rawSave:JSON.stringify(saved)});
 assert.deepEqual(JSON.parse(env.writes.at(-1).value),saved);
 env.elements.get('sound').onclick();
 // The dialog methods are browser APIs; stub close before exercising reset.
 env.elements.get('settings').close=()=>{};env.elements.get('reset').onclick();
 const result=JSON.parse(env.writes.at(-1).value);
 assert.deepEqual(result.preferences.numbers,{max:5});assert.deepEqual(result.garden.visitors,['bee']);
 assert.deepEqual(result.missions,saved.missions);assert.deepEqual(result.decorations,saved.decorations);assert.equal(result.name,'Sam');
 assert.equal(result.garden.flowers,0);assert.equal(result.garden.patchFlowers,0);
});

test('missing and malformed storage still allow play with validated defaults',()=>{
 for(const rawSave of [null,'{bad','null','[]','42',JSON.stringify({flowers:-1,patchFlowers:5,sound:'false',set:'bad',custom:12,case:'bad'})]){
  const env=setup({rawSave,silent:true});env.run("start('find')");win(env);
  assert.equal(env.run('state.garden.flowers'),1);assert.equal(env.run('state.garden.patchFlowers'),1);
  assert.equal(env.run('state.preferences.sound'),true);
 }
});

test('unavailable reads and failed writes do not prevent earning flowers and warn parents',()=>{
 for(const options of [{readError:true,writeError:true},{writeError:true}]){
  const env=setup({...options,silent:true});env.run("start('find')");win(env);
  assert.equal(env.run('state.garden.flowers'),1);
  assert.match(env.elements.get('storage-status').textContent,/cannot be saved/);assert.equal(env.elements.get('storage-status').hidden,false);
 }
});

test('unsupported save versions are never overwritten',()=>{
 const env=setup({rawSave:JSON.stringify({version:99,garden:{flowers:10,patchFlowers:5}}),silent:true});
 env.run('persist()');assert.equal(env.writes.length,0);assert.match(env.elements.get('storage-status').textContent,/different version/);
});
