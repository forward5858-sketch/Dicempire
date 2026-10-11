"use strict";
/* Kural testleri: başlangıç dizilişi */
const test=require("node:test");
const assert=require("node:assert/strict");
const R=require("../public/rules.js");

const city=(S,p)=>S.tiles.find(t=>t.island===p&&t.t==="s");

test("iki kişilik oyunda ikinci oyuncunun şehri fazladan askerle başlar",()=>{
  const S=R.newGame(["A","B"]);
  assert.equal(city(S,0).troops,5);
  assert.equal(city(S,1).troops,5+R.SECOND_BONUS);
  assert.equal(S.log[0].k,"secondBonus");
  assert.equal(S.log[0].p,1);
});

test("üç ve dört kişilik oyunda herkes eşit başlar",()=>{
  for(const n of [3,4]){
    const S=R.newGame(Array.from({length:n},(_,i)=>`P${i}`));
    for(let p=0;p<n;p++)assert.equal(city(S,p).troops,5);
    assert.ok(!S.log.some(l=>l.k==="secondBonus"));
  }
});
