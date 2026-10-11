"use strict";
/* Mağaza ekran görüntüleri: oyunu gerçek sunucuyla açar, botlarla birkaç tur oynatır ve
   ana menü, lobi ve savaş ekranını mağazaların istediği ölçülerde, TR ve EN olarak çeker.
   Çıktı: store/screenshots/<dil>/<ölçü>/<sıra>-<ekran>.jpg
   Kurulum (bir kez): npm i --no-save playwright && npx playwright install chromium
   Çalıştırma: node scripts/screenshots.js */
process.env.DICEMPIRE_BOT_MS=process.env.DICEMPIRE_BOT_MS||"120";
process.env.DICEMPIRE_BLITZ_MS=process.env.DICEMPIRE_BLITZ_MS||"120";
const path=require("path"),fs=require("fs");
const {chromium}=require("playwright");
const server=require("../server.js");

/* CSS boyutu x ölçek = mağazanın istediği piksel */
const SIZES={
  "iphone-6.9":{width:440,height:956,scale:3},     // 1320x2868, App Store zorunlu
  "ipad-13":{width:1032,height:1376,scale:2},      // 2064x2752, App Store (iPad destekleniyor)
  "play-phone":{width:360,height:640,scale:3}      // 1080x1920, Google Play
};
const PEOPLE={tr:["Ayşe","Mehmet"],en:["Emma","Liam"]};
const OUT=path.join(__dirname,"..","store","screenshots");

async function shoot(browser,port,lang,size,dir){
  const v=SIZES[size];
  const opts={viewport:{width:v.width,height:v.height},deviceScaleFactor:v.scale,isMobile:size!=="ipad-13",
    hasTouch:true,locale:lang==="tr"?"tr-TR":"en-US"};
  const host=await browser.newContext(opts),guest=await browser.newContext(opts);
  const p=await host.newPage(),g=await guest.newPage();
  const url=`http://localhost:${port}/`;
  const snap=async(page,name)=>{await page.waitForTimeout(400);await page.screenshot({path:path.join(dir,name),type:"jpeg",quality:90});};

  await p.goto(url);await p.fill("#nameIn",PEOPLE[lang][0]);
  await snap(p,"1-menu.jpg");

  await p.click("#createBtn");await p.waitForSelector("#lobby:not(.hide)");
  const code=(await p.textContent("#roomCode")).trim();
  await g.goto(url);await g.fill("#nameIn",PEOPLE[lang][1]);await g.fill("#codeIn",code);await g.click("#joinBtn");
  await p.waitForFunction(()=>room&&room.players.length===2);
  await p.click("#botBtn");await p.waitForFunction(()=>room&&room.players.length===3);
  await snap(p,"2-lobby.jpg");

  await p.click("#startBtn");await p.waitForSelector("#game:not(.hide)");
  // insanlar iki tur takviyeyi şehrine koyup geçer, botlar haritayı renklendirir
  const pass=async page=>{
    await page.waitForFunction(()=>S&&S.winner===null&&S.cur===room.players.find(x=>x.id===me).seat&&S.phase==="reinforce",null,{timeout:60000});
    const {pool,city}=await page.evaluate(()=>{const s=room.players.find(x=>x.id===me).seat;
      return {pool:S.pool,city:S.tiles.filter(t=>t.owner===s).sort((a,b)=>b.troops-a.troops)[0].id};});
    for(let i=0;i<pool;i++){await page.click(`.hex[data-id="${city}"]`);await page.waitForTimeout(40);}
    await page.click("#nextBtn");await page.waitForTimeout(150);await page.click("#nextBtn");
  };
  for(let r=0;r<2;r++){await pass(p);await pass(g);}
  // üçüncü turda ev sahibi en güçlü alanından en zayıf komşusuna saldırır, zarlar ekranda
  await p.waitForFunction(()=>S&&S.cur===room.players.find(x=>x.id===me).seat&&S.phase==="reinforce",null,{timeout:60000});
  const plan=await p.evaluate(()=>{
    const s=room.players.find(x=>x.id===me).seat;
    let best=null;
    for(const a of S.tiles.filter(t=>t.owner===s))for(const n of a.nb.map(i=>S.tiles[i]).filter(t=>t.owner!==s))
      if(!best||n.troops-a.troops<best.d)best={a:a.id,t:n.id,d:n.troops-a.troops};
    return {...best,pool:S.pool};
  });
  for(let i=0;i<plan.pool;i++){await p.click(`.hex[data-id="${plan.a}"]`);await p.waitForTimeout(40);}
  await p.click(`.hex[data-id="${plan.a}"]`);await p.click(`.hex[data-id="${plan.t}"]`);
  await p.click("#rollBtn");await p.waitForTimeout(1500);
  await snap(p,"3-battle.jpg");
  await host.close();await guest.close();
}

(async()=>{
  const port=await server.start(0);
  const browser=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});
  try{
    for(const lang of ["tr","en"])for(const size of Object.keys(SIZES)){
      const dir=path.join(OUT,lang,size);fs.mkdirSync(dir,{recursive:true});
      await shoot(browser,port,lang,size,dir);
      console.log(`${lang} ${size} tamam`);
    }
  }finally{await browser.close();await server.stop();}
})().catch(e=>{console.error(e);process.exit(1);});
