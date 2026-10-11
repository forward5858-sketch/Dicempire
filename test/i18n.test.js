"use strict";
/* Dil dosyası testleri: her dilde bütün metinler var mı, yer tutucular doğru mu, oyunun kullandığı anahtarlar sözlükte mi. */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("fs");
const path=require("path");
const I18n=require("../public/i18n.js");

const {DICT,LANGS}=I18n;
const base=DICT.tr;
const holders=s=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort().join(",");
const forms=v=>typeof v==="string"?[v]:Object.values(v);

test("her dilin adı ve sözlüğü var",()=>{
  assert.deepEqual(Object.keys(LANGS).sort(),Object.keys(DICT).sort());
});

test("her dilde Türkçedeki bütün anahtarlar var, fazlası yok",()=>{
  for(const lang of Object.keys(DICT)){
    const keys=Object.keys(DICT[lang]);
    assert.deepEqual(Object.keys(base).filter(k=>!keys.includes(k)),[],`${lang} eksik`);
    assert.deepEqual(keys.filter(k=>!(k in base)),[],`${lang} fazla`);
  }
});

test("çevirilerdeki yer tutucular Türkçedekilerle aynı",()=>{
  for(const [lang,d] of Object.entries(DICT))for(const [k,v] of Object.entries(d)){
    const want=holders(forms(base[k])[0]);
    for(const f of forms(v)){
      assert.equal(typeof f,"string",`${lang}.${k}`);
      // Rusçada sayı bazen metne gömülüdür ("1 asker" yerine "солдат: 1"), o yüzden {n} eksik olabilir
      const got=holders(f),loose=got.split(",").filter(x=>x!=="n").join(",")===want.split(",").filter(x=>x!=="n").join(",");
      assert.ok(got===want||loose,`${lang}.${k}: {${got}} ≠ {${want}}`);
    }
    if(typeof v==="object")assert.ok("other" in v,`${lang}.${k} için "other" biçimi yok`);
  }
});

test("oyun sayfasındaki bütün anahtarlar sözlükte",()=>{
  const html=fs.readFileSync(path.join(__dirname,"../public/index.html"),"utf8");
  const used=new Set();
  for(const m of html.matchAll(/data-i18n(?:-html|-ph|-aria)?="([\w.]+)"/g))used.add(m[1]);
  for(const m of html.matchAll(/\bt\("([\w.]+)"/g))if(!m[1].endsWith("."))used.add(m[1]);
  // dinamik anahtarlar: "ph."+aşama, "ter."+arazi gibi
  for(const ph of ["reinforce","attack","move","fortify","over"])used.add("ph."+ph),used.add("phLow."+ph);
  for(const k of ["o","d","s"])used.add("ter."+k),used.add("terLow."+k),used.add("terDesc."+k);
  for(const k of ["wipe","left","share"])used.add("win."+k);
  for(const k of ["busy","noRoom","started","full","resume"])used.add("err."+k);
  for(const k of ["start","conquer","out","placed","turn","moveIn","fortify","skip","left","blitz"])used.add("log."+k);
  const missing=[...used].filter(k=>!(k in base));
  assert.deepEqual(missing,[]);
});

test("sayıya göre doğru biçim seçilir ve değerler yerleşir",()=>{
  assert.equal(I18n.translate("en","res.atk",{name:"Ali",n:1}),"Attacker wins, Ali loses 1 troop.");
  assert.equal(I18n.translate("en","res.atk",{name:"Ali",n:2}),"Attacker wins, Ali loses 2 troops.");
  assert.equal(I18n.translate("ru","ph.reinforce",{n:2}),"Подкрепление: 2 солдата");
  assert.equal(I18n.translate("ru","ph.reinforce",{n:5}),"Подкрепление: 5 солдат");
  assert.equal(I18n.translate("ru","ph.reinforce",{n:21}),"Подкрепление: 21 солдат");
  assert.equal(I18n.translate("tr","err.full",{n:4}),"Oda dolu (en fazla 4 kişi).");
  assert.equal(I18n.translate("de","yok.boyle.anahtar"),"yok.boyle.anahtar");
});

test("dil seçimi: kayıtlı tercih, sonra tarayıcı dili, yoksa İngilizce",()=>{
  assert.equal(I18n.detect("de",["tr-TR"]),"de");
  assert.equal(I18n.detect(null,["tr-TR","en"]),"tr");
  assert.equal(I18n.detect("xx",["ja","fr-CA"]),"fr");
  assert.equal(I18n.detect(null,["ja"]),"en");
});

test("sunucudan gelen günlük kayıtları kural dosyasında metin içermez",()=>{
  const Rules=require("../public/rules.js");
  const S=Rules.newGame(["Ayşe","Bora"]);
  assert.deepEqual(S.log.find(l=>l.k==="start"),{k:"start",n:2});
  assert.deepEqual(S.log[0],{k:"secondBonus",p:1,n:Rules.SECOND_BONUS});
  const b=Rules.reinfBreakdown(S,0);
  assert.deepEqual(b,{base:3,city:2,islands:[]});
  assert.equal(Rules.calcReinf(S,0),5);
});
