# 🌐 Minder — Web Vitrini (Landing Page)

> **Minder ana uygulamasının resmi web sitesi ve akıllı yönlendirme (Smart App Banner) sayfası.**
> Minder mobil uygulamasının App Store / Google Play onay süreçlerini destekleyen hukuki sayfaları ve masaüstü ziyaretçileri mobil store'lara yönlendiren vitrin sayfası.

🔗 **Canlı:** [minder.university](https://minder.university)

---

## 🗣️ Minder Nedir?

**Minder**, üniversite kampüslerindeki itiraf sayfalarının dijital ve anonim alternatifi. Konuma dayalı (GPS Geofencing) veya Eduroam Wi-Fi (IP bazlı) doğrulama ile yalnızca belirli bir kampüste fiziksel olarak bulunan öğrencilerin erişebildiği **hiper-yerel, tamamen anonim** bir mikro-sosyal ağ.

> **Slogan:** *"Kampüste ol, konuş, unut."*

### ✨ Ana Uygulama Özellikleri

- **🚪 Sıfır Sürtünme Kampüs Doğrulaması** — GPS Geofence (PostGIS polygon) VEYA Eduroam Wi-Fi (IP bazlı, dinamik CIDR). E-posta/SMS/kayıt yok, bekleme ekranı yok. 3 saatlik Campus Pass ile bağlantı kopsa bile akış kesintisiz.
- **🛡️ Güvenlik Sistemleri** — Donanım parmak izi (SHA-256), Fake GPS kalkanı, kalıcı donanım banı, RLS güvenlik duvarı (`x-device-id` header).
- **🎭 Yeraltı Kimlik Sistemi** — 100 Sıfat × 100 Figür = 10.000 kombinasyon (Örn: "Kaotik Engerek"). Zar At (Reroll) — 24 saat cooldown.
- **📡 Akış Motoru** — Gravity algoritması: `score / (age_in_hours + 2)^1.8`. Infinite scroll, New / Hot / Controversial sıralama, realtime feed.
- **🛡️ AI Moderasyon (Sıfır Maliyet)** — OpenAI Moderation API, 11 kategori kontrolü, otomatik Database Trigger ile webhook.
- **👑 KKTCELL VIP Jeton** — Deep Link ile VIP öğrenci girişi, tek kullanımlık JWT token (60 sn self-destruct), altın neon rozet.
- **📱 Ek Özellikler** — Bildirim merkezi, Yeraltı Arşivi, viral paylaşım (Instagram Story formatı).

### 🛠️ Ana Uygulama Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Runtime | React Native 0.76.9 + Expo SDK 52 |
| Dil | TypeScript 5.5 (strict) |
| Navigation | Expo Router 4.0 (file-based) |
| State | Zustand 5.0 |
| Backend | Supabase 2.45 (PostgreSQL + PostGIS + RLS) |
| AI Moderasyon | OpenAI Moderation API (ücretsiz) |

> ⚠️ **Not:** Minder ana mobil uygulaması (React Native + Supabase) **kapalı kaynaklıdır** ve bu repo'da yer almaz. Bu repo yalnızca web vitrini / landing page kodunu içerir.

---

## 📦 Bu Repo Ne İçerir?

Bu repo, Minder'ın **web sitesini** (landing page + hukuki sayfalar) içerir. En hafif stack ile (HTML + Tailwind CSS CDN + Vanilla JS) build adımı gerektirmeden çalışır.

### Sayfalar

| Sayfa | Açıklama | URL |
|-------|----------|-----|
| **Vitrin** | Masaüstü ziyaretçiler için landing page + mobil cihaz tespiti ve store yönlendirmesi | `/` |
| **Gizlilik Politikası** | %100 anonimlik, kişisel veri talep edilmediği, Cihaz Kimliği ve kampüs lokasyonu | `/privacy` |
| **Kullanım Şartları & EULA** | Apple UGC kurallarına uygun lisans sözleşmesi, sıfır tolerans politikası | `/terms` |
| **Çocuk Güvenliği** | Küçük kullanıcı koruması ve güvenlik politikası | `/safety` |
| **Veri Silme Politikası** | Google Play Data Deletion politikası, Cihaz Kimliği ile veri silme talebi | `/delete-data` |

### 🎯 Akıllı Yönlendirme (Smart App Banner)

Sayfa yüklendiğinde kullanıcının User-Agent bilgisini kontrol eder:

- **iOS** (iPhone/iPad) → "Seni App Store'a yönlendiriyoruz..." → 2 sn içinde App Store linki
- **Android** → "Seni Play Store'a yönlendiriyoruz..." → 2 sn içinde Play Store linki
- **Desktop** → Yönlendirme yapmaz, masaüstü vitrini gösterir (telefon mockup + QR kod)

### 🎨 Tasarım Dili

- **Karanlık tema** — Gece mavisi (`#0a0e1a`) + ızgara dokusu + accent blur ışıltıları
- **Premium vurgular** — Mor (`#7c5cff`) ve neon mavi (`#22d3ee`) gradient'ler
- **Minder vibe** — Yeraltı, isyankar, gizemli ama güvenli
- **Font** — Inter (Google Fonts)
- **Responsive** — Mobil ve masaüstü uyumlu

---

## 🚀 Kurulum ve Çalıştırma

Build adımı yok — statik HTML dosyalarıdır, doğrudan tarayıcıda açılır.

```bash
# Repo'yu klonla
git clone https://github.com/ruzorin/minder-web.git
cd minder-web

# (Opsiyonel) QR kod ve logo üretme araçları için bağımlılıklar
npm install

# Yerel olarak çalıştır — herhangi bir statik sunucu
npx serve .
# veya
python -m http.server 8000
```

Tarayıcıda `http://localhost:8000` adresini aç.

### 🛠️ Asset Üretme Araçları

`tools/` klasöründe, görsel asset'leri yeniden üretmek için Node.js scriptleri:

```bash
# QR kod (dummy) üret
node tools/gen-qr.js

# Logo + favicon üret (splash.png'den transparan arka planlı)
node tools/gen-logo.js

# Logo görselini analiz et
node tools/analyze-logo.js
```

---

## 📁 Proje Yapısı

```
minder-web/
├── index.html              # Vitrin (landing page) + mobil yönlendirme
├── privacy.html            # Gizlilik Politikası
├── terms.html              # Kullanım Şartları & EULA
├── safety.html             # Çocuk Güvenliği
├── delete-data.html        # Veri Silme Politikası (Data Deletion)
├── script.js               # Cihaz tespiti + yönlendirme mantığı
├── style.css               # Izgara arka plan, animasyonlar
├── assets/
│   └── img/
│       ├── logo.png              # Transparan header logosu
│       ├── favicon-32.png        # 32x32 favicon
│       ├── favicon-192.png       # 192x192 (Android/PWA)
│       ├── apple-touch-icon.png  # 180x180 (Apple)
│       ├── qr-code.svg           # Dummy QR kod
│       └── splash.png            # Orijinal logo kaynağı
└── tools/
    ├── gen-qr.js                 # QR kod üretici
    ├── gen-logo.js               # Logo/favicon üretici
    └── analyze-logo.js           # Logo analiz aracı
```

---

## 🌍 Desteklenen Kampüsler

| Kampüs | Şehir | Eduroam IP |
|--------|-------|------------|
| DAÜ | Gazimağusa, KKTC | 193.140.0.0/16 |
| İTÜ | İstanbul, TR | 160.75.0.0/16 |
| BOUN | İstanbul, TR | 139.179.0.0/16 |
| ODTÜ | Ankara, TR | 144.122.0.0/16 |

---

## 🔒 Gizlilik ve Güvenlik

- **Anonimlik:** İsim, e-posta, telefon yok — tamamen anonim
- **Donanım kilidi:** Silip yüklese bile aynı cihaz tanınır
- **Gölge ban:** Troller görünmez, kendi simülasyonlarında yaşarlar
- **RLS:** Her istek cihaz bazlı doğrulanır (`x-device-id` header)
- **Fake GPS:** Sahte konum tespiti → Eduroam'a zorlama
- **AI moderasyon:** Tüm içerik yayınlanmadan önce denetlenir

Detaylar için [Gizlilik Politikası](https://minder.university/privacy) ve [Kullanım Şartları](https://minder.university/terms) sayfalarına bakın.

---

## 📞 İletişim

- **E-posta:** [destek@minder.app](mailto:destek@minder.app)
- **Web:** [minder.university](https://minder.university)

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında açık kaynaklıdır.

> Minder ana mobil uygulaması (React Native + Supabase) ayrı bir kapalı kaynaklı projedir ve bu lisans kapsamında değildir.

---

<p align="center">
  <em>Kampüste ol, konuş, unut.</em>
</p>