import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open, save } from '@tauri-apps/api/dialog';
import { listen } from '@tauri-apps/api/event';
import './App.css';

interface ConversionSettings {
  input_path: string;
  output_path: string;
  format: string;
  video_codec?: string;
  audio_codec?: string;
  video_bitrate?: string;
  audio_bitrate?: string;
  resolution?: string;
  fps?: string;
  quality?: string;
  preset?: string;
}

interface FormatInfo {
  name: string;
  extensions: string[];
  description: string;
  category: string;
}

interface PresetInfo {
  name: string;
  description: string;
  settings: ConversionSettings;
}

interface ConversionProgress {
  percentage: number;
  time: string;
  speed: string;
  bitrate: string;
}

function App() {
  const [inputFile, setInputFile] = useState<string>('');
  const [formats, setFormats] = useState<FormatInfo[]>([]);
  const [presets, setPresets] = useState<PresetInfo[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('mp4');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'quick' | 'advanced'>('quick');
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Advanced settings
  const [videoCodec, setVideoCodec] = useState<string>('libx264');
  const [audioCodec, setAudioCodec] = useState<string>('aac');
  const [videoBitrate, setVideoBitrate] = useState<string>('2000k');
  const [audioBitrate, setAudioBitrate] = useState<string>('192k');
  const [resolution, setResolution] = useState<string>('');
  const [fps, setFps] = useState<string>('');
  const [quality, setQuality] = useState<string>('23');
  const [preset, setPreset] = useState<string>('medium');

  useEffect(() => {
    loadFormats();
    loadPresets();
    
    const unlisten = listen('conversion-progress', (event: any) => {
      setProgress(event.payload);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  const loadFormats = async () => {
    try {
      const result = await invoke<FormatInfo[]>('get_supported_formats');
      setFormats(result);
    } catch (error) {
      console.error('Format yüklenemedi:', error);
    }
  };

  const loadPresets = async () => {
    try {
      const result = await invoke<PresetInfo[]>('get_presets');
      setPresets(result);
    } catch (error) {
      console.error('Preset yüklenemedi:', error);
    }
  };

  const handleSelectInput = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Media',
          extensions: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v', 'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus']
        }]
      });
      
      if (selected && typeof selected === 'string') {
        setInputFile(selected);
      }
    } catch (error) {
      console.error('Dosya seçilemedi:', error);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Tauri'de drag&drop için özel API kullanılması gerekiyor
    // Şimdilik sadece click ile dosya seçimi destekleniyor
    handleSelectInput();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handlePresetSelect = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = presets.find(p => p.name === presetName);
    if (preset) {
      setSelectedFormat(preset.settings.format);
      if (preset.settings.video_codec) setVideoCodec(preset.settings.video_codec);
      if (preset.settings.audio_codec) setAudioCodec(preset.settings.audio_codec);
      if (preset.settings.video_bitrate) setVideoBitrate(preset.settings.video_bitrate);
      if (preset.settings.audio_bitrate) setAudioBitrate(preset.settings.audio_bitrate);
      if (preset.settings.resolution) setResolution(preset.settings.resolution);
      if (preset.settings.fps) setFps(preset.settings.fps);
      if (preset.settings.quality) setQuality(preset.settings.quality);
      if (preset.settings.preset) setPreset(preset.settings.preset);
    }
  };

  const handleConvert = async () => {
    if (!inputFile) {
      alert('Lütfen bir giriş dosyası seçin!');
      return;
    }

    try {
      const outputPath = await save({
        filters: [{
          name: selectedFormat.toUpperCase(),
          extensions: [selectedFormat]
        }]
      });

      if (!outputPath) return;

      setIsConverting(true);

      const settings: ConversionSettings = {
        input_path: inputFile,
        output_path: outputPath,
        format: selectedFormat,
        video_codec: activeTab === 'advanced' ? videoCodec : undefined,
        audio_codec: activeTab === 'advanced' ? audioCodec : undefined,
        video_bitrate: activeTab === 'advanced' ? videoBitrate : undefined,
        audio_bitrate: activeTab === 'advanced' ? audioBitrate : undefined,
        resolution: activeTab === 'advanced' && resolution ? resolution : undefined,
        fps: activeTab === 'advanced' && fps ? fps : undefined,
        quality: activeTab === 'advanced' ? quality : undefined,
        preset: activeTab === 'advanced' ? preset : undefined,
      };

      await invoke('convert_media', { settings });
      alert('✨ Dönüştürme başarılı!');
      
    } catch (error) {
      console.error('Dönüştürme hatası:', error);
      alert(`❌ Hata: ${error}`);
    } finally {
      setIsConverting(false);
      setProgress(null);
    }
  };

  const handleCancel = async () => {
    try {
      await invoke('cancel_conversion');
      setIsConverting(false);
      setProgress(null);
    } catch (error) {
      console.error('İptal hatası:', error);
    }
  };

  const videoFormats = formats.filter(f => f.category === 'video');
  const audioFormats = formats.filter(f => f.category === 'audio');

  return (
    <div className="app">
      <div className="aurora aurora-1"></div>
      <div className="aurora aurora-2"></div>
      <div className="aurora aurora-3"></div>
      
      <div className="container">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1>MediaForge</h1>
          </div>
          <div className="subtitle">Advanced Media Converter</div>
        </header>

        <div className="main-content">
          <div 
            className={`drop-zone ${isDragging ? 'dragging' : ''} ${inputFile ? 'has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleSelectInput}
          >
            {!inputFile ? (
              <>
                <div className="drop-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Dosya Sürükle veya Tıkla</h3>
                <p>Video veya ses dosyası seç</p>
              </>
            ) : (
              <>
                <div className="file-selected">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3>{inputFile.split('/').pop()}</h3>
                <p>Dosya hazır</p>
              </>
            )}
          </div>

          {inputFile && (
            <>
              <div className="tabs">
                <button 
                  className={`tab ${activeTab === 'quick' ? 'active' : ''}`}
                  onClick={() => setActiveTab('quick')}
                >
                  <span>⚡</span> Hızlı Dönüştür
                </button>
                <button 
                  className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
                  onClick={() => setActiveTab('advanced')}
                >
                  <span>⚙️</span> Gelişmiş Ayarlar
                </button>
              </div>

              <div className="content-panel">
                {activeTab === 'quick' && (
                  <div className="quick-mode">
                    <div className="section">
                      <h3>📦 Hazır Profiller</h3>
                      <div className="presets-grid">
                        {presets.map((preset) => (
                          <button
                            key={preset.name}
                            className={`preset-card ${selectedPreset === preset.name ? 'selected' : ''}`}
                            onClick={() => handlePresetSelect(preset.name)}
                          >
                            <div className="preset-name">{preset.name}</div>
                            <div className="preset-desc">{preset.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="section">
                      <h3>🎯 Hedef Format</h3>
                      <div className="format-selector">
                        <div className="format-category">
                          <h4>Video</h4>
                          <div className="format-buttons">
                            {videoFormats.map(format => (
                              <button
                                key={format.name}
                                className={`format-btn ${selectedFormat === format.extensions[0] ? 'selected' : ''}`}
                                onClick={() => setSelectedFormat(format.extensions[0])}
                                title={format.description}
                              >
                                {format.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="format-category">
                          <h4>Audio</h4>
                          <div className="format-buttons">
                            {audioFormats.map(format => (
                              <button
                                key={format.name}
                                className={`format-btn ${selectedFormat === format.extensions[0] ? 'selected' : ''}`}
                                onClick={() => setSelectedFormat(format.extensions[0])}
                                title={format.description}
                              >
                                {format.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'advanced' && (
                  <div className="advanced-mode">
                    <div className="settings-grid">
                      <div className="setting-group">
                        <label>Video Codec</label>
                        <select value={videoCodec} onChange={e => setVideoCodec(e.target.value)}>
                          <option value="libx264">H.264 (En uyumlu)</option>
                          <option value="libx265">H.265 (Daha küçük)</option>
                          <option value="libvpx-vp9">VP9 (Web)</option>
                          <option value="copy">Kopyala (Hızlı)</option>
                        </select>
                      </div>

                      <div className="setting-group">
                        <label>Audio Codec</label>
                        <select value={audioCodec} onChange={e => setAudioCodec(e.target.value)}>
                          <option value="aac">AAC (Modern)</option>
                          <option value="libmp3lame">MP3 (Uyumlu)</option>
                          <option value="libopus">Opus (En iyi)</option>
                          <option value="flac">FLAC (Kayıpsız)</option>
                          <option value="copy">Kopyala</option>
                        </select>
                      </div>

                      <div className="setting-group">
                        <label>Video Bitrate</label>
                        <input 
                          type="text" 
                          value={videoBitrate} 
                          onChange={e => setVideoBitrate(e.target.value)}
                          placeholder="2000k"
                        />
                      </div>

                      <div className="setting-group">
                        <label>Audio Bitrate</label>
                        <input 
                          type="text" 
                          value={audioBitrate} 
                          onChange={e => setAudioBitrate(e.target.value)}
                          placeholder="192k"
                        />
                      </div>

                      <div className="setting-group">
                        <label>Çözünürlük</label>
                        <select value={resolution} onChange={e => setResolution(e.target.value)}>
                          <option value="">Orijinal</option>
                          <option value="3840x2160">4K (3840x2160)</option>
                          <option value="2560x1440">2K (2560x1440)</option>
                          <option value="1920x1080">Full HD (1920x1080)</option>
                          <option value="1280x720">HD (1280x720)</option>
                          <option value="854x480">SD (854x480)</option>
                        </select>
                      </div>

                      <div className="setting-group">
                        <label>FPS</label>
                        <select value={fps} onChange={e => setFps(e.target.value)}>
                          <option value="">Orijinal</option>
                          <option value="24">24 fps (Sinema)</option>
                          <option value="30">30 fps (Standart)</option>
                          <option value="60">60 fps (Smooth)</option>
                          <option value="120">120 fps (Yüksek)</option>
                        </select>
                      </div>

                      <div className="setting-group">
                        <label>Kalite (CRF)</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="51" 
                          value={quality} 
                          onChange={e => setQuality(e.target.value)}
                        />
                        <span className="range-value">{quality} {parseInt(quality) < 20 ? '(Yüksek)' : parseInt(quality) < 28 ? '(Orta)' : '(Düşük)'}</span>
                      </div>

                      <div className="setting-group">
                        <label>Hız/Kalite Dengesi</label>
                        <select value={preset} onChange={e => setPreset(e.target.value)}>
                          <option value="ultrafast">Ultra Hızlı</option>
                          <option value="superfast">Çok Hızlı</option>
                          <option value="veryfast">Hızlı</option>
                          <option value="faster">Hızlıca</option>
                          <option value="fast">Hızlı</option>
                          <option value="medium">Orta</option>
                          <option value="slow">Yavaş (İyi)</option>
                          <option value="slower">Daha Yavaş</option>
                          <option value="veryslow">En İyi Kalite</option>
                        </select>
                      </div>
                    </div>

                    <div className="format-selector-mini">
                      <label>Çıktı Formatı:</label>
                      <select value={selectedFormat} onChange={e => setSelectedFormat(e.target.value)}>
                        <optgroup label="Video">
                          {videoFormats.map(f => (
                            <option key={f.name} value={f.extensions[0]}>{f.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Audio">
                          {audioFormats.map(f => (
                            <option key={f.name} value={f.extensions[0]}>{f.name}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {isConverting && progress && (
                <div className="progress-panel">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(progress.percentage || 0, 100)}%` }}></div>
                  </div>
                  <div className="progress-stats">
                    <span>⏱️ {progress.time}</span>
                    <span>⚡ {progress.speed}</span>
                    <span>📊 {progress.bitrate}</span>
                  </div>
                </div>
              )}

              <div className="action-buttons">
                {!isConverting ? (
                  <button className="btn-primary" onClick={handleConvert}>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Dönüştür
                  </button>
                ) : (
                  <button className="btn-cancel" onClick={handleCancel}>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    İptal Et
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
