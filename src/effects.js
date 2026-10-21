/* Action animation, atmospheric motion and feedback, independent of mission rules. */
(function(root){
'use strict';
const C=root.WarehouseCore,A=root.WarehouseArt;
const ease=t=>1-Math.pow(1-t,3),mix=(a,b,t)=>a+(b-a)*t;
const durations={pick:.52,scan:.85,drop:.58,unwrap:1.15,pack:.36,collectPrint:.42,deliverLabels:.48,deliverBDO:.48};
const labels={pick:'Podnoszenie palety',scan:'Skanowanie NI',drop:'Odkładanie palety',unwrap:'Zdejmowanie folii',pack:'Przenoszenie kartonu',collectPrint:'Odbieranie wydruku',deliverLabels:'Odkładanie etykiet',deliverBDO:'Przekazanie BDO'};
let busy=null,particles=[],rings=[],tracks=[],shake=0,lastTrail=null,celebrate=0,worldTime=0,reduced=false;
function clear(){busy=null;particles=[];rings=[];tracks=[];shake=0;lastTrail=null;celebrate=0;}
function configure(value){reduced=!!value;}
function start(g,target,commit){
 const duration=durations[target.action];if(!duration)return false;if(busy)return true;
 const p=g.pallets.find(p=>p.id===(target.action==='pick'?target.arg:g.cargo));
 const actor=g.mode==='fork'?g.fork:g.player,hand={x:actor.x,y:actor.y-28},tip=C.front(g.fork,67);
 let from=tip,to=tip;
 if(target.action==='pick'){from=p;to=tip;}
 if(target.action==='drop'){from=tip;to=target.arg==='extinguisher'?C.POS.extinguisher:C.destination(g,p);}
 if(target.action==='pack'){from=target.arg==='take'?C.POS.boxes:hand;to=target.arg==='take'?hand:C.POS.pack;}
 if(target.action==='collectPrint'){from=C.POS.printer;to=hand;}
 if(target.action==='deliverLabels'){from=hand;to=C.POS.small;}
 if(target.action==='deliverBDO'){from=hand;to=C.POS.van;}
 busy={...target,mode:g.mode,duration,elapsed:0,subject:p?{...p}:null,from:{...from},to:{...to},actor:{...actor},commit};
 return true;
}
function burst(x,y,color='#eec975',count=12){if(reduced)return;for(let i=0;i<count;i++){const a=i/count*Math.PI*2;particles.push({x,y,vx:Math.cos(a)*(15+(i%4)*13),vy:Math.sin(a)*32-22,life:.55+(i%3)*.12,max:.8,color,s:1.6+(i%3)});}if(particles.length>130)particles.splice(0,particles.length-130);}
function pulse(x,y,color='#9bd8b5'){rings.push({x,y,life:.7,max:.7,color});}
function event(type,g){
 const p=g.mode==='vehicle'?g.vehicle:g.mode==='fork'?g.fork:g.player;
 if(type==='dropped'||type==='picked'){const f=C.front(g.fork,65);burst(f.x,f.y,'#d6bc8a',8);pulse(f.x,f.y,'#bce4c4');}
 if(type==='scanned'){const f=C.front(g.fork,65);pulse(f.x,f.y,'#92d4b4');}
 if(type==='scanError'){const f=C.front(g.fork,65);pulse(f.x,f.y,'#ed8f77');shake=.12;}
 if(type==='unwrapped'){const f=C.front(g.fork,65);burst(f.x,f.y-15,'#e0f0f4',18);}
 if(type==='warning'){shake=.25;burst(p.x,p.y,'#edbc7c',8);}
 if(type==='complete'){celebrate=2.4;for(let i=0;i<35;i++)particles.push({screen:true,x:90+i*26,y:40+(i%5)*20,vx:Math.sin(i)*25,vy:40+(i%4)*14,life:2.4,max:2.4,color:['#f2cc70','#8cc7b2','#89b7d3'][i%3],s:3+(i%3)});}
 if(type==='fail')shake=.45;
}
function tick(g,dt,playing=true){
 worldTime+=dt;
 if(playing&&busy){
  if(g.failed||g.done){busy=null;}else{busy.elapsed+=dt;if(busy.elapsed>=busy.duration){const done=busy.commit;busy=null;done();}}
 }
 shake=Math.max(0,shake-dt);celebrate=Math.max(0,celebrate-dt);
 for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(!p.screen)p.vy+=42*dt;}
 particles=particles.filter(p=>p.life>0);for(const p of rings)p.life-=dt;rings=rings.filter(p=>p.life>0);
 for(const t of tracks)t.life-=dt;tracks=tracks.filter(t=>t.life>0);
 if(playing&&g.mode!=='foot'){
  const p=g.mode==='fork'?g.fork:g.vehicle;
  if(Math.abs(p.v)>15&&(!lastTrail||Math.hypot(lastTrail.x-p.x,lastTrail.y-p.y)>15)){
   tracks.push({x:p.x,y:p.y,a:p.a,life:g.world==='yard'?12:5,max:g.world==='yard'?12:5,wide:g.mode==='vehicle'?48:34});lastTrail={x:p.x,y:p.y};
   if(g.world==='yard'&&Math.abs(p.v)>65&&Math.abs(p.steer)>.2)burst(p.x,p.y,'#c6c8b85c',2);
  }
 }
 if(tracks.length>200)tracks.splice(0,tracks.length-200);
}
function hidePallet(id){return !!(busy&&busy.action==='pick'&&busy.subject?.id===id);}
function heldCargo(g){if(busy?.action==='drop')return null;return g.pallets.find(p=>p.id===g.cargo);}
function carrying(g){return busy&&['pack','collectPrint','deliverLabels','deliverBDO'].includes(busy.action)?null:g.carrying;}
function drawFloor(c,g,t){
 if(!reduced)for(const p of tracks){c.save();c.translate(p.x,p.y);c.rotate(p.a);c.globalAlpha=p.life/p.max*(g.world==='yard'?.1:.035);for(const y of [-p.wide/2,p.wide/2])A.round(c,-8,y,16,3,1,'#233b4a');c.restore();}
 if(g.mode!=='foot'){
  const v=g.mode==='fork'?g.fork:g.vehicle;c.save();c.translate(v.x,v.y);c.rotate(v.a);
  const glow=c.createLinearGradient(23,0,130,0);glow.addColorStop(0,'#fff3c524');glow.addColorStop(1,'#fff4cf00');A.poly?A.poly(c,[[22,-18],[135,-55],[135,55],[22,18]],glow):null;
  if(v.v< -4&&Math.sin(t*7)>0){A.ellipse(c,-30,0,8,22,'#ffdb7d23');}
  c.restore();
 }
}
function drawAtmosphere(c,g,t){
 if(reduced)return;
 if(g.world==='warehouse'){
  // Working conveyor sheets, status lamps and moving roller highlights.
  for(const y of [C.wy(350),C.wy(540),C.wy(780)]){
   for(let j=0;j<4;j++){const x=1310+((t*19+j*45)%183);A.round(c,x,y+112,22,9,1,'#e8e8d7a6');A.rect(c,x+3,y+115,15,1,'#8fa6ac80');}
   A.ellipse(c,1524,y+17,2.5,2.5,Math.sin(t*2+y)>-.2?'#a5d9aa':'#678f83');
  }
  for(let i=0;i<17;i++){const x=100+((i*113.3+t*4)%1580),y=C.wy(110)+((i*71.7+t*2)%920);A.ellipse(c,x,y,.7+(i%2)*.4,.7+(i%2)*.4,'#fff9e327');}
  if(['printLabels','printBDO'].includes(g.stage)){
   const shift=(Math.sin(t*3)+1)*3;A.round(c,275,C.wy(977),31,16+shift,1,'#fffdf1','#b8c9cb',.5);for(let i=0;i<3;i++)A.rect(c,280,C.wy(981)+i*3,19,1,'#99b0b5');A.ellipse(c,313,C.wy(960),2,2,Math.sin(t*9)>0?'#8ad5ad':'#578e7c');
  }
 }else{
  // A soft rotating beacon at the gatehouse.
  A.ellipse(c,138,765,4,3,Math.sin(t*3)>0?'#edc46c':'#a88c51');
 }
}
function drawWorld(c,g,t){
 for(const r of rings){const u=1-r.life/r.max;c.save();c.globalAlpha=1-u;c.beginPath();c.ellipse(r.x,r.y,18+u*35,8+u*14,0,0,Math.PI*2);c.strokeStyle=r.color;c.lineWidth=2;c.stroke();c.restore();}
 for(const p of particles)if(!p.screen){c.save();c.globalAlpha=Math.min(1,p.life/p.max);A.round(c,p.x,p.y,p.s,p.s*.6,1,p.color);c.restore();}
 if(!busy)return;const b=busy,u=Math.min(1,b.elapsed/b.duration),v=ease(u),x=mix(b.from.x,b.to.x,v),y=mix(b.from.y,b.to.y,v);
 if(['pick','drop'].includes(b.action)&&b.subject){A.pallet(c,b.subject,x,y-Math.sin(u*Math.PI)*7);}
 if(b.action==='scan'){
  const f=C.front(g.fork,66),yy=f.y-36+u*40;c.save();c.strokeStyle='#ef8c6c';c.lineWidth=1.2;c.globalAlpha=.8;
  c.beginPath();c.moveTo(g.fork.x,g.fork.y-13);c.lineTo(f.x-29,yy);c.lineTo(f.x+29,yy);c.stroke();A.round(c,f.x-28,yy-2,56,4,2,'#ff927b62');c.restore();
 }
 if(b.action==='unwrap'){
  const f=C.front(g.fork,66);c.save();c.strokeStyle='#e7f6f7b0';c.lineWidth=2;for(let i=0;i<4;i++){c.beginPath();c.moveTo(f.x-23,f.y-15+i*5);c.bezierCurveTo(f.x-45-u*25,f.y-45,f.x+35+u*30,f.y-40,f.x+25+u*25,f.y+i*6-30);c.stroke();}c.restore();
 }
 if(b.action==='pack'){A.crate(c,x,y-Math.sin(u*Math.PI)*13,.7);}
 if(['collectPrint','deliverLabels','deliverBDO'].includes(b.action)){c.save();c.translate(x,y-Math.sin(u*Math.PI)*18);c.rotate(Math.sin(u*Math.PI)*.18);A.round(c,-8,-12,17,25,2,'#fffdf1','#a2bac4',.7);for(let i=0;i<5;i++)A.rect(c,-4,-8+i*4,9,1,'#88a9b5');c.restore();}
}
function drawHUD(c,w,h){
 if(busy){const u=Math.min(1,busy.elapsed/busy.duration),x=w/2-133,y=h-(busy.mode==='foot'?108:190);
  A.round(c,x,y,266,60,11,'#173b50ed','#b2d0d740',1);A.text(c,labels[busy.action]||'Praca w toku',w/2,y+19,12,'#edf4e9','center');A.round(c,x+20,y+37,226,5,3,'#6d8f993e');A.round(c,x+20,y+37,Math.max(1,226*u),5,3,'#f4cd76');
 }
 if(celebrate>0)for(const p of particles)if(p.screen){c.save();c.globalAlpha=Math.min(1,p.life);c.translate(p.x,p.y);c.rotate(p.life*3);A.rect(c,0,0,p.s,p.s*.55,p.color);c.restore();}
}
function offset(t){return reduced?{x:0,y:0}:{x:Math.sin(t*61)*shake*5,y:Math.cos(t*54)*shake*4};}
root.WarehouseFX={start,tick,event,drawFloor,drawAtmosphere,drawWorld,drawHUD,offset,hidePallet,heldCargo,carrying,clear,configure,isBusy:()=>!!busy,getBusy:()=>busy};
if(typeof module!=='undefined')module.exports=root.WarehouseFX;
})(typeof globalThis!=='undefined'?globalThis:this);
