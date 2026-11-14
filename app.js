const alphabet = [
  ['A','apple','🍎'],['B','ball','⚽'],['C','cat','🐱'],['D','dog','🐶'],['E','elephant','🐘'],['F','fish','🐟'],['G','grapes','🍇'],['H','hat','🎩'],['I','ice cream','🍦'],['J','jellyfish','🪼'],['K','kite','🪁'],['L','lion','🦁'],['M','moon','🌙'],['N','nest','🪺'],['O','octopus','🐙'],['P','penguin','🐧'],['Q','queen','👑'],['R','rainbow','🌈'],['S','sun','☀️'],['T','turtle','🐢'],['U','umbrella','☂️'],['V','violin','🎻'],['W','whale','🐳'],['X','x-ray','🩻'],['Y','yo-yo','🪀'],['Z','zebra','🦓']
];
const buddies = [
  {id:'bunny',name:'Bunny',picture:'🐰',intro:'Hi, I’m Bunny! Let’s discover our garden together.'},
  {id:'turtle',name:'Turtle',picture:'🐢',intro:'Hi, I’m Turtle! We can take our time and explore.'},
  {id:'dinosaur',name:'Dinosaur',picture:'🦕',intro:'Hi, I’m Dinosaur! There’s so much to discover together.'}
];
const buddyFor = id => buddies.find(buddy=>buddy.id===id);
const visitors = [
  {id:'butterfly',name:'Butterfly',picture:'🦋'},
  {id:'ladybug',name:'Ladybug',picture:'🐞'},
  {id:'bee',name:'Bee',picture:'🐝'},
  {id:'snail',name:'Snail',picture:'🐌'},
  {id:'bird',name:'Bird',picture:'🐦'}
];
const visitorFor = id => visitors.find(visitor=>visitor.id===id);
// Sequential receipts identify rewards independently of lifetime flowers (which can reset).
function validVisitorRewards(value){
  if(!value || typeof value!=='object' || Array.isArray(value) ||
    !Number.isSafeInteger(value.nextId) || value.nextId<1 || typeof value.patchEarned!=='boolean' ||
    !Array.isArray(value.pending) || !Array.isArray(value.opened) ||
    value.pending.length+value.opened.length!==value.nextId-1)return false;
  const ids=[...value.pending,...value.opened.map(item=>item?.id)];
  return ids.every(id=>Number.isSafeInteger(id)&&id>0&&id<value.nextId) && new Set(ids).size===ids.length &&
    value.opened.every(item=>item && visitorFor(item.visitor));
}
function migrateVisitorRewards(saved){
  // Only the currently completed old patch earns a migration receipt; historic totals do not.
  if(!Object.hasOwn(saved,'visitorRewards') && saved.garden.patchFlowers===5)
    saved.visitorRewards={nextId:2,patchEarned:true,pending:[1],opened:[]};
  return saved;
}
const decorations = [
  {id:'mushroom',name:'Mushroom',picture:'🍄'}, {id:'pond',name:'Pond',picture:'💧'},
  {id:'birdhouse',name:'Birdhouse',picture:'🏡'}, {id:'stepping-stones',name:'Stepping Stones',picture:'🪨'},
  {id:'rainbow',name:'Rainbow',picture:'🌈'}, {id:'sunflower',name:'Sunflower',picture:'🌻'}
];
const decorationFor=id=>decorations.find(item=>item.id===id);
// Independent receipts preserve choices even after a visitor is opened or a new patch starts.
function validDecorationRewards(value){
  if(!value || typeof value!=='object' || Array.isArray(value) || !Number.isSafeInteger(value.nextId) || value.nextId<1 ||
    typeof value.patchEarned!=='boolean' || !Array.isArray(value.pending) || !Array.isArray(value.claimed) ||
    value.pending.length+value.claimed.length!==value.nextId-1)return false;
  const ids=[...value.pending,...value.claimed].map(item=>item?.id);
  return ids.every(id=>Number.isSafeInteger(id)&&id>0&&id<value.nextId)&&new Set(ids).size===ids.length &&
    value.pending.every(item=>item && (item.options===undefined || (Array.isArray(item.options)&&item.options.length===2&&new Set(item.options).size===2&&item.options.every(decorationFor)))) &&
    value.claimed.every(item=>item && decorationFor(item.decoration));
}
function migrateDecorationRewards(saved){
  // Historic totals and outstanding visitor counts never identify the current patch.
  if(!Object.hasOwn(saved,'decorationRewards') && saved.garden.patchFlowers===5)
    saved.decorationRewards={nextId:2,patchEarned:true,pending:[{id:1}],claimed:[]};
  return saved;
}
// A type is one reusable collection item, even when reward receipts repeat it.
function validGardenPlacements(saved){
  if(!Object.hasOwn(saved,'gardenPlacements'))return true;
  const layout=saved.gardenPlacements;
  if(!layout || layout.version!==1 || !Array.isArray(layout.spots) || layout.spots.length!==6)return false;
  if(saved.decorationRewards!==undefined && !validDecorationRewards(saved.decorationRewards))return false;
  const owned=new Set(saved.decorationRewards?.claimed.map(item=>item.decoration)||[]);
  const placed=layout.spots.filter(item=>item!==null);
  return placed.every(item=>typeof item==='string'&&decorationFor(item)&&owned.has(item))&&new Set(placed).size===placed.length;
}
const missionModes=['find','match','number','count','quantity'];
const missionStories={
  picnic:{title:'Pack a Picnic',modes:['find','match','find'],pictures:['🧺','🍎','🧺 🍎 🥪'],steps:['Find a letter to open the picnic basket.','Match a letter to pack a tasty snack.','Find one more letter to spread our picnic blanket.'],ending:'Our picnic is packed! Let’s enjoy it together.'},
  guests:{title:'Count the Garden Guests',modes:['number','count','quantity'],pictures:['🐞','🐞 🦋','🐞 🦋 🐝'],steps:['Find a number to welcome our first garden guest.','Count the apples for our visiting friends.','Match the apples to a number for our garden feast.'],ending:'Our garden guests have a lovely feast. Thank you for helping!'},
  seed:{title:'Help a Seed Grow',modes:['find','count','number'],pictures:['🫘','🌱 💧','🌻 ☀️'],steps:['Find a letter to plant our little seed.','Count the apples while we water our sprout.','Find a number to give our flower some sunshine.'],ending:'Our little seed has grown into a flower! You helped it grow.'}
};
let missionNeedsStage=false,missionStageId=0;
function storyFor(mission){return mission?.kind==='story'?missionStories[mission.story]:null;}
function missionStage(){
  const mission=state.mission,story=storyFor(mission);if(!story||!validMission(mission))return;
  missionRunning=true;missionNeedsStage=false;mode='mission-stage';target=null;stopAudio();
  const view=++missionStageId,step=mission.progress,text=mission.complete?story.ending:story.steps[step];
  app.innerHTML=`<section class="play-area"><h1>${story.title}</h1>${missionProgress()}<p>${text}</p><button class="listen-button" id="mission-listen">♫ Hear our story</button>${mission.complete?'':'<button class="primary" id="mission-continue">Let’s help →</button>'}<button class="rest-button" id="mission-home">Rest at home</button></section>`;
  const current=()=>mode==='mission-stage'&&view===missionStageId;
  const narrate=()=>speak(text,`mission-${mission.story}-${step}`);
  document.getElementById('mission-listen').onclick=()=>{if(current())narrate();};
  document.getElementById('mission-home').onclick=()=>{if(current())home();};
  if(!mission.complete)document.getElementById('mission-continue').onclick=()=>{if(current())start(mission.activity,true);};
  narrate();window.scrollTo(0,0);
}
function startStoryMission(key){
  if(!Object.hasOwn(missionStories,key))return;
  if(Object.hasOwn(state,'mission')&&!validMission(state.mission)){toast('Ask a grown-up to check this mission in settings.');return;}
  if(validMission(state.mission)&&!state.mission.complete){if(state.mission.kind==='story')missionStage();else toast('Your little mission is waiting. Finish it or ask a grown-up to put it away.');return;}
  const previous=state.mission;
  state.mission={kind:'story',story:key,progress:0,complete:false,activity:missionStories[key].modes[0],buddy:state.buddy||null};
  if(!persist()){if(previous===undefined)delete state.mission;else state.mission=previous;return;}
  missionStage();
}
function validMission(value){
  return value!==null && typeof value==='object' && !Array.isArray(value) && (value.kind==='discoveries' || (value.kind==='story' && Object.hasOwn(missionStories,value.story) && value.activity===missionStories[value.story].modes[Math.min(value.progress,2)])) &&
    Number.isInteger(value.progress) && value.progress>=0 && value.progress<=3 &&
    value.complete===(value.progress===3) && missionModes.includes(value.activity) &&
    (value.buddy===null || !!buddyFor(value.buddy));
}
let missionRunning=false;
function missionProgress(){
  if(!validMission(state.mission))return '';
  const mission=state.mission, friend=buddyFor(mission.buddy),story=storyFor(mission);
  if(story)return `<section class="mission-progress" id="mission-progress" role="status"><strong>${story.title}${mission.complete?' complete!':''}</strong><div class="mission-markers">${story.pictures.map((picture,i)=>`<span aria-label="${story.steps[i]} ${i<mission.progress?'done':'waiting'}">${i<mission.progress?picture:'🌱'}</span>`).join('')}</div><p>${mission.progress} of 3 steps. ${mission.complete?story.ending:story.steps[mission.progress]}</p></section>`;
  return `<section class="mission-progress" id="mission-progress" role="status" aria-label="Little mission: ${mission.progress} of 3 discoveries${mission.complete?', complete':''}"><strong>${friend?friend.name+'’s':'Your'} little mission${mission.complete?' complete!':''}</strong><div class="mission-markers">${Array.from({length:3},(_,i)=>`<span aria-label="Discovery ${i+1}: ${i<mission.progress?'found':'waiting'}">${i<mission.progress?'🌟':'🌱'}</span>`).join('')}</div><p>${mission.complete?'Three happy discoveries! Your flowers are saved.':'Make three discoveries together. Take all the time you like.'}</p></section>`;
}
function missionHome(){
  return missionProgress()+`<button class="rest-button" id="little-mission">${validMission(state.mission)&&!state.mission.complete?'Continue little mission':'🌱 A little mission'} →</button>`;
}
function missionMenu(){
  missionRunning=false;mode='mission';target=null;stopAudio();
  const mission=validMission(state.mission)?state.mission:null;
  app.innerHTML=`<div class="play-nav"><button class="back" id="mission-back">← Learning Garden home</button></div><section class="play-area"><h1>Choose a little mission</h1>${Object.entries(missionStories).map(([key,story])=>`<button class="rest-button" id="story-${key}">${story.pictures[2]} ${story.title}</button>`).join('')}${missionProgress()}<p>Find letters or numbers together. Each discovery grows one flower.</p><p>Choose any activity, or go home for free play. Your mission waits for you.</p><div class="mission-actions">${missionModes.map((activity,i)=>`<button class="rest-button" id="mission-${activity}">${['🔤 Find a letter','A a Big & little','🔢 Find a number','🍎 Count with me','🍎 🔢 How many?'][i]}</button>`).join('')}</div>${mission&&!mission.complete?'<button class="primary" id="resume-mission">Continue where we left off →</button>':''}</section>`;
  document.getElementById('mission-back').onclick=home;
  for(const key of Object.keys(missionStories))document.getElementById('story-'+key).onclick=()=>{if(mode==='mission')startStoryMission(key);};
  for(const activity of missionModes)document.getElementById('mission-'+activity).onclick=()=>{if(mode==='mission')startMission(activity);};
  if(mission&&!mission.complete)document.getElementById('resume-mission').onclick=()=>{if(mode==='mission')startMission(mission.activity);};
  window.scrollTo(0,0);
}
function startMission(activity){
  if(!missionModes.includes(activity))return;
  if(Object.hasOwn(state,'mission')&&!validMission(state.mission)){toast('This mission could not be read. A grown-up can abandon it in settings.');return;}
  if(storyFor(state.mission)&&!state.mission.complete){missionStage();return;}
  const previous=state.mission;
  state.mission=validMission(previous)&&!previous.complete?{...previous,activity}:{kind:'discoveries',progress:0,complete:false,activity,buddy:state.buddy||null};
  if(!persist()){if(previous===undefined)delete state.mission;else state.mission=previous;return;}
  missionRunning=true;start(activity,true);
}

// Bounded participation summary, never a child profile or an assessment.
const practiceActivities={find:'Find a letter',match:'Big & little',explore:'Alphabet picnic',name:'Discover my name',number:'Find a number',count:'Count with me',quantity:'How many?',mission:'Little missions'};
function emptyPracticeHistory(){return {version:1,activities:[],letters:[],numbers:[],discoveries:0};}
function validPracticeHistory(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join(',')!=='activities,discoveries,letters,numbers,version'||value.version!==1)return false;
  const distinct=(items,max,test)=>Array.isArray(items)&&items.length<=max&&new Set(items).size===items.length&&items.every(test);
  return distinct(value.activities,8,item=>Object.hasOwn(practiceActivities,item))&&distinct(value.letters,26,item=>typeof item==='string'&&/^[A-Z]$/.test(item))&&distinct(value.numbers,10,item=>Number.isInteger(item)&&item>=1&&item<=10)&&Number.isInteger(value.discoveries)&&value.discoveries>=0&&value.discoveries<=999999;
}
function recordPractice(activity,item,save=true){
  if(!validPracticeHistory(state.practiceHistory))return;
  const history=state.practiceHistory, before=JSON.stringify(history);
  const add=(items,value)=>{if(!items.includes(value))items.push(value);};
  if(Object.hasOwn(practiceActivities,activity))add(history.activities,activity);
  if(missionRunning)add(history.activities,'mission');
  if(typeof item==='string'&&/^[A-Z]$/.test(item))add(history.letters,item);
  if(Number.isInteger(item)&&item>=1&&item<=10)add(history.numbers,item);
  history.activities.sort();history.letters.sort();history.numbers.sort((a,b)=>a-b);
  if(save&&before!==JSON.stringify(history))persist();
}
function practiceSummary(){
  const history=state.practiceHistory;
  if(!validPracticeHistory(history))return 'Practice history could not be read. Other progress is kept. Clear only this history to begin recording again.';
  const subjects=[history.activities.some(item=>['find','match','explore','name'].includes(item))?'Letters':null,history.activities.some(item=>['number','count','quantity'].includes(item))?'Numbers':null].filter(Boolean);
  return `Subjects explored: ${subjects.join(', ')||'none recorded yet'}. Activities tried: ${history.activities.map(item=>practiceActivities[item]).join(', ')||'none recorded yet'}. Letters practiced or explored: ${history.letters.join(', ')||'none recorded yet'}. Numbers practiced: ${history.numbers.join(', ')||'none recorded yet'}. Discoveries since tracking began or history was cleared: ${history.discoveries}${history.discoveries===999999?' (limit reached)':''}.`;
}
function preparePracticeSettings(){document.getElementById('practice-summary').textContent=practiceSummary();document.getElementById('confirm-clear-history').hidden=true;}
function clearPracticeHistory(){
  const previous=state.practiceHistory;state.practiceHistory=emptyPracticeHistory();
  if(!persist()){state.practiceHistory=previous;document.getElementById('practice-summary').textContent='History could not be cleared. Try again when saving is available.';return;}
  preparePracticeSettings();
}

const SAVE_VERSION = 1;
const SAVE_KEY = 'letter-garden';
const numberMax = value => value === 10 ? 10 : 5;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {};
let storageMessage = '', unsupportedSave = false;
function loadSave(){
  let saved = {};
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if(raw !== null){
      saved = JSON.parse(raw);
      if(saved === null || typeof saved !== 'object' || Array.isArray(saved)) throw new Error('Invalid save');
    }
  } catch {
    saved = {};
    storageMessage = 'Saved progress could not be read. You can still play; changes may not survive closing this page.';
  }
  unsupportedSave = saved.version !== undefined && saved.version !== SAVE_VERSION;
  if(unsupportedSave) storageMessage = 'This garden was saved by a different version. You can still play, but progress will not be saved. Open the newer game to keep your saved garden.';
  const legacy = saved.version === undefined;
  const garden = legacy ? saved : record(saved.garden);
  const preferences = record(saved.preferences);
  const letters = legacy ? saved : record(preferences.letters);
  const flowers = Number.isSafeInteger(garden.flowers) && garden.flowers >= 0 ? garden.flowers : 0;
  return {
    ...saved,
    version: SAVE_VERSION,
    garden: {...(legacy ? {} : garden), flowers,
      patchFlowers: Number.isInteger(garden.patchFlowers) && garden.patchFlowers >= 0 && garden.patchFlowers <= 5 && garden.patchFlowers <= flowers ? garden.patchFlowers : (flowers === 0 ? 0 : ((flowers - 1) % 5) + 1)},
    preferences: {...preferences,
      sound: typeof (legacy ? saved.sound : preferences.sound) === 'boolean' ? (legacy ? saved.sound : preferences.sound) : true,
      letters: {...(legacy ? {} : letters),
        set: ['starter','full','custom'].includes(letters.set) ? letters.set : 'starter',
        custom: typeof letters.custom === 'string' ? letters.custom.replace(/[^a-z]/gi,'').toUpperCase() : 'ABC',
        case: ['upper','lower'].includes(letters.case) ? letters.case : 'upper'},
      numbers: {...record(preferences.numbers), max: numberMax(record(preferences.numbers).max)}
    }
  };
}
let state = migrateDecorationRewards(migrateVisitorRewards(loadSave()));
// Only known buddy identifiers may reach the picture/text renderer.
if(!buddyFor(state.buddy)) delete state.buddy;
if(!Object.hasOwn(state,'practiceHistory'))state.practiceHistory=emptyPracticeHistory();
// Remove migrated flat fields; all new writes use the versioned structure.
for(const key of ['flowers','patchFlowers','sound','set','custom','case']) delete state[key];
// Quiet previews never change the child's saved sound preference.
const quietPreview = new URLSearchParams(location.search).has('silent');
let rewardMode='find', numberRoundId=0;
const numberWords=['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
let mode = 'home', target = null, lastTarget = null, answered = false, voices = [], toastTimer;
const app = document.getElementById('app');
const settings = document.getElementById('settings');
// Optional name data belongs to preferences; older unknown top-level name fields stay intact.
const MAX_NAME_LENGTH=40;
function validName(value){
  return value!==null && typeof value==='object' && !Array.isArray(value) && typeof value.display==='string' &&
    Array.from(value.display).length<=MAX_NAME_LENGTH && !/[\u0000-\u001f\u007f-\u009f]/u.test(value.display) &&
    !Array.from(value.display).some(char=>char.length===1 && /[\ud800-\udfff]/u.test(char));
}
function nameLetters(display){
  // Test the original character before uppercasing: ß must never become two S positions.
  return Array.from(display, (character,index)=>({index,character,letter:/^[a-z]$/i.test(character)?character.toUpperCase():null}));
}
function validNamePractice(value,preferences=state.preferences){
  if(!validName(preferences.name)||!preferences.name.display)return false;
  const count=nameLetters(preferences.name.display).filter(item=>item.letter).length;
  return value!==null&&typeof value==='object'&&!Array.isArray(value)&&value.profile===preferences.name.display&&Number.isInteger(value.index)&&value.index>=0&&value.index<=count&&count>0&&typeof value.complete==='boolean'&&value.complete===(value.index===count);
}
let nameViewId=0;
function nameRound(){
  missionRunning=false;mode='name';target=null;stopAudio();const id=++nameViewId;
  const profile=state.preferences.name;
  const positions=validName(profile)?nameLetters(profile.display):[],playable=positions.filter(item=>item.letter);
  if(Object.hasOwn(state,'namePractice')&&!validNamePractice(state.namePractice)){
    app.innerHTML=nav('Discover my name')+'<section class="play-area"><h1>Name progress needs a grown-up</h1><p>Save the name again in settings to reset only name progress.</p></section>';document.getElementById('back').onclick=letterGarden;return;
  }
  const progress=state.namePractice||{profile:profile?.display,index:0,complete:false};
  app.innerHTML=nav('Discover my name')+`<section class="play-area"><h1>${progress.complete?'You found your name!':'Discover my name'}</h1><div class="name-positions" id="name-positions"></div><p>English A–Z letters are playable. Other characters stay visible in your name.</p>${!playable.length?'<p>Ask a grown-up to save a name with an English A–Z letter to play. No flowers are earned here.</p>':progress.complete?'<p>Every letter found! Your flowers are saved.</p><button class="listen-button" id="name-listen">♫ Hear the cheer</button>':'<p>Find the next big letter.</p><div class="target-letter" id="name-target"></div><button class="listen-button" id="name-listen">♫ Hear the letter</button><div class="choices" id="name-choices"></div><div class="feedback" id="feedback" role="status" aria-live="polite"></div><button class="next-button" id="name-next" hidden>Next letter →</button>'}${playable.length&&state.garden.patchFlowers===5?'<button class="rest-button" id="name-garden">See my garden ✿</button>':''}</section>`;
  document.getElementById('back').onclick=letterGarden;
  const display=document.getElementById('name-positions');
  let found=0;for(const item of positions){const span=document.createElement('span');span.className='name-position';span.id='name-position-'+item.index;span.textContent=!item.letter||found++<progress.index?item.character:'＿';span.setAttribute('aria-label',!item.letter?'Displayed character '+item.character:found<=progress.index?'Found '+item.letter:'Letter waiting');display.append(span);}
  if(playable.length&&state.garden.patchFlowers===5)document.getElementById('name-garden').onclick=()=>{if(mode==='name'&&id===nameViewId){rewardMode='name';gardenComplete(true);}};
  if(!playable.length)return;
  if(progress.complete){const cheer=()=>speak('You found your name!','name-complete');document.getElementById('name-listen').onclick=()=>{if(mode==='name'&&id===nameViewId)cheer();};cheer();return;}
  if(state.garden.patchFlowers===5){rewardMode='name';gardenComplete(false);return;}
  const letter=playable[progress.index].letter;document.getElementById('name-target').textContent=letter;
  const promptName=()=>speak(`Can you find the letter ${letter}?`,`find-${letter}`);
  document.getElementById('name-listen').onclick=()=>{if(mode==='name'&&id===nameViewId)promptName();};
  const choices=shuffle([letter,...shuffle(alphabet.map(item=>item[0]).filter(item=>item!==letter)).slice(0,2)]);
  document.getElementById('name-choices').innerHTML=choices.map(item=>`<button class="letter-choice" data-name-letter="${item}">${item}</button>`).join('');
  let done=false;
  app.querySelectorAll('[data-name-letter]').forEach(button=>button.onclick=()=>nameAnswer(button.dataset.nameLetter,id,letter,progress,()=>done,value=>done=value));
  document.getElementById('name-next').onclick=()=>{if(mode==='name'&&id===nameViewId&&done)nameRound();};
  promptName();
}
function nameAnswer(choice,id,letter,progress,isDone,setDone){
  if(mode!=='name'||id!==nameViewId||isDone()||state.garden.patchFlowers===5)return;
  if(!/^[A-Z]$/.test(choice))return;
  recordPractice('name',letter,choice!==letter);
  if(choice!==letter){document.getElementById('feedback').textContent=`Look for ${letter}. Try another!`;return;}
  setDone(true);const position=nameLetters(progress.profile).filter(item=>item.letter)[progress.index];document.getElementById('name-position-'+position.index).textContent=position.character;document.getElementById('name-position-'+position.index).setAttribute('aria-label','Found '+letter);state.namePractice={profile:progress.profile,index:progress.index+1,complete:progress.index+1===nameLetters(progress.profile).filter(item=>item.letter).length};
  earnFlower();
  // Keep both completion celebrations available when the last letter grows flower five.
  if(state.namePractice.complete){nameRound();celebrate();return;}
  if(state.garden.patchFlowers===5){rewardMode='name';gardenComplete(true);return;}
  document.getElementById('feedback').textContent=`You found ${letter}! One flower grew.`;
  document.getElementById('name-next').hidden=false;celebrate();
}
function updateNamePreview(){
  const display=document.getElementById('child-name').value;
  const preview=document.getElementById('name-preview');
  if(!validName({display})){preview.textContent='Use up to 40 characters, without control characters. Your saved name has not changed.';return false;}
  const positions=nameLetters(display), letters=positions.filter(item=>item.letter).map(item=>item.letter);
  const unsupported=positions.filter(item=>!item.letter).map(item=>item.character);
  preview.textContent=display ? `Name: ${display}. Playable letters in order: ${letters.join(' · ')||'none'}.${unsupported.length?' Only English A–Z letters can be practiced. Other characters (including spaces, punctuation and accented letters) stay in the displayed name but are not playable: '+unsupported.join(' · ')+'.':''} Discover my name practices these letters in order.` : 'No name saved when left empty. Name entry is optional.';
  return true;
}
function prepareNameSettings(){
  const saved=state.preferences.name;
  document.getElementById('child-name').value=validName(saved)?saved.display:'';
  updateNamePreview();
  if(Object.hasOwn(state.preferences,'name')&&!validName(saved))document.getElementById('name-preview').textContent='The saved name could not be read. It has been kept. Enter a replacement or leave empty and save to remove it.';
}
function updateStorageStatus(){
  const status = document.getElementById('storage-status');
  status.textContent = storageMessage;
  status.hidden = !storageMessage;
}
function persist(){
  if(!unsupportedSave){
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); storageMessage = ''; }
    catch { storageMessage = 'Progress cannot be saved in this browser right now. You can keep playing, but changes may be lost when you close or reload this page.'; }
  }
  updateStorageStatus();
  return !unsupportedSave && !storageMessage;
}
// Backups use the same versioned save as browser storage; unknown fields survive intact.
const MAX_BACKUP_BYTES = 1024 * 1024;
let pendingBackup = null, importRequest = 0;
function backupStatus(message){document.getElementById('backup-status').textContent=message;}
function clearBackupReview(){
  importRequest++; pendingBackup=null;
  document.getElementById('backup-review').hidden=true;
  document.getElementById('import-backup').value='';
}
function validateBackup(text){
  if(typeof text !== 'string' || text.length > MAX_BACKUP_BYTES) throw new Error('Choose a garden backup smaller than 1 MB.');
  let saved;
  try { saved=JSON.parse(text); } catch { throw new Error('This file is not valid garden backup JSON.'); }
  if(saved === null || typeof saved !== 'object' || Array.isArray(saved) || saved.version !== SAVE_VERSION) throw new Error('This backup version is not supported. Choose a version 1 garden backup.');
  const garden=record(saved.garden), preferences=record(saved.preferences), letters=record(preferences.letters);
  if(!Number.isSafeInteger(garden.flowers) || garden.flowers<0 || !Number.isInteger(garden.patchFlowers) || garden.patchFlowers<0 || garden.patchFlowers>5 || garden.patchFlowers>garden.flowers ||
    typeof preferences.sound !== 'boolean' || !['starter','full','custom'].includes(letters.set) || !['upper','lower'].includes(letters.case) ||
    typeof letters.custom !== 'string' || !/^[A-Z]{0,26}$/.test(letters.custom) || (letters.set==='custom' && new Set(letters.custom).size<3) ||
    preferences.numbers === null || typeof preferences.numbers !== 'object' || Array.isArray(preferences.numbers) ||
    (Object.hasOwn(preferences.numbers,'max') && ![5,10].includes(preferences.numbers.max))) throw new Error('This backup has invalid or missing garden progress or settings.');
  if(Object.hasOwn(preferences,'voiceMode')&&!['auto','recordings','device'].includes(preferences.voiceMode))throw new Error('This backup has an invalid voice setting.');
  if(Object.hasOwn(preferences,'name') && !validName(preferences.name)) throw new Error('This backup has an invalid name. Use up to 40 characters without control characters.');
  if(Object.hasOwn(saved,'namePractice')&&!validNamePractice(saved.namePractice,preferences))throw new Error('This backup has invalid name progress.');
  if(Object.hasOwn(saved,'practiceHistory')&&!validPracticeHistory(saved.practiceHistory))throw new Error('This backup has invalid practice history.');
  if(!Object.hasOwn(saved,'practiceHistory'))saved.practiceHistory=emptyPracticeHistory();
  if(Object.hasOwn(saved,'mission') && !validMission(saved.mission)) throw new Error('This backup has an invalid little mission.');
  if(Object.hasOwn(saved,'buddy') && !buddyFor(saved.buddy)) throw new Error('This backup has an unknown garden buddy.');
  if(Object.hasOwn(saved,'visitorRewards') && (!validVisitorRewards(saved.visitorRewards) || (saved.visitorRewards.patchEarned && garden.patchFlowers!==5) || (!saved.visitorRewards.patchEarned && garden.patchFlowers===5))) throw new Error('This backup has invalid visitor rewards.');
  if(Object.hasOwn(saved,'decorationRewards') && (!validDecorationRewards(saved.decorationRewards) || saved.decorationRewards.patchEarned!==(garden.patchFlowers===5))) throw new Error('This backup has invalid decoration rewards.');
  migrateVisitorRewards(saved);
  if(!validGardenPlacements(saved))throw new Error('This backup has invalid garden placements.');
  migrateDecorationRewards(saved);
  saved.preferences.numbers={...saved.preferences.numbers,max:numberMax(saved.preferences.numbers.max)};
  return saved;
}
async function reviewBackup(file){
  clearBackupReview(); backupStatus('');
  if(!file) return;
  const request=importRequest;
  try {
    if(file.size>MAX_BACKUP_BYTES) throw new Error('Choose a garden backup smaller than 1 MB.');
    const saved=validateBackup(await file.text());
    if(request!==importRequest) return;
    pendingBackup=saved;
    const letters=saved.preferences.letters;
    document.getElementById('backup-summary').textContent=`Backup version ${saved.version}: ${saved.garden.flowers} flowers in all; ${saved.garden.patchFlowers} of 5 in the current patch${saved.garden.patchFlowers===5?' (complete)':''}. Sound ${saved.preferences.sound?'on':'off'}. Letters: ${letters.set==='custom'?letters.custom:letters.set==='full'?'A–Z':'A–E'}, ${letters.case==='upper'?'uppercase':'lowercase'}. Numbers: 1–${saved.preferences.numbers.max}. Buddy: ${buddyFor(saved.buddy)?.name||'not chosen'}. Unopened visitors: ${saved.visitorRewards?.pending.length||0}. Discovered visitors: ${new Set(saved.visitorRewards?.opened.map(item=>item.visitor)||[]).size}. Unclaimed decorations: ${saved.decorationRewards?.pending.length||0}. Chosen decorations: ${saved.decorationRewards?.claimed.length||0}. Little mission: ${validMission(saved.mission)?saved.mission.progress+' of 3'+(saved.mission.complete?' (complete)':''):'none'}. Saved name: ${validName(saved.preferences.name)?saved.preferences.name.display||'none':'none'}. Practice history: ${saved.practiceHistory.activities.length} activities, ${saved.practiceHistory.discoveries} discoveries. Other saved fields, including older name fields, are kept. This replaces your current ${state.garden.flowers} flowers and all saved settings and progress; it does not merge gardens.`;
    document.getElementById('backup-review').hidden=false;
    document.getElementById('cancel-import').focus();
  } catch(error){if(request===importRequest) backupStatus(`${error.message} Your current garden has not changed.`);}
}
function replaceFromBackup(){
  if(!pendingBackup) return;
  // Commit first: a storage failure must not replace the current in-memory garden.
  try {localStorage.setItem(SAVE_KEY,JSON.stringify(pendingBackup));}
  catch {backupStatus('The backup could not be saved in this browser. Your current garden has not changed.');return;}
  state=pendingBackup; unsupportedSave=false; storageMessage='';
  clearBackupReview(); stopAudio(); updateStorageStatus(); updateSound(); settings.close(); home();
  toast('Your garden backup is restored.');
}
function backupFile(){
  if(unsupportedSave) throw new Error('Open the newer game to export this saved garden without losing data.');
  const text=JSON.stringify(state,null,2);
  validateBackup(text);
  return new File([text],`learning-garden-v${SAVE_VERSION}-${new Date().toISOString().slice(0,10)}.json`,{type:'application/json'});
}
function downloadBackup(){
  let url;
  try {
    const file=backupFile(); url=URL.createObjectURL(file);
    const link=document.createElement('a'); link.href=url; link.download=file.name;
    document.body.append(link); link.click(); link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    backupStatus('Backup download requested. Keep the file somewhere you can find it again, such as Files or Downloads.');
  } catch(error){if(url) URL.revokeObjectURL(url);backupStatus(`Backup could not be downloaded. ${error.message}`);}
}
async function shareBackup(){
  try {
    const file=backupFile();
    await navigator.share({files:[file]});
    backupStatus('Share sheet closed. Check your chosen destination for the backup.');
  } catch(error){backupStatus(error.name==='AbortError'?'Sharing canceled. Your garden has not changed.':'Sharing is unavailable. Use Download backup and save the file to Files or Downloads.');}
}
function prepareBackupSettings(){
  clearBackupReview(); backupStatus('');
  let canShare=false;
  try {canShare=typeof navigator.share==='function' && navigator.canShare?.({files:[backupFile()]})===true;} catch {}
  document.getElementById('share-backup').hidden=!canShare;
}
function pool(){if(state.preferences.letters.set==='full')return alphabet; if(state.preferences.letters.set==='custom'){const p=alphabet.filter(x=>state.preferences.letters.custom.includes(x[0]));if(p.length>=3)return p;}return alphabet.slice(0,5);}
// Shared range/round source for future numeral and quantity activities (LG-05–LG-07).
function numberPool(){return Array.from({length:numberMax(state.preferences.numbers.max)},(_,index)=>index+1);}
function numberRound(previousTarget=null){
  const numbers=numberPool();
  const target=shuffle(numbers.filter(number=>number!==previousTarget))[0];
  return {target,choices:shuffle([target,...shuffle(numbers.filter(number=>number!==target)).slice(0,2)])};
}
function shown(letter){return state.preferences.letters.case==='lower'?letter.toLowerCase():letter;}
function shuffle(items){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
// Keep one player and utterance alive; iOS can discard unreferenced speech objects.
const player = new Audio();
player.preload = 'none';
let speech = null, playbackId = 0, countAudioQueue = [], letterAdvanceTimer, speechWatchdog, deviceVoiceUnavailable=false;
function cancelLetterAdvance(){clearTimeout(letterAdvanceTimer);letterAdvanceTimer=null;}
function localEnglishVoices(){return window.speechSynthesis?.getVoices().filter(voice=>/^en(?:-|_)/i.test(voice.lang)&&voice.localService!==false)||[];}
function preferredDeviceVoice(){
  const voices=localEnglishVoices();
  return voices.find(voice=>/premium|enhanced|natural/i.test(voice.name)) || voices.find(voice=>/samantha|ava|allison|susan|karen|daniel|moira|aria|jenny/i.test(voice.name)) || voices[0];
}
function useDeviceVoice(){
  if(deviceVoiceUnavailable)return false;
  const mode=state.preferences.voiceMode||'auto', voice=preferredDeviceVoice();
  return mode==='device'||(mode==='auto'&&voice&&!/zira|david|mark/i.test(voice.name));
}
function voiceStatus(message){document.getElementById('audio-status').textContent=message;}
function prepareVoiceSettings(){document.getElementById('voice-mode').value=state.preferences.voiceMode||'auto';voiceStatus('Try this voice or Test sound previews the selection above. Ready to grow saves it for play.');}
function previewVoice(){
  deviceVoiceUnavailable=false;
  const previous=state.preferences.voiceMode, sound=state.preferences.sound;
  state.preferences.voiceMode=document.getElementById('voice-mode').value;state.preferences.sound=true;
  try{speak('Sound is on. Let’s play!','sound-on');if(!sound&&!quietPreview)voiceStatus('Voice preview only. Game sound is off. Tap Test sound to turn game sound on, then Ready to grow to save this voice.');}
  finally{state.preferences.sound=sound;if(previous===undefined)delete state.preferences.voiceMode;else state.preferences.voiceMode=previous;}
}
function advanceAfterLetter(id){
  cancelLetterAdvance();
  letterAdvanceTimer=setTimeout(()=>{letterAdvanceTimer=null;if(['find','match'].includes(mode)&&answered&&id===letterRoundId&&!document.hidden&&!settings.open)round();},900);
}
function countAudio(number){
  if(!state.preferences.sound || quietPreview)return;
  countAudioQueue.push(number);
  if(countAudioQueue.length===1)playCountAudio();
}
function playCountAudio(){
  const number=countAudioQueue[0];
  if(number===undefined)return;
  speak(numberWords[number],`count-number-${number}`,()=>{countAudioQueue.shift();playCountAudio();});
}
function stopAudio(clearQueue=true){
  cancelLetterAdvance();
  clearTimeout(speechWatchdog);
  if(clearQueue)countAudioQueue=[];
  playbackId++;
  player.onended = null;
  player.onerror = null;
  player.pause();
  if(window.speechSynthesis) window.speechSynthesis.cancel();
  speech = null;
}
function audioHelp(){
  const feedback = document.getElementById('feedback');
  if(target && !answered && feedback && !['count','quantity'].includes(mode)) feedback.textContent = mode==='number'?numberPrompt():`Find ${mode==='match'?target[0].toLowerCase():shown(target[0])}`;
  document.getElementById('audio-status').textContent = 'Check media volume and Silent Mode, then tap Test sound again.';
  toast(`Tap ${mode==='quantity'?'Hear it again':mode==='number'?'Hear the number':'Hear the letter'} to retry. Check media volume and your phone’s Silent Mode.`);
}
function speak(text, clip, onDone){
  if(!state.preferences.sound || quietPreview) return;
  stopAudio(!onDone);
  const id = playbackId;
  let finished=false;
  const done=()=>{if(id===playbackId && !finished){finished=true;clearTimeout(speechWatchdog);if(onDone)onDone();}};
  player.onended=done;
  // Start play synchronously inside the tap, before any loading or promises.
  // Bundled recordings avoid dependence on iPhone speech voice availability.
  let usedFallback = false, usedRecording = false;
  function nativeFailed(){
    if(id!==playbackId||finished)return;
    deviceVoiceUnavailable=true;
    clearTimeout(speechWatchdog);
    if(speech){speech.onend=null;speech.onerror=null;}
    if(window.speechSynthesis)window.speechSynthesis.cancel();
    speech=null;
    if(clip&&!usedRecording){voiceStatus('Device voice unavailable. Using the original Windows Zira recording instead.');recording(true);}
    else{audioHelp();done();}
  }
  function fallback(){
    if(id!==playbackId || usedFallback) return;
    usedFallback = true;
    player.onerror = null;
    player.pause();
    if(!window.speechSynthesis || !window.SpeechSynthesisUtterance){nativeFailed();return;}
    try {
      speech = new SpeechSynthesisUtterance(text);
      speech.lang='en-US'; speech.rate=.9; speech.pitch=1;
      const voices = window.speechSynthesis.getVoices();
      const voice = preferredDeviceVoice() || voices.find(v=>v.lang==='en-US');
      if(voice) speech.voice=voice;
      voiceStatus(`Using device voice: ${voice?.name||'system default'}. Ready to grow saves your voice selection.`);
      speech.onerror=()=>{if(id===playbackId)nativeFailed();};
      speech.onstart=()=>{if(id===playbackId){clearTimeout(speechWatchdog);speechWatchdog=setTimeout(nativeFailed,Math.min(45000,Math.max(8000,text.split(/\s+/).length*650+6000)));}};
      speech.onend=()=>{if(id===playbackId){speech=null;done();}};
      speechWatchdog=setTimeout(nativeFailed,2500);
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(speech);
    } catch { nativeFailed(); }
  }
  function recording(fromDevice=false){
  if(id!==playbackId||usedRecording)return;usedRecording=true;
  if(!fromDevice)voiceStatus('Using original Windows Zira recording. Ready to grow saves your voice selection.');
  player.src = `audio/${clip}.wav${clip.startsWith('explore-')?'?v=3':''}`;
  player.onerror=()=>{if(usedFallback){audioHelp();done();}else fallback();};
  const playing=player.play();
  if(playing) playing.catch(error=>{
    if(id!==playbackId || error.name==='AbortError') return;
    if(error.name==='NotAllowedError'||usedFallback){audioHelp();done();} else fallback();
  });
  }
  if(!clip||useDeviceVoice()){fallback();return;}
  recording();
}
function speakPrompt(){if(target) {if(mode==='quantity'){speak('How many apples do you see? Tap a number, or count with me.','quantity-prompt');}else if(mode==='count'){if(countedObjects.size) {stopAudio();countAudio(countedObjects.size);}else speak('Tap each apple. Count with me!','count-prompt');}else if(mode==='number') speak(`Can you find ${numberWords[target]}?`,`number-find-${target}`);else speak(prompt(),`${mode}-${target[0]}`);}}
function toast(text){const el=document.getElementById('toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3500);}
function blooms(count=state.garden.patchFlowers){return Array.from({length:5},(_,i)=>`<span class="bloom ${i<Math.min(count,5)?'':'empty'}" aria-hidden="true">✿</span>`).join('');}
function illustration(){return `<svg viewBox="0 0 530 330" role="img" aria-label="Happy letters A, B, and C growing in a sunny garden"><defs><pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#cbd6b4" opacity=".4"/></pattern></defs><path d="M65 254C25 155 104 46 231 51C392 3 514 116 467 248Z" fill="#e8edd8"/><path d="M65 254C25 155 104 46 231 51C392 3 514 116 467 248Z" fill="url(#dots)"/><circle cx="424" cy="67" r="27" fill="#edc773"/><g stroke="#edc773" stroke-width="3" stroke-linecap="round"><path d="M424 27v-8M424 107v8M384 67h-8M464 67h8M395 38l-6-6M453 96l6 6M453 38l6-6"/></g><g fill="#f9f8ee"><ellipse cx="140" cy="74" rx="32" ry="13"/><circle cx="134" cy="63" r="16"/><circle cx="156" cy="67" r="11"/></g><path d="M48 268Q239 224 483 270Q379 317 130 304Z" fill="#d6e1b9"/><path d="M70 275Q244 255 464 281" stroke="#b7c990" stroke-width="2" fill="none"/><g transform="rotate(-9 145 193)"><rect x="92" y="120" width="110" height="145" rx="27" fill="#e8b872"/><rect x="92" y="113" width="110" height="144" rx="27" fill="#f4cf89"/><text x="147" y="217" text-anchor="middle" fill="#7e623e" font-family="Trebuchet MS,sans-serif" font-size="100" font-weight="bold">A</text><circle cx="139" cy="240" r="3" fill="#7e623e"/><circle cx="156" cy="240" r="3" fill="#7e623e"/><path d="M141 247q7 7 13 0" stroke="#7e623e" stroke-width="2" fill="none"/></g><g transform="rotate(7 274 166)"><rect x="218" y="92" width="108" height="156" rx="27" fill="#87a365"/><rect x="218" y="86" width="108" height="155" rx="27" fill="#adc484"/><text x="272" y="195" text-anchor="middle" fill="#43653f" font-family="Trebuchet MS,sans-serif" font-size="105" font-weight="bold">B</text><circle cx="264" cy="220" r="3" fill="#43653f"/><circle cx="281" cy="220" r="3" fill="#43653f"/><path d="M266 227q7 6 13 0" stroke="#43653f" stroke-width="2" fill="none"/></g><g transform="rotate(-5 386 208)"><rect x="337" y="142" width="103" height="128" rx="26" fill="#a59abc"/><rect x="337" y="136" width="103" height="127" rx="26" fill="#c8beda"/><text x="389" y="224" text-anchor="middle" fill="#736488" font-family="Trebuchet MS,sans-serif" font-size="91" font-weight="bold">C</text><circle cx="381" cy="246" r="3" fill="#736488"/><circle cx="397" cy="246" r="3" fill="#736488"/><path d="M383 253q6 5 12 0" stroke="#736488" stroke-width="2" fill="none"/></g><g stroke="#73925a" stroke-width="4" fill="none" stroke-linecap="round"><path d="M65 277v-37M456 287v-42M300 296v-21"/></g><g fill="#9caf78"><ellipse cx="55" cy="258" rx="12" ry="6" transform="rotate(30 55 258)"/><ellipse cx="76" cy="250" rx="12" ry="6" transform="rotate(-35 76 250)"/><ellipse cx="445" cy="266" rx="12" ry="6" transform="rotate(30 445 266)"/><ellipse cx="468" cy="257" rx="12" ry="6" transform="rotate(-30 468 257)"/></g><text x="43" y="243" font-size="40" fill="#de9d76">✿</text><text x="433" y="249" font-size="43" fill="#e9bc68">✿</text><text x="286" y="278" font-size="28" fill="#b39cbc">✿</text><path d="M348 47q10-18 20 0q-10 15-20 0" fill="#d7a58a"/><path d="M358 43v14" stroke="#8e7c5d" stroke-width="2"/><g fill="#9bb373"><circle cx="82" cy="126" r="3"/><circle cx="479" cy="195" r="3"/><circle cx="184" cy="60" r="3"/></g></svg>`;}
let pendingBuddy=null;
// Reactions are visual only: the activity keeps its single narration channel.
function learningBuddy(reaction='waiting',showMission=true){
  const progress=showMission&&missionRunning?missionProgress():'';
  const buddy=buddyFor(state.buddy);
  if(!buddy)return progress;
  const reactions={waiting:['Learning together','🌱'],encouraging:['Keep exploring together','💛'],happy:['A happy discovery together','✦']};
  const [label,picture]=reactions[reaction]||reactions.waiting;
  return progress+`<div class="learning-buddy ${reaction}" id="learning-buddy" role="img" aria-label="${buddy.name}: ${label}"><span class="learning-buddy-picture" aria-hidden="true">${buddy.picture}</span><span class="learning-buddy-reaction" aria-hidden="true">${picture}</span><span aria-hidden="true">${buddy.name}</span></div>`;
}
function reactBuddy(reaction){
  if(!buddyFor(state.buddy))return;
  const buddy=document.getElementById('learning-buddy');
  if(buddy)buddy.outerHTML=learningBuddy(reaction,false);
}
let letterRoundId=0;
function buddyHome(){
  const buddy=buddyFor(state.buddy);
  return `<section class="buddy-home" aria-label="Your garden buddy"><span class="buddy-avatar" aria-hidden="true">${buddy?buddy.picture:'🌱'}</span><div><h2>${buddy?`${buddy.name}, your garden buddy`:'Meet a little garden friend'}</h2><p>${buddy?'Ready for more little discoveries together.':'Bunny, Turtle, or Dinosaur? You can choose whenever you like.'}</p></div><button class="rest-button" id="choose-buddy">${buddy?'Change buddy':'Choose a buddy'} <span aria-hidden="true">→</span></button></section>`;
}
function chooseBuddy(){
  mode='buddy';target=null;stopAudio();pendingBuddy=buddyFor(state.buddy)?.id||null;
  renderBuddyChoices();window.scrollTo(0,0);
}
function renderBuddyChoices(){
  const selected=buddyFor(pendingBuddy);
  app.innerHTML=`<div class="play-nav"><button class="back" id="buddy-back">← Learning Garden home</button></div><section class="play-area buddy-intro"><div class="eyebrow">A friend for your garden</div><h1>Who shall we grow with?</h1><p class="play-sub">Tap a friend to say hello. Then let’s play!</p></section><section class="buddy-grid" aria-label="Choose your garden buddy">${buddies.map(buddy=>`<button class="buddy-card" id="buddy-${buddy.id}" data-buddy="${buddy.id}" aria-pressed="${pendingBuddy===buddy.id}" aria-describedby="buddy-introduction"><span class="buddy-picture" aria-hidden="true">${buddy.picture}</span><span class="buddy-name">${buddy.name}</span><span class="buddy-check">${pendingBuddy===buddy.id?'✓ Selected':'♫ Say hello'}</span></button>`).join('')}</section><div class="buddy-confirm"><p id="buddy-introduction" role="status" aria-live="polite">${selected?selected.intro:'Three little friends. You can change your buddy any time.'}</p><button class="primary" id="confirm-buddy" ${selected?'':'disabled'}>${selected?`Let’s play with ${selected.name}`:'Choose a friend above'} <span aria-hidden="true">→</span></button><button class="rest-button" id="skip-buddy">${state.buddy?'Keep my buddy & play':'Skip for now & play'} <span aria-hidden="true">→</span></button><p class="small">Your flowers and discoveries always stay with you.</p></div>`;
  document.getElementById('buddy-back').onclick=home;
  document.getElementById('skip-buddy').onclick=()=>{if(mode==='buddy')home();};
  document.getElementById('confirm-buddy').onclick=confirmBuddy;
  app.querySelectorAll('[data-buddy]').forEach(button=>button.onclick=()=>selectBuddy(button.dataset.buddy));
}
function selectBuddy(id){
  if(mode!=='buddy'||!buddyFor(id))return;
  pendingBuddy=id;renderBuddyChoices();document.getElementById(`buddy-${id}`).focus();
  speak(buddyFor(id).intro,`buddy-${id}`);
}
function confirmBuddy(){
  if(mode!=='buddy'||!buddyFor(pendingBuddy))return;
  state.buddy=pendingBuddy;persist();home();
  document.getElementById('letter-garden').focus();
}
function home(){
  missionRunning=false;mode='home';target=null;stopAudio();
  app.innerHTML=`<section class="hero"><div><div class="eyebrow">Welcome to Learning Garden</div><h1>Little discoveries.<br><em>Room to grow.</em></h1><p>Choose a garden. Listen, tap, and discover.<br>Your flowers grow with you.</p><div class="pill">✦ Made for little hands & curious minds</div></div><div class="illustration">${illustration()}</div></section>${buddyHome()}${missionHome()}<button class="visitor-surprise my-garden-door" id="my-garden"><span class="visitor-gift" aria-hidden="true">🌿 🍄 🦋</span><strong>My Garden</strong><span>Enjoy your garden, decorations & visitors →</span></button>${pendingVisitorCue()}${pendingDecorationCue()}<div class="choose-heading"><h2>Where shall we grow?</h2></div><section class="subject-grid" aria-label="Choose a garden"><button class="game-card subject-card" id="letter-garden"><div class="card-top"><span class="card-art" aria-hidden="true">A B C 🌱</span></div><h3>Letter Garden</h3><p>Find letters, match big & little,<br>and explore the alphabet.</p><span class="card-arrow" aria-hidden="true">→</span></button><button class="game-card peach subject-card" id="number-garden"><div class="card-top"><span class="card-art" aria-hidden="true">1 2 3 🌷</span></div><h3 id="number-garden-title">Number Garden</h3><p>Find numerals and count apples.<br>Little discoveries with numbers.</p><span class="card-arrow" aria-hidden="true">→</span></button></section><section class="garden-strip" aria-label="Your garden: ${state.garden.flowers} flowers"><span class="garden-icon" aria-hidden="true">🌱</span><div class="garden-copy"><h3>Your garden grows with you.</h3><p>${state.garden.patchFlowers===5?'Five flowers! Your garden is in bloom.':`${state.garden.patchFlowers} of 5 flowers in this garden.`}</p></div><div class="garden-blooms">${blooms()}<span class="garden-count">${state.garden.flowers} flowers in all</span></div>${state.garden.patchFlowers===5?'<button class="garden-reward-button" id="see-garden">See my garden →</button>':''}</section>`;
  document.getElementById('little-mission').onclick=missionMenu;
  bindVisitorCue();
  document.getElementById('my-garden').onclick=myGarden;
  document.getElementById('choose-buddy').onclick=chooseBuddy;
  document.getElementById('letter-garden').onclick=letterGarden;
  document.getElementById('number-garden').onclick=numberGarden;
  if(state.garden.patchFlowers===5)document.getElementById('see-garden').onclick=()=>gardenComplete(false);
  window.scrollTo(0,0);
}
function letterGarden(){mode='letters';target=null;stopAudio();app.innerHTML=`<section class="hero"><div><div class="play-nav"><button class="back" id="subject-home">← Learning Garden home</button></div><div class="eyebrow">Letter Garden · A little adventure from A to Z</div><h1>Small letters.<br><em>Big adventures.</em></h1><p>A happy place to meet the alphabet.<br>Listen, tap, and watch your little garden grow.</p><div class="pill">✦ Made for little hands & curious minds</div></div><div class="illustration">${illustration()}</div></section><div class="choose-heading"><h2>What shall we play?</h2><p>Little ways to learn</p><button class="rest-button" id="discover-name">Discover my name →</button></div><section class="game-grid" aria-label="Choose a game"><button class="game-card" data-mode="find"><div class="card-top"><span class="card-art">A <small>⌕</small></span><span class="card-label">LISTEN & FIND</span></div><h3>Find a letter</h3><p>Listen closely. Can you spot<br>the letter you hear?</p><span class="card-arrow">↗</span></button><button class="game-card peach" data-mode="match"><div class="card-top"><span class="card-art">A<small>a</small></span><span class="card-label">LOOK & MATCH</span></div><h3>Big & little</h3><p>Big letters have little friends.<br>Let’s bring them together.</p><span class="card-arrow">↗</span></button><button class="game-card lilac" data-mode="explore"><div class="card-top"><span class="card-art">A B C</span><span class="card-label">TAP & EXPLORE</span></div><h3>Alphabet picnic</h3><p>Meet every letter and<br>a picture pal to go with it.</p><span class="card-arrow">↗</span></button></section><section class="garden-strip" aria-label="Your garden: ${state.garden.flowers} flowers"><span class="garden-icon">🌱</span><div class="garden-copy"><h3>A little learning. A little growing.</h3><p>${state.garden.patchFlowers===5?"Five flowers! Your garden is in bloom.":`${state.garden.patchFlowers} of 5 flowers in this garden. Keep growing!`}</p></div><div class="garden-blooms">${blooms()}<span class="garden-count">${state.garden.flowers} flowers in all</span></div>${state.garden.patchFlowers===5?'<button class="garden-reward-button" id="see-garden">See my garden →</button>':''}</section>`;document.getElementById('subject-home').onclick=home;document.getElementById('discover-name').onclick=()=>start('name');app.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>start(button.dataset.mode)));if(state.garden.patchFlowers===5)document.getElementById('see-garden').onclick=()=>gardenComplete(false);window.scrollTo(0,0);}
function nav(label){return `<div class="play-nav"><button class="back" id="back">← ${mode==='numbers'?'Learning Garden home':['number','count','quantity'].includes(mode)||(mode==='reward'&&['number','count','quantity'].includes(rewardMode))?'Number Garden':'Letter Garden'}</button><span class="mode-tag">${label}</span></div>`;}
function numberGarden(){
  mode='numbers';target=null;stopAudio();
  app.innerHTML=nav('Number Garden')+`<section class="play-area"><div class="eyebrow">Number Garden</div><h1>Let’s discover numbers</h1><p class="play-sub">Listen, find, and count. Your flowers grow together.</p></section><section class="game-grid" aria-label="Number games"><button class="game-card subject-card peach" id="find-number"><div class="card-top"><span class="card-art" aria-hidden="true">1 2 3</span></div><h3>Find a number</h3><p>Hear a number. Find its numeral.</p><span class="card-arrow" aria-hidden="true">→</span></button><button class="game-card subject-card" id="count-number"><div class="card-top"><span class="card-art" aria-hidden="true">🍎 🍎</span></div><h3>Count with me</h3><p>Tap each apple. Hear them counted.</p><span class="card-arrow" aria-hidden="true">→</span></button><button class="game-card subject-card lilac" id="how-many"><div class="card-top"><span class="card-art" aria-hidden="true">🍎🍎 <small>→ 2</small></span></div><h3>How many do you see?</h3><p>Count a group. Choose its number.</p><span class="card-arrow" aria-hidden="true">→</span></button></section><section class="garden-strip" aria-label="Your shared garden: ${state.garden.flowers} flowers"><span class="garden-icon" aria-hidden="true">&#127793;</span><div class="garden-copy"><h3>One garden, growing together.</h3><p>${state.garden.patchFlowers===5?'Five flowers! Your garden is in bloom.':`${state.garden.patchFlowers} of 5 flowers in this garden.`}</p></div><div class="garden-blooms">${blooms()}<span class="garden-count">${state.garden.flowers} flowers in all</span></div>${state.garden.patchFlowers===5?'<button class="garden-reward-button" id="see-garden">See my garden &rarr;</button>':''}</section>`;
  document.getElementById('back').onclick=home;
  document.getElementById('find-number').onclick=()=>start('number');
  document.getElementById('count-number').onclick=()=>start('count');
  document.getElementById('how-many').onclick=()=>start('quantity');
  if(state.garden.patchFlowers===5)document.getElementById('see-garden').onclick=()=>{rewardMode='number';gardenComplete(false);};
  window.scrollTo(0,0);
}
let countedObjects=new Set();
function countRound(){
  stopAudio();
  if(state.garden.patchFlowers===5){gardenComplete(false);return;}
  const id=++numberRoundId;
  target=numberRound(lastTarget).target;lastTarget=target;answered=false;countedObjects=new Set();
  app.innerHTML=nav('Number Garden · Count with me')+`<section class="play-area"><div class="eyebrow">Count with me</div><h1>Tap each apple</h1><p class="play-sub">One tap for each apple. Go in any order.</p>${learningBuddy()}<button class="listen-button" id="listen"><span aria-hidden="true">♫</span> Hear it again</button><div class="count-objects" aria-label="Apples to count">${Array.from({length:target},(_,i)=>`<button class="count-object" data-object="${i}" aria-label="Apple ${i+1}, not counted" aria-pressed="false"><span aria-hidden="true">🍎</span><span class="count-badge" aria-hidden="true"></span></button>`).join('')}</div><div class="feedback" id="feedback" role="status" aria-live="polite">0 counted. Tap an apple!</div><button class="next-button" id="next" hidden>Count more apples →</button><div class="round-garden" id="round-garden" aria-label="${state.garden.flowers} flowers">${blooms()}<small>${state.garden.patchFlowers} of 5 · ${state.garden.flowers} in all</small></div></section>`;
  document.getElementById('back').onclick=numberGarden;
  document.getElementById('listen').onclick=()=>{if(mode==='count'&&id===numberRoundId)speakPrompt();};
  document.getElementById('next').onclick=()=>{if(mode!=='count'||!answered||id!==numberRoundId)return;if(state.garden.patchFlowers===5)gardenComplete(true);else round();};
  app.querySelectorAll('[data-object]').forEach(button=>button.onclick=()=>countObject(button,id));
  window.scrollTo(0,0);speakPrompt();
}
function countObject(button,id=numberRoundId){
  if(mode!=='count'||answered||id!==numberRoundId)return;
  const index=Number(button.dataset.object);
  if(!Number.isInteger(index)||index<0||index>=target||countedObjects.has(index))return;
  // The first tap interrupts the invitation; subsequent taps queue short numbers.
  if(countedObjects.size===0)stopAudio();
  countedObjects.add(index);const count=countedObjects.size;recordPractice(mode,target,mode==='quantity'||count!==target);reactBuddy('encouraging');
  button.classList.add('counted');button.setAttribute('aria-pressed','true');button.setAttribute('aria-label',`Apple ${index+1}, counted ${count}`);
  button.querySelector('.count-badge').textContent=count;
  document.getElementById('feedback').textContent=`${numberWords[count]} (${count}) counted.`;
  countAudio(count);
  if(count!==target)return;
  answered=true;reactBuddy('happy');earnFlower();
  document.getElementById('feedback').textContent=`${target} apples! Your garden grew one flower!`;
  document.getElementById('next').hidden=false;
  document.getElementById('next').textContent=state.garden.patchFlowers===5?'See my garden ✿':'Count more apples →';
  document.getElementById('round-garden').innerHTML=blooms()+`<small>${state.garden.patchFlowers} of 5 · ${state.garden.flowers} in all</small>`;
  document.getElementById('round-garden').setAttribute('aria-label',`${state.garden.flowers} flowers`);celebrate();
}
function start(nextMode,inMission=false){missionRunning=inMission;mode=nextMode;lastTarget=null;if(mode==='explore')explore();else round();}
function prompt(){return mode==='find'?`Can you find the letter ${target[0]}?`:`This is big ${target[0]}. Can you find little ${target[0]}?`;}
function round(){cancelLetterAdvance();if(mode==='name'){nameRound();return;}if(missionRunning&&storyFor(state.mission)&&(missionNeedsStage||state.mission.complete)){missionStage();return;}if(mode==='quantity'){quantityRound();return;}if(mode==='count'){countRound();return;}if(mode==='number'){numberGameRound();return;}if(state.garden.patchFlowers===5){gardenComplete(false);return;}const id=++letterRoundId;answered=false;const letters=pool();target=shuffle(letters.filter(x=>x[0]!==lastTarget))[0]||letters[0];lastTarget=target[0];const choices=shuffle([target,...shuffle(letters.filter(x=>x!==target)).slice(0,2)]);app.innerHTML=nav(mode==='find'?'Listen & find':'Big & little')+`<section class="play-area letter-play ${mode==='match'?'matching-play':''}"><div class="eyebrow">Let’s make a discovery</div><h1>${mode==='find'?'Which letter do you hear?':'Find my little friend'}</h1><p class="play-sub">${mode==='find'?'Tap the speaker, then tap a letter.':'Big and little letters have the same name.'}</p>${mode==='match'?`<div class="target-letter" aria-label="Capital ${target[0]}">${target[0]}</div>`:''}${learningBuddy()}<button class="listen-button" id="listen"><span>♫</span> ${mode==='find'?'Hear the letter':'Hear it again'}</button><div class="choices">${choices.map(x=>`<button class="letter-choice" data-letter="${x[0]}" aria-label="${mode==='match'?'Little':'Letter'} ${mode==='match'?x[0].toLowerCase():shown(x[0])}">${mode==='match'?x[0].toLowerCase():shown(x[0])}</button>`).join('')}</div><div class="feedback" id="feedback" role="status" aria-live="polite">${!state.preferences.sound&&mode==='find'?`Find ${shown(target[0])}`:'Take your time, little sprout.'}</div><button class="next-button" id="next" hidden>Another letter →</button><div class="round-garden" id="round-garden" aria-label="${state.garden.flowers} flowers">${blooms()}<small>${state.garden.patchFlowers} of 5 · ${state.garden.flowers} in all</small></div></section>`;document.getElementById('back').onclick=letterGarden;document.getElementById('listen').onclick=()=>{if(!['find','match'].includes(mode)||id!==letterRoundId)return;speakPrompt();if(!state.preferences.sound)document.getElementById('feedback').textContent=`Find ${mode==='match'?target[0].toLowerCase():shown(target[0])}`;};document.getElementById('next').onclick=()=>{if(['find','match'].includes(mode)&&id===letterRoundId)round();};app.querySelectorAll('[data-letter]').forEach(button=>button.onclick=()=>answer(button,id));window.scrollTo(0,0);speakPrompt();}
function answer(button,id=letterRoundId){if(!['find','match'].includes(mode)||answered||id!==letterRoundId)return;if(!alphabet.some(item=>item[0]===button.dataset.letter))return;recordPractice(mode,target[0],button.dataset.letter!==target[0]);const feedback=document.getElementById('feedback');if(button.dataset.letter!==target[0]){button.classList.remove('try-again');void button.offsetWidth;button.classList.add('try-again');reactBuddy('encouraging');feedback.textContent=`Let’s look for ${mode==='match'?target[0].toLowerCase():shown(target[0])}. Try another!`;speak(`That is ${button.dataset.letter}. Try another letter.`,`retry-${button.dataset.letter}`);return;}answered=true;reactBuddy('happy');button.classList.add('correct');app.querySelectorAll('[data-letter]').forEach(el=>el.disabled=true);earnFlower();if(state.garden.patchFlowers===5){gardenComplete(true);return;}feedback.textContent=`${target[0]} is for ${target[1]}! ${target[2]}`;speak(`You found ${target[0]}! ${target[0]} is for ${target[1]}. Your garden grew a flower!`,`correct-${target[0]}`,()=>advanceAfterLetter(id));if(!state.preferences.sound||quietPreview)advanceAfterLetter(id);else letterAdvanceTimer=setTimeout(()=>advanceAfterLetter(id),15000);document.getElementById('next').hidden=false;document.getElementById('round-garden').innerHTML=blooms()+`<small>${state.garden.patchFlowers} of 5 · ${state.garden.flowers} in all</small>`;document.getElementById('round-garden').setAttribute('aria-label',`${state.garden.flowers} flowers`);celebrate();}
function numberPrompt(){return `Find ${numberWords[target]} (${target}).`;}
function numberGameRound(){
  if(state.garden.patchFlowers===5){gardenComplete(false);return;}
  const nextRound=numberRound(lastTarget), id=++numberRoundId;
  target=nextRound.target;lastTarget=target;answered=false;
  app.innerHTML=nav('Number Garden · Find a number')+`<section class="play-area"><div class="eyebrow">Let’s make a discovery</div><h1>Which number do you hear?</h1><p class="play-sub">Tap the speaker, then tap a number.</p>${learningBuddy()}<button class="listen-button" id="listen"><span aria-hidden="true">♫</span> Hear the number</button><div class="choices">${nextRound.choices.map(number=>`<button class="letter-choice" data-number="${number}" aria-label="Number ${number}">${number}</button>`).join('')}</div><div class="feedback" id="feedback" role="status" aria-live="polite">${state.preferences.sound?'Take your time, little sprout.':numberPrompt()}</div><button class="next-button" id="next" hidden>Another number →</button><div class="round-garden" id="round-garden" aria-label="${state.garden.flowers} flowers">${blooms()}<small>${state.garden.patchFlowers} of 5 · ${state.garden.flowers} in all</small></div></section>`;
  document.getElementById('back').onclick=numberGarden;
  document.getElementById('listen').onclick=()=>{if(mode!=='number'||id!==numberRoundId)return;speakPrompt();if(!state.preferences.sound&&!answered)document.getElementById('feedback').textContent=numberPrompt();};
  document.getElementById('next').onclick=()=>{if(mode==='number'&&answered&&id===numberRoundId)round();};
  app.querySelectorAll('[data-number]').forEach(button=>button.onclick=()=>answerNumber(button,id));
  window.scrollTo(0,0);speakPrompt();
}
function answerNumber(button,id=numberRoundId){
  if(mode!=='number'||answered||id!==numberRoundId)return;
  const choice=Number(button.dataset.number);
  if(!numberPool().includes(choice))return;
  recordPractice(mode,target,choice!==target);
  const feedback=document.getElementById('feedback');
  if(choice!==target){
    button.classList.remove('try-again');void button.offsetWidth;button.classList.add('try-again');
    reactBuddy('encouraging');feedback.textContent=`Let’s look for ${numberWords[target]} (${target}). Try another!`;
    speak(`That is ${numberWords[choice]}. Try another number.`,`number-retry-${choice}`);return;
  }
  answered=true;reactBuddy('happy');button.classList.add('correct');
  app.querySelectorAll('[data-number]').forEach(el=>el.disabled=true);
  earnFlower();
  if(state.garden.patchFlowers===5){gardenComplete(true);return;}
  feedback.textContent=`You found ${numberWords[target]} (${target})! Your garden grew a flower!`;
  speak(`You found ${numberWords[target]}! Your garden grew a flower!`,`number-correct-${target}`);
  document.getElementById('next').hidden=false;
  document.getElementById('round-garden').innerHTML=blooms()+`<small>${state.garden.patchFlowers} of 5 · ${state.garden.flowers} in all</small>`;
  document.getElementById('round-garden').setAttribute('aria-label',`${state.garden.flowers} flowers`);celebrate();
}
function quantityRound(){
  stopAudio();
  if(state.garden.patchFlowers===5){gardenComplete(false);return;}
  const nextRound=numberRound(lastTarget), id=++numberRoundId;
  target=nextRound.target;lastTarget=target;answered=false;countedObjects=new Set();
  app.innerHTML=nav('Number Garden · How many?')+`<section class="play-area quantity-area"><div class="eyebrow">Look & count</div><h1>How many do you see?</h1><p class="play-sub">Count the apples. Tap the number that matches.</p>${learningBuddy()}<button class="listen-button" id="listen"><span aria-hidden="true">♫</span> Hear it again</button><div class="count-objects" aria-label="One group of apples to count">${Array.from({length:target},(_,i)=>`<button class="count-object" data-object="${i}" aria-label="Apple ${i+1}, tap to count" aria-pressed="false"><span aria-hidden="true">🍎</span><span class="count-badge" aria-hidden="true"></span></button>`).join('')}</div><button class="rest-button" id="count-help"><span aria-hidden="true">👆 🍎</span> Count with me</button><div class="choices">${nextRound.choices.map(number=>`<button class="letter-choice" data-number="${number}" aria-label="Number ${number}">${number}</button>`).join('')}</div><div class="feedback" id="feedback" role="status" aria-live="polite">Count the apples, then choose a number. Tap an apple for help.</div><button class="next-button" id="next" hidden>Another group →</button><div class="round-garden" id="round-garden" aria-label="${state.garden.flowers} flowers">${blooms()}<small>${state.garden.patchFlowers} of 5 · ${state.garden.flowers} in all</small></div></section>`;
  document.getElementById('back').onclick=numberGarden;
  document.getElementById('listen').onclick=()=>{if(mode==='quantity'&&id===numberRoundId)speakPrompt();};
  document.getElementById('count-help').onclick=()=>quantityHelp(id);
  document.getElementById('next').onclick=()=>{if(mode==='quantity'&&answered&&id===numberRoundId)round();};
  app.querySelectorAll('[data-object]').forEach(button=>button.onclick=()=>quantityObject(button,id));
  app.querySelectorAll('[data-number]').forEach(button=>button.onclick=()=>answerQuantity(button,id));
  window.scrollTo(0,0);speakPrompt();
}
function quantityHelp(id=numberRoundId){
  if(mode!=='quantity'||answered||id!==numberRoundId)return;
  recordPractice('quantity',target);
  stopAudio();
  reactBuddy('encouraging');
  // Replay the complete sequence even after every object has been counted.
  for(let number=1;number<=target;number++)countAudio(number);
  document.getElementById('feedback').textContent=`${target} apples in this group. Choose the matching number.`;
}
function quantityObject(button,id=numberRoundId){
  if(mode!=='quantity'||answered||id!==numberRoundId)return;
  const index=Number(button.dataset.object);
  if(!Number.isInteger(index)||index<0||index>=target||countedObjects.has(index))return;
  if(countedObjects.size===0)stopAudio();
  countedObjects.add(index);const count=countedObjects.size;recordPractice(mode,target,mode==='quantity'||count!==target);reactBuddy('encouraging');
  button.classList.add('counted');button.setAttribute('aria-pressed','true');button.setAttribute('aria-label',`Apple ${index+1}, counted ${count}`);
  button.querySelector('.count-badge').textContent=count;
  document.getElementById('feedback').textContent=count===target?`${target} apples counted. Choose the matching number.`:`${numberWords[count]} (${count}) counted. Keep counting!`;
  countAudio(count);
}
function answerQuantity(button,id=numberRoundId){
  if(mode!=='quantity'||answered||id!==numberRoundId)return;
  const choice=Number(button.dataset.number);if(!numberPool().includes(choice))return;
  recordPractice(mode,target,choice!==target);
  if(choice!==target){
    reactBuddy('encouraging');document.getElementById('feedback').textContent='Let’s count the apples together. Try another number!';
    speak('Let’s count the apples together. Try another number!','quantity-retry');return;
  }
  answered=true;reactBuddy('happy');button.classList.add('correct');
  app.querySelectorAll('[data-number], [data-object], #count-help').forEach(el=>el.disabled=true);
  earnFlower();
  if(state.garden.patchFlowers===5){gardenComplete(true);return;}
  document.getElementById('feedback').textContent=`${target} apples! Your garden grew one flower!`;
  speak(`You found ${numberWords[target]}! Your garden grew a flower!`,`number-correct-${target}`);
  document.getElementById('next').hidden=false;
  document.getElementById('round-garden').innerHTML=blooms()+`<small>${state.garden.patchFlowers} of 5 · ${state.garden.flowers} in all</small>`;
  document.getElementById('round-garden').setAttribute('aria-label',`${state.garden.flowers} flowers`);celebrate();
}
function rewardsAvailable(){
  return !Object.hasOwn(state,'visitorRewards') || (validVisitorRewards(state.visitorRewards) &&
    (state.visitorRewards.patchEarned === (state.garden.patchFlowers===5)));
}
function earnFlower(){
  if(validPracticeHistory(state.practiceHistory))state.practiceHistory.discoveries=Math.min(999999,state.practiceHistory.discoveries+1);
  const canEarn=rewardsAvailable(), canDecorate=decorationRewardsAvailable();
  state.garden.flowers++;state.garden.patchFlowers++;
  // All successful activities reach this helper once, behind their round guards.
  // Mission progress and its flower are committed in the same save record.
  if(missionRunning && validMission(state.mission) && !state.mission.complete){
    state.mission.progress++;state.mission.complete=state.mission.progress===3;
    const story=storyFor(state.mission);
    state.mission.activity=story?story.modes[Math.min(state.mission.progress,2)]:mode;
    if(story)missionNeedsStage=true;
    const progress=document.getElementById('mission-progress');
    if(progress)progress.outerHTML=missionProgress();
  }
  if(state.garden.patchFlowers===5 && canEarn){
    state.visitorRewards ||= {nextId:1,patchEarned:false,pending:[],opened:[]};
    const rewards=state.visitorRewards;
    if(!rewards.patchEarned){rewards.pending.push(rewards.nextId++);rewards.patchEarned=true;}
  }
  if(state.garden.patchFlowers===5 && canDecorate){
    state.decorationRewards ||= {nextId:1,patchEarned:false,pending:[],claimed:[]};
    const rewards=state.decorationRewards;
    if(!rewards.patchEarned){rewards.pending.push({id:rewards.nextId++});rewards.patchEarned=true;}
  }
  persist();
}
function decorationRewardsAvailable(){
  return !Object.hasOwn(state,'decorationRewards') || (validDecorationRewards(state.decorationRewards) && state.decorationRewards.patchEarned===(state.garden.patchFlowers===5));
}
function pendingDecorationCue(){
  if(!decorationRewardsAvailable())return '<p class="small">Decoration rewards could not be read. Keep a backup and ask a grown-up for help.</p>';
  const count=state.decorationRewards?.pending.length||0;
  return count?`<button class="visitor-surprise" id="choose-decoration"><span class="visitor-gift" aria-hidden="true">🍄 🌈 🌻</span><strong>Choose a garden decoration</strong><span>A little gift to keep · ${count} unclaimed</span></button>`:'';
}
// Browsing the garden reads saved collections without awarding or claiming anything.
let myGardenViewId=0;
function myGarden(){
  mode='my-garden';target=null;answered=true;stopAudio();
  const view=++myGardenViewId;
  const ready=decorationRewardsAvailable()&&validGardenPlacements(state);
  const spots=ready?(state.gardenPlacements?.spots||Array(6).fill(null)):Array(6).fill(null);
  const owned=ready?new Set(state.decorationRewards?.claimed.map(item=>item.decoration)||[]).size:0;
  const friends=rewardsAvailable()?new Set(state.visitorRewards?.opened.map(item=>item.visitor)||[]).size:0;
  app.innerHTML=`<div class="play-nav"><button class="back" id="my-garden-home">← Learning Garden home</button></div><section class="play-area garden-hub"><div class="eyebrow">Your own little place</div><h1>My Garden</h1><p class="play-sub">${owned||friends?'Welcome back! Your little garden is waiting.':'Welcome to your little garden! There is room for flowers, decorations and new friends.'}</p><div class="garden-blooms hub-blooms" aria-label="${state.garden.patchFlowers} of 5 flowers in this patch">${blooms()}<span class="garden-count">${state.garden.flowers} flowers in all</span></div><div class="garden-scene garden-preview" aria-label="Your saved garden: six spots">${spots.map((key,index)=>{const item=decorationFor(key);return `<div class="garden-spot" role="img" aria-label="Spot ${index+1}: ${item?item.name:'room to grow'}"><span aria-hidden="true">${item?.picture||'🌱'}</span><small>${item?item.name:'Room to grow'}</small></div>`;}).join('')}</div>${!ready?'<p>Your saved decorations could not be read. Ask a grown-up for help; your saved garden has been kept.</p>':''}<div class="hub-collections"><button class="rest-button" id="decorate-garden"><span aria-hidden="true">🍄 🌻</span><strong>Decorate my garden</strong><span>${owned} decorations · Tap pictures to arrange</span></button><button class="rest-button" id="visitor-collection"><span aria-hidden="true">🦋 🐞</span><strong>Meet my visitors</strong><span>${friends} friends discovered · Say hello</span></button></div>${pendingVisitorCue()}${pendingDecorationCue()}<h2>Shall we grow some more?</h2><div class="hub-subjects"><button class="next-button" id="hub-letters">A B C · Letter Garden →</button><button class="next-button" id="hub-numbers">1 2 3 · Number Garden →</button></div></section>`;
  const current=()=>mode==='my-garden'&&view===myGardenViewId;
  for(const [id,action] of [['my-garden-home',home],['decorate-garden',decorateGarden],['visitor-collection',visitorCollection],['hub-letters',letterGarden],['hub-numbers',numberGarden]])document.getElementById(id).onclick=()=>{if(current())action();};
  bindVisitorCue();window.scrollTo(0,0);
}
let gardenViewId=0;
function decorateGarden(selected=null,message=''){
  mode='decorate';target=null;answered=true;stopAudio();
  const view=++gardenViewId;
  const ready=decorationRewardsAvailable()&&validGardenPlacements(state);
  const owned=ready?decorations.filter(item=>state.decorationRewards?.claimed.some(receipt=>receipt.decoration===item.id)):[];
  if(!owned.some(item=>item.id===selected))selected=null;
  const spots=ready?(state.gardenPlacements?.spots||Array(6).fill(null)):Array(6).fill(null);
  const current=()=>mode==='decorate'&&view===gardenViewId;
  app.innerHTML=`<div class="play-nav"><button class="back" id="decorate-home">← My Garden</button></div><section class="play-area"><div class="eyebrow">Your own little place</div><h1>Decorate my garden</h1><p class="play-sub">Tap a picture below, then tap a garden spot. Tap a placed picture to move it.</p><p class="reward-message" id="placement-message" role="status" aria-live="polite"></p><div class="garden-scene ${selected?'placing':''}" aria-label="Six garden spots">${spots.map((key,index)=>{const item=decorationFor(key);return `<button class="garden-spot ${selected&&key===selected?'selected':''}" id="garden-spot-${index}" ${!ready?'disabled':''} aria-pressed="${Boolean(selected&&key===selected)}" aria-label="Spot ${index+1}: ${item?item.name:'empty'}${selected?', place '+decorationFor(selected).name+' here':''}"><span aria-hidden="true">${item?.picture||'🌱'}</span><small>Spot ${index+1}${item?' · '+item.name:''}</small></button>`;}).join('')}</div><h2>Your decorations</h2><div class="garden-inventory" aria-label="Owned decorations">${owned.map(item=>`<button class="garden-item ${selected===item.id?'selected':''}" id="garden-item-${item.id}" aria-pressed="${selected===item.id}"><span aria-hidden="true">${item.picture}</span><strong>${item.name}</strong><small>${spots.includes(item.id)?'In your garden':'Ready to place'}</small></button>`).join('')}</div>${!owned.length&&ready?'<p>Welcome to your little garden! Grow five flowers to choose a decoration. Your six spots will be waiting.</p>':''}<div class="reward-actions"><button class="rest-button" id="garden-return" ${!selected||!spots.includes(selected)?'disabled':''}>↩ Return selected picture to collection</button><button class="rest-button" id="garden-cancel" ${!selected?'disabled':''}>Cancel selection</button></div></section>`;
  document.getElementById('placement-message').textContent=!ready?'Your saved decorations could not be read. Ask a grown-up for help; your saved garden has been kept.':message||(selected?`${decorationFor(selected).name} selected. Tap a glowing spot. An occupied spot swaps pictures, or returns its picture to the collection.`:'Choose a picture, then a spot.');
  document.getElementById('decorate-home').onclick=()=>{if(current())myGarden();};
  owned.forEach(item=>{document.getElementById(`garden-item-${item.id}`).onclick=()=>{if(!current())return;decorateGarden(item.id);speak(item.name,`decoration-${item.id}`);};});
  function saveSpots(next,note){
    const previous=state.gardenPlacements;
    state.gardenPlacements={...previous,version:1,spots:next};
    if(!persist()){
      if(previous===undefined)delete state.gardenPlacements;else state.gardenPlacements=previous;
      decorateGarden(selected,'Your picture is still safe. Ask a grown-up to help save, then try again.');return;
    }
    decorateGarden(null,note);
  }
  spots.forEach((key,index)=>{document.getElementById(`garden-spot-${index}`).onclick=()=>{
    if(!current()||!ready)return;
    if(!selected){if(key)decorateGarden(key);return;}
    const next=[...spots],from=next.indexOf(selected);
    if(from===index){decorateGarden(null);return;}
    if(from!==-1)next[from]=key;
    next[index]=selected;
    saveSpots(next,`${decorationFor(selected).name} is in your garden. Choose another picture whenever you like.`);
  };});
  document.getElementById('garden-return').onclick=()=>{if(!current()||!selected||!spots.includes(selected))return;saveSpots(spots.map(key=>key===selected?null:key),`${decorationFor(selected).name} is safe in your collection.`);};
  document.getElementById('garden-cancel').onclick=()=>{if(current())decorateGarden();};
  window.scrollTo(0,0);
}
let decorationViewId=0;
function chooseDecoration(){
  if(!decorationRewardsAvailable())return;
  const rewards=state.decorationRewards, receipt=rewards?.pending[0];
  if(!receipt)return;
  if(!receipt.options){
    const owned=new Set(rewards.claimed.map(item=>item.decoration));
    const fresh=decorations.filter(item=>!owned.has(item.id));
    const pool=shuffle(fresh.length>=2?fresh:[...fresh,...decorations.filter(item=>owned.has(item.id))]);
    // When only one remains, always include it alongside a friendly repeat.
    receipt.options=fresh.length===1?[fresh[0].id,pool.find(item=>item.id!==fresh[0].id).id]:pool.slice(0,2).map(item=>item.id);
  }
  if(!persist()){toast('Your decoration is waiting. Ask a grown-up to help save, then tap again.');return;}
  mode='decoration';target=null;answered=true;stopAudio();const view=++decorationViewId;
  const owned=new Set(rewards.claimed.map(item=>item.decoration));
  app.innerHTML=`<section class="play-area"><div class="eyebrow">A gift for your garden</div><h1>Which one shall we keep?</h1><p class="play-sub">Listen to each name, then choose one. You can come back later.</p><div class="decoration-grid">${receipt.options.map(key=>{const item=decorationFor(key);return `<div class="visitor-card"><span class="collection-picture" aria-hidden="true">${item.picture}</span><strong>${item.name}</strong><button class="rest-button" id="hear-${key}" aria-label="Hear ${item.name}">♫ Hear name</button><button class="next-button" id="keep-${key}">Keep ${item.name}</button>${owned.has(key)?'<span>Another lovely one to keep</span>':''}</div>`;}).join('')}</div><button class="rest-button" id="decoration-later">Choose later · Home</button></section>`;
  document.getElementById('decoration-later').onclick=home;
  for(const key of receipt.options){
    document.getElementById(`hear-${key}`).onclick=()=>{if(mode==='decoration'&&view===decorationViewId)speak(decorationFor(key).name,`decoration-${key}`);};
    document.getElementById(`keep-${key}`).onclick=()=>{
      if(mode!=='decoration'||view!==decorationViewId||!decorationRewardsAvailable()||!state.decorationRewards.pending.some(item=>item.id===receipt.id))return;
      const previous=JSON.stringify(state.decorationRewards);
      state.decorationRewards.pending=state.decorationRewards.pending.filter(item=>item.id!==receipt.id);
      state.decorationRewards.claimed.push({id:receipt.id,decoration:key});
      if(!persist()){state.decorationRewards=JSON.parse(previous);toast('Your choice is still waiting. Ask a grown-up to help save, then try again.');return;}
      ++decorationViewId;const item=decorationFor(key);
      app.innerHTML=`<section class="play-area celebration"><h1>${item.name} is yours!</h1><div class="visitor-picture" role="img" aria-label="${item.name}">${item.picture}</div><p class="reward-message" role="status">Saved in your decoration collection. A lovely gift for your garden.</p><button class="next-button" id="decoration-home">Decorate my garden</button></section>`;
      document.getElementById('decoration-home').onclick=decorateGarden;speak(item.name,`decoration-${key}`);
    };
  }
  window.scrollTo(0,0);
}
function pendingVisitorCue(){
  if(!rewardsAvailable())return '<p class="small">Visitor rewards could not be read. Keep a backup and ask a grown-up for help.</p>';
  const count=state.visitorRewards?.pending.length||0;
  return count?`<button class="visitor-surprise" id="reveal-visitor"><span class="visitor-gift" aria-hidden="true">🌿 🎁 🌿</span><strong>Who’s visiting your garden?</strong><span>Tap to meet a friend · ${count} unopened</span></button>`:'';
}
let visitorViewId=0;
function bindVisitorCue(){
  const decorationView=++decorationViewId;
  if(decorationRewardsAvailable()&&state.decorationRewards?.pending.length)document.getElementById('choose-decoration').onclick=()=>{
    if(decorationView===decorationViewId&&['home','my-garden','reward','visitor','collection'].includes(mode))chooseDecoration();
  };
  const id=++visitorViewId, receipt=rewardsAvailable()?state.visitorRewards?.pending[0]:undefined;
  if(receipt)document.getElementById('reveal-visitor').onclick=()=>{
    if(id!==visitorViewId || !['home','my-garden','reward','visitor','collection'].includes(mode))return;
    revealVisitor(receipt);
  };
}
// Collection browsing reads the same receipts as reveals; it never grants rewards.
function visitorCollection(){
  mode='collection';target=null;answered=true;stopAudio();
  const seen=new Set(rewardsAvailable()?state.visitorRewards?.opened.map(item=>item.visitor)||[]:[]);
  app.innerHTML=`<div class="play-nav"><button class="back" id="collection-home">← My Garden</button></div><section class="play-area"><div class="eyebrow">Our garden friends</div><h1>Meet my visitors</h1><p class="play-sub">Tap a friend to say hello. More friends may visit as your garden grows.</p>${pendingVisitorCue()}${pendingDecorationCue()}<div class="visitor-grid" aria-label="Garden visitors">${visitors.map(visitor=>seen.has(visitor.id)?`<button class="visitor-card" id="collection-${visitor.id}" aria-label="Say hello to ${visitor.name}"><span class="collection-picture" aria-hidden="true">${visitor.picture}</span><strong>${visitor.name}</strong><span>♫ Say hello</span></button>`:`<div class="visitor-card unknown" role="img" aria-label="A friend yet to visit"><svg class="collection-picture visitor-silhouette" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d="M25 72Q8 48 30 40Q20 15 42 28Q53 8 65 30Q92 23 82 49Q99 68 74 77Q50 95 25 72Z"/><circle cx="43" cy="51" r="3"/><circle cx="60" cy="51" r="3"/><path class="smile" d="M43 62Q52 71 61 61"/></svg><strong>A friend yet to visit</strong></div>`).join('')}</div><p id="visitor-greeting" class="reward-message" role="status" aria-live="polite">Your friends are happy to see you.</p><button class="rest-button" id="collection-rest">Rest in the garden 🌿</button></section>`;
  bindVisitorCue();
  const view=visitorViewId;
  document.getElementById('collection-home').onclick=myGarden;
  document.getElementById('collection-rest').onclick=home;
  for(const visitor of visitors){
    if(!seen.has(visitor.id))continue;
    const button=document.getElementById(`collection-${visitor.id}`);
    button.onclick=()=>{
      if(mode!=='collection'||view!==visitorViewId)return;
      button.classList.remove('visitor-wave');void button.offsetWidth;button.classList.add('visitor-wave');
      document.getElementById('visitor-greeting').textContent=`Hello, ${visitor.name}! So happy to see you!`;
      speak(`Hello, ${visitor.name}!`,`visitor-${visitor.id}`);
    };
  }
  window.scrollTo(0,0);
}
function revealVisitor(receipt){
  if(!rewardsAvailable() || !state.visitorRewards?.pending.includes(receipt))return;
  // Ensure the earned receipt is durable before choosing or presenting its visitor.
  if(!persist()){toast('Your visitor is waiting. Ask a grown-up to help save, then tap again.');return;}
  const rewards=state.visitorRewards, seen=new Set(rewards.opened.map(item=>item.visitor));
  const unseen=visitors.filter(visitor=>!seen.has(visitor.id));
  const choices=unseen.length?unseen:visitors;
  const visitor=choices[Math.floor(Math.random()*choices.length)];
  const previous=JSON.stringify(rewards);
  rewards.pending=rewards.pending.filter(id=>id!==receipt);
  rewards.opened.push({id:receipt,visitor:visitor.id});
  // Failed claim writes leave the unopened receipt available, with no visible reveal.
  if(!persist()){state.visitorRewards=JSON.parse(previous);toast('Your visitor is still waiting. Ask a grown-up to help save, then tap again.');return;}
  mode='visitor';target=null;answered=true;stopAudio();
  app.innerHTML=`<section class="play-area celebration"><div class="eyebrow">A friend has come to visit!</div><h1>Hello, ${visitor.name}!</h1><div class="visitor-picture" role="img" aria-label="${visitor.name}">${visitor.picture}</div><p class="reward-message" role="status">${visitor.name} is visiting your garden.</p>${learningBuddy('happy')}${pendingVisitorCue()}${pendingDecorationCue()}<div class="reward-actions"><button class="next-button" id="visitor-collection">Meet my visitors 🦋</button><button class="rest-button" id="visitor-home">Rest in the garden</button>${state.garden.patchFlowers===5?'<button class="next-button" id="visitor-garden">See my garden 🌷</button>':''}</div></section>`;
  document.getElementById('visitor-collection').onclick=visitorCollection;
  document.getElementById('visitor-home').onclick=home;
  if(state.garden.patchFlowers===5)document.getElementById('visitor-garden').onclick=()=>gardenComplete(false);
  bindVisitorCue();window.scrollTo(0,0);celebrate();
  speak(`Hello, ${visitor.name}!`, `visitor-${visitor.id}`);
}
function gardenComplete(announce){
  if(mode==='name'||mode==='find'||mode==='match'||mode==='number'||mode==='count'||mode==='quantity') rewardMode=mode;
  mode='reward'; target=null; answered=true;
  app.innerHTML=nav('Five little discoveries')+`<section class="play-area celebration"><div class="eyebrow">Look what you grew!</div><h1>Your garden is in bloom!</h1><p class="play-sub">Five flowers. Five wonderful discoveries.</p>${learningBuddy('happy')}<div class="flower-patch" role="img" aria-label="Five colorful flowers in your completed garden">${Array.from({length:5},(_,i)=>`<div class="garden-flower" style="--i:${i}"><span class="flower-head" aria-hidden="true">✿</span><span class="flower-stem" aria-hidden="true"></span></div>`).join('')}<span class="patch-ground" aria-hidden="true"></span></div><p class="reward-message" role="status">Hooray, little gardener! You did it.</p><p class="reward-total">${state.garden.flowers} flowers grown in all</p>${pendingVisitorCue()}${pendingDecorationCue()}<div class="reward-actions"><button class="next-button" id="plant-next">Plant another garden <span aria-hidden="true">🌱</span></button><button class="rest-button" id="rest">Rest in the garden</button></div></section>`;
  document.getElementById('back').onclick=['number','count','quantity'].includes(rewardMode)?numberGarden:letterGarden;
  bindVisitorCue();
  document.getElementById('rest').onclick=home;
  const viewId=visitorViewId;
  document.getElementById('plant-next').onclick=()=>{if(viewId!==visitorViewId||mode!=='reward'||state.garden.patchFlowers!==5)return;if(decorationRewardsAvailable()&&state.decorationRewards)state.decorationRewards.patchEarned=false;if(rewardsAvailable()&&state.visitorRewards)state.visitorRewards.patchEarned=false;state.garden.patchFlowers=0;persist();mode=rewardMode;round();};
  window.scrollTo(0,0);
  if(announce){celebrate();speak('Hooray! Five flowers! You grew a beautiful garden. Well done, little gardener!','garden-complete');}
}
function celebrate(){const layer=document.createElement('div');layer.className='sparkles';layer.setAttribute('aria-hidden','true');layer.innerHTML=Array.from({length:16},()=>`<span class="spark" style="left:${Math.random()*100}%;animation-delay:${Math.random()*.5}s;color:${['#a5b974','#e6b45c','#c0a4cb','#e49c76'][Math.floor(Math.random()*4)]}">${Math.random()>.5?'✿':'★'}</span>`).join('');document.body.append(layer);setTimeout(()=>layer.remove(),2400);}
function explore(){const id=++letterRoundId;app.innerHTML=nav('Tap & explore')+`<section class="play-area"><div class="eyebrow">Bring your curiosity</div><h1>A picnic with the alphabet</h1><p class="play-sub">Tap a letter. Meet a picture pal.</p>${learningBuddy()}<div class="explore-banner" id="explore-banner" role="status" aria-live="polite"><span class="big-picture">🧺</span><strong>Who will you meet first?</strong></div><div class="explore-grid">${alphabet.map(x=>`<button class="explore-letter" data-letter="${x[0]}" aria-label="${x[0]} is for ${x[1]}"><span class="letters">${x[0]}${x[0].toLowerCase()}</span><span class="picture" aria-hidden="true">${x[2]}</span><span class="word">${x[1]}</span></button>`).join('')}</div></section>`;document.getElementById('back').onclick=letterGarden;app.querySelectorAll('[data-letter]').forEach(button=>button.onclick=()=>{if(mode!=='explore'||id!==letterRoundId)return;reactBuddy('happy');const item=alphabet.find(x=>x[0]===button.dataset.letter);if(!item)return;recordPractice('explore',item[0]);app.querySelector('.active')?.classList.remove('active');button.classList.add('active');document.getElementById('explore-banner').innerHTML=`<span class="big-picture">${item[2]}</span><strong>${item[0]} is for ${item[1]}!</strong>`;speak(`${item[0]} is for ${item[1]}.`,`explore-${item[0]}`);});window.scrollTo(0,0);speak('Welcome to the alphabet picnic. Tap a letter!','welcome');}
function updateSound(){const button=document.getElementById('sound');button.innerHTML=`<span aria-hidden="true">${state.preferences.sound?'♫':'♩'}</span><span class="sound-label">Sound ${state.preferences.sound?'on':'off'}</span>`;button.setAttribute('aria-label',state.preferences.sound?'Turn sound off':'Turn sound on');button.title=state.preferences.sound?'Sound on':'Sound off';button.setAttribute('aria-pressed',String(state.preferences.sound));}
document.getElementById('sound').onclick=()=>{state.preferences.sound=!state.preferences.sound;persist();updateSound();if(state.preferences.sound){if(target)speakPrompt();else speak('Sound is on. Let’s play!','sound-on');}else{stopAudio();if(mode==='number'&&target&&!answered)document.getElementById('feedback').textContent=numberPrompt();else if(mode==='find'&&target&&!answered)document.getElementById('feedback').textContent=`Find ${shown(target[0])}`;}toast(state.preferences.sound?'Sound on':'Sound off');};
document.getElementById('home').onclick=home;
document.getElementById('grownups').onclick=()=>{stopAudio();document.getElementById('number-range').value=String(state.preferences.numbers.max);document.getElementById('letter-set').value=state.preferences.letters.set;document.getElementById('case').value=state.preferences.letters.case;document.getElementById('custom-letters').value=state.preferences.letters.custom;document.getElementById('custom-wrap').hidden=state.preferences.letters.set!=='custom';prepareVoiceSettings();prepareNameSettings();prepareBackupSettings();preparePracticeSettings();settings.showModal();};
document.getElementById('clear-history').onclick=()=>{document.getElementById('confirm-clear-history').hidden=false;};
document.getElementById('cancel-clear-history').onclick=()=>{document.getElementById('confirm-clear-history').hidden=true;};
document.getElementById('confirm-clear-history-button').onclick=clearPracticeHistory;
document.getElementById('close-settings').onclick=()=>settings.close();
settings.onclose=clearBackupReview;
document.getElementById('download-backup').onclick=downloadBackup;
document.getElementById('share-backup').onclick=shareBackup;
document.getElementById('import-backup').onchange=event=>reviewBackup(event.target.files[0]);
document.getElementById('cancel-import').onclick=()=>{clearBackupReview();backupStatus('Import canceled. Your garden has not changed.');};
document.getElementById('confirm-import').onclick=replaceFromBackup;
document.getElementById('letter-set').onchange=event=>document.getElementById('custom-wrap').hidden=event.target.value!=='custom';
document.getElementById('child-name').oninput=updateNamePreview;
document.getElementById('save-settings').onclick=()=>{if(!updateNamePreview()){document.getElementById('child-name').focus();return;}const custom=[...new Set(document.getElementById('custom-letters').value.toUpperCase().replace(/[^A-Z]/g,''))].join('');if(document.getElementById('letter-set').value==='custom'&&custom.length<3){toast('Choose at least three different letters.');document.getElementById('custom-letters').focus();return;}const display=document.getElementById('child-name').value;if(display!==state.preferences.name?.display||(Object.hasOwn(state,'namePractice')&&!validNamePractice(state.namePractice)))delete state.namePractice;if(display)state.preferences.name={...record(state.preferences.name),display};else delete state.preferences.name;if(['recordings','device'].includes(document.getElementById('voice-mode').value))state.preferences.voiceMode=document.getElementById('voice-mode').value;else delete state.preferences.voiceMode;state.preferences.letters.set=document.getElementById('letter-set').value;state.preferences.letters.case=document.getElementById('case').value;state.preferences.letters.custom=custom;state.preferences.numbers.max=numberMax(Number(document.getElementById('number-range').value));persist();settings.close();if(mode==='name'||mode==='find'||mode==='match'||mode==='number'||mode==='count'||mode==='quantity')round();toast('Ready for a little learning!');};
document.getElementById('abandon-mission').onclick=()=>{const previous=state.mission;delete state.mission;if(!persist()){if(previous!==undefined)state.mission=previous;return;}missionRunning=false;settings.close();home();toast('Mission put away. Your flowers are still here.');};
document.getElementById('reset').onclick=()=>{state.garden.flowers=0;if(decorationRewardsAvailable()&&state.decorationRewards)state.decorationRewards.patchEarned=false;if(rewardsAvailable()&&state.visitorRewards)state.visitorRewards.patchEarned=false;state.garden.patchFlowers=0;persist();settings.close();home();toast('A fresh garden, ready to grow.');};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio();});
document.getElementById('test-sound').onclick=()=>{state.preferences.sound=true;persist();updateSound();previewVoice();};
persist();updateSound();home();

// Both buttons use the draft voice; Test sound also enables game sound.
document.getElementById('preview-voice').onclick=previewVoice;
document.getElementById('voice-mode').onchange=()=>{stopAudio();voiceStatus('Selection changed. Tap Try this voice or Test sound to preview; Ready to grow saves it.');};
