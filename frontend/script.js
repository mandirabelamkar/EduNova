const API_URL = '/api';
const apiEnabled = window.location.protocol !== 'file:';
const localStateKey = 'edunova-state-v2';
const sessionKey = 'edunova-user';
const defaultState = {
  user:{name:'Ananya',level:1,xp:0,coins:0,badges:0,streak:0},
  quests:{math:{progress:0,goal:5,reward:20,claimed:false},reading:{progress:0,goal:10,reward:15,claimed:false},subject:{progress:0,goal:1,reward:25,claimed:false}},
  quiz:{subject:'math',question:1,total:50,correct:0,answered:false}
};

const questionBank = {
  math: [
    ['NUMBERS', 'Which number is the greatest?', '24, 42, 14, or 32?', ['14', '24', '32', '42'], 3, '42 is the greatest number.'],
    ['GEOMETRY', 'How many sides does a triangle have?', 'Count the straight sides.', ['2', '3', '4', '5'], 1, 'A triangle has three sides.'],
    ['FRACTIONS', 'Which answer unlocks the next path?', '2/5 + 1/10 = ?', ['3/10', '1/2', '1/10', '4/10'], 1, '2/5 is 4/10, so the answer is 5/10 or 1/2.'],
    ['MULTIPLICATION', 'What is 7 x 6?', 'Multiply the two numbers.', ['36', '40', '42', '48'], 2, 'Seven groups of six make 42.'],
    ['LOGIC', 'What comes next in this pattern?', '2, 4, 6, 8, ...', ['9', '10', '11', '12'], 1, 'The pattern adds 2 each time, so the answer is 10.']
  ],
  science: [
    ['PLANETS', 'Which planet is known as the Red Planet?', 'Choose the correct planet.', ['Earth', 'Mars', 'Jupiter', 'Venus'], 1, 'Mars looks red because of iron minerals.'],
    ['PLANTS', 'What do plants need to make food?', 'Choose the best answer.', ['Sunlight', 'Plastic', 'Sand', 'Metal'], 0, 'Plants use sunlight, water, and carbon dioxide.'],
    ['BODY', 'Which part of the body helps us breathe?', 'Choose the correct organ.', ['Heart', 'Lungs', 'Stomach', 'Brain'], 1, 'The lungs take oxygen from the air.'],
    ['MATTER', 'Water changes into vapor when it is?', 'Choose the correct change.', ['Frozen', 'Heated', 'Painted', 'Covered'], 1, 'Heat changes liquid water into water vapor.'],
    ['ENERGY', 'Which is a source of clean energy?', 'Choose the renewable source.', ['Coal', 'Sunlight', 'Plastic', 'Petrol'], 1, 'Sunlight is a renewable source of energy.']
  ],
  english: [
    ['VOCABULARY', 'Choose the opposite of bright.', 'Which word has the opposite meaning?', ['Shiny', 'Clever', 'Dark', 'Quick'], 2, 'Dark is the opposite of bright.'],
    ['GRAMMAR', 'Which word is a noun?', 'Find the naming word.', ['Run', 'Beautiful', 'School', 'Quickly'], 2, 'School is a noun because it names a place.'],
    ['WORDS', 'Choose the plural of child.', 'Which word means more than one child?', ['Childs', 'Children', 'Childes', 'Child'], 1, 'Children is the plural of child.'],
    ['GRAMMAR', 'Complete the sentence: She ___ reading.', 'Choose the correct verb.', ['is', 'are', 'am', 'be'], 0, 'She is reading is correct.'],
    ['RHYMES', 'Which word rhymes with day?', 'Choose the rhyming word.', ['Night', 'Play', 'Book', 'Sun'], 1, 'Day and play end with the same sound.']
  ],
  social: [
    ['INDIA', 'What is the capital of India?', 'Choose the correct city.', ['Mumbai', 'New Delhi', 'Pune', 'Jaipur'], 1, 'New Delhi is the capital city of India.'],
    ['DIRECTIONS', 'Which direction does the sun rise from?', 'Choose the correct direction.', ['West', 'North', 'East', 'South'], 2, 'The sun rises in the east.'],
    ['COMMUNITY', 'Who leads a village council?', 'Choose the local leader.', ['Sarpanch', 'Pilot', 'Doctor', 'Coach'], 0, 'The Sarpanch leads the village council.'],
    ['MAPS', 'What do we use to show places?', 'Choose the helpful tool.', ['Map', 'Clock', 'Brush', 'Bell'], 0, 'A map shows places and their locations.'],
    ['FESTIVALS', 'Which is a national festival of India?', 'Choose the correct festival.', ['Diwali', 'Picnic Day', 'Sports Day', 'Library Day'], 0, 'Diwali is widely celebrated in India.']
  ],
  marathi: [
    ['शब्दसंग्रह', '“आई” या शब्दाचा अर्थ काय?', 'योग्य अर्थ निवडा.', ['Mother', 'Father', 'Brother', 'Sister'], 0, 'आई म्हणजे Mother.'],
    ['विरुद्धार्थी', '“मोठा” या शब्दाचा विरुद्धार्थी शब्द कोणता?', 'योग्य शब्द निवडा.', ['लहान', 'उंच', 'जाड', 'सुंदर'], 0, 'मोठा याचा विरुद्धार्थी शब्द लहान आहे.'],
    ['वर्णमाला', 'मराठी वर्णमालेतील पहिले अक्षर कोणते?', 'योग्य अक्षर निवडा.', ['अ', 'क', 'म', 'श'], 0, 'अ हे पहिले अक्षर आहे.'],
    ['शब्दसंग्रह', '“पाणी” कशासाठी वापरतो?', 'योग्य उत्तर निवडा.', ['पिण्यासाठी', 'उडण्यासाठी', 'लिहिण्यासाठी', 'झोपण्यासाठी'], 0, 'पाणी पिण्यासाठी वापरतो.'],
    ['अनेकवचन', '“फूल” या शब्दाचे अनेकवचन काय?', 'योग्य शब्द निवडा.', ['फुले', 'फूला', 'फुली', 'फुल'], 0, 'फूल या शब्दाचे अनेकवचन फुले आहे.']
  ],
  gk: [
    ['CALENDAR', 'How many days are in a week?', 'Choose the correct count.', ['5', '6', '7', '8'], 2, 'A week has seven days.'],
    ['ANIMALS', 'Which animal is known as the king of the jungle?', 'Choose the animal.', ['Tiger', 'Lion', 'Elephant', 'Horse'], 1, 'The lion is commonly called the king of the jungle.'],
    ['NATURE', 'How many colors are in a rainbow?', 'Choose the correct number.', ['5', '6', '7', '8'], 2, 'A rainbow has seven colors.'],
    ['SHAPES', 'Which shape has no corners?', 'Choose the shape.', ['Square', 'Triangle', 'Circle', 'Rectangle'], 2, 'A circle has no corners.'],
    ['SPACE', 'Which star gives Earth light?', 'Choose the correct star.', ['Moon', 'Sun', 'Mars', 'Polaris'], 1, 'The Sun gives Earth light and heat.']
  ]
};

function addQuestions(subject, label, questions){
  const bank = questionBank[subject];
  while(bank.length < 50){
    const number = bank.length + 1;
    const base = questions[(number - 1) % questions.length];
    const choices = base[3].slice();
    const correct = base[4];
    bank.push([`${label} · BONUS ${number}`, `${base[1]} (Challenge ${number})`, base[2], choices, correct, base[5]]);
  }
}

addQuestions('math', 'MATHEMATICS', questionBank.math.slice());
addQuestions('science', 'SCIENCE', [
  ['SCIENCE', 'Which natural source helps plants grow?', 'Choose the best answer.', ['Sunlight', 'Plastic', 'Metal', 'Glass'], 0, 'Plants need sunlight to grow.'],
  ['SCIENCE', 'Which organ helps us breathe?', 'Choose the correct organ.', ['Lungs', 'Heart', 'Bone', 'Skin'], 0, 'The lungs help us breathe.'],
  ['SCIENCE', 'Which material is attracted to a magnet?', 'Choose the magnetic material.', ['Iron', 'Wood', 'Paper', 'Glass'], 0, 'Magnets attract iron.'],
  ['SCIENCE', 'What force pulls objects toward Earth?', 'Choose the correct force.', ['Gravity', 'Light', 'Sound', 'Heat'], 0, 'Gravity pulls objects toward Earth.'],
  ['SCIENCE', 'Which state of matter keeps its shape?', 'Choose the correct state.', ['Solid', 'Liquid', 'Gas', 'Vapor'], 0, 'A solid keeps its own shape.']
]);
addQuestions('english', 'ENGLISH', [
  ['ENGLISH', 'Choose the plural of book.', 'Choose the correct word.', ['Books', 'Bookes', 'Book', 'Booking'], 0, 'Books is the plural form.'],
  ['ENGLISH', 'Choose the past tense of eat.', 'Choose the correct word.', ['Ate', 'Eated', 'Eating', 'Eats'], 0, 'Ate is the past tense of eat.'],
  ['ENGLISH', 'Choose the opposite of hot.', 'Choose the correct word.', ['Cold', 'Warm', 'Fast', 'Bright'], 0, 'Cold is the opposite of hot.'],
  ['ENGLISH', 'Choose the synonym of small.', 'Choose the matching word.', ['Tiny', 'Huge', 'Loud', 'Late'], 0, 'Tiny means small.'],
  ['ENGLISH', 'Choose the correct article: ___ apple.', 'Choose the correct word.', ['An', 'A', 'Thee', 'At'], 0, 'An apple is correct.']
]);
addQuestions('social', 'SOCIAL SCIENCE', [
  ['SOCIAL', 'Which tool helps us find directions?', 'Choose the correct tool.', ['Compass', 'Clock', 'Brush', 'Bell'], 0, 'A compass helps find directions.'],
  ['SOCIAL', 'Which place treats sick people?', 'Choose the correct place.', ['Hospital', 'Library', 'Museum', 'Stadium'], 0, 'A hospital treats sick people.'],
  ['SOCIAL', 'Which vehicle travels on railway tracks?', 'Choose the correct vehicle.', ['Train', 'Bus', 'Boat', 'Bicycle'], 0, 'A train travels on railway tracks.'],
  ['SOCIAL', 'Which is a natural resource?', 'Choose the resource from nature.', ['Water', 'Computer', 'Chair', 'Pencil'], 0, 'Water is a natural resource.'],
  ['SOCIAL', 'Which direction is opposite to north?', 'Choose the correct direction.', ['South', 'East', 'West', 'Northeast'], 0, 'South is opposite to north.']
]);
addQuestions('marathi', 'MARATHI', [
  ['मराठी', '“आकाश” याचा अर्थ काय?', 'योग्य अर्थ निवडा.', ['Sky', 'Water', 'Earth', 'Fire'], 0, 'आकाश म्हणजे Sky.'],
  ['मराठी', '“पुस्तक” याचा अर्थ काय?', 'योग्य अर्थ निवडा.', ['Book', 'Pen', 'Chair', 'Door'], 0, 'पुस्तक म्हणजे Book.'],
  ['मराठी', '“शाळा” याचा अर्थ काय?', 'योग्य अर्थ निवडा.', ['School', 'House', 'Road', 'Garden'], 0, 'शाळा म्हणजे School.'],
  ['मराठी', '“झाड” याचा अर्थ काय?', 'योग्य अर्थ निवडा.', ['Tree', 'Flower', 'Fruit', 'Bird'], 0, 'झाड म्हणजे Tree.'],
  ['मराठी', '“नदी” याचा अर्थ काय?', 'योग्य अर्थ निवडा.', ['River', 'Mountain', 'Cloud', 'Rain'], 0, 'नदी म्हणजे River.']
]);
addQuestions('gk', 'GENERAL KNOWLEDGE', [
  ['GK', 'Which is the fastest land animal?', 'Choose the animal.', ['Cheetah', 'Elephant', 'Turtle', 'Cow'], 0, 'The cheetah is the fastest land animal.'],
  ['GK', 'How many months are in a year?', 'Choose the correct number.', ['12', '10', '11', '13'], 0, 'A year has twelve months.'],
  ['GK', 'Which instrument shows time?', 'Choose the correct object.', ['Clock', 'Ruler', 'Compass', 'Thermometer'], 0, 'A clock shows the time.'],
  ['GK', 'Which fruit is yellow and curved?', 'Choose the fruit.', ['Banana', 'Apple', 'Grape', 'Orange'], 0, 'A banana is usually yellow and curved.'],
  ['GK', 'How many legs does a spider have?', 'Choose the correct number.', ['8', '6', '10', '12'], 0, 'A spider has eight legs.']
]);

function normalizeState(state){
  const account = state?.user ? state : state?.users?.[localStorage.getItem(sessionKey) || 'guest@edunova.local'];
  if(!account?.user) return structuredClone(defaultState);
  return {
    user:{...defaultState.user,...account.user},
    quests:{...structuredClone(defaultState.quests),...(account.quests||{})},
    quiz:{...defaultState.quiz,...(account.quiz||{})}
  };
}

function getSubject(){
  return new URLSearchParams(window.location.search).get('subject') || window.appState?.quiz?.subject || 'math';
}

function getQuestions(){ return questionBank[getSubject()] || questionBank.math; }

async function getAppState(){
  try{
    if(!apiEnabled) throw new Error('Direct file mode');
    const userKey = localStorage.getItem(sessionKey) || 'guest@edunova.local';
    const response = await fetch(`${API_URL}/state`, { headers: {'x-user': userKey} });
    if(!response.ok) throw new Error('API unavailable');
    const state=normalizeState(await response.json());
    localStorage.setItem(localStateKey,JSON.stringify(state));
    return state;
  }catch(error){
    const saved=localStorage.getItem(localStateKey);
    return saved?normalizeState(JSON.parse(saved)):structuredClone(defaultState);
  }
}

async function saveAppState(update){
  let state;
  try{
    if(!apiEnabled) throw new Error('Direct file mode');
    const userKey = localStorage.getItem(sessionKey) || 'guest@edunova.local';
    const response = await fetch(`${API_URL}/state`, { method:'POST', headers:{'Content-Type':'application/json','x-user':userKey}, body:JSON.stringify(update) });
    if(!response.ok) throw new Error('API unavailable');
    state=await response.json();
  }catch(error){
    const saved=localStorage.getItem(localStateKey);
    state=saved?normalizeState(JSON.parse(saved)):structuredClone(defaultState);
    state.user={...state.user,...(update.user||{})};
    state.quests={...state.quests,...(update.quests||{})};
    state.quiz={...state.quiz,...(update.quiz||{})};
  }
  localStorage.setItem(localStateKey,JSON.stringify(state));
  window.appState = state;
  renderAppState(state);
  return state;
}

function renderAppState(state){
  const user = state.user;
  const setText = (id,value) => { const element=document.getElementById(id); if(element) element.textContent=value; };
  document.querySelectorAll('[data-user-name]').forEach(element=>{ element.textContent=user.name; });
  document.querySelectorAll('[data-user-level]').forEach(element=>{ element.textContent=user.level; });
  setText('profile-xp',user.xp); setText('profile-streak',user.streak); setText('profile-badges',user.badges);
  setText('quiz-streak',user.streak);
  setText('coin-count',user.coins); setText('dashboard-xp',user.xp); setText('dashboard-level',user.level); setText('dashboard-badges',user.badges); setText('dashboard-streak',user.streak); setText('xp-count',user.xp);
  const levelPercent=Math.min(100,Math.round((user.xp%600)/600*100));
  setText('level-percent',`${levelPercent}%`);
  const xpBar=document.getElementById('xp-bar'); if(xpBar) xpBar.style.width=`${levelPercent}%`;
  document.querySelectorAll('[data-quest]').forEach(card=>{
    const quest=state.quests[card.dataset.quest]; if(!quest) return;
    const percent=Math.min(100,Math.round(quest.progress/quest.goal*100));
    const bar=card.querySelector('.progress span'); const detail=card.querySelector('.quest-card-progress small');
    if(bar) bar.style.width=`${percent}%`; if(detail) detail.textContent=quest.progress>=quest.goal?'Complete':`${quest.progress} of ${quest.goal} complete`;
    const button=card.querySelector('.quest-action'); if(button&&quest.claimed){ button.textContent='✓ Claimed'; button.disabled=true; card.classList.add('claimed'); }
  });
  const streakValue=document.getElementById('progress-streak'); if(streakValue) streakValue.textContent=`${user.streak} day${user.streak===1?'':'s'} 🔥`;
  const todayIndex=(new Date().getDay()+6)%7; const activeDays=Math.min(7,user.streak||0); document.querySelectorAll('.streak-calendar span').forEach((day,index)=>{ day.classList.toggle('today',index===todayIndex); const marker=day.querySelector('b'); if(marker) marker.textContent=index>=todayIndex-activeDays+1&&index<=todayIndex?'✓':'0'; });
  renderQuizQuestion(state);
}

function showXpToast(amount,levelUp){
  const toast=document.createElement('div'); toast.className=`xp-toast${levelUp?' level-toast':''}`; toast.textContent=levelUp?`🎉 Level ${levelUp} unlocked!`:`✨ +${amount} XP`; document.body.appendChild(toast); window.setTimeout(()=>toast.remove(),1800);
  burstConfetti();
}

function burstConfetti(){
  const colors=['#087f78','#e18b23','#2774e6','#e66e4c','#18a653'];
  for(let index=0;index<24;index+=1){
    const piece=document.createElement('i'); piece.className='confetti-piece'; piece.style.left=`${45+Math.random()*10}%`; piece.style.background=colors[index%colors.length]; piece.style.setProperty('--x',`${(Math.random()-.5)*360}px`); piece.style.setProperty('--y',`${100+Math.random()*260}px`); piece.style.animationDelay=`${Math.random()*.12}s`; document.body.appendChild(piece); window.setTimeout(()=>piece.remove(),1400);
  }
}

function renderQuizQuestion(state){
  const quiz=document.querySelector('.question-card'); if(!quiz) return;
  const questions=getQuestions(); const index=Math.max(0,Math.min(questions.length-1,(state.quiz.question||1)-1)); const question=questions[index];
  const setText=(id,value)=>{ const element=document.getElementById(id); if(element) element.textContent=value; };
  setText('quiz-topic',question[0]); setText('question-label',`QUEST ${String(index+1).padStart(2,'0')}`); setText('question-prompt',question[1]); setText('question-text',question[2]); setText('quiz-counter',`${index+1} / ${questions.length}`);
  const progress=document.getElementById('quiz-progress-bar'); if(progress) progress.style.width=`${(index+1)/questions.length*100}%`;
  document.querySelectorAll('.answer').forEach((button,choiceIndex)=>{ button.classList.remove('selected','correct'); button.disabled=false; const choice=button.querySelector('span'); if(choice) choice.textContent=question[3][choiceIndex]; });
  const result=document.getElementById('result'); if(result){ result.style.display='none'; result.textContent=''; if(state.quiz.answered){ const correctButton=document.querySelector(`.answer[data-choice="${question[4]}"]`); if(correctButton) correctButton.classList.add('selected','correct'); document.querySelectorAll('.answer').forEach(button=>{button.disabled=true;}); result.style.display='block'; result.innerHTML=`⭐ Great! Correct Answer<br><b>+10 XP</b><br><small>${question[5]}</small>`; } }
}

async function loadAppState(){
  try{
    window.appState=await getAppState();
    const subject=new URLSearchParams(window.location.search).get('subject');
    if(subject&&questionBank[subject]&&window.appState.quiz.subject!==subject) window.appState=await saveAppState({quiz:{subject,question:1,total:questionBank[subject].length,answered:false}});
    else renderAppState(window.appState);
  }catch(error){ console.warn(error.message); }
}

async function login(){
  const email=document.getElementById('email').value.trim(); const password=document.getElementById('password').value.trim();
  if(!email||!password){ alert('Please enter your email/mobile and password.'); return; }
  try{
    const response=await fetch(`${API_URL}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
    const result=await response.json(); if(!response.ok) throw new Error(result.error||'Login failed');
    localStorage.setItem(sessionKey,result.email); localStorage.setItem(localStateKey,JSON.stringify({user:result.user,quests:result.quests,quiz:result.quiz})); window.location.href='dashboard.html';
  }catch(error){ alert(error.message); }
}

async function register(){
  const name=document.getElementById('register-name').value.trim(); const email=document.getElementById('register-email').value.trim(); const password=document.getElementById('register-password').value.trim();
  if(!name||!email||!password){ alert('Please complete all fields.'); return; }
  try{
    const response=await fetch(`${API_URL}/auth/register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password})});
    const result=await response.json(); if(!response.ok) throw new Error(result.error||'Registration failed');
    localStorage.setItem(sessionKey,result.email); localStorage.setItem(localStateKey,JSON.stringify({user:result.user,quests:result.quests,quiz:result.quiz})); window.location.href='dashboard.html';
  }catch(error){ alert(error.message); }
}

async function guestLogin(){
  localStorage.setItem(sessionKey,'guest@edunova.local'); window.location.href='dashboard.html';
}

async function claimDailyReward(button){
  button.disabled=true; button.textContent='✓ Reward claimed';
  if(window.appState) await saveAppState({user:{coins:window.appState.user.coins+15}});
}

async function claimQuest(button,reward){
  const card=button.closest('[data-quest]'); const item=button.closest('.quest-item'); if((!item&&!card)||button.disabled) return;
  const key=card?.dataset.quest; const current=window.appState?.quests?.[key]; if(key&&current?.claimed) return;
  button.disabled=true; button.textContent='Saving...';
  if(key&&current){ try{ const previousLevel=window.appState.user.level; const nextXp=window.appState.user.xp+reward; const nextLevel=Math.floor(nextXp/600)+1; await saveAppState({user:{xp:nextXp,level:nextLevel},quests:{[key]:{...current,claimed:true}}}); showXpToast(reward,nextLevel>previousLevel?nextLevel:null); }catch(error){ button.disabled=false; button.textContent='Claim reward'; console.warn(error.message); } }
}

function checkAnswer(button){
  const state=window.appState; if(!state) return; const question=getQuestions()[(state.quiz.question||1)-1]; const correct=Number(button.dataset.choice)===question[4];
  document.querySelectorAll('.answer').forEach(answer=>answer.classList.remove('selected','correct')); button.classList.add('selected');
  const result=document.getElementById('result'); result.style.display='block';
  if(correct){ button.classList.add('correct'); document.querySelectorAll('.answer').forEach(answer=>{answer.disabled=true;}); result.innerHTML=`⭐ Great! Correct Answer<br><b>+10 XP</b><br><small>${question[5]}</small>`; if(!state.quiz.answered){ const nextXp=state.user.xp+10; const nextLevel=Math.floor(nextXp/600)+1; saveAppState({user:{xp:nextXp,level:nextLevel},quiz:{correct:state.quiz.correct+1,answered:true}}).then(()=>showXpToast(10,nextLevel>state.user.level?nextLevel:null)).catch(error=>console.warn(error.message)); } }
  else{ const correctButton=document.querySelector(`.answer[data-choice="${question[4]}"]`); if(correctButton) correctButton.classList.add('correct'); result.innerHTML=`🔎 Not quite. The correct answer is <b>${question[3][question[4]]}</b>.<br><small>${question[5]}</small>`; }
}

function showExplanation(){ const state=window.appState; if(!state) return; const question=getQuestions()[(state.quiz.question||1)-1]; const result=document.getElementById('result'); result.style.display='block'; result.innerHTML=`💡 Correct answer: <b>${question[3][question[4]]}</b><br><small>${question[5]}</small>`; }

async function askAiCoach(){
  const state=window.appState; if(!state) return;
  const question=getQuestions()[(state.quiz.question||1)-1]; const coach=document.getElementById('ai-coach'); if(!coach) return;
  const answer=question[3][question[4]]; const paragraph=coach.querySelector('p'); paragraph.textContent='AI Coach is thinking...'; coach.hidden=false;
  try{
    const response=await fetch(`${API_URL}/ai/coach`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subject:getSubject(),question:question[1],choices:question[3],correctAnswer:answer,explanation:question[5]})});
    const result=await response.json(); if(!response.ok) throw new Error(result.error||'AI service unavailable');
    paragraph.textContent=result.answer;
  }catch(error){ paragraph.innerHTML=`Think about the key idea. The best answer is <b>${answer}</b>. ${question[5]} Try explaining it in your own words!`; }
}

function showAiPlan(){
  const state=window.appState; const plan=document.getElementById('ai-plan-text'); if(!state||!plan) return;
  const weakQuest=Object.values(state.quests||{}).sort((first,second)=>(first.progress/first.goal)-(second.progress/second.goal))[0];
  const focus=weakQuest===state.quests?.math?'math practice':weakQuest===state.quests?.reading?'reading focus':'a new subject';
  plan.textContent=`Today: complete one ${focus} quest, solve 5 questions, and finish with an AI Coach review for +35 XP.`;
}

function generateAiQuiz(){
  const subject=document.getElementById('ai-subject')?.value||'math';
  const state=normalizeState(window.appState||defaultState);
  localStorage.setItem(localStateKey,JSON.stringify({...state,quiz:{...state.quiz,subject,question:1,total:50,answered:false}}));
  window.location.href=`quiz.html?subject=${subject}&ai=generated`;
}

async function nextQuestion(){ if(!window.appState) return; const questions=getQuestions(); const next=(window.appState.quiz.question||1)>=questions.length?1:window.appState.quiz.question+1; await saveAppState({quiz:{subject:getSubject(),question:next,total:questions.length,answered:false}}); }

function speakQuestion(){ if('speechSynthesis' in window){ const questions=getQuestions(); const question=window.appState?questions[(window.appState.quiz.question||1)-1]:questions[0]; speechSynthesis.speak(new SpeechSynthesisUtterance(`${question[1]} ${question[2]}`)); } else alert('Audio is not supported in this browser.'); }

document.addEventListener('DOMContentLoaded',loadAppState);
