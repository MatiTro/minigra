/* Shared floor plan and oriented collisions. Rendering and driving use this map. */
(function(root){
'use strict';
const C=root.WarehouseCore||(typeof require==='function'?require('./core.js'):null),Y=C.Y;
const rect=(x,y,w,h,kind='wall')=>({x,y:C.wy(y),w,h,kind});
const sizes={warehouse:{w:1680,h:1560},yard:{w:1240,h:940}};
const bays=[157,342,527,712];
const walls=[rect(48,48,15,1045),rect(1617,48,15,1045),rect(48,1138,1584,15),
 rect(48,48,42,15),rect(225,48,50,15),rect(410,48,50,15),rect(595,48,50,15),rect(780,48,852,15),
 rect(925,60,16,500),rect(925,860,16,40),
 rect(65,895,165,13),rect(325,895,170,13),rect(620,895,140,13),rect(915,895,90,13),
 rect(380,900,14,238),rect(705,900,14,238),rect(1005,900,14,238),
 rect(1385,925,16,65),rect(1385,1115,16,23),rect(1385,925,232,15),
 rect(1225,63,15,47),rect(1225,280,15,20),rect(1225,300,392,15)];
const racks=[];for(const y of [330,650])for(let i=0;i<3;i++)racks.push({...rect(115+i*260,y,150,58,'rack'),id:String.fromCharCode(65+i)+(y===330?'01':'02')});
const presses=[350,540,780].map((y,i)=>({...rect(1280,y,270,135,'press'),label:['DRUK / D1','DRUK / D2','PAKOWANIE / D3'][i]}));
const furniture=[rect(85,945,115,38,'desk'),rect(260,950,60,36,'printer'),rect(245,1036,110,38,'desk'),rect(490,985,120,95,'table')];
const trailer={x:656,y:200,w:112,h:306,rear:{x:712,y:506}};
function obstacles(world,mission){
 if(world==='yard'){
  const bay=C.BAYS[1],a=C.BAY_ANGLE,v={...C.front({...bay,a},C.VEHICLE.truck.trailerCenter+77-C.VEHICLE.truck.hitch),a,b:a,kind:'truck'};
  return [{x:35,y:40,w:1170,h:96},{x:30,y:40,w:15,h:850},{x:1190,y:40,w:15,h:850},{x:30,y:880,w:900,h:15},...vehicleBoxes(v).map(b=>({...b,kind:'occupied'})),{x:820,y:765,w:98,h:100}];
 }
 const out=[...walls,...racks,...presses,...furniture];
 bays.forEach((x,i)=>{if(!(mission===1&&i===3))out.push(rect(x-67,55,134,24,'door'));});
 if(mission===1)out.push({x:650,y:195,w:7,h:308,kind:'trailer'},{x:768,y:195,w:7,h:308,kind:'trailer'},{x:650,y:195,w:125,h:7,kind:'trailer'});
 if(mission===3)out.push(...vehicleBoxes({kind:'van',x:160,y:Y+140,a:-Math.PI/2}).map(b=>({...b,kind:'van'})));
 if(mission===5)out.push(rect(1095,530,68,65,'roadPallet'));
 return out;
}
function corners(b){const ca=Math.cos(b.a||0),sa=Math.sin(b.a||0),x=b.cx??b.x+b.w/2,y=b.cy??b.y+b.h/2;return [[-b.w/2,-b.h/2],[b.w/2,-b.h/2],[b.w/2,b.h/2],[-b.w/2,b.h/2]].map(([u,v])=>({x:x+u*ca-v*sa,y:y+u*sa+v*ca}));}
function overlaps(a,b){
 const ca=corners(a),cb=corners(b),axes=[a.a||0,(a.a||0)+Math.PI/2,b.a||0,(b.a||0)+Math.PI/2];
 for(const ang of axes){const x=Math.cos(ang),y=Math.sin(ang),aa=ca.map(p=>p.x*x+p.y*y),bb=cb.map(p=>p.x*x+p.y*y);if(Math.max(...aa)<=Math.min(...bb)+.001||Math.max(...bb)<=Math.min(...aa)+.001)return false;}return true;
}
function boxAt(p,offset,length,width){const q=C.front(p,offset);return {cx:q.x,cy:q.y,w:length,h:width,a:p.a};}
function vehicleBoxes(v){
 if(v.kind==='truck'){const t=C.trailer(v);return [boxAt(v,32,136,66),boxAt(t,0,154,62)];}
 return [boxAt(v,27,114,60)];
}
function forkliftBoxes(f,loaded=false){const b=[boxAt(f,-5,80,54)];if(loaded)b.push(boxAt(f,67,46,58));return b;}
function collisionBoxes(g,p,loaded=!!g.cargo){return g.mode==='vehicle'?vehicleBoxes(p):forkliftBoxes(p,loaded);}
function palletObstacles(g){return g.pallets.filter(p=>!p.done&&p.id!==g.cargo&&!(g.mission===3&&g.stage==='pack')).map(p=>({cx:p.x,cy:p.y,w:46,h:56,a:0,kind:'pallet',id:p.id}));}
function poseHit(g,p,loaded=!!g.cargo){
 const boxes=collisionBoxes(g,p,loaded),size=sizes[g.world],obs=[...obstacles(g.world,g.mission),...(g.world==='warehouse'?palletObstacles(g):[])];
 for(const b of boxes){if(corners(b).some(p=>p.x<46||p.x>size.w-46||p.y<8||p.y>size.h-47))return {kind:'edge'};for(const ob of obs)if(overlaps(b,ob))return ob;}return null;
}
function pointFree(g,p,r=14,ignorePallets=false){const size=sizes[g.world];if(p.x-r<46||p.x+r>size.w-46||p.y-r<8||p.y+r>size.h-47)return false;const box={cx:p.x,cy:p.y,w:r*2,h:r*2};if(obstacles(g.world,g.mission).some(ob=>overlaps(box,ob)))return false;if(!ignorePallets&&g.world==='warehouse'&&palletObstacles(g).some(ob=>overlaps(box,ob)))return false;return true;}
function forkExit(g){const f=g.fork;for(const a of [f.a+Math.PI/2,f.a-Math.PI/2,f.a+Math.PI,f.a]){const p={x:f.x+Math.cos(a)*58,y:f.y+Math.sin(a)*58};if(pointFree(g,p,15))return p;}return null;}
function lineFree(g,from,to,r=1){const d=C.dist(from,to),steps=Math.max(1,Math.ceil(d/8));for(let i=0;i<=steps;i++)if(!pointFree(g,{x:from.x+(to.x-from.x)*i/steps,y:from.y+(to.y-from.y)*i/steps},r,true))return false;return true;}
function walkPath(g,start,end,r=14){
 if(lineFree(g,start,end,r))return [{...end}];
 const step=16,size=sizes[g.world],w=Math.ceil(size.w/step),h=Math.ceil(size.h/step),key=(x,y)=>y*w+x,sx=Math.round(start.x/step),sy=Math.round(start.y/step),queue=[[sx,sy]],parents=new Map([[key(sx,sy),null]]);let finish=null;
 for(let n=0;n<queue.length;n++){const[x,y]=queue[n],p={x:x*step,y:y*step};if(C.dist(p,end)<step*1.5&&lineFree(g,p,end,r)){finish=key(x,y);break;}
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,k=key(a,b);if(a<2||b<1||a>=w-2||b>=h-2||parents.has(k)||!pointFree(g,{x:a*step,y:b*step},r,true))continue;parents.set(k,key(x,y));queue.push([a,b]);}
 }
 if(finish===null)return null;const path=[{...end}];for(let k=finish;parents.get(k)!==null;k=parents.get(k))path.unshift({x:k%w*step,y:Math.floor(k/w)*step});return path;
}
const api={Y,sizes,walls,racks,presses,bays,trailer,furniture,obstacles,corners,overlaps,boxAt,vehicleBoxes,forkliftBoxes,poseHit,pointFree,forkExit,lineFree,walkPath};root.WarehouseWorld=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
