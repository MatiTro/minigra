/* Native Canvas QA. This is a DOM adapter, not a browser test. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const {createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','Arial');
async function main(){
const atlas=await loadImage(path.resolve(__dirname,'../assets/wojtek-lider-portraits.png'));
Object.defineProperty(atlas,'src',{get(){return '';},set(v){}});
const directions=await loadImage(path.resolve(__dirname,'../assets/wojtek-lider-directions.png'));
Object.defineProperty(directions,'src',{get(){return '';},set(v){}});
const walk=await loadImage(path.resolve(__dirname,'../assets/wojtek-lider-walk.png'));Object.defineProperty(walk,'src',{get(){return '';},set(v){}});
const props=await loadImage(path.resolve(__dirname,'../assets/warehouse-props.png'));Object.defineProperty(props,'src',{get(){return '';},set(v){}});
const truck=await loadImage(path.resolve(__dirname,'../assets/truck-atlas.png'));Object.defineProperty(truck,'src',{get(){return '';},set(v){}});
const people=await loadImage(path.resolve(__dirname,'../assets/warehouse-people.png'));Object.defineProperty(people,'src',{get(){return '';},set(v){}});
const contacts=await loadImage(path.resolve(__dirname,'../assets/contacts-portraits.png'));Object.defineProperty(contacts,'src',{get(){return '';},set(v){}});
const emptyFork=await loadImage(path.resolve(__dirname,'../assets/forklift-empty.png'));Object.defineProperty(emptyFork,'src',{get(){return '';},set(v){}});
let imageCount=0;
const root=path.resolve(__dirname,'..'),output=path.resolve(root,'../qa');fs.mkdirSync(output,{recursive:true});
const elements=new Map(),listeners={},storage=new Map(),frames=[];
class Element{
 constructor(id=''){this.id=id;this.hidden=false;this.style={};this.dataset={};this.textContent='';this.innerHTML='';this.children=new Map();this.classList={add(){},remove(){},toggle(){}};}
 querySelector(s){if(!this.children.has(s))this.children.set(s,new Element(s));return this.children.get(s);}
 querySelectorAll(){return[];}addEventListener(){}focus(){}click(){this.onclick?.();}setPointerCapture(){}
}
function el(id){if(!elements.has(id)){
 let e;if(/Canvas|portrait|fullMap|scenePortrait/.test(id)){e=createCanvas(id==='gameCanvas'?1080:id==='coverCanvas'?650:id==='fullMap'?900:120,id==='gameCanvas'?690:id==='coverCanvas'?590:id==='fullMap'?600:150);const meta=new Element(id);for(const k of Object.keys(meta))e[k]=meta[k];for(const fn of ['querySelector','querySelectorAll','addEventListener','focus','click','setPointerCapture'])e[fn]=Element.prototype[fn];}else e=new Element(id);elements.set(id,e);
 }return elements.get(id);}
// Skia defers commands; pixel reads flush them, like presentation by a browser.
function nativeSurface(){const c=createCanvas(100,100),ctx=c.getContext('2d'),draw=ctx.drawImage.bind(ctx);ctx.drawImage=(...args)=>{draw(...args);ctx.getImageData(0,0,1,1);};return c;}
const doc={getElementById:el,querySelectorAll:()=>[],createElement:t=>t==='canvas'?nativeSurface():new Element(),addEventListener:(n,f)=>(listeners[n]??=[]).push(f),hidden:false};
const sandbox={devicePixelRatio:process.argv.includes('--retina')?2:1,WarehouseAssets:{propMeta:JSON.parse(fs.readFileSync(path.resolve(__dirname,'../assets/warehouse-props.json'),'utf8')),truckMeta:JSON.parse(fs.readFileSync(path.resolve(__dirname,'../assets/truck-atlas.json'),'utf8'))},Image:function(){return [atlas,directions,walk,props,truck,people,contacts,emptyFork][imageCount++];},document:doc,console,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame:f=>{frames.push(f);},setTimeout:()=>{},URL,Blob,Math,JSON};sandbox.window=sandbox;sandbox.addEventListener=()=>{};
vm.createContext(sandbox);
for(const name of ['core.js','world.js','physics.js','scenes.js','art.js','effects.js','game.js'])vm.runInContext(fs.readFileSync(path.join(root,'src',name),'utf8').replace('function draw(){','function draw(){if(window.__skipCanvasDraw)return;'),sandbox,{filename:name});
let timestamp=0;
function frame(n=1,renderAll=false){for(let j=0;j<n;j++){sandbox.__skipCanvasDraw=!renderAll&&j<n-1;timestamp+=16.667;const pending=frames.splice(0);for(const f of pending)f(timestamp);el('gameCanvas').getContext('2d').getImageData(0,0,1,1);el('coverCanvas').getContext('2d').getImageData(0,0,1,1);}if(n>50)global.gc?.();}
function act(id){for(const f of listeners.click||[])f({target:{closest:()=>({dataset:{act:id}})}});}
function key(code,down=true){for(const f of listeners[down?'keydown':'keyup']||[])f({code,repeat:false,preventDefault(){}});}
function drain(){for(let i=0;i<160;i++){const scene=sandbox.WarehouseScenes.get();if(scene){if(scene.phase==='approach'){frame(180);continue;}frame(20);el('sceneNext').onclick();frame();continue;}if(el('modal').hidden)break;const s=el('modalContent').innerHTML;if(s.includes('data-act="go"'))act('go');else break;frame();}}
function mission(i){el('chaptersBtn').onclick();act('m'+i);drain();frame(4);global.gc?.();if(process.argv.includes('--trace-memory'))console.log('mission',i,Math.round(process.memoryUsage().rss/1048576)+' MiB');return sandbox.WarehouseGame.getState();}
function shot(name,id='gameCanvas'){global.gc?.();frame(28,true);fs.writeFileSync(path.join(output,name+'.png'),el(id).toBuffer('image/png'));}
frame();shot('cover','coverCanvas');if(process.argv.includes('--scene-only')){el('newBtn').onclick();frame(24);shot('conference');console.log('Conference camera and speech render passed.');return;}
if(process.argv.includes('--detail-only')){
 let g=mission(0);Object.assign(g.vehicle,{x:900,y:650,a:-.9,b:-1.3,v:0,steer:0});shot('truck-coupling');
 g=mission(4);g.player={x:g.fork.x-58,y:g.fork.y,a:0};shot('buffer-spawn');key('KeyQ');key('KeyQ',false);assert.equal(g.mode,'fork');shot('forklift-occupied');key('KeyQ');key('KeyQ',false);assert.equal(g.mode,'foot');shot('forklift-empty');
 g=mission(1);g.flags.errorReported=true;el('phoneBtn').onclick();act('marysia');frame(20);el('sceneNext').onclick();frame(20);assert.equal(sandbox.WarehouseScenes.line()[0],'marysia');shot('marysia-phone');drain();
 g=mission(5);g.stage='callJarek';el('phoneBtn').onclick();act('jarek');frame(20);el('sceneNext').onclick();frame(20);assert.equal(sandbox.WarehouseScenes.line()[0],'jarek');shot('jarek-phone');drain();
 g=mission(5);g.mode='fork';g.fork={x:1080,y:sandbox.WarehouseCore.wy(620)+200,a:-Math.PI/2,v:0,steer:0};g.elapsed=14;g.flags.runner={at:12};shot('runner-crossing');console.log('New avatars, buffer spawn, empty/occupied forklift, angled coupling and runner rendered.');return;
}
let g=mission(0);assert.equal(g.mission,0);assert.equal(g.mode,'vehicle');shot('yard');
g=mission(1);assert.equal(g.stage,'unload');shot('warehouse');
g.mode='fork';g.fork={x:g.pallets[0].x,y:g.pallets[0].y+90,a:-Math.PI/2,v:0,steer:0};frame(2);key('KeyE');key('KeyE',false);frame(80);frame();assert.equal(g.cargo,'NI-001');key('KeyE');key('KeyE',false);frame(80);frame();assert(g.pallets[0].scanned);shot('pickup');
g=mission(2);const a=sandbox.WarehouseCore.BAY_ANGLE,t=sandbox.WarehouseCore.BAYS[0];Object.assign(g.vehicle,{x:t.x+Math.cos(a)*30,y:t.y+Math.sin(a)*30,a,v:0});key('Space');frame(130);key('Space',false);assert(g.done);shot('van-docked');
g=mission(3);assert.equal(g.stage,'pack');g.player.x=160;g.player.y=sandbox.WarehouseCore.POS.boxes.y+25;key('KeyE');key('KeyE',false);frame(80);assert.equal(g.carrying,'box');g.player.x=340;g.player.y=sandbox.WarehouseCore.POS.pack.y+50;key('KeyE');key('KeyE',false);frame(80);assert.equal(g.boxes,1);
g=mission(4);g.player={x:220,y:sandbox.WarehouseCore.wy(995),a:Math.PI};key('KeyE');key('KeyE',false);frame(80);assert(el('modalContent').innerHTML.includes('ZANOTOWAŁEM PLAN'));act('confirm');assert(g.flags.plan);g.mode='fork';g.fork={x:190,y:g.pallets[0].y+90,a:-Math.PI/2,v:0,steer:0};frame();key('KeyE');key('KeyE',false);frame(80);assert.equal(g.cargo,'D1-1');g.fork={x:590,y:sandbox.WarehouseCore.POS.unwrap.y,a:0,v:0,steer:0};key('KeyQ');key('KeyQ',false);assert.equal(g.mode,'foot');frame();key('KeyE');key('KeyE',false);frame(80);assert(g.pallets[0].unwrapped);shot('unwrap');
g=mission(5);g.fork.x=1120;g.fork.y=sandbox.WarehouseCore.wy(670);g.mode='fork';frame(4);shot('production');
key('KeyM');key('KeyM',false);assert(el('modalContent').innerHTML.includes('Beczki do CTP'));act('mail_ctp');assert.equal(g.mail[0].read,true);act('close');
// The dialogue is painted by the production Canvas renderer, including its tail.
el('chaptersBtn').onclick();act('m1');frame(24);assert(sandbox.WarehouseScenes.get());shot('dialogue-office');drain();g=sandbox.WarehouseGame.getState();
sandbox.WarehouseCore.breach(g,'speed');frame();assert.equal(sandbox.WarehouseScenes.get().phase,'approach');assert.equal(el('sceneSpeech').hidden,true);const bhpStart={...sandbox.WarehouseScenes.get().cast.bhp};frame(18);shot('bhp-running');assert(sandbox.WarehouseCore.dist(bhpStart,sandbox.WarehouseScenes.get().cast.bhp)>10);drain();assert(!sandbox.WarehouseScenes.get());
g=mission(5);
if(process.argv.includes('--visual-only')){el('newBtn').onclick();act('yes');frame(24);shot('conference');console.log('Updated graphics, in-world speech, BHP approach / six mission entry points passed.');return;}
// Save in the real game loop, then continue through the same entry point.
frame(320);assert(storage.has(sandbox.WarehouseCore.SAVE_KEY+'-practice'));el('pauseBtn').onclick();act('menu');el('continueBtn').onclick();assert.equal(sandbox.WarehouseGame.getState().mission,5);
// Full campaign through actual UI interactions. Spatial placement is controlled
// by the harness; driving routes are covered separately by geometry checks.
const press=code=>{key(code);key(code,false);frame(code==='KeyE'?80:2);};
function foot(p){g.mode='foot';g.player={x:p.x,y:p.y,a:Math.PI/2};frame();}
function fork(p,a=-Math.PI/2){g.mode='fork';g.fork={x:p.x,y:p.y,a,v:0,steer:0};frame();}
function pick(id){const p=g.pallets.find(x=>x.id===id);fork({x:p.x,y:p.y+90});press('KeyE');assert.equal(g.cargo,id);}
function drop(a=g.mission===3?Math.PI/2:0){const p=g.pallets.find(x=>x.id===g.cargo),d=sandbox.WarehouseCore.destination(g,p);fork({x:d.x-Math.cos(a)*67,y:d.y-Math.sin(a)*67},a);press('KeyE');assert.equal(g.cargo,null);}
function leader(){foot({x:sandbox.WarehouseCore.POS.leader.x,y:sandbox.WarehouseCore.POS.leader.y-70});press('KeyE');drain();}
function computerMail(id,actName){foot({x:220,y:sandbox.WarehouseCore.wy(995)});press('KeyE');act('mail_'+id);if(actName)act(actName);else act('close');frame();}
function next(){act('next');drain();g=sandbox.WarehouseGame.getState();global.gc?.();if(process.argv.includes('--trace-memory'))console.log('campaign mission',g.mission,Math.round(process.memoryUsage().rss/1048576)+' MiB');}
function park(){const t=sandbox.WarehouseCore.BAYS[g.mission===0?3:0],a=sandbox.WarehouseCore.BAY_ANGLE,d=g.mission===0?sandbox.WarehouseCore.VEHICLE.truck.trailerCenter+77-sandbox.WarehouseCore.VEHICLE.truck.hitch:30;Object.assign(g.vehicle,{x:t.x+Math.cos(a)*d,y:t.y+Math.sin(a)*d,a,b:a,v:0});key('Space');frame(130);key('Space',false);assert(g.done);}
el('newBtn').onclick();act('yes');frame(24);shot('conference');drain();g=sandbox.WarehouseGame.getState();assert.equal(g.mission,0);park();next();assert.equal(g.mission,1);
for(let n=1;n<=3;n++){
 pick('NI-00'+n);press('KeyE');
 if(n===3){drain();leader();el('phoneBtn').onclick();act('marysia');drain();g.mode='fork';press('KeyE');}
 drop();
}
leader();pick('NI-CHEM');press('KeyE');drop(0);leader();assert(g.done);next();park();next();assert.equal(g.mission,3);
for(let n=0;n<6;n++){foot({x:160,y:sandbox.WarehouseCore.POS.boxes.y+30});press('KeyE');foot({x:340,y:sandbox.WarehouseCore.POS.pack.y+45});press('KeyE');drain();}
pick('PAKTECH');drop();computerMail('codes','receive');foot({x:228,y:sandbox.WarehouseCore.POS.printer.y+20});press('KeyE');foot({x:825,y:sandbox.WarehouseCore.POS.small.y+50});press('KeyE');assert(g.done);next();assert.equal(g.mission,4);
foot({x:220,y:sandbox.WarehouseCore.wy(995)});press('KeyE');act('confirm');
for(const id of [...sandbox.WarehouseCore.MACHINES,'KARTONY']){
 pick(id);fork({x:590,y:sandbox.WarehouseCore.POS.unwrap.y},0);press('KeyQ');press('KeyE');assert(g.pallets.find(x=>x.id===id).unwrapped);press('KeyQ');drop();
}
foot({x:250,y:sandbox.WarehouseCore.wy(935)});frame(2);assert(g.done);next();assert.equal(g.mission,5);
pick('CTP-DOSTAWA');drop(0);pick('CTP-ZWROT');drop();drain();pick('CTP-ZWROT');drop();pick('POLIMER-2');drop();el('phoneBtn').onclick();act('jarek');drain();frame(190);assert.equal(g.stage,'bdo');computerMail('bdo','print');foot({x:228,y:sandbox.WarehouseCore.POS.printer.y+20});press('KeyE');foot({x:160,y:sandbox.WarehouseCore.POS.van.y+55});press('KeyE');assert(g.done);assert.equal(g.stats.completed.length,6);assert.equal(sandbox.WarehouseCore.evaluation(g.stats).raise,200);act('next');drain();assert(el('modalContent').innerHTML.includes('+200 zł brutto'));shot('finale');
console.log('Canvas / runtime smoke passed: all 6 mission starts, driving brake, pickup, scanner, packing, computer, manual unwrap, mail, save/resume AND complete campaign to 200 PLN finale.');
console.log('Native canvas images:',output);

}
main().catch(e=>{console.error(e);process.exitCode=1;});
