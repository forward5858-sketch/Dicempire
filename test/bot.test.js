"use strict";
/* Bot testleri: önce kural dosyası üzerinde botlar birbirine karşı oynar (sunucusuz, hızlı),
   sonra gerçek sunucuda tek başına oyun açılır ve bot sırasını oynayıp turu insana geri verir. */
const test=require("node:test");
const assert=require("node:assert/strict");
const WebSocket=require("ws");
process.env.DICEMPIRE_BOT_MS="5";
process.env.DICEMPIRE_BLITZ_MS="2";
const R=require("../public/rules.js");
const Bot=require("../bot.js");
const server=require("../server.js");

/* Sunucunun "sonuna kadar" saldırısının zamansız kopyası */
function blitzNow(S){
  const a=S.tiles[S.sel],d=S.tiles[S.tgt];
  while(a.troops>=2&&d.troops>0)R.applyRoll(S,R.rollOnce(S));
  R.afterBattle(S);
}
/* Bütün koltukları botların oynadığı bir oyun; her hamle geçerli olmalı, oyun bitmeli */
function playOut(n){
  const S=R.newGame(Array.from({length:n},(_,i)=>`B${i}`));
  let acts=0;
  while(S.winner===null){
    assert.ok(++acts<20000,`${n} botlu oyun bitmedi (tur ${S.turn})`);
    const act=Bot.decide(S);
    let ok;
    switch(act.a){
      case "tap":ok=R.tap(S,act.tile);break;
      case "blitz":ok=S.sel!==null&&S.tgt!==null;if(ok)blitzNow(S);break;
      case "setMove":ok=!!S.move;if(ok){S.move.n=Math.min(S.move.max,Math.max(S.move.min,act.n));ok=R.moveOk(S);}break;
      case "next":ok=R.next(S);break;
    }
    assert.ok(ok,`geçersiz bot hamlesi ${JSON.stringify(act)} (aşama ${S.phase})`);
  }
  return S;
}

test("botlar birbirine karşı her oyuncu sayısında oyunu geçerli hamlelerle bitirir",()=>{
  for(const n of [2,3,4])for(let i=0;i<60;i++){
    const S=playOut(n);
    assert.ok(S.winner>=0&&S.winner<n);
    assert.ok(["share","wipe"].includes(S.winReason));
  }
});

test("bot adları odada tekrar etmez",()=>{
  const taken=[];
  for(let i=0;i<4;i++)taken.push(Bot.botName(taken));
  assert.equal(new Set(taken).size,4);
});

/* ---------- gerçek sunucu ---------- */
let port;
test.before(async()=>{port=await server.start(0);});
test.after(()=>server.stop());

function client(){
  const ws=new WebSocket(`ws://localhost:${port}/ws`);
  const inbox=[],waiters=[];
  ws.on("message",raw=>{
    const m=JSON.parse(raw);inbox.push(m);
    for(const w of [...waiters])if(w.pred(m)){waiters.splice(waiters.indexOf(w),1);w.res(m);}
  });
  return {
    inbox,
    open:()=>new Promise(r=>ws.readyState===1?r():ws.once("open",r)),
    send:m=>ws.send(JSON.stringify(m)),
    next:(pred,ms=5000)=>new Promise((res,rej)=>{
      const w={pred,res};waiters.push(w);
      setTimeout(()=>{if(waiters.includes(w)){waiters.splice(waiters.indexOf(w),1);rej(new Error("Mesaj gelmedi"));}},ms);
    }),
    close:()=>ws.close()
  };
}
const isRoom=m=>m.t==="room";

test("bilgisayara karşı: oda bir botla açılır, bot sırasını oynayıp turu geri verir",async()=>{
  const c=client();await c.open();
  c.send({t:"create",name:"Ayşe",solo:true});
  const room=await c.next(m=>isRoom(m)&&m.players.length===2);
  const bot=room.players[1];
  assert.equal(bot.bot,true);assert.equal(bot.online,true);assert.match(bot.name,/^🤖/);
  c.send({t:"start"});
  let st=await c.next(m=>m.t==="state");
  assert.equal(st.S.cur,0);
  // insan takviyesini şehrine koyar, saldırmadan turu bitirir
  const city=st.S.tiles.find(t=>t.owner===0&&t.t==="s").id;
  for(let i=st.S.pool;i>0;i--)c.send({t:"act",a:"tap",tile:city});
  c.send({t:"act",a:"next"});c.send({t:"act",a:"next"});
  await c.next(m=>m.t==="state"&&m.S.cur===1);
  st=await c.next(m=>m.t==="state"&&(m.S.cur===0||m.S.winner!==null),8000);
  assert.ok(st.S.turn>=3||st.S.winner!==null);
  assert.ok(st.S.log.some(l=>l.k&&l.k!=="start"),"bot hiçbir şey yapmadı");
  c.close();
});

test("oda sahibi bot ekler ve oyuncu çıkarır; çıkarılan oyuncuya haber gider",async()=>{
  const host=client();await host.open();
  host.send({t:"create",name:"Ayşe"});
  const joined=await host.next(m=>m.t==="joined");
  const guest=client();await guest.open();
  guest.send({t:"join",code:joined.code,name:"Mehmet"});
  const gj=await guest.next(m=>m.t==="joined");
  host.send({t:"addBot"});host.send({t:"addBot"});
  const full=await host.next(m=>isRoom(m)&&m.players.length===4);
  assert.equal(full.players.filter(p=>p.bot).length,2);
  host.send({t:"addBot"});                                // oda dolu, eklenmez
  guest.send({t:"addBot"});guest.send({t:"kick",id:full.host});   // misafirin yetkisi yok
  host.send({t:"kick",id:gj.id});
  await guest.next(m=>m.t==="kicked");
  const after=await host.next(m=>isRoom(m)&&m.players.length===3);
  assert.deepEqual(after.players.map(p=>p.seat),[0,1,2]);
  assert.ok(!after.players.some(p=>p.name==="Mehmet"));
  const b=after.players.find(p=>p.bot);
  host.send({t:"kick",id:b.id});
  await host.next(m=>isRoom(m)&&m.players.length===2);
  host.close();guest.close();
});

test("insanlar çıkınca yalnız botların kaldığı oda silinir",async()=>{
  const c=client();await c.open();
  c.send({t:"create",name:"Ayşe",solo:true});
  const j=await c.next(m=>m.t==="joined");
  c.send({t:"leave"});
  await new Promise(r=>setTimeout(r,50));
  assert.equal(server.rooms.has(j.code),false);
  c.close();
});
