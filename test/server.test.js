"use strict";
/* Sunucu testleri: gerçek sunucuyu rastgele bir portta açar, WebSocket istemcileriyle oynar. */
const test=require("node:test");
const assert=require("node:assert/strict");
const WebSocket=require("ws");
const http=require("http");
process.env.DICEMPIRE_AWAY_MS="300";   // testte sıra geçme beklemesi kısa olsun
const server=require("../server.js");

let port;
test.before(async()=>{port=await server.start(0);});
test.after(()=>server.stop());

/* Gelen mesajları biriktiren, istenen mesajı bekleyebilen küçük istemci */
function client(){
  const ws=new WebSocket(`ws://localhost:${port}/ws`);
  const inbox=[],waiters=[];
  ws.on("message",raw=>{
    const m=JSON.parse(raw);inbox.push(m);
    for(const w of [...waiters])if(w.pred(m)){waiters.splice(waiters.indexOf(w),1);w.res(m);}
  });
  const c={
    ws,inbox,
    open:()=>new Promise(r=>ws.readyState===1?r():ws.once("open",r)),
    send:m=>ws.send(JSON.stringify(m)),
    next:(pred,ms=3000)=>new Promise((res,rej)=>{
      const w={pred,res};waiters.push(w);
      setTimeout(()=>{if(waiters.includes(w)){waiters.splice(waiters.indexOf(w),1);rej(new Error("Mesaj gelmedi"));}},ms);
    }),
    last:t=>[...inbox].reverse().find(m=>m.t===t),
    close:()=>ws.close()
  };
  return c;
}
const isRoom=m=>m.t==="room",isState=m=>m.t==="state";

async function lobbyWith(n){
  const host=client();await host.open();
  host.send({t:"create",name:"Ayşe"});
  const joined=await host.next(m=>m.t==="joined");
  const others=[];
  for(let i=1;i<n;i++){
    const c=client();await c.open();
    c.send({t:"join",code:joined.code.toLowerCase(),name:`Oyuncu${i}`});
    await c.next(m=>m.t==="joined");
    others.push(c);
  }
  await host.next(m=>isRoom(m)&&m.players.length===n);
  return {host,others,code:joined.code,all:[host,...others]};
}
async function started(n){
  const L=await lobbyWith(n);
  const waits=L.all.map(c=>c.next(isState));
  L.host.send({t:"start"});
  const states=await Promise.all(waits);
  return {...L,S:states[0].S};
}

test("oyun sayfası ve kurallar dosyası sunuluyor, klasör dışına çıkılamıyor",async()=>{
  const get=p=>new Promise(r=>http.get({port,path:p},res=>{let b="";res.on("data",d=>b+=d);res.on("end",()=>r({code:res.statusCode,body:b,type:res.headers["content-type"]}));}));
  const page=await get("/");
  assert.equal(page.code,200);assert.match(page.body,/Dicempire/);
  assert.match((await get("/rules.js")).type,/javascript/);
  assert.equal((await get("/healthz")).body,"ok");
  assert.notEqual((await get("/..%2fserver.js")).code,200);
  assert.equal((await get("/yok.html")).code,404);
});

test("oda kurulur, kodla katılınır, herkes oyuncu listesini görür",async()=>{
  const {host,others,code,all}=await lobbyWith(3);
  assert.match(code,/^[A-HJ-NP-Z2-9]{4}$/);
  const full=m=>isRoom(m)&&m.players.length===3;
  const view=others[1].inbox.find(full)||await others[1].next(full);
  assert.deepEqual(view.players.map(p=>p.name),["Ayşe","Oyuncu1","Oyuncu2"]);
  assert.equal(view.host,host.last("joined").id);
  all.forEach(c=>c.close());
});

test("olmayan oda, dolu oda ve başlamış oyun için anlaşılır hata",async()=>{
  const c=client();await c.open();
  c.send({t:"join",code:"ZZZZ",name:"X"});
  assert.match((await c.next(m=>m.t==="error")).msg,/Böyle bir oda yok/);
  const L=await lobbyWith(4);
  c.send({t:"join",code:L.code,name:"X"});
  assert.match((await c.next(m=>m.t==="error")).msg,/Oda dolu/);
  L.all.forEach(x=>x.close());
  const G=await started(2);
  c.send({t:"join",code:G.code,name:"X"});
  assert.match((await c.next(m=>m.t==="error")).msg,/oyun başlamış/);
  G.all.forEach(x=>x.close());c.close();
});

test("oyunu sadece oda sahibi ve en az 2 kişiyle başlatabilir",async()=>{
  const solo=client();await solo.open();
  solo.send({t:"create",name:"Tek"});await solo.next(m=>m.t==="joined");
  solo.send({t:"start"});
  await assert.rejects(solo.next(isState,400));
  const L=await lobbyWith(2);
  L.others[0].send({t:"start"});
  await assert.rejects(L.others[0].next(isState,400));
  solo.close();L.all.forEach(c=>c.close());
});

test("sırası olmayan oyuncunun hamlesi yok sayılır, sırası olanınki herkese gider",async()=>{
  const {host,others,S,all}=await started(2);
  assert.equal(S.cur,0);assert.equal(S.phase,"reinforce");
  const city1=S.tiles.find(t=>t.owner===1&&t.t==="s");
  others[0].send({t:"act",a:"tap",tile:city1.id});
  await assert.rejects(others[0].next(isState,400));
  const city0=S.tiles.find(t=>t.owner===0&&t.t==="s");
  const seen=others[0].next(isState);
  host.send({t:"act",a:"tap",tile:city0.id});
  const after=(await seen).S;
  assert.equal(after.tiles[city0.id].troops,city0.troops+1);
  assert.equal(after.pool,S.pool-1);
  all.forEach(c=>c.close());
});

test("tam bir tur: takviye, saldırı zarı, taşıma, sıra rakibe geçer",async()=>{
  const {host,others,S:S0,all}=await started(2);
  let S=S0;
  const city=S.tiles.find(t=>t.owner===0&&t.t==="s");
  const step=async m=>{const p=host.next(isState);host.send(m);S=(await p).S;return S;};
  while(S.phase==="reinforce")await step({t:"act",a:"tap",tile:city.id});
  assert.equal(S.phase,"attack");
  await step({t:"act",a:"tap",tile:city.id});
  assert.equal(S.sel,city.id);
  const target=city.nb.map(i=>S.tiles[i]).find(t=>t.owner!==0);
  await step({t:"act",a:"tap",tile:target.id});
  assert.equal(S.tgt,target.id);
  const rolled=await step({t:"act",a:"roll"});
  assert.ok(rolled.dice&&rolled.dice.ra>=1&&rolled.dice.ra<=6);
  // animasyon süresince yeni zar atılamaz
  host.send({t:"act",a:"roll"});
  const free=await host.next(m=>isState(m)&&!m.S.busy,2000);
  S=free.S;assert.equal(free.roll,null);
  if(S.phase==="move")await step({t:"act",a:"moveOk"});
  await step({t:"act",a:"next"});
  assert.equal(S.phase,"fortify");
  await step({t:"act",a:"next"});
  assert.equal(S.cur,1);assert.equal(S.phase,"reinforce");
  const turn=m=>isState(m)&&m.S.turn===S.turn;
  const seen=(others[0].inbox.find(turn)||await others[0].next(turn)).S;
  assert.equal(seen.cur,1);
  all.forEach(c=>c.close());
});

test("oyuncu ayrılınca alanları tarafsız olur, tek kalan kazanır",async()=>{
  const {host,others,all}=await started(2);
  const fin=host.next(m=>isState(m)&&m.S.winner!==null);
  others[0].send({t:"leave"});
  const S=(await fin).S;
  assert.equal(S.winner,0);assert.equal(S.winReason,"left");
  assert.equal(S.tiles.filter(t=>t.owner===1).length,0);
  // oda sahibi herkesi lobiye döndürebilir
  const back=host.next(m=>isRoom(m)&&m.status==="lobby");
  host.send({t:"again"});
  assert.equal((await back).players.length,1);
  all.forEach(c=>c.close());
});

test("bağlantısı kopan oyuncu kodla geri döner ve oyuna devam eder",async()=>{
  const {host,others,code,all}=await started(3);
  const token=others[0].last("joined").token;
  const offline=host.next(m=>isRoom(m)&&m.players.some(p=>!p.online));
  others[0].close();
  await offline;
  const again=client();await again.open();
  const st=again.next(isState);
  again.send({t:"resume",code,token});
  const room=await again.next(isRoom);
  assert.equal(room.status,"game");
  assert.equal(room.players.find(p=>p.id===room.you).seat,1);
  assert.equal((await st).S.players.length,3);
  const bad=client();await bad.open();
  bad.send({t:"resume",code,token:"yanlis"});
  assert.equal((await bad.next(m=>m.t==="error")).code,"resume");
  [...all,again,bad].forEach(c=>c.close());
});

test("sırası gelen oyuncunun bağlantısı koparsa sırası geçilir",async()=>{
  const {host,others,all}=await started(2);
  const skipped=others[0].next(m=>isState(m)&&m.S.cur===1,3000);
  host.close();
  const S=(await skipped).S;
  assert.equal(S.phase,"reinforce");
  assert.match(S.log.find(l=>/sırası geçildi/.test(l)),/Ayşe/);
  all.forEach(c=>c.close());
});

test("isimlerdeki HTML temizlenir",async()=>{
  const c=client();await c.open();
  c.send({t:"create",name:"<img src=x onerror=alert(1)>Ali"});
  const r=await c.next(isRoom);
  assert.ok(!/[<>]/.test(r.players[0].name));
  assert.ok(r.players[0].name.length<=14);
  c.close();
});
