const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
function setup({silent=false, muted=false, playError=null}={}){
  const elements=new Map(), calls=[], spoken=[];
  const element=()=>({innerHTML:'',textContent:'',classList:{add(){},remove(){}},setAttribute(){},querySelectorAll(){return []},querySelector(){return null},focus(){}});
  const document={getElementById(id){if(!elements.has(id)) elements.set(id,element());return elements.get(id)},querySelectorAll(){return []},addEventListener(){}};
  class Audio {pause(){calls.push('pause')} play(){calls.push(this.src);return playError?Promise.reject(playError):Promise.resolve()}}
  const context=vm.createContext({document,Audio,URLSearchParams,location:{search:silent?'?silent=1':''},localStorage:{getItem(){return JSON.stringify({sound:!muted})},setItem(){}},window:{scrollTo(){},speechSynthesis:{cancel(){},resume(){},getVoices(){return []},speak(utterance){spoken.push(utterance)}}},SpeechSynthesisUtterance:class{constructor(text){this.text=text}},setTimeout(){},clearTimeout(){},console});
  context.window.SpeechSynthesisUtterance=context.SpeechSynthesisUtterance;
  vm.runInContext(source,context);
  return {run:code=>vm.runInContext(code,context),calls,spoken,elements};
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
test('all 132 bundled recordings are valid non-silent PCM WAVs',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'audio/manifest.json'),'utf8'));
 assert.equal(Object.keys(manifest).length,132);
 for(const name of Object.keys(manifest)){
  const data=fs.readFileSync(path.join(root,'audio',name+'.wav'));
  assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WAVE');
  const at=data.indexOf(Buffer.from('data'));assert.ok(at>0,name);assert.ok(data.length>1000,name);
  let peak=0;for(let i=at+8;i+1<data.length;i+=2)peak=Math.max(peak,Math.abs(data.readInt16LE(i)));assert.ok(peak>100,name);
 }
});
