import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyAZ7M7fVpsgDxAIkAL9XdkPAv8E5KVSVT0",
    authDomain: "yazlikdcgg.firebaseapp.com",
    projectId: "yazlikdcgg",
    storageBucket: "yazlikdcgg.firebasestorage.app",
    messagingSenderId: "972998484679",
    appId: "1:972998484679:web:7faf7d54ca9525ab8654e2",
    measurementId: "G-VMJ0YTFYQ7"
});
const db = getFirestore(app);

const Sistem = { veriler: [], aktifSayfa: "sunucu", aktifSayfaAdi: "📊 Sunucu Özeti", aktifSezon: "Tüm Zamanlar" };

window.GuncelDurum = {
    sezon: "Tüm Zamanlar",
    veriyiFiltrele: function (tumVeri) {
        // 🛑 REMAKE ZIRHI: 10 Dakikadan (600 saniye) kısa süren maçları anında buharlaştır!
        let filtrelenmis = tumVeri.filter(m => !m.sure_saniye || m.sure_saniye >= 600);

        // 1. Önce Sezon Filtresi
        if (this.sezon !== "Tüm Zamanlar" && this.sezon) {
            let arananNo = this.sezon.replace(/\D/g, "");
            filtrelenmis = filtrelenmis.filter(mac => {
                if (mac.sezon === undefined || mac.sezon === null) return false;
                let macSezonStr = String(mac.sezon).toUpperCase();
                return macSezonStr === arananNo || macSezonStr.includes(arananNo);
            });
        }

        // 🛡️ GÜNCEL FLEX EŞİK FİLTRESİ (3, 4 ve 5 kişi geçerli)
        let macGruplari = {};
        filtrelenmis.forEach(m => {
            if (!macGruplari[m.mac_id]) macGruplari[m.mac_id] = [];
            macGruplari[m.mac_id].push(m);
        });

        // 3, 4 veya 5 kişi olan maç ID'lerini tut
        let gecerliMacIds = Object.keys(macGruplari).filter(id => {
            let oyuncuSayisi = macGruplari[id].length;
            return oyuncuSayisi >= 3; // 3, 4 veya 5 kişi dahil, 1 ve 2 elendi
        });

        return filtrelenmis.filter(m => gecerliMacIds.includes(m.mac_id));
    }
};

const GrafikHafizasi = {};

// 🎯 ÇÖZÜMÜN ANAHTARI: YAMA SÜRÜMÜNÜ 16.12.1'E KİLİTLEDİK
const RiotCDN = {
    surum: "16.12.1",
    sampiyonResim: function (sampiyonAdi) {
        let temizAd = sampiyonAdi.replace(/\s+/g, '').replace(/'/g, '').replace(/\./g, '');
        if (temizAd === "Wukong") temizAd = "MonkeyKing";
        return `https://ddragon.leagueoflegends.com/cdn/${this.surum}/img/champion/${temizAd}.png`;
    },
    esyaResim: function (esyaId) {
        if (!esyaId || esyaId === 0) return "";
        return `https://ddragon.leagueoflegends.com/cdn/${this.surum}/img/item/${esyaId}.png`;
    },
    profilResim: function (ikonId) {
        return `https://ddragon.leagueoflegends.com/cdn/${this.surum}/img/profileicon/${ikonId || 1}.png`;
    }
};

const kayitliImlec = localStorage.getItem("imlecTercihi") || "imlec-hextech";
document.body.className = kayitliImlec;
document.documentElement.className = kayitliImlec;

/* ==============================================================================
   🛠️ V7.0.0 SABİTLER VE ÇEVİRİ MOTORU
============================================================================== */
const TUM_EKIP_ISIMLERI = ["Anıl Abi", "Can", "Ercan", "Evren Abi", "Furkan", "Hüseyin", "Kaan", "Nurettin", "Samet Abi", "Samet Yaldız Abi", "Selim Abi", "Sezer", "Talha Abi", "Taner", "Umut Abi", "İlhan Abi", "Şafak"];

const guncelRiotID = {
    "Kaan": "DarkLegend97", "Umut Abi": "TuMu", "Taner": "YazlıkDCFlex", "Selim Abi": "ShenerShen",
    "İlhan Abi": "Croupier", "Anıl Abi": "ALEMDAROGLU", "Şafak": "s2s", "Ercan": "MrOsleon",
    "Sezer": "the Kosm", "Can": "YEAHRUMONBASHI", "Samet Abi": "MidFather", "Talha Abi": "Tai sins",
    "Hüseyin": "Niyesuh v2", "Evren Abi": "FREAKAZOlD", "Samet Yaldız Abi": "oOoSMToOo",
    "Furkan": "LuJji", "Nurettin": "Urichanikaik"
};

const sampiyonIsimCeviri = {
    "MonkeyKing": "Wukong", "MissFortune": "Miss Fortune", "JarvanIV": "Jarvan IV", "XinZhao": "Xin Zhao",
    "TahmKench": "Tahm Kench", "KogMaw": "Kog'Maw", "RekSai": "Rek'Sai", "DrMundo": "Dr. Mundo",
    "TwistedFate": "Twisted Fate", "AurelionSol": "Aurelion Sol", "Belveth": "Bel'Veth", "Renata": "Renata Glasc",
    "Nunu": "Nunu & Willump", "MasterYi": "Master Yi", "LeeSin": "Lee Sin", "KSAnte": "K'Sante",
    "Chogath": "Cho'Gath", "Khazix": "Kha'Zix", "Velkoz": "Vel'Koz", "Kaisa": "Kai'Sa", "Leblanc": "LeBlanc"
};

const rolCeviri = { "TOP": "TOP", "JUNGLE": "JNG", "MIDDLE": "MID", "BOTTOM": "BOT", "UTILITY": "SUP", "BELIRSIZ": "Belirsiz" };

// 🛡️ CSS POP-UP BUG'INI KÖKTEN ÇÖZEN ZIRH
if (!document.getElementById("mutlak-popup-zirhi")) {
    let style = document.createElement("style");
    style.id = "mutlak-popup-zirhi";
    style.innerHTML = `
        /* Kartın üstüne gelince tüm pop-up'ların açılmasını engeller */
        .esya-kart:hover .esya-detay-popup { display: none !important; }
        /* Sadece ikonun üstüne gelince kendi pop-up'ı açılır */
        .esya-kapsayici .esya-detay-popup { display: none !important; visibility: hidden; opacity: 0; transition: opacity 0.2s; position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%); background: rgba(10,15,22,0.95); border: 1px solid var(--hextech-gold); padding: 10px; border-radius: 8px; width: max-content; max-width: 280px; z-index: 99999; color: #fff; box-shadow: 0 0 15px rgba(0,0,0,0.8); pointer-events: none; text-align: left; }
        .esya-kapsayici:hover .esya-detay-popup { display: block !important; visibility: visible; opacity: 1; }
    `;
    document.head.appendChild(style);
}

// 🚀 V7.0.0 AKILLI VE TAŞMAYAN GLOBAL POP-UP MOTORU
if (!document.getElementById("yazlik-global-tooltip")) {
    let tt = document.createElement("div");
    tt.id = "yazlik-global-tooltip";
    tt.style.cssText = "position:absolute; z-index:999999; display:none; background:rgba(9,20,40,0.95); border:1px solid var(--hextech-gold); border-radius:8px; padding:15px; box-shadow:0 10px 30px rgba(0,0,0,0.8); color:#f0e6d2; font-size:0.85em; width:max-content; max-width:320px; pointer-events:none; transition: opacity 0.1s ease;";
    document.body.appendChild(tt);
}

window.gosterHarikaPopup = function (e, baslik, icerik) {
    let tt = document.getElementById("yazlik-global-tooltip");
    tt.innerHTML = `<div style="color:var(--hextech-gold); font-weight:bold; font-size:1.1em; margin-bottom:8px; border-bottom:1px solid rgba(200,170,110,0.3); padding-bottom:5px;">${baslik}</div><div style="color:#fff; line-height:1.5;">${icerik}</div>`;
    tt.style.display = "block";
    tt.style.opacity = "1";
    window.oynatHarikaPopup(e);
};

window.oynatHarikaPopup = function (e) {
    let tt = document.getElementById("yazlik-global-tooltip");
    if (tt.style.display === "block") {
        let x = e.pageX + 15; let y = e.pageY + 15;
        let rect = tt.getBoundingClientRect();
        // Ekrana sığdırma algoritması (Taşmaları Engeller)
        if (x + rect.width > window.innerWidth + window.scrollX) x = e.pageX - rect.width - 15;
        if (y + rect.height > window.innerHeight + window.scrollY) y = e.pageY - rect.height - 15;
        tt.style.left = x + "px"; tt.style.top = y + "px";
    }
};

window.gizleHarikaPopup = function () {
    let tt = document.getElementById("yazlik-global-tooltip");
    if (tt) { tt.style.opacity = "0"; setTimeout(() => { if (tt.style.opacity === "0") tt.style.display = "none"; }, 100); }
};

/* ==============================================================================
   ⚙️ YARDIMCI ARAÇLAR (Hatasız Büyü Motoru ve Sınıf Tetikleyicileri)
============================================================================== */
const Yardimci = {
    formatSampiyon: (isim) => sampiyonIsimCeviri[isim] || isim,

    // 1. ANA KİMLİK MOTORU (Herkesi Kaan, Ercan gibi saf ismine çevirir)
    analizIsimGetir: (oyuncu, riot_id) => {
        const kimlikHaritasi = {
            "Kaan": ["DarkLegend97", "Literation"],
            "Taner": ["YazlıkDCFlex", "Schwarzsx"],
            "Ercan": ["MrOsleon", "Lilliana"],
            "Şafak": ["s2s", "vurucu"],
            "Sezer": ["the Kosm", "obliviscaris"]
        };
        for (let anaIsim in kimlikHaritasi) {
            if (anaIsim === oyuncu || kimlikHaritasi[anaIsim].includes(oyuncu) || (riot_id && kimlikHaritasi[anaIsim].includes(riot_id))) {
                return anaIsim;
            }
        }
        return oyuncu;
    },

    // 2. ESKİ KODLARIN ÇÖKMEMESİ İÇİN KÖPRÜLER (Hata veren yerler buraya düşecek)
    kimlikCozumle: (oyuncu, riot_id) => Yardimci.analizIsimGetir(oyuncu, riot_id),

    // 3. EKRAN İSMİ MOTORU (Sahnede ne görünecek?)
    ekranIsmiGetir: (oyuncu, riot_id, macIciMi = false) => {
        let anaIsim = Yardimci.analizIsimGetir(oyuncu, riot_id);
        // Anayasadan (guncelRiotID) oyun içi ismi çekiyoruz
        let oyunIci = typeof guncelRiotID !== "undefined" ? (guncelRiotID[anaIsim] || anaIsim) : anaIsim;

        // Eğer maç geçmişi kartıysa o an oynanan hesabı göster, değilse "DarkLegend97 - Kaan" formatını bas
        if (macIciMi) return riot_id || oyunIci;
        return (oyunIci !== anaIsim) ? `${oyunIci} - ${anaIsim}` : anaIsim;
    },

    // 4. ESKİ ARAYÜZ ÇAĞRILARI İÇİN YÖNLENDİRMELER
    oyunIciIsim: (oyuncu, riot_id) => Yardimci.ekranIsmiGetir(oyuncu, riot_id, false),
    macIciIsim: (oyuncu, riot_id) => Yardimci.ekranIsmiGetir(oyuncu, riot_id, true),
    resimUrlGetir: (isim, yama) => {
        const urlDuzeltme = { "FiddleSticks": "Fiddlesticks", "MonkeyKing": "MonkeyKing" };
        return `https://ddragon.leagueoflegends.com/cdn/${yama}/img/champion/${urlDuzeltme[isim] || isim}.png`;
    },
    ikonUrlGetir: (iconId, yama) => `https://ddragon.leagueoflegends.com/cdn/${yama}/img/profileicon/${iconId || 29}.png`,
    sureFormatla: (saniye) => {
        if (!saniye) return "--:--";
        let dk = Math.floor(saniye / 60); let sn = saniye % 60;
        return `${dk}:${sn.toString().padStart(2, '0')}`;
    },
    // 🎯 EVRENSEL PARTNER DEDEKTÖRÜ (Tüm maç kartlarında çalışır)
    partnerBul: (grup, oyuncuRol) => {
        if (oyuncuRol !== "BOTTOM" && oyuncuRol !== "UTILITY") return "";
        let arananRol = oyuncuRol === "BOTTOM" ? "UTILITY" : "BOTTOM";
        let partnerObj = grup.find(p => p.pozisyon === arananRol);

        if (!partnerObj) return "";

        let pIsim = partnerObj.oyuncu;
        let isKnown = typeof TUM_EKIP_ISIMLERI !== "undefined" && TUM_EKIP_ISIMLERI.includes(pIsim);

        let oIci = typeof guncelRiotID !== "undefined" ? (guncelRiotID[pIsim] || pIsim) : pIsim;
        // Eğer yabancıysa, adını doğrudan Riot API'nin çektiği riot_id'den al!
        if (!isKnown && partnerObj.riot_id) {
            oIci = partnerObj.riot_id.split(',')[0].trim();
        }

        let gorselIsim = isKnown ? oIci : `${oIci} <span style="font-size:0.85em; color:#8b949e; font-weight:normal;">(Yabancı)</span>`;
        return `<div style="font-size: 0.85em; color:#d2a8ff; margin-top:3px; white-space: nowrap;">💛 Partner: <b style="color:#fff;">${gorselIsim}</b></div>`;
    },
    formatK: (val) => {
        if (val == null) return 0;
        if (val >= 1000000) return (val / 1000000).toFixed(2) + 'm';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
        return val;
    },
    tarihFormatla: (ms) => {
        if (!ms) return "Tarih Yok";
        let d = new Date(ms);
        return d.toLocaleDateString("tr-TR", { year: 'numeric', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    },
    // 🎯 CLASS BAZLI HEXTECH GÖRSELLEŞTİRİCİLER (Orijinal Format Tutar)
    cizEsya: (itemId, stil) => {
        if (!itemId || itemId <= 0) return `<div style="${stil}; background:rgba(0,0,0,0.5); border:1px dashed rgba(200,170,110,0.3);"></div>`;
        return `<img src="${RiotCDN.esyaResim(itemId)}" style="${stil}" class="tetikleyici-esya" data-item-id="${itemId}">`;
    },
    cizRun: (runId, stil) => {
        if (!runId) return `<div style="${stil}; background:transparent;"></div>`;
        let rune = window.runeIdMap && window.runeIdMap[runId];
        let img = rune ? `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}` : 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/RunesIcon.png';
        return `<img src="${img}" style="${stil}" class="tetikleyici-run" data-run-id="${runId}">`;
    },
    cizBuyu: function (buyuId, stil = "") {
        // 🔮 SİHİRDAR BÜYÜLERİ KÜTÜPHANESİ VE SAYISAL METRİKLERİ
        const buyuler = {
            "4": { ad: "Sıçra", tanim: "İmlecin doğrultusunda şampiyonunu 400 menzil ileri ışınlar.<br><b style='color:#ffd700;'>Bekleme Süresi:</b> 300 Saniye.", ikon: "SummonerFlash" },
            "11": { ad: "Çarp", tanim: "Destansı/büyük canavarlara veya rakip minyonlara seviyeye bağlı olarak 600 - 1200 gerçek hasar verir.<br><b style='color:#ffd700;'>Bekleme Süresi:</b> 15 Saniye (Şarj).", ikon: "SummonerSmite" },
            "12": { ad: "Işınlan", tanim: "4 saniye odaklandıktan sonra dost bir kuleye (10. dakikadan sonra dost totem ve minyonlara da) ışınlar.<br><b style='color:#ffd700;'>Bekleme Süresi:</b> 360 Saniye.", ikon: "SummonerTeleport" },
            "14": { ad: "Tutuştur", tanim: "Rakip şampiyonu 5 saniyeliğine tutuşturarak seviyeye bağlı 70 - 410 gerçek hasar verir ve %40 Ağır Yara (iyileşme azaltması) açar.<br><b style='color:#ffd700;'>Bekleme Süresi:</b> 180 Saniye.", ikon: "SummonerDot" },
            "7": { ad: "Şifa", tanim: "Senin ve hedeflenen en yaralı dost şampiyonun canını seviyeye bağlı 90 - 345 yeniler. Ayrıca 1 saniyeliğine %30 İlave Hareket Hızı verir.<br><b style='color:#ffd700;'>Bekleme Süresi:</b> 240 Saniye.", ikon: "SummonerHeal" },
            "3": { ad: "Bitkinlik", tanim: "Rakip şampiyonu 3 saniyeliğine bitkin düşürerek Hareket Hızını %30 yavaşlatır ve verdiği hasarı %35 azaltır.<br><b style='color:#ffd700;'>Bekleme Süresi:</b> 210 Saniye.", ikon: "SummonerExhaust" },
            "21": { ad: "Bariyer", tanim: "Şampiyonunu 2.5 saniyeliğine, seviyeye bağlı olarak 120 - 480 hasarı emen bir kalkanla kaplar.<br><b style='color:#ffd700;'>Bekleme Süresi:</b> 180 Saniye.", ikon: "SummonerBarrier" },
            "1": { ad: "Arındır", tanim: "Şampiyonunu etkileyen tüm kitle kontrol etkilerini (Bastırma ve Havaya Savurma hariç) kaldırır. 3 saniyeliğine yeni etkilerin süresini %65 azaltır.<br><b style='color:#ffd700;'>Bekleme Süresi:</b> 210 Saniye.", ikon: "SummonerBoost" },
            "6": { ad: "Hayalet", tanim: "10 saniyeliğine birimlerin içinden geçmeni sağlar ve seviyeye bağlı %24 - %48 arası ilave Hareket Hızı kazandırır.<br><b style='color:#ffd700;'>Bekleme Süresi:</b> 210 Saniye.", ikon: "SummonerHaste" },
            "32": { ad: "Kartopu", tanim: "Düşmanlara doğru düz bir hatta bir kartopu fırlatır (Gerçek hasar verir). İsabet ederse 3 saniye içinde rakibe atılabilirsin.<br><b style='color:#ffd700;'>Bekleme Süresi:</b> 48 Saniye.", ikon: "SummonerSnowball" }
        };

        let b = buyuler[String(buyuId)];

        // Veritabanından büyü gelmezse ekranın çökmesini engelleyen Zırh
        if (!b) return `<div style="${stil}; background: rgba(0,0,0,0.6); border: 1px dashed rgba(255,255,255,0.2);"></div>`;

        let yamaSurumu = typeof RiotCDN !== 'undefined' ? RiotCDN.surum : '16.12.1';

        // 🎯 KESİLMEYEN POP-UP MOTORU: getBoundingClientRect ve fixed position kullanılarak overflow tuzağı aşıldı.
        return `
        <div class="buyu-kapsayici" style="display: inline-block; position: relative; cursor: help;" 
             onmouseenter="let r = this.getBoundingClientRect(); let t = this.querySelector('.buyu-tooltip'); t.style.display='block'; t.style.position='fixed'; t.style.left = (r.left + r.width/2) + 'px'; t.style.top = (r.top - 10) + 'px'; t.style.transform='translate(-50%, -100%)';" 
             onmouseleave="this.querySelector('.buyu-tooltip').style.display='none'">
            
            <img src="https://ddragon.leagueoflegends.com/cdn/${yamaSurumu}/img/spell/${b.ikon}.png" style="${stil}; object-fit: cover;">
            
            <div class="buyu-tooltip" style="display: none; background: rgba(9, 20, 40, 0.98); border: 1px solid var(--hextech-blue); padding: 12px; border-radius: 6px; width: 260px; z-index: 999999; box-shadow: 0 5px 20px rgba(0,0,0,0.9); pointer-events: none; text-align: left;">
                <div style="color: #ffffff; font-weight: bold; font-size: 1.1em; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; margin-bottom: 6px; white-space: nowrap;">✨ ${b.ad}</div>
                <div style="color: #aee2ff; font-size: 0.9em; line-height: 1.5; white-space: normal;">${b.tanim}</div>
            </div>
            
        </div>`;
    },
    cizLejant: (baslik, aciklama, stil) => {
        return `<div style="${stil}" class="tetikleyici-lejant" data-baslik="${baslik.replace(/<[^>]*>?/gm, '')}" data-aciklama="${aciklama}">${baslik}</div>`;
    }
};

const IstatistikMotoru = {
    checkSabotaj: function (m) {
        if (m.olum <= 10) return false;
        let t_skor = m.takim_skoru || 1; let t_olum = m.takim_olumu || 1;
        let skorKatkisi = (m.oldurme + m.asist) / t_skor;
        let fedakarSavasci = skorKatkisi >= 0.50;
        let agirBesleme = (skorKatkisi < 0.50);
        let faydasizSifirSkor = (m.oldurme === 0 && (m.asist / t_skor) < 0.40);
        let kronikBesleme = fedakarSavasci ? (m.olum >= 17) : (m.olum >= 15);
        let takimYuku = (m.olum / t_olum > ((m.rol === "UTILITY") ? 0.333 : 0.25)) && !fedakarSavasci;
        return agirBesleme || faydasizSifirSkor || kronikBesleme || takimYuku;
    },
    davranisHesapla: function (k, d, a, rol, vizyon, kontrol, cs_dk, sabotajOrani = 0) {
        let kdaSaf = d === 0 ? (k + a) : ((k + a) / d);
        if (sabotajOrani > 0.12 && d > 7.0) return "🤡 Kaosun Efendisi (Sabotajcı)";
        if (d > (k + (a / 3))) return "⚠️ Pervasız (Kaosun Kölesi)";
        if (d >= 8 && kdaSaf < 1.0) return "📉 Sabotaj Uzmanı (Ağır Yük)";
        if (d >= 10) return "🤡 Tam Bir Felaket";
        if (rol === "UTILITY") {
            if (cs_dk > 2.0) return "💸 Vergi Memuru (Minyon Çalan)";
            if (vizyon < 10 && kontrol < 1) return "🤡 Vizyonsuz (Karanlıkta Kalan)";
            if (kdaSaf >= 4.0 && a >= 15) return "👼 Kusursuz Melek";
            if (d >= 8 && a >= 15) return "🛡️ Cefakar Koruyucu";
            return "🤝 Standart Destek";
        }
        if (rol === "MIDDLE" || rol === "BOTTOM") {
            if (d >= 9 && kdaSaf < 1.5) return "☠️ Kara Delik (Ağır Yük)";
            if (cs_dk >= 8.0 && kdaSaf >= 3.0) return "💰 Kusursuz Makine";
            if (k >= 12 && kdaSaf >= 4.0) return "🌟 Hiper Taşıyıcı";
            if (d >= 8 && k < d) return "⚠️ Pervasız (Yasuo Sendromu)";
            return "⚖️ Dengeli Taşıyıcı";
        }
        if (rol === "JUNGLE") {
            if (d >= 8 && kdaSaf < 1.5) return "⚠️ Ormanda Kayıp";
            if (cs_dk >= 7.0 && (k + a) < 5) return "💤 AFK Çiftçi (Sadece Orman)";
            if (k >= 8 && d <= 4) return "🐺 Kusursuz Avcı";
            return "🌲 Görev Adamı";
        }
        if (rol === "TOP") {
            if (d >= 8 && k < 4) return "⚠️ Üst Koridor Kurbanı";
            if (cs_dk >= 7.5 && (k + a) <= 6) return "🏰 Saf Ayrık İttirici";
            if (kdaSaf >= 3.0 && d <= 3) return "🛡️ Sarsılmaz Titanyum";
            return "🗿 Kaya Gibi (Standart)";
        }
        return "⚖️ Standart Oynanış";
    },
    rozetUret: function (m) {
        let e = [];
        const createBadge = (text, tooltip, color, borderColor, bgColor) => `
            <div class="tetikleyici-lejant" data-baslik="${text.replace(/<[^>]*>?/gm, '')}" data-aciklama="${tooltip}" style="background:${bgColor}; border:1px solid ${borderColor}; color:${color}; padding:4px 10px; border-radius:6px; font-size:0.75em; font-weight:bold; display:inline-block; margin: 1px;">${text}</div>`;

        if (m.penta && m.penta > 0) e.push(createBadge("🔥 BEŞTE BEŞ", "Maç içinde bir defada 5 kişiyi katletmek", "#fff", "#ff4b4b", "rgba(255, 75, 75, 0.4)"));
        else if (m.quadra && m.quadra > 0) e.push(createBadge("💥 Dörtte Dört", "Maç içinde bir defada 4 kişiyi katletmek", "#fff", "#ffab00", "rgba(255, 171, 0, 0.4)"));
        else if (m.triple && m.triple > 0) e.push(createBadge("⚡ Üçte Üç", "Maç içinde bir defada 3 kişiyi katletmek", "#fff", "#ffd700", "rgba(255, 215, 0, 0.4)"));
        else if (m.ikide_iki && m.ikide_iki > 0) e.push(createBadge("⚔️ İkide İki", "Maç içinde bir defada 2 kişiyi katletmek", "#fff", "#58a6ff", "rgba(88, 166, 255, 0.4)"));
        if (m.calinan_objektif && m.calinan_objektif > 0) e.push(createBadge("🥷 Objektif Çaldı", "Rakibin başlattığı Baron veya Ejderhayı çalmak", "#fff", "#d2a8ff", "rgba(210, 168, 255, 0.4)"));
        if (m.ilk_kan) e.push(createBadge("🩸 İlk Kan", "Maçtaki ilk katletmeyi almak", "#fff", "#ff69b4", "rgba(255, 105, 180, 0.4)"));
        return e.join(" ");
    },
    etiketUret: function (m) {
        let e = [];
        const createBadge = (text, tooltip, borderColor) => `
            <div class="tetikleyici-lejant" data-baslik="${text.split(' ')[1] || text}" data-aciklama="${tooltip}" style="background:rgba(0,0,0,0.5); border:1px solid ${borderColor}; color:#fff; padding:2px 8px; border-radius:12px; font-size:0.7em; font-weight:bold; white-space:nowrap; display:inline-block; margin: 2px;">${text}</div>`;

        if (m.olum === 0) e.push(createBadge("🌟 Ölümsüz Koridor", "Maçı hiç ölmeden tamamladı", "#3fb950"));
        if (m.hayatta_kalma > 900 && m.olum < 4) e.push(createBadge("🛡️ Hayatta Kalan", "15 dakikadan uzun süre hiç ölmeden hayatta kaldı", "#3fb950"));
        if (m.ilk_kule) e.push(createBadge("🏰 İlk Kule", "Maçtaki ilk kuleyi yıkan oyuncu", "#3fb950"));
        if (m.kule_yikimi >= 2) e.push(createBadge("🔨 Kule Yıkıcı", "Maçta en az 2 kule yıktı", "#3fb950"));
        if (m.hasar_sampiyon > 30000) e.push(createBadge("💥 Ağır Hasar", "Şampiyonlara 30.000'den fazla hasar vurdu", "#3fb950"));
        if ((m.iyilesme_takim || 0) + (m.kalkan_takim || 0) > 4000) e.push(createBadge("💚 Şifa Makinesi", "Takımına 4.000'den fazla şifa sağladı", "#3fb950"));
        if (m.cc_suresi > 35) e.push(createBadge("❄️ CC Canavarı", "Rakiplere yüksek kitle kontrol uyguladı", "#3fb950"));
        if (m.hasar_sogurulan > 35000) e.push(createBadge("🧱 Çelik Duvar", "Yüksek hasar tankladı", "#3fb950"));

        let kdaSaf = m.olum === 0 ? (m.oldurme + m.asist) : ((m.oldurme + m.asist) / m.olum);
        if (kdaSaf >= 5.0 && m.olum > 0) e.push(createBadge("📈 Yüksek KDA", "5.0 ve üzeri KDA oranına ulaştı", "#3fb950"));
        if (m.ikide_iki >= 2) e.push(createBadge("⚔️ Seri Katil", "En az 2 kere İkide İki yaptı", "#3fb950"));
        if (this.checkSabotaj(m)) e.push(createBadge("🤡 Ağır Sabotaj", "Ağır besleyerek takımı zor durumda bıraktı", "#f85149"));
        else if (m.olum >= 10) e.push(createBadge("📉 Kırılgan Halka", "Maçta çok fazla öldü", "#f85149"));
        return e.join(" ");
    }
};
/* ==============================================================================
   📦 MAÇ DETAY (KUTU AÇMA) MOTORU
============================================================================== */
window.kutuAc = function (panelId, event) {
    // Tıklamanın sayfadaki diğer elementleri etkilemesini engelle
    if (event) event.stopPropagation();

    let panel = document.getElementById(panelId);
    if (!panel) return;

    let kartKapsayici = panel.closest('.esya-kart');

    if (panel.style.display === "none" || panel.style.display === "") {
        panel.style.display = "block";
        panel.style.animation = "fadein 0.3s ease";
        if (kartKapsayici) kartKapsayici.style.boxShadow = "0 0 20px rgba(200, 170, 110, 0.2)";
    } else {
        panel.style.display = "none";
        if (kartKapsayici) kartKapsayici.style.boxShadow = "none";
    }
};
function tR(str) { return str.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase(); }
// 🎯 KAAN'IN ULTRA REGEX TAKAS KALKANI (Sayıların Soluna İkon Zırhı Eklendi)
function replaceWithLeftIcon(text, key, icon, color, lookahead = "") {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Sayıyı, HTML kapanış etiketini ve stat ismini ayrı ayrı yakalıyoruz
    const regex = new RegExp(`(^|\\s|>|\\()\\s*([+0-9%.-]+)?(\\s*<\\/[a-zA-Z]+>\\s*|\\s+)?(${escapedKey})${lookahead}(?=\\s|<|\\)|[.,]|$)`, 'gi');
    return text.replace(regex, (match, prefix, num, sep, statName) => {
        if (num) {
            // Eğer sayı varsa (Örn: 50 veya %40): İkon -> Sayı -> İsim dizilimi
            return `${prefix}<span style="color:${color}; font-weight:bold;">${icon} ${num}</span>${sep || " "}<span style="color:${color}; font-weight:bold;">${statName}</span>`;
        } else {
            // Sayı yoksa (Sadece metin geçiyorsa): İkon -> İsim
            return `${prefix}<span style="color:${color}; font-weight:bold;">${icon} ${statName}</span>`;
        }
    });
}

const Menuler = [
    { id: "sunucu", ad: "📊 Sunucu Özeti" }, { id: "enyeni", ad: "⏱️ En Yeni Maçlar" },
    { id: "liderlik_grup", ad: "⭐ Liderlik Tabloları", alt: [{ id: "lid_kill", ad: "⚔️ Kill Liderleri" }, { id: "lid_utanc", ad: "☠️ Utanç Listesi" }, { id: "lid_asist", ad: "🤝 Asist Kralları" }, { id: "lid_gorus", ad: "👁️ Görüş Liderleri" }, { id: "lid_kda", ad: "👑 KDA Şampiyonları" }] },
    { id: "bireysel_grup", ad: "👤 Bireysel Profil", alt: ["Anıl Abi", "Can", "Ercan", "Evren Abi", "Furkan", "Hüseyin", "Kaan", "Nurettin", "Samet Abi", "Samet Yaldız Abi", "Selim Abi", "Sezer", "Talha Abi", "Taner", "Umut Abi", "İlhan Abi", "Şafak"].map(isim => ({ id: "prof_" + isim.replace(/\s/g, ""), ad: isim })) },
    { id: "sinerji", ad: "💪 Takım Sinerjisi" }, { id: "uzman", ad: "🏆 Şampiyon Uzmanları" },
    { id: "esya", ad: "⚔️ Eşya Bilgisi" }, { id: "run", ad: "🔮 Rün Dizilimi" },
    { id: "komp", ad: "🛡️ Şampiyonlar & Kompozisyonlar" }, { id: "harita", ad: "🗺️ Harita Rotasyonları" },
    { id: "clash", ad: "🏅 Clash Arenası" },
    { id: "yarat", ad: "🖖 Kendi 5'lini Yarat" }, { id: "video", ad: "🎬 Videolar & Klipler" },
    { id: "surum", ad: "📜 Sürüm Geçmişi" }
];

const Router = {
    git: function (sayfaId, sayfaAdi) {
        if (sayfaId === "liderlik_grup" || sayfaId === "bireysel_grup") { this.akordeonGecis(sayfaId); return; }
        Sistem.aktifSayfa = sayfaId; Sistem.aktifSayfaAdi = sayfaAdi; this.menuyuGuncelle();
        const icerikAlani = document.getElementById("app-content");
        if (!icerikAlani) return;

        if (sayfaId === "sunucu") icerikAlani.innerHTML = Sayfalar.cizSunucuOzeti(sayfaAdi);
        else if (sayfaId === "enyeni") icerikAlani.innerHTML = Sayfalar.cizEnYeniMaclar(sayfaAdi);
        else if (sayfaId.startsWith("lid_")) icerikAlani.innerHTML = Sayfalar.cizLiderlik(sayfaId, sayfaAdi);
        else if (sayfaId.startsWith("prof_")) icerikAlani.innerHTML = Sayfalar.cizProfilDetay(sayfaAdi);
        else if (sayfaId === "uzman") icerikAlani.innerHTML = Sayfalar.cizUzmanlik();
        else if (sayfaId === "sinerji") icerikAlani.innerHTML = Sayfalar.cizSinerji();
        else if (sayfaId === "esya") {
            icerikAlani.innerHTML = Sayfalar.cizEsyaBilgisi();
            if (typeof window.renderEsyaKutuphanesi === "function") window.renderEsyaKutuphanesi();
            if (typeof window.simGuncelle === "function") window.simGuncelle();
        }
        else if (sayfaId === "run") icerikAlani.innerHTML = Sayfalar.cizRunDizilimi();
        else if (sayfaId === "komp") icerikAlani.innerHTML = Sayfalar.cizKompozisyon();
        else if (sayfaId === "harita") icerikAlani.innerHTML = Sayfalar.cizHarita();
        else if (sayfaId === "clash") icerikAlani.innerHTML = Sayfalar.cizClashArenasi(Sistem.verilerClash);
        else if (sayfaId === "yarat") icerikAlani.innerHTML = Sayfalar.cizYarat();
        else if (sayfaId === "video") icerikAlani.innerHTML = Sayfalar.cizVideolar();
        else if (sayfaId === "surum") icerikAlani.innerHTML = Sayfalar.cizSurumGecmisi();
        else icerikAlani.innerHTML = `<h1>${sayfaAdi}</h1><p>İnşaat devam ediyor...</p>`;
    },
    akordeonGecis: function (grupId) {
        const altMenu = document.getElementById(`altmenu-${grupId}`);
        if (altMenu) { document.querySelectorAll('.alt-menu-kapsayici').forEach(el => { if (el.id !== `altmenu-${grupId}`) el.classList.remove("acik"); }); altMenu.classList.toggle("acik"); }
    },
    menuyuKur: function () {
        const sidebar = document.getElementById("sidebar");
        let menuListesi = document.getElementById("menu-listeler");
        if (!menuListesi) { menuListesi = document.createElement("div"); menuListesi.id = "menu-listeler"; sidebar.appendChild(menuListesi); }
        menuListesi.innerHTML = "";
        Menuler.forEach(menu => {
            const btn = document.createElement("button"); btn.className = "menu-btn"; btn.id = `nav-${menu.id}`; btn.innerText = menu.ad;
            if (menu.alt) {
                btn.onclick = () => this.akordeonGecis(menu.id); menuListesi.appendChild(btn);
                const altKapsayici = document.createElement("div"); altKapsayici.className = "alt-menu-kapsayici"; altKapsayici.id = `altmenu-${menu.id}`;
                menu.alt.forEach(alt => {
                    const altBtn = document.createElement("button"); altBtn.className = "alt-btn"; altBtn.id = `nav-${alt.id}`; altBtn.innerText = alt.ad;
                    altBtn.onclick = (e) => { e.stopPropagation(); this.git(alt.id, alt.ad); }; altKapsayici.appendChild(altBtn);
                });
                menuListesi.appendChild(altKapsayici);
            } else { btn.onclick = () => this.git(menu.id, menu.ad); menuListesi.appendChild(btn); }
        });
    },
    menuyuGuncelle: function () {
        document.querySelectorAll(".menu-btn, .alt-btn").forEach(btn => btn.classList.remove("aktif"));
        const aktifBtn = document.getElementById(`nav-${Sistem.aktifSayfa}`);
        if (aktifBtn) { aktifBtn.classList.add("aktif"); const kaps = aktifBtn.closest('.alt-menu-kapsayici'); if (kaps) kaps.classList.add("acik"); }
    }
};

const Sayfalar = {
    cizSunucuOzeti: function (sayfaAdi) {
        const OYUNCU_RENKLERI = {
            "Evren Abi": "#ff4b4b", "İlhan Abi": "#00b8d9", "Taner": "#ffab00",
            "Furkan": "#36b37e", "Selim Abi": "#6554c0", "Umut Abi": "#ff5630",
            "Can": "#0052cc", "Kaan": "#00875a", "Şafak": "#ff991f",
            "Ercan": "#403294", "Anıl Abi": "#0065ff", "Samet Abi": "#36ab53",
            "Sezer": "#b3bac5", "Hüseyin": "#ff7452", "Samet Yaldız Abi": "#2684ff",
            "Nurettin": "#ffd500", "Talha Abi": "#79f2c0"
        };

        const renkBul = (isim) => {
            if (OYUNCU_RENKLERI[isim]) return OYUNCU_RENKLERI[isim];
            let hash = 0;
            for (let i = 0; i < isim.length; i++) hash = isim.charCodeAt(i) + ((hash << 5) - hash);
            return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
        };

        const roller = {
            "TOP": { ad: "🛡️ TOP", veri: {}, toplam: 0 },
            "JUNGLE": { ad: "🌳 JNG", veri: {}, toplam: 0 },
            "MIDDLE": { ad: "🔮 MID", veri: {}, toplam: 0 },
            "BOTTOM": { ad: "🏹 BOT", veri: {}, toplam: 0 },
            "UTILITY": { ad: "🌿 SUP", veri: {}, toplam: 0 }
        };

        let islenecekVeri = window.GuncelDurum.veriyiFiltrele(Sistem.veriler);

        islenecekVeri.forEach(m => {
            let rol = m.pozisyon;
            let oyuncu = m.oyuncu || "Bilinmiyor";
            if (roller[rol]) {
                roller[rol].veri[oyuncu] = (roller[rol].veri[oyuncu] || 0) + 1;
                roller[rol].toplam++;
            }
        });

        if (islenecekVeri.length === 0) {
            return `<div style="text-align:center; padding: 50px; color: var(--text-main);">
                        <h2>Veri Bulunamadı</h2>
                        <p>Seçili zaman dilimi (${window.GuncelDurum.sezon}) için henüz operasyon kaydı yok.</p>
                    </div>`;
        }

        let html = `<h1 style="color: var(--text-light); border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">${sayfaAdi} <span style="font-size:0.5em; color:var(--hextech-gold);">[${window.GuncelDurum.sezon}]</span></h1>`;
        html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 25px;">`;

        Object.keys(roller).forEach(rolKey => {
            if (roller[rolKey].toplam > 0) {
                let siralama = Object.entries(roller[rolKey].veri).sort((a, b) => b[1] - a[1]);
                let listeHtml = `<div style="margin-top: 20px; display: flex; flex-direction: column; gap: 6px;">`;

                siralama.forEach((kisi) => {
                    let isim = kisi[0];
                    let macSayisi = kisi[1];
                    let renk = renkBul(isim);
                    let yuzde = ((macSayisi / roller[rolKey].toplam) * 100).toFixed(1);

                    // 🎯 OYUN İÇİ İSİM FORMATLAMASI BURADA
                    let oyunIciIsim = typeof guncelRiotID !== "undefined" ? (guncelRiotID[isim] || isim) : isim;
                    let formatliIsim = (oyunIciIsim !== isim) ? `${oyunIciIsim} - ${isim}` : isim;

                    listeHtml += `
                        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 4px; border-left: 4px solid ${renk};">
                            <span style="color: var(--text-light); font-weight: bold; font-size: 0.9em;">${formatliIsim}</span>
                            <span style="color: var(--text-main); font-size: 0.85em;">%${yuzde} <span style="opacity: 0.5;">(${macSayisi} Maç)</span></span>
                        </div>
                    `;
                });
                listeHtml += `</div>`;

                html += `
                <div style="background: rgba(9, 20, 40, 0.7); border: 1px solid var(--border-color); padding: 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); display: flex; flex-direction: column;">
                    <h3 style="text-align: center; color: var(--hextech-gold); margin-top: 0; letter-spacing: 1px;">${roller[rolKey].ad}</h3>
                    <div style="text-align: center; color: var(--text-main); font-size: 0.85em; margin-bottom: 15px;">Toplam ${roller[rolKey].toplam} Maç</div>
                    <div style="position: relative; height: 220px; width: 100%; flex-shrink: 0;">
                        <canvas id="chart-${rolKey}"></canvas>
                    </div>
                    ${listeHtml}
                </div>`;
            }
        });
        html += `</div>`;

        setTimeout(() => {
            Object.keys(roller).forEach(rolKey => {
                if (roller[rolKey].toplam > 0) {
                    if (GrafikHafizasi[rolKey]) GrafikHafizasi[rolKey].destroy();
                    let siralama = Object.entries(roller[rolKey].veri).sort((a, b) => b[1] - a[1]);

                    // 🎯 GRAFİK ETİKETLERİ İÇİN FORMATLAMA
                    let etiketler = siralama.map(x => {
                        let isim = x[0];
                        let oyunIciIsim = typeof guncelRiotID !== "undefined" ? (guncelRiotID[isim] || isim) : isim;
                        return (oyunIciIsim !== isim) ? `${oyunIciIsim} - ${isim}` : isim;
                    });

                    let veriler = siralama.map(x => x[1]);
                    let arkaPlanRenkleri = siralama.map(x => renkBul(x[0])); // Rengi bulurken yine ana ismi kullanıyoruz

                    let ctx = document.getElementById(`chart-${rolKey}`);
                    if (ctx) {
                        GrafikHafizasi[rolKey] = new Chart(ctx, {
                            type: 'pie',
                            data: { labels: etiketler, datasets: [{ data: veriler, backgroundColor: arkaPlanRenkleri, borderWidth: 2, borderColor: '#091428' }] },
                            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (context) { return ` ${context.raw} Maç`; } } } } }
                        });
                    }
                }
            });
        }, 100);

        return html;
    },
    cizEnYeniMaclar: function (sayfaAdi) {
        let islenecekVeri = window.GuncelDurum.veriyiFiltrele(Sistem.veriler);
        if (islenecekVeri.length === 0) return `<h1 style="color: var(--text-light);">${sayfaAdi}</h1><p style="color: var(--text-main);">Seçili sezonda operasyon kaydı bulunamadı.</p>`;

        let maclar = {};
        islenecekVeri.forEach(m => {
            if (!maclar[m.mac_id]) maclar[m.mac_id] = [];
            maclar[m.mac_id].push(m);
        });

        let siraliMacIds = Object.keys(maclar).sort((a, b) => {
            let safA = parseInt(a.replace(/\D/g, '')) || 0;
            let safB = parseInt(b.replace(/\D/g, '')) || 0;
            return safB - safA;
        });
        let sonMaclar = siraliMacIds.slice(0, 10);

        let html = `<h1 style="color: var(--text-light); border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">${sayfaAdi} <span style="font-size:0.5em; color:var(--hextech-gold);">[${window.GuncelDurum.sezon}]</span></h1>`;
        html += `<div style="display: flex; flex-direction: column; gap: 20px; margin-top: 20px;">`;

        sonMaclar.forEach(id => {
            let takim = maclar[id];
            let sonuc = takim[0].sonuc === "Zafer" || takim[0].sonuc === "Galibiyet" ? "ZAFER" : "BOZGUN";
            let sonucRenk = sonuc === "ZAFER" ? "#3fb950" : "#f85149";

            let tK = 0, tD = 0, tA = 0;
            takim.forEach(p => { tK += p.oldurme || 0; tD += p.olum || 0; tA += p.asist || 0; });

            let sureStr = Yardimci.sureFormatla(takim[0].sure_saniye);
            let tarihStr = Yardimci.tarihFormatla(takim[0].tarih_ms);
            let sezonStr = takim[0].sezon || "16";

            html += `
            <div style="background: rgba(9, 20, 40, 0.8); border: 1px solid var(--border-color); border-top: 4px solid ${sonucRenk}; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.6); margin-bottom:20px; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding: 12px 20px; background: rgba(0,0,0,0.4);">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="color: ${sonucRenk}; font-weight: 900; font-size: 1.1em; letter-spacing: 1px;">💥 ${sonuc}</span>
                        <span style="color: #8b949e; font-size: 0.9em; display: flex; align-items: center; gap: 5px;">
                            ⚔️ Takım: <b style="color: #fff;">${tK} / ${tD} / ${tA}</b>
                        </span>
                        <span style="color: #8b949e; font-size: 0.9em;">⏱️ <b style="color: #fff;">${sureStr}</b></span>
                        <span style="color: #8b949e; font-size: 0.9em;">📅 <b style="color: #fff;">${tarihStr}</b></span>
                    </div>
                    <div>
                        <span style="background: rgba(255,255,255,0.1); color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 0.8em; font-weight: bold;">${sezonStr}</span>
                    </div>
                </div>
                <div style="padding: 10px;">
                    ${window.cizTakimKarti(takim, "")}
                </div>
            </div>`;
        });

        return html + `</div>`;
    },
    cizLiderlik: function (tabloTuru, sayfaAdi) {
        let oyuncuIstatistikleri = {};
        let islenecekVeri = window.GuncelDurum.veriyiFiltrele(Sistem.veriler);

        islenecekVeri.forEach(m => {
            // 🎯 OYUNCU ADINI (KAAN, TANER VS.) ANAHTAR OLARAK KULLANIYORUZ
            let o = m.oyuncu || "Bilinmiyor";

            if (!oyuncuIstatistikleri[o]) {
                oyuncuIstatistikleri[o] = {
                    mac: 0,
                    deger: 0,
                    k: 0,
                    d: 0,
                    a: 0,
                    profil: m.profil_ikonu || 29,
                    // 🎯 Burası kritik: Riot ID'yi listeden (ana isimden) çekmeye zorluyoruz
                    altBaslik: guncelRiotID[o] || m.riot_id.split(',')[0].trim() || "Oyuncu"
                };
            }

            // 🎯 Her maçta kullanılan Riot ID'yi güncelliyoruz (Sezona göre en günceli kalır)
            if (m.riot_id) oyuncuIstatistikleri[o].altBaslik = m.riot_id.split(',')[0].trim();
            if (m.profil_ikonu) oyuncuIstatistikleri[o].profil = m.profil_ikonu;

            oyuncuIstatistikleri[o].mac++;
            oyuncuIstatistikleri[o].k += (m.oldurme || 0);
            oyuncuIstatistikleri[o].d += (m.olum || 0);
            oyuncuIstatistikleri[o].a += (m.asist || 0);

            if (tabloTuru === "lid_kill") oyuncuIstatistikleri[o].deger += (m.oldurme || 0);
            else if (tabloTuru === "lid_utanc") oyuncuIstatistikleri[o].deger += (m.olum || 0);
            else if (tabloTuru === "lid_asist") oyuncuIstatistikleri[o].deger += (m.asist || 0);
            else if (tabloTuru === "lid_gorus") oyuncuIstatistikleri[o].deger += (m.gorus_skoru || 0);
        });

        let siralama = Object.keys(oyuncuIstatistikleri).map(oyuncuAdi => {
            let stats = oyuncuIstatistikleri[oyuncuAdi];
            let ortalama = (tabloTuru === "lid_kda")
                ? (stats.d === 0 ? (stats.k + stats.a) : (stats.k + stats.a) / stats.d)
                : (stats.deger / stats.mac);
            let oyunIciIsim = guncelRiotID[oyuncuAdi] || stats.altBaslik;
            let gercekIsim = oyuncuAdi;

            return { isim: oyunIciIsim, altBaslik: gercekIsim, profil: stats.profil, mac: stats.mac, ortalama: ortalama };
        }).sort((a, b) => b.ortalama - a.ortalama);

        let html = `<h1 style="color: var(--text-light); text-align: center;">${sayfaAdi} <span style="font-size:0.4em; color:var(--hextech-gold);">[${window.GuncelDurum.sezon}]</span></h1>`;
        html += `<div style="display: flex; flex-direction: column; gap: 8px; max-width: 600px; margin: 25px auto;">`;

        if (siralama.length === 0) return html + `<p style="color:var(--text-main); text-align:center;">Seçili sezonda veri yok.</p></div>`;

        siralama.forEach((kisi, index) => {
            let siraGorseli = "";
            let arkaPlan = "rgba(9, 20, 40, 0.7)";
            let cerceve = "1px solid var(--border-color)";
            let isimRenk = "var(--text-light)";
            let isUtanc = tabloTuru === "lid_utanc";
            let madalyaEmoji = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";

            if (index < 3) {
                siraGorseli = `<div style="display: flex; align-items: center; justify-content: center; font-size: 1.8em;"><span>${madalyaEmoji}</span>${isUtanc ? '<span style="font-size: 0.6em; margin-left: 2px;">💀</span>' : ''}</div>`;
                if (index === 0) {
                    arkaPlan = "linear-gradient(90deg, rgba(255, 215, 0, 0.15) 0%, rgba(9, 20, 40, 0.85) 100%)";
                    cerceve = "1px solid rgba(255, 215, 0, 0.6)";
                    isimRenk = "#ffd700";
                } else if (index === 1) { isimRenk = "#c0c0c0"; } else { isimRenk = "#cd7f32"; }
            } else {
                siraGorseli = `<div style="color: #0ac8b9; font-weight: 900; font-size: 1.2em;">#${index + 1}</div>`;
            }

            let profilUrl = RiotCDN.profilResim(kisi.profil);

            html += `
            <div style="display: flex; align-items: center; background: ${arkaPlan}; border: ${cerceve}; padding: 12px 20px; border-radius: 6px; margin-bottom: 8px;">
                <div style="min-width: 60px; display: flex; align-items: center; justify-content: center;">${siraGorseli}</div>
                <div style="display: flex; align-items: center; gap: 15px; flex-grow: 1;">
                    <img src="${profilUrl}" style="width: 46px; height: 46px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1);">
                    <div>
                        <div style="color: ${isimRenk}; font-weight: bold; font-size: 1.1em;">${kisi.isim}</div>
                        <div style="color: var(--text-main); font-size: 0.8em;">${kisi.altBaslik}</div>
                    </div>
                </div>
                <div style="min-width: 100px; text-align: right;">
                    <div style="color: var(--text-light); font-weight: 900; font-size: 1.2em;">${kisi.ortalama.toFixed(2)}</div>
                    <div style="color: var(--text-main); font-size: 0.75em;">${kisi.mac} Maç Ort.</div>
                </div>
            </div>`;
        });
        return html + `</div>`;
    },
    cizProfil: function () {
        // Veritabanındaki eşsiz oyuncu isimlerini alıp menü oluşturuyoruz
        let oyuncuIsimleri = [...new Set(window.GuncelDurum.veriyiFiltrele(Sistem.veriler).map(m => m.oyuncu))].sort();

        let butonlarHtml = oyuncuIsimleri.map(isim => `
            <button class="menu-btn bireysel-oyuncu-btn" onclick="window.BireyselProfilYukle('${isim}', this)">
                <img src="${Yardimci.ikonUrlGetir(window.guncelIkonlar ? window.guncelIkonlar[isim] || 29 : 29, RiotCDN.surum)}" style="width:24px; height:24px; border-radius:50%; margin-right:10px; vertical-align:middle; border:1px solid var(--border-color);">
                ${isim}
            </button>
        `).join("");

        return `
            <h1 style="color: var(--text-light); border-bottom: 2px solid var(--border-color); padding-bottom: 10px;">👤 Bireysel Profil Arayüzü</h1>
            <p style="color: #8b949e; margin-bottom: 20px;">Detaylı istatistikler, ajan analizleri ve maç geçmişi için sol taraftan veya aşağıdaki listeden bir oyuncu seçin.</p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 10px; background: rgba(9, 20, 40, 0.4); padding: 20px; border-radius: 8px; border: 1px solid rgba(200, 170, 110, 0.1);">
                ${butonlarHtml || '<span style="color:#f85149;">Veri bulunamadı.</span>'}
            </div>
            
            <div id="bireysel-detay-ekrani" style="margin-top: 30px;">
                </div>
        `;
    },
    cizProfilDetay: function (oyuncuAdi) {
        if (window.profilHafizasi && window.profilHafizasi[oyuncuAdi]) {
            return window.profilHafizasi[oyuncuAdi];
        }

        let islenecekVeri = window.GuncelDurum.veriyiFiltrele(Sistem.veriler);
        let oyuncuMaclari = islenecekVeri.filter(m => m.oyuncu === oyuncuAdi);

        if (oyuncuMaclari.length === 0) return `<div style="text-align:center; padding: 50px; font-size:1.2em; color:#f85149;">Bu oyuncuya ait maç bulunamadı.</div>`;

        let sonMacIkonlu = [...oyuncuMaclari].sort((a, b) => b.tarih_ms - a.tarih_ms).find(m => m.profil_ikonu);
        let IkonID = sonMacIkonlu ? sonMacIkonlu.profil_ikonu : 29;

        let riotIdListesi = [...new Set(oyuncuMaclari.map(m => m.riot_id).filter(Boolean))].reverse();
        let riotIdMetni = riotIdListesi.length > 0 ? riotIdListesi.join(", ") : oyuncuAdi;
        if (oyuncuAdi === "Sezer") riotIdMetni = "the Kosm, obliviscaris";

        let zafer = oyuncuMaclari.filter(m => m.sonuc === "Zafer" || m.sonuc === "Galibiyet").length;
        let bozgun = oyuncuMaclari.length - zafer;
        let wr = ((zafer / oyuncuMaclari.length) * 100).toFixed(0);
        let wrRenk = wr >= 50 ? "#3fb950" : "#f85149";

        let t_k = 0, t_d = 0, t_a = 0, t_cs = 0, t_sure = 0, t_gpm = 0, t_cs_farki = 0, t_ilk10 = 0, gecerli_koridor = 0;
        let t_hasar = 0, t_tank = 0, t_sifa = 0, t_gorus = 0, t_kontrol = 0, t_flame = 0;

        let t_dpm = 0, t_barikat = 0, t_q = 0, t_w = 0, t_e = 0, t_r = 0;

        // 🎯 KÜMÜLATİF SPAM HAVUZU
        let sampiyonYetenekHavuzu = {};
        let rolSayaci = {}, sampiyonSayaclari = {}, esyaSayaclari = {};

        let p_rolVerileri = {
            "TOP": { mac: 0, zafer: 0, k: 0, d: 0, a: 0, cs: 0, sure: 0, sabotaj: 0, vizyon: 0, kontrol: 0, ad: "TOP", orijinalAd: "TOP" },
            "JUNGLE": { mac: 0, zafer: 0, k: 0, d: 0, a: 0, cs: 0, sure: 0, sabotaj: 0, vizyon: 0, kontrol: 0, ad: "JNG", orijinalAd: "JUNGLE" },
            "MIDDLE": { mac: 0, zafer: 0, k: 0, d: 0, a: 0, cs: 0, sure: 0, sabotaj: 0, vizyon: 0, kontrol: 0, ad: "MID", orijinalAd: "MIDDLE" },
            "BOTTOM": { mac: 0, zafer: 0, k: 0, d: 0, a: 0, cs: 0, sure: 0, sabotaj: 0, vizyon: 0, kontrol: 0, ad: "BOT", orijinalAd: "BOTTOM" },
            "UTILITY": { mac: 0, zafer: 0, k: 0, d: 0, a: 0, cs: 0, sure: 0, sabotaj: 0, vizyon: 0, kontrol: 0, ad: "SUP", orijinalAd: "UTILITY" }
        };
        let lejant = { penta: 0, quadra: 0, triple: 0, double: 0, kusursuz: 0, sabotaj: 0, calinti: 0, ilkkan: 0 };

        oyuncuMaclari.forEach(m => {
            t_k += (m.oldurme || 0); t_d += (m.olum || 0); t_a += (m.asist || 0);
            t_hasar += (m.hasar_sampiyon || 0); t_tank += (m.hasar_sogurulan || 0);
            t_sifa += ((m.iyilesme_takim || 0) + (m.kalkan_takim || 0));
            t_gorus += (m.gorus_skoru || 0); t_kontrol += (m.kontrol_totemi || 0);
            t_gpm += (m.dakika_basi_altin || 0);

            t_dpm += (m.dakika_basi_hasar || 0);
            t_barikat += (m.alinan_barikat || 0);

            let q_b = m.q_kullanimi || 0;
            let w_b = m.w_kullanimi || 0;
            let e_b = m.e_kullanimi || 0;
            let r_b = m.r_kullanimi || 0;

            t_q += q_b; t_w += w_b; t_e += e_b; t_r += r_b;

            // 🎯 ŞAMPİYON BAZLI KÜMÜLATİF (KARİYER TOPLAMI) SPAM YAZIMI
            if (!sampiyonYetenekHavuzu[m.sampiyon]) {
                sampiyonYetenekHavuzu[m.sampiyon] = { Q: 0, W: 0, E: 0 };
            }
            sampiyonYetenekHavuzu[m.sampiyon].Q += q_b;
            sampiyonYetenekHavuzu[m.sampiyon].W += w_b;
            sampiyonYetenekHavuzu[m.sampiyon].E += e_b;

            let rol = m.pozisyon || "BELIRSIZ";
            if (rol !== "INVALID" && rol !== "BELIRSIZ" && p_rolVerileri[rol]) {
                rolSayaci[rol] = (rolSayaci[rol] || 0) + 1;
                p_rolVerileri[rol].mac++;
                if (m.sonuc === "Zafer" || m.sonuc === "Galibiyet") p_rolVerileri[rol].zafer++;
                p_rolVerileri[rol].k += (m.oldurme || 0); p_rolVerileri[rol].d += (m.olum || 0); p_rolVerileri[rol].a += (m.asist || 0);
                p_rolVerileri[rol].cs += (m.cs || 0); p_rolVerileri[rol].sure += (m.sure_saniye || 0);
                p_rolVerileri[rol].vizyon += (m.gorus_skoru || 0); p_rolVerileri[rol].kontrol += (m.kontrol_totemi || 0);
                if (IstatistikMotoru.checkSabotaj(m)) p_rolVerileri[rol].sabotaj++;
            }

            if (rol !== "UTILITY") {
                t_cs += (m.cs || 0); t_sure += (m.sure_saniye || 0);
                t_cs_farki += (m.koridor_minyon_farki || 0);
                t_ilk10 += (m.ilk_10_dk_minyon || 0);
                gecerli_koridor++;
                if ((m.koridor_minyon_farki || 0) >= 100) t_flame++;
            }

            if (!sampiyonSayaclari[m.sampiyon]) sampiyonSayaclari[m.sampiyon] = { mac: 0, win: 0, k: 0, d: 0, a: 0, hasar: 0, cs_farki: 0, flame: 0 };
            let sHedef = sampiyonSayaclari[m.sampiyon];
            sHedef.mac++;
            if (m.sonuc === "Zafer" || m.sonuc === "Galibiyet") sHedef.win++;
            sHedef.k += (m.oldurme || 0); sHedef.d += (m.olum || 0); sHedef.a += (m.asist || 0);
            sHedef.hasar += (m.hasar_sampiyon || 0);
            if (rol !== "UTILITY") sHedef.cs_farki += (m.koridor_minyon_farki || 0);
            if ((m.koridor_minyon_farki || 0) >= 100) sHedef.flame++;

            if (m.esyalar && window.itemVeritabani) {
                m.esyalar.slice(0, 6).forEach(e => {
                    if (e > 0 && window.itemVeritabani[e]) {
                        let itm = window.itemVeritabani[e];
                        if ((itm.gold && itm.gold.total >= 1600) || (itm.tags && itm.tags.includes("Boots"))) {
                            esyaSayaclari[e] = (esyaSayaclari[e] || 0) + 1;
                        }
                    }
                });
            }

            if (m.penta) lejant.penta += m.penta;
            if (m.quadra) lejant.quadra += m.quadra;
            if (m.triple) lejant.triple += m.triple;
            if (m.ikide_iki) lejant.double += m.ikide_iki;
            if (m.olum === 0) lejant.kusursuz++;
            if (IstatistikMotoru.checkSabotaj(m)) lejant.sabotaj++;
            if (m.calinan_objektif) lejant.calinti += m.calinan_objektif;
            if (m.ilk_kan) lejant.ilkkan++;
        });

        let siraliRolObjeleri = Object.values(p_rolVerileri).filter(r => r.mac > 0).sort((a, b) => b.mac - a.mac);
        let top2Rol = siraliRolObjeleri.slice(0, 2);

        let anaRolMetni = top2Rol.length > 0 ? top2Rol[0].ad : "Belirsiz";
        let anaDavranis = top2Rol.length > 0 ? IstatistikMotoru.davranisHesapla(
            top2Rol[0].k / top2Rol[0].mac, top2Rol[0].d / top2Rol[0].mac, top2Rol[0].a / top2Rol[0].mac,
            top2Rol[0].orijinalAd, top2Rol[0].vizyon / top2Rol[0].mac, top2Rol[0].kontrol / top2Rol[0].mac,
            top2Rol[0].sure > 0 ? (top2Rol[0].cs / (top2Rol[0].sure / 60)) : 0, top2Rol[0].sabotaj / top2Rol[0].mac
        ) : "Belirsiz";

        let ikincilRolMetni = top2Rol.length > 1 ? top2Rol[1].ad : "Yok";
        let ikincilDavranis = top2Rol.length > 1 ? IstatistikMotoru.davranisHesapla(
            top2Rol[1].k / top2Rol[1].mac, top2Rol[1].d / top2Rol[1].mac, top2Rol[1].a / top2Rol[1].mac,
            top2Rol[1].orijinalAd, top2Rol[1].vizyon / top2Rol[1].mac, top2Rol[1].kontrol / top2Rol[1].mac,
            top2Rol[1].sure > 0 ? (top2Rol[1].cs / (top2Rol[1].sure / 60)) : 0, top2Rol[1].sabotaj / top2Rol[1].mac
        ) : "Yok";

        siraliRolObjeleri.forEach((r) => {
            r.wr = Math.round((r.zafer / r.mac) * 100);
            r.kda = r.d === 0 ? (r.k + r.a) : ((r.k + r.a) / r.d);
        });
        siraliRolObjeleri.sort((a, b) => b.kda - a.kda);

        let rolSiralamasiHTML = "";
        siraliRolObjeleri.forEach((r, index) => {
            let siraRozeti = index === 0 ? "👑 EN İYİ ROL" : (index === siraliRolObjeleri.length - 1 && r.wr < 50 ? "⚠️ ZAYIF HALKA" : `${index + 1}. SIRA`);
            let rwRenk = r.wr >= 50 ? "#3fb950" : "#f85149";
            let topRenk = index === 0 ? "#00bcd4" : (index === 1 ? "#e91e63" : (index === 2 ? "#ff9800" : "#2196f3"));

            rolSiralamasiHTML += `
            <div style="background: rgba(13, 17, 23, 0.9); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; flex: 1; min-width: 180px; text-align: center; border-top: 3px solid ${topRenk}; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <div style="font-size: 0.75em; color: ${topRenk}; font-weight: 900; margin-bottom: 8px; letter-spacing: 0.5px; text-transform: uppercase;">${siraRozeti}</div>
                <div style="font-size: 1.2em; color: var(--text-light); font-weight: bold;">${r.ad}</div>
                <div style="font-size: 1.8em; color: ${rwRenk}; font-weight: 900; margin: 12px 0;">%${r.wr}</div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85em; color: #fff; background: #000; padding: 6px 12px; border-radius: 4px; font-weight:bold;">
                    <span>${r.mac} Maç</span>
                    <span>${r.kda.toFixed(2)} KDA</span>
                </div>
            </div>`;
        });

        let ortK = (t_k / oyuncuMaclari.length).toFixed(1); let ortD = (t_d / oyuncuMaclari.length).toFixed(1); let ortA = (t_a / oyuncuMaclari.length).toFixed(1);
        let ortCS = t_sure > 0 ? (t_cs / (t_sure / 60)).toFixed(1) : 0;
        let ortGpm = Math.round(t_gpm / oyuncuMaclari.length);
        let ortCsFark = gecerli_koridor > 0 ? Math.round(t_cs_farki / gecerli_koridor) : 0;
        let ortIlk10 = gecerli_koridor > 0 ? (t_ilk10 / gecerli_koridor).toFixed(1) : 0;

        let ortDpm = Math.round(t_dpm / oyuncuMaclari.length);
        let ortQ = Math.round(t_q / oyuncuMaclari.length);
        let ortW = Math.round(t_w / oyuncuMaclari.length);
        let ortE = Math.round(t_e / oyuncuMaclari.length);
        let ortR = Math.round(t_r / oyuncuMaclari.length);

        // 🎯 KÜMÜLATİF SPAM SONUÇ HESAPLAMASI
        let zirveSpam = { sampiyon: "", tus: "", adet: 0 };
        Object.keys(sampiyonYetenekHavuzu).forEach(samp => {
            let stats = sampiyonYetenekHavuzu[samp];
            if (stats.Q > zirveSpam.adet) zirveSpam = { sampiyon: samp, tus: "Q", adet: stats.Q };
            if (stats.W > zirveSpam.adet) zirveSpam = { sampiyon: samp, tus: "W", adet: stats.W };
            if (stats.E > zirveSpam.adet) zirveSpam = { sampiyon: samp, tus: "E", adet: stats.E };
        });

        let dinamikSpamMetni = "Yeterli Veri Yok";
        if (zirveSpam.adet > 0) {
            dinamikSpamMetni = `<b style="color:#fff;">${Yardimci.formatSampiyon(zirveSpam.sampiyon)} ${zirveSpam.tus}</b> <span style="font-size:0.85em; color:#8b949e; margin-left:4px;">(${zirveSpam.adet.toLocaleString('tr-TR')} kere)</span>`;
        }

        let oynananFarkliSampiyonSayisi = Object.keys(sampiyonSayaclari).length;
        let efektifSampiyonListesi = [];
        let efektifKutuHTML = "";

        let siraliSampiyonlar = Object.entries(sampiyonSayaclari).map(s => {
            let kdaSaf = s[1].d === 0 ? (s[1].k + s[1].a) : ((s[1].k + s[1].a) / s[1].d);
            let p = s[1].win / s[1].mac; let z = 1.96;
            let sp = ((p + (z * z) / (2 * s[1].mac) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * s[1].mac)) / s[1].mac)) / (1 + (z * z) / s[1].mac) * 100) + (Math.min(kdaSaf, 10) * 2);

            if ((p * 100) >= 50 && s[1].mac >= 3) {
                efektifSampiyonListesi.push(s[0]);
                efektifKutuHTML += `
                <div style="background: rgba(13,17,23,0.9); border-radius: 12px; padding: 15px; width: 180px; text-align: center; border: 1px solid var(--border-color); box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
                   <img src="${Yardimci.resimUrlGetir(s[0], RiotCDN.surum)}" style="width: 50px; height: 50px; border-radius: 6px; border: 2px solid var(--hextech-blue); margin-bottom: 8px;">
                   <div style="font-weight: bold; font-size: 1.1em; color: #fff;">${Yardimci.formatSampiyon(s[0])}</div>
                   <div style="font-size: 0.85em; color: #3fb950; font-weight: bold;">%${Math.round(p * 100)} WR <span style="color:#8b949e; font-weight:normal;">(${s[1].mac} Maç)</span></div>
                   <div style="margin-top: 10px; font-size: 0.85em; text-align: left; color: #8b949e;">
                       <div style="display:flex; justify-content:space-between; margin-bottom: 4px;"><span>Ort. KDA:</span> <b style="color:var(--hextech-blue);">${kdaSaf.toFixed(1)}</b></div>
                       <div style="display:flex; justify-content:space-between; margin-bottom: 4px;"><span>Hasar/Maç:</span> <b style="color:#f85149;">${Yardimci.formatK(s[1].hasar / s[1].mac)}</b></div>
                       <div style="display:flex; justify-content:space-between; margin-bottom: 4px;"><span>CS Farkı:</span> <b style="color:var(--accent-color);">${Math.round(s[1].cs_farki / s[1].mac) > 0 ? '+' + Math.round(s[1].cs_farki / s[1].mac) : Math.round(s[1].cs_farki / s[1].mac)}</b></div>
                       <div style="display:flex; justify-content:space-between; border-top:1px solid rgba(255,255,255,0.1); padding-top:4px;"><span>🌋 Horizon:</span> <b style="color:#ff5722;">${s[1].flame > 0 ? s[1].flame : '-'}</b></div>
                   </div>
                </div>`;
            }
            return { isim: s[0], veri: s[1], sp: sp, kda: kdaSaf };
        }).sort((a, b) => {
            let aGecti = a.veri.mac >= 3 ? 1 : 0; let bGecti = b.veri.mac >= 3 ? 1 : 0;
            if (bGecti !== aGecti) return bGecti - aGecti;
            if (Math.abs(b.sp - a.sp) > 0.01) return b.sp - a.sp;
            return b.kda - a.kda;
        }).slice(0, 3);

        let sampiyonHtml = siraliSampiyonlar.map(s => {
            let cWR = ((s.veri.win / s.veri.mac) * 100).toFixed(0);
            let renk = cWR >= 50 ? "#3fb950" : "#f85149";
            return `<div style="display:flex; align-items:center; gap:12px; margin-bottom:12px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                        <img src="${Yardimci.resimUrlGetir(s.isim, RiotCDN.surum)}" style="width:48px; height:48px; border-radius:6px; border: 1px solid var(--border-color); box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
                        <span style="font-weight:bold; color:var(--text-light); font-size:1.1em;">${Yardimci.formatSampiyon(s.isim)} <br><span style="font-size:0.8em; color:#8b949e; font-weight:normal;">(${s.veri.mac} Maç, <span style="color:${renk}; font-weight:bold;">%${cWR}</span>)</span></span>
                    </div>`;
        }).join("");

        let favoriEsyaHtml = Object.entries(esyaSayaclari).sort((a, b) => b[1] - a[1]).slice(0, 6).map(e =>
            Yardimci.cizEsya(e[0], "width:40px; height:40px; border-radius:8px; border:1px solid var(--border-color); cursor:pointer; margin-right:4px;")
        ).join("");

        let maclarHtml = "";
        let siraliMaclar = oyuncuMaclari.sort((a, b) => b.tarih_ms - a.tarih_ms);

        siraliMaclar.forEach((veri, index) => {
            let zaferMi = (veri.sonuc === "Zafer" || veri.sonuc === "Galibiyet");
            let sinirRengi = zaferMi ? "#3fb950" : "#f85149";
            let bgRengi = zaferMi ? "rgba(63, 185, 80, 0.05)" : "rgba(248, 81, 73, 0.05)";
            let gizliClass = index >= 20 ? "mac-karti-gizli" : "";
            let displayStili = index >= 20 ? "display: none;" : "display: flex;";
            let kartIsmi = Yardimci.kimlikCozumle(veri.oyuncu, veri.riot_id);

            let esyalarHtml = '<div style="display:flex; gap:4px; align-items:center;">';
            if (veri.esyalar) {
                veri.esyalar.slice(0, 6).forEach(itemId => {
                    esyalarHtml += Yardimci.cizEsya(itemId, "width:32px; height:32px; border-radius:6px; border:1px solid var(--border-color); flex-shrink:0; cursor:help;");
                });
            }
            esyalarHtml += '</div>';

            let buyu1 = veri.buyu1 || veri.sihirdar1 || veri.spell1Id;
            let buyu2 = veri.buyu2 || veri.sihirdar2 || veri.spell2Id;
            let buyuHtml = `<div style="display:flex; flex-direction:column; gap:2px;">
                ${Yardimci.cizBuyu(buyu1, "width:24px; height:24px; border-radius:4px; border:1px solid var(--border-color); flex-shrink:0;")}
                ${Yardimci.cizBuyu(buyu2, "width:24px; height:24px; border-radius:4px; border:1px solid var(--border-color); flex-shrink:0;")}
            </div>`;

            let disRunHtml = `<div style="display:flex; flex-direction:column; gap:2px;">
                ${veri.ana_run_id ? Yardimci.cizRun(veri.ana_run_id, "width:24px; height:24px; border-radius:50%; border:2px solid #c8aa6e; background:#000; flex-shrink:0;") : ''}
                ${veri.alt_run_agaci_id ? Yardimci.cizRun(veri.alt_run_agaci_id, "width:18px; height:18px; border-radius:50%; margin: 0 auto; flex-shrink:0;") : ''}
            </div>`;

            let kda = veri.olum === 0 ? "Kusursuz" : ((veri.oldurme + veri.asist) / veri.olum).toFixed(2);
            let csMin = veri.sure_saniye > 0 ? (veri.cs / (veri.sure_saniye / 60)).toFixed(1) : 0;
            let etiketHtml = IstatistikMotoru.etiketUret(veri);
            let rozetlerSagUst = IstatistikMotoru.rozetUret(veri);
            let panelId = `detay_${veri.mac_id}_${index}`;
            let macData = `data-kusursuz="${veri.olum === 0}" data-sabotaj="${IstatistikMotoru.checkSabotaj(veri)}" data-penta="${veri.penta > 0}" data-quadra="${veri.quadra > 0}" data-triple="${veri.triple > 0}" data-double="${veri.ikide_iki > 0}" data-calinti="${veri.calinan_objektif > 0}" data-ilkkan="${veri.ilk_kan}" data-flame="${(veri.koridor_minyon_farki || 0) >= 100}" data-efektif="${efektifSampiyonListesi.includes(veri.sampiyon)}" data-sampiyon="${veri.sampiyon}"`;

            maclarHtml += `
            <div class="esya-kart profil-mac-karti filtrelenecek-mac ${gizliClass}" data-pozisyon="${veri.pozisyon}" ${macData} onclick="window.kutuAcDinamik('${panelId}', '${veri.mac_id}', '${veri.oyuncu}', event)" style="${displayStili} flex-direction: column; background: ${bgRengi}; border: 1px solid var(--border-color); border-left: 4px solid ${sinirRengi}; border-radius: 8px; padding: 15px; margin-bottom: 12px; cursor: pointer; transition: 0.2s; position: relative; overflow: hidden;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                    
                    <div style="display: flex; gap: 15px; min-width: 450px; flex-shrink: 0;">
                        <div style="display: flex; gap: 6px; align-items: center;">
                            <img src="${Yardimci.resimUrlGetir(veri.sampiyon, RiotCDN.surum)}" style="width: 75px; height: 75px; border-radius: 6px; border: 2px solid ${sinirRengi}; box-shadow: 0 0 10px ${sinirRengi}40; flex-shrink:0;">
                            ${buyuHtml}
                            ${disRunHtml}
                        </div>
                        <div style="display: flex; flex-direction: column; justify-content: flex-start;">
                            <div style="display: flex; align-items: center; gap: 8px; white-space: nowrap;">
                                <span style="font-size: 1.3em; font-weight: bold; color: #fff;">${kartIsmi}</span>
                                <span style="background: rgba(255,255,255,0.1); color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.7em;">${veri.sezon || 16}</span>
                                <span style="border: 1px solid var(--hextech-gold); color: var(--hextech-gold); padding: 2px 6px; border-radius: 4px; font-size: 0.7em;">${rolCeviri[veri.pozisyon] || veri.pozisyon}</span>
                            </div>
                            <div style="font-size: 0.85em; color: #8b949e; margin-top: 4px;">
                                <span style="color:${sinirRengi}; font-weight:bold;">${zaferMi ? "Zafer" : "Bozgun"}</span> • ${Yardimci.formatSampiyon(veri.sampiyon)} (⚔️ Takım: <b style="color:#fff;">${veri.takim_skoru || 0} / ${veri.takim_olumu || 0} / ${veri.takim_asisti || 0}</b>)
                            </div>
                            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">
                                ${etiketHtml}
                            </div>
                            <div style="display: flex; align-items: center; margin-top: 10px;">
                                ${esyalarHtml}
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 20px; flex: 1; justify-content: center; min-width: 300px; padding: 0 15px; border-left: 1px dashed rgba(255,255,255,0.1); border-right: 1px dashed rgba(255,255,255,0.1);">
                        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.9em; color: #8b949e; white-space: nowrap;">
                            <div>🗡️ CS: <b style="color:#fff;">${veri.cs || 0}</b> <span style="font-size:0.85em;">(${csMin}/dk)</span></div>
                            <div>👁️ Görüş: <b style="color:#fff;">${veri.gorus_skoru || 0}</b></div>
                            <div>🛑 Kontrol: <b style="color:#f85149;">${veri.kontrol_totemi || 0}</b></div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.9em; color: #8b949e; white-space: nowrap;">
                            <div>💥 Hasar: <b style="color:#f85149;">${Yardimci.formatK(veri.hasar_sampiyon)}</b></div>
                            <div>🛡️ Tank: <b style="color:var(--accent-color);">${Yardimci.formatK(veri.hasar_sogurulan)}</b></div>
                            <div>💚 Destek: <b style="color:#3fb950;">${Yardimci.formatK((veri.iyilesme_takim || 0) + (veri.kalkan_takim || 0))}</b></div>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px; min-width: 150px; flex-shrink: 0;">
                        <div style="color: #8b949e; font-size: 0.85em; display: flex; gap: 10px; white-space: nowrap;">
                            <span>📅 ${Yardimci.tarihFormatla(veri.tarih_ms)}</span>
                            <span>⏱️ ${Yardimci.sureFormatla(veri.sure_saniye)}</span>
                        </div>
                        <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end; max-width: 200px;">${rozetlerSagUst}</div>
                        <div style="font-size: 2.2em; font-weight: bold; color: var(--hextech-blue); line-height: 1.1; white-space: nowrap; margin-top: 5px;">
                            ${veri.oldurme} / <span style="color:#f85149;">${veri.olum}</span> / ${veri.asist}
                        </div>
                    </div>

                </div>

                <div id="${panelId}" style="display: none; margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; cursor: default; width: 100%;" onclick="event.stopPropagation()">
                    </div>
            </div>`;
        });

        let sampiyonFiltreSecenekleri = [...new Set(oyuncuMaclari.map(m => m.sampiyon))].sort().map(s => `<option value="${s}">${Yardimci.formatSampiyon(s)}</option>`).join("");

        let finalHtml = `
        <div id="bireysel-profil-arayuzu" data-oyuncu="${oyuncuAdi}" style="animation: fadein 0.2s ease;">
            
            <div style="background: rgba(9, 20, 40, 0.8); border: 1px solid var(--border-color); border-radius: 12px; padding: 25px; display: flex; align-items: center; gap: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.5); margin-bottom: 20px;">
                <img src="${Yardimci.ikonUrlGetir(IkonID, RiotCDN.surum)}" style="width: 110px; height: 110px; border-radius: 50%; border: 3px solid var(--hextech-gold); box-shadow: 0 0 15px rgba(200, 170, 110, 0.5);">
                
                <div style="flex: 1; margin-left: 10px;">
                    <div style="font-size: 2.4em; font-weight: 900; color: #fff; margin-bottom: 2px; letter-spacing: 1px;">${oyuncuAdi}</div>
                    <div style="color: #8b949e; font-size: 0.95em; margin-bottom: 12px; font-style: italic;">${riotIdMetni} <span style="color:var(--hextech-gold);">[${window.GuncelDurum.sezon}]</span></div>
                </div>
                
                <div style="display: flex; gap: 30px;">
                    <div style="text-align: center; display: flex; flex-direction: column; justify-content: center;">
                        <div style="color: #fff; font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: bold;">KAZANMA ORANI</div>
                        <div style="font-size: 2.5em; font-weight: bold; color: ${wrRenk}; line-height: 1;">%${wr}</div>
                        <div style="color: #fff; font-size: 0.9em; margin-top: 8px;">${oyuncuMaclari.length} Maç, ${zafer} Zafer, ${bozgun} Bozgun</div>
                    </div>
                    
                    <div style="width: 1px; background: rgba(255,255,255,0.1); margin: 0 10px;"></div>

                    <div style="text-align: center; display: flex; flex-direction: column; justify-content: center;">
                        <div style="color: #fff; font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: bold;">ORTALAMA KDA</div>
                        <div style="font-size: 2.2em; font-weight: bold; color: var(--hextech-blue); line-height: 1; text-shadow: 0 0 10px rgba(88,166,255,0.3);">
                            ${ortK} / <span style="color:#f85149">${ortD}</span> / ${ortA}
                        </div>
                        <div style="color: #8b949e; font-size: 0.9em; margin-top: 8px;">
                            Ort. CS/min: <b style="color:#fff;">${ortCS}</b> | GPM: <b style="color:#ffd60a;">${ortGpm}</b>
                        </div>
                        
                        <div style="margin-top: 15px; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                            <div style="border: 1px solid var(--hextech-gold); border-radius: 6px; padding: 6px 15px; font-size: 0.85em; font-weight: bold; color: #fff; background: rgba(200,170,110,0.1); width: max-content;">
                                <span style="color: var(--hextech-gold); text-transform: uppercase;">ANA ROL: ${anaRolMetni}</span> &nbsp;|&nbsp; Oyun Tarzı: ${anaDavranis}
                            </div>
                            ${ikincilRolMetni !== "Yok" ? `
                            <div style="border: 1px solid #a0a0a0; border-radius: 6px; padding: 6px 15px; font-size: 0.85em; font-weight: bold; color: #fff; background: rgba(160,160,160,0.1); width: max-content;">
                                <span style="color: #d0d0d0; text-transform: uppercase;">İKİNCİL ROL: ${ikincilRolMetni}</span> &nbsp;|&nbsp; Oyun Tarzı: ${ikincilDavranis}
                            </div>` : ''}
                        </div>
                    </div>
                </div>
            </div>

            ${rolSiralamasiHTML ? `
            <div style="margin: 20px 0 30px 0; width: 100%;">
                <div style="background: #21262d; border: 1px solid var(--border-color); color: #fff; padding: 10px 15px; border-radius: 6px; font-weight: bold; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                    🎭 ROL PROFİLLERİ (ESNEK PERFORMANS SIRALAMASI)
                </div>
                <div style="display: flex; gap: 15px; flex-wrap: wrap; width: 100%;">
                    ${rolSiralamasiHTML}
                </div>
            </div>` : ''}

            <div style="display: grid; grid-template-columns: 1.2fr 1.2fr 1fr; gap: 20px; background: rgba(9, 20, 40, 0.6); border: 1px solid var(--border-color); border-radius: 12px; padding: 30px; margin-bottom: 20px;">
                <div style="border-right: 1px dashed rgba(255,255,255,0.1); padding-right: 20px;">
                    <div style="color: #fff; font-size: 0.9em; font-weight: bold; margin-bottom: 15px; text-transform: uppercase;">Detaylı Ortalamalar</div>
                    <div style="display: flex; flex-direction: column; gap: 10px; font-size: 1.05em; color: var(--text-light);">
                        <div style="display:flex; justify-content:space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom:3px;"><span>Altın (GPM):</span> <b style="color:#ffd60a;">${ortGpm}</b></div>
                        <div style="display:flex; justify-content:space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom:3px;"><span>Hasar (DPM):</span> <b style="color:#f85149;">${ortDpm}</b></div>
                        <div style="display:flex; justify-content:space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom:3px;"><span>10.Dk Minyon CS:</span> <b style="color:#fff;">${ortIlk10}</b></div>
                        <div style="display:flex; justify-content:space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom:3px;"><span>Koridor Minyon Farkı:</span> <b style="color:var(--accent-color);">${ortCsFark > 0 ? '+' + ortCsFark : ortCsFark}</b></div>
                        <div style="display:flex; justify-content:space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom:3px;"><span>Görüş / Kontrol:</span> <b style="color:#fff;">${(t_gorus / oyuncuMaclari.length).toFixed(1)} / <span style="color:#f85149;">${(t_kontrol / oyuncuMaclari.length).toFixed(1)}</span></b></div>
                        
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.15); font-size: 0.9em; color: #8b949e; text-align: center;">
                            <div style="color: #fff; font-weight: bold; font-size: 1em; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">⌨️ Ortalama Yetenek Kullanımı</div>
                            <div style="display: flex; justify-content: center; gap: 10px; font-weight: bold;">
                                <span style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px;">Q: <b style="color:var(--hextech-blue);">${ortQ}</b></span>
                                <span style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px;">W: <b style="color:var(--hextech-blue);">${ortW}</b></span>
                                <span style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px;">E: <b style="color:var(--hextech-blue);">${ortE}</b></span>
                                <span style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px;">R: <b style="color:#ffaa00;">${ortR}</b></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="border-right: 1px dashed rgba(255,255,255,0.1); padding-right: 20px; padding-left: 10px;">
                    <div style="color: #fff; font-size: 0.9em; font-weight: bold; margin-bottom: 20px; text-transform: uppercase;">En İyi 3 Şampiyon</div>
                    <div>${sampiyonHtml || '<span style="color:#fff; font-size:1em;">Yeterli Veri Yok</span>'}</div>
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05);">
                        <div style="color: #fff; font-size: 0.85em; margin-bottom: 10px; font-weight: bold;">FAVORİ EŞYALAR</div>
                        <div style="display:flex; gap:6px; flex-wrap:wrap;">${favoriEsyaHtml || '-'}</div>
                    </div>
                </div>

                <div style="padding-left: 10px;">
                    <div style="color: #fff; font-size: 0.9em; font-weight: bold; margin-bottom: 20px; text-transform: uppercase;">Kariyer & Vurgunlar</div>
                    <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.95em; color: var(--text-light);">
                        <div style="display:flex; justify-content:space-between;"><span>Penta / Quadra / Triple:</span> <b style="color:#fff;">${lejant.penta} / ${lejant.quadra} / ${lejant.triple}</b></div>
                        <div style="display:flex; justify-content:space-between;"><span>🥷 Çalınan / 🩸 İlk Kan:</span> <b style="color:#fff;">${lejant.calinti} / ${lejant.ilkkan}</b></div>
                        <div style="display:flex; justify-content:space-between;"><span>🌟 Kusursuz / 💀 Sabotaj:</span> <b style="color:#fff;">${lejant.kusursuz} / ${lejant.sabotaj}</b></div>
                        <div style="display:flex; justify-content:space-between;"><span>🌋 Flame Horizon (+100 CS):</span> <b style="color:#ff5722;">${t_flame} Kere</b></div>
                        <div style="display:flex; justify-content:space-between;"><span>🔨 Alınan Barikat (Toplam):</span> <b style="color:#a1d586;">${t_barikat} Plaka</b></div>
                        
                        <div style="display:flex; justify-content:space-between; align-items:center; white-space: nowrap; overflow: hidden;">
                            <span style="flex-shrink: 0; margin-right: 10px;">🎹 En Çok Spamlanan Tuş:</span>
                            <div style="text-align: right; overflow: hidden; text-overflow: ellipsis;">${dinamikSpamMetni}</div>
                        </div>
                        
                        <div style="display:flex; justify-content:space-between;"><span>🎭 Şampiyon Havuzu:</span> <b style="color:#fff;">${oynananFarkliSampiyonSayisi} / 168</b></div>
                        <div style="display:flex; justify-content:space-between;" title="En az 3 maç, %50+ WR"><span>🎯 Efektif Havuz:</span> <b style="color:#3fb950;">${efektifSampiyonListesi.length} / ${oynananFarkliSampiyonSayisi}</b></div>
                    </div>
                </div>
            </div>

            <div style="background: rgba(9, 20, 40, 0.6); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 20px;">
                <button class="p-filtre-btn aktif btn-hex" onclick="window.profilFiltrele('hepsi', this)">Tüm Maçlar</button>
                <button class="p-filtre-btn btn-hex" onclick="window.profilFiltrele('kusursuz', this)">🌟 Kusursuz</button>
                <button class="p-filtre-btn btn-hex" onclick="window.profilFiltrele('sabotaj', this)">💀 Sabotaj</button>
                <button class="p-filtre-btn btn-hex" onclick="window.profilFiltrele('penta', this)">🔥 Beşte Beş</button>
                <button class="p-filtre-btn btn-hex" onclick="window.profilFiltrele('quadra', this)">💥 Dörtte Dört</button>
                <button class="p-filtre-btn btn-hex" onclick="window.profilFiltrele('triple', this)">⚡ Üçte Üç</button>
                <button class="p-filtre-btn btn-hex" onclick="window.profilFiltrele('double', this)">⚔️ İkide İki</button>
                <button class="p-filtre-btn btn-hex" onclick="window.profilFiltrele('calinti', this)">🥷 Çalıntı</button>
                <button class="p-filtre-btn btn-hex" onclick="window.profilFiltrele('ilkkan', this)">🩸 İlk Kan</button>
                <button class="p-filtre-btn btn-hex" onclick="window.profilFiltrele('flame', this)">🌋 Flame Horizon</button>
                <button class="p-filtre-btn btn-hex" onclick="window.profilFiltrele('efektif', this)">🎯 Efektif Havuz</button>
                <select id="profil-sampiyon-secici" class="hex-select" style="width: auto;" onchange="window.profilFiltrele('sampiyon', null)">
                    <option value="hepsi">-- Şampiyon Seç --</option>
                    ${sampiyonFiltreSecenekleri}
                </select>
            </div>

            <div id="profil-ana-duzen" style="display: flex; gap: 20px; align-items: flex-start;">
                <div id="efektif-havuz-kapsayici" style="display:none; flex-wrap:wrap; gap:15px; justify-content:center; width:100%; margin-bottom:20px;">
                    ${efektifKutuHTML || `<div style="padding:40px; color:#f85149; border:1px dashed #f85149; border-radius:8px; width:100%; text-align:center;">Henüz efektif havuza giren (En az 3 Maç, %50+ WR) bir şampiyon yok.</div>`}
                </div>
                
                <div id="bireysel-mac-listesi" style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
                    ${maclarHtml}
                    ${siraliMaclar.length > 20 ? `<button id="btn-arsiv-ac" onclick="document.querySelectorAll('.mac-karti-gizli').forEach(el => { el.style.display = 'flex'; el.style.animation = 'fadein 0.5s ease'; }); this.style.display='none';" style="background: rgba(10, 200, 185, 0.1); color: var(--hextech-blue); border: 1px dashed var(--hextech-blue); padding: 15px; border-radius: 8px; cursor: pointer; font-size: 1.1em; font-weight: bold; width: 100%; transition: 0.3s; margin-top: 10px;">⬇️ Arşivin Kalanını Aç (${siraliMaclar.length - 20} Maç Daha)</button>` : ''}
                </div>

                <div id="bireysel-sag-kolon" style="width: 320px; flex-shrink: 0; display: none; flex-direction: column; gap: 15px; position: sticky; top: 20px;"></div>
            </div>
        </div>`;
        window.profilHafizasi = window.profilHafizasi || {};
        window.profilHafizasi[oyuncuAdi] = finalHtml;

        return finalHtml;
    },
    cizSinerji: function () {
        // 1. GLOBAL DURUMLARI BAŞLAT
        window.aktifSinerjiBoyutu = window.aktifSinerjiBoyutu || '5';
        window.aktifSinerjiOyuncular = window.aktifSinerjiOyuncular || [];

        // 2. TETİKLEYİCİ MOTORLAR
        if (!window.sinerjiSekmeDegistir) {
            window.sinerjiSekmeDegistir = function (val) {
                window.aktifSinerjiBoyutu = val;
                const icerik = document.getElementById("app-content");
                if (icerik) icerik.innerHTML = Sayfalar.cizSinerji();
            };
        }
        if (!window.sinerjiCokluFiltreTetikle) {
            window.sinerjiCokluFiltreTetikle = function (isim) {
                if (window.aktifSinerjiOyuncular.includes(isim)) {
                    window.aktifSinerjiOyuncular = window.aktifSinerjiOyuncular.filter(o => o !== isim);
                } else {
                    window.aktifSinerjiOyuncular.push(isim);
                }
                const icerik = document.getElementById("app-content");
                if (icerik) icerik.innerHTML = Sayfalar.cizSinerji();
            };
        }

        // 🎯 KADRO MAÇLARINI EKRANA ÇİZEN YENİ FİLTRE MOTORU
        if (!window.sinerjiKadroSec) {
            window.sinerjiKadroSec = function (orijinalIsimlerStr, formasyonJsonURI = null) {
                document.getElementById('sinerji-ana-tablo').style.display = 'none';
                let detayAlani = document.getElementById('sinerji-mac-alani');
                detayAlani.style.display = 'block';

                let formasyonJsonStr = formasyonJsonURI ? decodeURIComponent(formasyonJsonURI) : null;

                let islenecekVeri = window.GuncelDurum.veriyiFiltrele(Sistem.veriler);
                const mg = {};
                islenecekVeri.forEach(v => { if (!mg[v.mac_id]) mg[v.mac_id] = []; mg[v.mac_id].push(v); });

                let seciliMacIds = [];
                let hedefBoyut = window.aktifSinerjiBoyutu === "alt_koridor" ? 2 : parseInt(window.aktifSinerjiBoyutu);

                const rSira = { "TOP": 1, "JUNGLE": 2, "MIDDLE": 3, "BOTTOM": 4, "UTILITY": 5 };
                const rKisa = { "TOP": "TOP", "JUNGLE": "JNG", "MIDDLE": "MID", "BOTTOM": "BOT", "UTILITY": "SUP" };

                Object.entries(mg).forEach(([mId, grup]) => {
                    let eIsim = "";
                    let sGrup = [];
                    if (hedefBoyut === 2) {
                        let b = grup.filter(p => p.pozisyon === "BOTTOM"); let s = grup.filter(p => p.pozisyon === "UTILITY");
                        if (b.length > 0 && s.length > 0) {
                            sGrup = [b[0], s[0]].sort((x, y) => rSira[x.pozisyon] - rSira[y.pozisyon]);
                            eIsim = sGrup.map(o => o.oyuncu).join(" + ");
                        }
                    } else {
                        let n = grup.length;
                        if ((hedefBoyut === 5 && (n === 4 || n === 5)) || (hedefBoyut === 3 && n === 3)) {
                            sGrup = [...grup].sort((a, b) => rSira[a.pozisyon] - rSira[b.pozisyon]);
                            eIsim = sGrup.map(o => o.oyuncu).sort().join(" + ");
                        }
                    }

                    // 🎯 TIKLANAN FORMASYONA GÖRE SEÇİM YAP
                    if (eIsim === orijinalIsimlerStr) {
                        let eslesti = true;
                        if (formasyonJsonStr && hedefBoyut !== 2) {
                            let fArr = sGrup.map(x => ({
                                oyunIci: typeof guncelRiotID !== "undefined" ? (guncelRiotID[x.oyuncu] || x.oyuncu) : x.oyuncu,
                                rol: rKisa[x.pozisyon] || x.pozisyon
                            }));
                            if (JSON.stringify(fArr) !== formasyonJsonStr) eslesti = false;
                        }
                        if (eslesti) seciliMacIds.push(mId);
                    }
                });

                let baslikOyunIci = orijinalIsimlerStr.split(" + ").map(isim => typeof guncelRiotID !== "undefined" ? (guncelRiotID[isim] || isim) : isim).join(" + ");
                let baslikMetni = formasyonJsonStr ? `<b style="color:#0ac8b9;">${baslikOyunIci}</b> ekibinin <span style="color:#fff;">seçilen kadro formasyonuyla</span> oynadığı maçlar listeleniyor.` : `<b style="color:#0ac8b9;">${baslikOyunIci}</b> ekibinin oynadığı <span style="color:#fff;">tüm</span> maçlar listeleniyor.`;

                // 🎯 TEMİZLE BUTONU (GERİ DÖNÜŞ)
                let macHtml = `
                    <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(10, 200, 185, 0.1); border: 1px solid var(--hextech-blue); padding: 15px 20px; border-radius: 8px; margin-bottom: 20px;">
                        <div style="color:var(--text-light); font-size: 0.95em;">${baslikMetni}</div>
                        <button onclick="document.getElementById('sinerji-mac-alani').style.display='none'; document.getElementById('sinerji-ana-tablo').style.display='block'; window.scrollTo(0,0);" class="btn-hex" style="background: rgba(248, 81, 73, 0.2); border-color: #f85149; color: #f85149; padding: 8px 15px; font-weight: bold; font-size: 0.9em;">❌ Temizle</button>
                    </div>
                `;

                // 🎯 GÖRSELDEKİ GİBİ LİSTELEME
                seciliMacIds.sort((a, b) => parseInt(b.replace(/\D/g, '')) - parseInt(a.replace(/\D/g, ''))).forEach(id => {
                    let takim = mg[id];
                    takim.sort((a, b) => (rSira[a.pozisyon] || 99) - (rSira[b.pozisyon] || 99));

                    let sonuc = takim[0].sonuc === "Zafer" || takim[0].sonuc === "Galibiyet" ? "ZAFER" : "BOZGUN";
                    let sonucRenk = sonuc === "ZAFER" ? "#3fb950" : "#f85149";

                    let tK = 0, tD = 0, tA = 0;
                    if (takim[0].takim_skoru !== undefined) {
                        tK = takim[0].takim_skoru; tD = takim[0].takim_olumu; tA = takim[0].takim_asisti;
                    } else {
                        takim.forEach(p => { tK += p.oldurme || 0; tD += p.olum || 0; tA += p.asist || 0; });
                    }

                    let sureStr = Yardimci.sureFormatla(takim[0].sure_saniye);
                    let tarihStr = Yardimci.tarihFormatla(takim[0].tarih_ms);
                    let sezonStr = takim[0].sezon || "16";

                    macHtml += `
                    <div style="background: rgba(9, 20, 40, 0.8); border: 1px solid var(--border-color); border-top: 4px solid ${sonucRenk}; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.6); margin-bottom:20px; overflow: hidden;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding: 12px 20px; background: rgba(0,0,0,0.4);">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <span style="color: ${sonucRenk}; font-weight: 900; font-size: 1.1em; letter-spacing: 1px;">💥 ${sonuc}</span>
                                <span style="color: #8b949e; font-size: 0.9em; display: flex; align-items: center; gap: 5px;">
                                    ⚔️ Takım: <b style="color: #fff;">${tK} / ${tD} / ${tA}</b>
                                </span>
                                <span style="color: #8b949e; font-size: 0.9em;">⏱️ <b style="color: #fff;">${sureStr}</b></span>
                                <span style="color: #8b949e; font-size: 0.9em;">📅 <b style="color: #fff;">${tarihStr}</b></span>
                            </div>
                            <div>
                                <span style="background: rgba(255,255,255,0.1); color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 0.8em; font-weight: bold;">${sezonStr}</span>
                            </div>
                        </div>
                        <div style="padding: 10px;">
                            ${window.cizTakimKarti(takim, "")}
                        </div>
                    </div>`;
                });
                detayAlani.innerHTML = macHtml;
            };
        }

        let temelVeriler = window.GuncelDurum.veriyiFiltrele(Sistem.veriler);

        let anaBaslikHtml = `<h1 style="color: var(--text-light); border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0; text-align:center;">💪 Takım Sinerjisi ve Kadro Formasyonları <span style="font-size:0.5em; color:var(--hextech-gold);">[${window.GuncelDurum.sezon}]</span></h1>`;

        let sekmelerHtml = `
            <div style="display:flex; justify-content:center; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
                <button onclick="window.sinerjiSekmeDegistir('5')" style="background: ${window.aktifSinerjiBoyutu === '5' ? 'linear-gradient(90deg, rgba(88,166,255,0.15) 0%, transparent 100%)' : 'rgba(255,255,255,0.02)'}; border: 1px solid ${window.aktifSinerjiBoyutu === '5' ? '#58a6ff' : 'rgba(255,255,255,0.1)'}; color: ${window.aktifSinerjiBoyutu === '5' ? '#58a6ff' : '#8b949e'}; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">🛡️ 5'li Tam Kadro</button>
                <button onclick="window.sinerjiSekmeDegistir('3')" style="background: ${window.aktifSinerjiBoyutu === '3' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)'}; border: 1px solid ${window.aktifSinerjiBoyutu === '3' ? '#fff' : 'rgba(255,255,255,0.1)'}; color: ${window.aktifSinerjiBoyutu === '3' ? '#fff' : '#8b949e'}; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">🗡️ 3'lü Sinerji</button>
                <button onclick="window.sinerjiSekmeDegistir('alt_koridor')" style="background: ${window.aktifSinerjiBoyutu === 'alt_koridor' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)'}; border: 1px solid ${window.aktifSinerjiBoyutu === 'alt_koridor' ? '#fff' : 'rgba(255,255,255,0.1)'}; color: ${window.aktifSinerjiBoyutu === 'alt_koridor' ? '#fff' : '#8b949e'}; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">🏹 Alt Koridor İkilisi</button>
                <button onclick="window.sinerjiSekmeDegistir('ruya_takim')" style="background: ${window.aktifSinerjiBoyutu === 'ruya_takim' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255,255,255,0.02)'}; border: 1px solid ${window.aktifSinerjiBoyutu === 'ruya_takim' ? '#ffd700' : 'rgba(255,215,0,0.3)'}; color: ${window.aktifSinerjiBoyutu === 'ruya_takim' ? '#ffd700' : '#d4b106'}; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">🌟 Tüm Zamanların Rüya Takımı</button>
                <button onclick="window.sinerjiSekmeDegistir('haftanin_ruya_takimi')" style="background: ${window.aktifSinerjiBoyutu === 'haftanin_ruya_takimi' ? 'rgba(255, 87, 34, 0.1)' : 'rgba(255,255,255,0.02)'}; border: 1px solid ${window.aktifSinerjiBoyutu === 'haftanin_ruya_takimi' ? '#ff5722' : 'rgba(255,87,34,0.3)'}; color: ${window.aktifSinerjiBoyutu === 'haftanin_ruya_takimi' ? '#ff5722' : '#d84315'}; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">🔥 Haftanın 5'lisi</button>
            </div>
        `;

        let ciplerHtml = "";
        if (window.aktifSinerjiBoyutu !== "ruya_takim" && window.aktifSinerjiBoyutu !== "haftanin_ruya_takimi") {
            let tumEkipler = typeof TUM_EKIP_ISIMLERI !== "undefined" ? TUM_EKIP_ISIMLERI : ["Anıl Abi", "Can", "Ercan", "Evren Abi", "Furkan", "Hüseyin", "Kaan", "Nurettin", "Samet Abi", "Samet Yaldız Abi", "Selim Abi", "Sezer", "Talha Abi", "Taner", "Umut Abi", "İlhan Abi", "Şafak"];

            let chipButonlar = tumEkipler.map(isim => {
                let oyunIci = typeof guncelRiotID !== "undefined" ? (guncelRiotID[isim] || isim) : isim;
                let aktif = window.aktifSinerjiOyuncular.includes(isim);
                let bg = aktif ? "rgba(210,168,255,0.15)" : "rgba(255,255,255,0.03)";
                let border = aktif ? "#d2a8ff" : "rgba(255,255,255,0.1)";
                let color = aktif ? "#d2a8ff" : "#8b949e";
                let shadow = aktif ? "0 0 10px rgba(210,168,255,0.3)" : "none";
                return `<button style="background:${bg}; border:1px solid ${border}; color:${color}; box-shadow:${shadow}; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:bold; transition:0.2s;" onclick="window.sinerjiCokluFiltreTetikle('${isim}')">👤 ${oyunIci}</button>`;
            }).join("");

            ciplerHtml = `
                <div style="text-align: center; margin-bottom: 25px; max-width: 900px; margin-left: auto; margin-right: auto;">
                    <div style="color: #8b949e; font-weight: bold; margin-bottom: 12px; font-size: 0.85em; text-transform: uppercase;">👥 Ekipleri Süz (Çoklu Seçim):</div>
                    <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 8px;">
                        ${chipButonlar}
                    </div>
                </div>
            `;
        }

        let bilgiKutusuHtml = `
            <div style="background: rgba(210, 168, 255, 0.05); border: 1px solid rgba(210, 168, 255, 0.2); border-radius: 8px; padding: 15px 20px; font-size: 0.9em; color: #8b949e; line-height: 1.6; margin-bottom: 30px;">
                <b style="color: #d2a8ff;">ℹ️ Sinerji Puanı (SP) Nedir?</b><br>
                Sistem, ilkel kazanma oranları yerine <b>Wilson Güven Aralığı</b> matematiğini kullanarak küçük örneklemlerdeki şans faktörünü tamamen eler ve ekibin güvenilir alt sınırını hesaplar. Buna <b>3 Maç Kalifikasyon Barajı</b> zorunluluğu eşlik eder. Ek olarak; bir ekip farklı rollerde (Formasyonlar) oynayıp başarıyı koruyabiliyorsa, sistem bu <b>Rol Esnekliğini</b> ekstra ödüllendirerek Sinerji Puanını (SP) yukarı çeker.
            </div>
        `;

        if (temelVeriler.length === 0) return `<div style="max-width:1100px; margin:0 auto;">${anaBaslikHtml}${sekmelerHtml}<p style="text-align:center; color:#f85149;">Veri bulunamadı.</p></div>`;

        if (window.aktifSinerjiBoyutu === "ruya_takim" || window.aktifSinerjiBoyutu === "haftanin_ruya_takimi") {
            let havuz = temelVeriler;
            let baslikTxt = "🌟 Tüm Zamanların İstatistiksel Rüya Takımı";

            if (window.aktifSinerjiBoyutu === "haftanin_ruya_takimi") {
                baslikTxt = "🔥 Haftanın En Formda Beşlisi";
                let sinirMs = new Date().getTime() - (7 * 24 * 60 * 60 * 1000);
                havuz = temelVeriler.filter(m => m.tarih_ms >= sinirMs);
            }

            if (havuz.length === 0) {
                return `<div style="max-width:1100px; margin:0 auto;">${anaBaslikHtml}${sekmelerHtml}<div style="text-align:center; padding: 50px; font-size:1.2em; color:#f85149;">Bu zaman dilimi (Son 7 Gün) için yeterli veri bulunamadı. Lütfen "Tüm Zamanlar" sekmesine dönün.</div></div>`;
            }

            let oyuncuRolSkorlari = {};
            havuz.forEach(v => {
                let safRol = v.pozisyon || "BELIRSIZ"; if (safRol === "BELIRSIZ" || safRol === "INVALID") return;
                let id = v.oyuncu + "_" + safRol;
                if (!oyuncuRolSkorlari[id]) oyuncuRolSkorlari[id] = { isim: v.oyuncu, rol: safRol, mac: 0, zafer: 0, k: 0, d: 0, a: 0, gorus: 0, cs: 0, sure: 0, hasar_sampiyon: 0, sifa: 0, sampiyonlar: {} };
                oyuncuRolSkorlari[id].mac++;
                if (v.sonuc === "Zafer" || v.sonuc === "Galibiyet") oyuncuRolSkorlari[id].zafer++;
                oyuncuRolSkorlari[id].k += v.oldurme; oyuncuRolSkorlari[id].d += v.olum; oyuncuRolSkorlari[id].a += v.asist;
                oyuncuRolSkorlari[id].gorus += (v.gorus_skoru || 0); oyuncuRolSkorlari[id].cs += (v.cs || 0); oyuncuRolSkorlari[id].sure += (v.sure_saniye || 0);
                oyuncuRolSkorlari[id].hasar_sampiyon += (v.hasar_sampiyon || 0);
                oyuncuRolSkorlari[id].sifa += ((v.iyilesme_takim || 0) + (v.kalkan_takim || 0));
                oyuncuRolSkorlari[id].sampiyonlar[v.sampiyon] = (oyuncuRolSkorlari[id].sampiyonlar[v.sampiyon] || 0) + 1;
            });

            let skorListesi = Object.values(oyuncuRolSkorlari).map(o => {
                let wrLaplace = (o.zafer + 1) / (o.mac + 2);
                let hacimCari = Math.min(1.5, 1 + (o.mac * 0.05));
                let kda = o.d === 0 ? (o.k + o.a) : ((o.k + o.a) / o.d);
                let gorusAvg = o.gorus / o.mac;
                let havuzBoyutu = Object.keys(o.sampiyonlar).length;
                let cs_dk = o.cs / (o.sure ? (o.sure / 60) : 1);
                let csEtkisi = o.rol === "UTILITY" ? 0 : (cs_dk * 3);
                let hasarEtkisi = (o.hasar_sampiyon / o.mac) / 1000;
                let sifaEtkisi = (o.sifa / o.mac) / 500;

                o.taktikselSkor = (wrLaplace * hacimCari * 50) + (kda * 3) + (gorusAvg * 0.2) + (havuzBoyutu * 1.5) + csEtkisi + (hasarEtkisi * 0.5) + (sifaEtkisi * 0.5);
                o.enIyiSampiyon = Object.keys(o.sampiyonlar).reduce((a, b) => o.sampiyonlar[a] > o.sampiyonlar[b] ? a : b);
                return o;
            });

            const rGruplar = {};
            havuz.forEach(v => { if (!rGruplar[v.mac_id]) rGruplar[v.mac_id] = []; rGruplar[v.mac_id].push(v); });
            let duoIst = {};
            Object.values(rGruplar).forEach(grup => {
                let adc = grup.find(p => p.pozisyon === "BOTTOM"); let sup = grup.find(p => p.pozisyon === "UTILITY");
                if (adc && sup) {
                    let duoId = adc.oyuncu + "_ve_" + sup.oyuncu;
                    if (!duoIst[duoId]) duoIst[duoId] = { adc_isim: adc.oyuncu, sup_isim: sup.oyuncu, mac: 0, zafer: 0 };
                    duoIst[duoId].mac++; if (adc.sonuc === "Zafer" || adc.sonuc === "Galibiyet") duoIst[duoId].zafer++;
                }
            });

            let secilenAdc = null; let secilenSup = null; let secilenOyuncular = new Set();
            let duoSkorlari = Object.values(duoIst).map(d => {
                let dWR = (d.zafer + 1) / (d.mac + 2);
                let adcIndv = skorListesi.find(s => s.isim === d.adc_isim && s.rol === "BOTTOM");
                let supIndv = skorListesi.find(s => s.isim === d.sup_isim && s.rol === "UTILITY");
                d.toplamSkor = (adcIndv ? adcIndv.taktikselSkor : 0) + (supIndv ? supIndv.taktikselSkor : 0) + (dWR * 60) + (d.mac * 3); return d;
            }).sort((a, b) => b.toplamSkor - a.toplamSkor);

            if (duoSkorlari.length > 0) {
                let enIyiDuo = duoSkorlari[0];
                secilenAdc = skorListesi.find(s => s.isim === enIyiDuo.adc_isim && s.rol === "BOTTOM");
                secilenSup = skorListesi.find(s => s.isim === enIyiDuo.sup_isim && s.rol === "UTILITY");
                if (secilenAdc) secilenOyuncular.add(secilenAdc.isim); if (secilenSup) secilenOyuncular.add(secilenSup.isim);
            }

            let kalanRoller = ["TOP", "JUNGLE", "MIDDLE"]; let ruyaKadrosuObj = {};
            if (secilenAdc) ruyaKadrosuObj["BOTTOM"] = secilenAdc; if (secilenSup) ruyaKadrosuObj["UTILITY"] = secilenSup;
            kalanRoller.forEach(rol => {
                let adaylar = skorListesi.filter(s => s.rol === rol && !secilenOyuncular.has(s.isim)).sort((a, b) => b.taktikselSkor - a.taktikselSkor);
                if (adaylar.length > 0) { ruyaKadrosuObj[rol] = adaylar[0]; secilenOyuncular.add(adaylar[0].isim); }
            });

            const rollerVeRenkleri = [{ rol: "TOP", ad: "TOP", renk: "#ff9800" }, { rol: "JUNGLE", ad: "JNG", renk: "#4caf50" }, { rol: "MIDDLE", ad: "MID", renk: "#2196f3" }, { rol: "BOTTOM", ad: "BOT", renk: "#e91e63" }, { rol: "UTILITY", ad: "SUP", renk: "#9c27b0" }];
            let htmlKutu = ""; let yetersizVeriVarMi = false;

            rollerVeRenkleri.forEach(r => {
                if (ruyaKadrosuObj[r.rol]) {
                    let elit = ruyaKadrosuObj[r.rol];
                    let wr = ((elit.zafer / elit.mac) * 100).toFixed(0);
                    let kdaText = elit.d === 0 ? "Kusursuz" : ((elit.k + elit.a) / elit.d).toFixed(2) + " KDA";
                    let cs_dk = elit.cs / (elit.sure ? (elit.sure / 60) : 1);
                    let csText = r.rol === "UTILITY" ? "" : `<br><span style="color:#ffffff; font-size:0.9em;">CS/min: ${cs_dk.toFixed(1)}</span>`;
                    let gercekOyunIciId = typeof guncelRiotID !== "undefined" ? (guncelRiotID[elit.isim] || elit.isim) : elit.isim;

                    htmlKutu += `
                    <div style="background:rgba(0,0,0,0.4); border:1px solid var(--border-color); border-top:4px solid ${r.renk}; border-radius:8px; padding:15px; flex:1; min-width:140px; text-align:center;">
                        <div style="color: ${r.renk}; font-weight:bold; font-size:0.95em; margin-bottom:10px;">${r.ad}</div>
                        <img src="${typeof Yardimci !== 'undefined' ? Yardimci.resimUrlGetir(elit.enIyiSampiyon, typeof RiotCDN !== 'undefined' ? RiotCDN.surum : "14.23.1") : ''}" style="width:50px; height:50px; border-radius:50%; border:2px solid ${r.renk}; margin-bottom:10px;">
                        <div style="font-weight:bold; color:#fff; font-size:1.05em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${gercekOyunIciId}</div>
                        <div style="font-size:0.75em; color:#8b949e; margin-bottom:10px;">${elit.isim}</div>
                        <div style="font-size:0.85em; color:#8b949e;"><span style="color:#fff; font-weight:bold;">%${wr} WR</span> (${elit.mac} Maç)<br><span style="color:var(--accent-color);">${kdaText}</span>${csText}</div>
                    </div>`;
                } else {
                    yetersizVeriVarMi = true;
                    htmlKutu += `<div style="background:rgba(0,0,0,0.2); border:1px dashed var(--border-color); border-radius:8px; padding:15px; width:140px; text-align:center; opacity:0.5;"><div style="color:#8b949e; font-size:0.9em;">${r.ad}</div><div style="margin:20px 0; font-size:2em; color:#8b949e;">?</div><div style="color:#8b949e;">Yetersiz Veri</div></div>`;
                }
            });

            return `
            <div style="max-width:1100px; margin:0 auto;">
                ${anaBaslikHtml}
                ${sekmelerHtml}
                <div style="background: rgba(9, 20, 40, 0.7); border: 1px solid var(--border-color); border-radius: 8px; padding: 25px;">
                    <h3 style="color:#ffffff; text-align:center; margin-top:0;">${baslikTxt}</h3>
                    ${yetersizVeriVarMi ? `<div style="text-align:center; color:#f85149; font-weight:bold; margin-bottom:20px;">⚠️ Belirtilen periyotta 5 farklı oyuncu verisi bulunamadı.</div>` : ''}
                    <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-top:20px;">
                        ${htmlKutu}
                    </div>
                </div>
            </div>`;
        }

        const mg = {};
        temelVeriler.forEach(v => {
            if (!mg[v.mac_id]) mg[v.mac_id] = [];
            mg[v.mac_id].push(v);
        });

        let filtrelenmisMaclar = [];
        let tabloBasligi = "";

        if (window.aktifSinerjiBoyutu === "alt_koridor") {
            tabloBasligi = "En İyi Alt Koridor İkilileri (Nişancı + Destek)";
            Object.values(mg).forEach(grup => {
                let bottomList = grup.filter(p => p.pozisyon === "BOTTOM");
                let utilityList = grup.filter(p => p.pozisyon === "UTILITY");
                if (bottomList.length > 0 && utilityList.length > 0) filtrelenmisMaclar.push([bottomList[0], utilityList[0]]);
            });
        } else {
            let hedefBoyut = parseInt(window.aktifSinerjiBoyutu);
            if (hedefBoyut === 3) {
                tabloBasligi = `En Çok Birlikte Oynayan 3'lü Çekirdek Kadrolar`;
            } else {
                tabloBasligi = `En Çok Birlikte Oynayan 5'li Ekipler (Tümü)`;
            }

            Object.values(mg).forEach(grup => {
                let n = grup.length;
                if (hedefBoyut === 5 && (n === 4 || n === 5)) {
                    filtrelenmisMaclar.push(grup);
                } else if (hedefBoyut === 3 && n === 3) {
                    filtrelenmisMaclar.push(grup);
                }
            });
        }

        if (window.aktifSinerjiOyuncular && window.aktifSinerjiOyuncular.length > 0) {
            filtrelenmisMaclar = filtrelenmisMaclar.filter(grup => {
                return window.aktifSinerjiOyuncular.every(secili =>
                    grup.some(p => p.oyuncu && p.oyuncu.trim().toLowerCase() === secili.trim().toLowerCase())
                );
            });
        }

        let kompIstatistik = {};
        filtrelenmisMaclar.forEach(grup => {
            let sortedIsimler = grup.map(o => o.oyuncu).sort();
            let ekipIsmi = sortedIsimler.join(" + ");
            if (window.aktifSinerjiBoyutu === "alt_koridor") {
                let rSiralama = { "TOP": 1, "JUNGLE": 2, "MIDDLE": 3, "BOTTOM": 4, "UTILITY": 5 };
                ekipIsmi = grup.map(o => `${o.oyuncu}`).sort((a, b) => (rSiralama[a.pozisyon] || 99) - (rSiralama[b.pozisyon] || 99)).join(" + ");
            }

            if (!kompIstatistik[ekipIsmi]) kompIstatistik[ekipIsmi] = {
                mac: 0, zafer: 0, tk: 0, td: 0, ta: 0, t_hasar: 0, t_sifa: 0, t_cc: 0, t_gorus: 0, t_adc_cs_farki: 0, orjinal_isimler: ekipIsmi, formasyonlar: new Set()
            };

            kompIstatistik[ekipIsmi].mac++;
            if (grup[0].sonuc === "Zafer" || grup[0].sonuc === "Galibiyet") kompIstatistik[ekipIsmi].zafer++;

            // 🎯 FORMASYON İMZASI ÇIKARICI: Hangi dizilimle oynadıklarını kaydeder
            let fImza = grup.map(p => `${p.oyuncu}:${p.pozisyon}`).sort().join("|");
            kompIstatistik[ekipIsmi].formasyonlar.add(fImza);

            grup.forEach(p => {
                kompIstatistik[ekipIsmi].tk += p.oldurme || 0;
                kompIstatistik[ekipIsmi].td += p.olum || 0;
                kompIstatistik[ekipIsmi].ta += p.asist || 0;
                kompIstatistik[ekipIsmi].t_gorus += p.gorus_skoru || 0;
                if (window.aktifSinerjiBoyutu === "alt_koridor" && p.pozisyon === "BOTTOM") kompIstatistik[ekipIsmi].t_adc_cs_farki += (p.koridor_minyon_farki || 0);
            });
        });

        let siraliKomplar = Object.entries(kompIstatistik).map(k => {
            let data = k[1];
            let n = data.mac;
            let p = data.zafer / n;
            let z = 1.96;
            
            // Mutlak Kazanma Güvenilirliği (Wilson Aralığı)
            let wilsonSkoru = (p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) / (1 + (z * z) / n);

            let kda = data.td === 0 ? (data.tk + data.ta) : ((data.tk + data.ta) / data.td);
            let ortGorus = data.t_gorus / data.mac;
            let ortAdcCsFarki = data.t_adc_cs_farki / data.mac;
            let csFarkiBonusu = window.aktifSinerjiBoyutu === "alt_koridor" ? (ortAdcCsFarki * 0.4) : 0;

            // 🎯 ROL ESNEKLİĞİ (FORMASYON) BONUSU
            let formasyonSayisi = data.formasyonlar.size;
            let esneklikBonusu = 0;
            // Alt koridor ikilisi için formasyon bonusu sayılmaz, 3'lü ve 5'lilerde geçerlidir.
            if (window.aktifSinerjiBoyutu !== "alt_koridor") {
                // Farklı rollerde oynamak risktir. Başarı korunuyorsa ödül devasadır.
                esneklikBonusu = (formasyonSayisi - 1) * (p >= 0.50 ? 7 : 2);
            }

            // Hacim (Maç Sayısı) çarpanını hafif bir destek olarak bırakıyoruz
            let hacimBonusu = Math.min(n * 0.5, 12); 

            let sp = (wilsonSkoru * 100) + (kda * 2) + (ortGorus * 0.1) + csFarkiBonusu + esneklikBonusu + hacimBonusu;

            let isimlerDizisi = k[0].split(" + ");
            let formatliGorselIsim = isimlerDizisi.map(isim => typeof guncelRiotID !== "undefined" ? (guncelRiotID[isim] || isim) : isim).join(` <span style='color:#8b949e'>+</span> `);

            return { isim: formatliGorselIsim, mac: data.mac, zafer: data.zafer, sp: sp, kda: kda, orjinal_isimler: data.orjinal_isimler };
        });

        siraliKomplar.sort((a, b) => {
            let aGecti = a.mac >= 3 ? 1 : 0;
            let bGecti = b.mac >= 3 ? 1 : 0;
            if (bGecti !== aGecti) return bGecti - aGecti;
            if (Math.abs(b.sp - a.sp) > 0.01) return b.sp - a.sp;
            return b.kda - a.kda;
        });

        let tabloSatirlari = siraliKomplar.map((komp, index) => {
            let wr = ((komp.zafer / komp.mac) * 100).toFixed(0);
            let spSkor = komp.sp.toFixed(0);
            let barRengi = wr >= 50 ? "#3fb950" : "#f85149";

            let hedef = window.aktifSinerjiBoyutu === "alt_koridor" ? 2 : parseInt(window.aktifSinerjiBoyutu);
            let isimlerDizisi = komp.orjinal_isimler.split(" + ");
            let gorselIsim = "";

            if (hedef === 2) {
                let b = typeof guncelRiotID !== "undefined" ? (guncelRiotID[isimlerDizisi[0]] || isimlerDizisi[0]) : isimlerDizisi[0];
                let s = typeof guncelRiotID !== "undefined" ? (guncelRiotID[isimlerDizisi[1]] || isimlerDizisi[1]) : isimlerDizisi[1];
                gorselIsim = `<span style="color:#ffb84d; font-weight:bold;">${b} <span style="font-size:0.8em; color:#fff;">(BOT)</span></span> <span style="color:#8b949e">+</span> <span style="color:#aee2ff; font-weight:bold;">${s} <span style="font-size:0.8em; color:#fff;">(SUP)</span></span>`;
            } else {
                gorselIsim = isimlerDizisi.map(i => typeof guncelRiotID !== "undefined" ? (guncelRiotID[i] || i) : i).join(` <span style='color:#8b949e'>+</span> `);
            }

            let formasyonHtml = "";
            let akordeonTr = "";
            let tiklamaEv = `onclick="window.sinerjiKadroSec('${komp.orjinal_isimler}')"`;

            // 🎯 FORMASYONLARI KUTUCUKLU DİZEN VE MAÇLARI AÇAN YAPI
            if (hedef !== 2) {
                let takimMaclari = filtrelenmisMaclar.filter(g => {
                    let sIsimler = g.map(o => o.oyuncu).sort();
                    let eIsim = sIsimler.join(" + ");
                    return eIsim === komp.orjinal_isimler;
                });
                let fmap = {};
                const rSira = { "TOP": 1, "JUNGLE": 2, "MIDDLE": 3, "BOTTOM": 4, "UTILITY": 5 };
                const rKisa = { "TOP": "TOP", "JUNGLE": "JNG", "MIDDLE": "MID", "BOTTOM": "BOT", "UTILITY": "SUP" };

                takimMaclari.forEach(grup => {
                    let sGrup = [...grup].sort((a, b) => rSira[a.pozisyon] - rSira[b.pozisyon]);

                    let fArr = sGrup.map(x => ({
                        oyunIci: typeof guncelRiotID !== "undefined" ? (guncelRiotID[x.oyuncu] || x.oyuncu) : x.oyuncu,
                        rol: rKisa[x.pozisyon] || x.pozisyon
                    }));

                    let fKey = JSON.stringify(fArr);
                    if (!fmap[fKey]) fmap[fKey] = { m: 0, z: 0 };
                    fmap[fKey].m++;
                    if (grup[0].sonuc === "Zafer" || grup[0].sonuc === "Galibiyet") fmap[fKey].z++;
                });

                Object.entries(fmap).sort((a, b) => b[1].m - a[1].m).forEach(f => {
                    let fw = ((f[1].z / f[1].m) * 100).toFixed(0);
                    let fc = fw >= 50 ? "#3fb950" : "#f85149";
                    let kadroArr = JSON.parse(f[0]);

                    let kutularHtml = kadroArr.map(k => `
                        <div style="background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 4px; font-size: 0.85em; white-space: nowrap;">
                            <span style="color: var(--hextech-blue); font-weight: bold;">${k.oyunIci}</span><span style="color: #8b949e;">: ${k.rol}</span>
                        </div>
                    `).join("");

                    let encodedJson = encodeURIComponent(f[0]);

                    // 🎯 FORMASYONA TIKLAYINCA O FORMASYONUN MAÇLARINI FİLTRELER
                    formasyonHtml += `
                    <div onclick="window.sinerjiKadroSec('${komp.orjinal_isimler}', '${encodedJson}')" style="display:flex; justify-content:space-between; align-items:center; padding:10px 15px; border-bottom:1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.5); border-radius:6px; margin-bottom:6px; cursor:pointer; border-left:3px solid ${fc}; transition: 0.2s;" onmouseover="this.style.background='rgba(88,166,255,0.1)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">
                        <div style="display:flex; gap:8px; flex-wrap:wrap; flex:1;">
                            ${kutularHtml}
                        </div>
                        <div style="font-size:0.9em; font-weight:bold; white-space:nowrap; margin-left:15px;">
                            <span style="color:#8b949e; margin-right:10px;">${f[1].m} Maç</span>
                            <span style="color:${fc};">%${fw} WR</span>
                        </div>
                    </div>`;
                });

                tiklamaEv = `onclick="let p=document.getElementById('s-detay-${index}'); p.style.display=p.style.display==='none'?'table-row':'none';"`;

                akordeonTr = `
                <tr id="s-detay-${index}" style="display:none; background: rgba(9, 20, 40, 0.95);">
                    <td colspan="4" style="padding:20px 25px; border-bottom: 2px solid var(--border-color);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <div style="font-size:0.85em; color:#8b949e; text-transform:uppercase; font-weight:bold; letter-spacing: 1px;">Kadro Formasyonları (Dizilişler)</div>
                        </div>
                        <div style="display:flex; flex-direction:column;">
                            ${formasyonHtml}
                        </div>
                    </td>
                </tr>`;
            }

            return `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: 0.2s ease;" ${tiklamaEv} onmouseover="this.style.background='rgba(88,166,255,0.1)'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 15px 10px; color:#8b949e; font-weight:bold;">#${index + 1}</td>
                    <td style="padding: 15px 10px; font-size:0.95em;">${gorselIsim}</td>
                    <td style="padding: 15px 10px; color:#8b949e; font-weight:bold;">${komp.mac} Maç</td>
                    <td style="padding: 15px 10px; width: 250px;">
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:5px;">
                            <span style="color: ${barRengi}; font-weight: bold;">%${wr}</span>
                            <span style="background:rgba(210, 168, 255, 0.15); border:1px solid #d2a8ff; color:#d2a8ff; padding:2px 8px; border-radius:6px; font-size:0.85em; font-weight:bold;">SP: ${spSkor}</span>
                        </div>
                        <div style="width:100%; height:6px; background:#111; border-radius:3px; overflow:hidden;">
                            <div style="width: ${wr}%; height:100%; background-color: ${barRengi};"></div>
                        </div>
                    </td>
                </tr>
                ${akordeonTr}
            `;
        }).join("");

        if (siraliKomplar.length === 0) {
            tabloSatirlari = `<tr><td colspan="4" style="text-align:center; padding: 30px; font-size:1.1em; color:#f85149;">Seçili kriterler için yeterli maç kaydı bulunamadı.</td></tr>`;
        }

        return `
        <div style="max-width: 1350px; margin: 0 auto; color: var(--text-light); padding-bottom: 30px;">
            ${anaBaslikHtml}
            ${sekmelerHtml}
            ${ciplerHtml}
            ${bilgiKutusuHtml}

            <div id="sinerji-ana-tablo">
                <div style="background: rgba(9, 20, 40, 0.7); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); overflow:hidden;">
                    <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2);">
                        <h3 style="color:#ffffff; margin:0; display:flex; align-items:center; gap:10px;">${window.aktifSinerjiBoyutu === "alt_koridor" ? "🏹" : "🌟"} ${tabloBasligi}</h3>
                    </div>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; text-align: left; border-collapse: collapse; min-width: 700px;">
                            <thead>
                                <tr style="color: #8b949e; font-size: 0.9em; border-bottom: 2px solid var(--border-color); background: rgba(0,0,0,0.4);">
                                    <th style="padding: 15px 10px;">Sıra</th>
                                    <th style="padding: 15px 10px;">Ekip Kadrosu</th>
                                    <th style="padding: 15px 10px;">Oyun Sayısı</th>
                                    <th style="padding: 15px 10px;">Kazanma Oranı <span style="font-weight:normal; color:#d2a8ff;">(Sinerji Puanı)</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tabloSatirlari}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div id="sinerji-mac-alani" style="display:none; margin-top:20px;"></div>
        </div>`;
    },
    cizUzmanlik: function () {
        // Veritabanında oynanmış tüm benzersiz şampiyonları bul ve alfabetik sırala
        let islenecekVeri = window.GuncelDurum.veriyiFiltrele(Sistem.veriler);
        let oynananSampiyonlar = [...new Set(islenecekVeri.map(m => m.sampiyon).filter(Boolean))].sort((a, b) => {
            let isimA = Yardimci.formatSampiyon(a).toLowerCase();
            let isimB = Yardimci.formatSampiyon(b).toLowerCase();
            return isimA.localeCompare(isimB, 'tr');
        });

        let seceneklerHtml = oynananSampiyonlar.map(s =>
            `<option value="${s}">${Yardimci.formatSampiyon(s)}</option>`
        ).join("");

        return `
        <div id="arayuz-sampiyon" style="max-width: 1200px; margin: 0 auto; color: var(--text-light); padding-bottom: 40px;">
            <h1 style="color: var(--text-light); border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0; text-align:center;">🏆 Şampiyon Uzmanları <span style="font-size:0.5em; color:var(--hextech-gold);">[${window.GuncelDurum.sezon}]</span></h1>
            
            <div style="margin:0 auto 20px auto; padding:0 15px;">
                <div style="background: rgba(255, 0, 255, 0.08); border: 1px solid rgba(255, 0, 255, 0.3); border-radius: 8px; padding: 12px 20px; font-size: 0.9em; color: #8b949e; text-align: left; line-height: 1.6;">
                    <b style="color: #ff00ff;">ℹ️ Uzmanlık Puanı (UP) Nedir?</b><br>
                    Sistem, oyuncunun o şampiyonla kazanma oranını ilkel hesaplar yerine <b>Wilson Güven Aralığı</b> ve <b>3 Maç Kalifikasyon Barajı</b> ile dengeleyerek 1-2 maçlık tesadüfi başarıları tamamen ezer. Bu katı matematiksel temele; <b>KDA</b>, <b>Dakika Başına Minyon (CS/min)</b>, <b>Erken Oyun Dominasyonu</b> ve genel katkı gibi derin veriler eklenir. Şampiyonu şansa değil, ne kadar gerçek bir ustalıkla oynadığınızı ölçen mutlak puandır.
                </div>
            </div>

            <div class="sampiyon-secici-kutu" style="text-align: center; margin-bottom: 30px;">
                <select id="sampiyon-dropdown" class="hex-select" style="width: auto; min-width: 250px; padding: 10px 40px 10px 15px; font-size: 1.05em; background: rgba(9,20,40,0.8); color: #fff; border: 1px solid var(--hextech-gold); border-radius: 6px; display: inline-block;" onchange="window.uzmanlikKartlariniCiz(this.value)">
                    <option value="">-- Şampiyon Seç --</option>
                    ${seceneklerHtml}
                </select>
            </div>
            
            <div id="sampiyon-veriler">
                <div style="text-align:center; color:#8b949e; margin-top:50px; font-size:1.1em;">
                    Analizi başlatmak için yukarıdan bir şampiyon seçin.
                </div>
            </div>
        </div>`;
    },
    cizEsyaBilgisi: function () {
        let yama = typeof RiotCDN !== 'undefined' ? RiotCDN.surum : "16.12.1";
        return `
        <div style="max-width: 1350px; margin: 0 auto; color: var(--text-light); padding-bottom: 40px;">
            <h1 style="color: var(--text-light); border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">⚔️ Eşya Bilgisi & Simülatör</h1>
            <div style="display: flex; gap: 10px; margin-bottom: 30px; justify-content: center;">
                <button class="btn-hex taktik aktif" id="btn-esya-sim" onclick="window.esyaSekmeDegistir('simulator')" style="padding: 10px 25px; font-size: 1.1em;">🛠️ İnteraktif Simülatör</button>
                <button class="btn-hex taktik" id="btn-esya-reh" onclick="window.esyaSekmeDegistir('rehber')" style="padding: 10px 25px; font-size: 1.1em;">📚 Meta Rehberi</button>
            </div>
            <div id="esya-sekme-simulator">
                <div style="background: rgba(9, 20, 40, 0.7); border: 1px solid var(--accent-color); border-radius: 12px; padding: 25px; margin: 30px auto; box-shadow: 0 0 30px rgba(88, 166, 255, 0.15);">
                    <h3 style="color: #ffffff; text-align: center; margin-top: 0; margin-bottom: 10px; font-size: 1.4em; letter-spacing: 1px;">🛠️ İnteraktif Eşya Dizilimi Simülatörü</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; align-items: flex-start;">
                        <div style="background: rgba(0,0,0,0.4); padding: 20px; border-radius: 10px; border: 1px dashed var(--border-color); display: flex; flex-direction: column; align-items: center;">
                            <div style="color: #8b949e; font-size: 0.85em; text-transform: uppercase; margin-bottom: 15px; font-weight: bold;">Envanter Slotları</div>
                            <div id="sim-envanter" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                                <div class="sim-slot" onclick="window.simEsyaCikar(0)" style="width: 50px; height: 50px; background: rgba(255,255,255,0.05); border: 1px dashed var(--border-color); border-radius: 6px; cursor: pointer;"></div>
                                <div class="sim-slot" onclick="window.simEsyaCikar(1)" style="width: 50px; height: 50px; background: rgba(255,255,255,0.05); border: 1px dashed var(--border-color); border-radius: 6px; cursor: pointer;"></div>
                                <div class="sim-slot" onclick="window.simEsyaCikar(2)" style="width: 50px; height: 50px; background: rgba(255,255,255,0.05); border: 1px dashed var(--border-color); border-radius: 6px; cursor: pointer;"></div>
                                <div class="sim-slot" onclick="window.simEsyaCikar(3)" style="width: 50px; height: 50px; background: rgba(255,255,255,0.05); border: 1px dashed var(--border-color); border-radius: 6px; cursor: pointer;"></div>
                                <div class="sim-slot" onclick="window.simEsyaCikar(4)" style="width: 50px; height: 50px; background: rgba(255,255,255,0.05); border: 1px dashed var(--border-color); border-radius: 6px; cursor: pointer;"></div>
                                <div class="sim-slot" onclick="window.simEsyaCikar(5)" style="width: 50px; height: 50px; background: rgba(255,255,255,0.05); border: 1px dashed var(--border-color); border-radius: 6px; cursor: pointer;"></div>
                            </div>
                            <button onclick="window.simSifirla()" class="btn-hex" style="background: rgba(248, 81, 73, 0.2); border-color: #f85149; color: #f85149; margin-top: 20px; padding: 6px 15px; font-size: 0.9em;">🗑️ Dizilimi Temizle</button>
                        </div>
                        <div style="flex: 1; min-width: 300px; background: rgba(0,0,0,0.4); padding: 20px; border-radius: 10px; border: 1px solid var(--border-color);">
                            <div style="color: var(--accent-color); font-size: 0.9em; text-transform: uppercase; margin-bottom: 15px; text-align: center; font-weight: bold;">Kazanılan Toplam İstatistikler</div>
                            <div id="sim-statlar" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.95em;"></div>
                            <div id="sim-altin" style="margin-top: 20px; text-align: center; color: var(--hextech-gold); font-weight: bold; font-size: 1.3em; border-top: 1px dashed var(--border-color); padding-top: 15px;">Toplam Maliyet: 0 🪙</div>
                        </div>
                    </div>
                </div>

                <h3 style="color: var(--accent-color); text-align: center; margin-top: 50px; margin-bottom: 10px; border-bottom: 1px dashed var(--border-color); padding-bottom: 10px; font-size: 1.3em;">Tüm Aktif Efsanevi Eşya Kütüphanesi</h3>
                <h4 style="color: #ffb84d; margin-top: 20px; border-left: 4px solid #ffb84d; padding-left: 10px;">⚔️ Dövüşçü</h4>
                <div id="grid-dovuscu" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;"></div>
                <h4 style="color: #ff4500; margin-top: 20px; border-left: 4px solid #ff4500; padding-left: 10px;">🪓 Suikastçı</h4>
                <div id="grid-suikastci" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;"></div>
                <h4 style="color: #9ea1f9; margin-top: 20px; border-left: 4px solid #9ea1f9; padding-left: 10px;">🔮 Büyücü</h4>
                <div id="grid-buyucu" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;"></div>
                <h4 style="color: #f35b5a; margin-top: 20px; border-left: 4px solid #f35b5a; padding-left: 10px;">🏹 Nişancı</h4>
                <div id="grid-nisanci" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;"></div>
                <h4 style="color: #a1d586; margin-top: 20px; border-left: 4px solid #a1d586; padding-left: 10px;">🛡️ Tank</h4>
                <div id="grid-tank" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;"></div>
                <h4 style="color: #0ac8b9; margin-top: 20px; border-left: 4px solid #0ac8b9; padding-left: 10px;">💚 Destek</h4>
                <div id="grid-destek" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;"></div>
                <h4 style="color: #aee2ff; margin-top: 20px; border-left: 4px solid #aee2ff; padding-left: 10px;">👟 Botlar</h4>
                <div id="grid-botlar" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;"></div>
            </div>
            <div id="esya-sekme-rehber" class="gizle">
                <h2 style="color: #ffffff; text-align: center; margin-bottom: 30px;">Kritik Eşya Dizilimleri & Meta Rehberi</h2>

                <div class="bilgi-karti" style="background: rgba(9, 20, 40, 0.7); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                    <div style="display:flex; flex-direction:row; gap:10px; margin-bottom: 15px;">
                        <img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/champion/Yasuo.png" alt="Yasuo" style="width:60px; height:60px; border-radius: 4px; border: 1px solid var(--hextech-gold);">
                        <img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/champion/Yone.png" alt="Yone" style="width:60px; height:60px; border-radius: 4px; border: 1px solid var(--hextech-gold);">
                    </div>
                    <div class="bilgi-icerik" style="flex:1;">
                        <h3 style="color: var(--accent-color); margin-top: 0; font-size:1.4em;">Yasuo & Yone</h3>
                        <p style="color: var(--text-main); line-height: 1.5; margin-bottom: 20px;">Her şampiyonun kendi doğasına ve o anki metaya uygun şekilde 3 tane çekirdek eşyası (core item) olduğundan diğer işlevsel tipli eşyaları (Cıva Yatağan, Koruyucu Melek, Banshee'nin Duvağı, tank eşyaları, vs) almadan önce bu çekirdek eşyalarının bitirilmesi gerekir.</p>
                        
                        <p style="color: var(--text-light); font-weight: bold; margin-bottom: 15px;">Yasuo ve Yone için şu anda bilinen 4 tane eşya dizilimi bulunur.</p>

                        <h4 style="color: #ffd700; margin-bottom: 10px;">Genel Stabil Dizilim: Dövüşçü + Kritik Aktarmalı Eşya Dizilimi</h4>
                        <ul style="color: var(--text-light); line-height: 1.6; margin-bottom: 20px;">
                            <li><b style="color:var(--hextech-gold);">1. Eşya:</b> Bir isabet etkili dövüşçü eşyası. Karşıda kırılganlar varsa <b>Kraken Katili</b>, tanklar varsa <b>Mahvolmuş Kralın Kılıcı</b>.</li>
                            <li><b style="color:var(--hextech-gold);">2. Eşya:</b> Ani patlatma hasarlarından korunmak ve hayatta kalmak için <b>Ölümsüz Kalkanyay</b> vazgeçilmezdir.</li>
                            <li><b style="color:var(--hextech-gold);">3. Eşya:</b> Zırh delme kritik eşyası (<b>Dominik Efendinin Hürmetleri</b> veya <b>Fani Hatıratı</b>) veya saf hasar için <b>Ebedi Kılıç</b>.</li>
                        </ul>

                        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px dashed var(--border-color); margin-bottom: 25px;">
                            <p style="color: var(--text-light); font-weight: bold; margin-top: 0;">İlk iki dizilimin örnek tam halleri şu şekildedir:</p>
                            
                            <div style="margin-bottom: 15px;">
                                <div style="color: #0ac8b9; font-weight: bold; font-size: 0.9em; margin-bottom: 5px;">Karşısı Kırılgan Ağırlıklıysa</div>
                                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                    <div class="esya-kapsayici esya-kart" data-item-id="6672"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/6672.png" style="width:35px; height:35px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div class="esya-kapsayici esya-kart" data-item-id="6673"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/6673.png" style="width:35px; height:35px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div class="esya-kapsayici esya-kart" data-item-id="3031"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3031.png" style="width:35px; height:35px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div class="esya-kapsayici esya-kart" data-item-id="6333"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/6333.png" style="width:35px; height:35px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div style="display:flex; align-items:center; gap:2px; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:6px;">
                                        <div class="esya-kapsayici esya-kart" data-item-id="2517"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/2517.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3026"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3026.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3139"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3139.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    </div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div style="display:flex; align-items:center; gap:2px; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:6px;">
                                        <div class="esya-kapsayici esya-kart" data-item-id="3006"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3006.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3172"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3172.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div style="color: #0ac8b9; font-weight: bold; font-size: 0.9em; margin-bottom: 5px;">Karşısı Tank Ağırlıklıysa</div>
                                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                    <div class="esya-kapsayici esya-kart" data-item-id="3153"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3153.png" style="width:35px; height:35px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div class="esya-kapsayici esya-kart" data-item-id="6673"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/6673.png" style="width:35px; height:35px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div style="display:flex; align-items:center; gap:2px; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:6px;">
                                        <div class="esya-kapsayici esya-kart" data-item-id="3036"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3036.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3031"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3031.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    </div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div class="esya-kapsayici esya-kart" data-item-id="6333"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/6333.png" style="width:35px; height:35px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div style="display:flex; align-items:center; gap:2px; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:6px;">
                                        <div class="esya-kapsayici esya-kart" data-item-id="2517"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/2517.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3026"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3026.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3139"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3139.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    </div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div style="display:flex; align-items:center; gap:2px; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:6px;">
                                        <div class="esya-kapsayici esya-kart" data-item-id="3006"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3006.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3172"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3172.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h4 style="color: #f85149; margin-bottom: 10px;">Yüksek Risk Yüksek Taşıma Potansiyeli Dizilimleri: 2 Eşya Kritik + Hemen Defansife Geçen Eşya Dizilimi</h4>
                        <ul style="color: var(--text-light); line-height: 1.6; margin-bottom: 20px;">
                            <li><b style="color:var(--hextech-gold);">1. Eşya:</b> 1300 Altın ile üsse dönülürse direkt olarak AMK kılıcı alınıp <b>Yun Tal Yabanoklarına</b> gitmek hem iyi bir saldırı hızı hem de 2. eşyada kritik şansını %100 yapmaya yarar.</li>
                            <li><b style="color:var(--hextech-gold);">2. Eşya:</b> %90 oranında <b>Ebedi Kılıç</b> alınıp kritik şansı %100 yapılmalıdır. Özel durumlarda bir zırh delme kritik eşyası (<b>Dominik Efendinin Hürmetleri</b> veya <b>Fani Hatıratı</b>) alınabilir.</li>
                            <li><b style="color:var(--hextech-gold);">3. Eşya:</b> Bu dizilimlerin avantajı 3. eşyadan itibaren defansif eşyaya geçişi sağlamasıdır.</li>
                        </ul>

                        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px dashed var(--border-color); margin-bottom: 25px;">
                            <p style="color: var(--text-light); font-weight: bold; margin-top: 0;">Kalan iki dizilimin örnek tam halleri şu şekildedir:</p>
                            
                            <div style="margin-bottom: 15px;">
                                <div style="color: #ff9800; font-weight: bold; font-size: 0.9em; margin-bottom: 5px;">1300 Altın İle Üsse Dönülebilirse</div>
                                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                    <div class="esya-kapsayici esya-kart" data-item-id="3032"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3032.png" style="width:35px; height:35px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div style="display:flex; align-items:center; gap:2px; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:6px;">
                                        <div class="esya-kapsayici esya-kart" data-item-id="3031"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3031.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3036"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3036.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    </div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div class="esya-kapsayici esya-kart" data-item-id="6333"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/6333.png" style="width:35px; height:35px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div style="display:flex; align-items:center; gap:2px; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:6px;">
                                        <div class="esya-kapsayici esya-kart" data-item-id="2517"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/2517.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3026"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3026.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3139"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3139.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3053"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3053.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="6673"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/6673.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    </div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div style="display:flex; align-items:center; gap:2px; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:6px;">
                                        <div class="esya-kapsayici esya-kart" data-item-id="3006"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3006.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3172"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3172.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div style="color: #ff9800; font-weight: bold; font-size: 0.9em; margin-bottom: 5px;">Karşıda Kırılgan Karakterler Varsa ve 1300 Altın İle Üsse Dönülemezse</div>
                                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                    <div class="esya-kapsayici esya-kart" data-item-id="3046"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3046.png" style="width:35px; height:35px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div style="display:flex; align-items:center; gap:2px; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:6px;">
                                        <div class="esya-kapsayici esya-kart" data-item-id="3031"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3031.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3036"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3036.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    </div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div class="esya-kapsayici esya-kart" data-item-id="6333"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/6333.png" style="width:35px; height:35px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div style="display:flex; align-items:center; gap:2px; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:6px;">
                                        <div class="esya-kapsayici esya-kart" data-item-id="2517"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/2517.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3026"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3026.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3139"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3139.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3053"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3053.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="6673"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/6673.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    </div>
                                    <span style="color:#8b949e;">➔</span>
                                    <div style="display:flex; align-items:center; gap:2px; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:6px;">
                                        <div class="esya-kapsayici esya-kart" data-item-id="3047"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3047.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3111"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3111.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3174"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3174.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div><span style="color:#8b949e;">/</span>
                                        <div class="esya-kapsayici esya-kart" data-item-id="3173"><img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/3173.png" style="width:30px; height:30px; border-radius:4px; border:1px solid var(--border-color);"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; gap: 15px; margin-top: 20px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; border-left: 4px solid var(--hextech-blue);">
                            <div style="color: var(--text-light); font-size: 0.9em; flex: 1; line-height: 1.5;">
                                İlk iki eşya dizilimi için önerilen anahtar rün &nbsp <b style="color: #ffd700;">Ölümcül Tempo</b> 
                                <div class="esya-kapsayici" style="display:inline-block; vertical-align:middle; margin:0 5px;"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png" class="tetikleyici-run" data-run-id="8008" style="width:24px !important; height:24px !important; border-radius:50%; box-shadow:none !important; filter:none !important; background:transparent !important; object-fit:contain;"></div>
                                olmakla beraber kalan iki dizilim için önerilen anahtar rün <b style="color: #ffd700;">Yenilmez</b>
                                <div class="esya-kapsayici" style="display:inline-block; vertical-align:middle; margin:0 5px;"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Conqueror/Conqueror.png" class="tetikleyici-run" data-run-id="8010" style="width:24px !important; height:24px !important; border-radius:50%; box-shadow:none !important; filter:none !important; background:transparent !important; object-fit:contain;"></div>'dir.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },
    cizRunDizilimi: function () {
        return `
        <div id="arayuz-run" style="max-width: 1200px; margin: 0 auto; padding-bottom: 40px;">
            <h1 style="color: var(--text-light); border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">🔮 Rün Dizilimi Simülatörü</h1>
            <p style="text-align: center; color: #8b949e; margin-bottom: 30px;">Tıklayarak ağaçlardaki rünleri seçip kombine edebilirsiniz. Aynı satırdan sadece biri seçilebilir.</p>

            <div style="display:flex; gap:20px; flex-wrap:wrap; justify-content:center; margin-bottom:20px;">
                <div class="run-agaci" style="background: rgba(9, 20, 40, 0.7); border: 1px solid #cda869; border-radius: 8px; padding: 15px; width: 220px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                    <div class="run-baslik" style="color:#cda869; font-weight: bold; font-size: 1.1em; text-align: center; border-bottom: 1px solid rgba(205, 168, 105, 0.2); padding-bottom: 8px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7201_precision.png" style="width:25px;">İsabet
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 12px;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png" class="run-ikon tetikleyici-run r-isabet-1" onclick="window.toggleRun(event, 'r-isabet-1')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png" class="run-ikon tetikleyici-run r-isabet-1" onclick="window.toggleRun(event, 'r-isabet-1')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/FleetFootwork/FleetFootwork.png" class="run-ikon tetikleyici-run r-isabet-1" onclick="window.toggleRun(event, 'r-isabet-1')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Conqueror/Conqueror.png" class="run-ikon tetikleyici-run r-isabet-1" onclick="window.toggleRun(event, 'r-isabet-1')"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 12px;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/AbsorbLife/AbsorbLife.png" class="run-ikon tetikleyici-run r-isabet-2" onclick="window.toggleRun(event, 'r-isabet-2')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Triumph.png" class="run-ikon tetikleyici-run r-isabet-2" onclick="window.toggleRun(event, 'r-isabet-2')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/PresenceOfMind/PresenceOfMind.png" class="run-ikon tetikleyici-run r-isabet-2" onclick="window.toggleRun(event, 'r-isabet-2')"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 12px;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LegendAlacrity/LegendAlacrity.png" class="run-ikon tetikleyici-run r-isabet-3" onclick="window.toggleRun(event, 'r-isabet-3')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LegendHaste/LegendHaste.png" class="run-ikon tetikleyici-run r-isabet-3" onclick="window.toggleRun(event, 'r-isabet-3')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LegendBloodline/LegendBloodline.png" class="run-ikon tetikleyici-run r-isabet-3" onclick="window.toggleRun(event, 'r-isabet-3')"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/CoupDeGrace/CoupDeGrace.png" class="run-ikon tetikleyici-run r-isabet-4" onclick="window.toggleRun(event, 'r-isabet-4')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/CutDown/CutDown.png" class="run-ikon tetikleyici-run r-isabet-4" onclick="window.toggleRun(event, 'r-isabet-4')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/LastStand/LastStand.png" class="run-ikon tetikleyici-run r-isabet-4" onclick="window.toggleRun(event, 'r-isabet-4')"></div>
                    </div>
                </div>

                <div class="run-agaci" style="background: rgba(9, 20, 40, 0.7); border: 1px solid #ca3e3f; border-radius: 8px; padding: 15px; width: 220px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                    <div class="run-baslik" style="color:#ca3e3f; font-weight: bold; font-size: 1.1em; text-align: center; border-bottom: 1px solid rgba(202, 62, 63, 0.2); padding-bottom: 8px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7200_domination.png" style="width:25px;">Hakimiyet
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/Electrocute/Electrocute.png" class="run-ikon tetikleyici-run r-haki-1" onclick="window.toggleRun(event, 'r-haki-1')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/DarkHarvest/DarkHarvest.png" class="run-ikon tetikleyici-run r-haki-1" onclick="window.toggleRun(event, 'r-haki-1')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/HailOfBlades/HailOfBlades.png" class="run-ikon tetikleyici-run r-haki-1" onclick="window.toggleRun(event, 'r-haki-1')"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/CheapShot/CheapShot.png" class="run-ikon tetikleyici-run r-haki-2" onclick="window.toggleRun(event, 'r-haki-2')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/TasteOfBlood/GreenTerror_TasteOfBlood.png" class="run-ikon tetikleyici-run r-haki-2" onclick="window.toggleRun(event, 'r-haki-2')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/SuddenImpact/SuddenImpact.png" class="run-ikon tetikleyici-run r-haki-2" onclick="window.toggleRun(event, 'r-haki-2')"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/SixthSense/SixthSense.png" class="run-ikon tetikleyici-run r-haki-3" onclick="window.toggleRun(event, 'r-haki-3')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/GrislyMementos/GrislyMementos.png" class="run-ikon tetikleyici-run r-haki-3" onclick="window.toggleRun(event, 'r-haki-3')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/DeepWard/DeepWard.png" class="run-ikon tetikleyici-run r-haki-3" onclick="window.toggleRun(event, 'r-haki-3')"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/TreasureHunter/TreasureHunter.png" class="run-ikon tetikleyici-run r-haki-4" onclick="window.toggleRun(event, 'r-haki-4')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/RelentlessHunter/RelentlessHunter.png" class="run-ikon tetikleyici-run r-haki-4" onclick="window.toggleRun(event, 'r-haki-4')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/UltimateHunter/UltimateHunter.png" class="run-ikon tetikleyici-run r-haki-4" onclick="window.toggleRun(event, 'r-haki-4')"></div>
                    </div>
                </div>

                <div class="run-agaci" style="background: rgba(9, 20, 40, 0.7); border: 1px solid #9ea1f9; border-radius: 8px; padding: 15px; width: 220px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                    <div class="run-baslik" style="color:#9ea1f9; font-weight: bold; font-size: 1.1em; text-align: center; border-bottom: 1px solid rgba(158, 161, 249, 0.2); padding-bottom: 8px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7202_sorcery.png" style="width:25px;">Büyücülük
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/SummonAery/SummonAery.png" class="run-ikon tetikleyici-run r-buyu-1" onclick="window.toggleRun(event, 'r-buyu-1')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png" class="run-ikon tetikleyici-run r-buyu-1" onclick="window.toggleRun(event, 'r-buyu-1')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/PhaseRush/StormraidersSurgeRuneIcon2.png" class="run-ikon tetikleyici-run r-buyu-1" onclick="window.toggleRun(event, 'r-buyu-1')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/DeathfireTouch/DEATHFIRE_TOUCH_KEYSTONE.png" class="run-ikon tetikleyici-run r-buyu-1" onclick="window.toggleRun(event, 'r-buyu-1')"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/NullifyingOrb/Axiom_Arcanist.png" class="run-ikon tetikleyici-run r-buyu-2" onclick="window.toggleRun(event, 'r-buyu-2')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/ManaflowBand/ManaflowBand.png" class="run-ikon tetikleyici-run r-buyu-2" onclick="window.toggleRun(event, 'r-buyu-2')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/NimbusCloak/6361.png" class="run-ikon tetikleyici-run r-buyu-2" onclick="window.toggleRun(event, 'r-buyu-2')"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/Transcendence/Transcendence.png" class="run-ikon tetikleyici-run r-buyu-3" onclick="window.toggleRun(event, 'r-buyu-3')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/Celerity/CelerityTemp.png" class="run-ikon tetikleyici-run r-buyu-3" onclick="window.toggleRun(event, 'r-buyu-3')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/AbsoluteFocus/AbsoluteFocus.png" class="run-ikon tetikleyici-run r-buyu-3" onclick="window.toggleRun(event, 'r-buyu-3')"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/Scorch/Scorch.png" class="run-ikon tetikleyici-run r-buyu-4" onclick="window.toggleRun(event, 'r-buyu-4')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/Waterwalking/Waterwalking.png" class="run-ikon tetikleyici-run r-buyu-4" onclick="window.toggleRun(event, 'r-buyu-4')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/GatheringStorm/GatheringStorm.png" class="run-ikon tetikleyici-run r-buyu-4" onclick="window.toggleRun(event, 'r-buyu-4')"></div>
                    </div>
                </div>

                <div class="run-agaci" style="background: rgba(9, 20, 40, 0.7); border: 1px solid #a1d586; border-radius: 8px; padding: 15px; width: 220px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                    <div class="run-baslik" style="color:#a1d586; font-weight: bold; font-size: 1.1em; text-align: center; border-bottom: 1px solid rgba(161, 213, 134, 0.2); padding-bottom: 8px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7204_resolve.png" style="width:25px;">Azim
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png" class="run-ikon tetikleyici-run r-azim-1" onclick="window.toggleRun(event, 'r-azim-1')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/VeteranAftershock/VeteranAftershock.png" class="run-ikon tetikleyici-run r-azim-1" onclick="window.toggleRun(event, 'r-azim-1')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Guardian/Guardian.png" class="run-ikon tetikleyici-run r-azim-1" onclick="window.toggleRun(event, 'r-azim-1')"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Demolish/Demolish.png" class="run-ikon tetikleyici-run r-azim-2" onclick="window.toggleRun(event, 'r-azim-2')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/FontOfLife/FontOfLife.png" class="run-ikon tetikleyici-run r-azim-2" onclick="window.toggleRun(event, 'r-azim-2')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/MirrorShell/MirrorShell.png" class="run-ikon tetikleyici-run r-azim-2" onclick="window.toggleRun(event, 'r-azim-2')"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Conditioning/Conditioning.png" class="run-ikon tetikleyici-run r-azim-3" onclick="window.toggleRun(event, 'r-azim-3')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/SecondWind/SecondWind.png" class="run-ikon tetikleyici-run r-azim-3" onclick="window.toggleRun(event, 'r-azim-3')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/BonePlating/BonePlating.png" class="run-ikon tetikleyici-run r-azim-3" onclick="window.toggleRun(event, 'r-azim-3')"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Overgrowth/Overgrowth.png" class="run-ikon tetikleyici-run r-azim-4" onclick="window.toggleRun(event, 'r-azim-4')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Revitalize/Revitalize.png" class="run-ikon tetikleyici-run r-azim-4" onclick="window.toggleRun(event, 'r-azim-4')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/Unflinching/Unflinching.png" class="run-ikon tetikleyici-run r-azim-4" onclick="window.toggleRun(event, 'r-azim-4')"></div>
                    </div>
                </div>

                <div class="run-agaci" style="background: rgba(9, 20, 40, 0.7); border: 1px solid #48b4ba; border-radius: 8px; padding: 15px; width: 220px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                    <div class="run-baslik" style="color:#48b4ba; font-weight: bold; font-size: 1.1em; text-align: center; border-bottom: 1px solid rgba(72, 180, 186, 0.2); padding-bottom: 8px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7203_whimsy.png" style="width:25px;">İlham
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/GlacialAugment/GlacialAugment.png" class="run-ikon tetikleyici-run r-ilham-1" onclick="window.toggleRun(event, 'r-ilham-1')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png" class="run-ikon tetikleyici-run r-ilham-1" onclick="window.toggleRun(event, 'r-ilham-1')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/FirstStrike/FirstStrike.png" class="run-ikon tetikleyici-run r-ilham-1" onclick="window.toggleRun(event, 'r-ilham-1')"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/HextechFlashtraption/HextechFlashtraption.png" class="run-ikon tetikleyici-run r-ilham-2" onclick="window.toggleRun(event, 'r-ilham-2')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/MagicalFootwear/MagicalFootwear.png" class="run-ikon tetikleyici-run r-ilham-2" onclick="window.toggleRun(event, 'r-ilham-2')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/CashBack/CashBack2.png" class="run-ikon tetikleyici-run r-ilham-2" onclick="window.toggleRun(event, 'r-ilham-2')"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/PerfectTiming/AlchemistCabinet.png" class="run-ikon tetikleyici-run r-ilham-3" onclick="window.toggleRun(event, 'r-ilham-3')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/TimeWarpTonic/TimeWarpTonic.png" class="run-ikon tetikleyici-run r-ilham-3" onclick="window.toggleRun(event, 'r-ilham-3')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/BiscuitDelivery/BiscuitDelivery.png" class="run-ikon tetikleyici-run r-ilham-3" onclick="window.toggleRun(event, 'r-ilham-3')"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around;">
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/CosmicInsight/CosmicInsight.png" class="run-ikon tetikleyici-run r-ilham-4" onclick="window.toggleRun(event, 'r-ilham-4')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/ApproachVelocity/ApproachVelocity.png" class="run-ikon tetikleyici-run r-ilham-4" onclick="window.toggleRun(event, 'r-ilham-4')"></div>
                        <div class="esya-kapsayici"><img src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/JackOfAllTrades/JackofAllTrades2.png" class="run-ikon tetikleyici-run r-ilham-4" onclick="window.toggleRun(event, 'r-ilham-4')"></div>
                    </div>
                </div>

                <div class="run-agaci" style="background: rgba(9, 20, 40, 0.7); border: 1px solid #ffffff; border-radius: 8px; padding: 15px; width: 150px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                    <div class="run-baslik" style="color:#ffffff; font-weight: bold; font-size: 1.1em; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 8px; margin-bottom: 15px;">
                        İstatistikler
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 15px; margin-top:30px;">
                        <div class="esya-kapsayici"><img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsadaptiveforceicon.png" class="run-ikon tetikleyici-run u-1" onclick="window.toggleRun(event, 'u-1')"></div>
                        <div class="esya-kapsayici"><img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsattackspeedicon.png" class="run-ikon tetikleyici-run u-1" onclick="window.toggleRun(event, 'u-1')"></div>
                        <div class="esya-kapsayici"><img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodscdrscalingicon.png" class="run-ikon tetikleyici-run u-1" onclick="window.toggleRun(event, 'u-1')"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                        <div class="esya-kapsayici"><img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsadaptiveforceicon.png" class="run-ikon tetikleyici-run u-2" onclick="window.toggleRun(event, 'u-2')"></div>
                        <div class="esya-kapsayici"><img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsmovementspeedicon.png" class="run-ikon tetikleyici-run u-2" onclick="window.toggleRun(event, 'u-2')"></div>
                        <div class="esya-kapsayici"><img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodshealthplusicon.png" class="run-ikon tetikleyici-run u-2" data-run-id="5011"></div>
                    </div>
                    <div class="run-satir" style="display: flex; justify-content: space-around;">
                    <div class="esya-kapsayici"><img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodshealthscalingicon.png" class="run-ikon tetikleyici-run u-3" data-run-id="5001"></div>
                    <div class="esya-kapsayici"><img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodstenacityicon.png" class="run-ikon tetikleyici-run u-3" data-run-id="5013"></div>
                    <div class="esya-kapsayici"><img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodshealthplusicon.png" class="run-ikon tetikleyici-run u-3" data-run-id="5011"></div>
                </div>
                </div>
            </div>
        </div>`;
    },
    cizKompozisyon: function () {
        return `
        <div style="max-width: 1100px; margin: 0 auto; color: var(--text-light);">
            <h1 style="color: var(--text-light); border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">🛡️ Şampiyonlar & Kompozisyonlar</h1>
            
            <div style="background: rgba(9, 20, 40, 0.7); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); margin-top: 20px;">
                <h2 style="color:var(--hextech-gold); border-bottom: 1px solid rgba(200, 170, 110, 0.2); padding-bottom: 10px; margin-top: 0; font-size: 1.4em;">
                    Kompozisyon Zekası ve Kontra Seçim (Counter Pick) Mantığı
                </h2>

                <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-top: 20px;">
                    <!-- Temel Taş Kağıt Makas Mantığı -->
                    <div style="flex: 1; min-width: 300px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); border-left: 4px solid #ffd700; border-radius: 8px; padding: 15px;">
                        <h3 style="color:#ffd700; margin-top:0; letter-spacing: 0.5px;">Döngüsel Sayaç Kuramı</h3>
                        <p style="color:var(--text-main); line-height: 1.5; font-size: 0.95em;">League of Legends'ta kompozisyonlar dev bir taş-kağıt-makas oyunudur. İstisnalar olsa da altın kural şudur:</p>
                        <ul style="color:var(--text-light); line-height: 1.8; margin-bottom: 0;">
                            <li><b>Suikastçılar 🗡️</b> &rarr; <i style="color:#ffb84d;">Nişancıları ve Büyücüleri</i> tekler.</li>
                            <li><b>Tanklar / Eziciler 🛡️</b> &rarr; <i style="color:#f85149;">Suikastçıların</i> hasarını soğurur ve onları ezer.</li>
                            <li><b>Sürekli Hasar (DPS/Nişancı) 🏹</b> &rarr; Uzun savaşlarda <i style="color:#a1d586;">Tankları</i> eritir.</li>
                            <li><b>Dürtme (Poke) 🪄</b> &rarr; Takım savaşından önce düşmanı yıpratır, ancak <i style="color:#aee2ff;">Ağır Engage (Sert Giriş)</i> komplarına karşı erir.</li>
                        </ul>
                    </div>

                    <!-- Rol Dağılımı ve Görevler -->
                    <div style="flex: 1; min-width: 300px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); border-left: 4px solid #a1d586; border-radius: 8px; padding: 15px;">
                        <h3 style="color:#a1d586; margin-top:0; letter-spacing: 0.5px;">Modern Rol Sinerjileri</h3>
                        <ul style="color:var(--text-light); line-height: 1.8; margin-bottom: 0;">
                            <li><b>Zayıf Taraf (Weakside) Üst Koridor:</b> Ormancının hiç yardıma gelmeyeceğini kabullenip, az kaynakla hayatta kalarak takıma CC/Tanklık sağlayan oyuncudur <span style="color:var(--text-main); font-size:0.9em;">(Örn: Ornn, Sion)</span>.</li>
                            <li><b>Güçlü Taraf (Strongside):</b> Tüm orman ve orta koridor baskınlarının odaklandığı, maçı taşıması beklenen koridordur. Bu koridor düşerse maç genellikle biter.</li>
                            <li><b>Wombo Combo:</b> Alan etkili (AoE) kitle kontrol yeteneklerinin art arda kullanılmasıdır <span style="color:var(--text-main); font-size:0.9em;">(Örn: Malphite Ultisi + Yasuo Ultisi + Orianna Ultisi)</span>. Rakibe tepki süresi tanımaz.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>`;
    },
    cizHarita: function () {
        // Taktik harita değişimi için global motor (Eğer daha önce tanımlanmadıysa)
        if (!window.haritaDegistir) {
            window.haritaDegistir = function (resimYolu, btnElemani) {
                let haritaImg = document.getElementById('aktif-taktik-haritasi');
                if (!haritaImg) return;

                haritaImg.style.opacity = 0;
                setTimeout(() => {
                    haritaImg.src = resimYolu;
                    haritaImg.style.opacity = 1;
                }, 150);

                // Buton aktiflik yönetimi
                document.querySelectorAll('.btn-hex.taktik').forEach(b => b.classList.remove('aktif'));
                btnElemani.classList.add('aktif');
            };
        }

        return `
        <div style="max-width: 1100px; margin: 0 auto; color: var(--text-light); padding-bottom: 30px;">
            <h1 style="color: var(--text-light); border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">🗺️ Makro Oyun: Zaman Çizelgesi ve Harita Rotasyonları</h1>
            
            <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
                <!-- Erken Oyun -->
                <div style="background: rgba(9, 20, 40, 0.7); border-left: 5px solid #a1d586; border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
                    <h3 style="color:#a1d586; margin-top:0; letter-spacing: 0.5px;">Aşama 1: Erken Oyun (Early Game) (0 - 15. Dakika)</h3>
                    <p style="color:var(--text-main); line-height: 1.6;">Bu evre <b>Koridor Aşaması (Laning Phase)</b> olarak bilinir. Odak noktası altın ve tecrübe kazanmak, kule barikatlarını (tower plates) almaktır. Kompozisyona göre değişse de genellikle erken oyunda koridorda üstünlük almak önemlidir.</p>
                    <div style="color:var(--text-light); font-size: 0.9em; margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 6px;">
                        <b style="color: #ffd700;">Anahtar Rotasyonlar:</b><br>
                        • <b>Hiçlik Kurtçukları (Grubs):</b> 8. dakikada doğar. Üst ve Orta koridorun önceliği (prio) varsa ormancıya yardım etmelidir. Takıma kalıcı kule itme gücü verir.<br>
                        • <b>İlk Ejder:</b> Alt koridor baskısı kurulduktan sonra alınmalıdır. Zamansız girildiğinde tempo düşürür.
                    </div>
                </div>

                <!-- Orta Oyun -->
                <div style="background: rgba(9, 20, 40, 0.7); border-left: 5px solid #0ac8b9; border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
                    <h3 style="color:#0ac8b9; margin-top:0; letter-spacing: 0.5px;">Aşama 2: Orta Oyun (Mid Game) (15 - 25. Dakika)</h3>
                    <p style="color:var(--text-main); line-height: 1.6;">Kuleler yıkılmaya başladığında harita açılır. Klasik "ARAM" oynamak yerine altın akışını optimize etmek gerekir.</p>
                    <div style="color:var(--text-light); font-size: 0.9em; margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 6px;">
                        <b style="color: #ffd700;">Altın Kural (Mid-Game Swap):</b> İlk alt kule yıkıldıktan sonra Nişancı ve Destek <b>Orta Koridora</b> geçer. Orta veya Üst koridor oyuncusu yan koridorlara giderek minyon dalgalarını iter (Split Push). Nişancı haritanın merkezinde olmalı ki objektiflere (Ejder/Vadi Alameti) hızlı dönebilsin.
                    </div>
                </div>

                <!-- Geç Oyun -->
                <div style="background: rgba(9, 20, 40, 0.7); border-left: 5px solid #f85149; border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
                    <h3 style="color:#f85149; margin-top:0; letter-spacing: 0.5px;">Aşama 3: Geç Oyun (Late Game) (25+ Dakika)</h3>
                    <p style="color:var(--text-main); line-height: 1.6;">Dirilme süreleri çok uzundur. Tek bir hata maçın bitmesine neden olur. Gözlem (Vision) her şeydir.</p>
                    <div style="color:var(--text-light); font-size: 0.9em; margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 6px;">
                        • <b>Baron Dansı:</b> Işınlan (TP) büyüsü olan oyuncu, Baron'a uzak olan koridoru (aşağı) iter. Takımın geri kalanı Baron çevresinde görüş temizler.<br>
                        • <b>Bait (Yemleme):</b> Rakibin görüşünü temizledikten sonra Baron'a vuruyormuş gibi yapıp pusuya düşürmek en klasik geç oyun taktiğidir.<br>
                        • <b>Ejder Ruhu:</b> Dakika 22-25 arası ejder ruhu alınmalıdır. Önemli bir kazanma koşuludur.
                    </div>
                </div>

                <!-- Süper Geç Oyun -->
                <div style="background: rgba(9, 20, 40, 0.7); border-left: 5px solid #A020F0; border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
                    <h3 style="color:#A020F0; margin-top:0; letter-spacing: 0.5px;">Aşama 4: Süper Geç Oyun (Super Late Game) (35+ Dakika)</h3>
                    <p style="color:var(--text-main); line-height: 1.6;">Oyuncuların tam eşya (6 slot) olduğu evredir. İyi bir savaş başlangıcı veya ayrık ittirme maçı bitirir.</p>
                    <div style="color:var(--text-light); font-size: 0.9em; margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 6px;">
                        • <b>Kadim Ejder:</b> Çoğu zaman Baron Nashor'u katletmekten daha önemlidir çünkü savaşta ezici bir üstünlük sağlar.
                    </div>
                </div>
            </div>

            <!-- TAKTİK TAHTASI (Görseller) -->
            <div style="margin-top: 40px; background: rgba(9, 20, 40, 0.5); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px;">
                <h2 style="color: var(--text-light); text-align: center; margin-top: 0; margin-bottom: 20px;">🗺️ Ekip Taktik Tahtası ve Rotasyon Planları</h2>
                
                <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; justify-content: center;">
                    <button class="btn-hex taktik aktif" onclick="window.haritaDegistir('erken-oyun-orman.png', this)">Erken Oyun (Orman)</button>
                    <button class="btn-hex taktik" onclick="window.haritaDegistir('ilk-ejder-rotasyon.png', this)">İlk Ejder Rotasyonu</button>
                    <button class="btn-hex taktik" onclick="window.haritaDegistir('baron-kurulumu.png', this)">Baron Setup (Dk 20+)</button>
                    <button class="btn-hex taktik" onclick="window.haritaDegistir('kadim-ejder-kusatmasi.png', this)" style="border-color: #800080; color:#d2a8ff;">Süper Geç Oyun (Kadim)</button>
                </div>

                <div style="background: #091428; border: 2px dashed rgba(200, 170, 110, 0.4); border-radius: 8px; padding: 15px; text-align: center; position: relative;">
                    <!-- 'erken-oyun-orman.png' ve diğer resimlerin kök dizinde veya doğru klasörde olduğundan emin ol -->
                    <img id="aktif-taktik-haritasi" src="erken-oyun-orman.png" alt="Taktik Haritası" style="max-width: 100%; height: auto; border-radius: 6px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6); transition: opacity 0.2s ease-in-out;">
                </div>
            </div>
        </div>`;
    },
    cizClashArenasi: function (clashVerileri) {
        if (!clashVerileri || clashVerileri.length === 0) {
            return `
            <div style="text-align: center; padding: 100px 20px;">
                <h1 style="color: var(--hextech-gold); font-size: 2.5em; text-transform: uppercase;">🏆 Clash Arenası</h1>
                <p style="color: #8b949e; font-size: 1.2em;">Henüz turnuva verisi tespit edilemedi veya veritabanı taranıyor.</p>
            </div>`;
        }

        // Maçları ID'ye göre grupla
        let maclar = {};
        clashVerileri.forEach(m => {
            if (!maclar[m.mac_id]) maclar[m.mac_id] = [];
            maclar[m.mac_id].push(m);
        });

        let vadiHtml = "";
        let aramHtml = "";

        // Maçları tarihe göre tersten sırala (En yeni en üstte)
        let siraliMacIds = Object.keys(maclar).sort((a, b) => {
            return (maclar[b][0].tarih_ms || 0) - (maclar[a][0].tarih_ms || 0);
        });

        siraliMacIds.forEach(id => {
            let takim = maclar[id];
            let macTipi = takim[0].mac_tipi; // "Clash" veya "ARAM_Clash"
            let sonuc = takim[0].sonuc === "Zafer" || takim[0].sonuc === "Galibiyet" ? "ZAFER" : "BOZGUN";
            let sonucRenk = sonuc === "ZAFER" ? "#3fb950" : "#f85149";
            let bgRengi = sonuc === "ZAFER" ? "rgba(63, 185, 80, 0.05)" : "rgba(248, 81, 73, 0.05)";

            let tK = 0, tD = 0, tA = 0;
            takim.forEach(p => { tK += p.oldurme || 0; tD += p.olum || 0; tA += p.asist || 0; });

            let sureStr = Yardimci.sureFormatla(takim[0].sure_saniye);
            let tarihStr = Yardimci.tarihFormatla(takim[0].tarih_ms);
            let panelId = `clash_detay_${id}`;
            let takimRozeti = macTipi === "Clash" ? "SİHİRDAR VADİSİ" : "SONSUZ UÇURUM (ARAM)";
            let altinRenk = "var(--hextech-gold)";

            let kartHtml = `
            <div style="background: rgba(9, 20, 40, 0.9); border: 1px solid var(--border-color); border-top: 4px solid ${altinRenk}; border-bottom: 2px solid ${sonucRenk}; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.5); margin-bottom:20px; overflow: hidden; cursor: pointer; transition: transform 0.2s;" onclick="window.clashKutuAcDinamik('${panelId}', '${id}', event)" onmouseover="this.style.transform='scale(1.01)'" onmouseout="this.style.transform='scale(1)'">
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding: 12px 20px; background: rgba(0,0,0,0.6);">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="color: ${altinRenk}; font-weight: 900; font-size: 1.2em; letter-spacing: 1px; text-shadow: 0 0 10px rgba(200, 170, 110, 0.4);">🏆 ${takimRozeti}</span>
                        <span style="color: ${sonucRenk}; font-weight: bold; padding: 2px 8px; border: 1px solid ${sonucRenk}; border-radius: 4px;">${sonuc}</span>
                        <span style="color: #8b949e; font-size: 0.9em; display: flex; align-items: center; gap: 5px;">
                            ⚔️ Takım Skoru: <b style="color: #fff;">${tK} / ${tD} / ${tA}</b>
                        </span>
                        <span style="color: #8b949e; font-size: 0.9em;">⏱️ <b style="color: #fff;">${sureStr}</b></span>
                        <span style="color: #8b949e; font-size: 0.9em;">📅 <b style="color: #fff;">${tarihStr}</b></span>
                    </div>
                </div>

                <div id="${panelId}" style="display: none; padding: 15px; cursor: default; width: 100%;" onclick="event.stopPropagation()">
                    </div>
            </div>`;

            if (macTipi === "ARAM_Clash") {
                aramHtml += kartHtml;
            } else {
                vadiHtml += kartHtml;
            }
        });

        return `
        <div style="max-width: 1400px; margin: 0 auto; color: var(--text-light); padding-bottom: 40px; animation: fadein 0.3s ease;">
            
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: var(--hextech-gold); font-size: 2.5em; text-transform: uppercase; margin-bottom: 10px; text-shadow: 0 0 20px rgba(200, 170, 110, 0.3);">🏆 Turnuva Kayıtları</h1>
                <p style="color: #8b949e; font-size: 1.1em;">Resmi Riot Games turnuvalarındaki (Clash) mutlak takım performansı.</p>
            </div>

            <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 30px;">
                <button class="btn-hex aktif" onclick="document.getElementById('clash-vadi').style.display='block'; document.getElementById('clash-aram').style.display='none'; this.classList.add('aktif'); this.nextElementSibling.classList.remove('aktif');" style="padding: 12px 30px; font-size: 1.1em; font-weight: bold; border-color: var(--hextech-gold); color: var(--hextech-gold);">⚔️ Sihirdar Vadisi Turnuvaları</button>
                <button class="btn-hex" onclick="document.getElementById('clash-aram').style.display='block'; document.getElementById('clash-vadi').style.display='none'; this.classList.add('aktif'); this.previousElementSibling.classList.remove('aktif');" style="padding: 12px 30px; font-size: 1.1em; font-weight: bold;">❄️ Sonsuz Uçurum (ARAM) Turnuvaları</button>
            </div>

            <div id="clash-vadi" style="display: block;">
                ${vadiHtml || '<div style="text-align:center; padding: 40px; color: #8b949e; border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px;">Kayıtlı Vadi Clash maçı bulunamadı.</div>'}
            </div>

            <div id="clash-aram" style="display: none;">
                ${aramHtml || '<div style="text-align:center; padding: 40px; color: #8b949e; border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px;">Kayıtlı ARAM Clash maçı bulunamadı.</div>'}
            </div>

        </div>`;
    },
    cizYarat: function () {
        window.ekipVeritabani = {};
        const rolCeviriKisa = { "TOP": "TOP", "JUNGLE": "JNG", "MIDDLE": "MID", "BOTTOM": "BOT", "UTILITY": "SUP" };
        let islenecekVeri = window.GuncelDurum.veriyiFiltrele(Sistem.veriler);

        islenecekVeri.forEach(mac => {
            let isim = mac.oyuncu;
            let poz = mac.pozisyon || "BELIRSIZ";
            if (poz === "INVALID" || poz === "BELIRSIZ") return;

            if (!window.ekipVeritabani[isim]) {
                window.ekipVeritabani[isim] = { isim: isim, herolar: {}, rolSayaclari: {}, toplamMac: 0, ikon: mac.profil_ikonu || 29 };
            }
            window.ekipVeritabani[isim].toplamMac++;
            window.ekipVeritabani[isim].herolar[mac.sampiyon] = (window.ekipVeritabani[isim].herolar[mac.sampiyon] || 0) + 1;
            window.ekipVeritabani[isim].rolSayaclari[poz] = (window.ekipVeritabani[isim].rolSayaclari[poz] || 0) + 1;
            if (mac.profil_ikonu) window.ekipVeritabani[isim].ikon = mac.profil_ikonu;
        });

        let havuzHtml = "";
        for (let isim in window.ekipVeritabani) {
            let o = window.ekipVeritabani[isim];
            o.herolarStr = Object.entries(o.herolar).sort((a, b) => b[1] - a[1]).slice(0, 3).map(h => Yardimci.formatSampiyon(h[0])).join(", ");
            o.rollerStr = Object.entries(o.rolSayaclari).sort((a, b) => b[1] - a[1]).slice(0, 2).map(r => rolCeviriKisa[r[0]] || r[0]).join(" / ");

            // 🎯 Riot ID (Oyun İçi İsim) Çözümlemesi
            let oyunIciIsim = typeof guncelRiotID !== "undefined" ? (guncelRiotID[isim] || isim) : isim;

            havuzHtml += `
            <div id="havuz-kart-${isim}" class="havuz-oyuncu-karti" style="padding:10px; margin-bottom:10px; display:flex; align-items:center; gap:10px; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; transition: all 0.2s ease;" onclick="window.oyuncuModalAc('${isim}')">
                <img src="${Yardimci.ikonUrlGetir(o.ikon, RiotCDN.surum)}" style="width:36px; height:36px; border-radius:50%; border:2px solid var(--border-color); transition: 0.2s;">
                <div style="display:flex; flex-direction:column; text-align:left; line-height: 1.2;">
                    <b class="havuz-isim" style="color:var(--text-light); font-size:1.1em; transition: 0.2s;">${oyunIciIsim}</b>
                    <span style="font-size:0.75em; color:#8b949e;">${isim}</span>
                    <span style="font-size:0.85em; color:var(--accent-color); font-weight:bold; margin-top: 2px;">${o.rollerStr}</span>
                </div>
            </div>`;
        }

        // Dinamik CSS (Glow ve Seçili Karartma efektleri için)
        if (!document.getElementById('besli-kisisel-css')) {
            let style = document.createElement('style');
            style.id = 'besli-kisisel-css';
            style.innerHTML = `
                .havuz-oyuncu-karti:hover { border-color: var(--accent-color) !important; background: rgba(10, 200, 185, 0.1) !important; transform: translateY(-2px); box-shadow: 0 4px 15px rgba(10, 200, 185, 0.3); }
                .havuz-oyuncu-karti:hover img { border-color: var(--accent-color) !important; box-shadow: 0 0 10px rgba(10, 200, 185, 0.5); }
                .havuz-oyuncu-karti.secili-pasif { opacity: 0.3; pointer-events: none; filter: grayscale(100%); }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => { if (typeof window.seciliKadroyuCiz === "function") window.seciliKadroyuCiz(); }, 50);

        return `
        <div style="max-width: 1200px; margin: 0 auto; color: var(--text-light); padding-bottom: 40px; text-align:center;">
            <h1 style="color: var(--text-light); border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">🖖 Kendi Rüya Takımını Kur</h1>
            <p style="color:#8b949e; margin-bottom:25px;">Aşağıdaki havuzdan oyuncuları seçip Vadi'deki uygun koridorlara yerleştir. Aynı oyuncuyu iki farklı role koyamazsın.</p>

            <div style="display: flex; flex-wrap: wrap; gap: 25px; text-align:left;">
                <div style="flex: 1; min-width: 300px; background: rgba(9, 20, 40, 0.7); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                    <h3 style="color:#ffffff; margin-top:0; text-align:center; border-bottom:1px dashed var(--border-color); padding-bottom:10px;">👥 Oyuncu Havuzu</h3>
                    <div id="oyuncu-listesi" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; max-height: 550px; overflow-y:auto; padding-right:5px;" class="custom-scrollbar">
                        ${havuzHtml}
                    </div>
                </div>

                <div style="flex: 1.2; min-width: 350px; background: rgba(9, 20, 40, 0.7); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); position: relative;">
                    <h3 style="color:#ffd700; margin-top:0; text-align:center; border-bottom:1px dashed var(--border-color); padding-bottom:10px;">🏆 Senin 5'lin</h3>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
                        <div class="esya-kart" id="slot-top" style="padding:15px; justify-content:space-between;" onclick="window.kadroSlotTemizle('top')"><span style="color:#a1d586; font-weight:bold;">TOP (Üst):</span> <span style="color:#8b949e;">Seçilmedi</span></div>
                        <div class="esya-kart" id="slot-jng" style="padding:15px; justify-content:space-between;" onclick="window.kadroSlotTemizle('jng')"><span style="color:#e88245; font-weight:bold;">JNG (Orman):</span> <span style="color:#8b949e;">Seçilmedi</span></div>
                        <div class="esya-kart" id="slot-mid" style="padding:15px; justify-content:space-between;" onclick="window.kadroSlotTemizle('mid')"><span style="color:#9ea1f9; font-weight:bold;">MID (Orta):</span> <span style="color:#8b949e;">Seçilmedi</span></div>
                        <div class="esya-kart" id="slot-adc" style="padding:15px; justify-content:space-between;" onclick="window.kadroSlotTemizle('adc')"><span style="color:#ffb84d; font-weight:bold;">ADC (Nişancı):</span> <span style="color:#8b949e;">Seçilmedi</span></div>
                        <div class="esya-kart" id="slot-sup" style="padding:15px; justify-content:space-between;" onclick="window.kadroSlotTemizle('sup')"><span style="color:#aee2ff; font-weight:bold;">SUP (Destek):</span> <span style="color:#8b949e;">Seçilmedi</span></div>
                    </div>
                    
                    <div id="takim-uyum-bar" style="margin-top:25px; background:rgba(0,0,0,0.4); padding:15px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
                        <div style="display:flex; justify-content:space-between; font-size:1em; color:#fff; margin-bottom:8px; font-weight:bold;">
                            <span>Takım Sinerjisi (Kimya):</span>
                            <b id="uyum-yuzde" style="color:var(--accent-color);">%0</b>
                        </div>
                        <div style="height:12px; background:#111; border-radius:6px; overflow:hidden; border:1px solid #000;">
                            <div id="uyum-doluluk" style="width:0%; height:100%; background:var(--accent-color); transition: width 0.5s ease-in-out;"></div>
                        </div>
                    </div>

                    <div id="takim-analiz-kutusu" style="margin-top: 25px;"></div>

                    <div style="text-align: center; margin-top: 25px;">
                        <button onclick="window.kadroyuTemizle()" class="btn-hex" style="background: rgba(248, 81, 73, 0.15); color: #f85149; border-color: #f85149; padding:12px 25px; font-size:1em; width:100%;">🗑️ Tüm Kadroyu Sıfırla</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="modal-oyuncu" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(1,10,19,0.85); z-index:9999; justify-content:center; align-items:center; backdrop-filter: blur(5px);">
            <div style="background:var(--card-bg); border:1px solid var(--accent-color); border-radius:12px; padding:25px; width:90%; max-width:450px; text-align:center; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
                <h2 id="modal-o-isim" style="color:var(--hextech-gold); margin-top:0; font-family:'Cinzel', serif; letter-spacing:1px; border-bottom:1px solid rgba(200,170,110,0.2); padding-bottom:10px;">Oyuncu Adı</h2>
                <div id="modal-o-detay" style="color:#c9d1d9; margin-bottom:20px; line-height:1.6; text-align:left; background:rgba(0,0,0,0.4); padding:15px; border-radius:8px; border:1px dashed var(--border-color);">
                </div>

                <h4 style="color:#8b949e; margin-bottom:15px; text-transform:uppercase; letter-spacing:1px;">Role Yerleştir</h4>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:20px;">
                    <button class="btn-hex" style="padding:12px; color:#a1d586; border-color:rgba(161,213,134,0.3);" onclick="window.roleAta('top')">TOP (Üst)</button>
                    <button class="btn-hex" style="padding:12px; color:#e88245; border-color:rgba(232,130,69,0.3);" onclick="window.roleAta('jng')">JNG (Orman)</button>
                    <button class="btn-hex" style="padding:12px; color:#9ea1f9; border-color:rgba(158,161,249,0.3);" onclick="window.roleAta('mid')">MID (Orta)</button>
                    <button class="btn-hex" style="padding:12px; color:#ffb84d; border-color:rgba(255,184,77,0.3);" onclick="window.roleAta('adc')">BOT (Nişancı)</button>
                    <button class="btn-hex" style="grid-column: 1 / -1; padding:12px; color:#aee2ff; border-color:rgba(174,226,255,0.3);" onclick="window.roleAta('sup')">SUP (Destek)</button>
                </div>
                <button class="btn-hex" style="background:rgba(248,81,73,0.1); color:#f85149; border-color:#f85149; width:100%; padding:10px;" onclick="document.getElementById('modal-oyuncu').style.display='none'">İptal</button>
            </div>
        </div>`;
    },
    cizVideolar: function () {
        return `
        <div style="max-width: 1000px; margin: 0 auto; color: var(--text-light); padding-bottom: 30px;">
            <h1 style="color: var(--text-light); border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 0;">🎬 Videolar & Klipler</h1>
            
            <div style="display: flex; flex-direction: column; gap: 35px; margin-top: 25px;">
                <div style="background: rgba(9, 20, 40, 0.7); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
                    <div style="background: rgba(10, 200, 185, 0.15); padding: 15px; text-align: center; border-bottom: 1px solid rgba(200, 170, 110, 0.3);">
                        <h3 style="margin: 0; color: #ffffff; letter-spacing: 1px;">MSI Cup | Clash | League of Legends</h3>
                    </div>
                    <div style="position: relative; width: 100%; background: #000;">
                        <img src="https://img.youtube.com/vi/gc2XMieX3_Y/maxresdefault.jpg" style="width: 100%; height: auto; display: block; object-fit: contain; opacity: 0.85; transition: opacity 0.3s ease;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.85">
                        
                        <a href="https://www.youtube.com/watch?v=gc2XMieX3_Y" target="_blank" class="btn-hex" style="position: absolute; bottom: 25px; left: 50%; transform: translateX(-50%); text-decoration: none; font-size: 1.1em; padding: 12px 30px; box-shadow: 0 0 20px rgba(0,0,0,0.9); z-index: 10;">
                            ▶ YOUTUBE'DA İZLE
                        </a>
                    </div>
                </div>

                <div style="background: rgba(9, 20, 40, 0.7); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
                    <div style="background: rgba(10, 200, 185, 0.15); padding: 15px; text-align: center; border-bottom: 1px solid rgba(200, 170, 110, 0.3);">
                        <h3 style="margin: 0; color: #ffffff; letter-spacing: 1px;">MSI Cup - Behind the scenes | Clash | League of Legends</h3>
                    </div>
                    <div style="position: relative; width: 100%; background: #000;">
                        <img src="https://img.youtube.com/vi/ajWmvK5aIvc/maxresdefault.jpg" style="width: 100%; height: auto; display: block; object-fit: contain; opacity: 0.85; transition: opacity 0.3s ease;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.85">
                        
                        <a href="https://www.youtube.com/watch?v=ajWmvK5aIvc" target="_blank" class="btn-hex" style="position: absolute; bottom: 25px; left: 50%; transform: translateX(-50%); text-decoration: none; font-size: 1.1em; padding: 12px 30px; box-shadow: 0 0 20px rgba(0,0,0,0.9); z-index: 10;">
                            ▶ YOUTUBE'DA İZLE
                        </a>
                    </div>
                </div>
            </div>
        </div>`;
    },
    cizSurumGecmisi: function () {
        // 🎯 OTONOM WEB YAMALARI MOTORU (Yeni yama gelince dizinin en başına ekle!)
        const webYamalari = [
            `
            <div class="yama-karti">
                <div class="yama-baslik">v7.1.0 - v7.1.4 - "TURNUVA MERKEZİ VE SİHİRDAR ZEKASI" Güncellemesi <span class="yama-tarih">21 Haz 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v7.1.0] Yeni Komuta Merkezi - Clash Arenası:</strong> Sadece resmi turnuva maçlarının sergilendiği altın sarısı şampiyona temasına sahip yepyeni bir sekme eklendi. ARAM'ın kaotik yapısının Vadi'nin makro istatistiklerini bozmaması için arena iki bağımsız alt sekmeye (Vadi ve Sonsuz Uçurum) bölündü.</li>
                    <li><strong>[v7.1.1] DOM Optimizasyonu (Tembel Yükleme):</strong> 300+ maç kartının sayfa açılışında tarayıcıyı kilitlemesi sorunu kökünden çözüldü. Detaylı takım panelleri artık sayfa yüklenirken değil, sadece tıklama anında (Lazy Load) milisaniyeler içinde oluşturularak devasa bir performans artışı sağlandı.</li>
                    <li><strong>[v7.1.2] Sihirdar Büyüleri Akıllı Bilgi Motoru:</strong> Maç kartlarındaki büyü ikonlarının üzerine gelindiğinde açılan bilgi panellerinin (tooltip) HTML kutusuna çarpıp kesilmesi sorunu, <code>position: fixed</code> ve JavaScript hesaplamaları içeren bir zırhla kalıcı olarak çözüldü. Paneller her zaman net ve kesintisiz görünecek.</li>
                    <li><strong>[v7.1.3] Sayısal Şeffaflık ve E-Spor Standartları:</strong> Büyülerin içine 14. Sezon standartlarına uygun milimetrik bekleme süreleri (Örn: Sıçra 300 sn), hasar değerleri ve kalkan istatistikleri entegre edildi. İkonların sınırları e-spor arayüzlerine uygun olarak 6px kare köşeli yapıya kilitlendi.</li>
                    <li><strong>[v7.1.4] Kümülatif Spam Algoritması ve Hizalama Onarımı:</strong> Oyuncuların bireysel profillerindeki "En Çok Spamlanan Tuş" verisinin tek bir rekor maça endekslenmesi hatası düzeltildi; sistem artık oyuncunun kariyeri boyunca attığı toplam yetenek sayılarını topluyor (Örn: Nunu & Willump E - 2.986x). Ayrıca, verilerin alt satıra kaymasına neden olan UI hatası <code>white-space: nowrap</code> zırhıyla giderilerek tek bir optik çizgiye sabitlendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v7.0.1 - v7.0.3 - "TAKTİKSEL DERİNLİK" Güncellemesi <span class="yama-tarih">18 Haz 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v7.0.1] Dil ve Tipografi Zırhı:</strong> Türkçe tarayıcıların "text-transform: uppercase" kullanırken İngilizce şampiyon isimlerini (Malphite, Irelia) "MALPHİTE" şeklinde bozması sorunu kökünden çözüldü. Özel Regex motoruyla "i" harfleri zorla "I" yapılarak e-spor standartlarında tipografi sağlandı.</li>
                    <li><strong>[v7.0.2] Mutlak Partner Dedektörü:</strong> "Yabancı" oyuncuların isimlerinin veritabanında kaybolması sorunu çözüldü. Sistem artık filtrelenmiş görünümlere aldanmayıp doğrudan ana veritabanı (Sistem.veriler) köküne iniyor ve eşleşen partnerin Riot ID'sini söküp alarak "(Yabancı)" damgasıyla birlikte hatasız hizalıyor.</li>
                    <li><strong>[v7.0.3] Tam Donanımlı Rün ve Büyü Enjeksiyonu:</strong> Maç kartlarına gerçek bir koçluk vizyonu eklendi. Sadece anahtar rün değil, oyuncunun kullandığı tüm rünler (4 Ana, 2 Alt, 3 İstatistik Kristali) ve Sihirdar Büyüleri karta entegre edildi. Sistemde eski maçlara ait eksik rün verisi varsa, sistemin çökmesini engelleyen "Akıllı Fallback (Geri Uyumluluk)" kalkanı devreye sokuldu.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v6.1.8 - v7.0.0 - "GRAND MASTER" E-Spor Analiz Hub Devrimi <span class="yama-tarih">17 Haz 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v6.1.8 - v6.1.9] Detaylı Maç Kartı Mimarisi:</strong> "En Yeni Maçlar" ve "Sinerji" sekmeleri, e-spor paneli kalitesine taşındı. Eşyalar, rünler ve karakteristik rozetler (Kule Yıkıcı, Çelik Duvar vb.) tüm maç kartlarında standart ve okunabilir formatta entegre edildi.</li>
                    <li><strong>[v6.2.0 - v6.2.5] Yabancı Dedektörü ve Partner Zekası:</strong> Tüm kartlarda partner tespiti için evrensel dedektör motoru devreye alındı. Ana ekip listesinde bulunmayan oyuncular anında tespit edilerek <b>(Yabancı)</b> damgasıyla kimliklendirildi. İsimlerin kart içinde taşması <code>ellipsis</code> ve <code>Grid Zırhı</code> ile tamamen engellendi.</li>
                    <li><strong>[v6.3.0] Performans Devrimi (Hafıza Motoru):</strong> Bireysel profil sekmelerindeki "fena kasma" sorunu, her tıklamada veritabanını tarayan sistem yerine RAM tabanlı <code>window.profilHafizasi</code> motoruyla çözüldü. Geçişler artık 0ms gecikme ile ışık hızında.</li>
                    <li><strong>[v6.5.0] Şampiyon Uzmanlıkları (Kompakt Liste Modu):</strong> Rol sütunları yan yana dizilerek, mobil ve masaüstü uyumlu, tek satırda hizalı profesyonel liste görünümüne geçildi. İsim uzunlukları ne olursa olsun istatistik bloğu (KDA, WR, UP) sabit ve okunur kalacak şekilde sabitlendi.</li>
                    <li><strong>[v7.0.0] Global Optimizasyon ve GPU Hızlandırma:</strong> Tüm sistem, tarayıcıların donmasını engelleyen <code>will-change</code> ve <code>GPU hızlandırma</code> zırhıyla kaplandı. Veritabanından veriyi söküp alma (özellikle yabancıların Riot ID'leri için) süreci en derin katmanlara (Sistem.veriler) indirilerek mühürlendi. Eşya ve rün simülatöründeki görsel hatalar, mutlak pop-up motoruyla tarihe gömüldü.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v6.1.5 - v6.1.7 - E-Spor Koçluk Zekası, FIFA Kimya Motoru ve Porofessor Etiketleri <span class="yama-tarih">10 Haz 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v6.1.5] Porofessor Etiket Modülü:</strong> Oyuncu detay (Pop-up) kartlarına makro analitik zekası eklendi. Sistem artık oyuncunun KDA, CS/min, Görüş ve Ölüm oranlarını tarayarak ona otonom şekilde "Agresif Koridor", "İyi Farm", "Farmı Bıraktı", "Çok Ölüyor" gibi reaktif davranış etiketleri basıyor.</li>
                    <li><strong>[v6.1.6] FIFA Tarzı Kimya ve Pozisyon Cezası:</strong> 5'li kadro motoru acımasızlaştırıldı. Bir oyuncu kartında yazan en iyi 2 rolü dışında bir slota (Out of Position) yerleştirilirse anında <b>-%70 Güç Cezası</b> yiyerek kırmızı "Yanlış Pozisyon" damgası alıyor ve tüm takımın ortalama sinerjisini dibe çekiyor.</li>
                    <li><strong>[v6.1.7] Alt Koridor Sinerji (Duo) Zırhı:</strong> Alt koridora konulan Nişancı ve Destek ikilisinin daha önce birlikte oynadıkları maçlardaki kazanma oranlarına bakılarak <b>+15 Sinerji Bonusu</b> veya <b>-10 Uyumsuzluk Cezası</b> kesen ağır bir algoritma eklendi. Yalnız başına slota konan oyuncuların metin yutma hatası çözülerek "Uyumlu Pozisyon" ibaresi garanti altına alındı.</li>
                    <li><strong>[UI/UX] Kusursuz Çeviri ve Rol Hiyerarşisi:</strong> Kartlarda kafa karışıklığı ve kalabalık yaratan 3. roller tamamen silindi, mutlak 2 rol kuralı getirildi. Sistemdeki tüm İngilizce (TOP, BOTTOM vb.) pozisyon metinleri saf Türkçe (Üst, Nişancı) terminolojiye çevrildi.</li>
                    <li><strong>[Görsel] Reaktif Buton Optimizasyonu:</strong> İşlevsiz "Tüm Kadroyu Sıfırla" butonu canlandırılıp takım panelinin merkezine geniş, tok ve tıklama dostu bir tasarımla oturtuldu. Modal içindeki "İptal" (X) butonuna, üzerine gelindiğinde tetiklenen reaktif kırmızı uyarı (Hover) eklendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v6.1.0 - v6.1.4 - Dinamik Ekip Motoru, Sinerji Zekası ve Mutlak Otonomi <span class="yama-tarih">10 Haz 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v6.1.0] Dinamik Ekip Motoru:</strong> Elle girilen statik oyuncu veritabanı (o1, o2) çöpe atıldı. Sistem artık doğrudan Firebase maç geçmişini tarayarak arkadaş havuzunu, uzmanlıkları ve rolleri otonom olarak inşa ediyor. Birisi yeni maç attığında sistem onu anında havuza ekler.</li>
                    <li><strong>[v6.1.1] Otonom Güç Barı:</strong> Pop-up içindeki "Rol Yetkinliği" barı artık süs değil; oyuncunun o roldeki gerçek Kazanma Oranı (%WR) ve KDA verilerine göre dinamik hesaplanan (Elite, Güçlü, Ortalama, Zayıf) bir analitik araca dönüştü.</li>
                    <li><strong>[v6.1.2] Frekans Bazlı Rol Zekası & Yerelleştirme:</strong> Kartlarda uzayıp giden İngilizce roller (BOTTOM, UTILITY vb.) temizlendi. Sistem oyuncunun en çok oynadığı ilk 2 rolü matematiksel frekansla tespit edip saf Türkçe (Nişancı / Destek vb.) olarak ekrana basıyor. Pop-up içi roller de tamamen Türkçeleştirildi.</li>
                    <li><strong>[v6.1.3] Canlı Takım Sinerjisi (SP) Motoru:</strong> "Kendi 5'lini Kur" sekmesine canlı bir takım uyum barı entegre edildi. Alt Koridor ikilisi (ADC+SUP) bonusu ve tam kadro katsayıları otonom olarak hesaplanarak, sen kadroyu doldurdukça Sinerji Puanı anlık tepki veriyor.</li>
                    <li><strong>[v6.1.4] Riot API Kalkanı ve UX Kalibrasyonu:</strong> Riot sunucularından kaynaklanan ve tüm JS'i çökerten <code>RegisterClientLocalizationsError</code> dil paketi hatası "Try-Catch Zırhı" ile izole edilip sistemin donması engellendi. Pop-up İptal butonlarına reaktif hover eklendi ve "Kadroyu Sıfırla" butonu merkezi hizalamayla e-spor estetiğine oturtuldu.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v6.0.3 - Mağaza Sınırlandırmaları ve Arayüz Piksel Restorasyonu <span class="yama-tarih">09 Haz 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v6.0.3] Veri Senkronizasyonu:</strong> Yun Tal Vahşi Okları verileri v14.10+ yamasına göre %100 güncellendi. Taban değerler <code>+60 AD</code> ve <code>+40% AS</code> olarak sabitlendi.</li>
                    <li><strong>[v6.0.3] Tam Lokalizasyon:</strong> Eşyanın pasif mekanikleri (Pratik Mükemmelleştirir ve Sağanak) tamamen Türkçe oyun içi terminolojiye çevrildi.</li>
                    <li><strong>[v6.0.3] Stat Motoru Kalibrasyonu:</strong> Eşyanın biriktirdiği <code>+25% Kritik İhtimali</code> simülatör hesaplamalarına doğrudan "Kalıcı Pasif" olarak işlendi.</li>
                    <li><strong>[v6.0.3] Gözyaşı ve Hidra Ambargoları:</strong> Muramana/Seraph/Fimbul sahiplerinin ham gözyaşı eşyalarını mükerrer alması engellendi. Aynı anda birden fazla AoE Cleave (Vahşi/Haşmetli/İtikatsız Hidra) veya Tiamat bileşeni kuşanılması tamamen kapatıldı.</li>
                    <li><strong>[v6.0.3] Çizme ve Döngü Kilitleri:</strong> Dynamic Boots filter mimarisiyle envantere birden fazla çizme girme açığı engellendi. Pırıltı serisi (Üçlü/Lich/Canbiçen) ve Gece/Gündüz temalı çakışan pasifli eşyalar birbirine kilitlendi.</li>
                    <li><strong>[Bugfix] Künye ve İstatistik Hizalaması:</strong> Uzmanlar sekmesinde uzun isimlerin (örn: YEAHRUMONBASHI) sağdaki kazanma oranı verilerini ezme hatası, istatistik kolon genişliğinin 110px değerine kalibre edilmesi ve sol isme maksimum alan açılmasıyla tamamen çözüldü.</li>
                    <li><strong>[Stat] Core Parser ve Tipografi:</strong> Tooltip üzerindeki çoklu etiket ayrıştırıcısı re-kalibre edilerek efsanevi eşyaların tüm statları geri kazanıldı. Yük biriktiren tüm eşyaların (Manaveren/Fimbul/Seraph) açıklamaları geniş paragraflara bölünerek okuma ferahlığı sağlandı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v6.0.2 - Videolar & Klipler Modülü ve Medya Zırhı <span class="yama-tarih">06 Haz 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v6.0.2] Videolar & Klipler Modülü:</strong> Arayüze tam entegre, otonom yönetim motoruyla çalışan <code>videoklipler</code> sekmesi sisteme eklendi.</li>
                    <li><strong>[UI] Hextech Medya Kartı:</strong> YouTube gömme (embed) kısıtlamalarına karşı "Kapak Görseli + YouTube'da İzle" butonu yapısı geliştirildi. <code>object-fit: contain</code> zırhı ile thumbnail'ların kırpılmadan tam görünmesi sağlandı.</li>
                    <li><strong>[Kritik] Video Hata Giderme:</strong> Telif hakkı nedeniyle gömülmesi engellenen içeriklerin yarattığı "Video kullanılamıyor" hatası, overlay (kapak) yöntemiyle tamamen imha edildi.</li>
                    <li><strong>[Optimizasyon] Kod Standardizasyonu:</strong> Modül isimlendirmeleri (btn, id, arayuz) <code>videoklipler</code> çatısı altında standardize edilerek sistemin esnekliği artırıldı.</li>
                    <li><strong>[Görsel] Tipografi:</strong> Medya kartlarına Hextech stiline uygun başlık alanları eklendi, butonlar merkezi pozisyona çekilerek profesyonel e-spor görünümü sağlandı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v6.0.1 - İstemci Hotfix & Optik Kalibrasyon <span class="yama-tarih">05 Haz 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[UX] Yenileme İkonu Restorasyonu:</strong> Kafa karışıklığı yaratan ve çift yönlü dönen eski SVG oku imha edildi. Yerine, RYO istemci standartlarına mutlak uyum sağlayan, saat yönünde dönen tek yönlü keskin Hextech oku (Single-Path SVG) sisteme mühürlendi.</li>
                    <li><strong>[UI] İkon Ezilme Kalkanı:</strong> Ekran daraldığında "Verileri Yenile" butonundaki ikonun preslenerek deforme olması (yumurtalaşması) <code>flex-shrink: 0</code> komutu ile kesin olarak engellendi. İkon artık her koşulda geometrik bütünlüğünü koruyor.</li>
                    <li><strong>[Tipografi] Mutlak Optik Hizalama (Baseline Lock):</strong> Sitenin ana başlığı (h1) ile versiyon etiketi arasındaki uyuşmazlık çözüldü. <code>align-items: baseline</code> teknolojisiyle başlık ve etiket tek bir kusursuz optik çizgiye kilitlendi. Versiyon fontu 0.45em değerine çekilerek hiyerarşik denge sağlandı.</li>
                    <li><strong>[UI] Okunabilirlik ve Kontrast Güçlendirmesi:</strong> Yama notu kartlarının zeminine derinlik katan karanlık bir gradient (linear-gradient) eklendi. Göz yoran soluk metinler parlak Hextech Kremine (<code>#f0e6d2</code>) güncellendi. Satır aralıkları (1.8) ve madde boşlukları (14px) açılarak, yoğun veri akışının zihni yormadan okunması garanti altına alındı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v6.0.0 - Hextech Çekirdek Revizyonu ve Mutlak İstemci Modernizasyonu <span class="yama-tarih">01 Haz 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v6.0.0] Clip-Path Geometrisi ve Zırhlanma:</strong> Eski nesil sıkıcı dikdörtgen yapılar tarihe gömüldü. Arayüzdeki tüm ana kartlar, liderlik panoları ve maç özetleri sağ üst ve sol alt köşelerden 15px'lik kesimlerle (Hextech Cuts) traşlandı. Sınır çakışmalarını önlemek için <code>inset box-shadow</code> ile kusursuz bir iç çerçeve hilesi uygulandı.</li>
                    <li><strong>[v6.0.0] Mutlak İmleç Motoru (Cursor Override):</strong> Tarayıcıların yerel sunucularda (127.0.0.1) çıkardığı 404 yol hataları tespit edilip kökünden kazındı. Yollar mutlak kök dizine (<code>/cursors/...</code>) bağlandı ve tüm tıklanabilir elementler 32x32 piksellik özel Hextech eldivenlerine biat etmeye zorlandı (<code>!important</code> zırhı ile).</li>
                    <li><strong>[UX] İkonografi Restorasyonu ve Altın Standart:</strong> Yuvarlak sınırların ikonları yanlardan presleyip yumurta şekline sokması engellendi. Şampiyon, eşya ve rün görselleri <code>border-radius: 4px</code> ile kare forma çekildi, dışlarına sızmayan <code>2px var(--gold-accent)</code> asil altın çerçeve ve hafif parıltı (glow) eklendi. Orijinal renkleri bozan filtreler sistemden silindi.</li>
                    <li><strong>[UI] Reaktif Enerji ve Dinamik Hover:</strong> Kartlar artık kullanıcının varlığını hissediyor. İmleç ile etkileşime geçilen her kart z-ekseninde <code>translateY(-5px)</code> yükselerek, sınırlarından dışarıya Hextech Mavisi (<code>rgba(10, 200, 185, 0.3)</code>) bir enerji parıltısı saçıyor.</li>
                    <li><strong>[UI] Modüler Tablo Panelleri:</strong> Sıkıcı web tabloları parçalandı. Satırlar birbirinden ayrılıp (<code>border-spacing: 0 5px</code>) bağımsız, yüzer veri panelleri haline getirildi. Böylece her bir komp ve istatistik satırı kendi başına bir oyun içi bildirim kartı hissi veriyor.</li>
                    <li><strong>[JS/CSS] Kusursuz Hiyerarşi ve Veri Taşması Koruması:</strong> Şampiyon ve oyuncu isimlerinin sığmayıp üç nokta (...) ile kesilmesi sorunu çözüldü. Künye alanları esnetildi ve isimlerin arayüzü patlatmadan, tam okunabilirlikle (<code>white-space: nowrap</code> ve <code>overflow: visible</code>) kendi alanlarında özgürce sergilenmesi sağlandı.</li>
                    <li><strong>[Tipografi] Cinzel Enjeksiyonu:</strong> Rakamsal verilerin, KDA oranlarının ve oyuncu sıralarının görsel ağırlığını artırmak için bu değerlere özel 'Cinzel' font ataması yapıldı, rakamlar saf beyaz gölgelerle aydınlatıldı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.58.9 - UI/UX İmleç (Cursor) Optimizasyonu <span class="yama-tarih">30 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v5.58.9] Soru İşareti İmhası:</strong> Eşya ve rünlerin üzerine gelindiğinde beliren "yardım (soru işareti)" imleci, profesyonel arayüz standartlarına uymadığı için sistemden tamamen kazındı.</li>
                    <li><strong>[UX] Akıcı Tıklama Hissiyatı:</strong> Tüm arayüzdeki (CSS ve JavaScript katmanları dahil) <code>cursor: help</code> komutları <code>cursor: pointer</code> ile değiştirildi. Artık etkileşimli elemanların üzerinde doğrudan "el" simgesi belirerek, kullanıcılara çok daha doğal ve akıcı bir etkileşim deneyimi (UX) sunuluyor.</li>
                    <li><strong>[JS Zırhı] Dinamik Kilit Kırıldı:</strong> JavaScript'in arka planda çalışan ve fare hareketlerine müdahale edip imleci zorla soru işaretine çeviren inatçı dinleme motorları (Event Listeners) tespit edilip ezildi. Sistem artık kullanıcı girdilerine mutlak itaat ediyor.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.58.8 - Davranışsal Kalibrasyon: "Kaos Analiz Motoru" <span class="yama-tarih">29 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v5.58.8] "Dengeli Taşıyıcı" İllüzyonu Kaldırıldı:</strong> Sabotaj (troll) oyunlarını yüksek asist sayılarıyla gizleyip sistemimizi "Dengeli" etiketiyle kandıran oyuncular için <b>"Kaos Analiz Motoru"</b> devreye alındı.</li>
                    <li><strong>[Davranışsal Filtreleme] Asist Kalkanı Aşımı:</strong> Motor artık asist sayılarını, toplam ölümler ve skor katkısı ile kıyaslıyor. Yüksek asist ortalamasına rağmen ölüm sayısı <code>Ölüm &gt; (Kill + Asist/3)</code> eşiğini aşan oyuncular, "Dengeli Taşıyıcı" maskesinden çıkarılıp gerçek davranışsal etiketlerine (örn: <i>Kaosun Efendisi</i>) yerleştiriliyor.</li>
                    <li><strong>[Veri Bilimi] Kümülatif Sabotaj Frekansı:</strong> Sadece genel ortalamaya değil, oyuncunun toplam maç havuzundaki sabotaj frekansına (%12 ve üzeri) bakılarak, kümülatif başarısızlıklar istatistiksel gürültüden (noise) arındırıldı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.58.5 - v5.58.7 - Kurumsal Kimlik ve Görsel Hiyerarşi Reformu <span class="yama-tarih">28 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v5.58.5] Web'in İnşaat Tabelası Söküldü:</strong> Tarayıcı sekmesinde görünen standart "gri dünya" ikonu tarihe karıştı. <code>&lt;head&gt;</code> anatomisine yapılan müdahale ile proje resmi <b>Favicon</b> desteğine kavuştu. Yazlık DC artık sekmelerde kurumsal kimliğiyle boy gösteriyor.</li>
                    <li><strong>[UI/UX] Rün Görselleştirme Motoru Yenilendi:</strong> Bireysel istatistikler ve ana kartlardaki rün ikonları, Riot Games'in "E-Spor Premium Arayüz" standartlarına uyarlandı.</li>
                    <li><strong>[v5.58.6] Karanlık Çağ Kapandı:</strong> Rün ikonlarının arkasındaki hatalı siyah (background:#000) katmanlar imha edildi. İkonlar artık tamamen şeffaf, derinlik algısı (drop-shadow) yüksek ve altın çerçeve hiyerarşisiyle çok daha net bir görünüme sahip.</li>
                    <li><strong>[v5.58.7] CSS Sniper Temizliği:</strong> Tüm kartları istemsizce bozan "serseri mayın" (wildcard) CSS seçicileri temizlendi. Özellikle <code>kart-ust</code> sınıfındaki kartların görsel hiyerarşisi, Sinerji sekmeleriyle senkronize edildi. Artık "Bireysel" ve "Sinerji" sekmeleri arasında görsel tutarsızlık bulunmuyor.</li>
                    <li><strong>[Optimizasyon] Görsel Yükü Azaltıldı:</strong> Rün çizim motorundaki redundant (gereksiz) stil blokları ayıklandı, sayfa render süreci daha temiz ve hafif hale getirildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.58.1 - v5.58.4 - Medeniyete Geçiş ve Yapay Zeka Hakemi <span class="yama-tarih">27 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v5.58.1] Kompakt E-Spor Düzeni & Flexbox Zırhı:</strong> Maç kartlarında havada uçuşan KDA (Örn: 19/7/7) ve rozet kargaşası bitti. Özel CSS Flexbox zırhı giydirilerek tüm istatistikler, Zafer/Bozgun yazısının hemen sağına, OP.GG standartlarında jilet gibi sabitlendi. Liderlik panolarındaki gereksiz genişlik budandı ve Şafak'ın ismi tüm sayfalarda "s2s" kısaltmasıyla e-spor kimliğine kavuşturuldu.</li>
                    <li><strong>[v5.58.2] IDE Göçü ve Motor Optimizasyonu:</strong> İlkel geliştirme ortamı terk edilip, anlık hata tespiti sağlayan VS Code ve Live Server altyapısına (Medeniyete) geçildi. Sistemi yoran ve arka planda boşuna dönen hayalet <code>listeyiCiz</code> kodları tamamen imha edilerek motor yükü hafifletildi.</li>
                    <li><strong>[v5.58.3] Sabotaj Radarı V2.0 (Makro Analiz):</strong> Eski kör algoritma parçalandı. "Büyük Kapı" kuralıyla 11 ve altı ölümü olanlara mutlak dokunulmazlık getirildi. Takım skorunun %50'sinden fazlasına katkı sağlayan taşıyıcılara <b>"Fedakar Savaşçı"</b> kalkanı entegre edildi. 0 Kill ve düşük asistli "Faydasız" profillerin ise gözünün yaşına bakılmayacak.</li>
                    <li><strong>[v5.58.4] Dinamik Tolerans ve Tempo Katilleri:</strong> Bir maçtaki kronik ölüm sınırı 15'e çekildi (Kalkanı olan fedakarlar için oyunun uzadığı varsayılarak sınır 17'ye esner). Takım ölümlerinin <b>%25'inden fazlasını</b> tek başına alan normal roller sabotajcı fişi yerken; takım için feda edilen Destek (Utility) rolündeki oyunculara özel bir izolasyon yapılarak bu oran <b>%33.3 (Üçte Bir)</b> sınırına çekildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.57.12 - v5.57.13 Rol İzolasyonu ve Podyum Revizyonu <span class="yama-tarih">26 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v5.57.12] İstatistik İzolasyonu ve Çoklu Davranış Motoru:</strong> Destek (Sup) oyuncularının haksız yere "Vergi Memuru" damgası yemesine sebep olan genel farm (CS) hesabı parçalandı. Artık destek maçlarındaki minyon verileri, taşıyıcı rolündeki ortalamayı zehirlemiyor. Ayrıca tek tip rozet devri kapandı; oyuncunun en çok oynadığı 2 role özel, yan yana sergilenen bağımsız davranış etiketleri (Örn: [Sup: Cefakar Koruyucu] [Mid: Dengeli Taşıyıcı]) profillere entegre edildi.</li>
                    <li><strong>[v5.57.13] Çift Katmanlı Kimlik (E-Spor UI):</strong> Liderlik tablolarındaki ve KDA listelerindeki isim gösterimleri yenilendi. Kartlarda artık üstte kalın puntolarla oyuncunun <b>Gerçek İsmi</b>, hemen altında ise daha ince ve zarif bir gri tonla <b>Riot ID (Oyun İçi İsim)</b> yer alıyor.</li>
                    <li><strong>[v5.57.13] Podyum ve CSS İllüzyonu (Kafatası Madalyaları):</strong> Tüm sıralama tablolarındaki sıkıcı sayıların yerini ilk 3 sıraya özel büyütülmüş Altın (🥇), Gümüş (🥈) ve Bronz (🥉) madalyalar aldı. Sınırları zorlayıp <b>"Utanç Listesi"</b> için özel bir CSS katmanlandırması (Absolute Positioning) kullandık; madalyaların sayısını kapatmadan kurdele kısmına Kafatası (💀) zımbalandı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.57.11 - Adil Yargılama: Sabotaj (Troll) Motoru Revizyonu <span class="yama-tarih">25 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Skor Katkısı (KP) Optimizasyonu:</strong> Utanç Listesi'ni belirleyen sabotaj (troll) tespit algoritmasındaki mantıksal hata kökünden kazındı. Oyuncunun katkısını hesaplarken takım asistlerini de hesaba katarak ortaya çıkan "hayalet asist beklentisi" ve matematiksel adaletsizlik tamamen iptal edildi.</li>
                    <li><strong>Yeni Sabotaj Kriteri:</strong> Sistem artık profesyonel e-spor standartlarındaki <b>Saf Skor Katkısı (Kill Participation)</b> matematiğini kullanıyor. Bir maçta 11'den fazla ölen ve takımın toplam öldürme (kill) sayısına <b>%40'tan daha az</b> katkı (kendi skoru + asisti) sağlayan oyuncular acımasızca Utanç Listesi'ne damgalanacak.</li>
                    <li><strong>Sıfıra Bölünme Zırhı (Divide by Zero):</strong> Takımın hiçbir skor üretemeden ezildiği (örneğin 0-15 biten) felaket senaryolarında, sistemin sıfıra bölünme hatası verip çökmesini veya "Infinity" değeri üretmesini engelleyen matematiksel bir kalkan algoritmaya eklendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.57.2 - v5.57.10 Sistem Devrimi ve Kusursuz Liderlik Motoru <span class="yama-tarih">24 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v5.57.2 - v5.57.4] E-Spor UI ve Veri Zırhı:</strong> Takım sinerjisi sekmesindeki maç kartları Şampiyon odaklı ve rozet sistemli profesyonel bir tasarıma geçirildi. Liderlik Motoru'nun sezon filtrelerini yok sayma ve 'ReferenceError' çökme sorunları kökten çözüldü. Tüm liderlik sekmeleri artık seçili sezona %100 sadık.</li>
                    <li><strong>[v5.57.5 - v5.57.6] Çakışma Önleyici Mühür (Return Kalkanı):</strong> Sinerji sekmesindeki gereksiz arka plan hesaplamaları tamamen durduruldu. Liderlik tabloları aktifken aşağıda alakasız maç kartlarının çizilip ekranı bozması (çift render hatası) araya örülen mutlak kod duvarı ile engellendi.</li>
                    <li><strong>[v5.57.7] İstikrar Motoru ve Çift Kollu Tasarım:</strong> Liderlik tablolarında tek maçlık tesadüfi balon rekorlar iptal edilerek, gerçek performansı yansıtan "Maç Başı Ortalama" sistemine geçildi. Arayüz ikiye bölündü; ana tablo solda akarken, <b>KDA Şampiyonları</b> tahtı her liderlik sekmesinde sağ kolonda sabit kalarak ekibe hükmetmeye başladı.</li>
                    <li><strong>[v5.57.8 - v5.57.10] Mutlak Oyun İçi İsim (Riot ID) Otomasyonu:</strong> Kaan <i>(DarkLegend97)</i>, Ercan <i>(MrOsleon)</i> ve Taner <i>(YazlıkDCFlex)</i> için çoklu hesap karmaşasını bitiren özel kimlik maskelemesi eklendi. Kalan tüm oyuncular için de gerçek isimler yerine doğrudan veritabanındaki oyun içi Riot ID'ler (örn: TuMu, ShenerShen) ekrana yansıtıldı. Arayüz metinleri "Ortalama" kelimelerinden arındırılıp daha net ve agresif hale getirildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.57.0 - v5.57.1 Makro Vizyon ve Bölge Kontrolü <span class="yama-tarih">22 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v5.57.0] Makro Analitik (Sunucu Özeti) Sekmesi:</strong> Bireysel istatistiklerin ötesine geçilerek Yazlık DC ekibinin tüm karakteristiğini tek ekranda toplayan ana vitrin inşa edildi. Otonom sekme motoru bu devasa arayüzü kayıpsız yükleyecek şekilde modifiye edildi.</li>
                    <li><strong>[v5.57.1] Bölge Kontrolü ve 5'li Rol Dağılımı:</strong> Tek bir genel grafik yerine, her bir koridor için 5 ayrı "Bölge Kontrolü" pasta grafiği (CSS conic-gradient) yaratıldı. Hangi Yazlık DC üyesinin hangi koridoru domine ettiği mikro düzeyde haritalandırıldı.</li>
                    <li><strong>[v5.57.1] Çoklu Hesap (Smurf) Takip Sistemi:</strong> Rol grafiklerindeki lejantlara oyuncuların Riot ID (Oyun İçi İsim) verileri bağlandı. Bir oyuncu farklı yan hesaplarıyla aynı role girdiyse, sistem bu hesapları tek bir isim altında toplayarak yüzdelik dilimi manipüle etmeden ekrana basacak.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.56.7 - v5.56.8 Safkan Skor ve Kalkan Güncellemesi <span class="yama-tarih">21 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v5.56.8] Kapsayıcı Veri Radarı (Wildcard Catch):</strong> Veritabanından gelebilecek her türlü değişken isimlendirme varyasyonunu (penta, pentaKills, beste_bes vb.) havada yakalayıp işleyebilen mutlak bir hata tolerans zırhı giydirildi. Bot arka planda ne gönderirse göndersin, arayüz artık çökmez ve gerçeği okur.</li>
                    <li><strong>[v5.56.7] Riot API Kümülatif Bug İptali (Saf İstatistikler):</strong> Riot'un 1 Penta atıldığında alt skorları da (Quadra, Triple) gizlice +1 artırarak arayüzü şişirmesi engellendi. Alt skorlar üst skorlardan matematiksel olarak çıkarılarak oyuncuların "Safkan Çoklu Skor" sayıları profil özetlerine yansıtıldı.</li>
                    <li><strong>[v5.56.7] Görsel Rozet Hiyerarşisi:</strong> Maç kartlarında en üst düzey skor rozeti (Örn: Beşte Beş) kazanıldığında, alt düzey skor rozetlerinin (İkide İki vb.) de ekranda belirip vizyonsuz bir görüntü kirliliği yaratmasını engelleyen katı <code>else if</code> kalkanı devreye alındı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.56.6 - Vitrin Temizliği ve Gerçek Ustalık <span class="yama-tarih">20 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>En İyi Şampiyonlar Revizyonu:</strong> Bireysel profillerin üst panelinde bulunan "En İyi 3 Şampiyon" vitrini, sadece "En Çok Oynananlar" listesi olmaktan çıkarıldı. O vitrine de ağır matematik motoru (Wilson Skoru) ve 3 maç barajı entegre edilerek, düşük kazanma oranlı şampiyonlar vitrinden kovuldu.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.56.2 - v5.56.5 Mutlak Adalet ve Wilson Zırhı Güncellemesi <span class="yama-tarih">19 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>[v5.56.2 - v5.56.5] Wilson Güven Aralığı (Veri Bilimi Devrimi):</strong> Tüm sıralama motorlarındaki (Bireysel Roller, Takım Sinerjisi, Şampiyon Uzmanları) ilkel "Ham Kazanma Oranı" hesabı tamamen çöpe atıldı. Yerine küçük örneklemlerdeki şans faktörünü sıfırlayan ve alt sınır güvenilirliğini ölçen ağır matematik motoru (Wilson Skoru) entegre edildi.</li>
                    <li><strong>[v5.56.2 - v5.56.4] Mutlak Kalifikasyon Barajı (3 Maç Kuralı):</strong> Yüzlerce maçlık emeğin tesadüflere yenilmesini engellemek için sisteme kaba kuvvet zırhı eklendi. 3 maçtan az oynanan hiçbir sinerji veya şampiyon uzmanlığı, kazanma oranına bakılmaksızın 3 maçı geçen istikrarlı verilerin üstüne çıkamaz.</li>
                    <li><strong>[v5.56.5] Şeffaf Veri Adaleti:</strong> Az maç oynanan veya zayıf verileri sistemden silip kolaya kaçmak reddedildi. Eksik istatistikler listede tutuldu (gizlenmedi) ancak algoritmik olarak cezalandırılıp hak ettikleri en alt sıralara çivilendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.56.1 - Laplace Düzeltmesi (Şans Faktörü İptali) <span class="yama-tarih">18 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Laplace Smoothing (Veri Bilimi Entegrasyonu):</strong> Rol performanslarını sıralayan algoritmadaki ilkel "Kazanma Oranı" hesabı çöpe atıldı. Yerine, küçük örneklemlerdeki (az maç oynanan rollerdeki) şans faktörünü cezalandıran Laplace Düzeltmesi <code>(Zafer + 1) / (Maç + 2)</code> motoru eklendi.</li>
                    <li><strong>Balon İstatistik İptali:</strong> Sadece 1 maç oynanıp 1 galibiyet alınarak %100 oranla en tepeye kurulan "tek maçlık harikalar" (illüzyon performanslar) algoritma tarafından ezildi.</li>
                    <li><strong>İstikrarın Ödüllendirilmesi:</strong> Ekranda ham %WR değerleri şeffafça görünmeye devam etse de, arka plandaki sıralama motoru artık 50 maçta %60 oran tutturan istikrarlı bir performansı, 1 maçta %100 yapan tesadüfi bir performanstan çok daha üstün tutuyor. Mutlak veri adaleti sağlandı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.56.0 - Bireysel Performans Hiyerarşisi ve Rol Analiz Motoru <span class="yama-tarih">17 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Rol Profilleri (Tier List) Modülü:</strong> Bireysel özet panosunun altına, oyuncunun esnek maçlardaki tüm rollerini analiz edip sıralayan interaktif bir açılır/kapanır (accordion) sekme entegre edildi.</li>
                    <li><strong>Acımasız Algoritma (Gerçekle Yüzleşme):</strong> Riot'un atadığı göstermelik rolleri es geçip, tamamen ham veriye dayanan bir performans matrisi yazıldı. Roller, önce Kazanma Oranına (%WR), eşitlik durumunda ise KDA'ya göre en iyiden en kötüye doğru matematiksel olarak sıralanıyor.</li>
                    <li><strong>Dinamik Rozet Sistemi:</strong> Sıralamada zirveye oturan rol "👑 EN İYİ ROL" olarak altınla taçlandırılırken, %50 kazanma oranının altında kalıp takımın kaderiyle oynayan roller "⚠️ ZAYIF HALKA" damgası yiyor.</li>
                    <li><strong>UI/UX Bütünlüğü (Vitrin Koruması):</strong> Profilin üst kısmındaki standart "Ana Rol / İkincil Rol" kimlik kartviziti korundu. Detaylı performans yüzleşmesi sadece isteyenin tıklayabileceği bir butona bağlanarak ekrandaki bilgi kirliliği (cognitive overload) sıfırlandı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.55.4 - v5.55.6: Kutsal İkon Savaşları ve Yankı Temizliği <span class="yama-tarih">15 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>v5.55.4 (Kare İkon İsyanı):</strong> Şampiyon portrelerindeki kare köşelerin yuvarlak çerçeveden taşması sorunu için CSS <code>border-radius</code> ve HTML kapsayıcı (wrapper) zırhları denendi. Tarayıcı motorları inat edip köşeleri sızdırmaya devam etti.</li>
                    <li><strong>v5.55.5 (Piksel Kanaması ve Pres Makinesi):</strong> Sızan pikselleri durdurmak için WebKit maskeleri ve Padding (iç boşluk) zırhları yazıldı. Kanama durdu ancak bu sefer de Flexbox esneme motoru, ikonları yanlardan ezip "yumurtaya" çevirdi. Çözüm ar-ge aşamasında reddedildi.</li>
                    <li><strong>v5.55.6 (Mutlak Zafer - Anti-Squish):</strong> Sızdıran <code>border</code> komutu tamamen yok edildi. İkonlar <code>flex-shrink: 0</code> ve <code>aspect-ratio: 1/1</code> zırhlarıyla preslenmekten kurtarılıp mutlak kare formuna kilitlendi. Kanama yapmayan <code>box-shadow</code> sahte çerçeveyle %100 pürüzsüz daire kesimi elde edildi.</li>
                    <li><strong>DOM Yankı (Çift İsim) Temizliği:</strong> Eşya pop-up panellerinde kendi tasarladığımız HTML açıklamalarıyla, JavaScript'in (popupItemTetikle) en tepeye bastığı standart beyaz başlıkların üst üste binerek yarattığı "Çift İsim" yankı hatası kökünden susturuldu.</li>
                    <li><strong>Tanklık Metriği Senkronizasyonu (Hotfix):</strong> Sekmeler arasındaki veri tutarsızlığı giderildi. "Tank" verisi, sadece yenen ham dayaktan (<code>alinan_hasar</code>) arındırılıp, oyuncunun gerçek ustalığını gösteren "Soğurulan Hasar" (<code>hasar_sogurulan</code>) metriğine eşitlendi.</li>
                    <li><strong>Override Map (Kategori Zorlama):</strong> Riot API'sinin serseri mayın gibi bıraktığı "Shurelya'nın Savaş Şarkısı", sistemin manuel zekasıyla ezip geçilerek doğrudan Destek eşyaları kategorisine çivilendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.55.3 - Kusursuz Görsel Hiyerarşi ve Tam Kimlik Restorasyonu <span class="yama-tarih">14 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Tam İsim (Ellipsis) Restorasyonu:</strong> Sitenin hiçbir yerinde oyuncu isimleri üç noktayla (...) kesilmeyecek şekilde genişlik sınırları 260px'e esnetilip CSS kırpma kuralları iptal edildi. Bütün kimlikler tam okunabilirliğe kavuştu.</li>
                    <li><strong>Evrensel Rün Ölçekleme:</strong> Kapalı maç sekmelerinin başlığında bulunan anahtar rün görselleri, açık kartlardaki gibi 30px boyutuna getirilerek Altın Aura zırhıyla donatıldı.</li>
                    <li><strong>Global Rehber Dedektörü:</strong> Eşya Dizilimleri sekmesindeki kör olan popup motoru, global event delegation (mousemove) algoritmasıyla yeniden hayata döndürüldü; sitedeki statik/dinamik tüm eşya açıklamaları mutlak olarak aktif edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.55.2 - Mutlak Dikey Hizalama ve Çakışma Zırhı <span class="yama-tarih">13 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Matryoshka (İç İçe Geçme) Kırıcı:</strong> JavaScript döngüsü sırasında etiketlerin yanlış kapanması sonucu oyuncuların birbirinin içine girmesine sebep olan merdiven çökmesi kökten onarıldı; <code>cizTakimKarti</code> iskeleti kusursuzlaştırıldı.</li>
                    <li><strong>DOM Dikey Zorlama:</strong> Sinerji satırlarının içine girdiği ana kutuyu ZORLA dikey (alt alta) çalıştıran CSS zırhı eklendi. Rün boyutları değişse dahi kutuların yana taşması veya birbirini ezmesi yasaklandı.</li>
                    <li><strong>Milyon (m) Formatı Matematik Motoru:</strong> 11651.0k gibi okuması zor kaba rakamlar 11.6m şeklinde jilet gibi net bir formata geçirilerek e-spor arayüzü standartları sağlandı. Profil rünleri büyütüldü.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.55.1 - Canlı Çekirdek Sıcak Tamiratı <span class="yama-tarih">12 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>ReferenceError İmhası:</strong> <code>cizTakimKarti</code> motorunun içindeki <code>miniRunHTML</code> harf hatası (typo) tespit edilerek imha edildi; çöken sinerji ekran güncelleme motoru otonom olarak ayağa kaldırıldı.</li>
                    <li><strong>Anti-Yellow Çakışma Filtresi:</strong> Eski sürümlerden sızan ve yeni mutlak motorla üst üste binerek çift pop-up çıkmasına yol açan yerel CSS yapıları, küresel bir style enjeksiyonu ile tamamen felç edildi.</li>
                    <li><strong>Stat Shards Senkronizasyonu:</strong> Küçük istatistik rünlerinin yer değiştirmesiyle bozulan mantıksal açıklamalar ile tarayıcıdaki ters can simgesi görselleri DOM seviyesinde dinamik olarak takas edilerek senkronize edildi.</li>
                    <li><strong>Metin Arındırma:</strong> <code>Cash Back</code> rününün Türkçe araç ipucu açıklamasındaki İngilizce ekler temizlenerek "Özel İndirim" olarak sadeleştirildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.55.0 - Küresel DOM Devrimi ve Akıllı Pop-Up Motoru <span class="yama-tarih">11 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Evrensel Mutlak Konumlandırma (Global DOM):</strong> Popup araç ipucu yapıları maç kartlarının içinden sökülerek doğrudan <code>document.body</code> köküne bağlandı. Sitedeki tüm yerel çerçeve kısıtlamaları (overflow/z-index) tamamen bypass edildi.</li>
                    <li><strong>Sinerji Sabit Ekran Restorasyonu:</strong> Takım Sinerjisi sekmesindeki maç kartlarının akordeon kilitlenme sorunları, filtre seçildiğinde doğrudan açık ve listelenmiş gelen kararlı statik düzene dönülerek çözüldü.</li>
                    <li><strong>Otonom Simülatör Hizalaması:</strong> Ekip Rün Simülatöründeki ikonlar yeni mutlak araç ipucu motoruna entegre edilerek simülatörün sayfa düzenini kaydıran HTML çakışmaları tamamen temizlendi.</li>
                    <li><strong>Renk Hiyerarşisi Standardı:</strong> Küresel pop-up pencerelerinde eşya başlıkları keskin saf beyaz (<code>#ffffff</code>), rünler ise karakteristik auralı mavi (<code>var(--accent-color)</code>) yapılarak görsel disiplin sağlandı.</li>
                    <li><strong>Kapalı Kart Desteği:</strong> Maç kartları henüz açılmamışken mini rünlerin ve eşyaların üzerine gelindiğinde pop-up motorunun otonom tetiklenmesi sağlandı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.54.0 - Katman Zırhı Tahkimatı <span class="yama-tarih">10 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Z-Index Zırhı:</strong> Rün açıklamalarının diğer oyuncu kartlarının altında kalmasını önlemek için yerel popup pencerelerine <code>z-index: 99999</code> katman zırhı eklenmesi test edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.53.0 - Native Title CSS Bypass <span class="yama-tarih">10 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Kök Hücre Çözümü:</strong> Sinerji kartlarının içindeki kilitli flexbox yapılarında yerel CSS engellerini aşmak amacıyla, tarayıcının yerleşik <code>title</code> parametresi üzerinden rün açıklaması okutulması denendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.52.0 - Tam Rün Vitrini ve Genişletilmiş Maç Panelleri <span class="yama-tarih">10 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Detay Paneli Entegrasyonu:</strong> Bireysel profil ve Sinerji maç geçmişi kartlarına, veritabanından (Bot v3.2.0) gelen rün ID'lerini anında görselleştiren dinamik DDragon yuvaları eklendi.</li>
                    <li><strong>6'lı Rün Dizilimi:</strong> Sinerji detay paneline oyuncuların maçta seçtiği 6 rünün tamamını Türkçe açıklamalarıyla birlikte listeleyen etkileşimli rün seridi dahil edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.51.0 - Zırhlı Sinerji Çipleri ve Hata Ayıklama <span class="yama-tarih">10 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Event Bubbling Engeli:</strong> Takım Sinerjisi sekmesindeki isim filtrelerinde yaşanan yanlış hedefe tıklama sorunları çözüldü, süzme algoritmasına <code>.trim().toLowerCase()</code> zırhı yerleştirildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.50.0 - Mutlak Sinerji İzolasyonu ve Otonom Simülatör <span class="yama-tarih">10 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Sinerji İzolasyonu (Katı Eşitlik):</strong> Sinerji Keşif Motoru (Combinatorics) yeniden kalibre edildi. "3'lü Sinerji" sekmesi artık 5'li maçların içindeki alt permütasyonları çekmek yerine, <em>sadece ve sadece</em> 3 kişilik kemik kadro (+2 yabancı) ile girilen maçları süzüyor.</li>
                    <li><strong>Mutlak Simülatör Motoru:</strong> İnteraktif eşya simülatöründeki beyaz liste sınırı kaldırıldı. Simülatör artık pasif yeteneklerdeki alakasız sayıları stat sanmıyor; "İstatistik Kutusu" içindeki <em>tüm</em> özellikleri otonom olarak okuyup hesaplıyor.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.49.0 - Sonsuz Döngü Kırıcı ve Şifa İkonu <span class="yama-tarih">06 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Inception Bug Çözümü:</strong> Eşya açıklamalarında kendi kendini boyayarak çift ikona sebep olan HTML çakışması kökten kazındı. Boyama motoru doğrudan API veri çekim aşamasına taşındı.</li>
                    <li><strong>Şifa Zırhı:</strong> Destek eşyalarındaki "İyileştirme ve Kalkan Gücü" özelliği için özel parlak yeşil renk paleti ve 🌿 ikonu sisteme mühürlendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.48.0 - Scouting Raporu: Efektif Şampiyon Havuzu <span class="yama-tarih">05 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Efektif Havuz Filtresi:</strong> Bireysel profillere takımın kaderini değiştirdiğin (En az 3 maç, %50+ WR, Yüksek KDA veya Hasar katkısı) şampiyonları süzen özel bir algoritma eklendi.</li>
                    <li><strong>Dinamik Şampiyon Vitrini:</strong> Efektif şampiyonlar seçildiğinde profesyonel bir e-sporcu raporu (Scouting Report) gibi şampiyonların detaylı istatistik kartları ekrana çiziliyor.</li>
                    <li><strong>Otonom Yama Otomasyonu:</strong> Sürüm geçmişi arayüzü tam otomasyona geçirildi. Yeni yamalar renk efektlerini otonom alırken, eski yamalar tek bir tuşla açılan tarihi arşive sessizce taşınıyor.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.47.0 - Efsanelerin Dönüşü: Flame Horizon <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Filtreleme Devrimi:</strong> Bireysel profillere "🌋 Flame Horizon" filtresi eklendi. Rakibine 100+ CS farkı attığın efsanevi maçları tek tıkla listeleyebilirsin.</li>
                    <li><strong>Görsel Analiz:</strong> Takım sinerjisi maç başlıklarına şampiyon ikonları ve ekip içindeki Flame Horizon başarımları entegre edildi.</li>
                    <li><strong>Performans Çekirdeği:</strong> Sinerji Puanı (SP) hesaplamasına "Nişancı Dominasyonu" (CS Farkı) ağırlığı eklenerek alt koridor analizleri %100 gerçekçi hale getirildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.46.0 - Derin Veri Entegrasyonu ve UX Optimizasyonu <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Derin Veri Katmanı:</strong> Maç kartlarına Şampiyon Hasarı (💥), Tanklanan Hasar (🛡️) ve Takım Desteği (💚) verileri milimetrik olarak işlendi.</li>
                    <li><strong>Destek Rolü Zırhı (Utility Guard):</strong> Destek oyuncuları için istatistiksel gürültü yaratan "10. Dakika CS" ve "CS Farkı" rozetleri, otonom bir algoritma ile gizlenerek arayüz sadeleştirildi.</li>
                    <li><strong>Görsel Stabilizasyon:</strong> "Temizle" ve "Kapat" butonları standart zarif boyutlara çekildi; <code>!important</code> kalkanı ile tarayıcılar arası boyut tutarsızlıkları kökten çözüldü.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.45.0 - Gelişmiş Maç Kartı Analitiği ve Dinamik Rozetler <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Erken Oyun Şeffaflığı:</strong> Maç kartlarındaki CS verisine "10. Dakika CS" bilgisi entegre edilerek erken oyun performansı görünür kılındı.</li>
                    <li><strong>Koridor Partneri (Duo) Tanımlaması:</strong> BOTTOM ve UTILITY rollerinde oynanan maçlar için aynı takımdaki eşleşmiş partneri tespit eden otonom bilgi satırı eklendi.</li>
                    <li><strong>Algoritmik Rozet Sistemi:</strong> Belirli kalite eşiklerini aşan performansları (+20 CS Farkı, +450 GPM) maç kartlarına anında mühürleyen dinamik CSS rozet altyapısı kuruldu.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.44.0 - Ekonomi Motoru ve Erken Oyun İstatistikleri <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Arka Plan Veri Madenciliği (Bot V21):</strong> Python veri çekme algoritması, standart maç verilerinin ötesine geçerek Riot'un "Challenges" (Görevler) veritabanına bağlandı.</li>
                    <li><strong>Yeni Metrikler:</strong> Dakika Başı Altın (GPM), 10. Dakika Minyon Sayısı, Maksimum Koridor Minyon Farkı, Alınan Barikat Sayısı ve Erken Oyun Üstünlüğü gibi safkan ekonomi verileri entegre edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.43.0 - Yasal Kalkan (Footer) Entegrasyonu <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Hukuki Koruma Protokolü:</strong> Sitenin en alt kısmına (Footer), Riot Games'in "Topluluk Projeleri Kullanım Politikası" ile %100 uyumlu standart yasal feragatname (Disclaimer) ve telif hakkı uyumluluk beyanı işlendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.42.1 - Sonsuz Döngü (Infinite Loop) Hotfix <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Network Tıkanıklığı Giderildi:</strong> Taktik tahtasında <code>onerror</code> mekanizmasının Riot CDragon sunucularındaki kırık bir linkle eşleşmesi sonucu oluşan sonsuz yükleme hatası durduruldu (<code>this.onerror=null;</code> parametresi enjekte edildi).</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.42.0 - İnteraktif Taktik Tahtası (Map Swapper) <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Harita Rotasyon Modülü:</strong> Statik görselleri temel alan dinamik bir "Taktik Tahtası" inşa edildi. Yumuşak geçiş algoritması sayesinde, oyun evreleri arasındaki harita değişimleri akıcı hale getirildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.41.1 - Mutlak Gizleme Zırhı (Soft Delete) <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Liderlik Filtre Temizliği:</strong> Liderlik tablolarının üstünde yer alan hantal filtre butonları silindi. Null çökme riskini önlemek için "Soft Delete" (<code>display: none;</code>) korumasına geçildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.41.0 - Kanban Çerçeve Kalibrasyonu <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Responsive Kanban Düzenlemesi:</strong> Şampiyon uzmanları sekmesinde ekran daraldığında ortaya çıkan kaymaları önlemek için isimlerin ve statların yan yana dizilim matrisleri esnek CSS flexbox sınırlarıyla tahkim edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.40.0 - Sezon 16 DataDragon Rün Entegrasyonu & Fiddlesticks Fix <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>runesReforged Bağlantısı:</strong> Oyundan kalkan rünleri barındıran hantal CommunityDragon veri tabanı söküldü. Rün motoru, canlı yama sürümünü kullanarak doğrudan resmi DataDragon'un güncel <code>runesReforged.json</code> dosyasına bağlandı.</li>
                    <li><strong>Rol Hiyerarşisi (Görsel Dağılım):</strong> Şampiyon uzmanları sekmesindeki düz liste mimarisi yıkıldı. Şampiyon uzmanları rollere göre kategorize edilerek büyük başlıklar altında gruplandı.</li>
                    <li><strong>Riot Spagetti Kodu Filtresi (Fiddlesticks Fix):</strong> Sistemin kalbine entegre edilen <code>resimUrlGetir</code> fonksiyonu sayesinde Riot'un veritabanındaki saçma harf duyarlılıkları (FiddleSticks &rarr; Fiddlesticks) filtrelendi ve görsel yükleme körlüğü giderildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.39.0 - Eşya Mimarili Rün Motoru <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Tooltip Restorasyonu:</strong> CSS pseudo-element sınırlamaları nedeniyle çalışmayan rün açıklama kutuları iptal edildi. Rün ikonları dinamik olarak <code>esya-kapsayici</code> sınıflarına sarılarak, eşyalarla %100 aynı çalışan tooltip mekaniği inşa edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.38.0 - Rün Oto-Tamir Motoru (Auto-Heal) <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Dinamik URL Enjeksiyonu:</strong> Sunuculardaki büyük/küçük harf duyarlılığı nedeniyle bozulan rün görselleri için Oto-Tamir motoru yazıldı. Kırık HTML resim etiketleri anında onarılıyor.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.37.0 - Dinamik Tooltip & Eşya Hesaplama Motoru <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Metin Kırmayan CSS Pseudo Motoru:</strong> Üstüne gelindiğinde anında beliren, animasyonlu ve metin kırmayan CSS pseudo-element motoru eklendi.</li>
                    <li><strong>Statik Matematik Modülü:</strong> Global eşya veri tabanını okuyarak oyuncuların anlık toplam altın, saldırı gücü ve yetenek gücü değerlerini hesaplayan modül entegre edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.36.0 - DDragon ve CDragon Sinerjisi <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>404 Fallback Zırhı:</strong> Eski rün ikonlarındaki bulunamadı hataları giderildi. Sistem rünleri oyun içi dosya adı bazında analiz edip, Sezon 16'nın resmi Türkçe açıklamalarını ikonların içine kusursuzca enjekte ediyor.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.35.0 - HTML Kasa Temizliği <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Rün İskeleti Yenilemesi:</strong> Arayüzdeki eski, statik ve sahte rün HTML kodları kökten silindi. Rün kütüphanesi kırık linklerden tamamen arındırılarak güncel CommunityDragon sunucularına bağlandı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.34.0 - Mutlak Rün Restorasyonu ve Canlı Çeviri <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Görsel ve Metin Tamir Motoru:</strong> Eski rün isimleri yüzünden bozulan görselleri Sezon 16 dosyalarıyla onaran sistem yazıldı. İngilizce rün isimleri iptal edilerek Riot'un güncel yamasındaki Türkçe açıklamalar dinamik olarak gömüldü.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.33.0 - Satır İçi Renklendirme Algoritması <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Mejai Operasyonu:</strong> Riot'un etiketlerini cümle ortasında kullanmasından doğan "Metin Parçalanması" sorunu çözüldü. Açıklamalar kelime kelime satır içi taranarak fosforlu kalem stiliyle boyanıyor.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.32.0 - Dinamik Satır Okuyucu (Line-Parser) & Hurda Temizliği <span class="yama-tarih">04 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Block-Flex Mimarisi:</strong> Eşya istatistiklerini hizalamak için kullanılan dar Regex sözlüğü çöpe atıldı. Özellikleri satır satır kutulara hapseden mutlak tasarım mimarisi kuruldu, statların alt satıra kayması engellendi.</li>
                    <li><strong>Hurda Ayıklayıcı:</strong> Eşya kütüphanesini kirleten "300 Altınlık Saf Çizmeler" API taramasından tamamen men edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.31.9 - Menü Arası Kalibrasyon <span class="yama-tarih">03 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Görsel Gizleme Zırhı:</strong> Farklı sekme ve menüler arası geçişlerde elemanların ekranda asılı kalmasını engellyen CSS katmanları optimize edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.31.8 - Çift Kontrol Mekanizması <span class="yama-tarih">03 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Double-Check Filtresi:</strong> Oyuncu sekmelerindeki filtre kırıntılarını ve gösterim limitlerini anında sıfırlayan çift yönlü kontrol mekanizması devreye sokuldu.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.31.7 - Profil İkon Hafızası <span class="yama-tarih">03 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Evrensel İkon Senkronizatörü:</strong> Profil ikonları veri tabanındaki en güncel maç tarihine göre taranarak mutlak senkronize edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.31.6 - Dinamik Temizlik Motoru <span class="yama-tarih">03 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>DOM Temizlik Tetikleyicisi:</strong> Ekran her güncellendiğinde tüm sekme filtrelerini sıfırlayan akıllı temizlik mekanizması entegre edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.31.5 - Regex Kelime Hizalaması <span class="yama-tarih">03 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Satır Kayması Engeli:</strong> Regex motoruna nowrap zırhı giydirilerek, eşya detaylarındaki üçlünün ekran daraldığında alt satıra kayması çözüldü.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.31.4 - Liderlik Podyumu ve Madalyalar <span class="yama-tarih">03 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Görsel Rekabet Modülü:</strong> Liderlik tabloları baştan tasarlandı. Altın, gümüş ve bronz madalyalarla, sabit hizalama kutularıyla ve gölgelendirmelerle kalite arşa çıkarıldı.</li>
                    <li><strong>Gelişmiş Matematik Motoru:</strong> Python bot verileriyle tam uyumlu çalışacak şekilde CS/Dakika matematiği eklendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.31.3 - Taner Kimlik Konsolidasyonu <span class="yama-tarih">03 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Kimlik Birleştirme:</strong> Sistemde çift kayıt oluşturan <em>"YazlıkDCFlex"</em> Riot ID'si, kalıcı olarak ana kimlik olan <em>"Taner"</em> ile tek bir ID altında birleştirildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.31.2 - Sinerji Keşif Motoru (Combinatorics & Delta) <span class="yama-tarih">03 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Kombinasyon Üreticisi:</strong> Takım gruplarını tarayarak içlerindeki gizli sinerjileri ortaya çıkaran matematiksel keşif algoritması yazıldı.</li>
                    <li><strong>Sinerji Puanı (SP) ve Laplace Düzeltmesi:</strong> 1 maçta %100 kazanma oranı gibi yanıltıcı istatistikleri elemek için Laplace düzeltmesi eklendi.</li>
                    <li><strong>Rüya Takım Algoritması:</strong> En formda oyuncuları analiz edip birleştiren "Haftanın 5'lisi" ve "Rüya Takım" modülleri entegre edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.31.1 - Küresel Veri Erişimi <span class="yama-tarih">03 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Global Kilit Kırıcı:</strong> <code>tumVeriler</code> değişkeni kilitlerinden kurtarılarak globale taşındı, sistemin veri okuma hızı maksimize edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.31.0 - Zirve Analizi: Ortalamalar & Tekil Liderlik <span class="yama-tarih">03 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Maç Sayısına Oranlayan Ortalama Sistemi:</strong> Filtre butonlarındaki "Tek Maçlık Rekor" sistemi çöpe atıldı. Yerine başarıyı Maç Sayısına Oranlayan gerçekçi ortalama sistemi getirildi.</li>
                    <li><strong>DOM Hack:</strong> Eski butonlardaki arızalı kod blokları JavaScript klonlama metoduyla ezilerek devreden çıkarıldı. Mükerrer kayıtlar tamamen engellendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.30.6 - Sezon 16 Regex Uyumu & Zeke Operasyonu <span class="yama-tarih">03 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Regex Motoru Sezon 16 Güncellemesi:</strong> Ayrıştırıcı motorun sözlüğüne "Ulti Hızı" ve "Mutlak Sömürü" eklendi. Yeni terimlere özel ikonları atandı.</li>
                    <li><strong>Sınıflandırma Müdahalesi:</strong> Yanlış etiketlenen "Zeke'nin Ahengi" eşyası, Kategori Zorlama sistemine eklenerek kalıcı olarak Destek sekmesine transfer edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.30.5 - Tarihi Arşivin Restorasyonu <span class="yama-tarih">03 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Arşiv Genişletmesi:</strong> Geçmiş sürümlerin haksız yere sıkıştırıldığı özet bloğu parçalandı. Sürümler kendi detaylı kartlarına kavuştu.</li>
                    <li>Eski sürümleri DOM içinde tutan ancak görsel olarak bir tıkla açılıp kapanmasını sağlayan "Arşivi Aç/Gizle" zekası eklendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.30.4 - Ayrıştırıcı Sözlük Genişlemesi & Hizalama <span class="yama-tarih">03 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Regex Motoru Sözlük Güncellemesi:</strong> Ayrıştırıcı motora "Taban Can Yenilenmesi" ve "Taban Mana Yenilenmesi" öğretildi. Özellikler artık ikonlarıyla tek satıra hizalanıyor.</li>
                    <li>Riot API'sinin değer ile isim arasına attığı gizli satır atlama komutları Regex içine dahil edilerek ezildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.30.3 - Sinerji Barları & Metin Revizyonu <span class="yama-tarih">02 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Sinerji UI Restorasyonu:</strong> CSS sadeleştirmesi sırasında kazara silinen Takım Sinerjisi kazanma oranı renkli alt barları sisteme geri entegre edildi.</li>
                    <li><strong>Wrap Zırhı (Satır Kayması Engeli):</strong> Eşya açıklama panellerindeki özelliklerin kutu daraldığında alt satıra kırılarak çirkin bir görüntü oluşturması engellendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.30.2 - "Inception" Bug Hotfix <span class="yama-tarih">02 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Görsel Bug Düzeltmesi (Double Wrapping):</strong> Eşya makyajlama motorunun üst üste çalışmasıyla oluşan "Eşya özelliklerinin pop-up içinde ikili görünmesi" sorunu çözüldü.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.30.1 - Yapay Enjeksiyon & İkonik Düzeltmeler <span class="yama-tarih">02 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Gunmetal Greaves (3172) Enjeksiyonu:</strong> Riot'un Data Dragon API'sinde gizlenen 3. Seviye Savaşçı Çizmesi sisteme manuel olarak kodlandı.</li>
                    <li><strong>Görsel UI Güncellemeler:</strong> Tüm "Hareket Hızı" statlarına ve "Botlar" kategori başlığına model yerine yepyeni ve daha şık 👟 ikonu entegre edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.30.0 - Mutlak Kontrol & Kategori Zekası <span class="yama-tarih">02 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Manuel Sınıflandırma Motoru (Override Map):</strong> Riot'un API verilerindeki etiketleme hatalarına müdahale edildi. Savaşçı ve destek eşyaları zorla kendi doğru kategorilerine aktarıldı.</li>
                    <li><strong>İsim Bazlı Çöp Öğütücü & VIP Liste:</strong> Kütüphaneden silinmek istenen 12 çöp eşya ID gerektirmeden sadece isimleriyle kara listeye alındı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.29.0 - Modern İstemci Arayüzü & Regex Motoru <span class="yama-tarih">02 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Gelişmiş Metin Ayrıştırıcı (Regex Parser):</strong> Riot API'sinden gelen açıklamaları yakalayan devasa bir JavaScript motoru yazıldı. Bu motor metin içindeki özellikleri tespit edip renklerle HTML'e gömer.</li>
                    <li><strong>Premium Tooltip UI:</strong> Sitedeki tüm eşya açıklamalarının tasarımı Riot'un güncel Sezon 16 oyun içi pop-up panellerine benzetildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.28.3 - Durumsal Arayüz ve Tip Senkronizasyonu <span class="yama-tarih">02 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Tip (Type) Uyuşmazlığı Düzeltmesi:</strong> Sinerji Puanı kutusunun sekmelerde kaybolmasına neden olan JavaScript katı eşitlik veri tipi uyumsuzluğu çözüldü. Rakamlar tırnak içinden çıkarıldı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.28.2 - Algoritma Açıklama Restorasyonu <span class="yama-tarih">02 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Durumsal Arayüz (Conditional UI):</strong> Kod sadeleştirme çalışmaları sırasında kazara gizlenen "Tüm Zamanların Rüya Takımı" ve "Haftanın 5'lisi" bilgi kutucukları DOM yapısına yeniden enjekte edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.28.1 - Lejant Panosu Hizalaması <span class="yama-tarih">02 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Kusursuz Hizalama ve Zırh:</strong> Ana Lejant kutusundaki CSS çakışmaları ve sola kayma sorunları giderildi. Alt sıradaki metinler özel zırhlı rozet formatına dönüştürüldü.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.28.0 - Durumsal Panel Çekirdek Entegrasyonu <span class="yama-tarih">02 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Mimarî Altyapı Hazırlığı:</strong> Sinerji SP bilgi kutusunun ve rüya takım algoritma panellerinin farklı sekmelerde kaybolmasını engelleyecek JavaScript koşullu render mimarisinin çekirdek iskelet sistemi sıfırdan kodlandı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.27.0 - Sezon 16 Dinamik Entegrasyonu ve Hurdalık Temizliği <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Gelişmiş Çöp Öğütücü:</strong> Riot API'sinden gelen eski "Karayel" ve "Gaddarlık" gibi oyundan silinmiş çöp eşyalar özel bir kara liste ile sistemden tamamen kazındı.</li>
                    <li><strong>Dinamik Yama Motoru:</strong> Arayüze gömülü olan eski sezon görsel bağlantılarını otomatik olarak tespit edip, canlı sunucudaki en taze yama versiyonuyla anında değiştiren sistem eklendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.26.0 - Kategorik Kütüphane & Arındırma <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Gelişmiş Algoritmik Eşya Filtresi:</strong> Riot API'sinden çekilen verilerdeki Bami'nin Alevi, Ağırkan gibi "Alt Eşyalar" tespit edildi. Koda <code>!itm.into</code> şartı eklenerek tüm ara eşyalar kökten silindi.</li>
                    <li><strong>Kategorik Sınıflandırma:</strong> Eşya Kütüphanesi 6 farklı zeki başlığa (Dövüşçü, Büyücü, Nişancı, Destek, Tank, Botlar) bölündü.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.25.0 - Dinamik Rehber Entegrasyonu <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Akıllı Meta Rehberi:</strong> Eşya Bilgisi sekmesinde statik olarak hazırlanan şampiyon rehberlerindeki eşyalar Riot API veritabanına bağlandı. Artık rehberdeki ikonların üzerine gelindiğinde orijinal oyun içi Pop-Up'ları açılıyor.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.24.0 - Sinerji Özgürlüğü & Mutlak Görünürlük <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Sinerji Pop-Up Düzeltmesi:</strong> Takım Sinerjisi sekmesindeki maç kartlarında eşya özelliklerinin kesilmesine yol açan tüm gizli <code>overflow: hidden</code> kilitleri tespit edilip parçalandı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.23.0 - Modüler Güncelleme Mimarisi <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Modüler Sistem Altyapısı:</strong> Güncelleme ve enjeksiyon süreçleri parçalı mimariye geçirilerek kodun bakım kolaylığı artırıldı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.22.0 - Oyun İçi Eşya Menü Tasarımı <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Arayüz Şeffaflığı:</strong> Eşya Bilgisi kütüphanesi ve tüm maç geçmişi kartları için oyun içindeki gibi yeşil/sarı stat renklerine sahip Profesyonel Pop-Up panelleri kodlandı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.21.0 - Sınırsız Ufuklar (Limitless Grid) <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Orantılı Grid Mimarisi:</strong> Özet panosunu eşit parçalara bölen katı yapı, içerik yoğunluğuna göre dinamik olarak genişleyen ızgara sistemiyle değiştirildi. Kutuların dar ekranlarda patlamasını engellemek için <code>flex-wrap</code> zırhları entegre edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.20.0 - Derin Veri Konumlandırması <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Metrik Optimizasyonu:</strong> Maç kartlarının ana yüzündeki Hasar Barları takım detay ekranına taşındı. Bireysel sekmenin tepesindeki özet panosuna Toplam Hasar, Tank, Şifa ve Görüş analizleri eklendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.19.0 - Grid Önbellek Kalibrasyonu <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>CSS Çakışma Önleyici:</strong> Özet panosundaki CSS Grid yapısının tarayıcı önbelleğindeki eski kural setleriyle çakışması ve render kaymaları engellendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.18.0 - Kusursuz Simetri ve Izgara Dönüşümü <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Özet Panosu Katı Izgara Sistemi:</strong> Özet kutucuklarındaki CSS Flexbox yapısı tamamen grid mimarisi ile değiştirildi.</li>
                    <li><strong>Gelişmiş İpucu (Tooltip) Optimizasyonu:</strong> Ekranın dışına taşan uzun açıklamalar zırhla terbiye edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.17.0 - Smurf Zekası ve Derin Madencilik Gelişmeleri <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Smurf Zekası (v5.17.0):</strong> Oyuncuların farklı yan hesaplarla oynadığı maçları analiz edip tek bir ana kimlik altında birleştiren altyapı kuruldu. Tablolardaki bölünmeler engellendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.16.0 - Kütüphane & Kozmetik Evrimi <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Yeni Sekme - Eşya Bilgisi ve Rün Düzeni:</strong> Navigasyona spesifik şampiyonlar için durumsal eşya dizilimlerini anlatan kritik meta rehberi ve İnteraktif Rün Tahtası arayüzü kuruldu. Custom CSS Tooltip motoru yazılarak yerel beyaz açıklamalar iptal edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.15.0 - Analitik Şeffaflık & Takım Zekası <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Gelişmiş Sabotaj (V2):</strong> Bir oyuncunun sabotajcı sayılması için artık sadece "Takım Kills" değil, "Takım Toplam Skoru ve Asisti" baz alıyor. Kartların sağ üstüne Takım KDA Paneli entegre edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.14.0 - Porofessor Etiketleri & Derin Madencilik <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Performans Rozetleri:</strong> Maç kartlarının içine oyuncunun davranışını okuyan rozetler eklendi. Uzmanlık ve Sinerji puanı hesaplamalarına şampiyon hasarı, takım kalkanı/şifası, tanklanan hasar ve CC süreleri katıldı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.13.2 - Sezon Filtre Yapılandırması <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Hafıza Yönetimi:</strong> Sürüm geçmişi sekmesi açıldığında, filtre butonlarının DOM yükünü hafifleten geçici bellek boşaltması yapıldı ve render süreleri optimize edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.13.1 - UI Odaklanması <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li>Sürüm Geçmişi sekmesi açıldığında, gereksiz kalabalık yapan "Sezon Filtreleri" ve "Lejant" kutuları gizlenerek tam odaklı bir okuma deneyimi sağlandı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.13.0 - Anayasa Güncellemesi <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li>Sürüm geçmişi doğrudan arayüze entegre edilerek ayrı bir sekme olarak eklendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.12.0 - Kusursuz Simetri <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li>CSS Flexbox hataları nedeniyle özet panosunda yaşanan alt satıra kayma ve formasyon bozulmaları nowrap zırhıyla engellendi. Profil özetindeki 5 kutu askeri nizama sokuldu.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.11.0 - Geniş Açılı Tasarım & Güncel Kimlik <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li>Özet panosu genişliği 1400px'e çıkarıldı. Sistem tüm arşivi taranarak oyuncunun en son kullandığı Sihirdar İkonunu tespit eden ve bunu tüm tablolara yansıtan akıllı hafıza sistemine kavuştu.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.10.1 - Formasyon UI Yaması <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li>Takım Sinerjisi bölümünde kaybolan Kadro Formasyonları CSS etiketleri ve boşluk düzenlemeleri onarıldı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.10.0 - Zirve Analizi & Sabotaj Revizyonu <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Kusursuz Rüya Takımı:</strong> Tüm zamanların verisi taranarak her pozisyonun istatistiksel olarak en kusursuz oyuncusunu bulup bir araya getiren Laplace destekli zeka eklendi. Son 7 günın momentumunu ölçen "Haftanın 5'lisi" algoritması yazıldı.</li>
                    <li><strong>Gelişmiş Sabotaj Algoritması:</strong> Oyuncunun Sabotaj damgası yemesi için artık sadece 12 kere ölmesi yetmiyor. Eğer takım skorunun yarısından fazlasına katkı verdiyse sistem onu Sabotajcı ilan etmiyor.</li>
                    <li>Liderlik filtrelerine "Görüş Skorları" ve "Farm Kralları (CS/min)" sekmeleri eklendi. Destek rolü CS/min liderliğinden adil olmak adına men edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.9.1 - UI Kalibrasyonu <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li>Penta/Quadra/Triple yazılarındaki CSS kayma hatası düzeltildi. Kariyer & Vurgunlar başlığı standart kurumsal formatata çekildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.9.0 - Hizalı ve Dinamik Arayüz <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li>Quadra ve Penta verilerinin yanına Triple Kill istatistiği entegre edildi. Alt filtrelere Quadra, Triple ve İlk Kan filtre düğmeleri eklendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.8.0 - Kozmetik ve İkonik Navigasyon <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li>Riot API'sinden çekilen Sihirdar Profil İkonları arayüze entegre edildi. Tablolar oyuncuların kendi simgeleriyle kişiselleştirildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.7.0 - Dinamik Keskin Nişancı Filtresi <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li>Bireysel profillerde sağ taraftaki rol kartlarına tıklandığında sol taraftaki maç listesinin anında o role göre süzülmesi sağlandı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.6.0 - Dinamik Kimlik Çözümleme (Smurf Entegrasyonu) <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li>Yan hesapların ve eski isimlerin ana kimlikle birleştirildiği altyapı kuruldu. Maç kartlarında o günkü nostaljik isim mühürlü kalıyor.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.5.1 - Kapsamlı Profil Özeti <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li>Bireysel profil özet panosu 4 kutudan 5 kutuya çıkarılarak, "Rol & Donanım" istatistikleri ile yeni eklenen "Vurgunlar & Başarılar" verileri kusursuz bir yatay simetriyle birleştirildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.5.0 - Prestij ve Kozmetik Avcısı <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li>Pentakill, Quadrakill, Çalınan Objektif og İlk Kan verileri entegre edildi. Vurgunlar & Başarılar paneli ve maç kartlarına parlayan rozetler eklendi. Sabotaj tespit sistemi ve Utanç Listesi aktif edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.4.4 - Sinerji Bağlantı Yaması <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li>Alt Koridor listesindeki ikililere tıklandığında maçların listelenmesini engelleyen İsim Eşleştirme hatası giderildi, özel isim çözümleyici yazıldı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.4.3 - Kusursuz Rüya Takımı Revizyonu <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li>"Tüm Zamanların Rüya Takımı" ve "Haftanın 5'lisi" panolarına, algoritmadaki CS/min istatistikleri görsel olarak çivilendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.4.2 - Kompakt Kanban Dizilimi <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li>Şampiyon uzmanları sekmesinde ekran daraldığında ortaya çıkan tasarım hatası giderildi. İstatistiklerin ismin altına kaymasını engelleyen dizilim getirildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.4.1 - Grid Hücre Stabilizasyonu <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Responsive Hücre Hizalaması:</strong> Şampiyon kartlarındaki metin ve ikonların ekran daraldığında taşmasını önleyen esnek flexbox sınırları tahkim edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.4.0 - Şampiyon Rol Hiyerarşisi (Kaan'ın Vizyonu) <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Rol Hiyerarşisi (Görsel Dağılım):</strong> Şampiyon uzmanları sekmesindeki düz liste mimarisi yıkıldı. Şampiyon uzmanları rollere göre kategorize edilerek büyük başlıklar altında gruplandı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.3.0 - Kompakt Şablon Çekirdek Entegrasyonu <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Arka Plan Düzen İskeleti:</strong> Sinerji ve takım kompozisyonu verilerini işlemek üzere arka planda çalışacak ilk şablon katmanı iskelete dahil edildi, veri transfer hızı optimize edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.2.0 - Şampiyon Raporu Rol Ayrımı <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Şampiyon Raporu Rol Ayrımı (Role Isolation):</strong> Destek rolü ile koridor rollerinin minyon verilerinin aynı havuzda eriyerek cezalandırılması engellendi. Sağ taraftaki Şampiyon Raporu tekil yapıdan çıkarıldı; sistem her rol için ayrı bir rapor kartı basıyor.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.1.0 - Kadro Formasyonları & Rol Esnekliği <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>"Kadro Formasyonları" Alt Tablosu:</strong> Sinerji tablosundaki herhangi bir ekibe tıklandığında açılan detay panelinde, o ekibin hangi Rol Dağılımıyla (Formasyonla) kaç maç oynadığı ve bu dizilişin net galibiyet oranları listelenmeye başladı.</li>
                    <li><strong>Rol Esnekliği Katsayısı:</strong> Laplace Sinerji Puanı algoritmasına yeni bir katsayı eklendi. Farklı rollerde de galibiyet alabilen ekiplerin esneklik gücü sistem tarafından ödüllendirilerek SP skorları yukarı çekildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v5.0.0 (Eski V55) - Hasat Zamanı & Ekonomi Devrimi <span class="yama-tarih">01 May 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>SemVer Standardizasyonu:</strong> Versiyonlama mantığı Semantic Versioning standardına (v5.0.0) çekildi.</li>
                    <li><strong>Büyük Veri Entegrasyonu:</strong> Sadece KDA değil; Orman/Koridor minyon ayrımı, Dakika Başına Düşen Minyon (CS/min), Toplam Görüş, Tanklanan Hasar, Şifa ve Kitle Kontrol süreleri arayüze işlendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v4.9.4 (Eski V54) - Sabotaj Harekâtı <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Bireysel profillerdeki "11+ Ölüm" ifadesi doğrudan kırmızı "SABOTAJ" etiketiyle değiştirilerek dürüst bir forma dönüştürüldü.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v4.9.3 (Eski V52-V53) - Kusursuz Simetri ve Akıllı Navigasyon <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Filtreleme ve arama kutularının sola yaslanma sorunu çözüldü, tüm kutular ekran merkezine hizalandı. Liderlik tablolarındaki ilk 3 sıraya Altın, Gümüş ve Bronz podyum parlamaları getirildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v4.9.2 (Eski V51) - Büyük Uyanış <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Destek profillerinin yüklenmesi sırasında arayüzü çökerten (k is not defined) ortalama skor/asist matematiği hatası tamamen çözüldü.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v4.9.1 (Eski V50) - Kimlik Operasyonu & Nihai Temizlik <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Metinlerin alt satıra düşmesini engelleyen CSS korumaları uygulandı. TR sunucusundan taşınan hesapların ve "lilliana" gibi eski isimlerin eşleştirilmesini sağlayan kimlik çözümleyici sisteme entegre edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v4.9.0 (Eski V49) - Null Koruması Ön Hazırlık Katmanı <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li><strong>Hata Yakalama Altyapısı:</strong> API'den gelen bozuk eski Riot verilerinin ve kayıp rün ID'lerinin arayüzü kilitlemesini engellemek amacıyla ilk Null durumları için yakalama blokları iskelete dahil edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v4.8.0 (Eski V48) - Saf Kan Ekip & Çelik Zırh <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Fiyatı veya veritabanı kaydı olmayan bozuk eski Riot eşyalarının arayüzü çökerterek "Fatal Error" verdirmesi engellendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v4.7.0 (Eski V47) - Özgür Profiller <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Lejant ve eşya barlarındaki CSS sıkışmaları ile solo maç filtresinin neden olduğu profillerin silinmesi hatası çözüldü.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v4.6.0 (Eski V44-V46) - Yalnız Kurt Silici & Zaman Senkronizasyonu <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Ekip içinden en az 2 kişi olmayan solo Esnek maçları sistemden çöpe atan "Saf Kan Ekip" filtresi eklendi. Maç bilgisindeki tarih ve süre eksikliğini kopyalayarak çözen "Zaman Senkronizasyonu" oluşturuldu.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v4.5.0 (Eski V43) - Okunabilirlik ve Sabit Kadro <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Görseldeki metin boyutları büyütüldü (1.8em). Sisteme 15 kişilik kadro kodla sabitlendi, böylece Esnek maç atmayan kişilerin de profillerinde yer alması sağlandı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v4.4.0 (Eski V41-V42) - UI Restorasyonu ve Zaman Damgaları <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>HTML profilleri restore edildi, zaman ve maç süresi etiketleri profillere yerleştirildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v4.3.0 (Eski V38-V40) - Rüya Takımı ve Haftanın Beşlisi <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Maç zamanlarının analize katılmasıyla "Haftanın 5'lisi" ve rol bazlı "Tüm Zamanların Rüya Takımı" sekmeleri eklendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v4.2.0 (Eski V36-V37) - Davranış Kalibrasyonu ve Uzmanlık Puanı <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Sinerji Skoru (SP) ile Şampiyon Uzmanlık Puanı (UP) terimleri görsel ve ismen ayrıldı. Mükerrer maç silici eklendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v4.1.0 (Eski V34-V35) - Şampiyon Makyajı ve Alfabetik Sıralama <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Riot API'den dönen hatalı kod isimlerinin arayüzde doğru gözükmesi için makyaj sözlüğü eklendi. Alfabetik sıralama Türkçe'ye uygun hale getirildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v4.0.1 (Eski V33) - KDA Eşitlik Bozucu <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Şampiyon uzmanları tablosunda galibiyet oranları eşit olduğunda "KDA" değerinin eşitlik bozucu olarak kullanılması sağlandı.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v4.0.0 (Eski V31-V32) - Markalaşma ve Çoklu Sinerji Seçimi <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Sitenin HTML başlığı ve logosu "YazlıkDC.GG" olarak markalaştırıldı. Takım Sinerjisi kısmına çoklu seçim yapılabilen Filtre Çipleri entegre edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v3.3.1 (Eski V30) - Zaman Çizgisi Yaması <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>ABW geçişi sonrası EUW maçlarının TR maçlarının altında kalmasına neden olan alfabetik hata çözüldü.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v3.3.0 (Eski V28-V29) - Role-Aware AI ve Pervasız Sendromu <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Oyuncuların fazla ölüp az skor çıkardığı maçları tespit eden "Yasuo Sendromu (Pervasız)" filtresi yazıldı. Davranış algoritması rollere özel hale getirildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v3.2.0 (Eski V27) - Ultimate Player Analytics <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Oyunculara birden fazla oyun tarzı rozeti verilebilmesini sağlayan çoklu-etiket sistemi getirildi. Sağ sütuna detaylı "Şampiyon Raporu" paneli eklendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v3.1.1 (Eski V26) - Kişisel Filtreler ve UI Şeffaflığı <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Bireysel profile "Perfect KDA", "11+ Ölüm" ve şampiyon filtreleme özellikleri eklendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v3.1.0 (Eski V25) - Yapay Zeka Sinerjisi ve Rol Esnekliği <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Sinerji puanına, takımların farklı dizilimlerle oynayabilme başarısını ölçen "Rol Esnekliği" katsayısı eklendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v3.0.0 (Eski V24) - OP.GG Ultimate <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Sürüm Geçmişi arayüzü bağımsız bir sekme olarak anayasaya dönüştürüldü. Açılır pencereler profil içi akordeon düzene geçirildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v2.2.0 (Eski V23) - Gerçek Eşya Filtresi ve Maç Otopsi Ekranı <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Eşya filtresine Riot API entegrasyonu sağlandı ve sadece bitmiş eşyalar gösterilmeye başlandı. Takım istatistiklerini OP.GG tarzında açan sistem geliştirildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v2.1.0 (Eski V22) - Ultimate Scouting <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Liderlik tabloları filtre butonlarına dönüştürüldü. Otomatik oyun tarzı rozetleri atayan sistem, favori eşyalar paneli ve şampiyon ikonları eklendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v2.0.0 (Eski V21) - Veri Bilimi Zekası <span class="yama-tarih">30 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Bireysel liderlik tabloları Tek Maç Rekorlarına göre sıralanmaya başladı. Takım Sinerjisi kazanma oranlarına Laplace Yumuşatması algoritması entegre edildi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v1.2.0 (Eski V20) - Final UX <span class="yama-tarih">29 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>En çok ölenler sekmesi "☠️ Utanç Listesi" olarak adlandırıldı. Ortalama ibareleri eklendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v1.1.0 (Eski V18-V19) - Genişletilmiş Lejant ve İkonlar <span class="yama-tarih">29 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Sitedeki ikonların ne anlama geldiğini açıklayan çok kapsayıcı bir "Rozet Bilgisi (Lejant)" çubuğu eklendi.</li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti">
                <div class="yama-baslik">v1.0.0 (Eski V1-V17) - Temel İnşa Dönemi <span class="yama-tarih">29 Nis 2026</span></div>
                <ul class="yama-liste">
                    <li>Sistemin temelleri atıldı. Temel Firebase bağlantısı sağlandı ve saf maç verileri (Kazanma, Kaybetme, KDA) arayüze yansıtıldı.</li>
                </ul>
            </div>
            `
        ];

        // 🤖 OTONOM BOT YAMALARI MOTORU
        const botYamalari = [
            `
            <div class="yama-karti" style="border-color: #ffd700;">
                <ul class="yama-liste">
                    <li><strong>v4.0.0:</strong> Çoklu Kuyruk Motoru ve Mutlak İzolasyon:</strong> Python botunun API kancası genişletildi. Sadece Sıralı Esnek değil, Sihirdar Vadisi Clash ve ARAM Clash turnuvaları da otonom olarak avlanıyor. Turnuva verilerinin, Esnek maçlarıyla karışıp istatistikleri zehirlemesi engellendi ve veriler doğrudan izole bir depoya yönlendirildi. <span class="yama-tarih" style="float: right;">21 Haz 2026</span></li>
                </ul>
            </div>
            `,
            `
            <div class="yama-karti" style="border-color: #ffd700;">
                <ul class="yama-liste">
                    <li style="margin-top: 20px;"><strong>v3.2.1:</strong> "Büyük 'K' Operasyonu ve Re-Senkronizasyon". Riot API'nin CamelCase yapısındaki uyuşmazlık (pentakills yerine pentaKills) giderilip sistemin çoklu skorları "0" olarak okuması engellendi. Geçici bypass (pass) metoduyla veritabanı hafızası sıfırlandı, tüm eski maçlar taranarak kayıp Quadra ve Pentalar sisteme mühürlendi. <span class="yama-tarih" style="float: right;">15 May 2026</span></li>
                    <li style="margin-top: 20px;"><strong>v3.2.0:</strong> "Derin Rün Madenciliği". Riot API üzerinden <code>perks</code> objesi parçalanarak oyuncuların seçtiği <em>Ana Rün</em>, <em>Alt Rün Ağacı</em> ve maçta kullanılan tüm <em>alt rünlerin ID'leri</em> (array olarak) otonom şekilde çekilip Firebase'e aktarılmaya başlandı. <span class="yama-tarih" style="float: right;">15 May 2026</span></li>
                    <li style="margin-top: 20px;"><strong>v3.1.0 (Eski v23):</strong> "Volkanik Veri Takibi". Maç bazlı CS farkı verileri üzerinden 'Flame Horizon' (100+ fark) durumlarını anlık tespit eden ve veritabanında bayraklayan (flagging) mantıksal katman eklendi. <span class="yama-tarih" style="float: right;">15 May 2026</span></li>
                    <li style="margin-top: 20px;"><strong>v3.0.0 (Eski v22):</strong> "Kahin (Oracle) Motoru". Riot'un gizli 'Challenges' (Görevler) API'sine bağlantı kuruldu. Salt skor tablosu aşılarak; Dakika Başı Altın (GPM), 10. Dakika Minyonu, Koridor Minyon Farkı ve Erken Oyun Üstünlüğü gibi kompleks ekonomi metrikleri veri tabanına mühürlenmeye başlandı. <span class="yama-tarih" style="float: right;">06 May 2026</span></li>
                    <li style="margin-top: 20px;"><strong>v2.6.0 (Eski v19-v21):</strong> "Bağlantı Dedektifi". Sinerji ağlarını kurabilmek için, aynı takımda alt koridoru (Nişancı ve Destek) paylaşan oyuncuları tespit edip "koridor_partneri" değişkeniyle birbirine bağlayan otonom ilişki algoritması yazıldı. <span class="yama-tarih" style="float: right;">01 May 2026</span></li>
                    <li style="margin-top: 20px;"><strong>v2.5.0 (Eski v18):</strong> "Derin Veri Madenciliği". Hasar, Kalkan, İyileştirme, CC Süresi ve Kule yıkım metrikleri arşive kazındı. <span class="yama-tarih" style="float: right;">29 Nis 2026</span></li>
                    <li style="margin-top: 20px;"><strong>v2.4.0 (Eski v17):</strong> Sabotaj algoritması için takımın toplam skorunu (takim_skoru) hesaplayan analiz zekası eklendi. <span class="yama-tarih" style="float: right;">29 Nis 2026</span></li>
                    <li style="margin-top: 20px;"><strong>v2.3.1 (Eski v16):</strong> "Tam Katliam" güncellemesiyle Triple Kill (Üçte Üç) verileri toplanmaya başlandı. <span class="yama-tarih" style="float: right;">29 Nis 2026</span></li>
                    <li style="margin-top: 20px;"><strong>v2.3.0 (Eski v14):</strong> Penta, Quadra, Çalınan Objektif ve İlk Kan gibi prestij verilerini çeken "Kozmetik Avcısı" zekası entegre edildi. API kotasını korumak için sadece 'penta' verisi eksik olan maçları tespit eden zeki bypass sistemi (Upsert) yazıldı. <span class="yama-tarih" style="float: right;">29 Nis 2026</span></li>
                    <li style="margin-top: 20px;"><strong>v2.2.0 (Eski V13):</strong> Sabit maç tarama limitleri kaldırılarak, Riot sunucuları boş liste döndürene kadar geçmiş sezonların diplerine inen "Derin Tarama (Infinite Pagination - Arkeolog)" döngüsü eklendi. <span class="yama-tarih" style="float: right;">29 Nis 2026</span></li>
                    <li style="margin-top: 20px;"><strong>v2.1.0 (Eski V12):</strong> "429 Too Many Requests" hız sınırlarına takıldığında otomatik beklemeye giren (get_guvenli) güvenli istek sistemi (Çelik İrade). <span class="yama-tarih" style="float: right;">29 Nis 2026</span></li>
                    <li style="margin-top: 20px;"><strong>v2.0.0 (Eski V11):</strong> Riot API'den gameCreation (Tarih) ve gameDuration (Maç Süresi) parametrelerinin toplanmaya başlanması. <span class="yama-tarih" style="float: right;">29 Nis 2026</span></li>
                    <li style="margin-top: 20px;"><strong>v1.2.0 (Eski V10-V10.1):</strong> Botun gereksiz istek atarak kotaları harcamasını önleyen "Firebase Hafızası (Upsert)" mekanizması ve boşluklu isimleri kodlayan (URL Encoding) yapı. <span class="yama-tarih" style="float: right;">29 Nis 2026</span></li>
                    <li style="margin-top: 20px;"><strong>v1.1.0 (Eski V9):</strong> Yalnızca son maçlar yerine eski sezonları kapsayan derin 300 maçlık tarama limitine çıkılması. <span class="yama-tarih" style="float: right;">29 Nis 2026</span></li>
                    <li style="margin-top: 20px;"><strong>v1.0.0 (Eski V8):</strong> Tüm ekip üyelerinin tanımlanarak 5 kişilik maçların 2 kişilik görünmesini çözen çoklu tarama sistemi. <span class="yama-tarih" style="float: right;">29 Nis 2026</span></li>
                </ul>
            </div>
            `
        ];

        return `
        <div style="max-width: 1000px; margin: 0 auto; padding-bottom: 50px;">
            <h2 style="color: #ffffff; text-align: center; margin-bottom: 30px; letter-spacing: 1px;">YAZLIKDC.GG SÜRÜM GEÇMİŞİ (PATCH NOTES)</h2>

            <!-- EN SON WEB YAMASI OTONOM OLARAK BURAYA ÇEKİLİR -->
            ${webYamalari[0]}

            <button id="btn-eski-yamalar" class="daha-fazla-btn" style="margin-bottom: 40px;">⬇️ Eski Arayüz Sürümlerini Aç</button>
            
            <div id="eski-yamalar-kapsayici" class="gizle">
                <!-- GERİYE KALAN TÜM WEB YAMALARI BURAYA BASILIR -->
                ${webYamalari.slice(1).join("")}
            </div>

            <br><br><br>

            <h3 style="color: #ffd700; text-align: center; margin-bottom: 30px; letter-spacing: 1px;">🤖 PYTHON BOT SÜRÜM GEÇMİŞİ</h3>
            
            <!-- EN SON BOT YAMASI OTONOM OLARAK BURAYA ÇEKİLİR -->
            ${botYamalari[0]}

            <button id="btn-eski-bot-yamalar" class="daha-fazla-btn" style="margin-bottom: 20px; border-color: #ffd700; color: #ffd700; background: rgba(255, 215, 0, 0.1);">⬇️ Bot Geçmişini Aç</button>

            <div id="bot-eski-yamalar-kapsayici" class="gizle">
                <!-- GERİYE KALAN TÜM BOT YAMALARI BURAYA BASILIR -->
                ${botYamalari.slice(1).join("")}
            </div>
        </div>`;
    }
};
/* ==============================================================================
   🚀 SİSTEM BAŞLATICISI VE EŞYA PARSER ZIRHI (DOĞRUDAN 16.12.1 VERİTABANI)
============================================================================== */
const statDisplay = {
    "saldırı gücü": { ad: "Saldırı Gücü", renk: "#ffb84d", ikon: "⚔️" }, "yetenek gücü": { ad: "Yetenek Gücü", renk: "#9ea1f9", ikon: "🔮" }, "zırh delme": { ad: "Zırh Delme", renk: "#e65c00", ikon: "⛏️" }, "zırh deşme": { ad: "Zırh Deşme", renk: "#ff4500", ikon: "🪓" },
    "zırh": { ad: "Zırh", renk: "#ffd700", ikon: "🛡️" }, "büyü direnci": { ad: "Büyü Direnci", renk: "#87cefa", ikon: "🧿" }, "büyü nüfuzu": { ad: "Büyü Nüfuzu", renk: "#8e44ad", ikon: "🌌" }, "yetenek hızı": { ad: "Yetenek Hızı", renk: "#ffffff", ikon: "⏳" },
    "saldırı hızı": { ad: "Saldırı Hızı", renk: "#ffeb3b", ikon: "🗡️" }, "hareket hızı": { ad: "Hareket Hızı", renk: "#aee2ff", ikon: "👟" }, "kritik vuruş ihtimali": { ad: "Kritik Vuruş İhtimali", renk: "#f35b5a", ikon: "🎯" }, "kritik vuruş hasarı": { ad: "Kritik Vuruş Hasarı", renk: "#ff8c00", ikon: "💥" }, "can": { ad: "Can", renk: "#a1d586", ikon: "❤️" },
    "mana": { ad: "Mana", renk: "var(--accent-color)", ikon: "💧" }, "can çalma": { ad: "Can Çalma", renk: "#da3633", ikon: "🩸" }, "mutlak sömürü": { ad: "Mutlak Sömürü", renk: "#da3633", ikon: "🧛" }, "can yenilenmesi": { ad: "Can Yenilenmesi", renk: "#a1d586", ikon: "💖" },
    "mana yenilenmesi": { ad: "Mana Yenilenmesi", renk: "#aee2ff", ikon: "🌊" }, "sıvışma": { ad: "Sıvışma", renk: "#e0e0e0", ikon: "🏃🏻" }, "iyileştirme ve kalkan gücü": { ad: "İyileştirme ve Kalkan Gücü", renk: "#3fb950", ikon: "🌿" }
};

async function sistemiBaslat() {
    try {
        // Değişkenleri sıfırla
        Sistem.veriler = [];
        Sistem.verilerClash = [];

        // 1. Ana Depoyu (Esnek) Çek
        const snap = await getDocs(collection(db, "gercek_maclar"));
        snap.forEach(d => Sistem.veriler.push(d.data()));

        // 2. 🏆 Yeni Depoyu (Clash Arenası) Çek
        const snapClash = await getDocs(collection(db, "gercek_maclar_clash"));
        snapClash.forEach(d => Sistem.verilerClash.push(d.data()));

        console.log(`[BAŞARILI] ${Sistem.veriler.length} Esnek, ${Sistem.verilerClash.length} Clash maçı cebe indirildi!`);

        // 🛡️ GLOBAL İKON VE KİMLİK MOTORU (Veriler çekildikten hemen sonra çalışmalı)
        let guncelIkonlarGlobal = {};

        // 1. En güncel maçları bul ve herkesin en son kullandığı ikonu hafızaya al
        let siraliVeriler = [...Sistem.veriler].sort((a, b) => (b.tarih_ms || 0) - (a.tarih_ms || 0));
        siraliVeriler.forEach(m => {
            // 🎯 KİMLİK ÇÖZÜCÜ: Literation veya DarkLegend97 fark etmez, asıl ismi bul (Örn: "Kaan")
            let anaIsim = typeof Yardimci !== 'undefined' ? Yardimci.analizIsimGetir(m.oyuncu, m.riot_id) : m.oyuncu;

            if (m.profil_ikonu && !guncelIkonlarGlobal[anaIsim]) {
                guncelIkonlarGlobal[anaIsim] = m.profil_ikonu;
            }
        });

        // 2. Sistemin bütün damarlarına (tüm maçlara) en güncel ikonu ve ANA İSMİ enjekte et
        Sistem.veriler.forEach(m => {
            let anaIsim = typeof Yardimci !== 'undefined' ? Yardimci.analizIsimGetir(m.oyuncu, m.riot_id) : m.oyuncu;

            m.profil_ikonu = guncelIkonlarGlobal[anaIsim] || 29;

            // 🎯 BÜYÜK TEMİZLİK: Sisteme giren her veri artık tek isme sabitlendi! 
            m.oyuncu = anaIsim;
        });

        Router.menuyuKur();
        Router.git("sunucu", "📊 Sunucu Özeti");

        if (!window.itemVeritabani) {
            // RiotCDN.surum üzerinden çekecek ki o artık 16.12.1 !
            let res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${RiotCDN.surum}/data/tr_TR/item.json?v=` + new Date().getTime());
            let itemData = await res.json();

            // 🎯 KAAN'IN VIP YAMASI: RİOT'UN BOZDUĞU VEYA SİLDİĞİ EŞYALARI ELLE ZORLA YAZIYORUZ!
            const ozelEsyalar = {
                "3032": {
                    altin: 3100,
                    ekAd: "Yun Tal Yabanokları",
                    desc: "<mainText><stats><attention> 50</attention> Saldırı Gücü<br><attention> 40%</attention> Saldırı Hızı<br><attention> 25%</attention> Kritik Vuruş İhtimali</stats><br><passive>Pratik Ölümcülleştirir</passive><br>Saldırı halinde en fazla %25 olacak şekilde kalıcı kritik vuruş ihtimali kazandırır.<br><br><passive>Ok Salvosu</passive><br>Bir rakip şampiyona saldırı halinde 6 saniyeliğine <speed>30% Saldırı Hızı</speed> kazandırır (30 saniye bekleme süresi).<br>Bu bekleme süresini normal saldırılar 1 saniye, kritik vuruşlar 2 saniye azaltır.</mainText>"
                },
                "3042": { altin: 2900, ekAd: "Muramana (Tam Yük)" },
                "3040": { altin: 2900, ekAd: "Seraph'ın Şefkati" },
                "3121": { altin: 2600, ekAd: "Fimbul Kışı" },
                "3869": { altin: 400, ekAd: "Göksel Muhalefet" },
                "3870": { altin: 400, ekAd: "Rüya Yapan" },
                "3871": { altin: 400, ekAd: "Zaz'Zak'ın Dikenleri" },
                "3876": { altin: 400, ekAd: "Gündönümü Kızağı" },
                "3877": { altin: 400, ekAd: "Kan Şarkısı" },
                "6655": { altin: 2850, ekAd: "Luden'in Feryadı" },
            };

            for (let key in ozelEsyalar) {
                if (!itemData.data[key]) itemData.data[key] = {}; // Eğer Riot tamamen silmişse biz zorla obje açıyoruz
                itemData.data[key].gold = { total: ozelEsyalar[key].altin };
                itemData.data[key].name = ozelEsyalar[key].ekAd;
                if (ozelEsyalar[key].desc) itemData.data[key].description = ozelEsyalar[key].desc;
            }
            // GİZLİ DESCRIPTION YAZICISI VE BOYAMA (Sadece bir kez çalışır)
            for (let id in itemData.data) {
                let itm = itemData.data[id];
                if (itm.boyandiMi) continue;

                let rawDesc = itm.description || itm.plaintext || "";
                let plainName = itm.name || "";
                let gold = (itm.gold && itm.gold.total) ? itm.gold.total : 0;

                itm.parsedStats = {};
                let statsMatch = rawDesc.match(/<stats>(.*?)<\/stats>/si);
                let textToParse = statsMatch ? statsMatch[1] : "";

                if (textToParse !== "") {
                    let statLines = textToParse.split(/<br\s*\/?>|<\/?div[^>]*>|\n/gi);
                    statLines.forEach(line => {
                        let cleanLine = line.replace(/<[^>]*>?/gm, ' ').trim();
                        if (!cleanLine || cleanLine.toLowerCase().includes("pasif") || cleanLine.toLowerCase().includes("aktif")) return;

                        let numMatch = cleanLine.match(/([+0-9.,]+)%?/);
                        if (numMatch) {
                            let valStr = numMatch[1];
                            let statName = cleanLine.replace(valStr, '').trim();
                            let val = parseFloat(valStr.replace('%', '').replace(',', '.').replace('+', ''));
                            let normName = tR(statName).replace(/[^\w\sğüşıöç]/gi, '').trim();

                            let mappedKey = normName;
                            if (normName.includes("büyü nüfuz")) mappedKey = "büyü nüfuzu";
                            else if (normName.includes("yetenek güc")) mappedKey = "yetenek gücü";
                            else if (normName.includes("saldırı güc")) mappedKey = "saldırı gücü";
                            else if (normName.includes("zırh delme")) mappedKey = "zırh delme";
                            else if (normName.includes("zırh deşme") || normName.includes("lethality")) mappedKey = "zırh deşme";
                            else if (normName === "zırh" || (normName.includes("zırh") && !normName.includes("delme") && !normName.includes("deşme"))) mappedKey = "zırh";
                            else if (normName.includes("büyü direnc")) mappedKey = "büyü direnci";
                            else if (normName.includes("yetenek hız") || normName.includes("ulti")) mappedKey = "yetenek hızı";
                            else if (normName.includes("saldırı hız")) mappedKey = "saldırı hızı";
                            else if (normName.includes("hareket hız")) mappedKey = "hareket hızı";
                            else if (normName.includes("kritik") && normName.includes("hasar")) mappedKey = "kritik vuruş hasarı";
                            else if (normName.includes("kritik")) mappedKey = "kritik vuruş ihtimali";
                            else if (normName.includes("can yenilenmes")) mappedKey = "can yenilenmesi";
                            else if (normName.includes("mana yenilenmes")) mappedKey = "mana yenilenmesi";
                            else if (normName.includes("can çalm")) mappedKey = "can çalma";
                            else if (normName.includes("mutlak sömürü")) mappedKey = "mutlak sömürü";
                            else if (normName.includes("sıvışma")) mappedKey = "sıvışma";
                            else if (normName.includes("iyileştirme") || normName.includes("kalkan")) mappedKey = "iyileştirme ve kalkan gücü";
                            else if (normName === "can") mappedKey = "can";
                            else if (normName === "mana") mappedKey = "mana";

                            if (!isNaN(val)) itm.parsedStats[mappedKey] = val;
                        }
                    });
                }

                let subTitle = "Eşya";
                if (itm.tags) {
                    if (itm.tags.includes("Boots")) subTitle = "Çizme";
                    else if (gold < 1500 && !itm.tags.includes("Consumable")) subTitle = "Alt Eşya";
                    else if (itm.tags.includes("Damage")) subTitle = "Saldırı Gücü";
                    else if (itm.tags.includes("SpellDamage")) subTitle = "Yetenek Gücü";
                    else if (itm.tags.includes("Armor") || itm.tags.includes("Health")) subTitle = "Tank / Savunma";
                    else if (itm.tags.includes("ManaRegen") || itm.tags.includes("GoldPer")) subTitle = "Destek";
                }

                let parsedHtml = rawDesc.replace(/<mainText>/gi, '').replace(/<\/mainText>/gi, '');
                parsedHtml = parsedHtml.replace(/(?:<br\s*\/?>){1,}/gi, '<div style="margin-bottom: 10px;"></div>');

                let newStatsContent = "";
                for (let skey in itm.parsedStats) {
                    let sInfo = statDisplay[skey] || { ad: skey.toUpperCase(), renk: "#a09b8c", ikon: "•" };
                    let isPct = skey.includes("ihtimali") || skey.includes("hasarı") || skey.includes("çalma") || skey.includes("sömürü") || skey.includes("delme") || skey.includes("nüfuzu") || skey.includes("sıvışma") || skey.includes("yenilenmesi") || skey.includes("iyileştirme") || skey.includes("hızı") && !skey.includes("yetenek hızı") && !skey.includes("hareket hızı");
                    let dVal = itm.parsedStats[skey] + (isPct ? "%" : "");

                    newStatsContent += `<div style="display:flex; align-items:center; margin-bottom:6px; font-size:1.05em; gap:8px;">
                                            <span>${sInfo.ikon}</span> 
                                            <b style="color:#ffffff;">+${dVal}</b> 
                                            <span style="color:${sInfo.renk}; font-weight:bold;">${sInfo.ad}</span>
                                        </div>`;
                }

                // STATS BLOĞUNU ÇİFTE BOYAMADAN KORUMAK İÇİN KASAYA ALIYORUZ
                if (statsMatch) {
                    parsedHtml = parsedHtml.replace(statsMatch[0], '@@STATS_BLOCK@@');
                } else if (newStatsContent !== "") {
                    parsedHtml = '@@STATS_BLOCK@@' + parsedHtml;
                }

                // 🎯 PASİF METİN İÇİ RE-PARSER (Sadece tekil harf setleri)
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Kritik Vuruş İhtimali", statDisplay["kritik vuruş ihtimali"].ikon, statDisplay["kritik vuruş ihtimali"].renk);
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Kritik Vuruş Hasarı", statDisplay["kritik vuruş hasarı"].ikon, statDisplay["kritik vuruş hasarı"].renk);
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Can Yenilenmesi", statDisplay["can yenilenmesi"].ikon, statDisplay["can yenilenmesi"].renk);
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Mana Yenilenmesi", statDisplay["mana yenilenmesi"].ikon, statDisplay["mana yenilenmesi"].renk);
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Büyü Nüfuzu", statDisplay["büyü nüfuzu"].ikon, statDisplay["büyü nüfuzu"].renk);
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Yetenek Gücü", statDisplay["yetenek gücü"].ikon, statDisplay["yetenek gücü"].renk);
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Saldırı Gücü", statDisplay["saldırı gücü"].ikon, statDisplay["saldırı gücü"].renk);
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Büyü Direnci", statDisplay["büyü direnci"].ikon, statDisplay["büyü direnci"].renk);
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Hareket Hızı", statDisplay["hareket hızı"].ikon, statDisplay["hareket hızı"].renk);
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Saldırı Hızı", statDisplay["saldırı hızı"].ikon, statDisplay["saldırı hızı"].renk);
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Yetenek Hızı", statDisplay["yetenek hızı"].ikon, statDisplay["yetenek hızı"].renk);
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Mutlak Sömürü", statDisplay["mutlak sömürü"].ikon, statDisplay["mutlak sömürü"].renk);
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Zırh Delme", statDisplay["zırh delme"].ikon, statDisplay["zırh delme"].renk);
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Zırh Deşme", statDisplay["zırh deşme"].ikon, statDisplay["zırh deşme"].renk);
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Can Çalma", statDisplay["can çalma"].ikon, statDisplay["can çalma"].renk);
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Sıvışma", statDisplay["sıvışma"].ikon, statDisplay["sıvışma"].renk);
                parsedHtml = replaceWithLeftIcon(parsedHtml, "İyileştirme ve Kalkan Gücü", statDisplay["iyileştirme ve kalkan gücü"].ikon, statDisplay["iyileştirme ve kalkan gücü"].renk);

                // 🛑 KRİTİK GÖRSEL AYIRMA ZIRHLARI (Lookahead Enjeksiyonları)
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Zırh", statDisplay["zırh"].ikon, statDisplay["zırh"].renk, "(?!\\s*Delme|\\s*Deşme)");
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Can", statDisplay["can"].ikon, statDisplay["can"].renk, "(?!\\s*Yenilenmesi|\\s*Çalma|\\s*Simidi)");
                parsedHtml = replaceWithLeftIcon(parsedHtml, "Mana", statDisplay["mana"].ikon, statDisplay["mana"].renk, "(?!\\s*Yenilenmesi)");

                parsedHtml = parsedHtml.replace(/<passive>(.*?)<\/passive>/gi, '<b style="color:#f85149;">$1</b>')
                    .replace(/<active>(.*?)<\/active>/gi, '<b style="color:var(--hextech-blue);">$1</b>')
                    .replace(/<rules>(.*?)<\/rules>/gi, '<div style="margin-top:8px; font-size:0.85em; color:#8b949e; line-height:1.4;">$1</div>')
                    .replace(/<attention>(.*?)<\/attention>/gi, '<b style="color:#ffffff;">$1</b>')
                    .replace(/<healing>(.*?)<\/healing>/gi, '<span style="color:#a1d586; font-weight:bold;">$1</span>')
                    .replace(/<shield>(.*?)<\/shield>/gi, '<span style="color:#ffd700; font-weight:bold;">$1</span>')
                    .replace(/<truedamage>(.*?)<\/truedamage>/gi, '<span style="color:#ffffff; font-weight:bold;">$1</span>')
                    .replace(/<physicaldamage>(.*?)<\/physicaldamage>/gi, '<span style="color:#ffb84d; font-weight:bold;">$1</span>')
                    .replace(/<magicdamage>(.*?)<\/magicdamage>/gi, '<span style="color:#9ea1f9; font-weight:bold;">$1</span>')
                    .replace(/<scalead>(.*?)<\/scalead>/gi, '<span style="color:#ffb84d; font-weight:bold;">$1</span>')
                    .replace(/<scaleap>(.*?)<\/scaleap>/gi, '<span style="color:#9ea1f9; font-weight:bold;">$1</span>')
                    .replace(/<scalelethality>(.*?)<\/scalelethality>/gi, '<span style="color:#ff4500; font-weight:bold;">$1</span>')
                    .replace(/<scalearmor>(.*?)<\/scalearmor>/gi, '<span style="color:#ffd700; font-weight:bold;">$1</span>')
                    .replace(/<scalemr>(.*?)<\/scalemr>/gi, '<span style="color:#87cefa; font-weight:bold;">$1</span>')
                    .replace(/<speed>(.*?)<\/speed>/gi, '<span style="color:#aee2ff; font-weight:bold;">$1</span>')
                    .replace(/<status>(.*?)<\/status>/gi, '<span style="color:#e0e0e0; font-weight:bold;">$1</span>')
                    .replace(/<keyword>(.*?)<\/keyword>/gi, '<span style="color:#da3633; font-weight:bold;">$1</span>')
                    .replace(/<onhit>(.*?)<\/onhit>/gi, '<span style="color:#ffeb3b; font-weight:bold;">$1</span>')
                    .replace(/<attackspeed>(.*?)<\/attackspeed>/gi, '<span style="color:#ffeb3b; font-weight:bold;">$1</span>')
                    .replace(/<scalemana>(.*?)<\/scalemana>/gi, '<span style="color:var(--accent-color); font-weight:bold;">$1</span>')
                    .replace(/<raritylegendary>(.*?)<\/raritylegendary>/gi, '<span style="color:#c8aa6e; font-weight:bold;">$1</span>');

                // KASADAKİ STATS BLOĞUNU PARSEDHTML İÇİNE GÜVENLİ GERİ SALIYORUZ
                if (newStatsContent !== "") {
                    let theStats = `<div class="modern-stats-box" style="display:flex; flex-direction:column; margin-bottom:12px; border-bottom:1px solid #1e2328; padding-bottom:12px;">${newStatsContent}</div>`;
                    parsedHtml = parsedHtml.replace('@@STATS_BLOCK@@', theStats);
                }

                let imgUrl = `https://ddragon.leagueoflegends.com/cdn/${RiotCDN.surum}/img/item/${id}.png`;
                let fallbackUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/items/icons2d/${id}.png`;

                itm.parsedDescription = `
                    <div style="display: flex; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 15px;">
                        <img src="${imgUrl}" onerror="this.onerror=null; this.src='${fallbackUrl}';" style="width: 48px !important; height: 48px !important; border-radius: 6px; border: 1px solid var(--border-color); margin-right: 12px; display: block;">
                        <div style="flex-grow: 1;">
                            <div style="color: var(--hextech-gold); font-weight: bold; font-size: 1.2em; line-height: 1.1;">${plainName}</div>
                            <div style="color: var(--accent-color); font-size: 0.75em; text-transform: uppercase; margin-top: 4px; letter-spacing: 1px;">${subTitle}</div>
                        </div>
                        ${gold > 0 ? `<div class="m-fiyat" style="color:#ffd700; font-weight:bold; font-size:1.1em; background:rgba(255,215,0,0.1); padding:4px 8px; border-radius:4px; white-space:nowrap; flex-shrink:0;">🪙 ${gold}</div>` : ''}
                    </div>
                    <div style="color: var(--text-light); line-height: 1.5; font-size: 0.95em;">
                        ${parsedHtml}
                    </div>
                `;
                itm.boyandiMi = true;
            }

            window.itemVeritabani = itemData.data;
            console.log("🛠️ Eşya veritabanı sisteme SAF ve GİZLİ BOYANMIŞ haliyle yüklendi.");
            mutlakRunMotorunuAtesle();
        }
    } catch (e) { console.error("Sistem başlatılırken hata:", e); }
}

window.sezonDegistir = function (yeniSezon) {
    window.GuncelDurum.sezon = yeniSezon;

    // 🎯 HAFIZA TEMİZLİĞİ: Sezon değiştiğinde eski profil önbelleklerini acımasızca yok et!
    window.profilHafizasi = {};

    // Grafikleri de sıfırla ki eski sezondan renk/çizim kalmasın
    for (let key in GrafikHafizasi) {
        if (GrafikHafizasi[key]) GrafikHafizasi[key].destroy();
    }

    if (typeof Router !== "undefined" && typeof Router.git === "function") Router.git(Sistem.aktifSayfa, Sistem.aktifSayfaAdi);
};

/* ==============================================================================
   🛠️ EŞYA SİMÜLATÖRÜ MOTORU (KAAN'IN ÖZEL KURALLARI)
============================================================================== */
window.simEnvanter = [null, null, null, null, null, null];

window.simEsyaEkle = function (itemId) {
    let envanterdekiEsyalar = window.simEnvanter.filter(id => id !== null).map(String);
    let guncelItemId = String(itemId);

    if (envanterdekiEsyalar.includes(guncelItemId)) {
        alert("Bu eşya envanterinizde zaten mevcut! Aynı eşyayı birden fazla kez ekleyemezsiniz."); return;
    }

    const botlarGrubu = ["1001", "3006", "3009", "3020", "3047", "3111", "3117", "3158", "3124", "3005", "3172", "3008", "3168", "3170", "3171", "3173", "3174", "3175"];
    const piriltiGrubu = ["2510", "3078", "3100", "3508", "6662"];
    const zirhDelmeGrubu = ["3033", "3036", "3071", "3302", "6694"];
    const buyuNufuzuGrubu = ["3135", "3137", "3302", "4010"];
    const canSimidiGrubu = ["2525", "3053", "6673", "3156"];
    const tiamatGrubu = ["3074", "3748", "6631", "6698"];
    const destekGorevGrubu = ["3869", "3870", "3871", "3876", "3877", "3865", "3866", "3867"];
    const gozyasiHatlari = [["3004", "3042"], ["3003", "3040"], ["3119", "3121"], ["2526", "2530"]];

    if (botlarGrubu.includes(guncelItemId) && envanterdekiEsyalar.some(id => botlarGrubu.includes(id))) { alert("Riot Kısıtlaması: Sadece 1 adet Çizme (Bot) bulundurabilirsiniz!"); return; }
    if (piriltiGrubu.includes(guncelItemId) && envanterdekiEsyalar.some(id => piriltiGrubu.includes(id))) { alert("Riot Kısıtlaması: Pırıltı pasifine sahip eşyaları aynı anda alamazsınız!"); return; }
    if (zirhDelmeGrubu.includes(guncelItemId) && envanterdekiEsyalar.some(id => zirhDelmeGrubu.includes(id))) { alert("Riot Kısıtlaması: Aynı anda birden fazla Zırh Delme eşyası alamazsınız!"); return; }
    if (buyuNufuzuGrubu.includes(guncelItemId) && envanterdekiEsyalar.some(id => buyuNufuzuGrubu.includes(id))) { alert("Riot Kısıtlaması: Aynı anda birden fazla Büyü Nüfuzu eşyası alamazsınız!"); return; }
    if (canSimidiGrubu.includes(guncelItemId) && envanterdekiEsyalar.some(id => canSimidiGrubu.includes(id))) { alert("Riot Kısıtlaması: Can Simidi eşyalarını aynı anda alamazsınız!"); return; }
    if (tiamatGrubu.includes(guncelItemId) && envanterdekiEsyalar.some(id => tiamatGrubu.includes(id))) { alert("Riot Kısıtlaması: Birden fazla Vahşi Hidra/Tiamat alamazsınız!"); return; }
    if (destekGorevGrubu.includes(guncelItemId) && envanterdekiEsyalar.some(id => destekGorevGrubu.includes(id))) { alert("Riot Kısıtlaması: Sadece 1 adet Destek Görev Eşyası bulunabilir!"); return; }

    for (let hat of gozyasiHatlari) {
        if (hat.includes(guncelItemId) && envanterdekiEsyalar.some(id => hat.includes(id))) { alert("Riot Kısıtlaması: Bir gözyaşı eşyasının hem normalini hem gelişmişini aynı anda kullanamazsınız!"); return; }
    }

    let bosIndex = window.simEnvanter.indexOf(null);
    if (bosIndex !== -1) {
        window.simEnvanter[bosIndex] = guncelItemId; window.simGuncelle();
    } else {
        let slotKutu = document.getElementById("sim-envanter"); slotKutu.style.border = "2px solid #f85149"; setTimeout(() => { slotKutu.style.border = "none"; }, 300);
    }
};

window.simEsyaCikar = function (index) { if (window.simEnvanter[index] !== null) { window.simEnvanter[index] = null; window.simGuncelle(); } };
window.simSifirla = function () { window.simEnvanter = [null, null, null, null, null, null]; window.simGuncelle(); };

window.esyaSekmeDegistir = function (hedef) {
    document.getElementById('btn-esya-sim').classList.remove('aktif'); document.getElementById('btn-esya-reh').classList.remove('aktif');
    if (hedef === 'simulator') document.getElementById('btn-esya-sim').classList.add('aktif'); else document.getElementById('btn-esya-reh').classList.add('aktif');
    document.getElementById('esya-sekme-simulator').classList.add('gizle'); document.getElementById('esya-sekme-rehber').classList.add('gizle');
    document.getElementById('esya-sekme-' + hedef).classList.remove('gizle');
};

/* ==============================================================================
   🛠️ SİMÜLATÖR EKRAN GÜNCELLEYİCİSİ
============================================================================== */
window.simGuncelle = function () {
    let slotlar = document.querySelectorAll('.sim-slot');
    let yama = typeof RiotCDN !== 'undefined' ? RiotCDN.surum : "14.23.1";

    window.simEnvanter.forEach((itemId, idx) => {
        if (itemId) {
            let imgUrl = `https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/${itemId}.png`;
            let fallbackUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/items/icons2d/${itemId}.png`;
            slotlar[idx].innerHTML = `<img src="${imgUrl}" onerror="this.onerror=null; this.src='${fallbackUrl}';" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">`;
            slotlar[idx].style.borderStyle = "solid"; slotlar[idx].style.borderColor = "var(--accent-color)";
        } else {
            slotlar[idx].innerHTML = ``; slotlar[idx].style.borderStyle = "dashed"; slotlar[idx].style.borderColor = "var(--border-color)";
        }
    });

    let t_altin = 0; let statsMap = {};

    window.simEnvanter.forEach(id => {
        let itm = window.itemVeritabani ? window.itemVeritabani[String(id)] : null;
        if (itm) {
            if (itm.gold && itm.gold.total) t_altin += itm.gold.total;
            if (itm.parsedStats) {
                for (let k in itm.parsedStats) {
                    // Hiçbir engelleme yok, tüm statlar (Kritik Hasar dahil) ekrana yansıyacak
                    statsMap[k] = (statsMap[k] || 0) + itm.parsedStats[k];
                }
            }
        }
    });

    let baseMana = 1000; let toplamMana = baseMana + (statsMap["mana"] || 0);


    if (window.simEnvanter.includes("3042") || window.simEnvanter.includes("3004")) statsMap["saldırı gücü"] = (statsMap["saldırı gücü"] || 0) + (toplamMana * (window.simEnvanter.includes("3042") ? 0.025 : 0.02));
    if (window.simEnvanter.includes("3040") || window.simEnvanter.includes("3003")) statsMap["yetenek gücü"] = (statsMap["yetenek gücü"] || 0) + (toplamMana * 0.02);

    let statHtml = "";
    for (let key in statsMap) {
        let val = statsMap[key]; let sInfo = statDisplay[key] || { ad: key.toUpperCase(), renk: "#a09b8c", ikon: "•" };
        let isPct = key.includes("ihtimali") || key.includes("hasarı") || key.includes("çalma") || key.includes("sömürü") || key.includes("delme") || key.includes("nüfuzu") || key.includes("sıvışma") || key.includes("yenilenmesi") || key.includes("iyileştirme") || key.includes("hızı") && !key.includes("yetenek hızı") && !key.includes("hareket hızı");

        statHtml += `<div class="sim-stat-satir" style="justify-content:flex-start; gap:8px;"><span>${sInfo.ikon}</span> <b style="color:#ffffff;">+${parseFloat(val.toFixed(2))}${isPct ? "%" : ""}</b> <span style="color:${sInfo.renk}; font-weight:bold;">${sInfo.ad}</span></div>`;
    }

    if (statHtml === "") statHtml = `<div style="color:#8b949e; grid-column: 1 / -1; text-align:center; margin: 20px 0;">Kütüphaneden eşya seçerek dizilime başlayın.</div>`;

    let toplamKritik = statsMap["kritik vuruş ihtimali"] || 0;
    if (toplamKritik > 100) statHtml += `<div style="margin-top: 15px; padding: 12px; background: rgba(218, 54, 51, 0.15); border: 1px solid #da3633; border-radius: 8px; text-align: center; grid-column: 1 / -1;"><div style="color: #ffb84d; font-weight: bold; font-size: 1.1em;">⚠️ KRİTİK KAPASİTE AŞILDI</div><div style="color: #e0e0e0; font-size: 0.9em;">Kritik şansınız <b>%100'ü geçti (Şu an: %${toplamKritik})</b>.</div></div>`;

    document.getElementById("sim-statlar").innerHTML = statHtml;
    document.getElementById("sim-altin").innerText = "Toplam Maliyet: " + t_altin + " 🪙";
};

/* ==============================================================================
   🎯 KÜTÜPHANE ÇİZİCİ (KAAN'IN LİSTESİ)
============================================================================== */
window.renderEsyaKutuphanesi = function () {
    if (!window.itemVeritabani) return;

    let yama = typeof RiotCDN !== 'undefined' ? RiotCDN.surum : "14.23.1";
    const kategoriler = ["dovuscu", "suikastci", "buyucu", "nisanci", "tank", "destek", "botlar"];
    kategoriler.forEach(k => { let el = document.getElementById("grid-" + k); if (el) el.innerHTML = ""; });

    const KESIN_KATEGORI_HARITASI = {
        "1001": "alt_esya", "1004": "alt_esya", "1006": "alt_esya", "1011": "alt_esya", "1018": "alt_esya", "1026": "alt_esya", "1027": "alt_esya", "1028": "alt_esya", "1029": "alt_esya", "1031": "alt_esya", "1033": "alt_esya", "1036": "alt_esya", "1037": "alt_esya", "1038": "alt_esya", "1042": "alt_esya", "1043": "alt_esya", "1052": "alt_esya", "1053": "alt_esya", "1054": "alt_esya", "1055": "alt_esya", "1056": "alt_esya", "1057": "alt_esya", "1058": "alt_esya", "1082": "alt_esya", "1083": "alt_esya", "1086": "alt_esya", "1120": "alt_esya", "2015": "alt_esya", "2019": "alt_esya", "2020": "alt_esya", "2021": "alt_esya", "2022": "alt_esya", "2031": "alt_esya", "2420": "alt_esya", "2421": "alt_esya", "2422": "alt_esya", "3024": "alt_esya", "3035": "alt_esya", "3044": "alt_esya", "3051": "alt_esya", "3066": "alt_esya", "3067": "alt_esya", "3070": "alt_esya", "3076": "alt_esya", "3077": "alt_esya", "3082": "alt_esya", "3086": "alt_esya", "3108": "alt_esya", "3113": "alt_esya", "3114": "alt_esya", "3123": "alt_esya", "3133": "alt_esya", "3134": "alt_esya", "3140": "alt_esya", "3144": "alt_esya", "3145": "alt_esya", "3147": "alt_esya", "3155": "alt_esya", "3211": "alt_esya", "3801": "alt_esya", "3802": "alt_esya", "3803": "alt_esya", "3865": "alt_esya", "3866": "alt_esya", "3867": "alt_esya", "3916": "alt_esya", "4630": "alt_esya", "4632": "alt_esya", "6660": "alt_esya", "6670": "alt_esya", "6690": "alt_esya",
        "3006": "botlar", "3008": "botlar", "3009": "botlar", "3020": "botlar", "3047": "botlar", "3111": "botlar", "3158": "botlar", "3168": "botlar", "3170": "botlar", "3171": "botlar", "3172": "botlar", "3173": "botlar", "3174": "botlar", "3175": "botlar",
        "2501": "dovuscu", "2517": "dovuscu", "3053": "dovuscu", "3071": "dovuscu", "3073": "dovuscu", "3074": "dovuscu", "3078": "dovuscu", "3091": "dovuscu", "3153": "dovuscu", "3156": "dovuscu", "3161": "dovuscu", "3181": "dovuscu", "3748": "dovuscu", "6333": "dovuscu", "6610": "dovuscu", "6631": "dovuscu", "6662": "dovuscu", "6692": "dovuscu", "3004": "dovuscu", "3042": "dovuscu",
        "2520": "suikastci", "3142": "suikastci", "3179": "suikastci", "3814": "suikastci", "6694": "suikastci", "6695": "suikastci", "6696": "suikastci", "6697": "suikastci", "6698": "suikastci", "6699": "suikastci",
        "2503": "buyucu", "2510": "buyucu", "2522": "buyucu", "3003": "buyucu", "3040": "buyucu", "3041": "buyucu", "3089": "buyucu", "3100": "buyucu", "3102": "buyucu", "3115": "buyucu", "3116": "buyucu", "3118": "buyucu", "3135": "buyucu", "3137": "buyucu", "3146": "buyucu", "3152": "buyucu", "3157": "buyucu", "3165": "buyucu", "4010": "buyucu", "4628": "buyucu", "4629": "buyucu", "4633": "buyucu", "4645": "buyucu", "4646": "buyucu", "6653": "buyucu", "6655": "buyucu", "6657": "buyucu",
        "2512": "nisanci", "2523": "nisanci", "3026": "nisanci", "3031": "nisanci", "3032": "nisanci", "3033": "nisanci", "3036": "nisanci", "3046": "nisanci", "3072": "nisanci", "3085": "nisanci", "3087": "nisanci", "3094": "nisanci", "3097": "nisanci", "3124": "nisanci", "3139": "nisanci", "3302": "nisanci", "3508": "nisanci", "6672": "nisanci", "6673": "nisanci", "6675": "nisanci", "6676": "nisanci",
        "2502": "tank", "2504": "tank", "2525": "tank", "3068": "tank", "3075": "tank", "3083": "tank", "3084": "tank", "3110": "tank", "3119": "tank", "3121": "tank", "3143": "tank", "3742": "tank", "4401": "tank", "6664": "tank", "6665": "tank", "8020": "tank",
        "2065": "destek", "2524": "destek", "2526": "destek", "2530": "destek", "3050": "destek", "3107": "destek", "3109": "destek", "3190": "destek", "3222": "destek", "3504": "destek", "3869": "destek", "3870": "destek", "3871": "destek", "3876": "destek", "3877": "destek", "4005": "destek", "6616": "destek", "6617": "destek", "6620": "destek", "6621": "destek", "3016": "destek"
    };

    let duplicateCheck = new Set();

    for (let id in KESIN_KATEGORI_HARITASI) {
        let kategori = KESIN_KATEGORI_HARITASI[id];
        let itm = window.itemVeritabani[id];
        if (!itm) continue;

        let plainName = itm.name || "";

        if (!duplicateCheck.has(plainName)) {
            duplicateCheck.add(plainName);

            // Sadece Alt Eşya DEĞİLSE Ekrana Çiziyoruz (Çünkü mutlak popup var)
            if (kategori !== "alt_esya") {
                let grid = document.getElementById("grid-" + kategori);
                if (grid) {
                    let div = document.createElement("div");
                    div.className = "esya-kart";
                    div.setAttribute("onclick", `window.simEsyaEkle('${id}')`);
                    div.setAttribute("data-item-id", id);

                    let imgUrl = `https://ddragon.leagueoflegends.com/cdn/${yama}/img/item/${id}.png`;
                    let fallbackUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/items/icons2d/${id}.png`;

                    div.innerHTML = `<img src="${imgUrl}" data-item-id="${id}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" onerror="this.onerror=null; this.src='${fallbackUrl}';">`;
                    grid.appendChild(div);
                }
            }
        }
    }
};

/* ==============================================================================
   🚀 V7.0.0 AKILLI VE ORİJİNAL FORMATLI POP-UP MOTORU
============================================================================== */
window.gosterMutlakPopup = function (e, baslik, icerik, cerceveRengi) {
    if (!document.getElementById("anti-yellow-css")) {
        let style = document.createElement("style");
        style.id = "anti-yellow-css";
        style.innerHTML = ".esya-detay-popup { display: none !important; }";
        document.head.appendChild(style);
    }

    let tt = document.getElementById("mutlak-tooltip");
    if (!tt) {
        tt = document.createElement("div"); tt.id = "mutlak-tooltip";
        tt.style.cssText = "position:absolute; z-index:9999999; background:rgba(10,15,22,0.98); border:1px solid; border-radius:8px; padding:15px; box-shadow:0 10px 30px rgba(0,0,0,0.8); pointer-events:none; display:none; width:320px; color:var(--text-color); box-sizing:border-box;";
        document.body.appendChild(tt);
    }

    tt.style.borderColor = cerceveRengi || 'var(--hextech-gold)';

    // Eğer başlık varsa standart şablon, yoksa zaten içerikte özel HTML vardır
    if (baslik !== "") {
        tt.innerHTML = `<div style="color:${cerceveRengi}; font-weight:bold; font-size:1.1em; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px; margin-bottom:8px;">${baslik}</div><div style="font-size:0.9em; line-height:1.5; color:#fff;">${icerik.replace(/ \| /g, "<br><br>")}</div>`;
    } else {
        tt.innerHTML = `<div style="font-size:0.9em; line-height:1.5;">${icerik}</div>`;
    }

    tt.style.display = "block";
    let ttWidth = 320; let ttHeight = tt.offsetHeight || 250;
    let x = e.pageX + 15; let y = e.pageY + 15;

    // Sınır Kalkanları
    if (e.clientX + ttWidth + 20 > window.innerWidth) x = e.pageX - ttWidth - 15;
    if (e.clientY + ttHeight + 20 > window.innerHeight) y = e.pageY - ttHeight - 15;
    if (x < 5) x = 5; if (y < 5) y = 5;

    tt.style.left = x + "px"; tt.style.top = y + "px";
};

window.gizleMutlakPopup = function () {
    let tt = document.getElementById("mutlak-tooltip");
    if (tt) tt.style.display = "none";
};

/* ==============================================================================
   🎯 TEK VE MUTLAK EVENT MOTORU (Bireysel, Sinerji, Rün ve Eşya için)
============================================================================== */
document.body.addEventListener('mousemove', function (e) {
    // 🎯 HEM ESKİ TETİKLEYİCİLERİ, HEM DE YENİLERİ YAKALAYAN KAPSAYICI
    let target = e.target.closest('.tetikleyici-esya, .esya-kart, .tetikleyici-run, .run-ikon, .tetikleyici-buyu, .tetikleyici-lejant');

    if (!target) {
        if (!e.target.closest('#mutlak-tooltip')) window.gizleMutlakPopup();
        return;
    }

    // 1. EŞYA (target içindeki data-item-id'yi kontrol et, hangi sınıf olursa olsun)
    if (target.classList.contains('tetikleyici-esya') || target.classList.contains('esya-kart')) {
        let itemId = target.getAttribute('data-item-id');
        let data = window.itemVeritabani ? window.itemVeritabani[itemId] : null;

        if (data && data.parsedDescription) {
            // @@STATS_BLOCK@@ temizliğini burada yapıyoruz
            let temizDesc = data.parsedDescription.replace(/@@STATS_BLOCK@@/g, '');
            window.gosterMutlakPopup(e, "", temizDesc, 'var(--accent-color)');
        }
    }
    // 2. RÜN
    else if (target.classList.contains('tetikleyici-run') || target.classList.contains('run-ikon')) {
        let runId = target.getAttribute('data-run-id');

        if (target.src.includes("statmodshealthplusicon.png") && target.classList.contains("u-3")) { runId = "5011"; }
        else if (target.src.includes("statmodshealthscalingicon.png") && target.classList.contains("u-3")) { runId = "5001"; }
        else if (!runId && target.src) {
            let resimAdi = target.src.split('/').pop().toLowerCase();
            runId = window.dosyaAdiToRuneId ? window.dosyaAdiToRuneId[resimAdi] : null;
        }

        let data = runId ? window.runeIdMap[runId] : null;
        if (data) {
            // 🎯 ÇÖZÜM: İstatistik rünleri için CDragon sunucusuna, normal rünler için DDragon sunucusuna bağlan
            let imgSrc = data.icon.toLowerCase().includes("statmods")
                ? `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/${data.icon.toLowerCase()}`
                : `https://ddragon.leagueoflegends.com/cdn/img/${data.icon}`;

            let pIcerik = `<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px; margin-bottom:10px; display:flex; align-items:center; gap: 12px;">
                          <img src="${imgSrc}" style="width:35px; height:35px; border-radius:50%; background:#000;">
                          <div style="color:var(--hextech-gold); font-weight:bold;">${data.name}</div>
                       </div>
                       <div style="color:#ffffff; font-size:0.9em; line-height:1.4;">${data.desc}</div>`;
            window.gosterMutlakPopup(e, "", pIcerik, '#c8aa6e');
        }
    }
    // 3. SİHİRDAR BÜYÜSÜ
    else if (target.classList.contains('tetikleyici-buyu')) {
        window.gosterMutlakPopup(e, target.getAttribute('data-isim'), "Sihirdar Büyüsü", '#ffffff');
    }
    // 4. LEJANT
    else if (target.classList.contains('tetikleyici-lejant')) {
        window.gosterMutlakPopup(e, target.getAttribute('data-baslik'), target.getAttribute('data-aciklama'), 'var(--hextech-gold)');
    }
});

document.addEventListener('mouseout', function (e) {
    let t = e.target;
    if (t && (t.classList.contains('tetikleyici-esya') || t.classList.contains('tetikleyici-run') || t.classList.contains('run-ikon') || t.classList.contains('tetikleyici-buyu') || t.classList.contains('tetikleyici-lejant'))) {
        window.gizleMutlakPopup();
    }
});
/* ==============================================================================
   📦 AÇILIR MAÇ DETAY MOTORU (SAF CSS POP-UP DESTEKLİ GRID)
============================================================================== */
const rolSiralamaGucu = { "TOP": 1, "JUNGLE": 2, "MIDDLE": 3, "BOTTOM": 4, "UTILITY": 5, "BELIRSIZ": 99 };

window.cizTakimKarti = function (grup, vurguOyuncu = "") {
    const rolSiralamaGucu = { "TOP": 1, "JUNGLE": 2, "MIDDLE": 3, "BOTTOM": 4, "UTILITY": 5, "BELIRSIZ": 99 };
    grup.sort((a, b) => (rolSiralamaGucu[a.pozisyon] || 99) - (rolSiralamaGucu[b.pozisyon] || 99));
    let oyuncularHtml = "";
    let oyunSuresi_dk = (grup[0].sure_saniye || 60) / 60;
    let maxHasar = 0;
    grup.forEach(p => { if ((p.hasar_sampiyon || 0) > maxHasar) maxHasar = p.hasar_sampiyon; });

    grup.forEach(oyuncu => {
        let kda = oyuncu.olum === 0 ? "Kusursuz" : ((oyuncu.oldurme + oyuncu.asist) / oyuncu.olum).toFixed(2);
        let hasarYuzde = maxHasar > 0 ? ((oyuncu.hasar_sampiyon || 0) / maxHasar) * 100 : 0;
        let isTarget = (oyuncu.oyuncu === vurguOyuncu);
        let satirBg = isTarget ? "background: rgba(88, 166, 255, 0.1);" : "background: rgba(13, 17, 23, 0.4);";
        let yaMin = ((oyuncu.cs || 0) / oyunSuresi_dk).toFixed(1);

        let esyalarHtml = '<div style="display:flex; gap:3px; align-items:center;">';
        if (oyuncu.esyalar) {
            oyuncu.esyalar.slice(0, 6).forEach((itemId) => {
                esyalarHtml += Yardimci.cizEsya(itemId, "width:32px; height:32px; border-radius:4px; border:1px solid var(--border-color); flex-shrink:0; cursor:help;");
            });
            let trinket = oyuncu.esyalar[6] || 0;
            esyalarHtml += `<div style="width:6px;"></div>`;
            esyalarHtml += Yardimci.cizEsya(trinket, "width:32px; height:32px; border-radius:50%; border:1px solid var(--border-color); flex-shrink:0; cursor:help;");
        }
        esyalarHtml += '</div>';

        let buyu1 = oyuncu.buyu1 || oyuncu.sihirdar1 || oyuncu.spell1Id;
        let buyu2 = oyuncu.buyu2 || oyuncu.sihirdar2 || oyuncu.spell2Id;
        let buyuHtml = `<div style="display:flex; flex-direction:column; gap:4px;">
            ${Yardimci.cizBuyu(buyu1, "width:22px; height:22px; border-radius:4px; border:1px solid var(--border-color); flex-shrink:0;")}
            ${Yardimci.cizBuyu(buyu2, "width:22px; height:22px; border-radius:4px; border:1px solid var(--border-color); flex-shrink:0;")}
        </div>`;

        let runlerHtml = "";
        let runDizisi = oyuncu.runler || oyuncu.perks;

        if (runDizisi && Array.isArray(runDizisi) && runDizisi.length > 0) {
            let anaKisim = runDizisi.slice(0, 4).map((r, i) => Yardimci.cizRun(r, i === 0 ? "width:24px; height:24px; border-radius:50%; border:1px solid #c8aa6e; background:#000;" : "width:20px; height:20px; border-radius:50%; background:rgba(0,0,0,0.5);")).join('');
            let altKisim = runDizisi.slice(4, 6).map(r => Yardimci.cizRun(r, "width:20px; height:20px; border-radius:50%; background:rgba(0,0,0,0.5);")).join('');
            let statKisim = runDizisi.slice(6, 9).map(r => Yardimci.cizRun(r, "width:16px; height:16px; border-radius:50%; opacity:0.8; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1);")).join('');

            runlerHtml = `
            <div style="display:flex; flex-direction:column; gap:4px; margin-left:6px; border-left:1px dashed rgba(255,255,255,0.15); padding-left:8px;">
                <div style="display:flex; gap:4px; align-items:center;">${anaKisim}</div>
                <div style="display:flex; gap:4px; align-items:center;">${altKisim} <span style="color:#555; font-size:0.9em; margin:0 4px;">|</span> ${statKisim}</div>
            </div>`;
        } else {
            runlerHtml = `
            <div style="display:flex; flex-direction:column; gap:4px; margin-left:6px;">
                ${oyuncu.ana_run_id ? Yardimci.cizRun(oyuncu.ana_run_id, "width:22px; height:22px; border-radius:50%; border:1px solid #c8aa6e; background:#000; flex-shrink:0;") : ''}
                ${oyuncu.alt_run_agaci_id ? Yardimci.cizRun(oyuncu.alt_run_agaci_id, "width:18px; height:18px; border-radius:50%; margin:0 auto; flex-shrink:0;") : ''}
            </div>`;
        }

        let playerName = oyuncu.riot_id || Yardimci.anaRiotIdGetir(oyuncu.oyuncu);
        let tags = IstatistikMotoru.etiketUret(oyuncu);
        let partnerHtml = Yardimci.partnerBul(grup, oyuncu.pozisyon);

        oyuncularHtml += `
        <div style="${satirBg} display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); gap: 10px; width: 100%; box-sizing: border-box; overflow-x: auto;">
            
            <div style="display: flex; align-items: center; gap: 10px; flex: 2.5; min-width: 300px;">
                <div style="position:relative; width:50px; height:50px; flex-shrink:0;">
                    <img src="${Yardimci.resimUrlGetir(oyuncu.sampiyon, RiotCDN.surum)}" style="width:100%; height:100%; border-radius:50%; border:2px solid ${isTarget ? 'var(--accent-color)' : 'var(--border-color)'};">
                    <img src="${Yardimci.ikonUrlGetir(oyuncu.profil_ikonu, RiotCDN.surum)}" style="position:absolute; bottom:-5px; right:-5px; width:20px; height:20px; border-radius:50%; border:1px solid #000;">
                </div>
                ${buyuHtml}
                ${runlerHtml}
                <div style="display: flex; flex-direction: column; line-height:1.3; margin-left: 8px;">
                    <span style="font-weight:bold; color:#fff; font-size:1.15em; white-space:nowrap;">${playerName}</span>
                    <span style="color:#8b949e; font-size:0.85em; white-space:nowrap;">${oyuncu.oyuncu}</span>
                    <div style="margin-top:3px;">${partnerHtml}</div>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; min-width: 120px; text-align:center;">
                <div style="font-weight:bold; color:#fff; font-size:1.1em; white-space:nowrap;">${oyuncu.oldurme} <span style="color:#8b949e; margin:0 2px;">/</span> <span style="color:#f85149;">${oyuncu.olum}</span> <span style="color:#8b949e; margin:0 2px;">/</span> ${oyuncu.asist}</div>
                <div style="font-size:0.85em; color:#8b949e; margin-top:4px;">${kda} KDA</div>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; min-width: 100px; text-align:center; font-size:0.85em; color:#8b949e; white-space:nowrap;">
                <div>🗡️ ${oyuncu.cs} <span style="font-size:0.85em;">(${yaMin})</span></div>
                <div style="margin-top:4px;">👁️ ${oyuncu.gorus_skoru} <span style="color:#f85149; margin-left:4px;">🛑 ${oyuncu.kontrol_totemi}</span></div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px; flex: 1.5; min-width: 180px; justify-content: center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width: 45px; text-align:right; font-size:0.85em; color:#f85149; font-weight:bold;">${Yardimci.formatK(oyuncu.hasar_sampiyon)}</div>
                    <div style="flex:1; height:8px; background:rgba(0,0,0,0.6); border-radius:4px; overflow:hidden;"><div style="width: ${hasarYuzde}%; height:100%; background:#f85149;"></div></div>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex: 1.5; min-width: 220px;">
                ${esyalarHtml}
                <div style="display:flex; gap:4px; flex-wrap:wrap; justify-content:flex-end;">
                    ${tags}
                </div>
            </div>
        </div>`;
    });
    return oyuncularHtml;
};
/* ==============================================================================
   🔮 SEZON 16 RÜN MOTORU (DATADRAGON'DAN ÇEKİM VE MUTLAK POP-UP)
============================================================================== */
window.runeIdMap = {};
window.dosyaAdiToRuneId = {};

async function mutlakRunMotorunuAtesle() {
    try {
        // 🛡️ DEVASA RÜN PATLAMASINI ÖNLEYEN MUTLAK CSS ZIRHI
        if (!document.getElementById("run-css-zirhi")) {
            let style = document.createElement("style");
            style.id = "run-css-zirhi";
            style.innerHTML = `
                /* Normal rünleri 38px'e presle */
                .run-ikon { width: 38px !important; height: 38px !important; object-fit: contain; border-radius: 50%; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; border: 2px solid transparent; }
                
                /* Ana Rünleri (Keystones) daha görkemli yap (50px) */
                .run-agaci .run-satir:first-of-type .run-ikon:not(.u-1):not(.u-2):not(.u-3) { width: 50px !important; height: 50px !important; }
                
                /* Ufak stat rünlerini küçük tut (30px) */
                .u-1, .u-2, .u-3 { width: 30px !important; height: 30px !important; }
                
                /* Esneme ve taşmaları engelle */
                .esya-kapsayici { display: inline-flex; justify-content: center; align-items: center; margin: 4px; position: relative; }
                .run-baslik img { width: 25px !important; height: 25px !important; object-fit: contain; }
            `;
            document.head.appendChild(style);
        }
        let yama = typeof RiotCDN !== 'undefined' ? RiotCDN.surum : "16.12.1";
        const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${yama}/data/tr_TR/runesReforged.json`);
        const data = await res.json();

        let sozluk = {};

        data.forEach(agac => {
            window.runeIdMap[agac.id] = { name: agac.name, icon: agac.icon, desc: agac.name + " Ağacı" };

            agac.slots.forEach(slot => {
                slot.runes.forEach(run => {
                    let dosya = run.icon.split('/').pop().toLowerCase();
                    let aciklama = run.longDesc || run.shortDesc || "";

                    // Riot Tag Boyama
                    aciklama = aciklama.replace(/<scaleAD>(.*?)<\/scaleAD>/gi, '<b style="color:#e88245;">$1</b>');
                    aciklama = aciklama.replace(/<scaleAP>(.*?)<\/scaleAP>/gi, '<b style="color:#9ea1f9;">$1</b>');
                    aciklama = aciklama.replace(/<scaleHealth>(.*?)<\/scaleHealth>/gi, '<b style="color:#a1d586;">$1</b>');
                    aciklama = aciklama.replace(/<scaleArmor>(.*?)<\/scaleArmor>/gi, '<b style="color:#f2a65a;">$1</b>');
                    aciklama = aciklama.replace(/<scaleMR>(.*?)<\/scaleMR>/gi, '<b style="color:var(--accent-color);">$1</b>');
                    aciklama = aciklama.replace(/<stat>(.*?)<\/stat>/gi, '<b style="color:#ffffff;">$1</b>');
                    aciklama = aciklama.replace(/<attention>(.*?)<\/attention>/gi, '<b style="color:#ffffff;">$1</b>');
                    aciklama = aciklama.replace(/<magicDamage>(.*?)<\/magicDamage>/gi, '<b style="color:#9ea1f9;">$1</b>');
                    aciklama = aciklama.replace(/<physicalDamage>(.*?)<\/physicalDamage>/gi, '<b style="color:#e88245;">$1</b>');
                    aciklama = aciklama.replace(/<healing>(.*?)<\/healing>/gi, '<b style="color:#3fb950;">$1</b>');
                    aciklama = aciklama.replace(/<speed>(.*?)<\/speed>/gi, '<b style="color:#aee2ff;">$1</b>');
                    aciklama = aciklama.replace(/<rules>(.*?)<\/rules>/gi, '<div style="margin-top:6px; font-size:0.85em; color:#8b949e; font-style:italic;">$1</div>');

                    aciklama = aciklama.replace(/<br\s*\/?>|\n/gi, '<div style="height:6px;"></div>');
                    aciklama = aciklama.replace(/<[^>]*>?/gm, ''); // Çöpleri temizle

                    let guvenliIsim = run.name.replace(/'/g, "&#39;").replace(/"/g, "&quot;");

                    window.dosyaAdiToRuneId[dosya] = run.id;
                    window.runeIdMap[run.id] = { name: guvenliIsim, icon: run.icon, desc: aciklama };
                    sozluk[dosya] = { isim: guvenliIsim, desc: aciklama };
                });
            });
        });

        const ozelHafizaYamasi = [
            { id: 5008, dosya: "statmodsadaptiveforceicon.png", name: "Değişken Kuvvet", desc: "+5.4 Saldırı Gücü veya +9 Yetenek Gücü" },
            { id: 5005, dosya: "statmodsattackspeedicon.png", name: "Saldırı Hızı", desc: "+%10 Saldırı Hızı" },
            { id: 5007, dosya: "statmodscdrscalingicon.png", name: "Yetenek Hızı", desc: "+8 Yetenek Hızı" },
            { id: 5002, dosya: "statmodsarmoricon.png", name: "Zırh", desc: "+6 Zırh" },
            { id: 5003, dosya: "statmodsmagicresicon.png", name: "Büyü Direnci", desc: "+8 Büyü Direnci" },
            { id: 5011, dosya: "statmodshealthscalingicon.png", name: "Seviyeye Göre Can", desc: "+10-180 Can (Seviyeye bağlı)" },
            { id: 5001, dosya: "statmodshealthplusicon.png", name: "Sabit Can", desc: "+65 Sabit Can" },
            { id: 5013, dosya: "statmodstenacityicon.png", name: "Sıvışma", desc: "+%10 Sıvışma ve Yavaşlatma Direnci" },
            { id: 5012, dosya: "statmodsmovementspeedicon.png", name: "Hareket Hızı", desc: "<b style=\"color:#aee2ff;\">+2.5% Hareket Hızı</b>" },
            { id: 9991, dosya: "stormraiderssurge.png", name: "Sürat Coşkusu", desc: "Bir şampiyona 3 saniye içinde 3 saldırı veya yetenek isabet ettirmek sana yüksek bir <b style=\"color:#aee2ff;\">Hareket Hızı</b> kazandırır." },
            { id: 8361, dosya: "cashback.png", name: "Özel İndirim", desc: "Efsanevi eşya satın aldığında harcadığın altının %6'sını nakit olarak iade alırsın." },
            { id: 8362, dosya: "futuresmarket.png", name: "Vadeli İşlemler / Özel İndirim", desc: "Eşyaları oyun içi borçlanma limitini kullanarak önceden satın alabilirsin." }
        ];

        ozelHafizaYamasi.forEach(item => {
            window.dosyaAdiToRuneId[item.dosya] = item.id;
            if (!window.runeIdMap[item.id]) {
                window.runeIdMap[item.id] = { name: item.name, icon: "perk-images/StatMods/" + item.dosya, desc: item.desc };
            }
            sozluk[item.dosya] = { isim: item.name, desc: item.desc };
        });

        console.log("🔮 Rün veritabanı sisteme yüklendi.");
    } catch (e) { console.error("[Rün Motoru] Kritik Hata: ", e); }
}

// 🔮 RÜN SİMÜLATÖRÜ SEÇİM MOTORU (Akıllı Class Sistemi)
window.toggleRun = function (event, siraSinifi) {
    const tiklananRun = event.target;

    // Eğer rün zaten seçiliyse (renkliyse), tekrar tıklanınca seçimi kaldır ve soluklaştır
    if (tiklananRun.classList.contains('secili')) {
        tiklananRun.classList.remove('secili');
        return;
    }

    // Aynı satırdaki diğer rünlerin üzerindeki "secili" sınıfını sil ki onlar soluk kalsın
    document.querySelectorAll('.' + siraSinifi).forEach(img => {
        img.classList.remove('secili');
    });

    // Tıklanan rüne "secili" sınıfını ekle, renkler ve altın çerçeve patlasın!
    tiklananRun.classList.add('secili');
};

/* ==============================================================================
   🎛️ DİNAMİK FİLTRE VE EFEKTİF HAVUZ MOTORU
============================================================================== */
window.profilFiltrele = function (kriter, btnElement) {
    if (btnElement && btnElement.tagName === 'BUTTON') {
        document.querySelectorAll('.p-filtre-btn').forEach(b => b.classList.remove('aktif'));
        btnElement.classList.add('aktif');
        document.getElementById('profil-sampiyon-secici').value = 'hepsi';
    }

    let secilenSampiyon = document.getElementById('profil-sampiyon-secici').value;
    if (kriter === 'sampiyon' && !btnElement) document.querySelectorAll('.p-filtre-btn').forEach(b => b.classList.remove('aktif'));
    else if (kriter !== 'sampiyon') secilenSampiyon = 'hepsi';

    let listContainer = document.getElementById('bireysel-mac-listesi');
    let efektifGrid = document.getElementById('efektif-havuz-kapsayici');
    let btnArsiv = document.getElementById('btn-arsiv-ac');
    let sagKolon = document.getElementById('bireysel-sag-kolon');

    // EFEKTİF HAVUZ AÇILIRSA MAÇLARI GİZLE, GRIDI GÖSTER
    if (kriter === 'efektif') {
        listContainer.style.display = 'none';
        if (efektifGrid) efektifGrid.style.display = 'flex';
        if (btnArsiv) btnArsiv.style.display = 'none';
        if (sagKolon) sagKolon.style.display = 'none';
        return;
    } else {
        listContainer.style.display = 'flex';
        if (efektifGrid) efektifGrid.style.display = 'none';
    }

    let kartlar = document.querySelectorAll('.profil-mac-karti');
    kartlar.forEach(kart => {
        let goster = false;
        if (kriter === 'hepsi') goster = true;
        else if (kriter === 'sampiyon') goster = (secilenSampiyon === 'hepsi' || kart.getAttribute('data-sampiyon') === secilenSampiyon);
        else goster = kart.getAttribute('data-' + kriter) === 'true';

        kart.style.display = goster ? 'flex' : 'none';
        kart.classList.remove('mac-karti-gizli');
    });

    if (btnArsiv) btnArsiv.style.display = (kriter === 'hepsi' && secilenSampiyon === 'hepsi') ? 'block' : 'none';

    // ŞAMPİYON SEÇİLİNCE SAĞ KOLON (ANALİZ) AÇILIR
    let arayuz = document.getElementById('bireysel-profil-arayuzu');
    if (sagKolon && arayuz) {
        if (kriter === 'sampiyon' && secilenSampiyon !== 'hepsi') {
            let oyuncuAdi = arayuz.getAttribute('data-oyuncu');
            window.sagKolonCiz(oyuncuAdi, secilenSampiyon);
            sagKolon.style.display = 'flex';
        } else {
            sagKolon.style.display = 'none';
        }
    }
};
/* ==============================================================================
   🏆 ŞAMPİYON UZMANLARI (GÖRSELDEKİ BİREBİR KOPYASI - SAF VERİTABANI MOTORU)
============================================================================== */
window.uzmanlikKartlariniCiz = function (sampiyonAdi) {
    let container = document.getElementById("sampiyon-veriler");
    if (!sampiyonAdi) return;

    let islenecekVeri = window.GuncelDurum.veriyiFiltrele(Sistem.veriler);

    let guncelIkonlar = {};
    [...islenecekVeri].sort((a, b) => (b.tarih_ms || 0) - (a.tarih_ms || 0)).forEach(m => {
        if (m.oyuncu && m.profil_ikonu && !guncelIkonlar[m.oyuncu]) {
            guncelIkonlar[m.oyuncu] = m.profil_ikonu;
        }
    });

    let maclar = islenecekVeri.filter(m => m.sampiyon === sampiyonAdi);
    if (maclar.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#f85149; margin-top:50px;">Bu şampiyonla hiç operasyon kaydı bulunamadı.</div>`;
        return;
    }

    let rolGruplari = {};
    maclar.forEach(m => {
        let rol = m.pozisyon || "BELIRSIZ";
        if (rol === "INVALID") rol = "BELIRSIZ";
        if (!rolGruplari[rol]) rolGruplari[rol] = [];
        rolGruplari[rol].push(m);
    });

    // 🎯 HİZALAMA DÜZELTMESİ: TOP, JNG, MID, BOT, SUP SIRALAMASI
    const rolHiyerarsisi = { "TOP": 1, "JUNGLE": 2, "MIDDLE": 3, "BOTTOM": 4, "UTILITY": 5, "BELIRSIZ": 99 };
    let siraliRoller = Object.keys(rolGruplari).sort((a, b) => (rolHiyerarsisi[a] || 99) - (rolHiyerarsisi[b] || 99));

    const yerelRolCeviri = { "TOP": "TOP", "JUNGLE": "JNG", "MIDDLE": "MID", "BOTTOM": "BOT", "UTILITY": "SUP", "BELIRSIZ": "BELİRSİZ" };

    let html = `
        <div style="text-align:center; margin-bottom:40px;">
            <div style="display:inline-block; padding:2px; background: linear-gradient(180deg, #c8aa6e, #7a5c29); border-radius:4px; box-shadow: 0 0 20px rgba(200, 170, 110, 0.3);">
                <img src="${Yardimci.resimUrlGetir(sampiyonAdi, typeof RiotCDN !== 'undefined' ? RiotCDN.surum : '16.12.1')}" style="width:80px; height:80px; display:block; border-radius:2px; object-fit:cover; background-color:#000;">
            </div>
            <h2 style="color:#ffffff; margin:20px 0 0 0; font-size:2em; font-weight:900; letter-spacing:1px;">
                ${Yardimci.formatSampiyon(sampiyonAdi).replace(/i/g, 'I').replace(/ı/g, 'I').toUpperCase()} 
                <span style="color:#8b949e; font-size:0.5em; font-weight:normal; letter-spacing:2px; vertical-align:middle;">UZMANLARI</span>
            </h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 30px; align-items: center; width: 100%;">
    `;

    siraliRoller.forEach(rol => {
        let rolMaclari = rolGruplari[rol];
        let oyuncular = {};

        rolMaclari.forEach(m => {
            let o = m.oyuncu;
            if (!oyuncular[o]) oyuncular[o] = { mac: 0, k: 0, d: 0, a: 0, cs: 0, sure: 0, win: 0, cs10: 0, csFark: 0, koridorMac: 0, partnerler: {} };

            oyuncular[o].mac++;
            oyuncular[o].k += m.oldurme || 0;
            oyuncular[o].d += m.olum || 0;
            oyuncular[o].a += m.asist || 0;
            oyuncular[o].cs += m.cs || 0;
            oyuncular[o].sure += m.sure_saniye || 0;
            if (m.sonuc === "Zafer" || m.sonuc === "Galibiyet") oyuncular[o].win++;

            if (rol !== "UTILITY") {
                oyuncular[o].cs10 += m.ilk_10_dk_minyon || 0;
                oyuncular[o].csFark += m.koridor_minyon_farki || 0;
                oyuncular[o].koridorMac++;
            }

            // 🎯 ESKİ KODDAKİ PARTNER KÖPRÜSÜ (SORUNUN ÇÖZÜMÜ BURADA)
            let partner = m.koridor_partneri;
            if (partner && partner !== "Yok") {
                oyuncular[o].partnerler[partner] = (oyuncular[o].partnerler[partner] || 0) + 1;
            }
        });

        let hesaplanmisOyuncular = Object.keys(oyuncular).map(o => {
            let d = oyuncular[o];
            let mSayisi = d.mac;
            let wr = d.win / mSayisi;
            let kda = d.d === 0 ? (d.k + d.a) : (d.k + d.a) / d.d;
            let csMin = d.sure > 0 ? (d.cs / (d.sure / 60)) : 0;
            let ortCs10 = d.koridorMac > 0 ? (d.cs10 / d.koridorMac).toFixed(1) : 0;
            let ortCsFark = d.koridorMac > 0 ? Math.round(d.csFark / d.koridorMac) : 0;

            let oyunIciIsim = typeof guncelRiotID !== "undefined" && guncelRiotID[o] ? guncelRiotID[o] : o;
            if (oyunIciIsim === o) {
                let oMac = islenecekVeri.find(x => x.oyuncu === o);
                if (oMac && oMac.riot_id) oyunIciIsim = oMac.riot_id.split(',')[0].split('#')[0].trim();
            }

            let z = 1.96;
            let wilson = ((wr + (z * z) / (2 * mSayisi) - z * Math.sqrt((wr * (1 - wr) + (z * z) / (4 * mSayisi)) / mSayisi)) / (1 + (z * z) / mSayisi)) * 100;
            let totalUP = wilson + Math.min(kda * 2.5, 25) + (rol !== "UTILITY" ? Math.min(csMin * 2, 15) : 0);
            if (mSayisi < 3) totalUP = totalUP * 0.4;

            // 🎯 ESKİ KODDAKİ PARTNER SEÇİMİ
            let favPartner = "-";
            if (Object.keys(d.partnerler).length > 0) {
                let partnerList = Object.entries(d.partnerler).sort((a, b) => b[1] - a[1]);
                favPartner = partnerList[0][0];
            }

            return { o, oyunIciIsim, ikon: guncelIkonlar[o] || 29, mac: mSayisi, wr: Math.round(wr * 100), k: (d.k / mSayisi).toFixed(1), da: (d.d / mSayisi).toFixed(1), a: (d.a / mSayisi).toFixed(1), kda: kda.toFixed(2), csMin: csMin.toFixed(1), cs10: ortCs10, fark: ortCsFark, up: Math.round(totalUP), favPartner };
        });

        // 🎯 1-2 MAÇLIK BALONLARI EZEN BARAJ SİSTEMİ
        hesaplanmisOyuncular.sort((a, b) => {
            let aGecti = a.mac >= 3 ? 1 : 0;
            let bGecti = b.mac >= 3 ? 1 : 0;
            if (bGecti !== aGecti) return bGecti - aGecti;
            if (Math.abs(b.up - a.up) > 0.01) return b.up - a.up;
            return b.kda - a.kda;
        });

        let rolMetni = yerelRolCeviri[rol] || rol;

        html += `
        <div style="width: 100%; max-width: 600px; background: rgba(9, 12, 16, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0ac8b9; padding-bottom: 12px; margin-bottom: 20px;">
                <h3 style="color: #ffffff; margin: 0; font-size: 1.1em; text-transform: uppercase; letter-spacing: 1px;">${rolMetni}</h3>
                <span style="background: #0ac8b9; color: #010a13; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 900;">${hesaplanmisOyuncular.length} OYUNCU</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 15px;">`;

        hesaplanmisOyuncular.forEach((oyuncu, idx) => {
            let siraEtiketi = idx === 0 ? "👑<br>#1" : `#${idx + 1}`;
            let wrRenk = oyuncu.wr >= 50 ? "#3fb950" : "#f85149";
            let farkText = oyuncu.fark > 0 ? `+${oyuncu.fark}` : oyuncu.fark;
            let farkRenk = oyuncu.fark > 0 ? "#0ac8b9" : (oyuncu.fark < 0 ? "#f85149" : "#8b949e");

            let partnerGorseli = (rol === "BOTTOM" || rol === "UTILITY") && oyuncu.favPartner !== "-"
                ? `<div style="font-size: 0.85em; color: #ffd700; margin-top: 4px; line-height: 1.4;">
                        💛 Sık Oynadığı Partner:<br>
                        <span style="color: #9ea1f9; font-weight: bold;">${oyuncu.favPartner}</span>
                   </div>`
                : '';

            html += `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(13, 17, 23, 0.8); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; position: relative; overflow: hidden; transition: 0.2s;" onmouseover="this.style.background='rgba(88,166,255,0.1)'" onmouseout="this.style.background='rgba(13, 17, 23, 0.8)'">
                
                <div style="display: flex; align-items: flex-start; gap: 15px; flex: 1; min-width: 0;">
                    <div style="font-weight: 900; font-size: 1.1em; color: ${idx === 0 ? '#ffd700' : '#8b949e'}; width: 35px; text-align: center; margin-top: 5px; line-height:1.2;">${siraEtiketi}</div>
                    <img src="${Yardimci.ikonUrlGetir(oyuncu.ikon, typeof RiotCDN !== 'undefined' ? RiotCDN.surum : '16.12.1')}" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid ${idx === 0 ? '#ffd700' : 'rgba(255,255,255,0.1)'}; flex-shrink: 0;">
                    <div style="display: flex; flex-direction: column; min-width: 0; padding-right: 10px;">
                        <div style="font-size: 1.2em; font-weight: bold; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom:2px;">
                            ${oyuncu.oyunIciIsim}
                        </div>
                        <div style="font-size: 0.85em; color: #8b949e; font-style: italic;">${oyuncu.o}</div>
                        ${partnerGorseli}
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; align-items: flex-end; text-align: right; flex-shrink: 0; min-width: 220px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <span style="color: ${wrRenk}; font-weight: 900; font-size: 1.2em;">%${oyuncu.wr} WR</span>
                        <span style="background: rgba(200,0,255,0.15); border: 1px solid #e066ff; color: #e066ff; padding: 3px 10px; border-radius: 4px; font-size: 0.9em; font-weight: 900;">UP: ${oyuncu.up}</span>
                    </div>
                    <div style="font-size: 0.85em; color: #8b949e; margin-bottom: 5px;">
                        ${oyuncu.mac} Maç | KDA: <b style="color: #0ac8b9;">${oyuncu.k} / ${oyuncu.da} / ${oyuncu.a}</b>
                    </div>
                    ${rol !== "UTILITY" ? `
                    <div style="font-size: 0.85em; color: #8b949e; display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
                        CS/min: <b style="color: #fff;">${oyuncu.csMin}</b> 10.Dk: <b style="color: #fff;">${oyuncu.cs10}</b> ⚔️ <b style="color: ${farkRenk};">${farkText} Fark</b>
                    </div>` : `
                    <div style="font-size: 0.85em; color: #8b949e;">
                        CS/min: <b style="color: #fff;">${oyuncu.csMin}</b>
                    </div>`}
                </div>
            </div>`;
        });
        html += `</div></div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
};
/* ==============================================================================
   🎯 DİNAMİK KESKİN NİŞANCI FİLTRESİ (ZIRHLI VE AKILLI MOTOR)
============================================================================== */
window.keskinNisanciFiltresi = function (arananRol, tiklananKart) {
    let kapsayici = document.getElementById('profil-ana-duzen');
    if (!kapsayici) return;

    let filtreAktifMi = tiklananKart.getAttribute('data-aktif') === 'true';

    let tumRolKartlari = kapsayici.querySelectorAll('.rol-rapor-karti');
    let tumMacKartlari = kapsayici.querySelectorAll('.profil-mac-karti'); // Tüm maçları bul

    // Hangi şampiyonun seçili olduğunu bulalım ki filtreleme diğer maçları bozmasın
    let secici = document.getElementById('profil-sampiyon-secici');
    let seciliSampiyon = secici ? secici.value : 'hepsi';

    if (filtreAktifMi) {
        // FİLTREYİ KALDIR (Her şeyi şampiyon seçimine göre eski haline getir)
        tiklananKart.setAttribute('data-aktif', 'false');

        tumRolKartlari.forEach(kart => {
            kart.style.borderColor = 'var(--border-color)';
            kart.style.opacity = '1';
            kart.style.transform = 'scale(1)';
            kart.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        });

        tumMacKartlari.forEach(mac => {
            let macSampiyon = mac.getAttribute('data-sampiyon');
            if (seciliSampiyon === 'hepsi' || macSampiyon === seciliSampiyon) {
                mac.style.display = 'flex';
                mac.style.animation = 'fadein 0.3s ease';
            } else {
                mac.style.display = 'none';
            }
        });

    } else {
        // FİLTREYİ UYGULA
        tumRolKartlari.forEach(kart => {
            kart.setAttribute('data-aktif', 'false');
            kart.style.borderColor = 'var(--border-color)';
            kart.style.opacity = '0.4';
            kart.style.transform = 'scale(0.98)';
            kart.style.boxShadow = 'none';
        });

        tiklananKart.setAttribute('data-aktif', 'true');
        tiklananKart.style.borderColor = '#0ac8b9';
        tiklananKart.style.opacity = '1';
        tiklananKart.style.transform = 'scale(1.02)';
        tiklananKart.style.boxShadow = '0 0 20px rgba(10, 200, 185, 0.3)';
        tiklananKart.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';

        // Maçları Süz
        let rolCeviriTers = { "TOP": "TOP", "JNG": "JUNGLE", "MID": "MIDDLE", "BOT": "BOTTOM", "SUP": "UTILITY", "NİŞANCI": "BOTTOM", "DESTEK": "UTILITY" };

        tumMacKartlari.forEach(mac => {
            // 1. Yeni kodlarda olan data-pozisyon'u ara
            let macRolu = mac.getAttribute('data-pozisyon');

            // 2. Eski koddaysa, kartın içindeki span etiketinden rolü söküp al (Zırhlı Yöntem)
            if (!macRolu) {
                let spanlar = mac.querySelectorAll('span');
                spanlar.forEach(s => {
                    let metin = s.innerText.trim();
                    if (rolCeviriTers[metin]) {
                        macRolu = rolCeviriTers[metin];
                    }
                });
            }

            let macSampiyon = mac.getAttribute('data-sampiyon');
            let sampiyonUyuyor = (seciliSampiyon === 'hepsi' || macSampiyon === seciliSampiyon);

            if (macRolu === arananRol && sampiyonUyuyor) {
                mac.style.display = 'flex';
                mac.style.animation = 'fadein 0.3s ease';
            } else {
                mac.style.display = 'none';
            }
        });
    }
};
// 🎯 SEÇİLEN ŞAMPİYONUN ROLLERE GÖRE ANALİZ KARTLARINI ÇİZEN MOTOR
window.sagKolonCiz = function (oyuncuAdi, sampiyonAdi) {
    let maclar = window.GuncelDurum.veriyiFiltrele(Sistem.veriler).filter(m => m.oyuncu === oyuncuAdi && m.sampiyon === sampiyonAdi);
    let rolGruplari = {};

    maclar.forEach(m => {
        let r = m.pozisyon || "BELIRSIZ";
        if (r === "INVALID") r = "BELIRSIZ";
        if (!rolGruplari[r]) rolGruplari[r] = [];
        rolGruplari[r].push(m);
    });

    let html = "";
    let siraliRoller = Object.entries(rolGruplari).sort((a, b) => b[1].length - a[1].length);

    siraliRoller.forEach(([rol, rolMaclari]) => {
        let zafer = rolMaclari.filter(m => m.sonuc === "Zafer" || m.sonuc === "Galibiyet").length;
        let wr = ((zafer / rolMaclari.length) * 100).toFixed(0);
        let wrRenk = wr >= 50 ? "#3fb950" : "#f85149";

        let t_k = 0, t_d = 0, t_a = 0, t_cs = 0, t_sure = 0, sabotaj = 0;
        let t_dpm = 0, t_barikat = 0, t_q = 0, t_w = 0, t_e = 0;
        let esyalar = {};

        rolMaclari.forEach(m => {
            t_k += m.oldurme || 0; t_d += m.olum || 0; t_a += m.asist || 0;
            t_dpm += m.dakika_basi_hasar || 0;
            t_barikat += m.alinan_barikat || 0;
            t_q += m.q_kullanimi || 0;
            t_w += m.w_kullanimi || 0;
            t_e += m.e_kullanimi || 0;

            if (rol !== "UTILITY") {
                t_cs += m.cs || 0;
                t_sure += m.sure_saniye || 0;
            }
            if (IstatistikMotoru.checkSabotaj(m)) sabotaj++;

            if (m.esyalar && window.itemVeritabani) {
                m.esyalar.slice(0, 6).forEach(e => {
                    if (e > 0 && window.itemVeritabani[e]) {
                        let itm = window.itemVeritabani[e];
                        if ((itm.gold && itm.gold.total >= 1600) || (itm.tags && itm.tags.includes("Boots"))) {
                            esyalar[e] = (esyalar[e] || 0) + 1;
                        }
                    }
                });
            }
        });

        let ortK = (t_k / rolMaclari.length).toFixed(1);
        let ortD = (t_d / rolMaclari.length).toFixed(1);
        let ortA = (t_a / rolMaclari.length).toFixed(1);
        let ortCS = t_sure > 0 ? (t_cs / (t_sure / 60)).toFixed(1) : "0.0";
        let ortDpm = Math.round(t_dpm / rolMaclari.length);
        let ortBarikat = (t_barikat / rolMaclari.length).toFixed(1);

        let maxSpam = Math.max(t_q, t_w, t_e);
        let spamYetenek = maxSpam === t_q ? "Q" : (maxSpam === t_w ? "W" : "E");

        let davranis = IstatistikMotoru.davranisHesapla(
            t_k / rolMaclari.length, t_d / rolMaclari.length, t_a / rolMaclari.length,
            rol, 0, 0, parseFloat(ortCS), (sabotaj / rolMaclari.length)
        );

        let favoriEsyalarHtml = Object.entries(esyalar).sort((a, b) => b[1] - a[1]).slice(0, 4).map(e =>
            `<img src="${RiotCDN.esyaResim(e[0])}" style="width: 32px; height: 32px; border-radius: 6px; border: 1px solid var(--border-color);">`
        ).join("");

        let rolMetni = rolCeviri[rol] || rol;

        html += `
        <div class="rol-rapor-karti" onclick="window.keskinNisanciFiltresi('${rol}', this)" style="background: rgba(9, 20, 40, 0.8); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); cursor: pointer; transition: all 0.2s ease;">
            <div style="text-align: center; margin-bottom: 15px;">
                <img src="${Yardimci.resimUrlGetir(sampiyonAdi, RiotCDN.surum)}" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid var(--accent-color); margin-bottom: 8px;">
                <div style="font-weight: bold; color: #fff; font-size: 1.1em;">${Yardimci.formatSampiyon(sampiyonAdi)} <span style="color: var(--hextech-gold);">(${rolMetni})</span></div>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-size: 0.85em; color: #8b949e; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">
                <span>Kazanma Oranı</span>
                <span style="color: ${wrRenk}; font-weight: bold;">%${wr} <span style="font-size: 0.85em; font-weight: normal; color: #8b949e;">(${rolMaclari.length} Maç)</span></span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85em; color: #8b949e; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">
                <span>Ortalama KDA</span>
                <span style="color: #fff; font-weight: bold;">${ortK} / <span style="color:#f85149;">${ortD}</span> / ${ortA}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85em; color: #8b949e; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">
                <span>Ortalama CS/min</span>
                <span style="color: #fff; font-weight: bold;">${ortCS}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85em; color: #8b949e; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">
                <span>Hasar (DPM) / Barikat</span>
                <span style="color: #fff; font-weight: bold;"><span style="color:#f85149;">${ortDpm}</span> / <span style="color:#a1d586;">${ortBarikat}</span></span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85em; color: #8b949e; margin-bottom: 15px;">
                <span>Spam Yetenek (Q/W/E)</span>
                <span style="color: var(--hextech-blue); font-weight: bold;">${spamYetenek} Tuşu</span>
            </div>

            <div style="margin-bottom: 15px;">
                <div style="font-size: 0.75em; color: #8b949e; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 5px;">Oyun Tarzı</div>
                <div style="font-weight: bold; color: #fff; font-size: 0.9em;">${davranis}</div>
            </div>

            <div>
                <div style="font-size: 0.75em; color: #8b949e; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 5px;">Favori Eşyalar</div>
                <div style="display: flex; gap: 4px;">
                    ${favoriEsyalarHtml || '<span style="font-size: 0.85em; color: #8b949e;">Yeterli Veri Yok</span>'}
                </div>
            </div>
        </div>`;
    });

    document.getElementById('bireysel-sag-kolon').innerHTML = html;
};
/* ==============================================================================
   🖖 KENDİ 5'LİNİ YARAT - KİMYA VE CEZA MOTORU (FIFA STYLE)
============================================================================== */
window.seciliKadro = { top: null, jng: null, mid: null, adc: null, sup: null };
window.aktifIncelenenOyuncu = null;

window.oyuncuEtiketTuret = function (isim) {
    let islenecekVeri = window.GuncelDurum.veriyiFiltrele(Sistem.veriler);
    let maclar = islenecekVeri.filter(x => x.oyuncu === isim);
    if (maclar.length === 0) return "";

    let tk = 0, td = 0, ta = 0, tcs = 0, tsu = 0, tgo = 0, ilkKan = 0;
    maclar.forEach(x => {
        tk += x.oldurme || 0; td += x.olum || 0; ta += x.asist || 0;
        tcs += x.cs || 0; tsu += x.sure_saniye || 0; tgo += x.gorus_skoru || 0;
        if (x.ilk_kan) ilkKan++;
    });

    let kda = td === 0 ? (tk + ta) : (tk + ta) / td;
    let csmin = tcs / (tsu / 60);
    let ortGorus = tgo / maclar.length;
    let ortOlum = td / maclar.length;

    let etiketler = [];
    if (kda > 3.5) etiketler.push('<span style="background:#28a745; color:#fff; padding:2px 8px; border-radius:4px; font-size:0.8em; font-weight:bold;">Yüksek KDA</span>');
    if (csmin > 6.5) etiketler.push('<span style="background:#28a745; color:#fff; padding:2px 8px; border-radius:4px; font-size:0.8em; font-weight:bold;">İyi Farm</span>');
    if (ortGorus > 25) etiketler.push('<span style="background:#28a745; color:#fff; padding:2px 8px; border-radius:4px; font-size:0.8em; font-weight:bold;">İyi Görüş</span>');
    if (ilkKan > (maclar.length * 0.15)) etiketler.push('<span style="background:#28a745; color:#fff; padding:2px 8px; border-radius:4px; font-size:0.8em; font-weight:bold;">Agresif Koridor</span>');
    if (ortOlum <= 4.5) etiketler.push('<span style="background:#28a745; color:#fff; padding:2px 8px; border-radius:4px; font-size:0.8em; font-weight:bold;">Hayatta Kalan</span>');

    if (ortOlum >= 8) etiketler.push('<span style="background:#dc3545; color:#fff; padding:2px 8px; border-radius:4px; font-size:0.8em; font-weight:bold;">Çok Ölüyor</span>');
    if (csmin < 5.0 && (window.ekipVeritabani[isim]?.rolSayaclari["TOP"] || window.ekipVeritabani[isim]?.rolSayaclari["MIDDLE"] || window.ekipVeritabani[isim]?.rolSayaclari["BOTTOM"])) {
        etiketler.push('<span style="background:#dc3545; color:#fff; padding:2px 8px; border-radius:4px; font-size:0.8em; font-weight:bold;">Farmı Bıraktı</span>');
    }
    if (kda < 1.8) etiketler.push('<span style="background:#dc3545; color:#fff; padding:2px 8px; border-radius:4px; font-size:0.8em; font-weight:bold;">Düşük KDA</span>');

    return etiketler.join(" ");
};

window.hesaplaRolGucu = function (oyuncuIsmi, rol) {
    let islenecekVeri = window.GuncelDurum.veriyiFiltrele(Sistem.veriler);
    let maclar = islenecekVeri.filter(m => m.oyuncu === oyuncuIsmi && m.pozisyon === rol);
    if (maclar.length < 3) return { skor: 20, renk: "#f85149", metin: "Yetersiz Veri" };

    let zafer = maclar.filter(m => m.sonuc === "Zafer" || m.sonuc === "Galibiyet").length;
    let wr = (zafer / maclar.length) * 100;

    let kdaAvg = maclar.reduce((a, b) => a + ((b.oldurme || 0) + (b.asist || 0)) / ((b.olum || 1)), 0) / maclar.length;
    let skor = (wr * 0.7) + (Math.min(kdaAvg, 5) * 6);

    if (skor > 85) return { skor: skor, renk: "#3fb950", metin: "Elite" };
    if (skor > 60) return { skor: skor, renk: "#ffd700", metin: "Güçlü" };
    if (skor > 35) return { skor: skor, renk: "#ff9800", metin: "Ortalama" };
    return { skor: skor, renk: "#f85149", metin: "Zayıf" };
};

window.oyuncuModalAc = function (isim) {
    window.aktifIncelenenOyuncu = isim;
    let o = window.ekipVeritabani[isim];
    const rolCeviriKisa = { "TOP": "TOP", "JUNGLE": "JNG", "MIDDLE": "MID", "BOTTOM": "BOT", "UTILITY": "SUP" };

    let siraliRoller = Object.entries(o.rolSayaclari).sort((a, b) => b[1] - a[1]);
    let etiketlerHtml = window.oyuncuEtiketTuret(isim);

    document.getElementById("modal-o-isim").innerText = o.isim;
    let detayHtml = `
        <div style="margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
            <b style="color:var(--accent-color);">🏆 Uzmanlık:</b> <span style="color:#fff;">${o.herolarStr}</span><br>
            <b style="color:var(--accent-color);">⚔️ Ana Roller:</b> <span style="color:#fff;">${o.rollerStr}</span>
        </div>
        <div style="margin-bottom:15px; display:flex; flex-wrap:wrap; gap:5px; justify-content:center;">
            ${etiketlerHtml}
        </div>
        <div style="display:flex; flex-direction:column; gap:12px;">
    `;

    siraliRoller.forEach(([ingilizceRol, sayi]) => {
        let turkceRol = rolCeviriKisa[ingilizceRol] || ingilizceRol;
        let guc = window.hesaplaRolGucu(isim, ingilizceRol);
        detayHtml += `
            <div>
                <div style="display:flex; justify-content:space-between; font-size:0.85em; margin-bottom:4px; text-transform:uppercase;">
                    <span style="color:#8b949e;">${turkceRol}:</span> 
                    <b style="color:${guc.renk}">${guc.metin} (%${Math.round(guc.skor)})</b>
                </div>
                <div style="height:6px; background:#111; border-radius:3px; overflow:hidden;">
                    <div style="width:${guc.skor}%; height:100%; background:${guc.renk}; border-radius:3px;"></div>
                </div>
            </div>`;
    });

    detayHtml += `</div>`;
    document.getElementById("modal-o-detay").innerHTML = detayHtml;
    document.getElementById("modal-oyuncu").style.display = "flex";
};

window.roleAta = function (rol) {
    let isim = window.aktifIncelenenOyuncu;
    if (!isim) return;

    if (Object.values(window.seciliKadro).includes(isim)) {
        alert("Bu oyuncu zaten kadroda başka bir rolde!");
        return;
    }

    window.seciliKadro[rol] = isim;
    document.getElementById("modal-oyuncu").style.display = "none";
    window.seciliKadroyuCiz();
};

window.kadroSlotTemizle = function (rol) {
    window.seciliKadro[rol] = null;
    window.seciliKadroyuCiz();
};

window.kadroyuTemizle = function () {
    window.seciliKadro = { top: null, jng: null, mid: null, adc: null, sup: null };
    window.seciliKadroyuCiz();
};

window.seciliKadroyuCiz = function () {
    let islenecekVeri = window.GuncelDurum.veriyiFiltrele(Sistem.veriler);

    const roller = [
        { id: 'top', ad: 'TOP (Üst)', renk: '#a1d586', dbRol: 'TOP' },
        { id: 'jng', ad: 'JNG (Orman)', renk: '#e88245', dbRol: 'JUNGLE' },
        { id: 'mid', ad: 'MID (Orta)', renk: '#9ea1f9', dbRol: 'MIDDLE' },
        { id: 'adc', ad: 'BOT (Nişancı)', renk: '#ffb84d', dbRol: 'BOTTOM' },
        { id: 'sup', ad: 'SUP (Destek)', renk: '#aee2ff', dbRol: 'UTILITY' }
    ];

    let adcIsim = window.seciliKadro['adc'];
    let supIsim = window.seciliKadro['sup'];
    let botKimyaBonusu = 0;
    let kimyaMetniBot = "";

    // ALT KORİDOR SİNERJİSİ (DUO) KONTROLÜ
    if (adcIsim && supIsim) {
        let duoMaclar = islenecekVeri.filter(m => (m.oyuncu === adcIsim && m.pozisyon === "BOTTOM") || (m.oyuncu === supIsim && m.pozisyon === "UTILITY"));
        let duoWin = 0; let duoCount = 0; let macGruplari = {};
        duoMaclar.forEach(m => { if (!macGruplari[m.mac_id]) macGruplari[m.mac_id] = []; macGruplari[m.mac_id].push(m); });

        Object.values(macGruplari).forEach(grup => {
            if (grup.some(p => p.oyuncu === adcIsim && p.pozisyon === "BOTTOM") && grup.some(p => p.oyuncu === supIsim && p.pozisyon === "UTILITY")) {
                duoCount++; if (grup[0].sonuc === "Zafer" || grup[0].sonuc === "Galibiyet") duoWin++;
            }
        });

        let duoWR = duoCount > 0 ? (duoWin / duoCount) : 0;
        if (duoCount >= 10 && duoWR >= 0.50) { botKimyaBonusu = 12; kimyaMetniBot = "🔥 Harika İkili Sinerjisi (+)"; }
        else if (duoCount >= 5 && duoWR >= 0.45) { botKimyaBonusu = 6; kimyaMetniBot = "✨ Uyumlu İkili (+)"; }
        else if (duoCount > 0 && duoWR < 0.45) { botKimyaBonusu = -10; kimyaMetniBot = "⚠️ Zayıf İkili Sinerjisi (-)"; }
        else { botKimyaBonusu = 0; kimyaMetniBot = "❓ Birlikte Verileri Yok"; }
    }

    let toplamGuc = 0;
    let dogruRolSayisi = 0;

    roller.forEach(r => {
        let slotDiv = document.getElementById(`slot-${r.id}`);
        if (!slotDiv) return;

        let secilenIsim = window.seciliKadro[r.id];

        if (secilenIsim) {
            let o = window.ekipVeritabani[secilenIsim];
            let guc = window.hesaplaRolGucu(secilenIsim, r.dbRol);
            let finalSkor = guc.skor;
            let kimyaMetni = "";

            let anaRoller = Object.entries(o.rolSayaclari).sort((a, b) => b[1] - a[1]).slice(0, 2).map(x => x[0]);

            // KİMYA CEZASI: Ana 2 rolü dışında oynarsa -%70 Güç
            if (!anaRoller.includes(r.dbRol)) {
                finalSkor = finalSkor * 0.30;
                kimyaMetni = "❌ Yanlış Pozisyon (-%70)";
            } else {
                dogruRolSayisi++;
                if ((r.id === 'adc' || r.id === 'sup') && adcIsim && supIsim) {
                    finalSkor += botKimyaBonusu;
                    kimyaMetni = kimyaMetniBot;
                } else {
                    kimyaMetni = "✅ Uyumlu Pozisyon";
                }
            }

            finalSkor = Math.max(0, Math.min(finalSkor, 99));
            toplamGuc += finalSkor;
            let barRenk = finalSkor >= 80 ? '#3fb950' : (finalSkor >= 50 ? '#ffd700' : '#f85149');

            slotDiv.innerHTML = `
                <div style="display:flex; flex-direction:column; width:100%; cursor:default;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <span style="color:${r.renk}; font-size:0.85em; font-weight:bold; text-transform:uppercase;">${r.ad}</span>
                        <button onclick="event.stopPropagation(); window.kadroSlotTemizle('${r.id}')" class="mini-kapat">❌ Çıkar</button>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <img src="${Yardimci.ikonUrlGetir(o.ikon, RiotCDN.surum)}" style="width:28px; height:28px; border-radius:50%; border:1px solid ${barRenk};">
                            <b style="color:#fff; font-size:1.1em;">${secilenIsim}</b>
                        </div>
                        <b style="color:${barRenk}; font-size:1.2em; text-shadow:0 0 10px ${barRenk}80;">%${Math.round(finalSkor)}</b>
                    </div>
                    <div style="font-size:0.75em; color:${kimyaMetni.includes('❌') || kimyaMetni.includes('⚠️') ? '#f85149' : '#8b949e'}; margin-bottom:8px; font-style:italic; font-weight:bold;">${kimyaMetni}</div>
                    <div style="height:6px; background:#111; border-radius:3px; overflow:hidden;">
                        <div style="width:${finalSkor}%; height:100%; background:${barRenk}; transition: width 0.5s ease-in-out;"></div>
                    </div>
                </div>
            `;
            slotDiv.style.borderColor = barRenk;
            slotDiv.style.background = `rgba(0,0,0,0.4)`;
            slotDiv.onclick = null;
        } else {
            slotDiv.innerHTML = `<span style="color:${r.renk}; font-weight:bold;">${r.ad}:</span> <span style="color:#8b949e;">Seçilmedi</span>`;
            slotDiv.style.borderColor = "var(--border-color)";
            slotDiv.style.background = "rgba(13, 17, 23, 0.6)";
            slotDiv.onclick = function () { window.kadroSlotTemizle(r.id); };
        }
    });

    // TAKIM KİMYASI (SP) GÜNCELLEME
    let seciliSayisi = Object.values(window.seciliKadro).filter(x => x !== null).length;
    let uyum = 0;

    if (seciliSayisi > 0) {
        let ortalamaGuc = toplamGuc / 5; // Toplam gücü her zaman 5'e bölerek ilerlemeyi gösteriyoruz
        let ekstraBonus = 0;
        if (adcIsim && supIsim) {
            if (botKimyaBonusu > 0) ekstraBonus += 15;
            else if (botKimyaBonusu < 0) ekstraBonus -= 10;
        }
        if (dogruRolSayisi === 5) ekstraBonus += 10; // Herkes doğru roldeyse

        let finalPuan = ortalamaGuc + (ekstraBonus * (seciliSayisi / 5)); // Bonus kadro doldukça etki eder
        uyum = Math.max(0, Math.min(Math.round(finalPuan), 100));
    }

    let uyumYuzde = document.getElementById("uyum-yuzde");
    let uyumDoluluk = document.getElementById("uyum-doluluk");
    if (uyumYuzde) uyumYuzde.innerText = "%" + uyum;
    if (uyumDoluluk) {
        uyumDoluluk.style.width = uyum + "%";
        uyumDoluluk.style.background = uyum >= 80 ? '#3fb950' : (uyum >= 50 ? 'var(--accent-color)' : '#f85149');
        if (uyumYuzde) uyumYuzde.style.color = uyumDoluluk.style.background;
    }

    // 🛡️ SOL HAVUZDAKİ SEÇİLİ OYUNCULARI KARART (Glow Efektine Karşı Zırh)
    let aktifOyuncularDizisi = Object.values(window.seciliKadro).filter(Boolean);
    document.querySelectorAll('.havuz-oyuncu-karti').forEach(kart => {
        let kartIsim = kart.id.replace('havuz-kart-', '');
        if (aktifOyuncularDizisi.includes(kartIsim)) {
            kart.classList.add('secili-pasif');
        } else {
            kart.classList.remove('secili-pasif');
        }
    });

    // 🛡️ TAKIM ANALİZİ VE ŞAMPİYON HAVUZU MOTORU BURADA BAŞLIYOR
    let analizDiv = document.getElementById("takim-analiz-kutusu");
    if (!analizDiv) return;

    if (seciliSayisi === 0) {
        analizDiv.innerHTML = "";
        return;
    }

    let roleChampMap = { "TOP": {}, "JUNGLE": {}, "MIDDLE": {}, "BOTTOM": {}, "UTILITY": {} };
    let t_kda = 0, t_gorus = 0, t_cs = 0, t_olum = 0, t_erken = 0, t_tank = 0;

    aktifOyuncularDizisi.forEach(isim => {
        let pMaclar = islenecekVeri.filter(x => x.oyuncu === isim);
        if (pMaclar.length === 0) return;

        let pk = 0, pd = 0, pa = 0, pcs = 0, psu = 0, pgo = 0, ptank = 0;

        pMaclar.forEach(m => {
            // Şampiyon Eşleştirme Haritası
            let r = m.pozisyon;
            if (roleChampMap[r]) {
                if (!roleChampMap[r][m.sampiyon]) roleChampMap[r][m.sampiyon] = new Set();
                roleChampMap[r][m.sampiyon].add(isim);
            }

            // Sensör İstatistikleri
            pk += m.oldurme || 0; pd += m.olum || 0; pa += m.asist || 0;
            pcs += m.cs || 0; psu += m.sure_saniye || 0; pgo += m.gorus_skoru || 0;
            ptank += m.hasar_sogurulan || 0;
            if (m.erken_oyun_ustunlugu === 1) t_erken++;
        });

        t_kda += pd === 0 ? (pk + pa) : (pk + pa) / pd;
        t_cs += psu > 0 ? pcs / (psu / 60) : 0;
        t_gorus += pgo / pMaclar.length;
        t_olum += pd / pMaclar.length;
        t_tank += ptank / pMaclar.length;
    });

    const rolCeviriHavuz = { "TOP": "Üst Koridor Havuzu", "JUNGLE": "Orman Havuzu", "MIDDLE": "Orta Koridor Havuzu", "BOTTOM": "Nişancı Havuzu", "UTILITY": "Destek Havuzu" };
    const rolRenkleriHavuz = { "TOP": "#a1d586", "JUNGLE": "#e88245", "MIDDLE": "#9ea1f9", "BOTTOM": "#ffb84d", "UTILITY": "#aee2ff" };
    let yama = typeof RiotCDN !== 'undefined' ? RiotCDN.surum : "16.12.1";

    let champPoolHtml = `<div style="display:flex; flex-direction:column; gap:12px;">`;

    Object.keys(roleChampMap).forEach(rolKey => {
        let rChamps = roleChampMap[rolKey];
        if (Object.keys(rChamps).length === 0) return;

        let gruplanmis = { "Ortak": [] };
        aktifOyuncularDizisi.forEach(isim => { gruplanmis[isim] = []; });

        Object.entries(rChamps).forEach(([champ, oyuncuSet]) => {
            let oyuncular = Array.from(oyuncuSet);
            // Sadece kadrodaki oyuncuların oynadığı şampiyonları hesaba kat
            let gecerliOyuncular = oyuncular.filter(o => aktifOyuncularDizisi.includes(o));

            if (gecerliOyuncular.length > 1) {
                gruplanmis["Ortak"].push(champ);
            } else if (gecerliOyuncular.length === 1) {
                let pIsim = gecerliOyuncular[0];
                if (gruplanmis[pIsim]) gruplanmis[pIsim].push(champ);
            }
        });

        let satirHtml = "";

        if (gruplanmis["Ortak"].length > 0) {
            let icons = gruplanmis["Ortak"].map(h => `<img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/champion/${h}.png" style="width:30px; height:30px; border-radius:4px; border:1px solid #ffd700;" title="${Yardimci.formatSampiyon(h)} (Ortak Havuz)" onerror="this.style.display='none'">`).join("");
            satirHtml += `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                <span style="color:#ffd700; font-size:0.85em; font-weight:bold; min-width:80px;">🤝 Ortak:</span>
                <div style="display:flex; flex-wrap:wrap; gap:4px; flex:1;">${icons}</div>
            </div>`;
        }

        aktifOyuncularDizisi.forEach(isim => {
            if (gruplanmis[isim] && gruplanmis[isim].length > 0) {
                let icons = gruplanmis[isim].map(h => `<img src="https://ddragon.leagueoflegends.com/cdn/${yama}/img/champion/${h}.png" style="width:30px; height:30px; border-radius:4px; border:1px solid rgba(255,255,255,0.2);" title="${Yardimci.formatSampiyon(h)} (${isim})" onerror="this.style.display='none'">`).join("");
                satirHtml += `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                    <span style="color:#ffffff; font-size:0.85em; font-weight:normal; min-width:80px;">👤 ${isim}:</span>
                    <div style="display:flex; flex-wrap:wrap; gap:4px; flex:1;">${icons}</div>
                </div>`;
            }
        });

        if (satirHtml !== "") {
            champPoolHtml += `
            <div style="background:rgba(0,0,0,0.4); padding:12px; border-radius:8px; border-left:3px solid ${rolRenkleriHavuz[rolKey]}; border-top:1px solid rgba(255,255,255,0.05); border-right:1px solid rgba(255,255,255,0.05); border-bottom:1px solid rgba(255,255,255,0.05);">
                <div style="color:${rolRenkleriHavuz[rolKey]}; font-size:0.8em; font-weight:bold; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px;">${rolCeviriHavuz[rolKey]}</div>
                <div style="display:flex; flex-direction:column; gap:4px;">${satirHtml}</div>
            </div>`;
        }
    });
    champPoolHtml += `</div>`;

    // Takım Davranış Etiketleri
    let avgKda = t_kda / seciliSayisi;
    let avgCs = t_cs / seciliSayisi;
    let avgGorus = t_gorus / seciliSayisi;
    let avgTank = t_tank / seciliSayisi;

    let takimEtiketleri = [];
    if (avgKda >= 3.2) takimEtiketleri.push(`<span style="background:rgba(63,185,80,0.15); color:#3fb950; border:1px solid #3fb950; padding: 4px 10px; font-size:0.85em; border-radius:4px; font-weight:bold;">Yüksek KDA Takımı</span>`);
    if (avgCs >= 6.2) takimEtiketleri.push(`<span style="background:rgba(63,185,80,0.15); color:#3fb950; border:1px solid #3fb950; padding: 4px 10px; font-size:0.85em; border-radius:4px; font-weight:bold;">Makro / CS Odaklı</span>`);
    if (avgGorus >= 24) takimEtiketleri.push(`<span style="background:rgba(63,185,80,0.15); color:#3fb950; border:1px solid #3fb950; padding: 4px 10px; font-size:0.85em; border-radius:4px; font-weight:bold;">İyi Görüş Kontrolü</span>`);
    if (t_erken >= 2) takimEtiketleri.push(`<span style="background:rgba(63,185,80,0.15); color:#3fb950; border:1px solid #3fb950; padding: 4px 10px; font-size:0.85em; border-radius:4px; font-weight:bold;">Erken Oyunda (Early) Güçlü</span>`);
    if (avgTank >= 26000) takimEtiketleri.push(`<span style="background:rgba(63,185,80,0.15); color:#3fb950; border:1px solid #3fb950; padding: 4px 10px; font-size:0.85em; border-radius:4px; font-weight:bold;">Dayanıklı (Tanky) Kadro</span>`);

    if (t_olum / seciliSayisi >= 7.5) takimEtiketleri.push(`<span style="background:rgba(248,81,73,0.15); color:#f85149; border:1px solid #f85149; padding: 4px 10px; font-size:0.85em; border-radius:4px; font-weight:bold;">Kırılgan Kadro (Çok Ölüyor)</span>`);
    if (avgCs < 4.8) takimEtiketleri.push(`<span style="background:rgba(248,81,73,0.15); color:#f85149; border:1px solid #f85149; padding: 4px 10px; font-size:0.85em; border-radius:4px; font-weight:bold;">Düşük Tempolu Minyon (Slow CS)</span>`);

    if (takimEtiketleri.length === 0) takimEtiketleri.push(`<span style="background:rgba(139,148,158,0.15); color:#8b949e; border:1px solid #8b949e; padding: 4px 10px; font-size:0.85em; border-radius:4px; font-weight:bold;">Dengeli / Standart Kadro</span>`);

    analizDiv.innerHTML = `
        <div style="background:rgba(0,0,0,0.2); border:1px dashed var(--border-color); border-radius:8px; padding:20px; margin-top:15px;">
            <h4 style="color:var(--hextech-gold); text-align:center; font-family:'Cinzel', serif; margin-top:0; letter-spacing:1px; border-bottom:1px solid rgba(200,170,110,0.2); padding-bottom:10px;">🛡️ Stratejik Takım Analizi</h4>
            
            <div style="margin-bottom:20px;">
                <div style="font-size:0.85em; color:#8b949e; font-weight:bold; margin-bottom:10px; text-transform:uppercase;">📊 Kadro Karakteristiği</div>
                <div style="display:flex; flex-wrap:wrap; gap:8px;">${takimEtiketleri.join("")}</div>
            </div>

            <div>
                <div style="font-size:0.85em; color:#8b949e; font-weight:bold; margin-bottom:10px; text-transform:uppercase;">📋 Kulvarlara Göre Şampiyon Havuzu</div>
                ${champPoolHtml}
            </div>
        </div>
    `;
};
window.BireyselProfilYukle = function (isim, btnElement) {
    // 1. Menü aktifliğini güncelle
    document.querySelectorAll('.bireysel-oyuncu-btn').forEach(b => b.classList.remove('aktif'));
    btnElement.classList.add('aktif');

    // 2. Ekranı temizle (Hızlı görsel tepki)
    let ekran = document.getElementById("bireysel-detay-ekrani");
    ekran.style.opacity = "0";

    // 3. Çok küçük bir gecikme ile DOM'u güncelle
    setTimeout(() => {
        ekran.innerHTML = Sayfalar.cizProfilDetay(isim);
        ekran.style.opacity = "1";
    }, 50); // 50ms, insan gözü için anlık ama tarayıcı için nefes alma süresi
};
/* ==============================================================================
   🚀 TEMBEL YÜKLEME (LAZY LOAD) MOTORU - DOM OPTİMİZASYONU
============================================================================== */
window.kutuAcDinamik = function (panelId, macId, oyuncuAdi, event) {
    let panel = document.getElementById(panelId);
    if (!panel) return;

    // Panel kapalıysa aç ve içini doldur
    if (panel.style.display === 'none' || panel.style.display === '') {
        // Eğer panelin içi boşsa (ilk defa tıklanıyorsa) HTML'i o an üret!
        if (panel.innerHTML.trim() === '') {
            panel.innerHTML = typeof window.cizTakimKarti === 'function'
                ? window.cizTakimKarti(window.GuncelDurum.veriyiFiltrele(Sistem.veriler).filter(m => m.mac_id === macId), oyuncuAdi)
                : '<div style="color:#f85149; text-align:center; padding:10px;">Takım verisi yüklenemedi.</div>';
        }
        panel.style.display = 'block';
    } else {
        // Zaten açıksa kapat
        panel.style.display = 'none';
    }
};
/* ==============================================================================
   🏆 CLASH ARENASI KUTU AÇMA (LAZY LOAD) MOTORU
============================================================================== */
window.clashKutuAcDinamik = function (panelId, macId, event) {
    let panel = document.getElementById(panelId);
    if (!panel) return;

    // Eğer tıklama event'i varsa diğer elementleri etkilemesini engelle
    if (event) event.stopPropagation();

    // Kutu kapalıysa aç ve içini doldur
    if (panel.style.display === 'none' || panel.style.display === '') {
        // İçerik boşsa, veriyi Sistem.verilerClash'ten çek ve cizTakimKarti ile çiz
        if (panel.innerHTML.trim() === '') {
            let takimVerisi = Sistem.verilerClash.filter(m => m.mac_id === macId);

            panel.innerHTML = typeof window.cizTakimKarti === 'function'
                ? window.cizTakimKarti(takimVerisi, "")
                : '<div style="color:#f85149; text-align:center; padding:10px;">Takım verisi yüklenemedi.</div>';
        }
        panel.style.display = 'block';
    } else {
        // Kutu zaten açıksa kapat
        panel.style.display = 'none';
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const rf = document.getElementById("btn-refresh");
    if (rf) rf.addEventListener("click", sistemiBaslat);
    window.ImlecMotoru = {
        degistir: (tip) => {
            let yeniSinif = (tip === 'nostalji') ? 'imlec-eldiven' : 'imlec-hextech';
            document.body.className = yeniSinif;
            document.documentElement.className = yeniSinif;
            localStorage.setItem("imlecTercihi", yeniSinif);
        }
    };
    sistemiBaslat();
});

document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'btn-eski-yamalar') {
        const kapsayici = document.getElementById('eski-yamalar-kapsayici');
        if (kapsayici) {
            kapsayici.classList.toggle('gizle');
            e.target.innerText = kapsayici.classList.contains('gizle') ? '⬇️ Eski Arayüz Sürümlerini Aç' : '⬆️ Eski Arayüz Sürümlerini Kapat';
        }
    }
    if (e.target && e.target.id === 'btn-eski-bot-yamalar') {
        const kapsayici = document.getElementById('bot-eski-yamalar-kapsayici');
        if (kapsayici) {
            kapsayici.classList.toggle('gizle');
            e.target.innerText = kapsayici.classList.contains('gizle') ? '⬇️ Bot Geçmişini Aç' : '⬆️ Bot Geçmişini Kapat';
        }
    }
});
