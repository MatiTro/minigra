/* The same movement, swept collision checks and pedestrians run in the game and tests. */
(function(root){
'use strict';
const C=root.WarehouseCore||(typeof require==='function'?require('./core.js'):null),W=root.WarehouseWorld||(typeof require==='function'?require('./world.js'):null);
function pedestrians(g){
 if(g.world!=='warehouse'||![1,5].includes(g.mission))return [];
 // Both directions are part of one continuous walk. Waiting happens at the
 // ends of the crossing, never by teleporting the character back to its start.
 const people=[425,735].map((y,i)=>{const t=(g.elapsed+i*8)%24,back=t>=15,u=t<3?0:t<12?(t-3)/9:t<15?1:1-(t-15)/9,out=(i===0)!==back;return {x:i===0?966+u*266:1232-u*266,y:C.wy(y+25),a:out?0:Math.PI,id:i,moving:t>3&&t<12||t>15};});
 const started=g.flags.runner?.at,age=started===undefined?-1:g.elapsed-started,u=C.clamp((age-1.2)/2.15,0,1);
 people.push({x:1254-u*354,y:C.wy(620),a:Math.PI,id:'runner',runner:true,moving:age>1.2&&u<1});
 return people;
}
function step(g,input,dt){
 if(g.done||g.failed)return {moved:0};const p=g.mode==='vehicle'?g.vehicle:g.mode==='fork'?g.fork:g.player,before={...p};
 if(g.mode==='foot'){
  let dx=input.dx||0,dy=input.dy||0,d=Math.hypot(dx,dy);if(d){dx/=d;dy/=d;p.a=Math.atan2(dy,dx);const speed=g.carrying?122:155,n=Math.max(1,Math.ceil(speed*dt/4));for(let i=0;i<n;i++){const xx=p.x+dx*speed*dt/n,yy=p.y+dy*speed*dt/n;if(W.pointFree(g,{x:xx,y:p.y},13))p.x=xx;if(W.pointFree(g,{x:p.x,y:yy},13))p.y=yy;}}
  return {moved:C.dist(p,before),hit:null};
 }
 if(g.world==='warehouse'&&g.mode==='fork'&&[1,5].includes(g.mission)&&!g.flags.runner&&g.elapsed>8){
  const row=C.wy(620),dy=row-p.y,d=Math.abs(dy);
  // A visible worker waits on the verge for 1.2 s before rushing out. The
  // encounter begins far enough ahead to stop; it never spawns under a load.
  if(p.x>960&&p.x<1230&&d>155&&d<260&&dy*Math.sin(p.a)*p.v>0){g.flags.runner={at:g.elapsed};C.emit(g,'runner');}
 }
 const n=Math.max(1,Math.ceil(dt*120));let hit=null;
 for(let i=0;i<n;i++){
  const safe={...p};C.vehicleStep(g,input,dt/n);hit=W.poseHit(g,p);if(hit){const impact=Math.abs(safe.v);Object.assign(p,safe);p.v=0;g.dockHold=0;if(impact>21&&g.collisionCooldown<=0){g.collisionCooldown=3;C.breach(g,'collision');}break;}
  if(g.mode==='fork')for(const person of pedestrians(g)){
   const pb={cx:person.x,cy:person.y-5,w:24,h:24};if(Math.abs(p.v)>3&&W.forkliftBoxes(p,!!g.cargo).some(b=>W.overlaps(b,pb))){C.breach(g,'pedestrian');break;}
  }
 }
 if(g.world==='warehouse'&&g.mode==='fork'&&!g.failed&&g.bhpCooldown<=0&&p.x>956&&p.x<1245&&[425,735].some(y=>Math.abs(p.y-C.wy(y+24))<52)&&Math.abs(p.v)>60){g.bhpCooldown=14;p.v=0;C.breach(g,'speed');}
 p.brakeLights=!!input.brake;
 if(g.mode==='vehicle'&&!hit)C.parking(g,dt,!!input.brake);
 return {moved:C.dist(p,before),hit};
}
const api={step,pedestrians};root.WarehousePhysics=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
