/* Illustrated 2D art. Geometry is shared with the original mission rules. */
(function(root){
'use strict';
const C=root.WarehouseCore,W=root.WarehouseWorld||(typeof require==='function'?require('./world.js'):null);
let characterSprites=null,spriteCells=[];
function setCharacterSprites(img){
 characterSprites=img;spriteCells=[];
 if(root.document&&img.complete&&img.width){for(let i=0;i<8;i++){
  const cell=root.document.createElement('canvas');cell.width=256;cell.height=256;
  cell.getContext('2d').drawImage(img,(i%4)*img.width/4,Math.floor(i/4)*img.height/2,img.width/4,img.height/2,0,0,256,256);spriteCells.push(cell);
 }}
}
let walkCells=[],npcCells=[],propImages={},truckImages={},emptyForkImage=null;
const NPC_ROWS={worker:0,bhp:1,guard:2};
function setNPCSprites(img){
 npcCells=[];if(!root.document||!img.complete||!img.width)return;
 for(let i=0;i<12;i++){
  const sample=root.document.createElement('canvas');sample.width=256;sample.height=256;
  const sc=sample.getContext('2d');sc.drawImage(img,(i%4)*img.width/4,Math.floor(i/4)*img.height/3,img.width/4,img.height/3,0,0,256,256);
  const pixels=sc.getImageData(0,0,256,256).data;let x0=255,y0=255,x1=0,y1=0;
  for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(pixels[(y*256+x)*4+3]>32){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  const cell=root.document.createElement('canvas');cell.width=Math.max(1,x1-x0+1);cell.height=Math.max(1,y1-y0+1);cell.getContext('2d').drawImage(sample,x0,y0,cell.width,cell.height,0,0,cell.width,cell.height);npcCells.push(cell);
 }
}
function setWalkSprites(img){
 walkCells=[];if(!root.document||!img.complete||!img.width)return;
 const cw=img.width/4,ch=img.height/4;
 for(let i=0;i<16;i++){
  const sample=root.document.createElement('canvas');sample.width=256;sample.height=256;
  const sc=sample.getContext('2d');sc.drawImage(img,(i%4)*cw,Math.floor(i/4)*ch,cw,ch,0,0,256,256);
  const pixels=sc.getImageData(0,0,256,256).data;let x0=255,y0=255,x1=0,y1=0;
  for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(pixels[(y*256+x)*4+3]>32){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  const cell=root.document.createElement('canvas');cell.width=Math.max(1,x1-x0+1);cell.height=Math.max(1,y1-y0+1);cell.getContext('2d').drawImage(sample,x0,y0,cell.width,cell.height,0,0,cell.width,cell.height);walkCells.push(cell);
 }
}
function setPropsImage(img,meta){
 propImages={};if(!root.document||!img.complete||!img.width)return;
 for(const item of meta.items){const b=item.bbox,cell=root.document.createElement('canvas');cell.width=Math.min(700,b.w);cell.height=Math.round(cell.width*b.h/b.w);cell.getContext('2d').drawImage(img,b.x,b.y,b.w,b.h,0,0,cell.width,cell.height);propImages[item.key]=cell;}
}
function setEmptyForkliftImage(img){if(img?.complete&&img.width)emptyForkImage=img;}
function setTruckImage(img,meta){
 truckImages={};if(!root.document||!img.complete||!img.width)return;
 for(const item of meta.items){const b=item.bbox,cell=root.document.createElement('canvas');cell.width=b.w;cell.height=b.h;cell.getContext('2d').drawImage(img,b.x,b.y,b.w,b.h,0,0,b.w,b.h);truckImages[item.key]=cell;}
}
const P={ink:'#182d40',navy:'#203d58',blue:'#3e8cbd',light:'#f4f5ee',gold:'#f5bd48',orange:'#df8b42',red:'#d66459',green:'#59977f',mint:'#9cd3ad',floor:'#c5ccce',line:'#e4e9e6',wall:'#6f8791',paper:'#f0e9d5',foil:'#b2cbd2',wood:'#b48b60',dark:'#11202e'};
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
function round(c,x,y,w,h,r,fill,stroke=null,lw=1){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function grad(c,x,y,w,h,colors,horizontal=false){const g=c.createLinearGradient(x,y,x+(horizontal?w:0),y+(horizontal?0:h));colors.forEach((v,i)=>g.addColorStop(i/(colors.length-1),v));return g;}
function ellipse(c,x,y,rx,ry,fill,stroke=null,lw=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function line(c,pts,color,width=1){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function poly(c,pts,fill,stroke=null,lw=1){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function text(c,s,x,y,size=14,color=P.ink,align='left'){c.fillStyle=color;c.font='600 '+size+'px "Arial", "Helvetica", sans-serif';c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);}
function outline(c,x,y,w,h,color=P.ink,lw=2){c.strokeStyle=color;c.lineWidth=lw;c.strokeRect(x,y,w,h);}
function shadow(c,x,y,w=34,h=14){const g=c.createRadialGradient(x,y,1,x,y,w*.6);g.addColorStop(0,'#14293938');g.addColorStop(1,'#14293900');ellipse(c,x,y,w*.66,h*.65,g);}
function cast(c,x,y,w,h,r=3){c.save();c.shadowColor='#152b3940';c.shadowBlur=12;c.shadowOffsetX=7;c.shadowOffsetY=10;round(c,x,y,w,h,r,'#304953');c.restore();}
function chip(c,s,x,y,fill=P.navy,color='#f3f6ee',size=10){const w=s.length*size*.59+20;round(c,x-w/2,y-12,w,24,5,fill);text(c,s,x,y,size,color,'center');}
function hatch(c,x,y,w,h,color='#e6ad3c'){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();rect(c,x,y,w,h,'#eac4771e');c.strokeStyle=color;c.lineWidth=7;for(let i=-h;i<w+h;i+=23){c.beginPath();c.moveTo(x+i,y);c.lineTo(x+i+h,y+h);c.stroke();}c.restore();outline(c,x,y,w,h,color,2);}
function noise(c,x,y,w,h,count,seed=7,dark=false){let n=seed;for(let i=0;i<count;i++){n=(Math.imul(n,1664525)+1013904223)>>>0;const px=x+n/4294967296*w;n=(Math.imul(n,1664525)+1013904223)>>>0;const py=y+n/4294967296*h;rect(c,px,py,.5+(n%15)/15,.5+(n%9)/9,dark?'#ebf1f012':'#26394709');}}
function barcode(c,x,y,w=13,h=9){round(c,x-2,y-2,w+4,h+4,1,'#f5f4ec');for(let i=0;i<w;i+=2)rect(c,x+i,y,(i%3)?1:1.5,h,'#385064');}
function person(c,x,y,who='wojtek',a=Math.PI/2,t=0,walk=false,carry=null,forceVector=false){
 c.save();c.translate(x,y);const sc=who==='leader'||NPC_ROWS[who]!==undefined?1:who==='wojtek'?.85:1.24;c.scale(sc,sc);
 shadow(c,2,6,38,14);const sway=walk?Math.sin(t*12):0,bob=walk?Math.abs(Math.cos(t*12))*1.2:Math.sin(t*2)*.25;
 if(!forceVector&&NPC_ROWS[who]!==undefined&&npcCells.length){
  const col=Math.abs(Math.sin(a))>=Math.abs(Math.cos(a))?(Math.sin(a)>0?0:2):(Math.cos(a)>0?1:3),img=npcCells[NPC_ROWS[who]*4+col],h=84,w=h*img.width/img.height;c.save();if(walk)c.rotate(sway*.014);
  if(walk){for(let leg=0;leg<2;leg++){c.save();c.beginPath();c.rect(-w/2+leg*w/2,-h*.32,w/2,h*.46);c.clip();c.drawImage(img,-w/2,-h-bob+(leg?1:-1)*sway*2.3,w,h);c.restore();}c.save();c.beginPath();c.rect(-w/2-3,-h-5,w+6,h*.76+5);c.clip();c.drawImage(img,-w/2,-h-bob,w,h);c.restore();}else c.drawImage(img,-w/2,-h-bob,w,h);
  c.restore();c.restore();return;
 }

 if(!forceVector&&characterSprites&&characterSprites.complete&&characterSprites.width&&['wojtek','leader'].includes(who)){
  const cw=characterSprites.width/4,ch=characterSprites.height/2,row=who==='leader'?1:0;
  const col=Math.abs(Math.sin(a))>=Math.abs(Math.cos(a))?(Math.sin(a)>0?0:2):(Math.cos(a)>0?1:3);
  c.save();if(walk)c.rotate(sway*.013);
  characterSprites._lastView=col;
  const step=walkCells[(who==='leader'?8:0)+(Math.floor(t*7)%2)*4+col];
  if(walk&&step){const h=who==='leader'?93:87,w=h*step.width/step.height;c.drawImage(step,-w/2,(who==='leader'?3:0)-h-bob,w,h);}
  else if(spriteCells[row*4+col])c.drawImage(spriteCells[row*4+col],-49,-91-bob,98,98);else c.drawImage(characterSprites,col*cw,row*ch,cw,ch,-49,-91-bob,98,98);
  c.restore();
  if(carry==='box')crate(c,0,-27,.78);
  if(carry==='labels'||carry==='bdo'){round(c,13,-31,15,22,2,'#fffdf1','#9fb8c4',.7);for(let k=0;k<4;k++)rect(c,16,-27+k*4,9,1,'#8da8b5');}
  c.restore();return;
 }

 const shirt=who==='leader'?['#a54b5b','#7f3448']:who==='bhp'?['#f4cd4a','#c79527']:who==='guard'?['#6b8262','#445d48']:who==='marysia'?['#c7857a','#9d5b67']:who==='jarek'?['#7b8997','#536578']:who==='worker'?['#7296a7','#496e84']:['#35587d','#243d63'];
 // Rounded work boots, trousers, loose sleeves and shaded hands.
 for(let i=0;i<2;i++){const lx=i?3:-11,step=(i?1:-1)*sway*3;round(c,lx,-10+step,9,16,3,grad(c,lx,-10,9,16,['#344658','#243245']),'#1e3040',.7);round(c,lx-1,2+step,12,7,3,'#1e2a38');line(c,[[lx+1,6+step],[lx+8,6+step]],'#65717b',.7);}
 c.translate(0,-bob);
 for(let i=0;i<2;i++){const armX=i?11:-18,step=(i?1:-1)*sway*2;round(c,armX,-28+step,7,12,3,shirt[0],shirt[1],.6);round(c,armX+.5,-18+step,6,12,3,grad(c,0,-18,0,12,['#e5b58d','#bd865f']),'#af7654',.5);ellipse(c,armX+3.5,-6+step,3.5,4,'#dca77f');}
 round(c,-12,-30,25,26,6,grad(c,-12,-30,25,26,shirt),'#20374a55',.8);
 line(c,[[-8,-9],[7,-9]],'#ffffff13',1);line(c,[[-8,-23],[-8,-14]],'#ffffff12',1);line(c,[[8,-23],[8,-14]],'#00000016',1);
 round(c,-5,-33,10,7,3,'#cc936d');c.beginPath();c.arc(.5,-30,5,0,Math.PI);c.strokeStyle=shirt[1];c.lineWidth=2;c.stroke();
 if(who==='bhp'){rect(c,-11,-22,24,4,'#f5f6d6');rect(c,-8,-29,3,22,'#edf0d4');rect(c,7,-29,3,22,'#edf0d4');}
 else if(who!=='leader'){line(c,[[-3,-28],[0,-16],[4,-28]],'#7b9baf',.8);round(c,-1,-18,6,7,1,'#e0e7e9');rect(c,0,-17,4,2,'#75a1be');}
 const fx=Math.cos(a)*2.1,front=Math.sin(a)>-.5;
 ellipse(c,0,-41,12.3,13.3,grad(c,-12,-54,25,27,['#f2c9a3','#d9a47b','#c58b65']),'#9d6e4d',.7);
 ellipse(c,-12,-41,2.8,4.5,'#d69e78');ellipse(c,12,-41,2.8,4.5,'#d69e78');
 if(front){
  line(c,[[-7+fx,-45],[-3+fx,-46]],'#6d4c3f',1.4);line(c,[[3+fx,-46],[7+fx,-45]],'#6d4c3f',1.4);
  ellipse(c,-5+fx,-42,1.35,1.75,'#263445');ellipse(c,5+fx,-42,1.35,1.75,'#263445');ellipse(c,-4.6+fx,-42.6,.4,.5,'#f7efe0');ellipse(c,5.4+fx,-42.6,.4,.5,'#f7efe0');
  line(c,[[fx,-41],[fx+1.7,-38],[fx-1,-37]],'#b87e5c',.8);c.beginPath();c.arc(fx,-36,4,.18,Math.PI-.18);c.strokeStyle='#94634f';c.lineWidth=.9;c.stroke();
 }
 if(who==='wojtek'){
  c.beginPath();c.ellipse(0,-48,12.7,8,0,Math.PI,Math.PI*2);c.lineTo(12.7,-47);c.quadraticCurveTo(0,-44,-12.7,-47);c.closePath();c.fillStyle=grad(c,-13,-56,26,12,['#529fc7','#246eaa']);c.fill();c.strokeStyle='#205a8c';c.lineWidth=.8;c.stroke();
  poly(c,[[-10,-47],[12,-47],[16+fx*1.5,-43],[2+fx*1.5,-43]],'#2875ad','#205b8c',.6);line(c,[[0,-55],[0,-48]],'#8bc4dd77',.8);text(c,'W',-3,-51,4.5,'#d9eef3','center');
 }else if(who==='leader'){
  c.beginPath();c.ellipse(-3,-49,6,3.4,-.2,Math.PI,Math.PI*2);c.strokeStyle='#fae3c477';c.lineWidth=2;c.stroke();
  line(c,[[-12,-45],[-11,-39]],'#8e7768',1.7);line(c,[[12,-45],[11,-39]],'#8e7768',1.7);
 }else if(who==='bhp'){
  c.beginPath();c.ellipse(0,-50,13,9,0,Math.PI,Math.PI*2);c.lineTo(13,-49);c.lineTo(-13,-49);c.closePath();c.fillStyle='#edb837';c.fill();round(c,-15,-50,30,4,2,'#f4ca55','#ba8328',.6);line(c,[[0,-58],[0,-52]],'#fff1ae',1.4);
 }else{c.beginPath();c.ellipse(0,-48,12,8,0,Math.PI,Math.PI*2);c.lineTo(10,-44);c.quadraticCurveTo(5,-49,-11,-45);c.closePath();c.fillStyle=who==='marysia'?'#654b41':'#645c52';c.fill();}
 if(carry==='box')crate(c,0,-11,.62);
 if(carry==='labels'||carry==='bdo'){round(c,10,-24,13,19,1,'#fffdf3','#b7c7c9',.6);for(let k=0;k<4;k++)rect(c,13,-20+k*3,7,1,'#829ca5');}
 c.restore();
}
function portrait(c,who='wojtek'){const w=c.canvas.width,h=c.canvas.height;rect(c,0,0,w,h,grad(c,0,0,w,h,['#eaf1ee','#c7d9dc']));if(NPC_ROWS[who]!==undefined&&npcCells.length){const img=npcCells[NPC_ROWS[who]*4],dh=h*2.5,dw=dh*img.width/img.height;c.drawImage(img,(w-dw)/2,5,dw,dh);return;}c.save();c.translate(w*.5,h*1.5);c.scale(w/37,w/37);person(c,0,0,who,Math.PI/2,0,false,null,true);c.restore();}
function crate(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);poly(c,[[-19,-21],[10,-25],[23,-17],[-6,-13]],'#d9b47e','#9d794d',.8);poly(c,[[-19,-21],[-6,-13],[-6,12],[-19,5]],'#ae814f','#8b6845',.7);poly(c,[[-6,-13],[23,-17],[23,7],[-6,12]],'#c99d65','#9a744c',.7);poly(c,[[-6,-22],[-2,-23],[11,-15],[7,-15]],'#edcf9d');poly(c,[[7,-15],[11,-15],[11,9],[7,9]],'#dfbd87');round(c,12,-8,8,9,1,'#eee9d7');line(c,[[14,-5],[18,-6]],'#777d78',.7);line(c,[[14,-2],[17,-2.5]],'#777d78',.7);c.restore();}
function roll(c,x,y,foil=false,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);const col=foil?['#d6e7e9','#9dbfc9','#779ba8','#c1d8dc']:['#f5f0df','#e3dcc7','#c7bfa8','#eee6d1'];round(c,-12,-29,24,32,2,grad(c,-12,-29,24,32,col,true),'#667d7e55',.6);ellipse(c,0,-29,12,5.5,grad(c,-12,-35,24,10,foil?['#e9f5f4','#abc6cd']:['#fff9e8','#d4cbb4']),'#8a9b963c',.7);ellipse(c,0,-29,3.3,1.7,'#9c8b72');ellipse(c,0,-29,1.5,.8,'#5e5a50');line(c,[[-9,-24],[-9,-2]],'#ffffff6b',1.2);if(foil){line(c,[[-2,-26],[-2,-1]],'#e2f5f361',2);line(c,[[8,-22],[8,0]],'#658d9d55',.7);}c.restore();}
function barrel(c,x,y,chem=false){c.save();c.translate(x,y);const co=chem?['#d5ba5b','#b59439','#ead189']:['#80a8c2','#3e718f','#638eac'];round(c,-11,-27,22,32,3,grad(c,-11,-27,22,32,co,true),'#36536a',.7);for(const yy of [-21,-4]){round(c,-11.5,yy,23,3,1,chem?'#a58a38':'#355f7b');line(c,[[-10,yy],[10,yy]],'#e2edf277',.5);}ellipse(c,0,-28,11,4.3,chem?'#e7cc74':'#99bdd0','#537b91',.8);ellipse(c,4,-28,1.8,1,'#3e5c6c');round(c,-4,-17,9,10,1,'#f5e8b7');if(chem)poly(c,[[.5,-15],[4,-12],[.5,-9],[-3,-12]],'#c98839');else line(c,[[-2,-14],[3,-14]],'#6f8590',.8);c.restore();}
function pallet(c,p,x=p.x,y=p.y,t=0,small=false){
 c.save();c.translate(x,y);if(small)c.scale(.75,.75);shadow(c,3,13,60,24);
 round(c,-28,4,57,13,1,'#775b40');for(const k of [-22,-3,17])round(c,k,11,8,10,1,'#8e6945');round(c,-29,1,59,6,1,'#cead7e','#9c774d',.5);for(let k=0;k<5;k++){rect(c,-27,1+k*1.1,54,.4,'#a9824c55');}line(c,[[-25,9],[25,9]],'#c29a68',1.4);
 if(p.kind==='paper'||p.kind==='foil'){roll(c,-13,0,p.kind==='foil');roll(c,13,0,p.kind==='foil');if(!p.unwrapped){round(c,-26,-16,52,6,1,'#e4f0f548');line(c,[[-25,-15],[24,-13]],'#ffffff85',.8);line(c,[[-24,-6],[24,-4]],'#ffffff60',.8);}}
 else if(p.kind==='chem'||p.kind==='barrels'){barrel(c,-13,0,p.kind==='chem');barrel(c,13,0,p.kind==='chem');}
 else{crate(c,-11,-3,.73);crate(c,13,-3,.73);crate(c,0,-22,.7);}
 barcode(c,-20,3,13,6);
 if(p.scanned){ellipse(c,24,-29,7,7,'#4eac82','#f0f7ed',1.5);line(c,[[21,-29],[23,-27],[27,-32]],'#f4fff5',1.5);}
 c.restore();
}
function forklift(c,f,cargo,t=0,occupied=true){
 if(propImages.forklift){c.save();c.translate(f.x,f.y);c.rotate(f.a+Math.PI/2);shadow(c,4,8,74,75);c.drawImage(!occupied&&emptyForkImage?emptyForkImage:propImages.forklift,-29,-64,58,109);if(Math.abs(f.v)>4)ellipse(c,21,3,2.4,2.4,Math.sin(t*8)>0?'#ffe1a2':'#d9952a');if(cargo){c.save();c.translate(0,-67+(Math.abs(f.v)>5?Math.sin(t*11)*.5:0));pallet(c,cargo,0,0);c.restore();}c.restore();return;}
 c.save();c.translate(f.x,f.y);c.rotate(f.a+Math.PI/2);shadow(c,8,9,76,70);
 for(const x of [-27,17])for(const y of [-24,14]){round(c,x,y,10,18,3,'#1c2933','#101d26',.6);for(let k=0;k<4;k++)line(c,[[x+1,y+3+k*3],[x+8,y+3+k*3]],'#42505a',.65);}
 round(c,-22,-28,44,62,7,grad(c,-22,-28,44,62,['#f8cd54','#edaf2b','#cf841b']),'#a66d24',1);
 round(c,-19,14,38,16,5,grad(c,-19,14,38,16,['#f6c24b','#d99426']));line(c,[[-16,28],[16,28]],'#ffdf7a',1);for(let k=0;k<5;k++)round(c,-12+k*5,17,2,8,1,'#9c6f26');
 round(c,-17,-22,34,35,4,'#344854','#1b303d',1);round(c,-11,-11,23,20,5,'#202e39');round(c,-8,-9,17,11,3,'#48596a');if(occupied){ellipse(c,0,-17,6,7,'#d9a178');ellipse(c,0,-21,7,5,'#287aaf');line(c,[[-5,-13],[-10,-18]],'#d3a27a',3);line(c,[[5,-13],[9,-18]],'#d3a27a',3);}
 ellipse(c,1,-22,7,4,null,'#182c38',1.6);line(c,[[1,-26],[1,-17]],'#182c38',1);
 for(const x of [-20,16]){round(c,x,-31,4,45,1,'#283e4c');line(c,[[x+.8,-30],[x+.8,12]],'#a2b2b6',.8);}
 round(c,-20,-32,40,4,1,'#516977','#1f3543',.7);round(c,-19,10,38,4,1,'#526c7b');
 round(c,-20,-38,40,6,1,grad(c,-20,-38,40,6,['#a6b5b8','#475d6b']),'#314856',.8);
 for(const x of [-16,10]){round(c,x,-59,6,25,1,grad(c,x,-59,6,25,['#c1cbca','#7c919c'],true),'#546d7a',.6);line(c,[[x+1,-57],[x+1,-37]],'#edf3eb',.7);}
 round(c,-10,29,20,4,1,'#354e5c');text(c,'W-01',0,23,4.2,'#67491b','center');ellipse(c,16,5,3.1,3.1,Math.abs(f.v)>5&&Math.sin(t*8)>0?'#ffe69a':'#cf8d24');
 if(cargo){c.save();c.translate(0,-67);pallet(c,cargo,0,0);c.restore();}
 c.restore();
}
function vehicle(c,v,occupied=false){
 if(v.kind==='van'&&propImages.van){const center=C.front(v,27);c.save();c.translate(center.x,center.y);c.rotate(v.a-Math.PI/2);shadow(c,4,5,76,135);c.drawImage(propImages.van,-33,-57,66,114);round(c,-20,-37,40,14,2,'#f4f5ede8');text(c,v.label||'PAKTECH',0,-30,5.4,'#567589','center');if(v.brakeLights){round(c,-30,-54,6,3,1,'#ff7560');round(c,24,-54,6,3,1,'#ff7560');}c.restore();return;}
 if(v.kind==='truck'&&truckImages.tractor&&truckImages.trailer){
  const cab=C.front(v,60);c.save();c.translate(cab.x,cab.y);c.rotate(v.a-Math.PI/2);shadow(c,5,-25,81,140);c.drawImage(truckImages.tractor,-35,-95.175,70,135);c.restore();
  const hitch=C.hitch(v);ellipse(c,hitch.x,hitch.y,12,12,'#263e4e','#8ca2ad',1.5);
  const t=C.trailer(v);c.save();c.translate(t.x,t.y);c.rotate(t.a-Math.PI/2);shadow(c,5,4,75,168);const img=truckImages.trailer;c.drawImage(img,0,0,img.width,img.height-22,-31,-77,62,150); round(c,-25,-24,50,33,2,'#f4f5efc9');text(c,occupied?'LOGISTYKA':'AVERA',0,-7,8.2,'#47778c','center');if(v.brakeLights){round(c,-29,-76,8,3,1,'#ff7460');round(c,21,-76,8,3,1,'#ff7460');}c.restore();return;
 }
 if(v.kind==='truck'){
  // Rear tractor frame and fifth wheel visibly connect the cab and trailer.
  c.save();c.translate(v.x,v.y);c.rotate(v.a-Math.PI/2);
  shadow(c,4,-45,62,61);round(c,-17,-91,34,72,3,'#314b5c','#1b3447',1);
  for(const x of [-29,20])for(const y of [-79,-54]){round(c,x,y,9,18,3,'#182b38');line(c,[[x+2,y+3],[x+7,y+3]],'#506575',1);}
  for(const x of [-20,14])round(c,x,-77,6,53,1,'#7c919a');ellipse(c,0,-76,12,9,'#243c4a','#8ca0a8',1.5);
  c.restore();
  const t=C.trailer(v);c.save();c.translate(t.x,t.y);c.rotate(t.a-Math.PI/2);cast(c,-31,-77,62,153,3);
  for(const x of [-35,27])for(const y of [-59,-39,53])round(c,x,y,8,16,2,'#1c2933');
  round(c,-31,-77,62,153,3,'#607b89','#2f4a59',1);round(c,-28,-75,56,147,2,grad(c,-28,-75,56,147,['#d6e0e1','#f4f5ef','#b9cad0'],true),'#fcfcf5',.7);
  for(let y=-68;y<70;y+=9){line(c,[[-26,y],[26,y]],'#8da4af47',.7);line(c,[[-25,y+1],[25,y+1]],'#ffffff99',.7);}
  round(c,-25,-27,50,38,2,'#eff3efb8');text(c,occupied?'LOGISTYKA':'AVERA',0,-8,9,'#427087','center');rect(c,-24,24,48,3,'#669ba56b');rect(c,-28,-78,56,4,'#263e50');rect(c,-27,-79,8,3,'#d54a43');rect(c,19,-79,8,3,'#d54a43');line(c,[[0,-73],[0,-63]],'#839ba9',1.3);c.restore();
 }
 c.save();c.translate(v.x,v.y);c.rotate(v.a-Math.PI/2);const van=v.kind!=='truck',top=van?-61:-34,h=van?123:73;
 cast(c,-30,top,60,h,8);for(const x of [-33,26]){round(c,x,van?27:10,8,20,3,'#1c2a33');if(van)round(c,x,-45,8,19,3,'#1c2a33');}
 round(c,-30,top,60,h,8,grad(c,-30,top,60,h,van?['#d2dde0','#f9faf3','#c1d1d7']:['#2c6992','#64a6ce','#2b6d9e'],true),'#334e60',1);
 if(van){round(c,-26,-57,52,73,4,grad(c,-26,-57,52,73,['#eef2ee','#c9d9df','#f1f3ef'],true));line(c,[[0,-53],[0,12]],'#a1b5bf',.7);line(c,[[-25,-17],[25,-17]],'#b5c7ce',.7);text(c,'PAKTECH',0,-30,8,'#457087','center');round(c,-28,-61,56,3,1,'#6f8d9e');}
 const cy=van?17:-19;round(c,-26,cy,52,23,4,'#244556','#132f43',.8);round(c,-23,cy+2,46,15,3,grad(c,-23,cy+2,46,15,['#b4d7e1','#527f99']));poly(c,[[-21,cy+3],[0,cy+3],[-8,cy+14],[-23,cy+14]],'#e0f1ee44');line(c,[[-17,cy+14],[-5,cy+11]],'#273f50',.8);line(c,[[5,cy+14],[18,cy+11]],'#273f50',.8);
 round(c,-26,van?42:8,52,14,5,grad(c,-26,0,52,14,van?['#f5f7ee','#c3d5db']:['#70b4d9','#307aaa']));round(c,-26,van?54:29,52,5,2,'#365363');for(const x of [-23,13])round(c,x,van?49:24,11,5,2,'#f7eec3','#99abb0',.5);for(const x of [-36,30])round(c,x,van?25:-8,6,11,2,'#385566');round(c,-12,van?47:20,24,4,1,'#54788a');c.restore();
}
const warehouseWalls=W.walls;
const obstacles=W.obstacles;
function floor(c,x,y,w,h,wood=false){
 rect(c,x,y,w,h,wood?'#c3af91':grad(c,x,y,w,h,['#d3d8d8','#c3ccce']));
 if(wood){for(let j=0;j<h;j+=19){rect(c,x,y+j,w,1,'#917e6724');for(let i=0;i<w;i+=80){const u=i+(j%38?40:0);line(c,[[x+u,y+j],[x+u,y+j+19]],'#947e6929',.7);line(c,[[x+u+8,y+j+7],[x+u+60,y+j+7]],'#e9d9bc33',.6);}}}
 else{for(let j=0;j<h;j+=100){line(c,[[x,y+j],[x+w,y+j]],'#7189951c',.7);for(let i=0;i<w;i+=100)line(c,[[x+i,y],[x+i,y+h]],'#7189951c',.7);}noise(c,x,y,w,h,Math.ceil(w*h/180),11);}
}
function shelf(c,x,y,id){
 if(propImages.rack){shadow(c,x+77,y+58,185,35);c.drawImage(propImages.rack,x-12,y-46,174,104);chip(c,id,x+75,y+63,'#36566bdd','#f2eee1',7);return;}
 cast(c,x,y-16,150,69,2);round(c,x,y-16,150,70,2,grad(c,x,y-16,150,70,['#6b7a81','#465d6b']));
 for(let k=0;k<3;k++){
  const xx=x+11+k*47;roll(c,xx+8,y+28,k===1,.74);if(k===1)roll(c,xx+25,y+28,true,.74);else crate(c,xx+20,y+24,.55);
  round(c,xx-2,y-13,38,13,2,k%2?'#b3b8ab':'#d4c0a1','#788c92',.6);line(c,[[xx+3,y-8],[xx+30,y-8]],'#faf2da55',.7);
 }
 round(c,x-3,y+43,156,9,1,grad(c,x,y+43,156,9,['#efad61','#c87732']),'#a05d2d',.6);
 round(c,x-3,y-18,156,7,1,'#dd8d41','#b4773f',.6);
 for(const xx of [x,x+73,x+146]){round(c,xx-2,y-20,6,80,1,grad(c,xx,y,6,80,['#738c9d','#37556d'],true),'#263f55',.6);for(let j=0;j<7;j++)rect(c,xx,y-12+j*9,1.4,2.3,'#cbd9db');}
 round(c,x+57,y+44,34,8,1,'#f5efda');text(c,id,x+74,y+48,5.8,'#405667','center');
}
function plant(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);shadow(c,2,5,35,13);round(c,-11,-2,22,16,4,grad(c,-11,-2,22,16,['#dde2df','#9eafb1']),'#829698',.6);ellipse(c,0,-2,11,4,'#6a7564');for(let i=0;i<8;i++){const a=i*Math.PI/4;const xx=Math.cos(a)*11,yy=-9+Math.sin(a)*7;c.save();c.translate(xx,yy);c.rotate(a-.6);ellipse(c,0,-3,5,12,i%2?'#598f71':'#75a584','#386e59',.4);line(c,[[0,6],[0,-11]],'#bdd3ad88',.7);c.restore();}c.restore();}
function chair(c,x,y,flip=false){c.save();c.translate(x,y);if(flip)c.rotate(Math.PI);shadow(c,2,8,32,22);line(c,[[0,0],[0,22]],'#3a4e5b',3);line(c,[[-10,24],[10,24]],'#3a4e5b',2.3);round(c,-13,-6,26,23,6,grad(c,-13,-6,26,23,['#6c8e9b','#3e6176']),'#304c61',.8);round(c,-14,-13,28,10,3,'#41647a','#2e4f65',.8);line(c,[[-12,0],[-17,7],[-17,13]],'#2f4657',2);line(c,[[12,0],[17,7],[17,13]],'#2f4657',2);c.restore();}
function wall(c,b){
 c.save();c.shadowColor='#26425425';c.shadowBlur=8;c.shadowOffsetY=7;c.shadowOffsetX=4;rect(c,b.x,b.y,b.w,b.h,'#607886');c.restore();
 rect(c,b.x,b.y-5,b.w,b.h,'#b3c3c8');rect(c,b.x,b.y-5,b.w,2,'#eef2ee');rect(c,b.x,b.y+b.h-5,b.w,5,'#607b8b');
 if(b.w<20)rect(c,b.x,b.y,3,b.h,'#dbe3df');
}
function press(c,x,y,label){
 if(propImages.press){shadow(c,x+196,y+126,420,50);c.drawImage(propImages.press,x-4,y-39,398,175);chip(c,label,x+196,y+140,'#36566b','#f0f4e7',8);return;}
 cast(c,x,y,390,135,6);round(c,x,y,390,135,6,grad(c,x,y,390,135,['#9eb0b8','#7d929e','#5c7485']),'#3e5e73',1.2);
 round(c,x+9,y+7,281,113,5,grad(c,x+9,y+7,281,113,['#e3e9e6','#adbec3']),'#7f97a5',.8);
 round(c,x+21,y+22,253,63,4,'#344f61');
 for(let k=0;k<4;k++){const xx=x+33+k*57;round(c,xx,y+26,46,55,4,grad(c,xx,y+26,46,55,['#9cb5bd','#e0e7de','#8aa3af'],true),'#647e8e',.7);ellipse(c,xx+23,y+35,19,6,'#dce5dc','#607e8d',.6);ellipse(c,xx+23,y+35,5,2,'#768e94');round(c,xx+4,y+68,38,7,2,'#7a9b9f');}
 round(c,x+305,y+15,67,90,5,grad(c,x+305,y+15,67,90,['#405e72','#2d4c62']),'#233f54',.8);
 round(c,x+314,y+25,49,32,3,'#142e40');round(c,x+317,y+28,43,25,2,grad(c,x+317,y+28,43,25,['#4b9ca9','#254e67']));
 for(let k=0;k<3;k++)rect(c,x+322,y+34+k*6,28-k*6,2,'#a1dccb');for(let k=0;k<4;k++)ellipse(c,x+319+k*13,y+74,3,3,k===3?'#d56a55':'#76b59c');ellipse(c,x+337,y+93,5,5,'#b54c43','#e7c48a',1.7);
 round(c,x+41,y+93,217,16,2,'#9ba8aa');for(let k=0;k<15;k++)round(c,x+44+k*14,y+94,3,14,1,'#547385');
 chip(c,label,x+145,y+116,'#476579','#e2ece8',8);poly(c,[[x+280,y+105],[x+289,y+121],[x+271,y+121]],'#ebc36c','#967f50',.7);text(c,'!',x+280,y+116,9,'#665636','center');
 for(let k=0;k<4;k++)round(c,x+310+k*14,y+117,8,2,1,'#476479');
}
function workstation(c){
 cast(c,85,945,115,38,4);round(c,85,945,115,38,4,grad(c,85,945,115,38,['#d7b990','#b0906e']),'#8e745c',.8);line(c,[[91,951],[193,951]],'#ead4af',.6);
 round(c,125,951,35,6,2,'#405a6b');line(c,[[142,947],[142,958]],'#526f7f',3);
 round(c,112,917,70,37,4,'#263f50','#152c3d',1);round(c,116,921,62,29,2,grad(c,116,921,62,29,['#5496b1','#294f75']));rect(c,120,925,54,4,'#c0e0dd99');for(let k=0;k<3;k++){rect(c,121,933+k*5,10,2,'#79c8bf');rect(c,135,933+k*5,30-k*7,2,'#c3e3e088');}
 round(c,111,965,65,10,2,'#c9d2d1','#889ba1',.6);for(let k=0;k<9;k++)rect(c,115+k*6,968,3,2,'#78909a');ellipse(c,185,967,5,7,'#d4ddda','#819ba3',.6);ellipse(c,100,960,5,5,'#e7e9da','#8b9b9a',.7);ellipse(c,100,960,3.7,3,'#6e5140');chair(c,162,1000);
 cast(c,260,950,60,36,4);round(c,260,950,60,36,4,grad(c,260,950,60,36,['#e1e7e5','#9eb0ba']),'#7c939e',.8);round(c,267,972,46,6,2,'#2e485b');round(c,270,940,40,17,1,'#fffdf0','#d1d8cf',.5);for(let k=0;k<3;k++)rect(c,275,944+k*3,29-k*3,1,'#879fa7');ellipse(c,313,960,2,2,'#81c9a8');
}
function seatedPerson(c,x,y,who='leader',a=Math.PI/2,t=0,speaking=false){
 shadow(c,x,y+15,34,15);const dx=Math.cos(a),dy=Math.sin(a);
 for(const side of [-1,1]){const hx=x+side*4,hy=y+side*3;line(c,[[hx,hy],[hx+dx*17,hy+13],[hx+dx*25,hy+18]],'#344656',6);ellipse(c,hx+dx*26,hy+19,6,3.6,'#253543');}
 c.save();c.beginPath();c.rect(x-60,y-86,120,87);c.clip();person(c,x,y+28,who,a,t,false);c.restore();
}
function leaderDesk(c){const {x,y}=C.POS.leader;cast(c,x-55,y-24,110,38,4);round(c,x-55,y-24,110,38,4,grad(c,x-55,y-24,110,38,['#dbc29e','#ac8a68']),'#907455',.8);round(c,x-15,y-17,29,22,2,'#f5f1df');for(let i=0;i<4;i++)rect(c,x-10,y-12+i*4,18,1,'#7f99a2');round(c,x+24,y-19,17,24,2,'#324f62');round(c,x+27,y-16,11,15,1,'#83b6bf');ellipse(c,x-35,y-8,6,6,'#f0efe2','#92a6a6',.6);ellipse(c,x-35,y-8,4,4,'#6f5138');chip(c,'LIDER',x,y+35,'#8c5562','#fff3eb',7);}
function dockedTrailer(c){
 const b=W.trailer;cast(c,b.x-6,b.y-5,b.w+12,b.h+10,3);round(c,b.x,b.y,b.w,b.h,3,'#b9c7cd','#e4eeea',1);rect(c,b.x+6,b.y+6,b.w-12,b.h-9,grad(c,b.x,b.y,b.w,b.h,['#a6aaa2','#d7cdb8','#b9b3a5']));
 for(let y=b.y+9;y<b.y+b.h;y+=13){line(c,[[b.x+9,y],[b.x+b.w-9,y]],'#6e7e7d55',1);line(c,[[b.x+10,y+1],[b.x+b.w-10,y+1]],'#f7efdf55',.6);}
 for(const x of [b.x-8,b.x+b.w])for(const y of [b.y+90,b.y+125,b.y+160])round(c,x,y,8,25,3,'#203341');
 for(const x of [b.x,b.x+b.w-6]){round(c,x,b.y,6,b.h,2,'#e2e9e5','#7a929e',.7);line(c,[[x+2,b.y+5],[x+2,b.y+b.h-2]],'#ffffffc9',1);}
 round(c,b.x,b.y,b.w,8,2,'#d2dedc');rect(c,b.x+5,b.y+b.h-4,b.w-10,5,'#304c60');for(const x of [b.x-8,b.x+b.w+1]){round(c,x,b.y+b.h-20,7,26,2,'#273e4b');rect(c,x+1,b.y+b.h-17,5,9,'#d7954c');}
 for(const x of [b.x-7,b.x+b.w+2])line(c,[[x,b.y+b.h],[x+(x<b.x?-25:25),b.y+b.h-55]],'#e3e7df',3);
 round(c,b.x+2,b.y+b.h,b.w-4,35,1,grad(c,0,0,0,35,['#d3ddd8','#8fa5ad']),'#526d80',1);for(let x=b.x+7;x<b.x+b.w-3;x+=7)line(c,[[x,b.y+b.h+3],[x,b.y+b.h+30]],'#6a8391',.7);
 if(truckImages.tractor){c.save();c.translate(712,128);c.rotate(Math.PI);c.drawImage(truckImages.tractor,-35,-95.175,70,135);c.restore();}
 chip(c,'AVERA / ROZŁADUNEK',712,150,'#254b65','#ecf2e6',9);
}
function warehouse(c,mission=-1){
 const Y=C.Y;rect(c,0,0,W.sizes.warehouse.w,W.sizes.warehouse.h,'#284758');rect(c,48,20,1584,C.wy(45),grad(c,48,20,1584,C.wy(45),['#7b9099','#526f80']));noise(c,48,20,1584,C.wy(45),3500,4,true);
 for(let x=75;x<1610;x+=75)line(c,[[x,30],[x,C.wy(44)]],'#c2cec22b',1);
 floor(c,63,C.wy(63),1554,1015);
 rect(c,941,C.wy(315),299,763,'#8c9fa8');rect(c,941,C.wy(560),339,200,'#8c9fa8');rect(c,1230,C.wy(975),155,135,'#8c9fa8');noise(c,941,C.wy(315),299,763,950,31);
 for(const x of [956,1220])line(c,[[x,C.wy(320)],[x,C.wy(1120)]],'#e2c273',2.5);
 for(let y=340;y<1100;y+=150){line(c,[[1087,C.wy(y)],[1087,C.wy(y)+45]],'#d9e4dc',2);poly(c,[[1087,C.wy(y)+46],[1080,C.wy(y)+36],[1094,C.wy(y)+36]],'#d9e4dc');}
 for(const y of [425,735]){rect(c,966,C.wy(y)-7,264,61,'#748d9b');for(let i=0;i<7;i++)round(c,975+i*34,C.wy(y),22,44,1,'#ecebe1');line(c,[[971,C.wy(y)-12],[1224,C.wy(y)-12]],'#edc26d',2);line(c,[[971,C.wy(y)+58],[1224,C.wy(y)+58]],'#edc26d',2);}
 text(c,'DROGA TRANSPORTOWA',1107,C.wy(1095),10,'#e6ece4','center');
 W.bays.forEach((x,i)=>{const open=mission===1&&i===3;round(c,x-67,C.wy(46),134,32,2,'#304a5d');if(!open)for(let k=0;k<6;k++)rect(c,x-62,C.wy(50)+k*4,124,1,'#657d8b');else rect(c,x-61,C.wy(46),122,35,'#adb8b6');for(const xx of [x-73,x+67]){round(c,xx,C.wy(49),6,40,2,'#233d50');for(let k=0;k<4;k++)rect(c,xx+1,C.wy(52)+k*9,4,4,'#e6b04f');}chip(c,'RAMPA 0'+(i+1),x,C.wy(114),'#47697a','#eef4ee',8);});
 text(c,'MAGAZYN GŁÓWNY',90,C.wy(205),12,'#7d929d');
 c.save();c.globalAlpha=.075;for(const x of [220,510,800])poly(c,[[x,C.wy(140)],[x+60,C.wy(140)],[x+210,C.wy(640)],[x+110,C.wy(640)]],'#fff3c5');c.restore();
 W.racks.forEach(b=>{shelf(c,b.x,b.y,b.id);round(c,b.x+30,b.y+85,90,18,3,'#eef0e655');text(c,b.id,b.x+75,b.y+94,8,'#728b98','center');});
 for(const x of [335,595]){line(c,[[x,C.wy(240)],[x,C.wy(665)]],'#f1ecdccc',2);for(const y of [400,650])poly(c,[[x-8,C.wy(y)],[x+8,C.wy(y)],[x,C.wy(y)+13]],'#e8e6d6b0');}
 round(c,792,C.wy(200),110,511,5,'#8fb6a340');line(c,[[800,C.wy(215)],[800,C.wy(700)]],'#e2ede4',2);line(c,[[891,C.wy(215)],[891,C.wy(700)]],'#e2ede4',2);chip(c,'BUFOR',845,C.wy(188),'#568b7b','#f2f8ec',10);
 C.MACHINES.forEach((m,i)=>{round(c,808,C.wy(226)+i*90,65,68,3,'#acc9b43b','#f0f3e1',1.3);chip(c,m,840,C.wy(280)+i*90,'#648b80','#f7faec',8);});
 round(c,785,C.wy(705),100,85,4,'#87baa34d','#d8e9d9',2);chip(c,'PAKOWANIE',835,C.wy(806),'#4e8171','#f0f5df',8);
 hatch(c,590,C.wy(730),160,140,'#e3bb63');round(c,601,C.wy(742),138,116,3,'#c8cfcb');for(const x of [618,722])line(c,[[x,C.wy(750)],[x,C.wy(850)]],'#f8eee0',1.5);chip(c,'ROZPAKOWANIE',670,C.wy(884),'#677f84','#f6f2dc',9);
 floor(c,64,C.wy(909),316,229,true);c.save();c.translate(0,Y-60);workstation(c);c.restore();chip(c,'BIURO MAGAZYNU',225,C.wy(1111),'#5d7888','#f0f4ec',9);plant(c,350,C.wy(1110),.8);chair(c,300,C.wy(1055),true);leaderDesk(c);
 round(c,77,C.wy(1026),14,80,2,'#7b929d');for(let y=1034;y<1100;y+=21)round(c,79,C.wy(y),10,18,1,'#aebdc1');
 floor(c,395,C.wy(909),310,229,true);chip(c,'SALKA',555,C.wy(938),'#7f7462','#f8f1df',10);chair(c,451,C.wy(1040));chair(c,650,C.wy(1040));
 cast(c,490,C.wy(985),120,95,10);round(c,490,C.wy(985),120,95,10,grad(c,490,C.wy(985),120,95,['#d2b18a','#ae8663']),'#947255',1);round(c,530,C.wy(1010),35,25,2,'#eef0e4');for(let k=0;k<4;k++)rect(c,535,C.wy(1016)+k*4,23-k*3,1,'#92a7aa');ellipse(c,510,C.wy(1050),5,5,'#edf0e7');round(c,582,C.wy(1040),16,25,2,'#38576a');
 floor(c,719,C.wy(909),286,229);chip(c,'DROBNICA',815,C.wy(937),'#637f8a','#f4f3e3',9);const z=C.FIRE_ZONE;hatch(c,z.x,z.y,z.w,z.h,'#e1ab48');const q=C.SMALL_ZONE;round(c,q.x,q.y,q.w,q.h,3,'#76ac9140','#d1e6d2',2);text(c,'PALETA',q.x+q.w/2,q.y+q.h-10,7,'#4b7e69','center');
 const e=C.POS.extinguisher;round(c,e.x-8,e.y-35,17,40,6,grad(c,e.x-8,e.y-35,17,40,['#ef8270','#be3c3f','#e06056'],true),'#943c3e',.8);round(c,e.x-4,e.y-42,9,7,1,'#3a5161');line(c,[[e.x+6,e.y-40],[e.x+12,e.y-33],[e.x+12,e.y-12]],'#3b4a52',2);round(c,e.x-11,e.y-70,25,25,3,'#d35b50','#f8eadd',1);text(c,'F',e.x+1,e.y-57,17,'#f9f1df','center');chip(c,'DOSTĘP DO GAŚNICY',929,C.wy(1110),'#b98545','#fff3d4',7);
 floor(c,1401,C.wy(940),216,198);chip(c,'MAGAZYNEK CHEMICZNY',1510,C.wy(963),'#8e824f','#fff5cc',9);round(c,1432,C.wy(1004),75,77,3,'#b7b48440','#ece2a8',2);for(let i=0;i<2;i++){round(c,1430+i*95,C.wy(1101),70,35,2,'#738182');for(let j=0;j<3;j++)barrel(c,1444+i*95+j*20,C.wy(1114),true);}
 floor(c,1240,C.wy(63),377,237);chip(c,'CTP',1490,C.wy(91),'#497d86','#f0f7ee',13);round(c,1280,C.wy(76),80,77,3,'#d5ba7d32','#d3b26d',2);round(c,1450,C.wy(173),80,75,3,'#7eb39b32','#97c3a7',2);chip(c,'ZWROT',1320,C.wy(171),'#ac8b56','#fff3dc',8);chip(c,'DOSTAWA',1490,C.wy(260),'#61967c','#f6f8e6',8);
 W.presses.forEach(b=>{c.save();c.translate(b.x,b.y);c.scale(b.w/390,1);press(c,0,0,b.label);c.restore();});W.walls.forEach(b=>wall(c,b));
 chip(c,'→ PRODUKCJA',1006,C.wy(675),'#607f90','#f0f2df',8);round(c,313,C.wy(878),39,13,2,'#569e7e');text(c,'WYJŚCIE',332,C.wy(885),5,'#f0f8e9','center');
 const light=c.createRadialGradient(400,C.wy(250),80,800,C.wy(500),1400);light.addColorStop(0,'#fff2d20c');light.addColorStop(1,'#0e2c4320');rect(c,63,C.wy(63),1554,1015,light);
 if(mission===1)dockedTrailer(c);if(mission===3)vehicle(c,{kind:'van',x:160,y:C.wy(140),a:-Math.PI/2,v:0});
}
function tree(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);shadow(c,10,15,73,43);for(let i=0;i<8;i++){const a=i*.88;ellipse(c,Math.cos(a)*16,Math.sin(a)*11-6,20,18,['#567d64','#4b755e','#638a6b'][i%3]);}ellipse(c,-5,-12,20,17,'#779777');ellipse(c,-13,-18,9,5,'#9ab28944');c.restore();}
function yard(c){
 rect(c,0,0,1240,940,'#718c71');noise(c,0,0,1240,940,1300,4,true);rect(c,45,130,1145,750,grad(c,45,130,1145,750,['#697c89','#778894','#657984']));noise(c,45,130,1145,750,11000,23,true);
 for(let x=45;x<930;x+=27){round(c,x,879,26,10,1,'#a6b3b3','#7a9299',.5);}
 for(let y=137;y<880;y+=28){round(c,35,y,10,27,1,'#b3bfba','#7b9293',.5);round(c,1190,y,10,27,1,'#aebdb7','#7b9293',.5);}
 // Sun-lit industrial facade and insulated loading doors.
 cast(c,45,44,1145,92,2);rect(c,45,44,1145,92,grad(c,45,44,1145,92,['#eef0e8','#c9d5d4','#8aa0ac']));for(let x=50;x<1190;x+=48){line(c,[[x,47],[x,130]],'#8da3ae4b',.7);rect(c,x+1,45,2,87,'#ffffff52');}
 rect(c,45,44,1145,9,'#304d64');round(c,55,65,101,22,3,'#2c506a');text(c,'MASTERPRESS',105,76,9,'#ebf0e7','center');
 for(let i=0;i<4;i++){
  const b=C.BAYS[i];c.save();c.translate(b.x,b.y);c.rotate(C.BAY_ANGLE-Math.PI/2);
  round(c,-51,-59,102,63,3,'#293f51','#182c3c',1);round(c,-44,-56,88,56,2,grad(c,-44,-56,88,56,['#6a808a','#476473']));for(let y=-50;y<-2;y+=7){line(c,[[-42,y],[42,y]],'#8ca1a84d',1);line(c,[[-42,y+1],[42,y+1]],'#223c4c3c',1);}
  for(const x of [-54,47]){round(c,x,-29,7,43,2,'#223a48');for(let j=0;j<4;j++)rect(c,x+1,-26+j*10,5,5,'#e6b350');}
  round(c,-51,-88,102,23,3,'#3a5e76');text(c,'RAMPA 0'+(i+1),0,-76,10,'#eef2e5','center');round(c,-42,0,84,15,2,'#a6b7b8','#e3e8df',.6);for(let x=-37;x<39;x+=6)line(c,[[x,2],[x,12]],'#667f8b',.6);
  c.strokeStyle=i===1?'#dfad7b':'#e5e6d1';c.lineWidth=2;c.setLineDash([15,12]);c.strokeRect(-43,16,86,241);c.setLineDash([]);
  if(i===0){hatch(c,-45,17,90,130,'#d3b77177');poly(c,[[-15,95],[0,73],[15,95]],'#e4d2a5b0');text(c,'PODJAZD',0,125,8,'#e5e8d5','center');}c.restore();
 }
 const b=C.BAYS[1],span=C.VEHICLE.truck.trailerCenter+77-C.VEHICLE.truck.hitch;vehicle(c,{x:b.x+Math.cos(C.BAY_ANGLE)*span,y:b.y+Math.sin(C.BAY_ANGLE)*span,a:C.BAY_ANGLE,b:C.BAY_ANGLE,kind:'truck'},true);chip(c,'02 / ZAJĘTA',480,472,'#9c7755','#faebce',9);
 // Tire marks, drains, fence, greenery and the gatehouse.
 c.save();c.strokeStyle='#283e4d10';c.lineWidth=5;for(let i=0;i<3;i++){c.beginPath();c.ellipse(720+i*40,620,230,95,.2,.1,2.7);c.stroke();}c.restore();
 for(let x=220;x<1100;x+=230){round(c,x,863,67,9,1,'#4a6373');for(let k=0;k<12;k++)rect(c,x+3+k*5,864,2,7,'#263f52');}
 line(c,[[180,720],[1110,720]],'#d9dfd0',2);for(let x=200;x<1120;x+=65)rect(c,x,716,30,8,'#d9dfd0');
 for(let x=55;x<900;x+=32){line(c,[[x,890],[x,916]],'#496852',2);line(c,[[x,895],[x+32,907]],'#a0b7a06b',.6);line(c,[[x,907],[x+32,895]],'#a0b7a06b',.6);}line(c,[[45,892],[918,892]],'#52735e',2);
 c.save();c.translate(768,0); cast(c,52,765,98,100,3);round(c,52,765,98,100,3,grad(c,52,765,98,100,['#d7e0d8','#9ab0b0']),'#688c96',1);round(c,51,757,100,14,3,'#607e8c');round(c,61,778,79,31,2,grad(c,61,778,79,31,['#b5dae0','#4b7b92']),'#3a637c',1);line(c,[[100,779],[100,808]],'#d8e8e7',2);round(c,65,817,26,40,2,'#5f8194');ellipse(c,86,838,1.5,1.5,'#e2d9b8');chip(c,'OCHRONA',102,873,'#4f6e73','#f3f3de',8);
 c.restore();
 rect(c,930,879,258,61,'#6e8390');for(const x of [929,1184]){round(c,x,872,8,50,2,'#dce5d6','#365665',1);ellipse(c,x+4,866,5,5,'#83c999');}line(c,[[955,917],[1162,917]],'#e8dec4',2);poly(c,[[1050,887],[1039,904],[1061,904]],'#e5e7d7');chip(c,'WJAZD',1050,932,'#2e5666','#eff4df',9);
 for(const x of [22,1217])for(const y of [260,520,790])tree(c,x,y,.75);plant(c,72,605,.9);plant(c,1155,607,.9);
 text(c,'PLAC MANEWROWY',660,833,17,'#c6d2d0','center');
 const light=c.createRadialGradient(380,250,50,650,500,900);light.addColorStop(0,'#fff2cf13');light.addColorStop(1,'#102a421e');rect(c,45,136,1145,743,light);
}
function marker(c,x,y,t,label=null,color=P.gold){
 c.save();c.translate(x,y);const s=34+Math.sin(t*3)*2;c.strokeStyle=color;c.lineWidth=2.2;c.lineCap='round';
 for(const [dx,dy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){c.beginPath();c.moveTo(dx*s,dy*(s-11));c.lineTo(dx*s,dy*s);c.lineTo(dx*(s-11),dy*s);c.stroke();}
 const yy=-54+Math.sin(t*3)*3;shadow(c,0,0,34,10);poly(c,[[0,yy+9],[-7,yy-1],[7,yy-1]],color,'#8f6e2544',.7);ellipse(c,0,yy-8,3,3,'#ffeac2');
 if(label)chip(c,label,0,49,'#243f53ee','#fff0cf',10);c.restore();
}
function minimap(c,g,px,py,w=180,h=120){
 const world=W.sizes[g.world],sx=w/world.w,sy=h/world.h;c.save();c.translate(px,py);round(c,0,0,w,h,8,'#173247eb','#9bb7b74a',1);round(c,5,5,w-10,h-10,4,'#274454');
 if(g.world==='warehouse'){round(c,7,7,w*.46,h*.67,2,'#7a959e51');round(c,w*.53,7,w*.43,h*.88,2,'#6b8f985c');round(c,7,h*.76,w*.5,h*.17,2,'#c6ae7c5e');for(const b of W.racks)round(c,b.x*sx,b.y*sy,b.w*sx,b.h*sy,1,'#e1ad6a90');}
 else{for(const b of C.BAYS)round(c,b.x*sx-3,b.y*sy-4,6,23,1,'#c6d5b8');}
 const o=C.objective(g);if(o.at){ellipse(c,o.at.x*sx,o.at.y*sy,5,5,'#f2c56266');ellipse(c,o.at.x*sx,o.at.y*sy,2.5,2.5,'#ffe19c');}
 const p=g.mode==='vehicle'?g.vehicle:g.mode==='fork'?g.fork:g.player;ellipse(c,p.x*sx,p.y*sy,3,3,'#8edce4','#d7f2ee',1);text(c,'N',w-12,13,8,'#e2ebe4','center');c.restore();
}
root.WarehouseArt={setCharacterSprites,setWalkSprites,setNPCSprites,setPropsImage,setTruckImage,setEmptyForkliftImage,P,seatedPerson,leaderDesk,dockedTrailer,poly,rect,round,grad,ellipse,line,text,outline,shadow,hatch,person,portrait,crate,pallet,forklift,vehicle,warehouse,yard,marker,minimap,obstacles,warehouseWalls};
})(typeof globalThis!=='undefined'?globalThis:this);
