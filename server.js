"use strict";
/* Dicempire sunucusu: oyun sayfasını (public/) dağıtır, odaları ve oyunu WebSocket üzerinden yönetir.
   Oyunun tek doğru kaynağı burasıdır; telefonlar sadece dokunuşları gönderir, gelen durumu çizer. */
const http=require("http"),fs=require("fs"),path=require("path"),crypto=require("crypto");
const {WebSocketServer}=require("ws");
const R=require("./public/rules.js");

const PUB=path.join(__dirname,"public");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",
  ".webp":"image/webp",".png":"image/png",".svg":"image/svg+xml",".ico":"image/x-icon",".json":"application/json"};
const ROLL_MS=750;            // tek zar animasyonu bitene kadar yeni zar atılamaz
const BLITZ_STEP_MS=560;      // "sonuna kadar" saldırıda iki zar arası
const AWAY_MS=+process.env.DICEMPIRE_AWAY_MS||45000;   // bağlantısı kopan oyuncunun sırası bu süre sonra geçilir
const LOBBY_GRACE_MS=60000;   // lobide bağlantısı kopan oyuncu bu süre içinde dönmezse listeden çıkar
const ROOM_IDLE_MS=10*60000;  // kimse bağlı değilse oda bu süre sonra silinir
const MAX_ROOMS=1000;
const CODE_CHARS="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // karışan I, O, 0, 1 yok

/* ---------- dosya sunucusu ---------- */
const server=http.createServer((req,res)=>{
  if(req.method!=="GET"&&req.method!=="HEAD"){res.writeHead(405);return res.end();}
  let p;
  try{p=decodeURIComponent(new URL(req.url,"http://x").pathname);}catch(e){res.writeHead(400);return res.end();}
  if(p==="/healthz"){res.writeHead(200,{"content-type":"text/plain"});return res.end("ok");}
  if(p==="/")p="/index.html";
  const file=path.join(PUB,path.normalize(p));
  if(!file.startsWith(PUB+path.sep)){res.writeHead(403);return res.end();}
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404,{"content-type":"text/plain; charset=utf-8"});return res.end("Bulunamadı");}
    const ext=path.extname(file);
    res.writeHead(200,{"content-type":TYPES[ext]||"application/octet-stream",
      "cache-control":ext===".webp"?"public, max-age=86400":"no-cache"});
    res.end(req.method==="HEAD"?undefined:data);
  });
});

/* ---------- odalar ---------- */
const rooms=new Map();
const newId=()=>crypto.randomBytes(6).toString("hex");
const newToken=()=>crypto.randomBytes(16).toString("hex");
function newCode(){
  let c;do{c=Array.from(crypto.randomBytes(4),b=>CODE_CHARS[b%CODE_CHARS.length]).join("");}while(rooms.has(c));
  return c;
}
const cleanName=s=>String(s||"").replace(/[\u0000-\u001f<>]/g,"").trim().slice(0,14)||"Oyuncu";
const send=(ws,m)=>{if(ws&&ws.readyState===1)ws.send(JSON.stringify(m));};

function roomView(room,me){
  return {t:"room",code:room.code,host:room.hostId,status:room.status,you:me.id,
    players:room.players.map(p=>({id:p.id,name:p.name,seat:p.seat,online:!!p.ws}))};
}
function broadcastRoom(room){pickHost(room);room.players.forEach(p=>send(p.ws,roomView(room,p)));}
function broadcastState(room,roll){
  const msg=JSON.stringify({t:"state",S:room.S,roll:roll||null});
  room.players.forEach(p=>{if(p.ws&&p.ws.readyState===1)p.ws.send(msg);});
}
function reseat(room){room.players.forEach((p,i)=>{p.seat=i;});}
/* Oda sahibi çıkar ya da bağlantısı koparsa yetki bağlı olan ilk oyuncuya geçer */
function pickHost(room){
  const h=room.players.find(p=>p.id===room.hostId);
  if(h&&h.ws)return;
  const n=room.players.find(p=>p.ws)||h||room.players[0];
  room.hostId=n?n.id:null;
}
function deleteRoom(room){
  clearTimeout(room.awayTimer);clearTimeout(room.idleTimer);
  room.players.forEach(p=>{clearTimeout(p.dropTimer);if(p.ws)p.ws.ctx=null;});
  room.S=null;rooms.delete(room.code);
}
function scheduleCleanup(room){
  clearTimeout(room.idleTimer);
  if(room.players.some(p=>p.ws))return;
  room.idleTimer=setTimeout(()=>{if(!room.players.some(p=>p.ws))deleteRoom(room);},
    room.status==="lobby"?LOBBY_GRACE_MS+5000:ROOM_IDLE_MS);
}
function attach(room,p,ws){
  if(p.ws&&p.ws!==ws){p.ws.ctx=null;p.ws.close(4000,"Başka bir sekmeden bağlanıldı");}
  p.ws=ws;ws.ctx={room,p};
  clearTimeout(p.dropTimer);clearTimeout(room.idleTimer);
  send(ws,{t:"joined",code:room.code,token:p.token,id:p.id});
}
function addPlayer(room,ws,name){
  const p={id:newId(),token:newToken(),name:cleanName(name),seat:room.players.length,ws:null};
  room.players.push(p);
  if(!room.hostId)room.hostId=p.id;
  attach(room,p,ws);
  broadcastRoom(room);
}
function removeFromRoom(room,p){
  clearTimeout(p.dropTimer);
  if(p.ws)p.ws.ctx=null;
  room.players=room.players.filter(x=>x!==p);
  if(!room.players.length)return deleteRoom(room);
  if(room.status==="lobby")reseat(room);
  broadcastRoom(room);
}
function leave(room,p){
  const S=room.S;
  if(room.status==="game"&&S&&S.winner===null){
    R.removePlayer(S,p.seat);
    removeFromRoom(room,p);
    if(rooms.has(room.code)){broadcastState(room);checkAway(room);}
  }else removeFromRoom(room,p);
}

/* Sırası gelen oyuncu bağlı değilse bir süre bekleyip sırasını geçer */
function checkAway(room){
  const S=room.S;
  if(room.status!=="game"||!S||S.winner!==null){clearTimeout(room.awayTimer);room.awayTimer=null;return;}
  const p=room.players.find(x=>x.seat===S.cur);
  if(p&&p.ws){clearTimeout(room.awayTimer);room.awayTimer=null;return;}
  if(room.awayTimer&&room.awayTurn===S.turn)return;     // zaten sayılıyor
  clearTimeout(room.awayTimer);
  room.awayTurn=S.turn;
  room.awayTimer=setTimeout(()=>{
    room.awayTimer=null;
    if(room.S!==S||S.turn!==room.awayTurn||S.winner!==null)return;
    const q=room.players.find(x=>x.seat===S.cur);
    if(q&&q.ws)return;
    if(S.busy){room.awayTimer=setTimeout(()=>checkAway(room),1000);return;}
    R.skipTurn(S);broadcastState(room);checkAway(room);
  },AWAY_MS);
}

/* ---------- zar ---------- */
function roll(room){
  const S=room.S;
  if(S.busy||S.phase!=="attack"||S.sel===null||S.tgt===null)return;
  const r=R.rollOnce(S);R.applyRoll(S,r);R.afterBattle(S);
  if(S.winner===null)S.busy=true;
  broadcastState(room,"single");
  if(S.winner!==null)return;
  setTimeout(()=>{if(room.S!==S||!S.busy||S.blitz)return;S.busy=false;broadcastState(room);checkAway(room);},ROLL_MS);
}
function blitz(room){
  const S=room.S;
  if(S.busy){if(S.blitz)S.stop=true;return;}
  if(S.phase!=="attack"||S.sel===null||S.tgt===null)return;
  Object.assign(S,{busy:true,blitz:true,stop:false});
  const cur=S.cur,sel=S.sel,tgt=S.tgt,turn=S.turn,a=S.tiles[sel],d=S.tiles[tgt];
  let lostA=0,lostD=0;
  const step=()=>{
    // oyuncu çıktıysa ya da sırası geçildiyse saldırı yarıda kalır
    if(room.S!==S||S.turn!==turn||S.cur!==cur||S.sel!==sel||S.tgt!==tgt||S.winner!==null)return;
    if(a.troops>=2&&d.troops>0&&!S.stop){
      const r=R.rollOnce(S),dg=R.applyRoll(S,r);r.win?lostD+=dg:lostA+=dg;
      broadcastState(room,"blitz");
      setTimeout(step,BLITZ_STEP_MS);return;
    }
    R.addLog(S,"blitz",{p:cur,lost:lostA,killed:lostD});
    S.busy=false;S.blitz=false;R.afterBattle(S);
    broadcastState(room);checkAway(room);
  };
  step();
}

/* ---------- mesajlar ----------
   Hatalar metin değil anahtar olarak gider (key), tarayıcı oyuncunun dilinde yazar. */
function onMessage(ws,m){
  const ctx=ws.ctx;
  switch(m.t){
    case "create":{
      if(ctx)return;
      if(rooms.size>=MAX_ROOMS)return send(ws,{t:"error",key:"busy"});
      const room={code:newCode(),players:[],hostId:null,status:"lobby",S:null};
      rooms.set(room.code,room);
      addPlayer(room,ws,m.name);
      return;
    }
    case "join":{
      if(ctx)return;
      const room=rooms.get(String(m.code||"").toUpperCase().trim());
      if(!room)return send(ws,{t:"error",key:"noRoom"});
      if(room.status!=="lobby")return send(ws,{t:"error",key:"started"});
      if(room.players.length>=R.MAX_PLAYERS)return send(ws,{t:"error",key:"full",n:R.MAX_PLAYERS});
      addPlayer(room,ws,m.name);
      return;
    }
    case "resume":{
      if(ctx)return;
      const room=rooms.get(String(m.code||""));
      const p=room&&room.players.find(x=>x.token===m.token);
      if(!p)return send(ws,{t:"error",key:"resume"});
      attach(room,p,ws);
      broadcastRoom(room);
      if(room.S)send(ws,{t:"state",S:room.S,roll:null});
      checkAway(room);
      return;
    }
  }
  if(!ctx)return;
  const {room,p}=ctx,S=room.S;
  switch(m.t){
    case "leave":ws.ctx=null;leave(room,p);return;
    case "start":
      if(p.id!==room.hostId||room.status!=="lobby"||room.players.length<R.MIN_PLAYERS)return;
      reseat(room);
      room.S=R.newGame(room.players.map(x=>x.name));
      room.status="game";
      broadcastRoom(room);broadcastState(room);checkAway(room);
      return;
    case "again":
      if(p.id!==room.hostId||room.status!=="game"||!S||S.winner===null)return;
      room.status="lobby";room.S=null;reseat(room);
      room.players.forEach(x=>{if(!x.ws)x.dropTimer=setTimeout(()=>{if(!x.ws&&room.status==="lobby")removeFromRoom(room,x);},LOBBY_GRACE_MS);});
      broadcastRoom(room);
      return;
    case "act":{
      if(room.status!=="game"||!S||S.winner!==null||p.seat!==S.cur||!S.players[p.seat].alive)return;
      let changed=false;
      switch(m.a){
        case "tap":changed=Number.isInteger(m.tile)&&R.tap(S,m.tile);break;
        case "roll":return roll(room);
        case "blitz":return blitz(room);
        case "move":changed=R.moveStep(S,m.op);break;
        case "moveOk":changed=R.moveOk(S);break;
        case "moveCancel":changed=R.moveCancel(S);break;
        case "next":changed=R.next(S);break;
      }
      if(changed){broadcastState(room);checkAway(room);}
      return;
    }
  }
}
function onClose(ws){
  const ctx=ws.ctx;if(!ctx)return;
  ws.ctx=null;
  const {room,p}=ctx;
  if(p.ws!==ws)return;
  p.ws=null;
  if(room.status==="lobby")p.dropTimer=setTimeout(()=>{if(!p.ws&&room.status==="lobby"&&rooms.has(room.code))removeFromRoom(room,p);},LOBBY_GRACE_MS);
  broadcastRoom(room);
  checkAway(room);
  scheduleCleanup(room);
}

const wss=new WebSocketServer({server,path:"/ws",maxPayload:2048});
wss.on("connection",ws=>{
  ws.isAlive=true;ws.ctx=null;
  ws.on("pong",()=>{ws.isAlive=true;});
  ws.on("message",raw=>{
    let m;try{m=JSON.parse(raw);}catch(e){return;}
    if(!m||typeof m!=="object")return;
    try{onMessage(ws,m);}catch(e){console.error("Mesaj işlenemedi:",e);}
  });
  ws.on("close",()=>onClose(ws));
  ws.on("error",()=>{});
});
// mobil ağlarda ve barındırma servislerinde boşta kalan bağlantılar kesilmesin diye düzenli ping
const heartbeat=setInterval(()=>{
  wss.clients.forEach(ws=>{if(!ws.isAlive)return ws.terminate();ws.isAlive=false;ws.ping();});
},25000).unref();
wss.on("close",()=>clearInterval(heartbeat));

function start(port){
  return new Promise(res=>server.listen(port,()=>res(server.address().port)));
}
function stop(){
  rooms.forEach(deleteRoom);
  wss.clients.forEach(ws=>ws.terminate());
  wss.close();
  return new Promise(res=>server.close(()=>res()));
}
if(require.main===module){
  const port=process.env.PORT||3000;
  start(port).then(p=>console.log(`Dicempire çalışıyor: http://localhost:${p}`));
}
module.exports={start,stop,rooms};
