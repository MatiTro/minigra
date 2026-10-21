(function(){
'use strict';
const C=WarehouseCore,W=WarehouseWorld,P=WarehousePhysics,S=WarehouseScenes,A=WarehouseArt,F=WarehouseFX,$=id=>document.getElementById(id);
const canvas=$('gameCanvas'),ctx=canvas.getContext('2d'),cover=$('coverCanvas'),cc=cover.getContext('2d');
const VIEW_W=1080,VIEW_H=690,DPR=Math.min(2,window.devicePixelRatio||1);
canvas.width=VIEW_W*DPR;canvas.height=VIEW_H*DPR;
const assetProgress=new Set(),ASSET_COUNT=8;
function assetReady(name){assetProgress.add(name);const n=assetProgress.size;$('assetLoading').textContent=n<ASSET_COUNT?'Przygotowanie magazynu… '+Math.round(n/ASSET_COUNT*100)+'%':'Gotowe do zmiany';$('assetLoading').hidden=n>=ASSET_COUNT;$('newBtn').disabled=n<ASSET_COUNT;$('continueBtn').disabled=n<ASSET_COUNT;}
const portraits=typeof Image!=='undefined'?new Image():null;
if(portraits){portraits.onload=()=>{assetReady('portraits');drawCover();};portraits.onerror=()=>assetReady('portraits');portraits.src=window.WarehouseAssets?.portraits||'';if(portraits.complete&&portraits.width)assetReady('portraits');}
const characterSprites=typeof Image!=='undefined'?new Image():null;
if(characterSprites){characterSprites.onload=()=>{A.setCharacterSprites(characterSprites);assetReady('directions');drawCover();};characterSprites.src=window.WarehouseAssets?.directions||'';characterSprites.onerror=()=>assetReady('directions');if(characterSprites.complete&&characterSprites.width){A.setCharacterSprites(characterSprites);assetReady('directions');}}
ctx.imageSmoothingEnabled=true;cc.imageSmoothingEnabled=true;
const walkSprites=typeof Image!=='undefined'?new Image():null;
if(walkSprites){walkSprites.onload=()=>{A.setWalkSprites(walkSprites);assetReady('walk');};walkSprites.onerror=()=>assetReady('walk');walkSprites.src=window.WarehouseAssets?.walk||'';if(walkSprites.complete&&walkSprites.width){A.setWalkSprites(walkSprites);assetReady('walk');}}
const propsImage=typeof Image!=='undefined'?new Image():null;
if(propsImage){propsImage.onload=()=>{A.setPropsImage(propsImage,window.WarehouseAssets.propMeta);assetReady('props');for(const key in backgrounds)delete backgrounds[key];drawCover();};propsImage.src=window.WarehouseAssets?.props||'';propsImage.onerror=()=>assetReady('props');if(propsImage.complete&&propsImage.width){A.setPropsImage(propsImage,window.WarehouseAssets.propMeta);assetReady('props');}}
const truckImage=typeof Image!=='undefined'?new Image():null;
if(truckImage){truckImage.onload=()=>{A.setTruckImage(truckImage,window.WarehouseAssets.truckMeta);assetReady('truck');for(const key in backgrounds)delete backgrounds[key];drawCover();};truckImage.onerror=()=>assetReady('truck');truckImage.src=window.WarehouseAssets?.truck||'';if(truckImage.complete&&truckImage.width){A.setTruckImage(truckImage,window.WarehouseAssets.truckMeta);assetReady('truck');}}
const peopleImage=typeof Image!=='undefined'?new Image():null;
if(peopleImage){peopleImage.onload=()=>{A.setNPCSprites(peopleImage);assetReady('people');};peopleImage.onerror=()=>assetReady('people');peopleImage.src=window.WarehouseAssets?.people||'';if(peopleImage.complete&&peopleImage.width){A.setNPCSprites(peopleImage);assetReady('people');}}
const contactsImage=typeof Image!=='undefined'?new Image():null;
if(contactsImage){contactsImage.onload=()=>assetReady('contacts');contactsImage.onerror=()=>assetReady('contacts');contactsImage.src=window.WarehouseAssets?.contacts||'';if(contactsImage.complete&&contactsImage.width)assetReady('contacts');}
const emptyForkliftImage=typeof Image!=='undefined'?new Image():null;
if(emptyForkliftImage){emptyForkliftImage.onload=()=>{A.setEmptyForkliftImage(emptyForkliftImage);assetReady('emptyFork');};emptyForkliftImage.onerror=()=>assetReady('emptyFork');emptyForkliftImage.src=window.WarehouseAssets?.emptyFork||'';if(emptyForkliftImage.complete&&emptyForkliftImage.width){A.setEmptyForkliftImage(emptyForkliftImage);assetReady('emptyFork');}}
let g=null,active=false,modalOpen=false,modalActions={},dialogAdvance=null,keys={},now=0,last=0,saveClock=0,toastUntil=0,focusTarget=null,camera={x:0,y:0},cameraSnap=true,sound=true,audio=null,practice=false,cinematic=null,cinematicStart=0,frameCounter=0,walkingMotion=false;
let engineNodes=null,lastFoot=0,lastReverse=0,pendingSceneTitle=false,sceneAfter=null,sceneLineKey=null,scenePhoneWho=null;
F.configure(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches||false);
const NAMES={wojtek:'Wojtek',leader:'Lider',guard:'Ochrona',marysia:'Marysia',bhp:'Specjalista BHP',jarek:'Jarek'};
const backgrounds={};
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const time=s=>{s=Math.max(0,Math.ceil(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');};
function tone(f=440,d=.08,type='sine',vol=.045){if(!sound)return;try{if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),v=audio.createGain();o.type=type;o.frequency.value=f;v.gain.setValueAtTime(vol,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(v);v.connect(audio.destination);o.start();o.stop(audio.currentTime+d);}catch{sound=false;}}
function engineTick(){
 if(!sound||!audio)return;
 try{
  if(!engineNodes){const o=audio.createOscillator(),sub=audio.createOscillator(),filter=audio.createBiquadFilter(),gain=audio.createGain();o.type='triangle';sub.type='sine';filter.type='lowpass';filter.frequency.value=420;gain.gain.value=0;o.connect(filter);sub.connect(filter);filter.connect(gain);gain.connect(audio.destination);o.start();sub.start();engineNodes={o,sub,gain};}
  const moving=active&&g&&!modalOpen&&!g.failed&&!g.done&&g.mode!=='foot',v=moving?Math.abs(actor().v):0;
  const gain=moving?.012+v*.00018:active&&g&&!modalOpen&&g.world==='warehouse'?.003:0;
  engineNodes.gain.gain.setTargetAtTime(gain,audio.currentTime,.12);engineNodes.o.frequency.setTargetAtTime((g?.mode==='fork'?95:47)+v*.9,audio.currentTime,.1);engineNodes.sub.frequency.setTargetAtTime(38+v*.3,audio.currentTime,.1);
  if(moving&&actor().v< -8&&now-lastReverse>1.1){lastReverse=now;tone(710,.11,'sine',.022);}
  if(active&&g&&walkingMotion&&!modalOpen&&now-lastFoot>.27){lastFoot=now;tone(170+Math.sin(now*4)*25,.035,'triangle',.013);}
 }catch{}
}
function updateSteps(){
 if(!g)return;let steps=[];const st=g.stage,p=g.flags.parking||{};
 if(g.mission===0||g.mission===2)steps=[['Właściwa rampa',(p.distance??999)<25],['Równe ustawienie',(p.alignment??9)<.15],['Hamulec przez 2 sekundy',g.dockHold>=2]];
 if(g.mission===1)steps=[['Rozładunek i NI · '+Math.min(3,g.progress)+'/3',g.progress>=3],['Chemia w magazynku',g.stage==='returnLeader'||g.done],['Powrót do Lidera',g.done]];
 if(g.mission===3)steps=[['Kartony na palecie · '+g.boxes+'/6',g.boxes>=6],['Drobnica i przyjęcie',['printLabels','deliverLabels'].includes(st)||g.done],['Etykiety na właściwej palecie',g.done]];
 if(g.mission===4)steps=[['Potwierdzenie planu',!!g.flags.plan],['Palety do bufora · '+g.progress+'/5',g.progress>=5],...(g.flags.extraMail?[['Dodatkowa wiadomość',!!g.flags.cartonDone]]:[]),['Powrót do biura',g.done]];
 if(g.mission===5){const n={toCTP:0,return:1,load:2,callJarek:3,waitBDO:4,bdo:4,printBDO:4,deliverBDO:5}[st]||0;steps=[['Dostawa i zwrot CTP',n>=2],['Załadunek Polimeru · '+(g.flags.loaded||0)+'/2',n>=3],['Telefon i wydruk BDO',n>=5],['Dokument u kierowcy',g.done]];}
 let current=false;$('missionSteps').innerHTML=steps.map(([label,done])=>{const next=!done&&!current;if(next)current=true;return '<li class="'+(done?'done':next?'current':'')+'"><i>'+(done?'✓':next?'•':'')+'</i>'+esc(label)+'</li>';}).join('');
}
function sceneTitle(){const m=C.MISSIONS[g.mission];$('sceneTransition').innerHTML='<small>ROZDZIAŁ '+m.chapter+' / MISJA '+(g.mission%2+1)+'</small><b>'+esc(m.title)+'</b><span>'+esc(m.subtitle)+'</span>';$('sceneTransition').className='scene-transition';requestAnimationFrame(()=>{$('sceneTransition').className='scene-transition visible';});}
function chime(){tone(660,.1);setTimeout(()=>tone(880,.16),110);}
function clearKeys(){keys={};document.querySelectorAll('.held').forEach(x=>x.classList.remove('held'));}
function show(html,actions={},wide=false){closeScene();modalOpen=true;clearKeys();$('modal').hidden=false;$('modalContent').className='modal-content'+(wide?' wide':'');$('modalContent').innerHTML=html;$('modalContent').style.animation='none';requestAnimationFrame(()=>{$('modalContent').style.animation='';});modalActions=actions;dialogAdvance=null;requestAnimationFrame(()=>{$('modalContent').querySelector('button')?.focus({preventScroll:true});});}
function hide(){closeScene();modalOpen=false;$('modal').hidden=true;modalActions={};dialogAdvance=null;clearKeys();canvas.focus({preventScroll:true});save();if(g?.flags.migrated){delete g.flags.migrated;toast('Nowa mapa: bieżąca misja zaczyna się od początku. Ukończone rozdziały zachowane.',6);}if(pendingSceneTitle&&g&&!cinematic){pendingSceneTitle=false;sceneTitle();}}
function button(label,act='close',cls='primary'){return '<button class="'+cls+'" data-act="'+act+'">'+label+'</button>';}
function toast(s,d=3){$('toast').textContent=s;$('toast').hidden=false;toastUntil=now+d;}
function drawPortrait(who,id='scenePortrait'){
 const pc=$(id).getContext('2d'),w=pc.canvas.width,h=pc.canvas.height;
 pc.imageSmoothingEnabled=true;
 A.rect(pc,0,0,w,h,A.grad(pc,0,0,w,h,['#e4eff4','#c1d8e2']));
 if(portraits&&portraits.complete&&portraits.width&&['wojtek','leader'].includes(who)){
  const half=portraits.width/2,idx=who==='leader'?1:0;
  pc.drawImage(portraits,idx*half+half*.075,0,half*.85,portraits.height,0,0,w,h);
 }else if(contactsImage?.complete&&contactsImage.width&&['marysia','jarek'].includes(who)){const half=contactsImage.width/2,idx=who==='jarek'?1:0;pc.drawImage(contactsImage,idx*half+half*.055,0,half*.89,contactsImage.height,0,0,w,h);}else A.portrait(pc,who);
}
function closeScene(){S.clear();sceneAfter=null;sceneLineKey=null;scenePhoneWho=null;$('sceneLayer').hidden=true;}
function nextScene(){
 const state=S.get();if(!state)return;
 if(state.phase==='ringing'){S.answer();updateSceneUI();return;}
 if(S.advance()){const after=sceneAfter;closeScene();if(after)after();else hide();}else updateSceneUI();
}
function dialogue(lines,after=hide,options={}){
 closeScene();sceneAfter=after;S.begin(g,lines,options);modalOpen=true;clearKeys();$('modal').hidden=true;$('sceneLayer').hidden=false;modalActions={next:nextScene,answer:nextScene};dialogAdvance=nextScene;cameraSnap=true;updateSceneUI();
}
function incoming(who,lines,after=hide){tone(690,.18,'square',.025);setTimeout(()=>tone(880,.18,'square',.025),230);dialogue(lines,after,{phone:true,ringing:true,caller:who});}
function updateSceneUI(){
 const state=S.get();if(!state)return;const line=S.line(),ring=state.phase==='ringing';
 $('sceneCaption').textContent=state.caption||(ring?'Telefon znowu dzwoni…':'');
 $('sceneNext').disabled=state.phase==='approach';$('sceneNext').innerHTML=(ring?'ODBIERZ ☎':'DALEJ')+' <kbd>ENTER</kbd>';
 $('sceneCount').textContent=state.phase==='talk'?(state.index+1)+' / '+state.lines.length:state.phase==='approach'?'CHWILA…':'';
 const who=ring?state.caller:line?.[0],phone=ring||!!(line&&S.remote(who));$('scenePhone').hidden=!phone;$('scenePhone').className='scene-phone'+(ring?' ringing':'');
 if(phone){if(scenePhoneWho!==who){scenePhoneWho=who;drawPortrait(who,'scenePortrait');}$('sceneCaller').textContent=NAMES[who]||who;$('sceneCallState').textContent=ring?'Połączenie przychodzące':'Połączenie trwa';}
 $('sceneSpeech').hidden=!line;if(!line)return;
 const key=state.index+'/'+state.phase;if(key!==sceneLineKey){sceneLineKey=key;$('sceneSpeaker').textContent=(NAMES[who]||who)+(phone?' · telefon':'');$('sceneWords').textContent=line[1];$('sceneSpeech').style.animation='none';requestAnimationFrame(()=>{$('sceneSpeech').style.animation='';});if(phone)drawPortrait(who,'scenePortrait');}
}
function drawConversation(zoom){
 const state=S.get();if(!state)return;const line=S.line(),ring=state.phase==='ringing';
 ctx.save();const top=ctx.createLinearGradient(0,0,0,40);top.addColorStop(0,'#102b3ce6');top.addColorStop(1,'#102b3c00');A.rect(ctx,0,0,VIEW_W,40,top);const bottom=ctx.createLinearGradient(0,VIEW_H-40,0,VIEW_H);bottom.addColorStop(0,'#102b3c00');bottom.addColorStop(1,'#102b3cc9');A.rect(ctx,0,VIEW_H-40,VIEW_W,40,bottom);
 const caption=state.caption||(ring?'Telefon znowu dzwoni…':'');if(caption){ctx.font='600 11px Arial';const w=ctx.measureText(caption).width+34;A.round(ctx,(VIEW_W-w)/2,19,w,31,16,'#163a4eea','#bad3d54d',1);A.text(ctx,caption,VIEW_W/2,35,11,'#e0ece7','center');}
 if(state.phase==='talk')A.text(ctx,(state.index+1)+' / '+state.lines.length,25,VIEW_H-32,10,'#e0eae1');
 const who=ring?state.caller:line?.[0],remote=ring||!!(line&&S.remote(who));
 if(remote){const x=24,y=VIEW_H-171;A.round(ctx,x,y,230,100,13,A.grad(ctx,x,y,230,100,['#285268','#17384e']),'#94b6c3',1);A.round(ctx,x+10,y+10,61,76,7,'#c5d9db');ctx.save();ctx.beginPath();ctx.roundRect(x+10,y+10,61,76,7);ctx.clip();ctx.drawImage($('scenePortrait'),x+10,y+10,61,76);ctx.restore();A.text(ctx,'TELEFON SŁUŻBOWY',x+84,y+22,7,'#9ebdc7');A.text(ctx,NAMES[who]||who,x+84,y+47,17,'#eff5e9');A.text(ctx,ring?'Połączenie przychodzące':'Połączenie trwa',x+84,y+70,9,'#b7d5be');if(ring){const r=14+Math.sin(now*7)*3;A.ellipse(ctx,x+208,y+18,r,r,null,'#c5dca766',1);A.text(ctx,'☎',x+208,y+18,15,'#e3edcf','center');}}
 if(!line){ctx.restore();return;}
 const p=state.cast[who]||state.cast.wojtek,headHeight=p.visible?(p.seated?(p.who==='wojtek'?48:65):(p.who==='wojtek'?74:p.who==='leader'?93:84)):(g.mode==='fork'?8:31),head={x:remote?139:(p.x-camera.x)*zoom,y:remote?VIEW_H-202:(p.y-camera.y)*zoom-headHeight*zoom-12};
 const width=330,padding=19,rows=[];ctx.font='500 15px Arial';let row='';for(const word of line[1].split(' ')){const next=row?row+' '+word:word;if(ctx.measureText(next).width>width-padding*2&&row){rows.push(row);row=word;}else row=next;}if(row)rows.push(row);
 const height=50+rows.length*23,x=C.clamp(head.x-width/2,17,VIEW_W-width-17),below=head.y<height+35,y=below?head.y+39:Math.min(VIEW_H-120,head.y)-height,tailX=C.clamp(head.x,x+18,x+width-18),alpha=Math.min(1,state.lineTime/.16);
 ctx.globalAlpha=alpha;ctx.translate(0,(1-alpha)*5);ctx.save();ctx.shadowColor='#102b3c50';ctx.shadowBlur=20;ctx.shadowOffsetY=7;A.round(ctx,x,y,width,height,14,'#fffdf3','#96b2bf',1);ctx.restore();
 if(below){A.poly(ctx,[[tailX-9,y+1],[head.x,head.y+17],[tailX+9,y+1]],'#fffdf3');A.line(ctx,[[tailX-9,y],[head.x,head.y+17],[tailX+9,y]],'#96b2bf',1);}else{A.poly(ctx,[[tailX-9,y+height-1],[head.x,head.y+13],[tailX+9,y+height-1]],'#fffdf3');A.line(ctx,[[tailX-9,y+height],[head.x,head.y+13],[tailX+9,y+height]],'#96b2bf',1);}
 A.ellipse(ctx,x+22,y+20,3,3,who==='leader'?'#9c5c6b':who==='bhp'?'#d5ad41':'#689da5');A.text(ctx,(NAMES[who]||who).toUpperCase()+(remote?' · TELEFON':''),x+33,y+20,9,'#6c8996');ctx.font='500 15px Arial';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillStyle='#294858';rows.forEach((text,i)=>ctx.fillText(text,x+padding,y+47+i*23));ctx.restore();
}
function save(){if(!g||cinematic)return;try{g.practice=practice;localStorage.setItem(C.SAVE_KEY+(practice?'-practice':''),JSON.stringify(C.snapshot(g)));$('saveStatus').textContent='● ZAPIS AUTO';$('continueBtn').hidden=false;}catch{$('saveStatus').textContent='ZAPIS NIEDOSTĘPNY';$('saveNote').textContent='Przeglądarka blokuje zapis. Gra działa, ale postęp nie przetrwa zamknięcia.';}}
function readSaved(){try{return C.load(localStorage.getItem(C.SAVE_KEY))||C.load(localStorage.getItem(C.SAVE_KEY+'-practice'));}catch{return null;}}
function start(index=0,whole=false,stats=null){
 closeScene();F.clear();tone(480,.04,'triangle',.012);
 practice=!whole;g=C.create(index,stats);g.checkpointStats=JSON.parse(JSON.stringify(g.stats));active=true;$('landing').hidden=true;$('play').hidden=false;cinematic=null;cameraSnap=true;saveClock=0;clearKeys();
 if(whole&&index===0&&!stats){
  cinematic='prologue';g.world='warehouse';g.mode='foot';g.player={...C.at(451,1040),a:0};
  dialogue([['leader','Wojtek? Witaj na magazynie. Niebieska czapka jest, zapał jest… zobaczymy, jak z paletami.'],['wojtek','Jestem gotowy. Od czego zaczynamy?'],['leader','Od BHP. Zwolnij przy pieszych, nie zastawiaj gaśnic i uważaj na towar. Dwie uwagi — rozmawiamy w tej salce.'],['wojtek','A jakaś premia na start?'],['leader','Najpierw przepracuj zmianę, młody. Telefon już dzwoni.']],()=>{cinematic=null;g=C.create(0);g.checkpointStats=JSON.parse(JSON.stringify(g.stats));cameraSnap=true;missionIntro();},{conference:true});
 }else missionIntro();
 updateHUD();
}
function missionIntro(){
 pendingSceneTitle=true;const i=g.mission;
 if(i===0)incoming('guard',[['guard','yyyyyy avera przyjechała'],['leader','to pod czwórke go podstaw'],['wojtek','Druga zajęta, plac jak parking pod sklepem… Dobra, dam radę.']],()=>instructions('Tir z naczepą','Cofnij pod rampę 4. Skręcaj spokojnie — naczepa reaguje z opóźnieniem. Strzałka ↓ lub S wybiera wsteczny. Spacja zatrzymuje zestaw. Przytrzymaj Shift, żeby manewrować wolniej. Utrzymaj prawidłowe ustawienie na hamulcu przez 2 sekundy.'));
 if(i===1)dialogue([['leader','Avera stoi pod czwórką. Wjeżdżasz wózkiem do naczepy, zabierasz najbliższą paletę i wycofujesz na halę. Potem skan NI i odłożenie.'],['wojtek','Czyli tylko cztery palety. Co może pójść nie tak?']],()=>instructions('Magazyn jest twój','Wózek czeka przed biurem. Wsiądź [Q] i jedź pod rampę 4. Otwarta naczepa jest częścią mapy — podejmuj palety od tyłu i wycofuj po tej samej linii. [E] działa przy końcach wideł, po zatrzymaniu.'));
 if(i===2)incoming('guard',[['guard','paktech pod jedynke'],['leader','Tylko trzymaj hamulec na podjeździe. Ten bus lubi wracać tam, skąd przyjechał.']],()=>instructions('Podjazd pod rampę 1','To ten sam plac. Cofnij busa pod jedynkę i przytrzymaj hamulec przez 2 sekundy. Na podjeździe bez hamowania pojazd powoli się stacza.'));
 if(i===3)dialogue([['leader','Kartony z Paktech ręcznie na paletę. Potem znajdę ci jeszcze coś do roboty.'],['wojtek','Coś czułem, że nie skończy się na parkowaniu.']],()=>instructions('Najpierw ręcznie','Podejdź do kartonów przy rampie 1, weź jeden [E] i zanieś na paletę Paktech [E]. Powtórz sześć razy.'));
 if(i===4)dialogue([['wojtek','Jeju… pierwsza zmiana znowu nie wydana.'],['leader','Na komputerze masz plan. Zanotuj, wyciągnij palety, rozpakuj i odstaw do bufora. I zaglądaj do poczty.']],hide);
 if(i===5){C.takeEvents(g);toast('Nowy e-mail: Beczki do CTP',5);dialogue([['wojtek','E-mail z CTP. Beczki do zawiezienia i zwrot do odebrania. Czyli wycieczka przez całą produkcję.'],['leader','Uważaj na ludzi. Na drodze stoi też paleta. Omiń ją spokojnie.']],hide);}
 processEvents();
}
function instructions(title,body){show('<div class="eyebrow">KRÓTKA ODPRAWA</div><h2>'+title+'</h2><p>'+body+'</p><div class="modal-actions">'+button('DO ROBOTY →','go')+'</div>',{go:hide});}
function goMenu(){F.clear();save();active=false;g=null;cinematic=null;hide();$('play').hidden=true;$('landing').hidden=false;$('continueBtn').hidden=!readSaved();}
function chapters(){show('<div class="eyebrow">WYBÓR MISJI / WERSJA POKAZOWA</div><h2>Który fragment sprawdzamy?</h2><p>Każdą misję możesz uruchomić osobno. Pełne podsumowanie i podwyżka są za całą zmianę. Testy osobnych misji nie zastępują zapisu pełnej zmiany.</p><div class="chapter-grid">'+C.MISSIONS.map((m,i)=>'<button class="chapter-card" data-act="m'+i+'"><small>ROZDZIAŁ '+m.chapter+' / MISJA '+(i%2+1)+'</small><b>'+m.title+'</b><span>'+m.subtitle+'</span></button>').join('')+'</div><div class="modal-actions">'+button('WRÓĆ','close','secondary')+'</div>',Object.assign({close:hide},Object.fromEntries(C.MISSIONS.map((m,i)=>['m'+i,()=>start(i,false)]))));}
function pause(){if(!active||S.get())return;show('<div class="eyebrow">PRZERWA TECHNICZNA</div><h2>Palety poczekają.</h2><p>Postęp jest zapisywany automatycznie. Możesz też pobrać zapis, żeby przenieść go do innej przeglądarki.</p><div class="modal-actions">'+button('WRÓĆ DO GRY','close')+button('POBIERZ ZAPIS','export','secondary')+button('WCZYTAJ ZAPIS','import','secondary')+button('POWTÓRZ MISJĘ','retry','secondary')+button('MENU','menu','secondary')+'</div>',{close:hide,export:exportSave,import:importSave,retry:confirmRetry,menu:goMenu});}
function confirmRetry(){show('<div class="eyebrow">POWTÓRKA MISJI</div><h2>Zacząć bieżącą misję od nowa?</h2><p>Ukończone wcześniej misje pozostaną zaliczone. Bieżąca próba zostanie zastąpiona.</p><div class="modal-actions">'+button('POWTÓRZ','yes')+button('WRÓĆ','close','secondary')+'</div>',{yes:()=>restart(),close:hide});}
function restart(){const s=JSON.parse(JSON.stringify(g.checkpointStats||C.initialStats()));s.failures=g.stats.failures;const whole=!practice;start(g.mission,whole,s);}
function help(){if(S.get())return;const was=active;show('<div class="eyebrow">ŚCIĄGA WOJTKA</div><h2>Jak ogarnąć zmianę?</h2><div class="help-grid"><div><kbd>WASD</kbd><kbd>STRZAŁKI</kbd> Chodzenie. W pojeździe: gaz i kierownica.</div><div><kbd>E</kbd> Podjęcie, skanowanie, odkładanie i rozmowy. Patrz na podpowiedź przy graczu.</div><div><kbd>Q</kbd> Wsiądź do wózka lub wysiądź. Zatrzymaj się przed każdą operacją.</div><div><kbd>↓ / S</kbd> Wybierz wsteczny i jedź. <kbd>↑ / W</kbd> Jedź do przodu.</div><div><kbd>SPACJA</kbd> Hamulec. <kbd>R</kbd> Przełącz D/R. Przyciski gazu używają wybranego biegu.</div><div><kbd>M</kbd> Poczta <kbd>T</kbd> Telefon <kbd>G</kbd> Mapa <kbd>ESC</kbd> Pauza</div></div><p>Złoty znacznik wskazuje bieżący cel. Na mapie jasnoniebieski punkt to Wojtek. Przytrzymaj Shift lub włącz WOLNO przy kierownicy, żeby jechać precyzyjniej. Czasy misji zatrzymują się w dialogach i menu.</p><div class="warning-banner">BHP: przepuszczaj pieszych, zwalniaj na pasach, nie blokuj gaśnicy. Dwie uwagi BHP lub trzy kolizje kończą się rozmową w salce. Kolejny błąd po tej rozmowie może zakończyć zmianę. Potrącenie pieszego kończy próbę od razu.</div><p style="font-size:11px">Przepuszczaj pieszych i nie blokuj dostępu do gaśnicy. Etykiety oraz BDO odbierzesz z drukarki w biurze.</p><div class="modal-actions">'+button(was?'WRÓĆ DO GRY':'ZAMKNIJ','close')+'</div>',{close:hide});}
function mail(computer=false){
 if(!g||S.get())return;if(!stationary())return;
 const list=g.mail.length?g.mail.slice().reverse().map(m=>'<button class="mail-item" data-act="mail_'+m.id+'"><small>'+esc(m.from)+(m.read?'':' <span class="mail-unread">NOWA</span>')+'</small><b>'+esc(m.subject)+'</b></button>').join(''):'<p>Na razie cisza. Korzystaj, póki możesz.</p>';
 show('<div class="eyebrow">POCZTA WOJTKA '+(computer?' / KOMPUTER':' / PODGLĄD')+'</div><h2>Skrzynka odbiorcza</h2>'+list+'<div class="modal-actions">'+button('WRÓĆ','close','secondary')+'</div>',Object.assign({close:hide},Object.fromEntries(g.mail.map(m=>['mail_'+m.id,()=>mailMessage(m.id,computer)]))));
}
function mailMessage(id,computer){
 const m=g.mail.find(x=>x.id===id);if(!m)return;C.action(g,'readMail',id);let extra='';const acts={close:hide,back:()=>mail(computer)};
 if(computer&&id==='codes'&&g.mission===3&&['codes','receive'].includes(g.stage)){
  C.action(g,'codes');extra=button('PRZYJMIJ TOWAR · PAK-104','receive');acts.receive=()=>{C.action(g,'receive');hide();processEvents();};
 }
 if(computer&&id==='bdo'&&g.stage==='bdo'){extra=button('DRUKUJ BDO','print');acts.print=()=>{C.action(g,'printBDO');hide();processEvents();};}
 show('<div class="eyebrow">WIADOMOŚĆ OD: '+esc(m.from)+'</div><h2>'+esc(m.subject)+'</h2><div class="mail-body">'+esc(m.body)+'</div>'+(!computer&&['codes','bdo'].includes(id)?'<p>Przyjęcie lub wydruk wykonasz przy komputerze w biurze.</p>':'')+'<div class="modal-actions">'+extra+button('POCZTA','back','secondary')+button('ZAMKNIJ','close','secondary')+'</div>',acts);save();
}
function computer(){
 if(g.mission===4&&!g.flags.plan){
  show('<div class="eyebrow">MAGAZYN / PLAN WYDAŃ</div><h2>Pierwsza zmiana czeka.</h2><table class="plan-table"><thead><tr><th>MASZYNA</th><th>MATERIAŁ</th><th>DO WYDANIA</th></tr></thead><tbody>'+C.MACHINES.map((m,i)=>'<tr><td><b>'+m+'</b></td><td>'+(i%2?'Papier':'Folia')+'</td><td>1 paleta</td></tr>').join('')+'</tbody></table><p>Wyciągnij palety, rozpakuj w oznaczonej strefie i zawieź do bufora. Każda maszyna ma własne miejsce w buforze.</p><div class="modal-actions">'+button('ZANOTOWAŁEM PLAN','confirm')+button('WRÓĆ','close','secondary')+'</div>',{confirm:()=>{C.action(g,'plan');hide();toast('Plan potwierdzony. Czas na wózek.');},close:hide});return;
 }
 mail(true);
}
function phone(){
 if(!g||S.get()||!stationary())return;
 const acts={close:hide,marysia:()=>call('marysia'),jarek:()=>call('jarek'),guard:()=>dialogue([['guard','Na razie nikt nowy nie przyjechał. Jak coś, zadzwonię.']],hide,{phone:true})};
 show('<div class="eyebrow">TELEFON SŁUŻBOWY</div><h2>Do kogo dzwonimy?</h2><button class="mail-item" data-act="marysia"><small>ŁADUNKI I KODY</small><b>☎ Marysia</b></button><button class="mail-item" data-act="jarek"><small>DOKUMENTY</small><b>☎ Jarek</b></button><button class="mail-item" data-act="guard"><small>DOSTAWY</small><b>☎ Ochrona</b></button><div class="modal-actions">'+button('SCHOWAJ TELEFON','close','secondary')+'</div>',acts);
}
function call(who){if(C.action(g,'call',who)){processEvents();save();}else dialogue([[who,who==='marysia'?'Jak będzie coś do wgrania, daj znać. Teraz nic nowego nie mam.':'Jak załadujesz Polimer, zadzwoń po dokument.']],hide,{phone:true});}
function completion(){save();chime();const m=C.MISSIONS[g.mission];show('<div class="eyebrow">ROZDZIAŁ '+m.chapter+' / ZADANIE WYKONANE</div><h2>'+m.title+' — ogarnięte.</h2><p>'+['Naczepa stoi pod czwórką. Teraz ktoś musi ją rozładować.','Palety odstawione, chemia na miejscu. Lider jest zadowolony.','Bus stoi. Hamulec trzymał, fizyka nie wygrała.','Towar przyjęty. Etykiety leżą na właściwej palecie.','Bufor gotowy. Kartony też wydane. Pakowanie pracuje.','Dwie palety załadowane. BDO przekazane kierowcy.'][g.mission]+'</p><div class="summary-grid"><div><b>'+time(g.elapsed)+'</b>CZAS MISJI</div><div><b>'+g.stats.completed.length+'/6</b>ZADANIA</div><div><b>'+g.stats.bhp+'</b>UWAGI BHP</div><div><b>'+g.stats.collisions+'</b>KOLIZJE</div></div><div class="modal-actions">'+button(practice?'WRÓĆ DO WYBORU MISJI':g.mission===5?'IDŹ DO SALKI →':'NASTĘPNA MISJA →','next')+button('MENU','menu','secondary')+'</div>',{next:()=>{if(practice){goMenu();chapters();}else if(g.mission<5)start(g.mission+1,true,g.stats);else finale();},menu:goMenu});}
function finale(){
 cinematic='final';g.world='warehouse';g.mode='foot';g.player={...C.at(451,1040),a:0};cameraSnap=true;
 const e=C.evaluation(g.stats),s=g.stats;
 const lines=[['leader','No dobra, Wojtek. Podsumujmy zmianę. Dostawy, przyjęcia, produkcja, CTP i Polimer — zrobione.'],['leader','Uwagi BHP: '+s.bhp+'. Kolizje: '+s.collisions+'. Niewydane na czas kartony: '+s.work+'. To wszystko ma znaczenie.']];
 if(e.good)lines.push(['leader','Dobra robota. Dostajesz 200 zł brutto podwyżki.'],['wojtek','Brutto? Czyli jednak trzeba było pytać o premię…'],['leader','Nie marudź, młody. I jutro zaglądaj do poczty.']);
 else lines.push(['leader','Musisz się bardziej postarać. Uważaj na ludzi i pilnuj całego planu, razem z dodatkowymi wiadomościami.'],['wojtek','Dobra. Następną zmianę ogarnę lepiej.']);
 dialogue(lines,()=>{show('<div class="eyebrow">KONIEC ZMIANY / PODSUMOWANIE LIDERA</div><h2>'+(e.good?'Dobra robota, młody.':'Następna zmiana będzie lepsza.')+'</h2><div class="summary-number">'+e.score+'<small> / 100</small></div><div class="summary-grid"><div><b>'+s.completed.length+'/6</b>MISJE</div><div><b>'+s.bhp+'</b>UWAGI BHP</div><div><b>'+s.collisions+'</b>KOLIZJE</div><div><b>'+s.work+'</b>UWAGI ZA WYDANIA</div></div>'+(e.good?'<div class="bonus">+200 zł brutto podwyżki 🎉</div>':'<div class="warning-banner">Lider: „Postaraj się bardziej”. Tym razem bez podwyżki.</div>')+'<div class="mission-log">'+C.MISSIONS.map((m,i)=>'<span>'+esc(m.title)+' · '+time(s.times[i]||0)+'</span>').join('')+'</div><div class="modal-actions">'+button('ZAGRAJ JESZCZE RAZ','again')+button('MENU','menu','secondary')+'</div>',{again:()=>start(0,true),menu:goMenu});},{conference:true});
}
function failure(reason){
 save();const pedestrian=reason==='pedestrian';
 if(pedestrian)cinematic='jail';
 show('<div class="eyebrow">'+(pedestrian?'KONIEC PRÓBY / WYPADEK':reason==='time'?'CZAS MINĄŁ':'KONIEC ZMIANY')+'</div><h2>'+(pedestrian?'Ta zmiana kończy się za kratami.':reason==='time'?'Zadanie nie zmieściło się w czasie.':'Oddaj skaner i przepustkę.')+'</h2><p>'+(pedestrian?'Wojtek potrącił pracownika. W tej grze oznacza to natychmiastową przegraną i scenę więzienia. Na kolejnej próbie zwolnij, zatrzymaj się przed przejściem i przepuść ludzi.':reason==='time'?'Możesz powtórzyć bieżącą misję. Wcześniejsze ukończone zadania pozostają zaliczone.':'Po rozmowie z Liderem pojawił się kolejny błąd. Firma kończy współpracę z Wojtkiem. Spróbuj jeszcze raz i popraw bezpieczną jazdę.')+'</p><div class="modal-actions">'+button('POWTÓRZ MISJĘ','retry')+button('MENU','menu','secondary')+'</div>',{retry:restart,menu:goMenu});tone(180,.4,'triangle');
}
function processEvents(){
 const events=C.takeEvents(g);for(const e of events){
  F.event(e.type,g);
  if(e.type==='mail'){toast('✉ '+e.subject,5);chime();}
  if(e.type==='picked'){tone(280,.07);toast('Podjęto '+e.id,1.7);}
  if(e.type==='scanned'){tone(1040,.09,'square',.025);toast('NI poprawny. Możesz odłożyć paletę.',2);}
  if(e.type==='dropped'){tone(360,.1);save();}
  if(e.type==='unwrapped'){toast('Folia zdjęta. Paleta gotowa do wydania.',2);tone(550,.12);}
  if(e.type==='scanError')dialogue([['wojtek','No nie… trzecia paleta i już błąd. NI nie przechodzi. Muszę pokazać to Liderowi.']],hide);
  if(e.type==='reportScan')dialogue([['wojtek','Liderze, trzeciej palety nie mogę zeskanować. Terminal wywala błąd.'],['leader','Zadzwoń do Marysi. Niech sprawdzi, czy ładunek jest wgrany.']],hide);
  if(e.type==='marysia')dialogue([['wojtek','Marysia, nie mogę zeskanować palety z AVERY. Ładunek jest wgrany?'],['marysia','Ładunek dawno wgrany. Nie wiem, o co chodzi. U mnie wszystko jest.'],['wojtek','Dobra, dzięki.'],['wojtek','Klasyk. Dobra, jeszcze raz tę samą paletę.'],['leader','Streszczaj się młody, bo jeszcze produkcja nie wydana.']],hide,{phone:true});
  if(e.type==='chemQuestion')toast('Ostatnia paleta to chemia. Zapytaj Lidera, gdzie ją odstawić.',4);
  if(e.type==='chemInstructions')dialogue([['wojtek','A ta paleta chemii? Co z nią?'],['leader','Do magazynku chemicznego. Przez produkcję. Tylko ostrożnie, tam ludzie chodzą, a w środku ciasno.']],hide);
  if(e.type==='praise')dialogue([['leader','Dobra robota młody.'],['wojtek','To może jakaś premia?'],['leader','Widzę potencjał. Na razie wpisuję plusa do oceny zmiany.']],()=>{C.action(g,'praiseEnd');processEvents();});
  if(e.type==='packingTalk')dialogue([['wojtek','Kody na to już założone?'],['leader','Nie, ale napisałem e-mail do Marysi. Czekam.'],['wojtek','To gdzie mam to zawieźć?'],['leader','Na drobnicę. Zielony obrys jest tuż przy gaśnicy. Zostaw dostęp, a nie okazję do szkolenia.']],hide,{approach:'leader'});
  if(e.type==='packed')toast('Paleta gotowa. Teraz możesz podjąć ją wózkiem.',3);
  if(e.type==='printing'){tone(240,.2,'sawtooth',.018);toast('Drukarka pracuje. Odbierz '+(e.kind==='labels'?'etykiety.':'BDO.'),4);}
  if(e.type==='missingCartons'){
   cinematic='reprimand';cinematicStart=now;dialogue([['leader','Wojtek! A kartony?! Nie wydane! Pakowanie stoi przez ciebie!'],['wojtek','Były jeszcze kartony?'],['leader','E-mail przyszedł w trakcie. To pierwsze ostrzeżenie. Wróć, znajdź paletę i wydaj.']],()=>{cinematic=null;hide();},{approach:'leader'});
  }
  if(e.type==='ctpDelivered')toast('Dostawa odstawiona. Podejmij paletę ze strefy ZWROT.',4);
  if(e.type==='polimerCall')incoming('guard',[['guard','polimer pod jedynke'],['wojtek','Dobra. Dwie palety beczek do busa i telefon do Jarka po BDO.']],hide);
  if(e.type==='runner')toast('Uwaga! Ktoś rusza przez drogę poza pasami!',4);
  if(e.type==='jarek')dialogue([['wojtek','Jarek, Polimer załadowany. Wyślesz BDO?'],['jarek','Jasne. Za chwilę masz na e-mailu. Wydrukuj i daj kierowcy.']],hide,{phone:true});
  if(e.type==='warning'){
   const txt=e.kind==='collision'?'Uderzyłeś w przeszkodę. Zwolnij i zostaw więcej miejsca na manewr.':e.kind==='extinguisher'?'Nie zastawiaj gaśnicy! Ta strefa musi zostać dostępna. Odstaw paletę w oznaczonym polu.':'Za szybko na przejściu dla pieszych. Zwolnij, zanim wjedziesz na pasy.';
   cinematic='bhp';cinematicStart=now;dialogue([['bhp',txt],['wojtek','Dobra, poprawiam się.']],()=>{cinematic=null;hide();},{approach:'bhp'});
  }
  if(e.type==='briefing'){
   cinematic='bhp';cinematicStart=now;
   dialogue([['bhp','To już kolejna uwaga. Zatrzymaj pracę, Lider czeka w salce.'],['wojtek','Dobra. Odkładam skaner.']],()=>{
    const prev={player:{...g.player},mode:g.mode,world:g.world};cinematic='briefing';g.world='warehouse';g.mode='foot';cameraSnap=true;
    dialogue([['leader','Siadaj, Wojtek. Dwie uwagi BHP albo trzy kolizje to już nie jest drobiazg.'],['leader','Dostajesz ostatnią szansę. Następny błąd i kończymy współpracę. Spokojniej na zakrętach i uważaj na pieszych.'],['wojtek','Rozumiem. Wracam do pracy.']],()=>{cinematic=null;g.player=prev.player;g.mode=prev.mode;g.world=prev.world;cameraSnap=true;hide();},{conference:true});
   },{approach:'bhp'});
  }
  if(e.type==='complete')completion();
  if(e.type==='fail')failure(e.reason);
 }
 updateHUD();
}
function stationary(){if(g&&g.mode!=='foot'&&Math.abs((g.mode==='vehicle'?g.vehicle:g.fork).v)>12){toast('Najpierw zatrzymaj pojazd.',2);return false;}return true;}
function actor(){return g.mode==='vehicle'?g.vehicle:g.mode==='fork'?g.fork:g.player;}
function blocked(p,r=15,ignorePallets=false){return !W.pointFree(g,p,r,ignorePallets);}
function exitFork(){
 if(!g||modalOpen||F.isBusy())return;
 if(g.mode==='foot'){
  if(g.carrying){toast('Najpierw odłóż to, co niesiesz.',2);return;}
  if(C.dist(g.player,g.fork)>80){toast('Podejdź do wózka, aby wsiąść [Q].',2);return;}
  g.mode='fork';g.fork.v=0;g.gear=1;toast('Wózek: ↑ do przodu, ↓ wstecz, spacja hamulec.',3);
 }else if(g.mode==='fork'){
  if(!stationary())return;
  const f=g.fork,out=W.forkExit(g);
  if(!out){toast('Za ciasno, żeby wysiąść. Przestaw wózek.',2);return;}
  g.mode='foot';g.player={...out,a:f.a};g.fork.v=0;
 }
 save();updateHUD();
}
function targets(){
 if(!g||g.mode==='vehicle'||cinematic)return[];
 const out=[];const add=(id,label,p,action,arg,r=75)=>out.push({id,label,...p,action,arg,r});
 if(g.mode==='foot'){
  add('computer','Sprawdź komputer',C.POS.computer,'computer',null,105);
  if(g.mission===1&&((g.flags.scanError&&!g.flags.errorReported)||(g.flags.needLeader&&!g.flags.chemAllowed)||g.stage==='returnLeader'))add('leader','Porozmawiaj z Liderem',C.POS.leader,'leader',null,85);
  if(g.mission===3&&g.stage==='pack'){if(!g.carrying)add('box','Weź karton',C.POS.boxes,'pack','take',60);else add('pack','Połóż karton na palecie',C.POS.pack,'pack','place',60);}
  if(g.mission===4&&g.cargo){const p=g.pallets.find(x=>x.id===g.cargo);if(!p.unwrapped&&C.dist(C.front(g.fork,60),C.POS.unwrap)<105)add('unwrap','Rozpakuj paletę ręcznie',C.POS.unwrap,'unwrap',null,125);}
  if(['printLabels','printBDO'].includes(g.stage))add('printer','Odbierz wydruk',C.POS.printer,'collectPrint',null,85);
  if(g.stage==='deliverLabels')add('labels','Połóż etykiety na palecie',C.POS.small,'deliverLabels',null,70);
  if(g.stage==='deliverBDO')add('bdo','Przekaż BDO kierowcy',C.POS.van,'deliverBDO',null,85);
 }else{
  const p=g.pallets.find(x=>x.id===g.cargo);
  if(p){
   if(g.mission===1&&!p.scanned&&(!g.flags.scanError||g.flags.marysia))add('scan','Zeskanuj '+p.id,g.fork,'scan',null,80);
   else if(g.mission===4&&!p.unwrapped){/* Unwrapping is a manual task after exiting the forklift. */}
   else if((g.mission!==1||p.scanned)&&(g.mission!==4||p.unwrapped))add('drop','Odłóż '+p.id,C.destination(g,p),'drop',null,g.mission===3?105:42);
  }else for(const p of C.availablePallets(g))add(p.id,'Podejmij '+p.id,p,'pick',p.id,34);
 }
 return out;
}
function bestTarget(){
 const p=g.mode==='fork'?C.front(g.fork,67):g.player;
 const ts=targets().map(t=>({...t,d:C.dist(p,t)})).filter(t=>t.d<t.r);
 ts.sort((a,b)=>a.d-b.d);return ts[0]||null;
}
function interact(){
 if(modalOpen||!g||F.isBusy()||!stationary())return;
 const t=bestTarget();if(!t){toast('Podejdź bliżej celu. Widły muszą być skierowane na paletę.',2);return;}
 if(t.action==='computer'){computer();return;}
 if(t.action==='drop'){const status=C.dropStatus(g,g.pallets.find(p=>p.id===g.cargo));if(!status.valid){if(status.fire){C.action(g,'drop');processEvents();}else toast(g.mission===3?'Wyrównaj paletę w zielonym obrysie i ustaw wózek prosto.':'Podjedź widłami bliżej środka pola.',3);return;}}
 const commit=()=>{if(C.action(g,t.action,t.arg)){processEvents();save();}else if(t.action==='scan'&&g.flags.scanError)toast('Najpierw zgłoś problem Liderowi i zadzwoń do Marysi.',3);};
 if(F.start(g,t,commit)){if(g.mode==='fork')g.fork.v=0;clearKeys();if(t.action==='unwrap')tone(240,.3,'sawtooth',.014);if(t.action==='scan')tone(760,.08,'sine',.025);return;}commit();
}
function pedestrians(){return P.pedestrians(g);}
function physics(dt){
 const p=actor(),gas=keys.ArrowUp||keys.KeyW||keys.Gas,reverse=keys.ArrowDown||keys.KeyS;
 const input={dx:(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0),dy:(keys.ArrowDown||keys.KeyS?1:0)-(keys.ArrowUp||keys.KeyW?1:0),steer:(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0),gas:!!(gas||reverse),brake:!!keys.Space,precision:!!(keys.ShiftLeft||keys.ShiftRight||g.slow)};
 if(g.mode!=='foot'){if(reverse)input.gear=-1;else if(gas&&!keys.Gas)input.gear=1;}
 const result=P.step(g,input,dt);walkingMotion=g.mode==='foot'&&result.moved>.01;
 if(g.mission===4&&g.mode==='foot'&&g.progress>=5&&g.player.y>C.wy(915)&&g.player.x<380)C.action(g,'office');
 processEvents();
}
function worldBackground(world){
 const mission=world==='warehouse'&&g?g.mission:-1,key=world+'/'+mission;
 if(backgrounds[key])return backgrounds[key];for(const old of Object.keys(backgrounds))if(old.startsWith(world+'/')){backgrounds[old].width=1;backgrounds[old].height=1;delete backgrounds[old];}const b=document.createElement('canvas'),size=W.sizes[world];b.logicalWidth=size.w;b.logicalHeight=size.h;b.width=size.w*2;b.height=size.h*2;const x=b.getContext('2d');x.scale(2,2);x.imageSmoothingEnabled=true;if(world==='yard')A.yard(x);else A.warehouse(x,mission);backgrounds[key]=b;return b;
}
function draw(){
 if(!g)return;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.imageSmoothingEnabled=true;const world=g.world,size=W.sizes[world],scene=S.get(),scamera=S.camera();
 const focus=scamera||(g.mode==='vehicle'&&g.vehicle.kind==='truck'?C.front(g.vehicle,-70):actor()),zoom=scamera?.zoom||g.zoom||(world==='warehouse'?1.16:.94);
 const tx=C.clamp(focus.x-VIEW_W/zoom/2,0,Math.max(0,size.w-VIEW_W/zoom)),ty=C.clamp(focus.y-VIEW_H/zoom/2,0,Math.max(0,size.h-VIEW_H/zoom));
 if(cameraSnap){camera={x:tx,y:ty};cameraSnap=false;}else{camera.x+=(tx-camera.x)*.105;camera.y+=(ty-camera.y)*.105;}
 ctx.clearRect(0,0,VIEW_W,VIEW_H);ctx.save();const sh=F.offset(now);ctx.translate(sh.x,sh.y);ctx.scale(zoom,zoom);ctx.translate(-camera.x,-camera.y);ctx.drawImage(worldBackground(world),0,0,size.w,size.h);F.drawFloor(ctx,g,now);
 if(world==='yard'){
  const b=C.BAYS[g.mission===0?3:0];ctx.save();ctx.translate(b.x,b.y);ctx.rotate(C.BAY_ANGLE-Math.PI/2);A.rect(ctx,-40,5,80,185,'#aacb8c32');A.outline(ctx,-39,4,78,190,'#c6d795',3);ctx.restore();if(!scene)A.marker(ctx,b.x,b.y+50,now,'RAMPA '+(g.mission===0?'4':'1'));
  if(g.vehicle)A.vehicle(ctx,g.vehicle);A.person(ctx,870,808,'guard',Math.PI/2,now,false);if(scene?.cast.bhp){const p=scene.cast.bhp;A.person(ctx,p.x,p.y,'bhp',p.a,now,p.walk);}
 }else{
  if(g.mission===5){A.pallet(ctx,{kind:'boxes',unwrapped:true},1129,C.wy(568));A.text(ctx,'ODSTAWIONE „NA CHWILĘ”',1129,C.wy(607),7,'#776646','center');}
  if(g.mission===3&&g.stage==='pack')for(let i=0;i<6-g.boxes-(g.carrying==='box'?1:0);i++)A.crate(ctx,C.POS.boxes.x+(i%3)*22-20,C.POS.boxes.y+Math.floor(i/3)*26, .58);
  const items=[];
  for(const p of g.pallets){if(p.id===g.cargo||F.hidePallet(p.id)||p.done&&g.mission===5||g.mission===3&&g.stage==='pack'&&!g.boxes)continue;items.push({y:p.y,draw:()=>{A.pallet(ctx,p,p.x,p.done&&g.mission===1&&p.kind!=='chem'?C.wy(358):p.y);if(!p.done)A.text(ctx,p.id,p.x,p.y+38,9,'#355a52','center');}});}
  const addPerson=p=>{if(!p||p.visible===false)return;items.push({y:p.y,draw:()=>{const speaking=S.line()?.[0]===p.who;if(speaking)A.ellipse(ctx,p.x,p.y+4,25,10,'#f4d28835');if(p.seated)A.seatedPerson(ctx,p.x,p.y,p.who,p.a,now,speaking);else A.person(ctx,p.x,p.y,p.who,p.a,now,p.walk||false);if(p.who==='leader'&&p.seated&&C.dist(p,C.POS.leader)<10)A.leaderDesk(ctx);}});};
  addPerson(scene?.cast.leader||{...C.POS.leader,a:Math.PI/2,who:'leader',visible:true,seated:true});
  for(const p of pedestrians())items.push({y:p.y,draw:()=>{A.person(ctx,p.x,p.y,'worker',p.a,g.elapsed*(p.runner?2.2:1),p.moving&&!modalOpen);if(p.moving&&!modalOpen&&g.mode==='fork'&&C.dist(g.fork,p)<190){A.round(ctx,p.x-56,p.y-116,112,24,8,'#f4f4e9','#9eb5bc',.7);A.poly(ctx,[[p.x-4,p.y-92],[p.x,p.y-85],[p.x+5,p.y-92]],'#f4f4e9');A.text(ctx,p.runner?'Przepraszam! Spieszę się!':'Idę przez pasy!',p.x,p.y-104,9,'#476878','center');}}});
  if(scene?.cast.bhp)addPerson(scene.cast.bhp);
  items.push({y:g.fork.y,draw:()=>A.forklift(ctx,g.fork,F.heldCargo(g),now,g.mode==='fork')});
  if(scene)addPerson(scene.cast.wojtek);else if(g.mode==='foot')items.push({y:g.player.y,draw:()=>A.person(ctx,g.player.x,g.player.y,'wojtek',g.player.a,now,walkingMotion&&!modalOpen&&!F.isBusy(),F.carrying(g))});
  items.sort((a,b)=>a.y-b.y).forEach(x=>x.draw());
  const o=C.objective(g);if(o.at&&!scene&&!cinematic)A.marker(ctx,o.at.x,o.at.y,now,null);
  if(g.mission===4&&g.flags.extraMail&&!g.flags.cartonDone&&g.mail.find(x=>x.id==='extra')?.read&&!scene)A.marker(ctx,C.POS.hidden.x,C.POS.hidden.y,now,'KARTONY');
  if(g.mission===3&&g.cargo&&C.dist(g.fork,C.POS.small)<250){const status=C.dropStatus(g,g.pallets.find(p=>p.id===g.cargo)),q=C.front(g.fork,67);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(g.fork.a);A.outline(ctx,-23,-29,46,58,status.valid?'#5da77e':status.fire?'#d96f55':'#d8ab59',1.5);ctx.restore();A.text(ctx,status.valid?'IDEALNIE · ODŁÓŻ [E]':status.fire?'UWAGA: DOSTĘP DO GAŚNICY':'WYRÓWNAJ W ZIELONYM POLU',C.POS.small.x,C.POS.small.y+73,7,status.fire?'#a24b3e':'#53796d','center');}
  if(g.mission===5&&['load','callJarek','waitBDO','bdo','printBDO','deliverBDO'].includes(g.stage)){A.vehicle(ctx,{kind:'van',label:'POLIMER',x:160,y:C.wy(140),a:-Math.PI/2,v:0});for(let i=0;i<(g.flags.loaded||0);i++){ctx.save();ctx.translate(160,C.wy(120)+i*25);ctx.scale(.44,.44);A.pallet(ctx,{kind:'barrels'},0,0,now);ctx.restore();}}
 }
 F.drawAtmosphere(ctx,g,now);F.drawWorld(ctx,g,now);ctx.restore();
 if(!scene&&!cinematic){
  A.minimap(ctx,g,VIEW_W-193,VIEW_H-134,180,120);const o=C.objective(g);if(o.at){const ox=(o.at.x-camera.x)*zoom,oy=(o.at.y-camera.y)*zoom;if(ox<30||oy<60||ox>VIEW_W-30||oy>VIEW_H-30){const x=C.clamp(ox,42,VIEW_W-42),y=C.clamp(oy,85,VIEW_H-170),a=Math.atan2(oy-VIEW_H/2,ox-VIEW_W/2);ctx.save();ctx.translate(x,y);A.round(ctx,-23,-23,46,46,7,'#203d54e8');ctx.rotate(a);A.poly(ctx,[[16,0],[-10,-10],[-6,0],[-10,10]],'#edc366');ctx.restore();A.text(ctx,'CEL',x,y+34,11,'#f2e1a5','center');}}
 }
 if(cinematic==='jail'){A.rect(ctx,0,0,VIEW_W,VIEW_H,'#112b3ec0');A.person(ctx,540,380,'wojtek',Math.PI/2,now);for(let x=290;x<820;x+=70){A.rect(ctx,x,120,12,430,'#60747c');A.rect(ctx,x,120,3,430,'#b7c4bc');}A.rect(ctx,282,135,548,12,'#778d8b');A.rect(ctx,282,530,548,12,'#778d8b');}
 if(!scene)F.drawHUD(ctx,VIEW_W,VIEW_H);else drawConversation(zoom);
 if(g.mode==='vehicle'&&!cinematic&&!scene&&g.flags.parking){const p=g.flags.parking;A.text(ctx,'DO RAMPY '+Math.round(p.distance)+'  |  KĄT '+Math.round(p.alignment*180/Math.PI)+'°'+(g.vehicle.kind==='truck'?'  |  ZŁOŻENIE '+Math.round(p.art*180/Math.PI)+'°':''),22,VIEW_H-25,11,'#e3e5c5');}
}
function updateHUD(){
 if(!g)return;updateSteps();const m=C.MISSIONS[g.mission],o=C.objective(g),remaining=m.limit-g.elapsed;
 $('chapterLabel').textContent='ROZDZIAŁ 0'+m.chapter+' / MISJA 0'+(g.mission%2+1)+(practice?' / POJEDYNCZA MISJA':'');$('missionTitle').textContent=m.title;$('taskCount').textContent=String(g.mission+1).padStart(2,'0')+' / 06';
 $('objectiveTitle').textContent=o.title;$('objectiveDetail').textContent=o.detail;$('timer').textContent=time(remaining);$('timer').style.color=remaining<60?'#ad5948':'';$('timeBar').style.width=C.clamp(remaining/m.limit*100,0,100)+'%';
 $('bhpCount').textContent=g.stats.bhp;$('collisionCount').textContent=g.stats.collisions;$('workCount').textContent=g.stats.work;
 const unread=g.mail.filter(m=>!m.read).length;$('mailSummary').textContent=unread?unread+' nowych wiadomości':'Brak nowych wiadomości';$('mailBtn').classList.toggle('unread',unread>0);
 $('cargoLabel').textContent=g.carrying?({box:'NIESIESZ KARTON',labels:'NIESIESZ ETYKIETY',bdo:'NIESIESZ BDO'}[g.carrying]):g.cargo?'ŁADUNEK: '+g.cargo:g.mode==='foot'?'PIESZO':g.mode==='fork'?'WÓZEK WIDŁOWY':'ZA KIEROWNICĄ';
 const veh=g.mode!=='foot';$('vehicleHud').hidden=!veh||!!cinematic;$('sceneName').textContent=g.world==='yard'?'PLAC MANEWROWY':actor().x>940?'PRODUKCJA / CTP':actor().y>C.wy(900)?'BIURO / MAGAZYNKI':'MAGAZYN GŁÓWNY';$('topLocation').textContent=$('sceneName').textContent;
 if(veh){const v=actor();$('modeName').textContent=g.mode==='fork'?'WÓZEK':v.kind==='truck'?'TIR + NACZEPA':'BUS';$('speed').textContent=Math.round(Math.abs(v.v)*.10);$('wheel').style.transform='rotate('+v.steer*210+'deg)';$('gearD').classList.toggle('selected',g.gear===1);$('gearR').classList.toggle('selected',g.gear===-1);$('slowBtn').classList.toggle('selected',!!g.slow);}
 $('dockMeter').hidden=g.mode!=='vehicle'||!!cinematic;if(g.mode==='vehicle'){$('dockMeter').querySelector('i').style.width=C.clamp(g.dockHold/2*100,0,100)+'%';$('dockText').textContent=g.dockHold>0?'Trzymaj hamulec… '+g.dockHold.toFixed(1)+' / 2 s':g.vehicle.jackknife?'Zestaw mocno złożony. Podjedź do przodu.':g.flags.parking?.distance<40?'Wyprostuj, zatrzymaj i trzymaj hamulec':'Dopasuj ustawienie do rampy';}
 focusTarget=bestTarget();$('interaction').hidden=!focusTarget||modalOpen||!!cinematic||F.isBusy();$('interaction').style.bottom=veh?'114px':'20px';if(focusTarget)$('interaction').querySelector('span').textContent=focusTarget.label;
 $('safetyTip').querySelector('p').textContent=g.stats.lastChance?'Ostatnia szansa. Jedź ostrożnie i poprawiaj błędy.':'Pieszy ma pierwszeństwo. Podnoś paletę na postoju.';
 if(toastUntil<now)$('toast').hidden=true;
}
function map(){
 if(!g||S.get())return;show('<div class="eyebrow">MAPA ZMIANY</div><h2>'+($('sceneName').textContent)+'</h2><canvas class="map-full" id="fullMap" width="900" height="600"></canvas><p>Złoty znacznik — bieżący cel. Jasnoniebieski punkt — twoja pozycja.</p><div class="modal-actions">'+button('WRÓĆ','close')+'</div>',{close:hide},true);
 const c=$('fullMap'),x=c.getContext('2d'),b=worldBackground(g.world),scale=Math.min(c.width/b.logicalWidth,c.height/b.logicalHeight);x.imageSmoothingEnabled=true;x.drawImage(b,0,0,b.logicalWidth*scale,b.logicalHeight*scale);const p=actor(),o=C.objective(g);A.rect(x,p.x*scale-5,p.y*scale-5,10,10,'#48a4d1');if(o.at){A.marker(x,o.at.x*scale,o.at.y*scale,now,'CEL');}
}
function exportSave(){save();const blob=new Blob([JSON.stringify(C.snapshot(g),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='wojtek-zapis.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Zapis pobrany.',2);}
function importSave(){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.addEventListener('change',async()=>{try{const loaded=C.load(await input.files[0].text());F.clear();if(!loaded)throw Error();g=loaded;practice=!!g.practice;active=true;cinematic=null;cameraSnap=true;$('landing').hidden=true;$('play').hidden=false;hide();if(g.failed)failure(g.failed);else if(g.done)completion();toast('Zapis wczytany.',3);}catch{toast('Nie udało się odczytać zapisu gry.',4);}});input.click();}
function drawCover(){
 cc.imageSmoothingEnabled=true;
 const bg=worldBackground('warehouse');
 cc.drawImage(bg,70,C.wy(210),1580,1100,0,0,650,590);
 const shade=cc.createLinearGradient(0,0,0,590);shade.addColorStop(0,'#18354a10');shade.addColorStop(1,'#18354ab8');A.rect(cc,0,0,650,590,shade);
 cc.save();cc.translate(487,220);cc.scale(1.35,1.35);A.forklift(cc,{x:0,y:0,a:-1.8,v:0},null,now);cc.restore();
 if(portraits&&portraits.complete&&portraits.width){cc.drawImage(portraits,-8,138,668,332);}
 else{cc.save();cc.translate(255,395);cc.scale(2.8,2.8);A.person(cc,0,0,'wojtek',Math.PI/2,now);cc.restore();cc.save();cc.translate(385,388);cc.scale(2.8,2.8);A.person(cc,0,0,'leader',Math.PI/2,now);cc.restore();}
 A.round(cc,27,83,230,31,8,'#18374bd9');A.text(cc,'JEDEN MAGAZYN. DUŻO HISTORII.',142,99,10,'#edf2e6','center');
 A.round(cc,27,462,170,25,7,'#f7c45c');A.text(cc,'GOTOWY NA ZMIANĘ?',112,475,10,'#51462d','center');
}

function frame(t){
 const dt=Math.min(.035,(t-last)/1000||.016);last=t;now=t/1000;frameCounter++;S.tick(dt);if(S.get())updateSceneUI();
 if(active&&g){
  if(!modalOpen&&!g.done&&!g.failed){C.tick(g,dt);F.tick(g,dt,true);if(!g.failed&&!g.done&&!modalOpen&&!F.isBusy())physics(dt);else if(g.failed)processEvents();saveClock+=dt;if(saveClock>5){saveClock=0;save();}}
  if(modalOpen||g.done||g.failed){walkingMotion=false;F.tick(g,dt,false);}
  draw();if(frameCounter%4===0)updateHUD();
 }else if(frameCounter%3===0)drawCover();
 engineTick();requestAnimationFrame(frame);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b&&modalActions[b.dataset.act]){tone(450,.03);modalActions[b.dataset.act]();}});
document.addEventListener('keydown',e=>{
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
 if(e.repeat)return;
 if(modalOpen){if(['Enter','KeyE'].includes(e.code)&&dialogAdvance){e.preventDefault();dialogAdvance();}else if(e.code==='Escape'&&modalActions.close)modalActions.close();return;}
 keys[e.code]=true;if(!active)return;
 if(e.code==='KeyE')interact();if(e.code==='KeyQ')exitFork();if(e.code==='KeyR')g.gear*=-1;
 if(e.code==='KeyM')mail();if(e.code==='KeyT')phone();if(e.code==='KeyG')map();if(e.code==='Escape')pause();
});
document.addEventListener('keyup',e=>{delete keys[e.code];});window.addEventListener('blur',()=>{clearKeys();if(active&&!modalOpen)pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){save();clearKeys();if(active&&!modalOpen)pause();}});window.addEventListener('beforeunload',save);
document.querySelectorAll('[data-key]').forEach(b=>{
 const code=b.classList.contains('gas')?'Gas':b.dataset.key;
 b.addEventListener('pointerdown',e=>{e.preventDefault();if(modalOpen)return;b.setPointerCapture(e.pointerId);keys[code]=true;b.classList.add('held');});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>{delete keys[code];b.classList.remove('held');});
});
$('newBtn').onclick=()=>{if(readSaved())show('<div class="eyebrow">NOWA ZMIANA</div><h2>Zacząć od początku?</h2><p>Nowa gra zastąpi zapis bieżącej zmiany. Możesz też kontynuować poprzednią.</p><div class="modal-actions">'+button('NOWA GRA','yes')+button('WRÓĆ','close','secondary')+'</div>',{yes:()=>start(0,true),close:hide});else start(0,true);};
$('continueBtn').onclick=()=>{F.clear();g=readSaved();if(!g){toast('Brak poprawnego zapisu. Rozpocznij nową zmianę.');return;}practice=!!g.practice;active=true;cinematic=null;$('landing').hidden=true;$('play').hidden=false;cameraSnap=true;hide();if(g.failed)failure(g.failed);else if(g.done)completion();};
$('sceneNext').onclick=nextScene;$('chaptersBtn').onclick=chapters;$('homeBtn').onclick=()=>active?pause():chapters();$('helpBtn').onclick=help;$('pauseBtn').onclick=pause;$('mailBtn').onclick=()=>mail();$('phoneBtn').onclick=phone;$('mapBtn').onclick=map;$('touchE').onclick=interact;$('touchQ').onclick=exitFork;
$('gearD').onclick=()=>{if(g)g.gear=1;};$('gearR').onclick=()=>{if(g)g.gear=-1;};$('soundBtn').onclick=()=>{sound=!sound;$('soundBtn').textContent=sound?'♫':'♪';$('soundBtn').title=sound?'Dźwięk włączony':'Dźwięk wyłączony';if(!sound&&engineNodes&&audio)engineNodes.gain.gain.setTargetAtTime(0,audio.currentTime,.08);tone(540,.13);};
$('fullscreenBtn').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else $('app').requestFullscreen?.();};
$('zoomIn').onclick=()=>{if(g){g.zoom=Math.min(1.7,(g.zoom||(g.world==='warehouse'?1.16:.94))+.1);cameraSnap=true;}};
$('zoomOut').onclick=()=>{if(g){g.zoom=Math.max(.85,(g.zoom||(g.world==='warehouse'?1.16:.94))-.1);cameraSnap=true;}};
$('slowBtn').onclick=()=>{if(g){g.slow=!g.slow;toast(g.slow?'Tryb precyzyjny włączony.':'Tryb precyzyjny wyłączony.',2);}};
$('continueBtn').hidden=!readSaved();drawCover();requestAnimationFrame(frame);
window.WarehouseGame={getState:()=>g,core:C,scenes:S,physics:P,world:W};
})();
