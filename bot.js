"use strict";
/* Bilgisayar rakip. Sırası gelen bot için bir sonraki tek hamleyi seçer; durumu değiştirmez.
   Sunucu seçilen hamleyi insan oyuncunun dokunuşuyla aynı kural fonksiyonlarından geçirir,
   yani bot kuralları atlayamaz. Amaç yenilmez bir rakip değil, tek başına da oynanabilen bir oyun. */
const R=require("./public/rules.js");

const NAMES=["🤖 Atlas","🤖 Nova","🤖 Pixel","🤖 Orion"];
/* Odada kullanılmayan ilk bot adı; adlar dilden bağımsız olsun diye özel isim */
const botName=taken=>NAMES.find(n=>!taken.includes(n))||NAMES[0];

const foes=(S,t)=>R.neighbors(S,t).filter(n=>n.owner!==t.owner);
/* Saldırının ne kadar umut verdiği. Saldıran son askerini bırakamaz (a.troops-1 vuruş hakkı),
   arazi bonusu tek zarda büyük fark yaptığı için iki asker sayılır. */
const edge=(a,d)=>a.troops-1-d.troops+2*(R.atkBonus(a)-R.defBonus(d));
function completesRegion(S,me,d){
  return S.tiles.every(t=>t.region!==d.region||t===d||t.owner===me);
}
function bestAttack(S,me){
  let best=null;
  for(const a of R.owned(S,me)){
    if(a.troops<2)continue;
    for(const d of foes(S,a)){
      const e=edge(a,d);
      if(e<1)continue;
      const score=e+(d.t==="s"?3:0)+(completesRegion(S,me,d)?4:0)+(d.owner>=0?1:0);
      if(!best||score>best.score)best={a,d,score};
    }
  }
  return best;
}
/* Takviye her seferinde en umutlu sınır alanına: art arda aynı alana yığılır, dağılmaz */
function reinforceTile(S,me){
  let best=null;
  for(const t of R.owned(S,me)){
    for(const f of foes(S,t)){
      const v=t.troops-f.troops+(f.t==="s"?2:0)+(f.owner>=0?1:0)+2*(R.atkBonus(t)-R.defBonus(f));
      if(!best||v>best.v)best={t,v};
    }
  }
  return (best?best.t:R.owned(S,me)[0]).id;
}
/* Cephede olmayan, askeri boşta bekleyen alandan sınırdaki komşuya */
function fortifyPair(S,me){
  let best=null;
  for(const i of R.owned(S,me)){
    if(i.troops<2||foes(S,i).length)continue;
    const b=R.neighbors(S,i).find(n=>n.owner===me&&foes(S,n).length);
    if(b&&(!best||i.troops>best.i.troops))best={i,b};
  }
  return best;
}

/* Dönen hamle: {a:"tap",tile} | {a:"blitz"} | {a:"setMove",n} | {a:"next"} */
function decide(S){
  const me=S.cur;
  if(S.phase==="reinforce")return {a:"tap",tile:reinforceTile(S,me)};
  if(S.move){
    const m=S.move;
    if(m.kind==="fortify")return {a:"setMove",n:m.max};
    // alınan alana: geride hâlâ düşman varsa yarısı, yoksa hepsi
    const back=foes(S,S.tiles[m.from]).length>0;
    return {a:"setMove",n:back?Math.ceil(m.max/2):m.max};
  }
  if(S.phase==="attack"){
    const b=bestAttack(S,me);
    if(!b)return {a:"next"};
    if(S.sel!==b.a.id)return {a:"tap",tile:b.a.id};
    if(S.tgt!==b.d.id)return {a:"tap",tile:b.d.id};
    return {a:"blitz"};
  }
  if(S.phase==="fortify"){
    const f=fortifyPair(S,me);
    if(!f)return {a:"next"};
    if(S.sel!==f.i.id)return {a:"tap",tile:f.i.id};
    return {a:"tap",tile:f.b.id};
  }
  return {a:"next"};
}

module.exports={decide,botName,NAMES};
