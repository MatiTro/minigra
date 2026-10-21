/* In-world conversations: approach first, then speech. No DOM dependency. */
(function(root){
'use strict';
const C=root.WarehouseCore||(typeof require==='function'?require('./core.js'):null),W=root.WarehouseWorld||(typeof require==='function'?require('./world.js'):null);
let state=null;
function remote(who){return ['guard','marysia','jarek'].includes(who)||!!(state?.phone&&who!=='wojtek');}
function begin(g,lines,options={}){
 const player=g.mode==='fork'?g.fork:g.mode==='vehicle'?C.front(g.vehicle,g.vehicle.kind==='truck'?60:27):g.player;
 const cast={wojtek:{...player,who:'wojtek',visible:g.mode==='foot',seated:false,walk:false},leader:{...C.POS.leader,a:Math.PI/2,who:'leader',visible:true,seated:true,walk:false}};
 if(options.conference){cast.wojtek={x:451,y:C.wy(1040),a:0,who:'wojtek',visible:true,seated:true};cast.leader={x:650,y:C.wy(1040),a:Math.PI,who:'leader',visible:true,seated:true};}
 state={lines,index:0,phase:options.ringing?'ringing':'talk',phone:!!options.phone,caller:options.caller||'guard',cast,elapsed:0,lineTime:0,approaches:[],caption:options.caption||''};
 if(options.approach){
  const who=options.approach,base=cast.wojtek;let end=null,start=null,path=null;
  for(const offset of [{x:-75,y:0},{x:75,y:0},{x:0,y:70},{x:-65,y:60}]){const p={x:base.x+offset.x,y:base.y+offset.y};if(W.pointFree(g,p,15)){end=p;break;}}
  end=end||{x:base.x-60,y:base.y};
  if(who==='leader'){const home=C.at(350,1095),route=W.walkPath(g,home,end,14);if(W.pointFree(g,home,15)&&route){start=home;path=route;}}
  for(const offset of [{x:-210,y:75},{x:210,y:75},{x:0,y:210},{x:0,y:-210}]){if(start)break;const p={x:end.x+offset.x,y:end.y+offset.y};if(!W.pointFree(g,p,15))continue;const route=W.walkPath(g,p,end,14);if(route&&route.length<45){start=p;path=route;break;}}
  if(!start){start={...end};path=[];}
  cast[who]={...start,who,a:Math.atan2(end.y-start.y,end.x-start.x),visible:true,seated:false,walk:true};state.approaches.push({who,path});state.phase='approach';state.caption=who==='bhp'?'BHP zauważyło manewr. Specjalista podbiega…':'Lider odkłada kawę i podchodzi do Wojtka…';
 }
 return state;
}
function tick(dt){if(!state)return;state.elapsed+=dt;state.lineTime+=dt;
 if(state.phase==='approach'){
  let pending=false;for(const task of state.approaches){const p=state.cast[task.who];let budget=174*dt;p.walk=false;while(task.path.length&&budget>0){const target=task.path[0],d=C.dist(p,target);if(d<.1){task.path.shift();continue;}p.a=Math.atan2(target.y-p.y,target.x-p.x);const step=Math.min(d,budget);p.x+=Math.cos(p.a)*step;p.y+=Math.sin(p.a)*step;budget-=step;p.walk=true;if(step>=d-.01)task.path.shift();}if(task.path.length)pending=true;}
  if(!pending){state.phase='talk';state.lineTime=0;state.caption='';for(const p of Object.values(state.cast))p.walk=false;}
 }
}
function answer(){if(state?.phase==='ringing'){state.phase='talk';state.lineTime=0;return true;}return false;}
function advance(){if(!state||state.phase!=='talk'||state.lineTime<.18)return false;state.index++;state.lineTime=0;if(state.index>=state.lines.length){state.phase='done';return true;}return false;}
function line(){return state?.phase==='talk'?state.lines[state.index]:null;}
function camera(){if(!state)return null;if(state.phase==='approach'&&state.approaches.length){const npc=state.cast[state.approaches[0].who];if(C.dist(npc,state.cast.wojtek)>300)return {x:npc.x,y:npc.y-55,zoom:1.12};}const ids=[...new Set(state.lines.map(x=>x[0]).filter(who=>!remote(who)))],points=ids.map(id=>state.cast[id]).filter(Boolean);if(!points.length)points.push(state.cast.wojtek);const xs=points.map(p=>p.x),ys=points.map(p=>p.y);return {x:(Math.min(...xs)+Math.max(...xs))/2,y:(Math.min(...ys)+Math.max(...ys))/2-55,zoom:1.18};}
function clear(){state=null;}
const api={begin,tick,answer,advance,line,remote,camera,clear,get:()=>state};root.WarehouseScenes=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
