const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
function setup({silent=false, muted=false, playError=null, savedState={}, rawSave, readError=false, writeError=false, browser={}}={}){
  const elements=new Map(), calls=[], spoken=[], writes=[], scrolls=[], timers=new Map();let timerId=0;
  const element=()=>({append(){},innerHTML:'',textContent:'',classList:{add(){},remove(){}},setAttribute(){},querySelectorAll(){return []},querySelector(){return null},focus(){},remove(){}});
  const document={getElementById(id){if(!elements.has(id)) elements.set(id,element());return elements.get(id)},querySelectorAll(){return []},createElement:element,body:{append(){}},addEventListener(){}};
  class Audio {pause(){calls.push('pause')} play(){calls.push(this.src);return playError?Promise.reject(playError):Promise.resolve()}}
  const context=vm.createContext({document,Audio,URLSearchParams,File:require('node:buffer').File,URL:{createObjectURL(){return 'blob:backup'},revokeObjectURL(){}},navigator:{},...browser,location:{search:silent?'?silent=1':''},localStorage:{getItem(){if(readError)throw new Error('blocked');return rawSave !== undefined ? rawSave : JSON.stringify({sound:!muted,...savedState})},setItem(key,value){if(writeError)throw new Error('quota');writes.push({key,value})}},window:{scrollTo(...position){scrolls.push(position)},speechSynthesis:{cancel(){},resume(){},getVoices(){return []},speak(utterance){spoken.push(utterance)}}},SpeechSynthesisUtterance:class{constructor(text){this.text=text}},setTimeout(fn,delay){const id=++timerId;timers.set(id,{fn,delay});return id;},clearTimeout(id){timers.delete(id);},console});
  context.window.SpeechSynthesisUtterance=context.SpeechSynthesisUtterance;
  vm.runInContext(source,context);
  return {run:code=>vm.runInContext(code,context),calls,spoken,elements,writes,scrolls,timers,fireTimers:delay=>{for(const [id,timer] of [...timers])if(timer.delay===delay&&timers.delete(id))timer.fn();}};
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
test('all 203 bundled recordings are valid non-silent PCM WAVs',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'audio/manifest.json'),'utf8'));
 assert.equal(Object.keys(manifest).length,203);
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
 assert.match(env.elements.get('app').innerHTML,/<button[^>]*id="number-garden"/);
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
 assert.deepEqual(saved.preferences,{sound:false,letters:{set:'custom',custom:'SAM',case:'lower'},numbers:{max:5}});
 assert.equal(saved.flowers,undefined);assert.equal(env.writes[0].key,'letter-garden');
 const reload=setup({rawSave:JSON.stringify(saved)});reload.run("start('find')");assert.equal(reload.run('mode'),'reward');
});

test('versioned saves preserve independent preferences and future fields across writes and reset',()=>{
 const saved={version:1,garden:{flowers:7,patchFlowers:2,visitors:['bee']},preferences:{sound:false,letters:{set:'full',custom:'ABC',case:'lower',hint:true},numbers:{max:5}},missions:{active:'hello'},decorations:['pot'],name:'Sam'};
 const env=setup({rawSave:JSON.stringify(saved)});
 assert.deepEqual(JSON.parse(env.writes.at(-1).value),{...saved,practiceHistory:emptyHistory()});
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

const emptyHistory=()=>({version:1,activities:[],letters:[],numbers:[],discoveries:0});
const backup = () => ({practiceHistory:emptyHistory(),decorationRewards:{nextId:2,patchEarned:true,pending:[{id:1}],claimed:[]},visitorRewards:{nextId:2,patchEarned:true,pending:[1],opened:[]},version:1,garden:{flowers:10,patchFlowers:5,visitors:['bee']},preferences:{sound:false,letters:{set:'custom',custom:'SAM',case:'lower'},numbers:{max:5}},name:'Sam',missions:{next:2}});
test('backup review waits for explicit confirmation and restores all fields atomically',async()=>{
 const env=setup({silent:true});const initial=env.run('JSON.stringify(state)'),writes=env.writes.length;
 const saved=backup();await env.run(`reviewBackup({size:100,text:async()=>${JSON.stringify(JSON.stringify(saved))}})`);
 assert.equal(env.run('JSON.stringify(state)'),initial);assert.equal(env.writes.length,writes);
 assert.match(env.elements.get('backup-summary').textContent,/10 flowers.*5 of 5.*complete/);
 assert.equal(env.elements.get('backup-review').hidden,false);
 env.elements.get('settings').close=()=>{};env.elements.get('confirm-import').onclick();
 assert.deepEqual(JSON.parse(env.run('JSON.stringify(state)')),saved);
 assert.deepEqual(JSON.parse(env.writes.at(-1).value),saved);
 env.run("start('match')");assert.equal(env.run('mode'),'reward');assert.equal(plays(env).length,0);
});
test('invalid and unsupported imports leave saved and in-memory progress unchanged',async()=>{
 const invalid=['{bad','null','[]','42',JSON.stringify({...backup(),version:99}),JSON.stringify({...backup(),garden:{flowers:2,patchFlowers:5}}),JSON.stringify({...backup(),preferences:{}})];
 for(const raw of invalid){
  const env=setup({silent:true}),before=env.run('JSON.stringify(state)'),writes=env.writes.length;
  await env.run(`reviewBackup({size:100,text:async()=>${JSON.stringify(raw)}})`);
  env.elements.get('confirm-import').onclick();
  assert.equal(env.run('JSON.stringify(state)'),before);assert.equal(env.writes.length,writes);
  assert.equal(env.elements.get('backup-review').hidden,true);assert.match(env.elements.get('backup-status').textContent,/has not changed/);
 }
});
test('canceling, oversized files, failed reads and failed writes preserve the garden',async()=>{
 for(const failWrite of [false,true]){
  const env=setup({silent:true,writeError:failWrite}),before=env.run('JSON.stringify(state)');
  await env.run(`reviewBackup({size:100,text:async()=>${JSON.stringify(JSON.stringify(backup()))}})`);
  if(failWrite){env.elements.get('confirm-import').onclick();assert.match(env.elements.get('backup-status').textContent,/could not be saved/);}
  else {env.elements.get('cancel-import').onclick();env.elements.get('confirm-import').onclick();}
  assert.equal(env.run('JSON.stringify(state)'),before);
  await env.run("reviewBackup({size:1048577,text:async()=>{throw Error('must not read')}})");
  assert.match(env.elements.get('backup-status').textContent,/smaller than 1 MB/);
  await env.run("reviewBackup({size:10,text:async()=>{throw Error('read failed')}})");
  assert.match(env.elements.get('backup-status').textContent,/read failed/);assert.equal(env.run('JSON.stringify(state)'),before);
 }
});
test('closing review ignores late reads and selecting an invalid file discards earlier approval',async()=>{
 const env=setup({silent:true});
 env.run('let finishRead;reviewBackup({size:10,text:()=>new Promise(resolve=>finishRead=resolve)})');
 env.elements.get('settings').onclose();env.run(`finishRead(${JSON.stringify(JSON.stringify(backup()))})`);await new Promise(setImmediate);
 assert.equal(env.run('pendingBackup'),null);
 await env.run(`reviewBackup({size:100,text:async()=>${JSON.stringify(JSON.stringify(backup()))}})`);
 await env.run("reviewBackup({size:10,text:async()=>'{bad'})");assert.equal(env.run('pendingBackup'),null);
});
test('export round-trips full versioned data and native share is started directly from the tap',async()=>{
 let shared;const env=setup({silent:true,rawSave:JSON.stringify(backup()),browser:{navigator:{canShare:()=>true,share(data){shared=data;return Promise.resolve();}}}});
 const file=env.run('backupFile()');assert.match(file.name,/learning-garden-v1-.*\.json$/);assert.equal(file.type,'application/json');
 assert.deepEqual(JSON.parse(await file.text()),backup());
 env.run('prepareBackupSettings()');assert.equal(env.elements.get('share-backup').hidden,false);
 const sharing=env.elements.get('share-backup').onclick();assert.ok(shared.files[0]);await sharing;
 assert.deepEqual(JSON.parse(await shared.files[0].text()),backup());
 const unsupported=setup({rawSave:JSON.stringify({...backup(),version:99})});assert.throws(()=>unsupported.run('backupFile()'),/newer game/);
});


test('number range defaults safely and preserves future number preferences',()=>{
 for(const numbers of [undefined,{},null,[],{max:0},{max:6},{max:'10'},{max:10,hints:true}]){
  const saved=backup();saved.preferences.numbers=numbers;
  const env=setup({silent:true,rawSave:JSON.stringify(saved)});
  assert.equal(env.run('state.preferences.numbers.max'),numbers?.max===10?10:5);
  if(numbers?.hints)assert.equal(env.run('state.preferences.numbers.hints'),true);
 }
});
test('number settings persist independently from letters and survive reload',()=>{
 const saved=backup();saved.preferences.numbers={max:5,hints:true};
 const env=setup({silent:true,rawSave:JSON.stringify(saved)});
 env.elements.get('settings').showModal=()=>{};env.elements.get('settings').close=()=>{};
 env.elements.get('grownups').onclick();assert.equal(env.elements.get('number-range').value,'5');
 env.elements.get('number-range').value='10';env.elements.get('save-settings').onclick();
 const result=JSON.parse(env.writes.at(-1).value);
 assert.deepEqual(result.preferences.letters,saved.preferences.letters);
 assert.deepEqual(result.preferences.numbers,{max:10,hints:true});
 const reloaded=setup({silent:true,rawSave:JSON.stringify(result)});
 assert.equal(reloaded.run('state.preferences.numbers.max'),10);
 env.elements.get('letter-set').value='full';env.elements.get('case').value='upper';env.elements.get('save-settings').onclick();
 assert.equal(JSON.parse(env.writes.at(-1).value).preferences.numbers.max,10);
});
test('shared number rounds have three distinct in-range choices and avoid the last target',()=>{
 const env=setup({silent:true});
 for(const max of [5,10]){
  env.run(`state.preferences.numbers.max=${max}`);
  assert.deepEqual(JSON.parse(env.run('JSON.stringify(numberPool())')),Array.from({length:max},(_,i)=>i+1));
  for(let previous=1;previous<=max;previous++)for(let i=0;i<20;i++){
   const round=JSON.parse(env.run(`JSON.stringify(numberRound(${previous}))`));
   assert.notEqual(round.target,previous);assert.equal(new Set(round.choices).size,3);
   assert.ok(round.choices.includes(round.target));assert.ok(round.choices.every(n=>Number.isInteger(n)&&n>=1&&n<=max));
  }
 }
 assert.equal(env.run('state.garden.flowers'),0);
});
test('number backups normalize older empty preferences and reject invalid ranges before replacement',async()=>{
 for(const max of [undefined,5,10]){
  const saved=backup();saved.preferences.numbers=max===undefined?{}:{max,future:'kept'};
  const env=setup({silent:true});
  await env.run(`reviewBackup({size:100,text:async()=>${JSON.stringify(JSON.stringify(saved))}})`);
  assert.match(env.elements.get('backup-summary').textContent,new RegExp(`Numbers: 1–${max||5}`));
  env.elements.get('settings').close=()=>{};env.elements.get('confirm-import').onclick();
  const exported=JSON.parse(await env.run('backupFile()').text());
  assert.deepEqual(exported.preferences.numbers,{...saved.preferences.numbers,max:max||5});
 }
 for(const max of [null,0,6,11,'10']){
  const saved=backup();saved.preferences.numbers.max=max;
  const env=setup({silent:true});const before=env.run('JSON.stringify(state)'),writes=env.writes.length;
  await env.run(`reviewBackup({size:100,text:async()=>${JSON.stringify(JSON.stringify(saved))}})`);
  assert.equal(env.run('JSON.stringify(state)'),before);assert.equal(env.writes.length,writes);
  assert.equal(env.elements.get('backup-review').hidden,true);
 }
});

function numberTap(env,expression='target',id='numberRoundId'){
 env.run(`answerNumber({dataset:{number:String(${expression})},classList:{add(){},remove(){}}},${id})`);
}
test('find a number offers distinct in-range numerals and replays one matching recording from a tap',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'audio/manifest.json'),'utf8'));
 const env=setup();env.elements.get('number-garden').onclick();assert.equal(env.run('mode'),'numbers');env.elements.get('find-number').onclick();
 for(const max of [5,10]){
  env.run(`state.preferences.numbers.max=${max}`);
  for(let i=0;i<30;i++){
   env.run('round()');const target=env.run('target');
   const choices=[...env.elements.get('app').innerHTML.matchAll(/data-number="(\d+)"/g)].map(m=>Number(m[1]));
   assert.equal(new Set(choices).size,3);assert.ok(choices.includes(target));assert.ok(choices.every(n=>n>=1&&n<=max));
   assert.equal(manifest[`number-find-${target}`],`Can you find ${env.run('numberWords[target]')}?`);
   const count=plays(env).length;env.elements.get('listen').onclick();
   assert.equal(plays(env).length,count+1);assert.equal(plays(env).at(-1),`audio/number-find-${target}.wav`);
  }
 }
 env.elements.get('back').onclick();assert.equal(env.run('mode'),'numbers');
});
test('number hints allow unlimited retries; mute exposes the target and makes no audio requests',()=>{
 for(const options of [{muted:true},{silent:true}]){
  const env=setup(options);env.run("start('number')");
  if(options.muted)assert.ok(env.elements.get('app').innerHTML.includes(env.run('numberPrompt()')));
  for(let i=0;i<12;i++)numberTap(env,'target===1?2:1');
  assert.equal(env.run('answered'),false);assert.equal(env.run('state.garden.flowers'),0);
  assert.match(env.elements.get('feedback').textContent,/Try another!/);
  numberTap(env);assert.equal(env.run('state.garden.flowers'),1);
  assert.equal(plays(env).length,0);assert.equal(env.spoken.length,0);
 }
 const env=setup();env.run("start('number')");env.elements.get('sound').onclick();
 assert.equal(env.elements.get('feedback').textContent,env.run('numberPrompt()'));
});
test('number reward is once per round, ignores old handlers, and shares mixed-patch celebration',()=>{
 const env=setup({silent:true});env.run("start('find')");win(env);
 env.run("start('number');var oldNumberRound=numberRoundId");numberTap(env);numberTap(env);
 assert.equal(env.run('state.garden.flowers'),2);assert.equal(env.elements.get('next').hidden,false);
 const oldNext=env.elements.get('next').onclick;oldNext();oldNext();
 numberTap(env,'target','oldNumberRound');assert.equal(env.run('state.garden.flowers'),2);
 for(let i=3;i<=5;i++){numberTap(env);numberTap(env);assert.equal(env.run('state.garden.flowers'),i);if(i<5)env.elements.get('next').onclick();}
 assert.equal(env.run('mode'),'reward');assert.equal(env.run('rewardMode'),'number');
 const saved=env.writes.at(-1).value;
 env.elements.get('plant-next').onclick();assert.equal(env.run('mode'),'number');assert.equal(env.run('state.garden.flowers'),5);assert.equal(env.run('state.garden.patchFlowers'),0);
 const reload=setup({silent:true,rawSave:saved});reload.run("start('number')");assert.equal(reload.run('mode'),'reward');
 reload.elements.get('back').onclick();assert.equal(reload.run('mode'),'numbers');
});
test('number settings restart the visible round within the new range without changing progress',()=>{
 const env=setup({silent:true});env.run("state.preferences.numbers.max=10;start('number')");
 env.elements.get('settings').showModal=()=>{};env.elements.get('settings').close=()=>{};
 env.elements.get('grownups').onclick();env.elements.get('number-range').value='5';
 const oldId=env.run('numberRoundId');env.elements.get('save-settings').onclick();
 assert.ok(env.run('numberRoundId')>oldId);assert.ok(env.run('target')<=5);
 assert.equal(env.run('state.garden.flowers'),0);
 assert.ok([...env.elements.get('app').innerHTML.matchAll(/data-number="(\d+)"/g)].every(m=>Number(m[1])<=5));
});
test('number recording failures use matching speech fallback and blocked playback shows a target',async()=>{
 for(const name of ['NotSupportedError','NotAllowedError']){
  const env=setup({playError:Object.assign(new Error('failed'),{name})});env.run("start('number')");await new Promise(setImmediate);
  if(name==='NotAllowedError'){assert.equal(env.elements.get('feedback').textContent,env.run('numberPrompt()'));assert.match(env.elements.get('toast').textContent,/Hear the number/);}
  else assert.deepEqual(env.spoken.map(x=>x.text),[env.run('`Can you find ${numberWords[target]}?`')]);
 }
});

function appleTap(env,index,id='numberRoundId'){
 env.run(`countObject({dataset:{object:String(${index})},classList:{add(){}},setAttribute(){},querySelector(){return {textContent:''}}},${id})`);
}
test('counting honors both ranges, any tap order, duplicate protection and child-controlled next',()=>{
 const env=setup({silent:true});env.elements.get('number-garden').onclick();env.elements.get('count-number').onclick();
 for(const max of [5,10])for(let round=0;round<20;round++){
  env.run(`state.preferences.numbers.max=${max};state.garden.patchFlowers=0;start('count')`);
  const total=env.run('target'),before=env.run('state.garden.flowers');assert.ok(total>=1&&total<=max);
  assert.equal([...env.elements.get('app').innerHTML.matchAll(/data-object=/g)].length,total);
  appleTap(env,-1);appleTap(env,total);assert.equal(env.run('countedObjects.size'),0);
  for(let i=total-1;i>=0;i--){appleTap(env,i);appleTap(env,i);assert.equal(env.run('countedObjects.size'),total-i);assert.equal(env.run('state.garden.flowers'),before+(i===0?1:0));}
  assert.equal(env.run('mode'),'count');assert.equal(env.run('answered'),true);assert.match(env.elements.get('feedback').textContent,new RegExp(`^${total} apples!`));
  const oldId=env.run('numberRoundId'),next=env.elements.get('next').onclick;next();next();assert.equal(env.run('numberRoundId'),oldId+1);appleTap(env,0,String(oldId));assert.equal(env.run('countedObjects.size'),0);
 }
 assert.equal(plays(env).length,0);
});
test('counting completion saves exactly one shared flower and survives reload of the fifth flower',()=>{
 const env=setup({silent:true,savedState:{flowers:4}});env.run("start('count')");
 const total=env.run('target');for(let i=0;i<total;i++)appleTap(env,i);
 appleTap(env,0);assert.equal(env.run('state.garden.flowers'),5);assert.equal(env.run('mode'),'count');
 const reload=setup({silent:true,rawSave:env.writes.at(-1).value});reload.run("start('count')");assert.equal(reload.run('mode'),'reward');assert.equal(reload.run('rewardMode'),'count');
 reload.elements.get('plant-next').onclick();assert.equal(reload.run('mode'),'count');assert.equal(reload.run('state.garden.flowers'),5);assert.equal(reload.run('state.garden.patchFlowers'),0);
 env.elements.get('next').onclick();assert.equal(env.run('mode'),'reward');assert.equal(env.run('state.garden.flowers'),5);
});
test('rapid counting queues every number without interruption and navigation cancels stale completions',()=>{
 const env=setup();env.run("start('count');target=5");
 for(let i=4;i>=0;i--)appleTap(env,i);
 assert.deepEqual(plays(env),['audio/count-prompt.wav','audio/count-number-1.wav']);
 for(let n=2;n<=5;n++){env.run('player.onended()');assert.equal(plays(env).at(-1),`audio/count-number-${n}.wav`);}
 const message=env.elements.get('feedback').textContent;env.run('player.onended()');assert.equal(env.run('countAudioQueue.length'),0);assert.equal(env.elements.get('feedback').textContent,message);
 env.run("start('count');countAudio(1);var oldCountEnd=player.onended;home();oldCountEnd()");assert.equal(env.run('countAudioQueue.length'),0);assert.equal(env.run('mode'),'home');
 const muted=setup({muted:true});muted.run("start('count')");appleTap(muted,0);assert.equal(plays(muted).length,0);
});
test('counting audio fallback advances the queue and failures never overwrite the visible count',async()=>{
 for(const name of ['NotAllowedError','NotSupportedError']){
  const env=setup({playError:Object.assign(new Error('failed'),{name})});env.run("start('count');target=3");appleTap(env,0);appleTap(env,1);appleTap(env,2);
  await new Promise(setImmediate);
  if(name==='NotSupportedError'){assert.equal(env.spoken.at(-1).text,'one');for(let i=0;i<3;i++){env.spoken.at(-1).onend();await new Promise(setImmediate);} }
  assert.equal(env.run('countAudioQueue.length'),0);assert.equal(env.elements.get('feedback').textContent,'3 apples! Your garden grew one flower!');
 }
});

function quantityTap(env,expression='target',id='numberRoundId'){
 env.run(`answerQuantity({dataset:{number:String(${expression})},classList:{add(){}}},${id})`);
}
function quantityApple(env,index,id='numberRoundId'){
 env.run(`quantityObject({dataset:{object:String(${index})},classList:{add(){}},setAttribute(){},querySelector(){return {textContent:''}}},${id})`);
}
test('quantity game is reachable with one in-range group and three distinct matching choices',()=>{
 const env=setup({silent:true});env.elements.get('number-garden').onclick();env.elements.get('how-many').onclick();assert.equal(env.run('mode'),'quantity');
 for(const max of [5,10])for(let i=0;i<40;i++){
  env.run(`state.preferences.numbers.max=${max};round()`);const target=env.run('target'),html=env.elements.get('app').innerHTML;
  assert.ok(target>=1&&target<=max);assert.equal([...html.matchAll(/data-object=/g)].length,target);
  const choices=[...html.matchAll(/data-number="(\d+)"/g)].map(m=>Number(m[1]));
  assert.equal(new Set(choices).size,3);assert.ok(choices.includes(target));assert.ok(choices.every(n=>n>=1&&n<=max));
 }
 env.elements.get('back').onclick();assert.equal(env.run('mode'),'numbers');assert.equal(plays(env).length,0);
});
test('quantity help never changes the answer or awards flowers and replays after all objects are counted',()=>{
 const env=setup();env.run("start('quantity');target=5");const target=env.run('target');
 quantityApple(env,-1);quantityApple(env,5);
 for(let i=4;i>=0;i--){quantityApple(env,i);quantityApple(env,i);}
 assert.equal(env.run('countedObjects.size'),5);assert.equal(env.run('answered'),false);assert.equal(env.run('state.garden.flowers'),0);
 assert.deepEqual(JSON.parse(env.run('JSON.stringify(countAudioQueue)')),[1,2,3,4,5]);
 quantityTap(env,'target===1?2:1');assert.equal(env.run('countedObjects.size'),5);
 env.elements.get('count-help').onclick();assert.equal(env.run('target'),target);
 assert.deepEqual(JSON.parse(env.run('JSON.stringify(countAudioQueue)')),[1,2,3,4,5]);
 for(let n=2;n<=5;n++){env.run('player.onended()');assert.equal(plays(env).at(-1),`audio/count-number-${n}.wav`);}
 env.run('player.onended()');env.elements.get('count-help').onclick();assert.equal(plays(env).at(-1),'audio/count-number-1.wav');
 quantityTap(env);quantityTap(env);env.elements.get('count-help').onclick();quantityApple(env,0);
 assert.equal(env.run('state.garden.flowers'),1);assert.equal(env.run('countAudioQueue.length'),0);
});
test('quantity stale help, answer and next handlers cannot change subsequent rounds or navigation',()=>{
 const env=setup({silent:true});env.run("start('quantity');var oldQuantityId=numberRoundId");
 const help=env.elements.get('count-help').onclick,listen=env.elements.get('listen').onclick;
 quantityTap(env);const next=env.elements.get('next').onclick;next();const id=env.run('numberRoundId');next();
 quantityTap(env,'target','oldQuantityId');quantityApple(env,0,'oldQuantityId');help();listen();
 assert.equal(env.run('numberRoundId'),id);assert.equal(env.run('countedObjects.size'),0);assert.equal(env.run('state.garden.flowers'),1);
 env.run('home()');quantityTap(env);help();assert.equal(env.run('mode'),'home');assert.equal(env.run('state.garden.flowers'),1);
});
test('quantity reward after help completes a shared patch and saves completed and partial rounds correctly',()=>{
 const env=setup({silent:true,savedState:{flowers:4}});env.run("start('quantity')");quantityApple(env,0);
 const partial=setup({silent:true,rawSave:env.writes.at(-1).value});partial.run("start('quantity')");assert.equal(partial.run('countedObjects.size'),0);assert.equal(partial.run('state.garden.flowers'),4);
 env.elements.get('count-help').onclick();quantityTap(env);quantityTap(env);assert.equal(env.run('mode'),'reward');assert.equal(env.run('rewardMode'),'quantity');assert.equal(env.run('state.garden.flowers'),5);
 const reload=setup({silent:true,rawSave:env.writes.at(-1).value});reload.run("start('quantity')");assert.equal(reload.run('mode'),'reward');reload.elements.get('back').onclick();assert.equal(reload.run('mode'),'numbers');
 env.elements.get('plant-next').onclick();assert.equal(env.run('mode'),'quantity');assert.equal(env.run('state.garden.patchFlowers'),0);assert.equal(env.run('state.garden.flowers'),5);
});
test('quantity mute, failures, replay and range changes retain useful counting feedback',async()=>{
 const muted=setup({muted:true});muted.run("start('quantity')");quantityApple(muted,0);muted.elements.get('count-help').onclick();quantityTap(muted,'target===1?2:1');assert.match(muted.elements.get('feedback').textContent,/Try another number/);assert.equal(plays(muted).length,0);
 const env=setup({playError:Object.assign(new Error('blocked'),{name:'NotAllowedError'})});env.run("start('quantity');target=5");quantityApple(env,0);const message=env.elements.get('feedback').textContent;await new Promise(setImmediate);assert.equal(env.elements.get('feedback').textContent,message);
 env.elements.get('sound').onclick();assert.equal(env.elements.get('feedback').textContent,message);assert.equal(env.run('countAudioQueue.length'),0);
 env.elements.get('settings').showModal=()=>{};env.elements.get('settings').close=()=>{};env.elements.get('grownups').onclick();env.elements.get('number-range').value='5';const old=env.run('numberRoundId');env.elements.get('save-settings').onclick();assert.ok(env.run('numberRoundId')>old);assert.ok(env.run('target')<=5);assert.equal(env.run('countedObjects.size'),0);assert.equal(env.run('state.garden.flowers'),0);
});


test('subject and activity navigation returns to the top and number hub shows shared progress',()=>{
 const env=setup({silent:true,savedState:{flowers:12,patchFlowers:2}});
 const atTop=(action,mode)=>{const before=env.scrolls.length;action();assert.equal(env.run('mode'),mode);assert.equal(env.scrolls.length,before+1);assert.deepEqual(env.scrolls.at(-1),[0,0]);};
 for(const [card,activity] of [['find-number','number'],['count-number','count'],['how-many','quantity']]){
  atTop(()=>env.elements.get('number-garden').onclick(),'numbers');
  const html=env.elements.get('app').innerHTML;assert.match(html,/2 of 5 flowers/);assert.match(html,/12 flowers in all/);
  assert.equal([...html.matchAll(/class="card-art" aria-hidden="true"/g)].length,3);
  atTop(()=>env.elements.get(card).onclick(),activity);atTop(()=>env.elements.get('back').onclick(),'numbers');atTop(()=>env.elements.get('back').onclick(),'home');
 }
 atTop(()=>env.elements.get('letter-garden').onclick(),'letters');
 for(const activity of ['find','match','explore']){atTop(()=>env.run(`start('${activity}')`),activity);atTop(()=>env.elements.get('back').onclick(),'letters');}
 atTop(()=>env.elements.get('subject-home').onclick(),'home');assert.equal(env.run('state.garden.flowers'),12);assert.equal(plays(env).length,0);
});

test('mixed subjects complete one patch and reload and replant retain independent settings',()=>{
 const saved={version:1,garden:{flowers:20,patchFlowers:0},preferences:{sound:false,letters:{set:'custom',custom:'SAM',case:'lower'},numbers:{max:10}}};
 const env=setup({silent:true,rawSave:JSON.stringify(saved)}),preferences=env.run('JSON.stringify(state.preferences)');
 for(const activity of ['find','number','count','match','quantity']){
  env.run(`start('${activity}')`);
  if(activity==='find'||activity==='match')win(env);
  else if(activity==='number')numberTap(env);
  else if(activity==='quantity'){quantityApple(env,0);quantityTap(env);quantityTap(env);}
  else {for(let i=env.run('target')-1;i>=0;i--)appleTap(env,i);}
  env.elements.get('home').onclick();
 }
 assert.equal(env.run('state.garden.flowers'),25);assert.equal(env.run('state.garden.patchFlowers'),5);
 const reload=setup({silent:true,rawSave:env.writes.at(-1).value});reload.elements.get('number-garden').onclick();assert.match(reload.elements.get('app').innerHTML,/Five flowers!/);
 reload.elements.get('see-garden').onclick();assert.equal(reload.run('mode'),'reward');reload.elements.get('back').onclick();assert.equal(reload.run('mode'),'numbers');
 reload.elements.get('see-garden').onclick();reload.elements.get('plant-next').onclick();assert.equal(reload.run('mode'),'number');assert.equal(reload.run('state.garden.flowers'),25);assert.equal(reload.run('state.garden.patchFlowers'),0);
 assert.equal(reload.run('JSON.stringify(state.preferences)'),preferences);reload.run("start('find')");assert.match(reload.elements.get('app').innerHTML,/aria-label="Letter [sam]"/);assert.ok(reload.run("pool().every(item=>'SAM'.includes(item[0]))"));
 const planted=setup({silent:true,rawSave:reload.writes.at(-1).value});assert.equal(planted.run('state.garden.flowers'),25);assert.equal(planted.run('state.garden.patchFlowers'),0);assert.equal(planted.run('JSON.stringify(state.preferences)'),preferences);
});

test('mixed patch announces its fifth discovery once and reopening never announces again',()=>{
 const env=setup({savedState:{flowers:3,patchFlowers:3}});env.run("start('find')");win(env);env.elements.get('home').onclick();env.elements.get('number-garden').onclick();env.elements.get('how-many').onclick();quantityTap(env);quantityTap(env);
 assert.equal(plays(env).filter(clip=>clip==='audio/garden-complete.wav').length,1);env.elements.get('back').onclick();env.elements.get('see-garden').onclick();assert.equal(plays(env).filter(clip=>clip==='audio/garden-complete.wav').length,1);assert.equal(env.run('state.garden.flowers'),5);assert.equal(env.run('state.garden.patchFlowers'),5);
});

test('buddy cards keep a pending choice until confirmation, then persist a safe home friend',()=>{
 const env=setup({silent:true});const before=env.run('JSON.stringify(state)'),writes=env.writes.length;
 env.elements.get('choose-buddy').onclick();assert.equal(env.run('mode'),'buddy');
 for(const name of ['Bunny','Turtle','Dinosaur'])assert.match(env.elements.get('app').innerHTML,new RegExp(name));
 assert.equal(env.run('pendingBuddy'),null);env.elements.get('confirm-buddy').onclick();assert.equal(env.run('JSON.stringify(state)'),before);
 env.run("selectBuddy('bunny')");assert.equal(env.run('pendingBuddy'),'bunny');assert.equal(env.run('JSON.stringify(state)'),before);assert.equal(env.writes.length,writes);
 assert.match(env.elements.get('app').innerHTML,/buddy-bunny[^>]*aria-pressed="true"/);
 env.elements.get('confirm-buddy').onclick();assert.equal(env.run('state.buddy'),'bunny');assert.equal(env.run('mode'),'home');
 assert.match(env.elements.get('app').innerHTML,/Bunny, your garden buddy/);
 const reloaded=setup({silent:true,rawSave:env.writes.at(-1).value});assert.equal(reloaded.run('state.buddy'),'bunny');assert.match(reloaded.elements.get('app').innerHTML,/Bunny, your garden buddy/);
 const committed=env.writes.length;env.run("selectBuddy('turtle');confirmBuddy()");assert.equal(env.run('state.buddy'),'bunny');assert.equal(env.writes.length,committed);
});

test('skipping, changing and backing out preserve completed rewards, settings and future data',()=>{
 const saved={...backup(),buddy:'turtle',decorations:['pot']};const env=setup({silent:true,rawSave:JSON.stringify(saved)});
 const initial=env.run('JSON.stringify(state)');
 env.run("chooseBuddy();selectBuddy('bunny')");env.elements.get('skip-buddy').onclick();assert.equal(env.run('JSON.stringify(state)'),initial);
 env.run("chooseBuddy();selectBuddy('dinosaur')");env.elements.get('buddy-back').onclick();assert.equal(env.run('JSON.stringify(state)'),initial);
 env.run("chooseBuddy();selectBuddy('dinosaur');confirmBuddy()");assert.equal(env.run('state.buddy'),'dinosaur');
 const result=JSON.parse(env.writes.at(-1).value);assert.deepEqual(result,{...saved,buddy:'dinosaur'});
 env.run("start('quantity')");assert.equal(env.run('mode'),'reward');assert.equal(env.run('state.garden.patchFlowers'),5);
 env.elements.get('plant-next').onclick();assert.equal(env.run('state.buddy'),'dinosaur');assert.equal(env.run('state.garden.flowers'),10);
 const fresh=setup({silent:true});const before=fresh.run('JSON.stringify(state)');fresh.run("chooseBuddy();selectBuddy('turtle')");fresh.elements.get('skip-buddy').onclick();assert.equal(fresh.run('JSON.stringify(state)'),before);
 fresh.run('chooseBuddy()');assert.equal(fresh.run('pendingBuddy'),null);
});

test('each buddy introduction starts from selection and respects silence, mute and audio fallback',async()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'audio/manifest.json'),'utf8'));
 const env=setup();env.run('chooseBuddy()');assert.equal(plays(env).length,0);
 for(const id of ['bunny','turtle','dinosaur']){env.run(`selectBuddy('${id}')`);assert.equal(plays(env).at(-1),`audio/buddy-${id}.wav`);assert.equal(env.run(`buddyFor('${id}').intro`),manifest[`buddy-${id}`]);}
 for(const options of [{silent:true},{muted:true}]){const quiet=setup(options);quiet.run("chooseBuddy();selectBuddy('turtle')");assert.equal(plays(quiet).length,0);assert.equal(quiet.spoken.length,0);assert.match(quiet.elements.get('app').innerHTML,/Hi, I’m Turtle/);}
 const fallback=setup({playError:Object.assign(new Error('decode'),{name:'NotSupportedError'})});fallback.run("chooseBuddy();selectBuddy('bunny');selectBuddy('dinosaur')");await new Promise(setImmediate);assert.deepEqual(fallback.spoken.map(x=>x.text),[manifest['buddy-dinosaur']]);
});

test('invalid stored buddies normalize safely and invalid imports cannot replace any progress',async()=>{
 for(const buddy of ['<img src=x onerror=alert(1)>','Bunny',null,{},['bunny'],2]){
  const saved={...backup(),buddy};const env=setup({silent:true,rawSave:JSON.stringify(saved)});
  assert.equal(env.run('state.buddy'),undefined);assert.equal(env.run('state.garden.flowers'),10);assert.doesNotMatch(env.elements.get('app').innerHTML,/onerror|\[object Object\]/);
  const before=env.run('JSON.stringify(state)'),writes=env.writes.length;
  await env.run(`reviewBackup({size:100,text:async()=>${JSON.stringify(JSON.stringify(saved))}})`);env.elements.get('confirm-import').onclick();assert.equal(env.run('JSON.stringify(state)'),before);assert.equal(env.writes.length,writes);assert.match(env.elements.get('backup-status').textContent,/unknown garden buddy/);
 }
 for(const buddy of ['bunny','turtle','dinosaur']){
  const saved={...backup(),buddy};const env=setup({silent:true});await env.run(`reviewBackup({size:100,text:async()=>${JSON.stringify(JSON.stringify(saved))}})`);assert.match(env.elements.get('backup-summary').textContent,new RegExp(`Buddy: ${buddy[0].toUpperCase()+buddy.slice(1)}`));env.elements.get('settings').close=()=>{};env.elements.get('confirm-import').onclick();assert.deepEqual(JSON.parse(env.run('JSON.stringify(state)')),saved);
 }
});

test('optional buddies wait in every activity without adding narration or forcing a selection',()=>{
 for(const buddy of [undefined,'bunny','turtle','dinosaur']){
  const env=setup();if(buddy)env.run(`state.buddy='${buddy}'`);
  for(const activity of ['find','match','explore','number','count','quantity']){
   const before=plays(env).length;env.run(`start('${activity}')`);
   const html=env.elements.get('app').innerHTML;
   assert.equal(html.includes('id="learning-buddy"'),!!buddy);
   if(buddy){assert.match(html,/learning-buddy waiting/);assert.match(html,new RegExp(`${buddy[0].toUpperCase()+buddy.slice(1)}: Learning together`));}
   assert.equal(plays(env).length-before,1);
  }
 }
});

test('letter and numeral buddies encourage retries and celebrate one earned flower',()=>{
 for(const activity of ['find','match','number','quantity']){
  const env=setup();env.run(`state.buddy='turtle';start('${activity}');var oldLetter=letterRoundId`);
  const before=plays(env).length;
  if(activity==='find'||activity==='match')env.run("answer({dataset:{letter:alphabet.find(x=>x[0]!==target[0])[0]},classList:{add(){},remove(){}}})");
  else if(activity==='number')numberTap(env,'target===1?2:1');else quantityTap(env,'target===1?2:1');
  assert.match(env.elements.get('learning-buddy').outerHTML,/encouraging/);
  assert.equal(env.run('state.garden.flowers'),0);assert.equal(env.run('answered'),false);assert.equal(plays(env).length-before,1);
  if(activity==='find'||activity==='match')win(env);else if(activity==='number')numberTap(env);else quantityTap(env);
  assert.match(env.elements.get('learning-buddy').outerHTML,/happy/);assert.equal(env.run('state.garden.flowers'),1);
  const after=plays(env).length;
  if(activity==='find'||activity==='match')win(env);else if(activity==='number')numberTap(env);else quantityTap(env);
  assert.equal(plays(env).length,after);assert.equal(env.run('state.garden.flowers'),1);
  env.elements.get('next').onclick();assert.match(env.elements.get('app').innerHTML,/learning-buddy waiting/);
 }
});

test('counting buddy supports taps and quantity help without adding sounds or reward credit',()=>{
 for(const activity of ['count','quantity']){
  const env=setup();env.run(`state.buddy='dinosaur';start('${activity}');target=3`);
  if(activity==='count')appleTap(env,0);else quantityApple(env,0);
  assert.match(env.elements.get('learning-buddy').outerHTML,/encouraging/);
  const before=plays(env).length;
  if(activity==='count')appleTap(env,0);else quantityApple(env,0);
  assert.equal(plays(env).length,before);assert.equal(env.run('state.garden.flowers'),0);
  if(activity==='quantity'){
   env.elements.get('count-help').onclick();assert.match(env.elements.get('learning-buddy').outerHTML,/encouraging/);
   assert.equal(env.run('state.garden.flowers'),0);quantityTap(env);
  }else {appleTap(env,1);appleTap(env,2);}
  assert.match(env.elements.get('learning-buddy').outerHTML,/happy/);assert.equal(env.run('state.garden.flowers'),1);
 }
});

test('picnic buddy reacts once per tap with no flowers and stale picnic or letter handlers are inert',()=>{
 const env=setup();env.run("state.buddy='bunny';var picnicButton={dataset:{letter:'A'},classList:{add(){}}};app.querySelectorAll=()=>[picnicButton];start('explore');var oldPicnic=picnicButton.onclick");
 const before=plays(env).length;env.run('oldPicnic()');assert.equal(plays(env).length,before+1);
 assert.match(env.elements.get('learning-buddy').outerHTML,/happy/);assert.equal(env.run('state.garden.flowers'),0);
 env.run("home();oldPicnic();start('find');var staleLetter=picnicButton.onclick;var staleNext=document.getElementById('next').onclick;var staleListen=document.getElementById('listen').onclick;home();staleLetter();staleNext();staleListen()");
 assert.equal(env.run('mode'),'home');assert.equal(env.run('state.garden.flowers'),0);
 env.run("start('find');staleLetter();staleNext();staleListen()");assert.equal(env.run('state.garden.flowers'),0);
});

test('buddy celebrations stay saved, muted and single-voiced, with reduced-motion styling',()=>{
 for(const options of [{},{muted:true},{silent:true}]){
  const env=setup({...options,savedState:{flowers:4,buddy:'bunny'}});env.run("start('find')");win(env);
  assert.match(env.elements.get('app').innerHTML,/learning-buddy happy/);assert.equal(env.run('state.buddy'),'bunny');
  const expected=options.muted||options.silent?0:1;assert.equal(plays(env).filter(x=>x==='audio/garden-complete.wav').length,expected);
  const before=plays(env).length;env.elements.get('rest').onclick();env.run('gardenComplete(false)');assert.equal(plays(env).length,before);
  const reload=setup({silent:true,rawSave:env.writes.at(-1).value});reload.run("start('number')");assert.match(reload.elements.get('app').innerHTML,/Bunny: A happy discovery together/);
 }
 const css=fs.readFileSync(path.join(root,'style.css'),'utf8');assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.learning-buddy \*\{animation:none!important/);
});
function visitorState(env){return JSON.parse(env.run('JSON.stringify(state.visitorRewards)'));}
function completeVisitorPatch(env){
 env.run("start('find')");
 for(let i=0;i<5;i++){win(env);if(i<4)env.elements.get('next').onclick();}
}
test('fifth flower durably earns one visitor receipt before any reveal, in every activity',()=>{
 for(const activity of ['find','match','number','count','quantity']){
  const env=setup({silent:true,savedState:{flowers:4,patchFlowers:4}});env.run(`start('${activity}')`);
  if(['find','match'].includes(activity))win(env);
  else if(activity==='number')env.run('answerNumber({dataset:{number:String(target)},classList:{add(){},remove(){}}})');
  else if(activity==='quantity')env.run('answerQuantity({dataset:{number:String(target)},classList:{add(){},remove(){}}})');
  else {env.run('for(let i=0;i<target;i++)countObject({dataset:{object:String(i)},classList:{add(){}},setAttribute(){},querySelector(){return {textContent: ""}}})');}
  const reward=visitorState(env);assert.deepEqual(reward,{nextId:2,patchEarned:true,pending:[1],opened:[]});
  assert.deepEqual(JSON.parse(env.writes.at(-1).value).visitorRewards,reward);
  const interrupted=setup({silent:true,rawSave:env.writes.at(-1).value});
  interrupted.elements.get('reveal-visitor').onclick();assert.equal(visitorState(interrupted).opened.length,1);assert.equal(interrupted.run('state.garden.flowers'),5);
  env.run('gardenComplete(false);gardenComplete(false)');assert.deepEqual(visitorState(env),reward);
  assert.match(env.elements.get('app').innerHTML,/visitor-surprise.*reveal-visitor/);
 }
});
test('unopened receipts survive rest, subjects, replant, fresh garden and reload',()=>{
 const env=setup({silent:true,savedState:{flowers:5}});env.run("start('find')");
 env.elements.get('rest').onclick();assert.match(env.elements.get('app').innerHTML,/1 unopened/);
 env.elements.get('number-garden').onclick();env.elements.get('see-garden').onclick();env.elements.get('plant-next').onclick();
 assert.deepEqual(visitorState(env).pending,[1]);assert.equal(visitorState(env).patchEarned,false);
 env.run('home()');const reload=setup({silent:true,rawSave:env.writes.at(-1).value});
 assert.match(reload.elements.get('app').innerHTML,/1 unopened/);
 reload.elements.get('settings').close=()=>{};reload.elements.get('reset').onclick();assert.deepEqual(visitorState(reload).pending,[1]);
 completeVisitorPatch(reload);assert.deepEqual(visitorState(reload).pending,[1,2]);
 reload.elements.get('reveal-visitor').onclick();assert.equal(visitorState(reload).opened.length,1);assert.deepEqual(visitorState(reload).pending,[2]);
});
test('reveal taps and old reveal or replant callbacks cannot duplicate or consume a later receipt',()=>{
 const env=setup({silent:true,savedState:{flowers:5}});env.run("start('find')");
 const reveal=env.elements.get('reveal-visitor').onclick, replant=env.elements.get('plant-next').onclick;
 reveal();const claimed=visitorState(env);reveal();assert.deepEqual(visitorState(env),claimed);
 assert.match(env.elements.get('app').innerHTML,/Hello, (Butterfly|Ladybug|Bee|Snail|Bird)!/);
 assert.match(env.elements.get('app').innerHTML,/visitor-picture.*role="img"/);
 env.elements.get('visitor-garden').onclick();env.elements.get('plant-next').onclick();
 completeVisitorPatch(env);const next=visitorState(env);reveal();replant();assert.deepEqual(visitorState(env),next);assert.equal(env.run('state.garden.patchFlowers'),5);
 const reload=setup({silent:true,rawSave:env.writes.at(-1).value});assert.deepEqual(visitorState(reload),next);
 reload.elements.get('reveal-visitor').onclick();assert.equal(visitorState(reload).opened.length,2);
});
test('five unopened patches reveal all five visitors before familiar friends return',()=>{
 const env=setup({silent:true});
 for(let i=0;i<6;i++){completeVisitorPatch(env);if(i<5)env.elements.get('plant-next').onclick();}
 assert.equal(visitorState(env).pending.length,6);
 for(let i=0;i<6;i++){
  env.elements.get('reveal-visitor').onclick();
  const rewards=visitorState(env);assert.equal(rewards.opened.length,i+1);assert.equal(rewards.pending.length,5-i);
  assert.equal(new Set(rewards.opened.map(item=>item.visitor)).size,Math.min(i+1,5));
 }
 const before=visitorState(env);env.run('home();gardenComplete(false)');assert.deepEqual(visitorState(env),before);
});
test('old completed saves migrate exactly once while historic flowers earn no retroactive receipts',()=>{
 for(const saved of [{flowers:20,patchFlowers:5},{...backup(),visitorRewards:undefined}]){
  const env=setup({silent:true,rawSave:JSON.stringify(saved)});assert.deepEqual(visitorState(env),{nextId:2,patchEarned:true,pending:[1],opened:[]});
  env.elements.get('reveal-visitor').onclick();const after=visitorState(env);
  const reload=setup({silent:true,rawSave:env.writes.at(-1).value});reload.run("start('find');home();start('match')");assert.deepEqual(visitorState(reload),after);
 }
 const oldBackup=backup();delete oldBackup.visitorRewards;
 const imported=setup({silent:true});assert.deepEqual(JSON.parse(imported.run(`JSON.stringify(validateBackup(${JSON.stringify(JSON.stringify(oldBackup))}).visitorRewards)`)),{nextId:2,patchEarned:true,pending:[1],opened:[]});
 const env=setup({silent:true,savedState:{flowers:22,patchFlowers:2}});assert.equal(env.run('state.visitorRewards'),undefined);
});
test('failed storage never reveals an unsaved visitor and claim write failure rolls back to unopened',()=>{
 const failed=setup({silent:true,writeError:true,savedState:{flowers:5}});failed.elements.get('reveal-visitor').onclick();
 assert.equal(failed.run('mode'),'home');assert.deepEqual(visitorState(failed).pending,[1]);assert.equal(visitorState(failed).opened.length,0);
 const env=setup({silent:true,savedState:{flowers:5}});
 env.run("let visitorWrites=0;localStorage.setItem=()=>{if(++visitorWrites===2)throw new Error('quota')}");
 env.elements.get('reveal-visitor').onclick();assert.equal(env.run('mode'),'home');assert.deepEqual(visitorState(env).pending,[1]);assert.equal(visitorState(env).opened.length,0);
 env.run('localStorage.setItem=()=>{}');env.elements.get('reveal-visitor').onclick();assert.equal(visitorState(env).opened.length,1);
 const unsupported=setup({silent:true,rawSave:JSON.stringify({...backup(),version:99})});unsupported.elements.get('reveal-visitor').onclick();assert.equal(visitorState(unsupported).opened.length,0);assert.equal(unsupported.writes.length,0);
});
test('visitor backups retain unopened and collected receipts and reject inconsistent data atomically',async()=>{
 const env=setup({silent:true});completeVisitorPatch(env);env.elements.get('reveal-visitor').onclick();env.elements.get('visitor-garden').onclick();env.elements.get('plant-next').onclick();completeVisitorPatch(env);
 const saved=JSON.parse(env.writes.at(-1).value), text=await env.run('backupFile().text()');assert.deepEqual(JSON.parse(text),saved);
 const restored=setup({silent:true});await restored.run(`reviewBackup({size:100,text:async()=>${JSON.stringify(text)}})`);
 assert.match(restored.elements.get('backup-summary').textContent,/Unopened visitors: 1. Discovered visitors: 1/);
 restored.elements.get('settings').close=()=>{};restored.elements.get('confirm-import').onclick();assert.deepEqual(visitorState(restored),saved.visitorRewards);
 for(const bad of [null,{}, {nextId:3,patchEarned:true,pending:[1,1],opened:[]}, {nextId:3,patchEarned:true,pending:[1],opened:[{id:1,visitor:'bee'}]}, {nextId:2,patchEarned:true,pending:[],opened:[{id:1,visitor:'dragon'}]}, {nextId:3,patchEarned:true,pending:[1],opened:[]}, {nextId:2,patchEarned:false,pending:[1],opened:[]}, {nextId:2,patchEarned:true,pending:[-1],opened:[]}]){
  const before=restored.run('JSON.stringify(state)'),writes=restored.writes.length;
  await restored.run(`reviewBackup({size:100,text:async()=>${JSON.stringify(JSON.stringify({...saved,visitorRewards:bad}))}})`);
  restored.elements.get('confirm-import').onclick();assert.equal(restored.run('JSON.stringify(state)'),before);assert.equal(restored.writes.length,writes);assert.match(restored.elements.get('backup-status').textContent,/invalid visitor rewards/);
 }
});
test('malformed local visitor data is preserved without granting or rendering untrusted rewards',()=>{
 for(const rewards of [null,{}, {nextId:2,patchEarned:true,pending:[],opened:[{id:1,visitor:'<script>'}]}]){
  const saved={...backup(),visitorRewards:rewards};const env=setup({silent:true,rawSave:JSON.stringify(saved)});
  assert.deepEqual(JSON.parse(env.writes.at(-1).value).visitorRewards,rewards);
  assert.match(env.elements.get('app').innerHTML,/Visitor rewards could not be read/);
  env.run("start('find');home()");assert.deepEqual(visitorState(env),rewards);
  assert.throws(()=>env.run('backupFile()'),/invalid visitor rewards/);
 }
});
test('visitor narration starts only from reveal and respects mute, silent preview and fallback',async()=>{
 for(const options of [{silent:true},{muted:true},{}]){
  const env=setup({...options,savedState:{flowers:5}});assert.equal(plays(env).length,0);env.elements.get('reveal-visitor').onclick();
  assert.equal(plays(env).length,options.silent||options.muted?0:1);
  if(!options.silent&&!options.muted)assert.match(plays(env)[0],/^audio\/visitor-(butterfly|ladybug|bee|snail|bird)\.wav$/);
 }
 const env=setup({savedState:{flowers:5},playError:Object.assign(new Error('decode'),{name:'NotSupportedError'})});env.elements.get('reveal-visitor').onclick();await new Promise(setImmediate);assert.match(env.spoken[0].text,/^Hello, (Butterfly|Ladybug|Bee|Snail|Bird)!$/);
});

function collectionSave(){return {...backup(),garden:{flowers:10,patchFlowers:5},visitorRewards:{nextId:3,patchEarned:true,pending:[2],opened:[{id:1,visitor:'bee'}]}};}
test('visitor collection is reachable without a buddy and unknown silhouettes do not disclose names',()=>{
 const env=setup({silent:true});env.run('myGarden()');env.elements.get('visitor-collection').onclick();
 assert.equal(env.run('mode'),'collection');const html=env.elements.get('app').innerHTML;
 assert.equal((html.match(/class="visitor-card unknown"/g)||[]).length,5);
 assert.equal((html.match(/class="collection-picture visitor-silhouette"/g)||[]).length,5);
 assert.doesNotMatch(html,/Butterfly|Ladybug|Bee|Snail|Bird|collection-(butterfly|ladybug|bee|snail|bird)/);
 assert.equal(env.run('state.buddy'),undefined);assert.equal(plays(env).length,0);
 env.elements.get('collection-rest').onclick();assert.equal(env.run('mode'),'home');
});
test('collection greets discovered visitors with a small reaction and no save or reward changes',()=>{
 const saved=collectionSave();saved.preferences.sound=true;
 const env=setup({rawSave:JSON.stringify(saved)});env.run('myGarden()');env.elements.get('visitor-collection').onclick();
 const before=env.run('JSON.stringify(state)'),writes=env.writes.length,html=env.elements.get('app').innerHTML;
 assert.match(html,/collection-bee/);assert.equal((html.match(/class="visitor-card unknown"/g)||[]).length,4);
 let waves=0;env.elements.get('collection-bee').classList.add=name=>{if(name==='visitor-wave')waves++;};
 const greet=env.elements.get('collection-bee').onclick;greet();greet();
 assert.equal(waves,2);assert.deepEqual(plays(env),['audio/visitor-bee.wav','audio/visitor-bee.wav']);
 assert.match(env.elements.get('visitor-greeting').textContent,/Hello, Bee!/);
 assert.equal(env.run('JSON.stringify(state)'),before);assert.equal(env.writes.length,writes);
 env.elements.get('collection-home').onclick();env.elements.get('visitor-collection').onclick();greet();
 assert.equal(plays(env).length,2);env.run('numberGarden()');env.elements.get('collection-bee').onclick();assert.equal(plays(env).length,2);
});
test('collection greetings respect mute and silent preview',()=>{
 for(const options of [{muted:true},{silent:true}]){
  const saved=collectionSave();saved.preferences.sound=!options.muted;
  const env=setup({...options,rawSave:JSON.stringify(saved)});env.run('visitorCollection()');env.elements.get('collection-bee').onclick();
  assert.equal(plays(env).length,0);assert.equal(env.spoken.length,0);assert.match(env.elements.get('visitor-greeting').textContent,/Bee/);
 }
});
test('collection opens saved pending receipts once and returns to updated collection',()=>{
 const env=setup({silent:true,rawSave:JSON.stringify(collectionSave())});env.run('visitorCollection()');
 const stale=env.elements.get('reveal-visitor').onclick;
 env.elements.get('collection-home').onclick();env.run('visitorCollection()');stale();assert.deepEqual(visitorState(env).pending,[2]);
 const reveal=env.elements.get('reveal-visitor').onclick;reveal();const claimed=visitorState(env);reveal();
 assert.equal(env.run('mode'),'visitor');assert.deepEqual(visitorState(env),claimed);assert.equal(claimed.opened.length,2);assert.deepEqual(claimed.pending,[]);
 env.elements.get('visitor-collection').onclick();assert.equal(env.run('mode'),'collection');
 assert.equal((env.elements.get('app').innerHTML.match(/class="visitor-card unknown"/g)||[]).length,3);
 assert.equal(env.run('state.garden.flowers'),10);
 const reload=setup({silent:true,rawSave:env.writes.at(-1).value});reload.run('visitorCollection()');assert.deepEqual(visitorState(reload),claimed);
});
test('collection survives subjects rest and reload while pending receipts remain available',()=>{
 const saved=collectionSave(),env=setup({silent:true,rawSave:JSON.stringify(saved)});
 env.run("visitorCollection();home();letterGarden();start('explore');home();numberGarden();home();visitorCollection()");
 assert.deepEqual(visitorState(env),saved.visitorRewards);env.elements.get('collection-rest').onclick();
 const reload=setup({silent:true,rawSave:env.writes.at(-1).value});reload.elements.get('my-garden').onclick();reload.elements.get('visitor-collection').onclick();
 assert.deepEqual(visitorState(reload),saved.visitorRewards);assert.match(reload.elements.get('app').innerHTML,/collection-bee/);assert.match(reload.elements.get('app').innerHTML,/1 unopened/);
});

function decorationState(env){return JSON.parse(env.run('JSON.stringify(state.decorationRewards)'));}
function decorationOptions(env){return decorationState(env).pending[0].options;}
function claimDecoration(env,key){env.elements.get('keep-'+key).onclick();}
test('every learning activity earns independent visitor and decoration receipts on the same fifth flower',()=>{
 for(const activity of ['find','match','number','count','quantity']){
  const env=setup({silent:true,savedState:{flowers:4}});env.run(`start('${activity}')`);
  if(['find','match'].includes(activity))win(env);
  else if(activity==='number')env.run('answerNumber({dataset:{number:String(target)},classList:{add(){},remove(){}}})');
  else if(activity==='quantity')env.run('answerQuantity({dataset:{number:String(target)},classList:{add(){},remove(){}}})');
  else env.run('for(let i=0;i<target;i++)countObject({dataset:{object:String(i)},classList:{add(){}},setAttribute(){},querySelector(){return {textContent:""}}})');
  assert.deepEqual(decorationState(env),{nextId:2,patchEarned:true,pending:[{id:1}],claimed:[]});
  assert.equal(visitorState(env).pending.length,1);
  const reload=setup({silent:true,rawSave:env.writes.at(-1).value});reload.run('chooseDecoration()');
  assert.equal(decorationState(reload).pending.length,1);assert.equal(reload.run('state.garden.flowers'),5);
 }
});
test('decoration choices save before presentation, remain fixed through rest reload and visitor reveal, and claim once',()=>{
 const env=setup({silent:true,savedState:{flowers:5}});env.run('chooseDecoration()');
 const options=decorationOptions(env),stale=env.elements.get('keep-'+options[0]).onclick;
 assert.equal(new Set(options).size,2);assert.deepEqual(JSON.parse(env.writes.at(-1).value).decorationRewards.pending[0].options,options);
 env.elements.get('decoration-later').onclick();stale();assert.equal(decorationState(env).claimed.length,0);
 env.elements.get('reveal-visitor').onclick();env.run('home();chooseDecoration()');assert.deepEqual(decorationOptions(env),options);
 const reload=setup({silent:true,rawSave:env.writes.at(-1).value});reload.run('chooseDecoration()');assert.deepEqual(decorationOptions(reload),options);
 const claim=reload.elements.get('keep-'+options[0]).onclick;claim();claim();assert.equal(decorationState(reload).claimed.length,1);assert.equal(decorationState(reload).pending.length,0);
 assert.equal(visitorState(reload).opened.length,1);assert.match(reload.elements.get('app').innerHTML,/is yours/);
 assert.equal(JSON.parse(reload.writes.at(-1).value).decorationRewards.claimed.length,1);
});
test('decoration offers favor all six unowned items then allow friendly repeats, with pending rewards across patches',()=>{
 const env=setup({silent:true});const owned=new Set();
 for(let i=0;i<8;i++){
  completeVisitorPatch(env);env.run('chooseDecoration()');const options=decorationOptions(env);
  if(owned.size<5)assert.ok(options.every(key=>!owned.has(key)));
  if(owned.size===5)assert.ok(options.some(key=>!owned.has(key)));
  const key=options.find(key=>!owned.has(key))||options[0];claimDecoration(env,key);owned.add(key);
  env.run('gardenComplete(false)');env.elements.get('plant-next').onclick();env.run('home()');
 }
 assert.equal(owned.size,6);assert.equal(decorationState(env).claimed.length,8);assert.equal(visitorState(env).pending.length,8);
 completeVisitorPatch(env);env.run('gardenComplete(false)');env.elements.get('plant-next').onclick();env.run('home()');completeVisitorPatch(env);
 assert.equal(decorationState(env).pending.length,2);assert.equal(visitorState(env).pending.length,10);
});
test('completed legacy and visitor-era saves gain only one current decoration receipt regardless of visitor history',()=>{
 for(const saved of [{flowers:20,patchFlowers:5},{...backup(),decorationRewards:undefined,visitorRewards:{nextId:4,patchEarned:true,pending:[1,2],opened:[{id:3,visitor:'bee'}]}}]){
  const env=setup({silent:true,rawSave:JSON.stringify(saved)});assert.equal(decorationState(env).pending.length,1);
  const reload=setup({silent:true,rawSave:env.writes.at(-1).value});assert.deepEqual(decorationState(reload),decorationState(env));
  env.run('chooseDecoration()');claimDecoration(env,decorationOptions(env)[0]);env.run('home();gardenComplete(false)');assert.equal(decorationState(env).pending.length,0);
 }
 const env=setup({silent:true,savedState:{flowers:22,patchFlowers:2}});assert.equal(env.run('state.decorationRewards'),undefined);
 const saved=backup();delete saved.decorationRewards;assert.equal(JSON.parse(setup({silent:true}).run(`JSON.stringify(validateBackup(${JSON.stringify(JSON.stringify(saved))}))`)).decorationRewards.pending.length,1);
});
test('decoration option and claim storage failures preserve pending reward and never display an unsaved claim',()=>{
 const blocked=setup({silent:true,savedState:{flowers:5},writeError:true});blocked.run('chooseDecoration()');assert.equal(blocked.run('mode'),'home');assert.equal(decorationState(blocked).claimed.length,0);
 const env=setup({silent:true,savedState:{flowers:5}});env.run('chooseDecoration()');const key=decorationOptions(env)[0];
 env.run("localStorage.setItem=()=>{throw new Error('quota')}");claimDecoration(env,key);assert.equal(decorationState(env).pending.length,1);assert.equal(decorationState(env).claimed.length,0);assert.equal(env.run('mode'),'decoration');
 assert.doesNotMatch(env.elements.get('app').innerHTML,/is yours/);
 const reload=setup({silent:true,rawSave:env.writes.at(-1).value});reload.run('chooseDecoration()');assert.deepEqual(decorationOptions(reload),decorationOptions(env));claimDecoration(reload,key);assert.equal(decorationState(reload).claimed.length,1);
});
test('decoration backups validate receipts and options and preserve unrelated future data',()=>{
 const env=setup({silent:true,savedState:{flowers:5}});env.run('chooseDecoration()');const saved=JSON.parse(env.run('JSON.stringify(state)'));
 const restored=setup({silent:true,rawSave:JSON.stringify(saved)});assert.deepEqual(decorationState(restored),saved.decorationRewards);
 for(const bad of [null,{}, {...saved.decorationRewards,pending:[{id:1,options:['mushroom','mushroom']}]},{...saved.decorationRewards,pending:[{id:1,options:['<script>','pond']}]},{...saved.decorationRewards,claimed:[{id:1,decoration:'pond'}]}, {...saved.decorationRewards,patchEarned:false}]){
  assert.throws(()=>env.run(`validateBackup(${JSON.stringify(JSON.stringify({...saved,decorationRewards:bad}))})`),/invalid decoration rewards/);
  const local=setup({silent:true,rawSave:JSON.stringify({...saved,decorationRewards:bad})});assert.match(local.elements.get('app').innerHTML,/Decoration rewards could not be read/);assert.deepEqual(JSON.parse(local.writes.at(-1).value).decorationRewards,bad);
 }
});
test('decoration spoken labels start only on taps and respect mute and silent preview',()=>{
 for(const options of [{},{silent:true},{muted:true}]){
  const env=setup({...options,savedState:{flowers:5,sound:!options.muted}});env.run('chooseDecoration()');assert.equal(plays(env).length,0);
  const key=decorationOptions(env)[0];env.elements.get('hear-'+key).onclick();assert.equal(plays(env).length,options.silent||options.muted?0:1);
  if(!options.silent&&!options.muted)assert.equal(plays(env)[0],'audio/decoration-'+key+'.wav');
 }
});

function placementSave(){
 const saved=backup();saved.garden={flowers:0,patchFlowers:0};delete saved.visitorRewards;
 saved.decorationRewards={nextId:8,patchEarned:false,pending:[],claimed:['mushroom','pond','birdhouse','stepping-stones','rainbow','sunflower','mushroom'].map((decoration,i)=>({id:i+1,decoration}))};return saved;
}
const gardenClick=(env,id)=>env.elements.get(id).onclick();
test('tap garden places all six unique types, persists and reloads without earning rewards',()=>{
 const saved=placementSave(),env=setup({silent:true,rawSave:JSON.stringify(saved)});env.run('decorateGarden()');
 const rewards=env.run('JSON.stringify(state.decorationRewards)');
 ['mushroom','pond','birdhouse','stepping-stones','rainbow','sunflower'].forEach((key,i)=>{gardenClick(env,'garden-item-'+key);gardenClick(env,'garden-spot-'+i);});
 assert.deepEqual(JSON.parse(env.run('JSON.stringify(state.gardenPlacements.spots)')),['mushroom','pond','birdhouse','stepping-stones','rainbow','sunflower']);
 assert.equal(env.run('JSON.stringify(state.decorationRewards)'),rewards);assert.equal(env.run('state.garden.flowers'),0);
 const html=env.elements.get('app').innerHTML;assert.equal((html.match(/id="garden-item-mushroom"/g)||[]).length,1);
 const reload=setup({silent:true,rawSave:env.writes.at(-1).value});reload.run('decorateGarden()');assert.equal(reload.run('state.gardenPlacements.spots[5]'),'sunflower');
 assert.equal(plays(env).length,0);
});
test('tap placement moves, swaps and returns safely including an occupied destination from inventory',()=>{
 const env=setup({silent:true,rawSave:JSON.stringify(placementSave())});env.run('decorateGarden()');
 const put=(key,i)=>{gardenClick(env,'garden-item-'+key);gardenClick(env,'garden-spot-'+i);};
 put('mushroom',0);gardenClick(env,'garden-spot-0');gardenClick(env,'garden-spot-2');assert.equal(env.run('state.gardenPlacements.spots[0]'),null);
 put('pond',0);put('mushroom',0);assert.equal(env.run('state.gardenPlacements.spots[2]'),'pond');
 put('birdhouse',0);assert.equal(env.run('state.gardenPlacements.spots.includes("mushroom")'),false);
 gardenClick(env,'garden-spot-0');gardenClick(env,'garden-return');assert.equal(env.run('state.gardenPlacements.spots[0]'),null);
 assert.equal(env.run('state.decorationRewards.claimed.length'),7);
});
test('empty garden is welcoming and navigation and stale handlers cannot mutate progress',()=>{
 const env=setup({silent:true});gardenClick(env,'my-garden');gardenClick(env,'decorate-garden');assert.match(env.elements.get('app').innerHTML,/six spots will be waiting/);
 assert.equal((env.elements.get('app').innerHTML.match(/id="garden-spot-/g)||[]).length,6);
 const full=setup({silent:true,rawSave:JSON.stringify(placementSave())});full.run('decorateGarden()');gardenClick(full,'garden-item-mushroom');
 const stale=full.elements.get('garden-spot-0').onclick;full.run('decorateGarden()');stale();assert.equal(full.run('state.gardenPlacements'),undefined);
 gardenClick(full,'garden-item-pond');const oldReturn=full.elements.get('garden-return').onclick;full.run('home()');oldReturn();assert.equal(full.run('mode'),'home');
});
test('placements backup rejects invalid, unknown, unowned, duplicate and unsupported layouts',()=>{
 const env=setup({silent:true});
 const valid=placementSave();valid.gardenPlacements={version:1,spots:['pond',null,null,null,null,null]};
 assert.equal(env.run(`validateBackup(${JSON.stringify(JSON.stringify(valid))}).gardenPlacements.spots[0]`),'pond');
 for(const layout of [null,{version:2,spots:Array(6).fill(null)},{version:1,spots:['pond']},{version:1,spots:['pond','pond',null,null,null,null]},{version:1,spots:['<img>',null,null,null,null,null]}]){
  const saved={...valid,gardenPlacements:layout};assert.throws(()=>env.run(`validateBackup(${JSON.stringify(JSON.stringify(saved))})`),/placements/);
 }
 const unowned={...valid,decorationRewards:{nextId:1,patchEarned:false,pending:[],claimed:[]}};assert.throws(()=>env.run(`validateBackup(${JSON.stringify(JSON.stringify(unowned))})`),/placements/);
});
test('malformed local placement is preserved and blocked; failed placement save rolls back',()=>{
 const saved=placementSave();saved.gardenPlacements={version:1,spots:['pond','pond',null,null,null,null]};
 const env=setup({silent:true,rawSave:JSON.stringify(saved)});env.run('decorateGarden()');assert.match(env.elements.get('placement-message').textContent,/could not be read/);
 const before=env.run('JSON.stringify(state)');gardenClick(env,'garden-spot-0');assert.equal(env.run('JSON.stringify(state)'),before);
 const failed=setup({silent:true,writeError:true,rawSave:JSON.stringify(placementSave())});failed.run('decorateGarden()');gardenClick(failed,'garden-item-pond');gardenClick(failed,'garden-spot-0');assert.equal(failed.run('state.gardenPlacements'),undefined);assert.match(failed.elements.get('placement-message').textContent,/still safe/);
});


test('My Garden welcomes an empty save and connects both subjects without changing progress',()=>{
 const env=setup({silent:true}),before=env.run('JSON.stringify(state)'),writes=env.writes.length;
 const home=env.elements.get('app').innerHTML;assert.match(home,/id="my-garden"/);assert.match(home,/id="choose-buddy"/);assert.doesNotMatch(home,/id="decorate-garden"|id="visitor-collection"/);
 gardenClick(env,'my-garden');const html=env.elements.get('app').innerHTML;
 assert.match(html,/Welcome to your little garden/);assert.equal((html.match(/Room to grow<\/small>/g)||[]).length,6);
 assert.match(html,/id="decorate-garden"/);assert.match(html,/id="visitor-collection"/);
 gardenClick(env,'hub-letters');assert.equal(env.run('mode'),'letters');env.run('myGarden()');gardenClick(env,'hub-numbers');assert.equal(env.run('mode'),'numbers');
 assert.equal(env.run('JSON.stringify(state)'),before);assert.equal(env.writes.length,writes);assert.equal(plays(env).length,0);
});

test('My Garden shows saved placement and visitors, returns from collections and ignores stale navigation',()=>{
 const saved=placementSave();saved.visitorRewards={nextId:2,patchEarned:false,pending:[],opened:[{id:1,visitor:'bee'}]};saved.gardenPlacements={version:1,spots:['pond',null,null,null,null,null]};
 const env=setup({silent:true,rawSave:JSON.stringify(saved)}),before=env.run('JSON.stringify(state)'),writes=env.writes.length;
 gardenClick(env,'my-garden');const html=env.elements.get('app').innerHTML;
 assert.match(html,/Spot 1: Pond/);assert.match(html,/1 friends discovered/);assert.match(html,/6 decorations/);
 const stale=env.elements.get('hub-numbers').onclick;gardenClick(env,'decorate-garden');gardenClick(env,'decorate-home');assert.equal(env.run('mode'),'my-garden');
 stale();assert.equal(env.run('mode'),'my-garden');gardenClick(env,'visitor-collection');gardenClick(env,'collection-home');assert.equal(env.run('mode'),'my-garden');
 assert.equal(env.run('JSON.stringify(state)'),before);assert.equal(env.writes.length,writes);
 gardenClick(env,'decorate-garden');gardenClick(env,'garden-item-pond');gardenClick(env,'garden-spot-2');gardenClick(env,'decorate-home');assert.match(env.elements.get('app').innerHTML,/Spot 3: Pond/);
 const reload=setup({silent:true,rawSave:env.writes.at(-1).value});gardenClick(reload,'my-garden');assert.match(reload.elements.get('app').innerHTML,/Spot 3: Pond/);assert.equal(reload.run('state.garden.flowers'),0);
 assert.deepEqual(decorationState(reload),saved.decorationRewards);
});

test('My Garden keeps pending gifts visible and opens existing reward flows exactly once',()=>{
 const env=setup({silent:true,savedState:{flowers:5}}),before=env.run('JSON.stringify(state)'),writes=env.writes.length;
 gardenClick(env,'my-garden');const html=env.elements.get('app').innerHTML;
 for(const id of ['reveal-visitor','choose-decoration','decorate-garden','visitor-collection'])assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1);
 assert.equal(env.run('JSON.stringify(state)'),before);assert.equal(env.writes.length,writes);
 const stale=env.elements.get('reveal-visitor').onclick;env.run('myGarden()');stale();assert.equal(visitorState(env).pending.length,1);
 gardenClick(env,'reveal-visitor');assert.equal(visitorState(env).opened.length,1);gardenClick(env,'visitor-collection');gardenClick(env,'collection-home');gardenClick(env,'choose-decoration');assert.equal(env.run('mode'),'decoration');
 assert.equal(env.run('state.garden.flowers'),5);assert.equal(decorationState(env).pending.length,1);
});

function missionWin(env,activity){
 if(['find','match'].includes(activity))win(env);
 else if(activity==='number')numberTap(env);
 else if(activity==='quantity')quantityTap(env);
 else env.run('for(let i=0;i<target;i++)countObject({dataset:{object:String(i)},classList:{add(){}},setAttribute(){},querySelector(){return {textContent:""}}})');
}
test('little mission is optional and three guarded successes save three markers with normal flowers',()=>{
 for(const activity of ['find','match','number','count','quantity']){
  const env=setup({silent:true});env.run(`startMission('${activity}')`);
  assert.match(env.elements.get('app').innerHTML,/Discovery 3: waiting/);
  for(let i=1;i<=3;i++){
   missionWin(env,activity);missionWin(env,activity);
   assert.equal(env.run('state.mission.progress'),i);assert.equal(env.run('state.garden.flowers'),i);
   const saved=JSON.parse(env.writes.at(-1).value);assert.equal(saved.mission.progress,saved.garden.flowers);
   if(i<3)env.elements.get('next').onclick();
  }
  assert.equal(env.run('state.mission.complete'),true);
  env.elements.get('next').onclick();missionWin(env,activity);
  assert.equal(env.run('state.mission.progress'),3);assert.equal(env.run('state.garden.flowers'),4);
 }
});
test('mission retries, counting help, free exploration and stale cross-activity answers add no progress',()=>{
 const env=setup({silent:true});env.run("state.buddy='turtle';startMission('find');var oldMissionAnswer=()=>answer({dataset:{letter:target[0]},classList:{add(){},remove(){}}},letterRoundId)");
 env.run("answer({dataset:{letter:'Z'},classList:{add(){},remove(){}}})");assert.equal(env.run('state.mission.progress'),0);
 env.run("missionMenu();startMission('quantity');oldMissionAnswer();quantityHelp()");assert.equal(env.run('state.mission.progress'),0);
 quantityTap(env);quantityTap(env);assert.equal(env.run('state.mission.progress'),1);
 env.run("home();start('explore')");assert.equal(env.run('state.mission.progress'),1);
 env.run("start('number')");numberTap(env);assert.equal(env.run('state.mission.progress'),1);assert.equal(env.run('state.garden.flowers'),2);
 env.run("missionMenu();startMission('count')");missionWin(env,'count');assert.equal(env.run('state.mission.progress'),2);
 assert.equal(env.run('state.mission.buddy'),'turtle');
});
test('mission crossing garden completion reloads and resumes the saved activity with both rewards once',()=>{
 const env=setup({silent:true,savedState:{flowers:4}});env.run("state.buddy='bunny';startMission('number')");numberTap(env);
 assert.equal(env.run('mode'),'reward');assert.equal(env.run('state.mission.progress'),1);
 assert.equal(visitorState(env).pending.length,1);assert.equal(decorationState(env).pending.length,1);
 const reload=setup({silent:true,rawSave:env.writes.at(-1).value});reload.run('missionMenu()');reload.elements.get('resume-mission').onclick();
 assert.equal(reload.run('mode'),'reward');reload.elements.get('plant-next').onclick();assert.equal(reload.run('mode'),'number');
 numberTap(reload);reload.elements.get('next').onclick();numberTap(reload);
 assert.equal(reload.run('state.mission.complete'),true);assert.equal(reload.run('state.garden.flowers'),7);
 assert.equal(visitorState(reload).pending.length,1);assert.equal(decorationState(reload).pending.length,1);
 const done=setup({silent:true,rawSave:reload.writes.at(-1).value});assert.match(done.elements.get('app').innerHTML,/little mission complete/);assert.equal(done.run('state.garden.flowers'),7);
});
test('mission and garden can finish together without extra flowers or repeated rewards',()=>{
 const env=setup({silent:true,savedState:{flowers:2}});env.run("startMission('match')");
 for(let i=0;i<3;i++){win(env);if(i<2)env.elements.get('next').onclick();}
 assert.equal(env.run('mode'),'reward');assert.equal(env.run('state.mission.complete'),true);assert.equal(env.run('state.garden.flowers'),5);
 assert.equal(visitorState(env).pending.length,1);env.elements.get('plant-next').onclick();win(env);
 assert.equal(env.run('state.mission.progress'),3);assert.equal(env.run('state.garden.flowers'),6);
});
test('grown-ups can abandon a mission retaining flowers and failed starts or abandonment roll back',()=>{
 const env=setup({silent:true});env.run("startMission('find')");win(env);env.elements.get('settings').close=()=>{};env.elements.get('abandon-mission').onclick();
 assert.equal(env.run('state.mission'),undefined);assert.equal(env.run('state.garden.flowers'),1);
 const saved=JSON.parse(env.writes.at(-1).value);assert.equal(saved.mission,undefined);assert.equal(saved.garden.flowers,1);
 const blocked=setup({silent:true,writeError:true,rawSave:JSON.stringify({...saved,mission:{kind:'discoveries',progress:1,complete:false,activity:'find',buddy:null}})});const before=blocked.run('JSON.stringify(state)');blocked.elements.get('abandon-mission').onclick();assert.equal(blocked.run('JSON.stringify(state)'),before);
 const failed=setup({silent:true,writeError:true});failed.run("startMission('find')");assert.equal(failed.run('state.mission'),undefined);assert.equal(failed.run('mode'),'home');
});
test('mission backup validation rejects malformed progress, completion, activity and buddy while keeping current data',async()=>{
 const env=setup({silent:true});env.run("startMission('find')");win(env);const saved=JSON.parse(env.writes.at(-1).value);
 assert.equal(env.run(`validateBackup(${JSON.stringify(JSON.stringify(saved))}).mission.progress`),1);
 for(const mission of [null,{}, {...saved.mission,progress:4},{...saved.mission,progress:1.5},{...saved.mission,complete:true},{...saved.mission,activity:'explore'},{...saved.mission,buddy:'bad'}]){
  const bad={...saved,mission};assert.throws(()=>env.run(`validateBackup(${JSON.stringify(JSON.stringify(bad))})`),/invalid little mission/);
  const before=env.run('JSON.stringify(state)');await env.run(`reviewBackup({size:100,text:async()=>${JSON.stringify(JSON.stringify(bad))}})`);env.elements.get('confirm-import').onclick();assert.equal(env.run('JSON.stringify(state)'),before);
 }
 const bad={...saved,mission:{progress:'<bad>'}};const local=setup({silent:true,rawSave:JSON.stringify(bad)});local.run("startMission('find')");assert.equal(local.run('mode'),'home');assert.equal(local.run('state.garden.flowers'),1);
});


test('starter stories use three fixed meaningful steps and only normal guarded flowers',()=>{
 for(const [key,activities] of Object.entries({picnic:['find','match','find'],guests:['number','count','quantity'],seed:['find','count','number']})){
  const env=setup({silent:true});env.run(`startStoryMission('${key}')`);
  for(let i=0;i<3;i++){
   assert.equal(env.run('mode'),'mission-stage');assert.match(env.elements.get('app').innerHTML,/Hear our story/);
   const stale=env.elements.get('mission-continue').onclick;stale();assert.equal(env.run('mode'),activities[i]);
   const before=env.run('state.garden.flowers');missionWin(env,activities[i]);missionWin(env,activities[i]);
   assert.equal(env.run('state.mission.progress'),i+1);assert.equal(env.run('state.garden.flowers'),before+1);
   stale();assert.equal(env.run('state.mission.progress'),i+1);
   env.elements.get('next').onclick();
  }
  assert.equal(env.run('mode'),'mission-stage');assert.equal(env.run('state.mission.complete'),true);
  assert.equal(env.run('state.garden.flowers'),3);assert.match(env.elements.get('app').innerHTML,/complete!/);
  env.run(`home();startStoryMission('${key}')`);assert.equal(env.run('state.mission.progress'),0);assert.equal(env.run('state.garden.flowers'),3);
 }
});

test('starter story restores its next step through a completed patch without duplicate gifts',()=>{
 const env=setup({silent:true,savedState:{flowers:4}});env.run("startStoryMission('seed')");env.elements.get('mission-continue').onclick();win(env);
 assert.equal(env.run('mode'),'reward');assert.equal(env.run('state.mission.activity'),'count');
 const reload=setup({silent:true,rawSave:env.writes.at(-1).value});reload.run('missionMenu()');reload.elements.get('resume-mission').onclick();
 assert.equal(reload.run('mode'),'mission-stage');reload.elements.get('mission-continue').onclick();assert.equal(reload.run('mode'),'reward');
 reload.elements.get('plant-next').onclick();assert.equal(reload.run('mode'),'count');missionWin(reload,'count');reload.elements.get('next').onclick();
 reload.elements.get('mission-continue').onclick();assert.equal(reload.run('mode'),'number');numberTap(reload);reload.elements.get('next').onclick();
 assert.equal(reload.run('state.garden.flowers'),7);assert.equal(reload.run('state.mission.complete'),true);
 assert.equal(visitorState(reload).pending.length,1);assert.equal(decorationState(reload).pending.length,1);
});

test('starter stories retain active choices, honor preferences and keep free play separate',()=>{
 const env=setup({silent:true});env.run("state.preferences.letters.set='custom';state.preferences.letters.custom='XYZ';state.preferences.letters.case='lower';state.preferences.numbers.max=10;startStoryMission('picnic')");
 env.run("startStoryMission('seed')");assert.equal(env.run('state.mission.story'),'picnic');env.run("startMission('number')");assert.equal(env.run('state.mission.story'),'picnic');
 env.elements.get('mission-continue').onclick();assert.ok('XYZ'.includes(env.run('target[0]')));assert.match(env.elements.get('app').innerHTML,/aria-label="Letter [xyz]"/);
 win(env);env.elements.get('next').onclick();env.elements.get('mission-continue').onclick();assert.equal(env.run('mode'),'match');assert.ok('XYZ'.includes(env.run('target[0]')));
 env.run("home();start('number')");assert.equal(env.run('numberPool().length'),10);numberTap(env);assert.equal(env.run('state.mission.progress'),1);
 const reload=setup({silent:true,rawSave:env.writes.at(-1).value});reload.run("startStoryMission('guests')");assert.equal(reload.run('state.mission.story'),'picnic');assert.equal(reload.run('state.mission.activity'),'match');
});

test('starter story backups reject wrong sequence and invalid ids; failed starts roll back',()=>{
 const env=setup({silent:true});env.run("startStoryMission('guests')");const saved=JSON.parse(env.writes.at(-1).value);
 assert.equal(env.run(`validateBackup(${JSON.stringify(JSON.stringify(saved))}).mission.story`),'guests');
 for(const mission of [{...saved.mission,story:'bad'},{...saved.mission,story:'__proto__'},{...saved.mission,activity:'find'},{...saved.mission,progress:1,activity:'number'}]){
  assert.throws(()=>env.run(`validateBackup(${JSON.stringify(JSON.stringify({...saved,mission}))})`),/invalid little mission/);
 }
 const failed=setup({silent:true,writeError:true});failed.run("startStoryMission('seed')");assert.equal(failed.run('state.mission'),undefined);assert.equal(failed.run('mode'),'home');
});

function openNameSettings(env){env.elements.get('settings').showModal=()=>{};env.elements.get('settings').close=()=>{};env.elements.get('grownups').onclick();}
function saveName(env,display){env.elements.get('child-name').value=display;env.elements.get('save-settings').onclick();}
test('optional name drafts preserve exact Unicode and original ordered ASCII positions',()=>{
 const env=setup({muted:true});openNameSettings(env);
 const before=env.run('JSON.stringify(state)');
 env.elements.get('child-name').value='  Zoë ß İ e\u0301 李 👩🏽 Anna  ';env.elements.get('child-name').oninput();
 assert.equal(env.run('JSON.stringify(state)'),before);
 assert.match(env.elements.get('name-preview').textContent,/Only English A–Z/);
 assert.deepEqual(JSON.parse(env.run("JSON.stringify(nameLetters('aßaÉİe\\u0301😀'))")),[
 {index:0,character:'a',letter:'A'},{index:1,character:'ß',letter:null},{index:2,character:'a',letter:'A'},
 {index:3,character:'É',letter:null},{index:4,character:'İ',letter:null},{index:5,character:'e',letter:'E'},
 {index:6,character:'\u0301',letter:null},{index:7,character:'😀',letter:null}]);
 const display=env.elements.get('child-name').value;saveName(env,display);
 assert.equal(env.run('state.preferences.name.display'),display);
 const reload=setup({rawSave:env.writes.at(-1).value});openNameSettings(reload);assert.equal(reload.elements.get('child-name').value,display);
 assert.equal(plays(env).length,0);assert.equal(env.spoken.length,0);
});
test('name length counts Unicode codepoints and rejects invalid input without changing settings',()=>{
 const env=setup({silent:true});openNameSettings(env);saveName(env,'😀'.repeat(40));
 assert.equal(env.run('Array.from(state.preferences.name.display).length'),40);
 const before=env.run('JSON.stringify(state)'),writes=env.writes.length;
 for(const value of ['😀'.repeat(41),'a\nb','a\u0000b','\ud800']){
  saveName(env,value);assert.equal(env.run('JSON.stringify(state)'),before);assert.equal(env.writes.length,writes);
  assert.match(env.elements.get('name-preview').textContent,/40 characters/);
 }
});
test('name edit remove and cancel preserve rewards missions preferences and unknown older fields',()=>{
 const saved=backup();saved.preferences.name={display:'Sam',future:true};saved.preferences.extra={keep:true};
 const env=setup({rawSave:JSON.stringify(saved),silent:true});openNameSettings(env);
 env.elements.get('child-name').value='Unsaved';env.elements.get('close-settings').onclick();openNameSettings(env);
 assert.equal(env.elements.get('child-name').value,'Sam');
 const before=JSON.parse(env.run('JSON.stringify(state)'));saveName(env,'Anna');
 assert.equal(env.run('state.preferences.name.future'),true);saveName(env,'');
 const after=JSON.parse(env.run('JSON.stringify(state)'));delete before.preferences.name;
 assert.deepEqual(after,before);assert.equal(after.name,'Sam');
 const reload=setup({rawSave:env.writes.at(-1).value});assert.equal(reload.run("Object.hasOwn(state.preferences,'name')"),false);
});
test('name backups round trip safely and reject malformed bounded fields before replacement',async()=>{
 const saved=backup();saved.preferences.name={display:'<img src=x onerror=alert(1)>',future:1};
 const env=setup({silent:true});await env.run(`reviewBackup({size:100,text:async()=>${JSON.stringify(JSON.stringify(saved))}})`);
 assert.match(env.elements.get('backup-summary').textContent,/<img src=x/);assert.equal(env.elements.get('backup-summary').innerHTML,'');
 env.elements.get('settings').close=()=>{};env.elements.get('confirm-import').onclick();openNameSettings(env);
 assert.equal(env.elements.get('child-name').value,saved.preferences.name.display);
 assert.equal(env.elements.get('name-preview').innerHTML,'');assert.match(env.elements.get('name-preview').textContent,/<img/);
 assert.deepEqual(JSON.parse(await env.run('backupFile().text()')).preferences.name,saved.preferences.name);
 for(const name of [null,'Sam',[],{display:42},{display:'a'.repeat(41)},{display:'bad\nname'},{display:'\udfff'}]){
  const invalid=backup();invalid.preferences.name=name;const before=env.run('JSON.stringify(state)'),writes=env.writes.length;
  await env.run(`reviewBackup({size:100,text:async()=>${JSON.stringify(JSON.stringify(invalid))}})`);
  env.elements.get('confirm-import').onclick();assert.equal(env.run('JSON.stringify(state)'),before);assert.equal(env.writes.length,writes);
 }
});
test('malformed local name stays preserved until explicit replacement and names never request narration',()=>{
 const saved=backup();saved.preferences.name={display:99};const env=setup({rawSave:JSON.stringify(saved),muted:true});openNameSettings(env);
 assert.match(env.elements.get('name-preview').textContent,/could not be read/);assert.equal(env.run('state.preferences.name.display'),99);
 saveName(env,'李');assert.match(env.elements.get('name-preview').textContent,/in order: none/);
 assert.equal(plays(env).length,0);assert.equal(env.spoken.length,0);
 assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),/does not upload names for narration/);
});

function nameEnv(display){const env=setup({silent:true});env.run(`state.preferences.name={display:${JSON.stringify(display)}};start('name')`);return env;}
function nameWin(env){env.run("{const p=state.namePractice||{profile:state.preferences.name.display,index:0,complete:false};const letter=nameLetters(p.profile).filter(x=>x.letter)[p.index].letter;let done=false;nameAnswer(letter,nameViewId,letter,p,()=>done,v=>done=v);}");}
test('name rounds support one letter repeats and three distinct distractor choices',()=>{
 for(const display of ['A','AA','ABA','ABC']){const env=nameEnv(display);const choices=[...env.elements.get('name-choices').innerHTML.matchAll(/data-name-letter="(.)"/g)].map(x=>x[1]);assert.equal(new Set(choices).size,3);for(let i=0;i<display.length;i++){nameWin(env);assert.equal(env.run('state.namePractice.index'),i+1);if(i<display.length-1)env.elements.get('name-next').onclick();}assert.equal(env.run('state.garden.flowers'),display.length);assert.match(env.elements.get('app').innerHTML,/You found your name/);assert.equal(plays(env).length,0);const saved=JSON.parse(env.writes.at(-1).value);assert.equal(saved.namePractice.index,display.length);assert.equal(saved.garden.flowers,display.length);}
});
test('unsupported Unicode names never create a fake round',()=>{const env=nameEnv('é😀ß');assert.match(env.elements.get('app').innerHTML,/No flowers are earned/);assert.equal(env.run('state.garden.flowers'),0);assert.equal(env.run('state.namePractice'),undefined);assert.equal(env.run("nameLetters('é A-a😀').filter(x=>x.letter).map(x=>x.letter).join('')"),'AA');});
test('name reload resumes next position and stale answers cannot earn flowers',()=>{const env=nameEnv('ABC');env.run('oldNameView=nameViewId');nameWin(env);const saved=JSON.parse(env.writes.at(-1).value);const reload=setup({silent:true,savedState:saved});reload.run("start('name')");assert.equal(reload.elements.get('name-target').textContent,'B');env.run('home()');env.run("nameAnswer('A',oldNameView,'A',{profile:'ABC',index:0},()=>false,()=>{})");assert.equal(env.run('state.garden.flowers'),1);});
test('name free play preserves missions across fifth flower interruption',()=>{const env=nameEnv('ABCDEF');env.run("state.mission={kind:'discoveries',progress:0,complete:false,activity:'find',buddy:null}");for(let i=0;i<5;i++){nameWin(env);if(i<4)env.elements.get('name-next').onclick();}assert.equal(env.run('mode'),'reward');assert.equal(env.run('state.namePractice.index'),5);assert.equal(env.run('state.mission.progress'),0);env.elements.get('plant-next').onclick();assert.equal(env.elements.get('name-target').textContent,'F');nameWin(env);assert.equal(env.run('state.garden.flowers'),6);});
test('final letter on flower five exposes both celebrations with no extra reward',()=>{const env=nameEnv('A');env.run('state.garden.flowers=4;state.garden.patchFlowers=4');nameWin(env);assert.match(env.elements.get('app').innerHTML,/You found your name/);env.elements.get('name-garden').onclick();assert.equal(env.run('mode'),'reward');env.elements.get('plant-next').onclick();assert.match(env.elements.get('app').innerHTML,/You found your name/);assert.equal(env.run('state.garden.flowers'),5);});
test('name backup validation rejects mismatched and out of bounds progress',()=>{const env=nameEnv('AA');nameWin(env);const saved=JSON.parse(env.writes.at(-1).value);for(const patch of [{profile:'BB'},{index:3},{index:-1},{index:0.5},{complete:true}]){env.run(`bad=${JSON.stringify({...saved,namePractice:{...saved.namePractice,...patch}})}`);assert.throws(()=>env.run('validateBackup(JSON.stringify(bad))'),/name progress/);}});

test('changing name resets only name progress and invalid drafts never save',()=>{const env=nameEnv('AAA');nameWin(env);openNameSettings(env);const before=JSON.parse(env.run('JSON.stringify(state)'));saveName(env,'BB');assert.equal(env.run('state.namePractice'),undefined);const after=JSON.parse(env.run('JSON.stringify(state)'));delete before.namePractice;before.preferences.name.display='BB';assert.deepEqual(after,before);nameWin(env);const progress=env.run('JSON.stringify(state.namePractice)');saveName(env,'BB');assert.equal(env.run('JSON.stringify(state.namePractice)'),progress);const writes=env.writes.length;saveName(env,'A'.repeat(41));assert.equal(env.writes.length,writes);saveName(env,'');assert.equal(env.run('state.namePractice'),undefined);assert.equal(env.run('state.garden.flowers'),2);});


test('practice history records intentional participation across every activity, not screen visits',()=>{
 const env=setup({silent:true});
 for(const activity of ['find','match','number','count','quantity','explore','name'])env.run(`start('${activity}')`);
 assert.deepEqual(JSON.parse(env.run('JSON.stringify(state.practiceHistory)')),emptyHistory());
 for(const activity of ['find','match','number','quantity']){
  env.run(`start('${activity}')`);
  if(['find','match'].includes(activity))env.run("answer({dataset:{letter:alphabet.find(x=>x[0]!==target[0])[0]},classList:{add(){},remove(){}}})");
  else if(activity==='number')numberTap(env,'target===1?2:1');else quantityTap(env,'target===1?2:1');
  assert.equal(env.run('state.practiceHistory.discoveries'),env.run('state.garden.flowers'));
  if(['find','match'].includes(activity))win(env);else if(activity==='number')numberTap(env);else quantityTap(env);
 }
 assert.equal(env.run('state.practiceHistory.discoveries'),4);
 assert.deepEqual(JSON.parse(env.run('JSON.stringify(state.practiceHistory.activities)')),['find','match','number','quantity']);
 env.run("start('count');for(let i=0;i<target;i++)countObject({dataset:{object:String(i)},classList:{add(){}},setAttribute(){},querySelector(){return {textContent:''}}})");
 assert.equal(env.run('state.practiceHistory.discoveries'),5);
 assert.equal(env.run('state.practiceHistory.activities.includes("count")'),true);
});
test('picnic deduplicates letters and writes, with no reward or stale tap tracking',()=>{
 const env=setup({silent:true});env.run("var picnic={dataset:{letter:'A'},classList:{add(){}}};app.querySelectorAll=()=>[picnic];start('explore');var tap=picnic.onclick;tap()");
 const writes=env.writes.length;env.run('tap();tap();home();tap()');
 assert.equal(env.writes.length,writes);assert.equal(env.run('state.garden.flowers'),0);
 assert.deepEqual(JSON.parse(env.run('JSON.stringify(state.practiceHistory)')),{...emptyHistory(),activities:['explore'],letters:['A']});
});
test('counting help and retries are participation, never extra discoveries or duplicate writes',()=>{
 const env=setup({silent:true});env.run("start('quantity');quantityHelp();var history=JSON.stringify(state.practiceHistory)");
 const writes=env.writes.length;env.run('quantityHelp();quantityHelp()');assert.equal(env.writes.length,writes);
 assert.equal(env.run('state.practiceHistory.discoveries'),0);quantityTap(env,'target===1?2:1');quantityTap(env);
 assert.equal(env.run('state.practiceHistory.discoveries'),1);assert.equal(env.run('state.practiceHistory.numbers.length'),1);
 const after=env.writes.length;quantityTap(env);assert.equal(env.writes.length,after);
});
test('name and mission practice records letters and activities without adding a name profile',()=>{
 const named=nameEnv('AA');nameWin(named);nameWin(named);
 assert.deepEqual(JSON.parse(named.run('JSON.stringify(state.practiceHistory)')),{...emptyHistory(),activities:['name'],letters:['A'],discoveries:2});
 const env=setup({silent:true});env.run("startStoryMission('seed');document.getElementById('mission-continue').onclick()");win(env);
 assert.deepEqual(JSON.parse(env.run('JSON.stringify(state.practiceHistory.activities)')),['find','mission']);assert.equal(env.run('state.practiceHistory.discoveries'),1);
 const reload=setup({silent:true,rawSave:env.writes.at(-1).value});assert.equal(reload.run('JSON.stringify(state.practiceHistory)'),env.run('JSON.stringify(state.practiceHistory)'));
});
test('history clears separately, preserves all other state, and rolls back failed writes',()=>{
 const env=nameEnv('ABC');nameWin(env);env.run("state.buddy='bunny';preparePracticeSettings()");
 const before=JSON.parse(env.run('JSON.stringify(state)'));env.elements.get('clear-history').onclick();assert.equal(env.elements.get('confirm-clear-history').hidden,false);
 env.elements.get('cancel-clear-history').onclick();assert.equal(env.elements.get('confirm-clear-history').hidden,true);
 env.run('clearPracticeHistory()');const after=JSON.parse(env.run('JSON.stringify(state)'));assert.deepEqual(after.practiceHistory,emptyHistory());delete before.practiceHistory;delete after.practiceHistory;assert.deepEqual(after,before);
 const failed=setup({silent:true,writeError:true});failed.run("state.practiceHistory.letters=['A'];clearPracticeHistory()");assert.equal(failed.run('state.practiceHistory.letters[0]'),'A');assert.match(failed.elements.get('practice-summary').textContent,/could not be cleared/);
});
test('history backups are bounded and strict; absent history starts empty without historical inference',()=>{
 const env=setup({silent:true});const old=backup();delete old.practiceHistory;
 assert.deepEqual(JSON.parse(env.run(`JSON.stringify(validateBackup(${JSON.stringify(JSON.stringify(old))}).practiceHistory)`)),emptyHistory());
 for(const history of [null,{}, {...emptyHistory(),version:2},{...emptyHistory(),letters:['A','A']},{...emptyHistory(),letters:['<img>']},{...emptyHistory(),numbers:[11]},{...emptyHistory(),activities:['bad']},{...emptyHistory(),discoveries:1000000},{...emptyHistory(),profile:'Sam'}]){
  const saved={...backup(),practiceHistory:history};assert.throws(()=>env.run(`validateBackup(${JSON.stringify(JSON.stringify(saved))})`),/practice history/);
  const local=setup({silent:true,rawSave:JSON.stringify({...saved,garden:{flowers:0,patchFlowers:0},visitorRewards:{nextId:1,patchEarned:false,pending:[],opened:[]},decorationRewards:{nextId:1,patchEarned:false,pending:[],claimed:[]}})});local.run("start('find')");win(local);assert.equal(local.run('JSON.stringify(state.practiceHistory)'),JSON.stringify(history));local.run('preparePracticeSettings()');assert.match(local.elements.get('practice-summary').textContent,/could not be read/);
 }
 env.run("state.practiceHistory={version:1,activities:Object.keys(practiceActivities),letters:alphabet.map(x=>x[0]),numbers:Array.from({length:10},(_,i)=>i+1),discoveries:999999};persist()");
 assert.equal(env.run('validPracticeHistory(validateBackup(JSON.stringify(state)).practiceHistory)'),true);
 assert.ok(env.run('JSON.stringify(state.practiceHistory).length')<500);
});


test('correct letters automatically advance after narration, but never skip the fifth-flower celebration',()=>{
 const env=setup();env.run("start('match')");const id=env.run('letterRoundId');win(env);
 assert.equal(env.run('letterRoundId'),id);env.run('player.onended()');env.fireTimers(900);
 assert.equal(env.run('letterRoundId'),id+1);assert.equal(env.run('state.garden.flowers'),1);
 const last=setup({savedState:{flowers:4}});last.run("start('match')");win(last);last.run('player.onended()');last.fireTimers(900);last.fireTimers(15000);
 assert.equal(last.run('mode'),'reward');assert.equal(last.run('state.garden.flowers'),5);
});
test('muted auto advance cancels on navigation, settings, and manual next, with no duplicate rewards',()=>{
 const env=setup({muted:true});env.run("start('find')");win(env);const id=env.run('letterRoundId');env.fireTimers(900);assert.equal(env.run('letterRoundId'),id+1);
 win(env);env.run('home()');env.fireTimers(900);assert.equal(env.run('mode'),'home');assert.equal(env.run('state.garden.flowers'),2);
 env.run("start('match')");win(env);const current=env.run('letterRoundId');env.run('stopAudio()');env.fireTimers(900);assert.equal(env.run('letterRoundId'),current);
 env.elements.get('next').onclick();env.fireTimers(900);assert.equal(env.run('letterRoundId'),current+1);
});
test('device voice preference uses local speech at natural pitch and preserves completion callbacks',()=>{
 const env=setup();env.run("window.speechSynthesis.getVoices=()=>[{name:'Samantha',lang:'en-US',localService:true}];state.preferences.voiceMode='device';speak('Hello','sound-on',()=>{window.completed=true})");
 assert.equal(plays(env).length,0);assert.equal(env.spoken.length,1);assert.equal(env.spoken[0].voice.name,'Samantha');assert.equal(env.spoken[0].pitch,1);assert.equal(env.spoken[0].rate,.9);
 env.spoken[0].onend();assert.equal(env.run('window.completed'),true);
 const saved=JSON.parse(env.run('JSON.stringify(state)'));assert.equal(setup({rawSave:JSON.stringify(saved)}).run('state.preferences.voiceMode'),'device');
 assert.throws(()=>env.run("validateBackup(JSON.stringify({...state,preferences:{...state.preferences,voiceMode:'bad'}}))"),/voice setting/);
});
test('automatic voice prefers suitable local voices while recordings and silent previews remain reliable',()=>{
 const env=setup();env.run("window.speechSynthesis.getVoices=()=>[{name:'Samantha',lang:'en-US',localService:true}];speak('Hello','sound-on')");assert.equal(env.spoken.length,1);
 env.run("state.preferences.voiceMode='recordings';speak('Hello','sound-on')");assert.equal(plays(env).length,1);
 const silent=setup({silent:true});silent.run("state.preferences.voiceMode='device';speak('Hello','sound-on')");assert.equal(silent.spoken.length,0);assert.equal(plays(silent).length,0);
});

test('voice preview preserves saved preferences and a stuck recording still allows safe advancement',()=>{
 const env=setup({muted:true});env.run("document.getElementById('voice-mode').value='device'");const before=env.run('JSON.stringify(state.preferences)');
 env.elements.get('preview-voice').onclick();assert.equal(env.run('JSON.stringify(state.preferences)'),before);assert.equal(env.spoken.length,1);
 const stuck=setup();stuck.run("start('match')");win(stuck);const id=stuck.run('letterRoundId');stuck.fireTimers(15000);stuck.fireTimers(900);assert.equal(stuck.run('letterRoundId'),id+1);assert.equal(stuck.run('state.garden.flowers'),1);
});


test('both voice test buttons preview the draft rather than the saved recording mode',()=>{
 const env=setup({muted:true});env.run("state.preferences.voiceMode='recordings';window.speechSynthesis.getVoices=()=>[{name:'Samantha',lang:'en-US',localService:true}];document.getElementById('voice-mode').value='device'");
 const before=env.run('JSON.stringify(state.preferences)');env.elements.get('test-sound').onclick();
 assert.equal(plays(env).length,0);assert.equal(env.spoken.length,1);assert.match(env.elements.get('audio-status').textContent,/device voice: Samantha/);assert.equal(env.run('JSON.stringify(state.preferences)'),before);
 env.elements.get('preview-voice').onclick();assert.equal(env.spoken.length,2);assert.equal(env.spoken[0].text,env.spoken[1].text);
 env.run("document.getElementById('voice-mode').value='recordings'");env.elements.get('test-sound').onclick();assert.equal(plays(env).length,1);assert.match(env.elements.get('audio-status').textContent,/original Windows Zira/);
});
test('a failed device voice falls back to one recording without looping or duplicate completion',()=>{
 const env=setup();env.run("state.preferences.voiceMode='device';speak('Hello','sound-on',()=>{window.finished=(window.finished||0)+1})");
 env.spoken[0].onerror({error:'synthesis-failed'});assert.deepEqual(plays(env),['audio/sound-on.wav']);assert.match(env.elements.get('audio-status').textContent,/Device voice unavailable/);
 env.run('player.onended()');assert.equal(env.run('window.finished'),1);env.run('player.onended()');assert.equal(env.run('window.finished'),1);
 const unavailable=setup();unavailable.run("window.speechSynthesis=null;state.preferences.voiceMode='device';speak('Hello','sound-on')");assert.deepEqual(plays(unavailable),['audio/sound-on.wav']);
});

test('failed recording after failed device speech terminates without retrying either voice',async()=>{
 const env=setup({playError:Object.assign(new Error('decode'),{name:'NotSupportedError'})});env.run("state.preferences.voiceMode='device';speak('Hello','sound-on',()=>{window.finished=(window.finished||0)+1})");env.spoken[0].onerror({error:'synthesis-failed'});await new Promise(setImmediate);
 assert.equal(env.spoken.length,1);assert.equal(plays(env).length,1);assert.equal(env.run('window.finished'),1);
});

test('device speech that never starts falls back without losing completion callbacks',()=>{
 const env=setup();env.run("state.preferences.voiceMode='device';speak('one','count-number-1',()=>{window.finished=(window.finished||0)+1})");env.fireTimers(2500);
 assert.deepEqual(plays(env),['audio/count-number-1.wav']);env.run('player.onended()');assert.equal(env.run('window.finished'),1);
});
test('device speech that never ends recovers, and watchdogs cancel on leaving',()=>{
 const env=setup();env.run("state.preferences.voiceMode='device';speak('one','count-number-1')");env.spoken[0].onstart();env.fireTimers(2500);assert.equal(plays(env).length,0);env.fireTimers(8000);assert.equal(plays(env).length,1);
 const left=setup();left.run("state.preferences.voiceMode='device';speak('one','count-number-1');home()");left.fireTimers(2500);left.fireTimers(8000);assert.equal(plays(left).length,0);
});
test('unexpected speech interruption recovers without reviving stale playback',()=>{
 const env=setup();env.run("state.preferences.voiceMode='device';speak('one','count-number-1')");env.spoken[0].onerror({error:'interrupted'});assert.equal(plays(env).length,1);
 const newer=setup();newer.run("state.preferences.voiceMode='device';speak('one','count-number-1')");const stale=newer.spoken[0].onerror;newer.run("speak('two','count-number-2')");stale({error:'interrupted'});assert.equal(plays(newer).length,0);
});

test('one stalled voice switches the session to recordings until an intentional preview retries it',()=>{
 const env=setup();env.run("state.preferences.voiceMode='device';speak('one','count-number-1')");env.fireTimers(2500);
 env.run("speak('two','count-number-2')");assert.equal(env.spoken.length,1);assert.equal(plays(env).length,2);
 env.run("document.getElementById('voice-mode').value='device';previewVoice()");assert.equal(env.spoken.length,2);
});
