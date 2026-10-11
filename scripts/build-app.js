"use strict";
/* Mağaza uygulamasının web dosyalarını hazırlar: public/ klasörünü www/ altına kopyalar ve
   config.js'i oyunun sunucusunun adresiyle yazar. Uygulama oyunun sayfasını telefondan açar,
   yalnız oyun bağlantısı (WebSocket) sunucuya gider.
   Kullanım: DICEMPIRE_SERVER=https://sunucu.adresi npm run build:app */
const fs=require("fs"),path=require("path");

const server=(process.env.DICEMPIRE_SERVER||"").replace(/\/+$/,"");
if(!/^https:\/\/[^/]+$/.test(server)){
  console.error("DICEMPIRE_SERVER, oyunun sunucusunun https adresi olmalı (sonunda / ve yol olmadan),\n"+
    "örneğin: DICEMPIRE_SERVER=https://dicempire.onrender.com npm run build:app");
  process.exit(1);
}
const root=path.join(__dirname,"..");
const src=path.join(root,"public"),out=path.join(root,"www");
fs.rmSync(out,{recursive:true,force:true});
fs.cpSync(src,out,{recursive:true});
fs.writeFileSync(path.join(out,"config.js"),
  `/* scripts/build-app.js tarafından yazıldı, elle değiştirme */\nwindow.DICEMPIRE=${JSON.stringify({server})};\n`);
console.log(`www/ hazır, sunucu: ${server}`);
