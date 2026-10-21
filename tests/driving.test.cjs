'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),C=require('../src/core.js'),W=require('../src/world.js'),P=require('../src/physics.js');
const dt=1/60;
function step(g,input,n=1){for(let i=0;i<n;i++){const r=P.step(g,input,dt);assert(!r.hit,`collision ${r.hit?.kind} at ${JSON.stringify(g.fork)} cargo=${g.cargo}`);assert(!g.failed,g.failed);}}
function stop(g,steer=0){step(g,{brake:true,steer},70);}
function go(g,target,gear=1){
 const p=g.fork;let n=0;for(;n<6000;n++){const d=C.dist(p,target);if(d<6+Math.abs(p.v)**2/420)break;const desired=Math.atan2(target.y-p.y,target.x-p.x)+(gear<0?Math.PI:0),error=C.angle(desired-p.a);step(g,{gas:true,gear,precision:true,steer:C.clamp(error*2.8*gear,-1,1)});}
 assert(n<6000,'route did not converge');stop(g);assert(C.dist(p,target)<12,`missed target ${JSON.stringify(target)}, pose ${JSON.stringify(p)}`);
}
function turn(g,dir,gear=1){
 stop(g,dir*gear);const p=g.fork,start=p.a,target=Math.PI/2;
 for(let n=0;n<1400;n++){const moved=Math.abs(C.angle(p.a-start)),r=34/Math.tan(Math.abs(p.steer)||.72),braking=Math.abs(p.v)**2/(420*r);if(moved>=target-braking-.006)break;step(g,{gas:true,gear,precision:true,steer:dir*gear});if(n===1399)assert.fail('turn did not converge');}
 stop(g,dir*gear);assert(Math.abs(Math.abs(C.angle(p.a-start))-target)<.035,'quarter turn drift');stop(g);
}
function pick(g,id){assert(C.action(g,'pick',id),`cannot pick ${id}, ${JSON.stringify(C.pickupStatus(g,g.pallets.find(p=>p.id===id)))}`);assert(!W.poseHit(g,g.fork),'loaded pickup pose is blocked');}
function drop(g){assert(C.dropStatus(g,g.pallets.find(p=>p.id===g.cargo)).valid,'drop pose invalid');assert(C.action(g,'drop'));}
function onFork(g,x,y,a){g.elapsed=14;g.mode='fork';g.fork={x,y,a,v:0,steer:0};assert(!W.poseHit(g,g.fork),`initial forklift pose is blocked: ${JSON.stringify(W.poseHit(g,g.fork))}`);}
test('Actual steering and reversing remove all four pallets from inside the trailer through ramp 4',()=>{
 const g=C.create(1);onFork(g,712,650,-Math.PI/2);
 for(let i=0;i<4;i++){
  if(i===3){g.flags.chemAllowed=true;g.progress=3;}
  const p=g.pallets[i];go(g,{x:712,y:p.y+90});pick(g,p.id);go(g,{x:712,y:625},-1);
  assert(C.front(g.fork,67).y>W.trailer.rear.y+25,'cargo did not clear trailer');
  // Continue to a verified clear apron, then make room for the next pallet.
  g.cargo=null;p.done=true;g.progress=i+1;
 }
});
test('Loaded forklift steers around production obstacle, enters CTP and returns to the warehouse',()=>{
 const g=C.create(5);onFork(g,320,C.wy(205)-67,Math.PI/2);pick(g,'CTP-DOSTAWA');
 go(g,{x:320,y:C.wy(760)});turn(g,-1);go(g,{x:991,y:g.fork.y});turn(g,-1);
 // Left side of the road is clear even with a full pallet.
 go(g,{x:g.fork.x,y:665});turn(g,1);go(g,{x:C.POS.ctp.x-67,y:g.fork.y});
 assert(Math.abs(g.fork.y-C.POS.ctp.y)<32,`CTP row mismatch ${g.fork.y}`);drop(g);
 // Return to the lane using reverse rather than turning around inside the bay.
 go(g,{x:1090,y:g.fork.y},-1);turn(g,-1,-1);go(g,{x:g.fork.x,y:C.wy(770)},-1);
 assert(g.fork.y>1100);
});
test('Loaded forklift has a straight and reversible route into the chemical store',()=>{
 const g=C.create(1);g.progress=3;g.flags.chemAllowed=true;const p=g.pallets[3];onFork(g,1085,C.wy(820),Math.PI/2);g.cargo=p.id;p.location='fork';
 go(g,{x:1085,y:C.POS.chem.y-40});turn(g,-1);go(g,{x:C.POS.chem.x-67,y:g.fork.y});p.scanned=true;drop(g);go(g,{x:1100,y:g.fork.y},-1);
});
test('Drobnica accepts the exact placement and rejects a small move into extinguisher access',()=>{
 const g=C.create(3);g.stage='transport';g.boxes=6;onFork(g,825,C.wy(800),Math.PI/2);g.cargo='PAKTECH';go(g,{x:825,y:C.POS.small.y-67});assert(C.dropStatus(g,g.pallets[0]).valid);drop(g);go(g,{x:825,y:C.wy(800)},-1);
 const h=C.create(3);h.stage='transport';h.cargo='PAKTECH';h.mode='fork';h.fork={x:846,y:C.POS.small.y-67,a:Math.PI/2,v:0,steer:0};assert(C.dropStatus(h,h.pallets[0]).fire);assert(!C.action(h,'drop'));assert.equal(h.stats.bhp,1);assert.equal(h.cargo,'PAKTECH');
});
test('A truck docks by actual reverse driving, collision checks and brake hold',()=>{
 const g=C.create(0),a=C.BAY_ANGLE,b=C.BAYS[3];Object.assign(g.vehicle,{...C.front({...b,a},440),a,b:a,v:0,steer:0});
 for(let n=0;n<2400&&!g.done;n++){const d=C.dist(C.rear(g.vehicle),b),brake=d<12;const r=P.step(g,{gas:!brake,gear:-1,brake,precision:true,steer:0},dt);assert(!r.hit,JSON.stringify(r.hit));}
 assert(g.done);assert(C.dist(C.rear(g.vehicle),b)<18);
});
test('Reverse bends the trailer opposite to the tractor, forward driving straightens the articulation',()=>{
 const g=C.create(0);Object.assign(g.vehicle,{x:700,y:600,a:0,b:0,v:0,steer:0});for(let n=0;n<120;n++)C.vehicleStep(g,{gas:true,gear:-1,steer:.7,precision:true},dt);
 assert(g.vehicle.a<0);assert(g.vehicle.b>0);const bent=Math.abs(C.angle(g.vehicle.a-g.vehicle.b));for(let n=0;n<900;n++)C.vehicleStep(g,{gas:true,gear:1,steer:0,precision:true},dt);assert(Math.abs(C.angle(g.vehicle.a-g.vehicle.b))<bent*.25);
});
test('Steering integration is stable at 30 and 120 frames per second',()=>{
 const a=C.create(0),b=C.create(0);for(let i=0;i<180;i++)C.vehicleStep(a,{gas:true,steer:.6,precision:true},1/30);for(let i=0;i<720;i++)C.vehicleStep(b,{gas:true,steer:.6,precision:true},1/120);assert(C.dist(a.vehicle,b.vehicle)<.2);assert(Math.abs(C.angle(a.vehicle.b-b.vehicle.b))<.003);
});
module.exports={go,turn,step,stop,onFork,pick,drop};

test('Three unloaded NI pallets can actually reach storage and the empty forklift can return to the trailer',()=>{
 const g=C.create(1);onFork(g,712,650,-Math.PI/2);
 for(let i=0;i<3;i++){
  const p=g.pallets[i];go(g,{x:712,y:p.y+90});pick(g,p.id);go(g,{x:712,y:625},-1);turn(g,-1,-1);go(g,{x:835,y:g.fork.y},-1);turn(g,1,-1);go(g,{x:g.fork.x,y:950},-1);turn(g,-1);go(g,{x:C.destination(g,p).x+67,y:g.fork.y});
  assert(C.action(g,'scan'));if(i===2){assert(C.action(g,'leader'));assert(C.action(g,'call','marysia'));assert(C.action(g,'scan'));}drop(g);
  if(i<2){go(g,{x:281,y:g.fork.y},g.fork.x>281?1:-1);turn(g,1,-1);go(g,{x:g.fork.x,y:659});turn(g,1);go(g,{x:673,y:g.fork.y});turn(g,-1);}
 }
 assert.equal(g.progress,3);
});
test('CTP return pallet and the staged second pallet can both be driven onto Polimer loading point',()=>{
 const g=C.create(5),out=g.pallets[0];onFork(g,C.POS.ctp.x-67,C.POS.ctp.y,0);g.cargo=out.id;drop(g);
 // Empty forklift goes around the delivery position to the return row.
 turn(g,-1);go(g,{x:g.fork.x,y:574});turn(g,-1);go(g,{x:C.POS.returns.x+90,y:g.fork.y});pick(g,'CTP-ZWROT');
 go(g,{x:1060,y:610});turn(g,-1);go(g,{x:g.fork.x,y:C.wy(750)});turn(g,1);go(g,{x:375,y:g.fork.y});turn(g,1);go(g,{x:g.fork.x,y:620});turn(g,-1);go(g,{x:C.POS.ramp1.x+67,y:g.fork.y});drop(g);
 assert.equal(g.stage,'load');pick(g,'CTP-ZWROT');drop(g);
 // Approach the staged pallet from the east, then make a measured S manoeuvre.
 go(g,{x:430,y:g.fork.y},-1);turn(g,-1);turn(g,1);pick(g,'POLIMER-2');turn(g,1);turn(g,-1);go(g,{x:C.POS.van.x+67,y:g.fork.y});drop(g);
 assert.equal(g.flags.loaded,2);assert.equal(g.stage,'callJarek');
});
test('A pallet from the lower rack row can be driven to manual unwrapping and its buffer destination',()=>{
 const g=C.create(4);C.action(g,'plan');const p=g.pallets.find(p=>p.id==='D2-2');onFork(g,p.x,p.y+90,-Math.PI/2);pick(g,p.id);turn(g,1);go(g,{x:C.POS.unwrap.x-67,y:C.POS.unwrap.y+45});const exit=W.forkExit(g);assert(exit,'no safe exit beside the unwrapping station');g.mode='foot';g.player={...exit,a:0};assert(W.pointFree(g,g.player,15));const path=W.walkPath(g,g.player,{x:C.POS.unwrap.x,y:C.POS.unwrap.y-15},13);assert(path,'cannot walk from the parked forklift to unwrapping');for(const target of path){let n=0;while(C.dist(g.player,target)>4&&n++<400){P.step(g,{dx:target.x-g.player.x,dy:target.y-g.player.y},dt);}assert(n<400);}assert(C.dist(g.player,C.POS.unwrap)<125);assert(C.action(g,'unwrap'));g.mode='fork';go(g,{x:800,y:g.fork.y});turn(g,-1);const dest=C.destination(g,p);go(g,{x:dest.x,y:dest.y+67});drop(g);assert.equal(g.progress,1);
});
test('Vehicle movement into a worker causes the immediate pedestrian ending',()=>{const g=C.create(5);onFork(g,1099,C.wy(735)+70,-Math.PI/2);g.elapsed=0;for(let i=0;i<90&&!g.failed;i++){C.tick(g,dt);P.step(g,{gas:true,gear:1,precision:true},dt);}assert.equal(g.failed,'pedestrian');assert.equal(g.stats.briefings,0);});

test('All five buffer pallets and the hidden cartons can be driven through unwrapping to their destinations',()=>{
 const g=C.create(4);C.action(g,'plan');
 for(const id of [...C.MACHINES,'KARTONY']){
  const p=g.pallets.find(p=>p.id===id),lower=p.y>1080,hidden=id==='KARTONY',side=id==='D2-1';
  onFork(g,p.x+(side?90:0),p.y+(side?0:hidden?-90:90),side?Math.PI:hidden?Math.PI/2:-Math.PI/2);pick(g,id);
  if(side){turn(g,-1,-1);go(g,{x:g.fork.x,y:C.POS.unwrap.y-39});turn(g,1);go(g,{x:C.POS.unwrap.x+67,y:g.fork.y});}
  else if(!lower){if(!hidden)go(g,{x:g.fork.x,y:956},-1);turn(g,hidden?-1:1);go(g,{x:800,y:g.fork.y});turn(g,1);go(g,{x:g.fork.x,y:C.POS.unwrap.y-39});turn(g,1);go(g,{x:C.POS.unwrap.x+67,y:g.fork.y});}
  else{go(g,{x:g.fork.x,y:1210},-1);turn(g,1);go(g,{x:C.POS.unwrap.x-67,y:C.POS.unwrap.y+45});}
  const exit=W.forkExit(g);assert(exit,'no safe exit beside the unwrapping station');g.mode='foot';g.player={...exit,a:0};assert(W.pointFree(g,g.player,15));const path=W.walkPath(g,g.player,{x:C.POS.unwrap.x,y:C.POS.unwrap.y-15},13);assert(path,'cannot walk from the parked forklift to unwrapping');for(const target of path){let n=0;while(C.dist(g.player,target)>4&&n++<400){P.step(g,{dx:target.x-g.player.x,dy:target.y-g.player.y},dt);}assert(n<400);}assert(C.dist(g.player,C.POS.unwrap)<125);assert(C.action(g,'unwrap'));g.mode='fork';
  // The extra cartons go to the packing field below the buffer. Reverse
  // toward it from unwrapping rather than turning back into the upper aisle.
  if(hidden){const dest=C.destination(g,p);go(g,{x:dest.x+67,y:dest.y},-1);drop(g);continue;}
  // Return to the wide lane beside the buffer without turning in the racks.
  if(lower){go(g,{x:800,y:g.fork.y});turn(g,-1);}
  else{go(g,{x:920,y:g.fork.y},-1);turn(g,1);}
  const dest=C.destination(g,p);go(g,{x:dest.x,y:dest.y+67});drop(g);
 }
 assert.equal(g.progress,5);assert(g.flags.cartonDone);g.mode='foot';assert(C.action(g,'office'));assert(g.done);
});
