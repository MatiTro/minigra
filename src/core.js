/* Zmiana na magazynie. Deterministic rules; no DOM or network required. */
(function(root){
'use strict';
const VERSION='1.2.0', SAVE_KEY='zmiana-magazyn-v1';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const angle=a=>Math.atan2(Math.sin(a),Math.cos(a));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const Y=420;
// Shorter central aisle; shared by scenery, collision geometry and mission markers.
const wy=y=>Y+y-(y>=650?60:0);
const at=(x,y)=>({x,y:wy(y)});
const POS={computer:at(155,980),printer:at(290,1000),leader:at(300,1060),fork:at(450,835),chem:at(1470,1040),small:at(825,1045),extinguisher:at(984,1020),pack:at(340,170),boxes:at(160,185),ctp:at(1490,210),returns:at(1320,115),ramp1:at(160,160),van:at(160,170),office:at(250,965),conference:at(555,1030),unwrap:at(680,780),hidden:at(710,560)};
const FIRE_ZONE={x:866,y:wy(995),w:126,h:100};
const SMALL_ZONE={x:784,y:wy(1002),w:82,h:86};
const VEHICLE={truck:{wheelbase:72,hitch:-12,drawAhead:60,trailerAxle:106,trailerCenter:55,trailerRear:154,reverse:46,max:118,steer:.55},van:{wheelbase:64,drawAhead:27,rear:30,reverse:52,max:132,steer:.58},fork:{wheelbase:34,reverse:57,max:98,steer:.72}};
const MACHINES=['D1-1','D1-2','D2-1','D2-2','D3-1'];
const MISSIONS=[
 {id:'avera',chapter:1,title:'Avera pod czwórkę',subtitle:'Pierwszy dzień. Pierwsza rampa.',limit:360,world:'yard'},
 {id:'unload',chapter:1,title:'Ładunek dawno wgrany',subtitle:'Rozładunek, skaner i mała prośba z chemią.',limit:720,world:'warehouse'},
 {id:'paktech',chapter:2,title:'Paktech pod jedynkę',subtitle:'Podjazd robi swoje. Hamulec też musi.',limit:300,world:'yard'},
 {id:'small',chapter:2,title:'Na drobnicę',subtitle:'Kartony, kody od Marysi i gaśnica.',limit:600,world:'warehouse'},
 {id:'buffer',chapter:3,title:'Pierwsza zmiana…',subtitle:'Pięć maszyn. I ten jeden e-mail.',limit:1000,world:'warehouse'},
 {id:'barrels',chapter:3,title:'Beczki na wycieczce',subtitle:'CTP, zwrot, Polimer i BDO.',limit:900,world:'warehouse'}
];
const BAY_ANGLE=Math.PI/2-.12;
const BAYS=[{x:220,y:160},{x:465,y:160},{x:710,y:160},{x:955,y:160}];
function initialStats(){return {bhp:0,collisions:0,work:0,briefings:0,lastChance:false,completed:[],times:{},failures:0};}
function pallet(id,x,y,kind='paper',dest=null){return {id,x,y,kind,dest,scanned:false,unwrapped:false,done:false};}
function create(mission=0,stats=null){
 const m=MISSIONS[mission];
 if(!m)throw Error('Unknown mission');
 const g={version:VERSION,mission,world:m.world,stage:'',elapsed:0,totalTime:0,stats:stats?JSON.parse(JSON.stringify(stats)):initialStats(),player:{...at(230,1030),a:Math.PI/2},fork:{...POS.fork,a:-Math.PI/2,v:0,steer:0},mode:'foot',cargo:null,pallets:[],flags:{},progress:0,boxes:0,carrying:null,mail:[],phone:null,failed:null,done:false,events:[],saveError:false,inspection:0,collisionCooldown:0,bhpCooldown:0,dockHold:0,gear:1};
 if(mission===0||mission===2){
  g.mode='vehicle';g.stage='dock';g.vehicle={x:1050,y:mission===0?735:830,a:-Math.PI/2,b:-Math.PI/2,v:0,steer:0,kind:mission===0?'truck':'van'};
 }
 if(mission===1){g.stage='unload';g.pallets=[pallet('NI-001',712,450,'paper','A-01'),pallet('NI-002',712,380,'foil','A-02'),pallet('NI-003',712,310,'paper','A-03'),pallet('NI-CHEM',712,240,'chem','chem')];g.pallets.forEach(p=>p.location='trailer');}
 if(mission===3){g.stage='pack';g.pallets=[pallet('PAKTECH',POS.pack.x,POS.pack.y,'boxes','small')];}
 if(mission===4){
  g.stage='plan';g.player={...at(245,990),a:Math.PI};
  const places=[at(190,425),at(450,425),at(710,425),at(190,745),at(450,745)];
  g.pallets=places.map((p,i)=>pallet(MACHINES[i],p.x,p.y,i%2?'paper':'foil',MACHINES[i]));
  g.pallets.push(pallet('KARTONY',POS.hidden.x,POS.hidden.y,'boxes','PACK'));
 }
 if(mission===5){g.stage='toCTP';g.player={...at(230,1030),a:Math.PI/2};g.pallets=[pallet('CTP-DOSTAWA',320,wy(205),'barrels','ctp'),pallet('CTP-ZWROT',POS.returns.x,POS.returns.y,'barrels','ramp1'),pallet('POLIMER-2',260,wy(230),'barrels','van')];addMail(g,'ctp','Produkcja / CTP','Beczki do CTP','Wojtek, zawieź paletę beczek spod rampy do CTP. Na miejscu odbierz paletę ze zwrotu i przywieź pod rampę 1.');}
 return g;
}
function emit(g,type,data={}){g.events.push({type,...data});}
function takeEvents(g){return g.events.splice(0);}
function addMail(g,id,from,subject,body){if(g.mail.some(x=>x.id===id))return;g.mail.push({id,from,subject,body,read:false});emit(g,'mail',{id,subject});}
function finish(g){if(g.done)return;g.done=true;if(!g.stats.completed.includes(g.mission))g.stats.completed.push(g.mission);g.stats.times[g.mission]=Math.round(g.elapsed);emit(g,'complete');}
function fail(g,reason){if(g.failed)return;g.failed=reason;g.stats.failures++;emit(g,'fail',{reason});}
function breach(g,kind){
 if(g.failed)return;
 if(kind==='pedestrian'){fail(g,'pedestrian');return;}
 if(kind==='collision')g.stats.collisions++;else g.stats.bhp++;
 if(g.stats.lastChance){fail(g,'dismissal');return;}
 const briefing=g.stats.bhp>=2||g.stats.collisions>=3;
 if(briefing){g.stats.briefings++;g.stats.lastChance=true;emit(g,'briefing');}
 else emit(g,'warning',{kind});
}
function destination(g,p){
 if(!p)return null;
 const fixed={'A-01':at(190,465),'A-02':at(450,465),'A-03':at(710,465),chem:POS.chem,small:POS.small,ctp:POS.ctp,ramp1:POS.ramp1,van:POS.van,PACK:at(835,740)};
 if(MACHINES.includes(p.dest))return at(840,250+MACHINES.indexOf(p.dest)*90);
 return fixed[p.dest]||null;
}
function availablePallets(g){return g.pallets.filter(p=>!p.done&&p.id!==g.cargo&&canPick(g,p));}
function canPick(g,p){
 if(g.mission===1){
  if(g.stage!=='unload')return false;
  if(p.kind==='chem')return g.progress===3&&!!g.flags.chemAllowed;
  return p.id==='NI-00'+(g.progress+1)&&(!g.flags.scanError||!!g.flags.marysia);
 }
 if(g.mission===3)return g.stage==='transport';
 if(g.mission===4)return g.flags.plan&&(!p.id.includes('KARTONY')||g.flags.extraMail);
 if(g.mission===5){if(g.stage==='toCTP')return p.id==='CTP-DOSTAWA';if(g.stage==='return')return p.id==='CTP-ZWROT';if(g.stage==='load')return p.id==='CTP-ZWROT'||p.id==='POLIMER-2';}
 return false;
}
function nextPallet(g){return availablePallets(g)[0]||null;}
function objective(g){
 const p=g.pallets.find(x=>x.id===g.cargo), leader=POS.leader;
 if(g.done)return {title:'Zadanie wykonane',detail:'Dobra robota. Czas na dalszą część zmiany.',at:null};
 if(g.mode==='vehicle')return {title:g.mission===0?'Podstaw naczepę pod rampę 4':'Podstaw busa pod rampę 1',detail:g.mission===0?'Cofaj powoli. Wyprostuj zestaw i zatrzymaj go na hamulcu.':'Na podjeździe bus się stacza. Utrzymaj hamulec przez 2 sekundy.',at:BAYS[g.mission===0?3:0]};
 if(g.mission===1){
  if(g.flags.scanError&&!g.flags.errorReported)return {title:'Zgłoś błąd Liderowi',detail:'Trzecia paleta nie przeszła skanowania.',at:leader};
  if(g.flags.errorReported&&!g.flags.marysia)return {title:'Zadzwoń do Marysi',detail:'Otwórz telefon [T] i wybierz Marysię.',at:null};
  if(g.stage==='returnLeader')return {title:'Wróć do Lidera',detail:'Chemia odstawiona. Odbierz pochwałę.',at:leader};
  if(g.flags.needLeader&&!g.flags.chemAllowed)return {title:'Zapytaj Lidera o chemię',detail:'Dowiedz się, gdzie zawieźć ostatnią paletę.',at:leader};
  if(p&&!p.scanned)return {title:'Zeskanuj '+p.id,detail:'Zatrzymaj wózek i użyj skanera [E].',at:null};
  if(p)return {title:p.kind==='chem'?'Zawieź chemię do magazynku':'Odłóż na '+p.dest,detail:p.kind==='chem'?'Jedź przez produkcję. Uważaj na pieszych i ciasny wjazd.':'Podjedź do oznaczonego miejsca i odłóż paletę [E].',at:destination(g,p)};
  const n=nextPallet(g);return {title:'Podejmij paletę '+(n?n.id:''),detail:'Z naczepy: '+g.progress+'/4. Wjedź przez rampę 4, podejmij najbliższą paletę i wycofaj. Skanuj już na hali.',at:n||POS.fork};
 }
 if(g.mission===3){
  if(g.stage==='pack')return {title:'Ułóż kartony na palecie',detail:'Przenieś ręcznie 6 kartonów: rampa → paleta. '+g.boxes+'/6.',at:g.carrying?POS.pack:POS.boxes};
  if(g.stage==='transport')return {title:'Zawieź paletę na drobnicę',detail:'Wjedź prosto. Wyrównaj paletę w zielonym obrysie. Żółta strefa gaśnicy tuż obok musi pozostać wolna.',at:p?POS.small:g.pallets[0]};
  if(g.stage==='codes')return {title:'Wróć do biura po kody',detail:'Przeczytaj e-mail Marysi na komputerze [E].',at:POS.computer};
  if(g.stage==='receive')return {title:'Przyjmij towar',detail:'Na komputerze potwierdź przyjęcie z kodem z wiadomości.',at:POS.computer};
  if(g.stage==='printLabels')return {title:'Odbierz etykiety z drukarki',detail:'Wydruk czeka w biurze.',at:POS.printer};
  return {title:'Zanieś etykiety na paletę',detail:'Wróć pieszo do drobnicy i połóż je na tej samej palecie.',at:POS.small};
 }
 if(g.mission===4){
  if(!g.flags.plan)return {title:'Sprawdź plan na komputerze',detail:'Pięć maszyn czeka na materiały. Potwierdź, że zanotowałeś plan.',at:POS.computer};
  if(p&&!p.unwrapped)return {title:'Rozpakuj paletę '+p.id,detail:'Zawieź do strefy rozpakowania, zatrzymaj wózek, wysiądź [Q] i rozpakuj [E].',at:POS.unwrap};
  if(p)return {title:'Wydaj '+p.id,detail:'Zawieź rozpakowaną paletę do właściwego pola buforowego.',at:destination(g,p)};
  if(g.progress>=5&&!g.flags.cartonDone)return {title:'Plan wydany. Możesz wrócić do biura.',detail:g.flags.cartonWarned?'Lider czeka na kartony. Sprawdź e-mail i znajdź paletę.':'Sprawdź też nowe wiadomości. Czy to na pewno wszystko?',at:g.flags.cartonWarned?POS.hidden:POS.office};
  if(g.progress>=5&&g.flags.cartonDone)return {title:'Wróć do biura',detail:'Wszystkie materiały i dodatkowe kartony wydane.',at:POS.office};
  const n=nextPallet(g);return {title:'Pobierz paletę do wydania',detail:'Wydania do bufora: '+g.progress+'/5. Każdą paletę najpierw rozpakuj.',at:n||POS.fork};
 }
 if(g.mission===5){
  if(g.stage==='ctpMail')return {title:'Przeczytaj e-mail z CTP',detail:'Wiadomość czeka w poczcie [M].',at:null};
  if(g.stage==='callJarek')return {title:'Zadzwoń do Jarka po BDO',detail:'Telefon [T] → Jarek. Dokument jest potrzebny przed odjazdem.',at:null};
  if(g.stage==='waitBDO')return {title:'Czekasz na BDO',detail:'Jarek wysyła dokument. Zaraz przyjdzie e-mail.',at:POS.computer};
  if(g.stage==='bdo')return {title:'Wydrukuj BDO w biurze',detail:'Przeczytaj e-mail na komputerze i zleć wydruk.',at:POS.computer};
  if(g.stage==='printBDO')return {title:'Odbierz BDO z drukarki',detail:'Dokument trzeba jeszcze zanieść kierowcy.',at:POS.printer};
  if(g.stage==='deliverBDO')return {title:'Zanieś BDO do busa',detail:'Pieszo podejdź do rampy 1 i przekaż wydruk [E].',at:POS.van};
  if(p)return {title:g.stage==='toCTP'?'Zawieź beczki do CTP':g.stage==='return'?'Odwieź zwrot pod rampę 1':'Załaduj paletę do busa',detail:'Przejedź ostrożnie przez produkcję. Załadowano: '+(g.flags.loaded||0)+'/2.',at:destination(g,p)};
  const n=nextPallet(g);return {title:g.stage==='toCTP'?'Podejmij beczki przy rampie':g.stage==='return'?'Odbierz paletę ze zwrotu':'Załaduj busa: '+(g.flags.loaded||0)+'/2',detail:'Podejmij właściwą paletę wózkiem [E].',at:n||POS.ramp1};
 }
 return {title:'Nowa zmiana',detail:'Porozmawiaj z Liderem.',at:leader};
}
function action(g,id,arg){
 if(g.failed||g.done)return false;
 if(id==='readMail'){const m=g.mail.find(x=>x.id===arg);if(!m)return false;m.read=true;return true;}
 if(id==='plan'&&g.mission===4&&!g.flags.plan){g.flags.plan=true;g.stage='issue';emit(g,'planConfirmed');return true;}
 if(id==='pick'){
  const p=g.pallets.find(x=>x.id===arg);if(g.mode!=='fork'||g.cargo||!p||p.done||!canPick(g,p))return false;
  if(!pickupStatus(g,p).valid)return false;g.cargo=p.id;p.location='fork';emit(g,'picked',{id:p.id});return true;
 }
 if(id==='scan'&&g.mission===1&&g.cargo){
  const p=g.pallets.find(x=>x.id===g.cargo);if(p.scanned)return false;
  if(p.id==='NI-003'&&!g.flags.scanError){g.flags.scanError=true;emit(g,'scanError');return true;}
  if(p.id==='NI-003'&&!g.flags.marysia)return false;
  p.scanned=true;emit(g,'scanned',{id:p.id});return true;
 }
 if(id==='leader'&&g.mission===1){
  if(g.stage==='returnLeader'){emit(g,'praise');g.flags.praise=true;return true;}
  if(g.flags.scanError&&!g.flags.errorReported){g.flags.errorReported=true;emit(g,'reportScan');return true;}
  if(g.flags.needLeader&&!g.flags.chemAllowed){g.flags.chemAllowed=true;emit(g,'chemInstructions');return true;}
 }
 if(id==='call'&&arg==='marysia'&&g.mission===1&&g.flags.errorReported&&!g.flags.marysia){g.flags.marysia=true;emit(g,'marysia');return true;}
 if(id==='praiseEnd'&&g.flags.praise){finish(g);return true;}
 if(id==='pack'&&g.mission===3&&g.stage==='pack'&&g.mode==='foot'){
  if(arg==='take'&&!g.carrying){g.carrying='box';return true;}
  if(arg==='place'&&g.carrying==='box'){g.carrying=null;g.boxes++;if(g.boxes===2)emit(g,'packingTalk');if(g.boxes===6){g.stage='transport';emit(g,'packed');}return true;}
 }
 if(id==='receive'&&g.mission===3&&g.stage==='receive'){g.stage='printLabels';emit(g,'printing',{kind:'labels'});return true;}
 if(id==='codes'&&g.mission===3&&g.stage==='codes'){g.stage='receive';action(g,'readMail','codes');return true;}
 if(id==='collectPrint'){
  if(g.stage==='printLabels'){g.carrying='labels';g.stage='deliverLabels';return true;}
  if(g.stage==='printBDO'){g.carrying='bdo';g.stage='deliverBDO';return true;}
 }
 if(id==='deliverLabels'&&g.stage==='deliverLabels'&&g.carrying==='labels'){g.carrying=null;finish(g);return true;}
 if(id==='unwrap'&&g.mission===4&&g.cargo){const p=g.pallets.find(x=>x.id===g.cargo);if(p.unwrapped)return false;p.unwrapped=true;emit(g,'unwrapped',{id:p.id});return true;}
 if(id==='office'&&g.mission===4&&g.progress>=5){
  if(g.flags.cartonDone){finish(g);return true;}
  if(!g.flags.cartonWarned){g.flags.cartonWarned=true;g.stats.work++;emit(g,'missingCartons');return true;}
  return false;
 }
 if(id==='call'&&arg==='jarek'&&g.mission===5&&g.stage==='callJarek'){g.stage='waitBDO';g.flags.bdoDelay=3;emit(g,'jarek');return true;}
 if(id==='printBDO'&&g.mission===5&&g.stage==='bdo'){action(g,'readMail','bdo');g.stage='printBDO';emit(g,'printing',{kind:'bdo'});return true;}
 if(id==='deliverBDO'&&g.stage==='deliverBDO'&&g.carrying==='bdo'){g.carrying=null;finish(g);return true;}
 if(id==='drop'&&g.cargo){
  const p=g.pallets.find(x=>x.id===g.cargo);
  if(g.mission===1&&!p.scanned)return false;
  if(g.mission===4&&!p.unwrapped)return false;
  if(g.mission===3&&(arg==='extinguisher'||dropStatus(g,p).fire)){breach(g,'extinguisher');return false;}
  if(!dropStatus(g,p).valid)return false;
  const d=destination(g,p);if(!d)return false;const tip=front(g.fork,67);p.x=g.mission===3?tip.x:d.x;p.y=g.mission===3?tip.y:d.y;p.a=g.fork.a;p.done=true;p.location='stored';g.cargo=null;
  if(g.mission===1){g.progress++;if(g.progress===3){g.flags.needLeader=true;emit(g,'chemQuestion');}if(p.kind==='chem')g.stage='returnLeader';}
  if(g.mission===3){g.stage='codes';addMail(g,'codes','Marysia','Kody do przyjęcia Paktech','Kody już założone. Towar: PAK-104. Możesz przyjąć dostawę. Etykiety wydrukują się po zatwierdzeniu.');}
  if(g.mission===4){
   if(p.id==='KARTONY')g.flags.cartonDone=true;else g.progress++;
   if(g.progress>=2&&!g.flags.extraMail){g.flags.extraMail=true;addMail(g,'extra','Pakowanie','Jeszcze paleta kartonów','Wojtek, wydaj jeszcze paletę kartonów KARTONY do pola PAKOWANIE obok bufora. Stoi za regałem C, w głębi magazynu. Bez niej pakowanie stanie.');}
  }
  if(g.mission===5){
   if(g.stage==='toCTP'){g.stage='return';emit(g,'ctpDelivered');}
   else if(g.stage==='return'){
    p.done=false;p.location='floor';p.dest='van';g.stage='load';g.flags.loaded=0;emit(g,'polimerCall');
   }else if(g.stage==='load'){g.flags.loaded=(g.flags.loaded||0)+1;if(g.flags.loaded===2)g.stage='callJarek';}
  }
  emit(g,'dropped',{id:p.id});return true;
 }
 return false;
}
function front(f,d=48){return {x:f.x+Math.cos(f.a)*d,y:f.y+Math.sin(f.a)*d};}
function hitch(v){return front(v,VEHICLE.truck.hitch);}
function trailer(v){const k=VEHICLE.truck,hitch=front(v,k.hitch);return {x:hitch.x-Math.cos(v.b)*k.trailerCenter,y:hitch.y-Math.sin(v.b)*k.trailerCenter,a:v.b};}
function rear(v){if(v.kind==='van')return front(v,-VEHICLE.van.rear);const t=trailer(v);return front(t,-77);}
function pickupStatus(g,p){const f=g.fork,tip=front(f,67),d=dist(tip,p),ahead=(p.x-f.x)*Math.cos(f.a)+(p.y-f.y)*Math.sin(f.a);return {valid:d<=34&&ahead>45&&Math.abs(f.v)<9,distance:d};}
function dropStatus(g,p){
 const tip=front(g.fork,67),d=destination(g,p);if(!d)return {valid:false,fire:false};
 const small=g.mission===3,alignment=small?Math.abs(angle(g.fork.a-Math.PI/2)):0;
 const ca=Math.abs(Math.cos(g.fork.a)),sa=Math.abs(Math.sin(g.fork.a)),rx=23*ca+29*sa,ry=23*sa+29*ca;
 const fire=small&&tip.x+rx>FIRE_ZONE.x&&tip.x-rx<FIRE_ZONE.x+FIRE_ZONE.w&&tip.y+ry>FIRE_ZONE.y&&tip.y-ry<FIRE_ZONE.y+FIRE_ZONE.h;
 return {valid:!fire&&dist(tip,d)<(small?13:32)&&alignment<.20&&Math.abs(g.fork.v)<9,fire,distance:dist(tip,d),alignment};
}
function parking(g,dt,brake){
 const v=g.vehicle,t=BAYS[g.mission===0?3:0],r=rear(v),a=v.kind==='truck'?v.b:v.a;
 const alignment=Math.abs(angle(a-BAY_ANGLE)),d=dist(r,t),art=v.kind==='truck'?Math.abs(angle(v.a-v.b)):0;
 const good=d<25&&alignment<.15&&art<.23&&Math.abs(v.v)<5&&brake;
 g.dockHold=good?g.dockHold+dt:0;
 g.flags.parking={distance:d,alignment,art,good};
 if(g.dockHold>=2)finish(g);
}
function slope(g,v){if(g.mission!==2||g.mode!=='vehicle')return 0;const b=BAYS[0],dx=v.x-b.x,dy=v.y-b.y,u=dx*Math.cos(BAY_ANGLE)+dy*Math.sin(BAY_ANGLE),cross=-dx*Math.sin(BAY_ANGLE)+dy*Math.cos(BAY_ANGLE);return u>-20&&u<220&&Math.abs(cross)<85?34*Math.cos(v.a-BAY_ANGLE):0;}
function vehicleStep(g,input,dt){
 const v=g.mode==='vehicle'?g.vehicle:g.fork;if(!v)return;
 const kind=g.mode==='fork'?'fork':v.kind,k=VEHICLE[kind],n=Math.max(1,Math.ceil(dt*120)),h=dt/n;
 if(input.gear===1||input.gear===-1)g.gear=input.gear;
 for(let i=0;i<n;i++){
  const desired=clamp(input.steer||0,-1,1)*k.steer;v.steer+=(desired-v.steer)*(1-Math.exp(-h*6.5));
  const opposite=input.gas&&v.v*g.gear<-.8,brake=!!input.brake||opposite,oldSpeed=v.v;
  if(brake){const force=(kind==='fork'?210:170)*h;v.v=Math.abs(v.v)<=force?0:v.v-Math.sign(v.v)*force;}
  else{const grade=slope(g,v);let acceleration=input.gas?g.gear*(kind==='fork'?65:43):0;acceleration+=grade;v.v+=acceleration*h;v.v*=Math.exp(-h*(input.gas?.14:grade?.55:1.1));}
  const forward=input.precision?(kind==='fork'?38:40):k.max,back=input.precision?(kind==='fork'?28:23):k.reverse;
  v.v=clamp(v.v,-back,forward);const speed=(v.v+oldSpeed)/2,omega=speed/k.wheelbase*Math.tan(v.steer),ma=v.a+omega*h/2;
  let nb=v.b;
  if(kind==='truck'){
   const betaRate=b=>(speed*Math.sin(ma-b)+k.hitch*omega*Math.cos(ma-b))/k.trailerAxle;
   const mb=v.b+betaRate(v.b)*h/2;nb=angle(v.b+betaRate(mb)*h);
   const oldArt=Math.abs(angle(v.a-v.b)),newArt=Math.abs(angle(v.a+omega*h-nb));
   if(speed<0&&newArt>1.30&&newArt>oldArt){v.v=0;v.jackknife=true;continue;}v.jackknife=false;
  }
  v.x+=Math.cos(ma)*speed*h;v.y+=Math.sin(ma)*speed*h;v.a=angle(v.a+omega*h);if(kind==='truck')v.b=nb;
 }
}
function tick(g,dt){
 if(g.done||g.failed)return;g.elapsed+=dt;g.totalTime+=dt;
 g.collisionCooldown=Math.max(0,g.collisionCooldown-dt);g.bhpCooldown=Math.max(0,g.bhpCooldown-dt);
 if(g.flags.bdoDelay>0){g.flags.bdoDelay-=dt;if(g.flags.bdoDelay<=0){g.stage='bdo';addMail(g,'bdo','Jarek','BDO / Polimer','BDO jest gotowe. Wydrukuj dokument z tej wiadomości i przekaż go kierowcy Polimeru przed odjazdem.');}}
 if(g.elapsed>=MISSIONS[g.mission].limit)fail(g,'time');
}
function evaluation(stats){
 const n=stats.completed.length;
 const score=clamp(100-stats.bhp*12-stats.collisions*9-stats.work*20-stats.failures*10-(6-n)*12,0,100);
 const good=n===6&&score>=80&&!stats.lastChance&&stats.work===0;
 return {score,good,raise:good?200:0};
}
function snapshot(g){const copy=JSON.parse(JSON.stringify(g));copy.events=[];return copy;}
function validSave(x){return !!(x&&x.version===VERSION&&Number.isInteger(x.mission)&&MISSIONS[x.mission]&&x.stats&&Array.isArray(x.stats.completed)&&x.player&&x.fork&&Array.isArray(x.pallets)&&x.flags&&Array.isArray(x.mail));}
function load(raw){try{const x=JSON.parse(raw);if(x&&['0.1.0','1.1.0'].includes(x.version)&&MISSIONS[x.mission]&&x.stats){const g=create(x.done&&x.mission<5?x.mission+1:x.mission,x.checkpointStats||x.stats);g.practice=!!x.practice;g.checkpointStats=JSON.parse(JSON.stringify(g.stats));g.flags.migrated=true;return g;}if(!validSave(x))return null;x.events=[];return x;}catch{return null;}}
const api={VERSION,SAVE_KEY,Y,wy,at,FIRE_ZONE,SMALL_ZONE,VEHICLE,pickupStatus,dropStatus,MISSIONS,MACHINES,POS,BAYS,BAY_ANGLE,clamp,angle,dist,create,initialStats,action,objective,destination,availablePallets,canPick,nextPallet,emit,takeEvents,addMail,finish,fail,breach,front,hitch,trailer,rear,slope,vehicleStep,tick,parking,evaluation,snapshot,load};
root.WarehouseCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
