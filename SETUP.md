# 🚀 MediaForge - Hızlı Başlangıç Kılavuzu

## 📋 Adım Adım Kurulum

### 1️⃣ Sistem Gereksinimlerini Kur

#### Windows Kullanıcıları

**1. Node.js Kurulumu:**
- [nodejs.org](https://nodejs.org) adresinden LTS sürümünü indirin
- İndirdiğiniz .msi dosyasını çalıştırın
- Kurulum tamamlandığında PowerShell açın ve test edin:
  ```powershell
  node --version
  npm --version
  ```

**2. Rust Kurulumu:**
- [rustup.rs](https://rustup.rs) adresinden indirin
- `rustup-init.exe` dosyasını çalıştırın
- Kurulum tamamlandığında terminali yeniden açın ve test edin:
  ```powershell
  rustc --version
  cargo --version
  ```

**3. FFmpeg Kurulumu:**

**Seçenek A - Chocolatey ile (Önerilen):**
```powershell
# PowerShell'i Administrator olarak açın
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Chocolatey kuruldu, şimdi FFmpeg'i kurun
choco install ffmpeg
```

**Seçenek B - Manuel Kurulum:**
1. [ffmpeg.org/download.html](https://ffmpeg.org/download.html) adresinden Windows build indirin
2. ZIP dosyasını çıkarın (örn: C:\ffmpeg)
3. Sistem değişkenlerine PATH ekleyin:
   - "Bu Bilgisayar" > Sağ tık > "Özellikler"
   - "Gelişmiş sistem ayarları"
   - "Ortam Değişkenleri"
   - "Path" değişkenine `C:\ffmpeg\bin` ekleyin

**Test edin:**
```powershell
ffmpeg -version
```

#### macOS Kullanıcıları

Terminal açın ve şu komutları çalıştırın:

```bash
# 1. Homebrew kurulumu (yoksa)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Node.js kurulumu
brew install node

# 3. Rust kurulumu
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# 4. FFmpeg kurulumu
brew install ffmpeg

# Test edin
node --version
cargo --version
ffmpeg -version
```

#### Linux Kullanıcıları (Ubuntu/Debian)

```bash
# 1. Node.js kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Rust kurulumu
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# 3. FFmpeg kurulumu
sudo apt update
sudo apt install ffmpeg

# 4. Tauri için gerekli kütüphaneler
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Test edin
node --version
cargo --version
ffmpeg -version
```

### 2️⃣ Projeyi Çalıştır

Projenin olduğu dizine gidin ve şu komutları çalıştırın:

```bash
# Bağımlılıkları yükle
cd mediaforge
npm install

# Uygulamayı çalıştır
npm run tauri dev
```

İlk çalıştırmada Rust bağımlılıkları derlenecek, bu 2-5 dakika sürebilir. ☕

### 3️⃣ Kullanmaya Başla!

Uygulama açıldığında:

1. **Dosya Ekle**: Ortadaki alana dosya sürükle-bırak veya tıkla
2. **Preset Seç**: Hazır profillerden birini seç veya "Gelişmiş Ayarlar"a geç
3. **Format Seç**: Hedef formatı belirle (MP4, MP3, vs.)
4. **Dönüştür**: Butona tıkla ve kayıt konumunu seç
5. **Bekle**: İlerleme çubuğu dönüşümü takip eder

## 🎨 Özellikler Hızlı Bakış

### Hızlı Profiller

| Profil | Ne İçin? | Ayarlar |
|--------|----------|---------|
| 🏆 Yüksek Kalite | En iyi görüntü | 5000k video, 320k audio |
| 🌐 Web Optimize | YouTube/sosyal medya | 720p, 1500k |
| 📱 Mobil Uyumlu | Telefonlar için | 480p, 800k |
| 🎵 Sadece Ses | Video → MP3 | 320k audio |
| 💿 Kayıpsız Audio | FLAC kalitesi | Lossless |
| 🎬 4K Video | Ultra HD | H.265, 15000k |

### Desteklenen Formatlar

**Video:** MP4, AVI, MKV, MOV, WebM, FLV, WMV, M4V  
**Audio:** MP3, WAV, FLAC, AAC, OGG, WMA, M4A, OPUS

## ❓ Sık Karşılaşılan Sorunlar

### "FFmpeg komutu bulunamadı"
FFmpeg PATH'e eklenmemiş. Yukarıdaki kurulum adımlarını tekrar kontrol edin.

### "Permission denied" hatası
Linux/macOS'ta FFmpeg'e yürütme izni verin:
```bash
sudo chmod +x /usr/local/bin/ffmpeg
```

### Derleme hatası (Rust)
Rust'ı güncelleyin:
```bash
rustup update stable
```

### Port 1420 kullanımda
Başka bir uygulama portu kullanıyor. `vite.config.ts` dosyasında portu değiştirin.

## 🎯 İpuçları

1. **Hızlı Dönüşüm**: "ultrafast" preset küçük kalite kaybıyla çok hızlı
2. **En İyi Kalite**: "veryslow" preset en iyi sonuç verir
3. **Küçük Dosya**: H.265 codec daha küçük dosya üretir
4. **Uyumluluk**: H.264 en uyumlu codec'tir

## 📦 Production Build

Dağıtım için executable oluşturmak istiyorsanız:

```bash
npm run tauri build
```

Build dosyaları `src-tauri/target/release` klasöründe olacak.

---

🎉 **Artık hazırsınız! MediaForge ile medya dönüştürmenin keyfini çıkarın!**

Herhangi bir sorun yaşarsanız GitHub'da issue açabilirsiniz.
