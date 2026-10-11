/* Dicempire kuralları. Sunucu (Node) ve tarayıcı aynı dosyayı kullanır:
   oyunu sadece sunucu yürütür, tarayıcı bu dosyayı durumu çizmek için okur. */
(function(root){
"use strict";
const COLORS=[{c:"#d6453d",n:"Kızıl"},{c:"#2f6fd6",n:"Mavi"},{c:"#2e9e5b",n:"Yeşil"},{c:"#d9931a",n:"Altın"}];
const NEUTRAL="#d3d8da";
const TER={
  o:{e:"🌾",n:"Ova",d:"Buradan saldırınca zarına +1",neu:1},
  d:{e:"⛰️",n:"Dağ",d:"Savunurken zarına +1",neu:2},
  s:{e:"🏙️",n:"Şehir",d:"Her tur +2 asker",neu:2}
};
/* Halka: j1 ve j2 köprü kapıları (dağ), j4-j5 oyuncunun başlangıç alanları.
   Diziliş adanın dış eksenine göre aynalı: j1↔j2, j0↔j3, j4↔j5.
   Böylece her oyuncunun iki komşusuna giden yol birebir aynı. */
const RING_TER=["o","d","d","o","o","o"];
const GATE_NEXT=1, GATE_PREV=2, HOME=[4,5];
const ISLAND_R={2:1.9,3:2.05,4:2.45};
const START={base:5,side:3}, WIN_SHARE=.6, REGION_BONUS=3;
const MIN_PLAYERS=2, MAX_PLAYERS=4;

const d6=()=>1+Math.floor(Math.random()*6);
const rad=d=>d*Math.PI/180;

/* n tane 7 altıgenlik ada, merkez etrafında tam simetrik */
function buildIslands(n){
  const Rc=ISLAND_R[n], ext=Rc+1.75, s=96/(2*ext);
  const tiles=[],centers=[];
  for(let k=0;k<n;k++){
    const a=rad(360/n*k-90);
    centers.push([50+Rc*s*Math.cos(a), 50+Rc*s*Math.sin(a)]);
  }
  for(let k=0;k<n;k++){
    const [cx,cy]=centers[k], rot=360/n*k, base=tiles.length;
    tiles.push({id:base,island:k,t:"s",x:cx,y:cy,rot,nb:[]});
    for(let j=0;j<6;j++){
      const a=rad(rot+60*j);
      tiles.push({id:base+1+j,island:k,t:RING_TER[j],rot,
        x:cx+s*Math.cos(a), y:cy+s*Math.sin(a), nb:[]});
    }
    for(let j=0;j<6;j++){link(tiles,base,base+1+j);link(tiles,base+1+j,base+1+(j+1)%6);}
  }
  const bridges=[];
  if(n>1)for(let k=0;k<n;k++){
    const k2=(k+1)%n;
    const a=k*7+1+GATE_NEXT, b=k2*7+1+GATE_PREV;
    link(tiles,a,b);bridges.push([a,b]);
  }
  const xs=tiles.map(t=>t.x),ys=tiles.map(t=>t.y);
  const dx=50-(Math.min(...xs)+Math.max(...xs))/2, dy=50-(Math.min(...ys)+Math.max(...ys))/2;
  tiles.forEach(t=>{t.x+=dx;t.y+=dy;});           // haritayı tahtaya ortala
  return {tiles,bridges,s};
}
function link(tiles,a,b){if(!tiles[a].nb.includes(b)){tiles[a].nb.push(b);tiles[b].nb.push(a);}}

function newGame(names){
  const n=names.length,M=buildIslands(n);
  M.tiles.forEach(t=>{t.owner=-1;t.troops=TER[t.t].neu;t.region=t.island;});
  names.forEach((_,p)=>{
    const home=M.tiles.filter(t=>t.island===p);
    Object.assign(home[0],{owner:p,troops:START.base});          // şehir üssü
    HOME.forEach(j=>Object.assign(home[1+j],{owner:p,troops:START.side}));
  });
  const S={tiles:M.tiles,bridges:M.bridges,hexSize:M.s,
     regionNames:names.map(nm=>`${nm} Adası`),
     players:names.map((nm,i)=>({name:nm,color:COLORS[i].c,alive:true,left:false})),
     cur:0,turn:1,phase:"reinforce",pool:0,sel:null,tgt:null,move:null,dice:null,log:[],
     busy:false,blitz:false,stop:false,winner:null,winReason:null};
  S.pool=calcReinf(S,0);
  addLog(S,`${n} ada kuruldu, her adada 7 alan. Herkes şehir üssü ve arkadaki iki alanla başlıyor; komşulara uzaklıklar eşit.`);
  return S;
}

const owned=(S,p)=>S.tiles.filter(t=>t.owner===p);
const ownerName=(S,o)=>o<0?"Tarafsız":S.players[o].name;
const ownerColor=(S,o)=>o<0?NEUTRAL:S.players[o].color;
const winNeed=S=>Math.ceil(S.tiles.length*WIN_SHARE);
const neighbors=(S,t)=>t.nb.map(i=>S.tiles[i]);
const aliveSeats=S=>S.players.map((p,i)=>p.alive?i:-1).filter(i=>i>=0);
function regionOwner(S,ri){
  const ts=S.tiles.filter(t=>t.region===ri),o=ts[0].owner;
  return o>=0&&ts.every(t=>t.owner===o)?o:-1;
}
function calcReinf(S,p){
  const mine=owned(S,p);
  let n=Math.max(3,Math.ceil(mine.length/2))+mine.filter(t=>t.t==="s").length*2;
  S.regionNames.forEach((_,i)=>{if(regionOwner(S,i)===p)n+=REGION_BONUS;});
  return n;
}
function reinfBreakdown(S,p){
  const mine=owned(S,p),parts=[`${Math.max(3,Math.ceil(mine.length/2))} temel`];
  const c=mine.filter(t=>t.t==="s").length;if(c)parts.push(`${c*2} şehir`);
  S.regionNames.forEach((nm,i)=>{if(regionOwner(S,i)===p)parts.push(`${REGION_BONUS} ${nm}`);});
  return parts.join(" + ");
}
const atkBonus=t=>t.t==="o"?1:0;
const defBonus=t=>t.t==="d"?1:0;
function addLog(S,s){S.log.unshift(s);S.log=S.log.slice(0,40);}

/* Zar sonucu, alanların o anki sahipleriyle birlikte saklanır; alan el değiştirse de zarlar doğru çizilir */
function rollOnce(S){
  const a=S.tiles[S.sel],d=S.tiles[S.tgt];
  const ra=d6(),rd=d6(),A=ra+atkBonus(a),D=rd+defBonus(d);
  return {ra,rd,A,D,win:A>D,dmg:Math.abs(A-D)>=3?2:1,a:a.id,d:d.id,aOwner:a.owner,dOwner:d.owner};
}
function applyRoll(S,r){
  const a=S.tiles[r.a],d=S.tiles[r.d];
  if(r.win)d.troops=Math.max(0,d.troops-r.dmg);else a.troops=Math.max(1,a.troops-r.dmg);
  r.fx=r.win?d.id:a.id;
  S.dice=r;
  return r.dmg;
}
function declareWin(S,p,reason){
  Object.assign(S,{winner:p,winReason:reason,phase:"over",busy:false,blitz:false,stop:true,move:null,sel:null,tgt:null});
}
function afterBattle(S){
  const a=S.tiles[S.sel],d=S.tiles[S.tgt];
  if(d.troops<=0){
    const loser=d.owner;d.owner=S.cur;
    addLog(S,`${S.players[S.cur].name}, ${TER[d.t].n.toLowerCase()} alanını ${loser<0?"tarafsızlardan":ownerName(S,loser)+" oyuncusundan"} aldı.`);
    if(loser>=0&&owned(S,loser).length===0){S.players[loser].alive=false;addLog(S,`${S.players[loser].name} oyundan çıktı.`);}
    const wipe=aliveSeats(S).length===1;
    if(wipe||owned(S,S.cur).length>=winNeed(S)){
      d.troops=a.troops-1;a.troops=1;declareWin(S,S.cur,wipe?"wipe":"share");return;}
    S.move={from:a.id,to:d.id,min:1,max:a.troops-1,n:a.troops-1,kind:"conquer"};
    S.phase="move";
  }else if(a.troops<2){S.tgt=null;S.sel=null;}
}
function nextTurn(S){
  let n=S.cur;do{n=(n+1)%S.players.length;}while(!S.players[n].alive);
  Object.assign(S,{cur:n,turn:S.turn+1,phase:"reinforce",sel:null,tgt:null,move:null,dice:null,busy:false,blitz:false,stop:true});
  S.pool=calcReinf(S,n);
  addLog(S,`Sıra ${S.players[n].name} oyuncusunda: ${S.pool} asker (${reinfBreakdown(S,n)}).`);
}
/* Alınan alana asker taşıma yarım kaldıysa (sıra geçildi ya da oyuncu çıktı) seçili sayıyla bitir */
function finishPendingMove(S){
  const m=S.move;if(!m)return;
  if(m.kind==="conquer"){const a=S.tiles[m.from],d=S.tiles[m.to];d.troops=m.n;a.troops-=m.n;}
  S.move=null;
}

/* ---------- oyuncu aksiyonları: hepsi sırası gelen oyuncu adına çağrılır, değişiklik olduysa true döner ---------- */
function tap(S,id){
  const t=S.tiles[id];
  if(!t||S.busy||S.phase==="move"||S.phase==="over")return false;
  if(S.phase==="reinforce"){
    if(t.owner!==S.cur||S.pool<=0)return false;
    t.troops++;S.pool--;
    if(S.pool===0){S.phase="attack";addLog(S,`${S.players[S.cur].name} askerlerini yerleştirdi.`);}
    return true;
  }
  if(S.phase==="fortify"){
    if(t.owner!==S.cur)return false;
    if(S.sel!==null&&t.id!==S.sel&&neighbors(S,S.tiles[S.sel]).includes(t)){
      const a=S.tiles[S.sel];
      S.move={from:a.id,to:t.id,min:1,max:a.troops-1,n:Math.ceil((a.troops-1)/2),kind:"fortify"};
      return true;
    }
    if(t.troops<2)return false;
    S.sel=(S.sel===t.id?null:t.id);S.move=null;
    return true;
  }
  if(t.owner===S.cur){
    if(t.troops<2)return false;
    S.sel=(S.sel===t.id?null:t.id);S.tgt=null;S.dice=null;
    return true;
  }
  if(S.sel!==null&&neighbors(S,S.tiles[S.sel]).includes(t)){S.tgt=t.id;S.dice=null;return true;}
  return false;
}
function moveStep(S,op){
  const m=S.move;if(!m||S.busy)return false;
  const n={minus:m.n-1,plus:m.n+1,min:m.min,max:m.max}[op];
  if(n===undefined)return false;
  m.n=Math.min(m.max,Math.max(m.min,n));
  return true;
}
function moveOk(S){
  const m=S.move;if(!m||S.busy)return false;
  const a=S.tiles[m.from],d=S.tiles[m.to];
  if(m.kind==="conquer"){
    d.troops=m.n;a.troops-=m.n;
    addLog(S,`${S.players[S.cur].name} yeni alana ${m.n} asker taşıdı.`);
    S.move=null;S.phase="attack";S.tgt=null;S.dice=null;
    S.sel=d.troops>=2?d.id:(a.troops>=2?a.id:null);
  }else{
    a.troops-=m.n;d.troops+=m.n;
    addLog(S,`${S.players[S.cur].name} ${m.n} askeri komşu alanına taşıdı.`);nextTurn(S);
  }
  return true;
}
function moveCancel(S){
  if(!S.move||S.move.kind!=="fortify"||S.busy)return false;
  S.move=null;return true;
}
function next(S){
  if(S.busy||S.move)return false;
  if(S.phase==="attack"){S.phase="fortify";S.sel=S.tgt=null;S.dice=null;return true;}
  if(S.phase==="fortify"){nextTurn(S);return true;}
  return false;
}
/* Bağlantısı kopan oyuncunun sırası geçilir */
function skipTurn(S){
  finishPendingMove(S);
  addLog(S,`${S.players[S.cur].name} bağlantıda değil, sırası geçildi.`);
  nextTurn(S);
}
/* Oyundan ayrılan oyuncunun alanları içindeki askerlerle tarafsız olur */
function removePlayer(S,p){
  const pl=S.players[p];if(!pl||!pl.alive||S.winner!==null)return;
  if(S.cur===p)finishPendingMove(S);
  pl.alive=false;pl.left=true;
  S.tiles.forEach(t=>{if(t.owner===p)t.owner=-1;});
  addLog(S,`${pl.name} oyundan ayrıldı; alanları tarafsız oldu.`);
  const alive=aliveSeats(S);
  if(alive.length===1){declareWin(S,alive[0],"left");return;}
  if(S.cur===p)nextTurn(S);
}

const api={COLORS,NEUTRAL,TER,REGION_BONUS,WIN_SHARE,MIN_PLAYERS,MAX_PLAYERS,
  buildIslands,newGame,owned,ownerName,ownerColor,winNeed,neighbors,aliveSeats,regionOwner,calcReinf,reinfBreakdown,
  atkBonus,defBonus,addLog,rollOnce,applyRoll,afterBattle,nextTurn,tap,moveStep,moveOk,moveCancel,next,skipTurn,removePlayer};
if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.Rules=api;
})(this);
