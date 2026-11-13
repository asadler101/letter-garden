const alphabet = [
  ['A','apple','🍎'],['B','ball','⚽'],['C','cat','🐱'],['D','dog','🐶'],['E','elephant','🐘'],['F','fish','🐟'],['G','grapes','🍇'],['H','hat','🎩'],['I','ice cream','🍦'],['J','jellyfish','🪼'],['K','kite','🪁'],['L','lion','🦁'],['M','moon','🌙'],['N','nest','🪺'],['O','octopus','🐙'],['P','penguin','🐧'],['Q','queen','👑'],['R','rainbow','🌈'],['S','sun','☀️'],['T','turtle','🐢'],['U','umbrella','☂️'],['V','violin','🎻'],['W','whale','🐳'],['X','x-ray','🩻'],['Y','yo-yo','🪀'],['Z','zebra','🦓']
];
const defaults = {set:'starter', custom:'ABC', case:'upper', sound:true, flowers:0};
let saved = {};
try { saved = JSON.parse(localStorage.getItem('letter-garden') || '{}') || {}; } catch {}
const state = {...defaults, ...saved};
// Quiet previews never change the child's saved sound preference.
const quietPreview = new URLSearchParams(location.search).has('silent');
if (!['starter','full','custom'].includes(state.set)) state.set='starter';
if (!['upper','lower'].includes(state.case)) state.case='upper';
state.custom=typeof state.custom==='string'?state.custom.replace(/[^a-z]/gi,'').toUpperCase():'ABC';
state.flowers=Number.isSafeInteger(state.flowers)&&state.flowers>=0?state.flowers:0;
// Older gardens only saved a lifetime total. Continue their current group of five.
state.patchFlowers=Number.isInteger(state.patchFlowers)&&state.patchFlowers>=0&&state.patchFlowers<=5?state.patchFlowers:(state.flowers===0?0:((state.flowers-1)%5)+1);
let rewardMode='find';
let mode = 'home', target = null, lastTarget = null, answered = false, voices = [], toastTimer;
const app = document.getElementById('app');
const settings = document.getElementById('settings');
function persist(){try{localStorage.setItem('letter-garden',JSON.stringify(state));}catch{}}
function pool(){if(state.set==='full')return alphabet; if(state.set==='custom'){const p=alphabet.filter(x=>state.custom.includes(x[0]));if(p.length>=3)return p;}return alphabet.slice(0,5);}
function shown(letter){return state.case==='lower'?letter.toLowerCase():letter;}
function shuffle(items){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
// Keep one player and utterance alive; iOS can discard unreferenced speech objects.
const player = new Audio();
player.preload = 'none';
let speech = null, playbackId = 0;
function stopAudio(){
  playbackId++;
  player.onerror = null;
  player.pause();
  if(window.speechSynthesis) window.speechSynthesis.cancel();
  speech = null;
}
function audioHelp(){
  const feedback = document.getElementById('feedback');
  if(target && !answered && feedback) feedback.textContent = `Find ${mode==='match'?target[0].toLowerCase():shown(target[0])}`;
  document.getElementById('audio-status').textContent = 'Check media volume and Silent Mode, then tap Test sound again.';
  toast('Tap Hear the letter to retry. Check media volume and your phone’s Silent Mode.');
}
function speak(text, clip){
  if(!state.sound || quietPreview) return;
  stopAudio();
  const id = playbackId;
  // Start play synchronously inside the tap, before any loading or promises.
  // Bundled recordings avoid dependence on iPhone speech voice availability.
  let usedFallback = false;
  function fallback(){
    if(id!==playbackId || usedFallback) return;
    usedFallback = true;
    player.onerror = null;
    player.pause();
    if(!window.speechSynthesis || !window.SpeechSynthesisUtterance){audioHelp();return;}
    try {
      speech = new SpeechSynthesisUtterance(text);
      speech.lang='en-US'; speech.rate=.78; speech.pitch=1.08;
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v=>v.lang==='en-US' && /samantha|aria|jenny|zira/i.test(v.name)) || voices.find(v=>v.lang==='en-US');
      if(voice) speech.voice=voice;
      speech.onerror=event=>{if(id===playbackId && !['canceled','interrupted'].includes(event.error)) audioHelp();};
      speech.onend=()=>{if(id===playbackId) speech=null;};
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(speech);
    } catch { audioHelp(); }
  }
  if(!clip){fallback();return;}
  player.src = `audio/${clip}.wav${clip.startsWith('explore-')?'?v=3':''}`;
  player.onerror=fallback;
  const playing=player.play();
  if(playing) playing.catch(error=>{
    if(id!==playbackId || error.name==='AbortError') return;
    if(error.name==='NotAllowedError') audioHelp(); else fallback();
  });
}
function speakPrompt(){if(target) speak(prompt(),`${mode}-${target[0]}`);}
function toast(text){const el=document.getElementById('toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3500);}
function blooms(count=state.patchFlowers){return Array.from({length:5},(_,i)=>`<span class="bloom ${i<Math.min(count,5)?'':'empty'}" aria-hidden="true">✿</span>`).join('');}
function illustration(){return `<svg viewBox="0 0 530 330" role="img" aria-label="Happy letters A, B, and C growing in a sunny garden"><defs><pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#cbd6b4" opacity=".4"/></pattern></defs><path d="M65 254C25 155 104 46 231 51C392 3 514 116 467 248Z" fill="#e8edd8"/><path d="M65 254C25 155 104 46 231 51C392 3 514 116 467 248Z" fill="url(#dots)"/><circle cx="424" cy="67" r="27" fill="#edc773"/><g stroke="#edc773" stroke-width="3" stroke-linecap="round"><path d="M424 27v-8M424 107v8M384 67h-8M464 67h8M395 38l-6-6M453 96l6 6M453 38l6-6"/></g><g fill="#f9f8ee"><ellipse cx="140" cy="74" rx="32" ry="13"/><circle cx="134" cy="63" r="16"/><circle cx="156" cy="67" r="11"/></g><path d="M48 268Q239 224 483 270Q379 317 130 304Z" fill="#d6e1b9"/><path d="M70 275Q244 255 464 281" stroke="#b7c990" stroke-width="2" fill="none"/><g transform="rotate(-9 145 193)"><rect x="92" y="120" width="110" height="145" rx="27" fill="#e8b872"/><rect x="92" y="113" width="110" height="144" rx="27" fill="#f4cf89"/><text x="147" y="217" text-anchor="middle" fill="#7e623e" font-family="Trebuchet MS,sans-serif" font-size="100" font-weight="bold">A</text><circle cx="139" cy="240" r="3" fill="#7e623e"/><circle cx="156" cy="240" r="3" fill="#7e623e"/><path d="M141 247q7 7 13 0" stroke="#7e623e" stroke-width="2" fill="none"/></g><g transform="rotate(7 274 166)"><rect x="218" y="92" width="108" height="156" rx="27" fill="#87a365"/><rect x="218" y="86" width="108" height="155" rx="27" fill="#adc484"/><text x="272" y="195" text-anchor="middle" fill="#43653f" font-family="Trebuchet MS,sans-serif" font-size="105" font-weight="bold">B</text><circle cx="264" cy="220" r="3" fill="#43653f"/><circle cx="281" cy="220" r="3" fill="#43653f"/><path d="M266 227q7 6 13 0" stroke="#43653f" stroke-width="2" fill="none"/></g><g transform="rotate(-5 386 208)"><rect x="337" y="142" width="103" height="128" rx="26" fill="#a59abc"/><rect x="337" y="136" width="103" height="127" rx="26" fill="#c8beda"/><text x="389" y="224" text-anchor="middle" fill="#736488" font-family="Trebuchet MS,sans-serif" font-size="91" font-weight="bold">C</text><circle cx="381" cy="246" r="3" fill="#736488"/><circle cx="397" cy="246" r="3" fill="#736488"/><path d="M383 253q6 5 12 0" stroke="#736488" stroke-width="2" fill="none"/></g><g stroke="#73925a" stroke-width="4" fill="none" stroke-linecap="round"><path d="M65 277v-37M456 287v-42M300 296v-21"/></g><g fill="#9caf78"><ellipse cx="55" cy="258" rx="12" ry="6" transform="rotate(30 55 258)"/><ellipse cx="76" cy="250" rx="12" ry="6" transform="rotate(-35 76 250)"/><ellipse cx="445" cy="266" rx="12" ry="6" transform="rotate(30 445 266)"/><ellipse cx="468" cy="257" rx="12" ry="6" transform="rotate(-30 468 257)"/></g><text x="43" y="243" font-size="40" fill="#de9d76">✿</text><text x="433" y="249" font-size="43" fill="#e9bc68">✿</text><text x="286" y="278" font-size="28" fill="#b39cbc">✿</text><path d="M348 47q10-18 20 0q-10 15-20 0" fill="#d7a58a"/><path d="M358 43v14" stroke="#8e7c5d" stroke-width="2"/><g fill="#9bb373"><circle cx="82" cy="126" r="3"/><circle cx="479" cy="195" r="3"/><circle cx="184" cy="60" r="3"/></g></svg>`;}
function home(){
  mode='home';target=null;stopAudio();
  app.innerHTML=`<section class="hero"><div><div class="eyebrow">Welcome to Learning Garden</div><h1>Little discoveries.<br><em>Room to grow.</em></h1><p>Choose a garden. Listen, tap, and discover.<br>Your flowers grow with you.</p><div class="pill">✦ Made for little hands & curious minds</div></div><div class="illustration">${illustration()}</div></section><div class="choose-heading"><h2>Where shall we grow?</h2></div><section class="subject-grid" aria-label="Choose a garden"><button class="game-card subject-card" id="letter-garden"><div class="card-top"><span class="card-art" aria-hidden="true">A B C 🌱</span></div><h3>Letter Garden</h3><p>Find letters, match big & little,<br>and explore the alphabet.</p><span class="card-arrow" aria-hidden="true">→</span></button><section class="game-card peach subject-card coming-soon" aria-labelledby="number-garden-title"><div class="card-top"><span class="card-art" aria-hidden="true">1 2 3 🌷</span></div><h3 id="number-garden-title">Number Garden</h3><p>Coming soon · A new place<br>to count and discover.</p></section></section><section class="garden-strip" aria-label="Your garden: ${state.flowers} flowers"><span class="garden-icon" aria-hidden="true">🌱</span><div class="garden-copy"><h3>Your garden grows with you.</h3><p>${state.patchFlowers===5?'Five flowers! Your garden is in bloom.':`${state.patchFlowers} of 5 flowers in this garden.`}</p></div><div class="garden-blooms">${blooms()}<span class="garden-count">${state.flowers} flowers in all</span></div>${state.patchFlowers===5?'<button class="garden-reward-button" id="see-garden">See my garden →</button>':''}</section>`;
  document.getElementById('letter-garden').onclick=letterGarden;
  if(state.patchFlowers===5)document.getElementById('see-garden').onclick=()=>gardenComplete(false);
  window.scrollTo(0,0);
}
function letterGarden(){mode='letters';target=null;stopAudio();app.innerHTML=`<section class="hero"><div><div class="play-nav"><button class="back" id="subject-home">← Learning Garden home</button></div><div class="eyebrow">Letter Garden · A little adventure from A to Z</div><h1>Small letters.<br><em>Big adventures.</em></h1><p>A happy place to meet the alphabet.<br>Listen, tap, and watch your little garden grow.</p><div class="pill">✦ Made for little hands & curious minds</div></div><div class="illustration">${illustration()}</div></section><div class="choose-heading"><h2>What shall we play?</h2><p>Three little ways to learn</p></div><section class="game-grid" aria-label="Choose a game"><button class="game-card" data-mode="find"><div class="card-top"><span class="card-art">A <small>⌕</small></span><span class="card-label">LISTEN & FIND</span></div><h3>Find a letter</h3><p>Listen closely. Can you spot<br>the letter you hear?</p><span class="card-arrow">↗</span></button><button class="game-card peach" data-mode="match"><div class="card-top"><span class="card-art">A<small>a</small></span><span class="card-label">LOOK & MATCH</span></div><h3>Big & little</h3><p>Big letters have little friends.<br>Let’s bring them together.</p><span class="card-arrow">↗</span></button><button class="game-card lilac" data-mode="explore"><div class="card-top"><span class="card-art">A B C</span><span class="card-label">TAP & EXPLORE</span></div><h3>Alphabet picnic</h3><p>Meet every letter and<br>a picture pal to go with it.</p><span class="card-arrow">↗</span></button></section><section class="garden-strip" aria-label="Your garden: ${state.flowers} flowers"><span class="garden-icon">🌱</span><div class="garden-copy"><h3>A little learning. A little growing.</h3><p>${state.patchFlowers===5?"Five flowers! Your garden is in bloom.":`${state.patchFlowers} of 5 flowers in this garden. Keep growing!`}</p></div><div class="garden-blooms">${blooms()}<span class="garden-count">${state.flowers} flowers in all</span></div>${state.patchFlowers===5?'<button class="garden-reward-button" id="see-garden">See my garden →</button>':''}</section>`;document.getElementById('subject-home').onclick=home;app.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>start(button.dataset.mode)));if(state.patchFlowers===5)document.getElementById('see-garden').onclick=()=>gardenComplete(false);window.scrollTo(0,0);}
function nav(label){return `<div class="play-nav"><button class="back" id="back">← Letter Garden</button><span class="mode-tag">${label}</span></div>`;}
function start(nextMode){mode=nextMode;lastTarget=null;if(mode==='explore')explore();else round();}
function prompt(){return mode==='find'?`Can you find the letter ${target[0]}?`:`This is big ${target[0]}. Can you find little ${target[0]}?`;}
function round(){if(state.patchFlowers===5){gardenComplete(false);return;}answered=false;const letters=pool();target=shuffle(letters.filter(x=>x[0]!==lastTarget))[0]||letters[0];lastTarget=target[0];const choices=shuffle([target,...shuffle(letters.filter(x=>x!==target)).slice(0,2)]);app.innerHTML=nav(mode==='find'?'Listen & find':'Big & little')+`<section class="play-area"><div class="eyebrow">Let’s make a discovery</div><h1>${mode==='find'?'Which letter do you hear?':'Find my little friend'}</h1><p class="play-sub">${mode==='find'?'Tap the speaker, then tap a letter.':'Big and little letters have the same name.'}</p>${mode==='match'?`<div class="target-letter" aria-label="Capital ${target[0]}">${target[0]}</div>`:''}<button class="listen-button" id="listen"><span>♫</span> ${mode==='find'?'Hear the letter':'Hear it again'}</button><div class="choices">${choices.map(x=>`<button class="letter-choice" data-letter="${x[0]}" aria-label="${mode==='match'?'Little':'Letter'} ${mode==='match'?x[0].toLowerCase():shown(x[0])}">${mode==='match'?x[0].toLowerCase():shown(x[0])}</button>`).join('')}</div><div class="feedback" id="feedback" role="status" aria-live="polite">${!state.sound&&mode==='find'?`Find ${shown(target[0])}`:'Take your time, little sprout.'}</div><button class="next-button" id="next" hidden>Another letter →</button><div class="round-garden" id="round-garden" aria-label="${state.flowers} flowers">${blooms()}<small>${state.patchFlowers} of 5 · ${state.flowers} in all</small></div></section>`;document.getElementById('back').onclick=letterGarden;document.getElementById('listen').onclick=()=>{speakPrompt();if(!state.sound)document.getElementById('feedback').textContent=`Find ${mode==='match'?target[0].toLowerCase():shown(target[0])}`;};document.getElementById('next').onclick=()=>{round();};app.querySelectorAll('[data-letter]').forEach(button=>button.onclick=()=>answer(button));window.scrollTo(0,0);speakPrompt();}
function answer(button){if(answered)return;const feedback=document.getElementById('feedback');if(button.dataset.letter!==target[0]){button.classList.remove('try-again');void button.offsetWidth;button.classList.add('try-again');feedback.textContent=`Let’s look for ${mode==='match'?target[0].toLowerCase():shown(target[0])}. Try another!`;speak(`That is ${button.dataset.letter}. Try another letter.`,`retry-${button.dataset.letter}`);return;}answered=true;button.classList.add('correct');app.querySelectorAll('[data-letter]').forEach(el=>el.disabled=true);state.flowers++;state.patchFlowers++;persist();if(state.patchFlowers===5){gardenComplete(true);return;}feedback.textContent=`${target[0]} is for ${target[1]}! ${target[2]}`;speak(`You found ${target[0]}! ${target[0]} is for ${target[1]}. Your garden grew a flower!`,`correct-${target[0]}`);document.getElementById('next').hidden=false;document.getElementById('round-garden').innerHTML=blooms()+`<small>${state.patchFlowers} of 5 · ${state.flowers} in all</small>`;document.getElementById('round-garden').setAttribute('aria-label',`${state.flowers} flowers`);celebrate();}
function gardenComplete(announce){
  if(mode==='find'||mode==='match') rewardMode=mode;
  mode='reward'; target=null; answered=true;
  app.innerHTML=nav('Five little discoveries')+`<section class="play-area celebration"><div class="eyebrow">Look what you grew!</div><h1>Your garden is in bloom!</h1><p class="play-sub">Five flowers. Five wonderful discoveries.</p><div class="flower-patch" role="img" aria-label="Five colorful flowers in your completed garden">${Array.from({length:5},(_,i)=>`<div class="garden-flower" style="--i:${i}"><span class="flower-head" aria-hidden="true">✿</span><span class="flower-stem" aria-hidden="true"></span></div>`).join('')}<span class="patch-ground" aria-hidden="true"></span></div><p class="reward-message" role="status">Hooray, little gardener! You did it.</p><p class="reward-total">${state.flowers} flowers grown in all</p><div class="reward-actions"><button class="next-button" id="plant-next">Plant another garden <span aria-hidden="true">🌱</span></button><button class="rest-button" id="rest">Rest in the garden</button></div></section>`;
  document.getElementById('back').onclick=letterGarden;
  document.getElementById('rest').onclick=home;
  document.getElementById('plant-next').onclick=()=>{state.patchFlowers=0;persist();mode=rewardMode;round();};
  window.scrollTo(0,0);
  if(announce){celebrate();speak('Hooray! Five flowers! You grew a beautiful garden. Well done, little gardener!','garden-complete');}
}
function celebrate(){const layer=document.createElement('div');layer.className='sparkles';layer.setAttribute('aria-hidden','true');layer.innerHTML=Array.from({length:16},()=>`<span class="spark" style="left:${Math.random()*100}%;animation-delay:${Math.random()*.5}s;color:${['#a5b974','#e6b45c','#c0a4cb','#e49c76'][Math.floor(Math.random()*4)]}">${Math.random()>.5?'✿':'★'}</span>`).join('');document.body.append(layer);setTimeout(()=>layer.remove(),2400);}
function explore(){app.innerHTML=nav('Tap & explore')+`<section class="play-area"><div class="eyebrow">Bring your curiosity</div><h1>A picnic with the alphabet</h1><p class="play-sub">Tap a letter. Meet a picture pal.</p><div class="explore-banner" id="explore-banner" role="status" aria-live="polite"><span class="big-picture">🧺</span><strong>Who will you meet first?</strong></div><div class="explore-grid">${alphabet.map(x=>`<button class="explore-letter" data-letter="${x[0]}" aria-label="${x[0]} is for ${x[1]}"><span class="letters">${x[0]}${x[0].toLowerCase()}</span><span class="picture" aria-hidden="true">${x[2]}</span><span class="word">${x[1]}</span></button>`).join('')}</div></section>`;document.getElementById('back').onclick=letterGarden;app.querySelectorAll('[data-letter]').forEach(button=>button.onclick=()=>{const item=alphabet.find(x=>x[0]===button.dataset.letter);app.querySelector('.active')?.classList.remove('active');button.classList.add('active');document.getElementById('explore-banner').innerHTML=`<span class="big-picture">${item[2]}</span><strong>${item[0]} is for ${item[1]}!</strong>`;speak(`${item[0]} is for ${item[1]}.`,`explore-${item[0]}`);});window.scrollTo(0,0);speak('Welcome to the alphabet picnic. Tap a letter!','welcome');}
function updateSound(){const button=document.getElementById('sound');button.innerHTML=`<span aria-hidden="true">${state.sound?'♫':'♩'}</span><span class="sound-label">Sound ${state.sound?'on':'off'}</span>`;button.setAttribute('aria-label',state.sound?'Turn sound off':'Turn sound on');button.title=state.sound?'Sound on':'Sound off';button.setAttribute('aria-pressed',String(state.sound));}
document.getElementById('sound').onclick=()=>{state.sound=!state.sound;persist();updateSound();if(state.sound){if(target)speakPrompt();else speak('Sound is on. Let’s play!','sound-on');}else{stopAudio();if(mode==='find'&&target&&!answered)document.getElementById('feedback').textContent=`Find ${shown(target[0])}`;}toast(state.sound?'Sound on':'Sound off');};
document.getElementById('home').onclick=home;
document.getElementById('grownups').onclick=()=>{stopAudio();document.getElementById('letter-set').value=state.set;document.getElementById('case').value=state.case;document.getElementById('custom-letters').value=state.custom;document.getElementById('custom-wrap').hidden=state.set!=='custom';settings.showModal();};
document.getElementById('close-settings').onclick=()=>settings.close();
document.getElementById('letter-set').onchange=event=>document.getElementById('custom-wrap').hidden=event.target.value!=='custom';
document.getElementById('save-settings').onclick=()=>{const custom=[...new Set(document.getElementById('custom-letters').value.toUpperCase().replace(/[^A-Z]/g,''))].join('');if(document.getElementById('letter-set').value==='custom'&&custom.length<3){toast('Choose at least three different letters.');document.getElementById('custom-letters').focus();return;}state.set=document.getElementById('letter-set').value;state.case=document.getElementById('case').value;state.custom=custom;persist();settings.close();if(mode==='find'||mode==='match')round();toast('Ready for a little learning!');};
document.getElementById('reset').onclick=()=>{state.flowers=0;state.patchFlowers=0;persist();settings.close();home();toast('A fresh garden, ready to grow.');};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio();});
document.getElementById('test-sound').onclick=()=>{if(!state.sound){state.sound=true;persist();updateSound();}speak('Sound is on. Let’s play!','sound-on');};
updateSound();home();
