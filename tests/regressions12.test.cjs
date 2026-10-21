'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),C=require('../src/core'),W=require('../src/world'),P=require('../src/physics');
const dt=1/60;
test('Every mission starts with a free forklift footprint and can move in either gear',()=>{
 for(const mission of [1,3,4,5])for(const gear of [1,-1]){
  const g=C.create(mission);g.mode='fork';const start={...g.fork};assert(!W.poseHit(g,g.fork),`spawn blocked, mission ${mission}`);
  for(let i=0;i<42;i++){const r=P.step(g,{gas:true,gear,precision:true},dt);assert(!r.hit,`cannot leave spawn, mission ${mission}, gear ${gear}`);}
  assert(C.dist(g.fork,start)>10,`forklift stuck, mission ${mission}`);
 }
});
test('Buffer forklift can immediately pick the nearest pallet without intersecting another object',()=>{
 const g=C.create(4);C.action(g,'plan');g.mode='fork';assert(C.action(g,'pick','D3-1'));assert(!W.poseHit(g,g.fork));
 for(let i=0;i<100;i++)assert(!P.step(g,{gas:true,gear:1,precision:true,steer:1},dt).hit);
 assert(g.fork.x>C.POS.fork.x+20);
});
test('Both deliveries start nose inward at the visible entrance and drive away from it',()=>{
 for(const mission of [0,2]){const g=C.create(mission),v=g.vehicle,start={...v};assert(v.x>930&&v.y>720);assert.equal(v.a,-Math.PI/2);assert(!W.poseHit(g,v));
 for(let i=0;i<150;i++)assert(!P.step(g,{gas:true,gear:1,precision:true},dt).hit);assert(v.y<start.y-50);}
});
test('The trailer kingpin stays on the fifth wheel through forward turns and reversing',()=>{
 const g=C.create(0);for(const gear of [1,-1])for(let i=0;i<480;i++){
  C.vehicleStep(g,{gas:true,gear,precision:true,steer:Math.sin(i/80)*.8},dt);const t=C.trailer(g.vehicle),pin=C.front(t,C.VEHICLE.truck.trailerCenter);assert(C.dist(pin,C.hitch(g.vehicle))<1e-9);
  // The front of a semitrailer overlaps its kingpin, rather than trailing
  // behind it on a drawbar. Both footprints contain the shared joint.
  assert(W.vehicleBoxes(g.vehicle).every(b=>W.overlaps(b,{cx:pin.x,cy:pin.y,w:1,h:1})));
 }
});
test('Paktech rolls substantially downhill, can climb back on reverse and holds on the brake',()=>{
 const g=C.create(2),a=C.BAY_ANGLE,b=C.BAYS[0];Object.assign(g.vehicle,{...C.front({...b,a},45),a,v:0,steer:0});const start={...g.vehicle};
 for(let i=0;i<120;i++)assert(!P.step(g,{gas:false,brake:false},dt).hit);assert(C.dist(g.vehicle,start)>45,'rollback too gentle');
 for(let i=0;i<120;i++)P.step(g,{brake:true},dt);const held={...g.vehicle};for(let i=0;i<120;i++)P.step(g,{brake:true},dt);assert(C.dist(g.vehicle,held)<.01);
 for(let i=0;i<120;i++)assert(!P.step(g,{gas:true,gear:-1,precision:true},dt).hit);assert(g.vehicle.v<-10,'van cannot overcome the slope');
 const flat=C.create(2);for(let i=0;i<120;i++)P.step(flat,{},dt);assert.equal(flat.vehicle.v,0,'entrance should be flat');
});
test('Crossing pedestrians are continuous across both ends and the cycle boundary',()=>{
 const g=C.create(5);for(let i=0;i<2;i++)for(let t=0;t<72;t+=.02){g.elapsed=t;const p=P.pedestrians(g)[i];g.elapsed=t+.02;const q=P.pedestrians(g)[i];assert(C.dist(p,q)<.7,`pedestrian ${i} jumped at ${t}`);}
});
test('The runner starts visibly beside the road, warns, crosses off the zebra and stays on the far side',()=>{
 const g=C.create(5);g.mode='fork';g.elapsed=10;g.fork={x:1080,y:C.wy(620)+200,a:-Math.PI/2,v:20,steer:0};P.step(g,{brake:true},dt);assert(g.flags.runner);assert(C.takeEvents(g).some(e=>e.type==='runner'));
 let p=P.pedestrians(g).find(p=>p.runner);assert.equal(p.x,1254);assert(!p.moving);g.elapsed+=1;assert.equal(P.pedestrians(g).find(p=>p.runner).x,1254);
 g.elapsed+=1.2;p=P.pedestrians(g).find(p=>p.runner);assert(p.moving&&p.x>1000&&p.x<1150);assert([425,735].every(y=>Math.abs(p.y-C.wy(y+25))>60));
 g.elapsed+=8;p=P.pedestrians(g).find(p=>p.runner);assert.equal(p.x,900);assert(!p.moving);g.elapsed+=30;assert.equal(P.pedestrians(g).find(p=>p.runner).x,900);
});
test('The new layout is smaller and previous 1.1 saves restart the current mission with completed work retained',()=>{
 assert(W.sizes.warehouse.w*W.sizes.warehouse.h<1800*1620*.91);const old=C.snapshot(C.create(4));old.version='1.1.0';old.stats.completed=[0,1,2,3];const restored=C.load(JSON.stringify(old));assert.deepEqual(restored.stats.completed,[0,1,2,3]);assert.equal(restored.mission,4);assert(restored.flags.migrated);assert(!W.poseHit({...restored,mode:'fork'},restored.fork));
});
