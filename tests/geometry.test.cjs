'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),C=require('../src/core.js'),W=require('../src/world.js');
// Use complete oriented forklift + cargo bodies, not a point/radius flood fill.
const angles=[-Math.PI/2,0,Math.PI/2,Math.PI];
function posesAt(g,point,loaded){return angles.map(a=>({...C.front({...point,a},-90),a,v:0,steer:0})).filter(f=>!W.poseHit(g,f,loaded));}
test('Every source pallet has a collision-free approach and a valid fully loaded pickup footprint',()=>{
 for(const mission of [1,3,4,5]){const g=C.create(mission);g.mode='fork';
  for(const p of g.pallets){const approaches=posesAt(g,p,false);assert(approaches.length,'no approach to '+p.id);g.cargo=p.id;assert(approaches.some(f=>!W.poseHit(g,f,true)),'loaded pickup blocked '+p.id);g.cargo=null;if(mission===1)p.done=true;}
 }
});
test('Each destination has a collision-free full cargo placement pose',()=>{
 for(const mission of [1,3,4,5]){const g=C.create(mission);g.mode='fork';for(const p of g.pallets){g.cargo=p.id;const d=C.destination(g,p),found=angles.some(a=>{g.fork={...C.front({...d,a},-67),a,v:0,steer:0};return C.dropStatus(g,p).valid&&!W.poseHit(g,g.fork,true);});assert(found,'no loaded placement pose for '+p.id+' at '+JSON.stringify(d));} }
});
test('On-foot paths connect the office, parked forklift, packing, printer, labels and conference',()=>{
 const g=C.create(3);for(const p of [C.POS.fork,C.at(220,995),C.at(228,1020),C.at(825,1095),C.POS.boxes,C.at(340,220),C.at(450,1040)])assert(W.walkPath(g,g.player,p,13),'no walking route to '+JSON.stringify(p));
});
