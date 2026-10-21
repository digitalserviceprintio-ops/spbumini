import React, { useState, useRef } from 'react';
import { SpbuSettings, BluetoothDevice, FuelType } from '../types';
import { INITIAL_DEVICES, INITIAL_FUELS, PRESET_LOGOS, PresetLogo, formatRupiah, parseRupiah, playThermalSound } from '../data/constants';

interface ScreenSettingsProps {
  settings: SpbuSettings;
  onSaveSettings: (newSettings: SpbuSettings) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const ScreenSettings: React.FC<ScreenSettingsProps> = ({
  settings,
  onSaveSettings,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<SpbuSettings>(settings);
  const [devices, setDevices] = useState<BluetoothDevice[]>(INITIAL_DEVICES);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [fuelPrices, setFuelPrices] = useState<Record<FuelType, string>>({
    pertamax: formatRupiah(settings.fuelPrices.pertamax || 8600),
    pertalite: formatRupiah(settings.fuelPrices.pertalite || 10000),
    'pertamax-turbo': formatRupiah(settings.fuelPrices['pertamax-turbo'] || 14400),
    dexlite: formatRupiah(settings.fuelPrices.dexlite || 13700),
    'pertamina-dex': formatRupiah(settings.fuelPrices['pertamina-dex'] || 14350),
    biosolar: formatRupiah(settings.fuelPrices.biosolar || 6800),
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Mohon pilih file gambar (JPG, PNG, WEBP, SVG)', 'error');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      onShowToast('Ukuran gambar maksimal 4MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        logoMode: 'custom',
        customLogoUrl: result,
        customLogoName: file.name.replace(/\.[^/.]+$/, ''),
      }));
      onShowToast(`Logo "${file.name}" berhasil diambil dari galeri!`, 'image');
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be re-selected if needed
    e.target.value = '';
  };

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Mohon pilih file gambar (JPG, PNG, WEBP, SVG)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        logoMode: 'custom',
        customLogoUrl: result,
        customLogoName: file.name.replace(/\.[^/.]+$/, ''),
      }));
      onShowToast(`Logo "${file.name}" berhasil diunggah!`, 'image');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: PresetLogo) => {
    setFormData((prev) => ({
      ...prev,
      logoMode: 'custom',
      customLogoUrl: preset.url,
      customLogoName: preset.name,
    }));
    onShowToast(`Preset logo "${preset.name}" diterapkan`, 'check_circle');
  };

  const handleResetToOfficialLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logoMode: 'default',
      customLogoUrl: undefined,
      customLogoName: undefined,
    }));
    onShowToast('Kembali ke logo resmi Pertamina Retail', 'restart_alt');
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logoMode: 'none',
      customLogoUrl: undefined,
      customLogoName: undefined,
    }));
    onShowToast('Logo dinonaktifkan (mode teks standar)', 'visibility_off');
  };

  const handleScanDevices = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onShowToast('Ditemukan 4 Printer Bluetooth di sekitar dispenser', 'bluetooth_searching');
    }, 1600);
  };

  const handleConnectDevice = (targetMac: string) => {
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        status: d.mac === targetMac ? 'connected' : d.status === 'connected' ? 'standby' : d.status,
      }))
    );
    const target = devices.find((d) => d.mac === targetMac);
    onShowToast(`Terhubung ke ${target?.name || 'Printer Bluetooth'}`, 'bluetooth_connected');
  };

  const handleTestPrint = () => {
    playThermalSound();
    onShowToast('Mengirim ESC/POS Self Test ke RPP-02N...', 'print');
  };

  const handleDensityChange = (val: number) => {
    const densities: ('light' | 'normal' | 'dark')[] = ['light', 'normal', 'dark'];
    setFormData((prev) => ({ ...prev, density: densities[val - 1] || 'normal' }));
  };

  const densityIndex = formData.density === 'light' ? 1 : formData.density === 'dark' ? 3 : 2;
  const densityLabels = ['Ringan (80%)', 'Normal (100%)', 'Pekat (130%)'];

  const handleFuelPriceInput = (fuelId: FuelType, rawVal: string) => {
    const num = parseRupiah(rawVal);
    setFuelPrices((prev) => ({ ...prev, [fuelId]: formatRupiah(num) }));
    setFormData((prev) => ({
      ...prev,
      fuelPrices: {
        ...prev.fuelPrices,
        [fuelId]: num,
      },
    }));
  };

  const handleSaveAll = () => {
    onSaveSettings(formData);
    onShowToast('Pengaturan SPBU & Printer berhasil disimpan!', 'verified');
  };

  return (
    <div className="flex flex-col w-full pb-6 space-y-4">
      {/* Hardware Telemetry Card */}
      <div className="w-full bg-white rounded-xl shadow-sm border border-[#eaedff] p-4 flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#e2e7ff] flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[22px]">print</span>
            </div>
            <div>
              <span className="text-[10px] text-secondary uppercase tracking-wider block font-bold">
                Hardware Telemetry
              </span>
              <h2 className="font-headline font-bold text-[15px] text-on-surface">
                Koneksi Bluetooth Printer
              </h2>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            Aktif
          </span>
        </div>

        {/* Active Connected Device Details */}
        <div className="bg-[#f2f3ff] rounded-lg p-3 flex flex-col gap-1.5 border border-[#eaedff]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-headline font-bold text-[14px] text-on-surface truncate flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  bluetooth_connected
                </span>
                RPP-02N Bluetooth POS
              </p>
              <p className="font-mono text-[11px] text-[#5e3f3c]">MAC: 66:32:B1:4A:20:11</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#dae2fd] text-on-surface text-[10px] font-bold">
              58mm Default
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="flex flex-col bg-white p-2 rounded border border-[#eaedff]">
              <span className="text-[10px] text-[#5e3f3c]">Baterai</span>
              <span className="font-mono text-tertiary font-bold text-[12px] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">battery_5_bar</span> 88%
              </span>
            </div>
            <div className="flex flex-col bg-white p-2 rounded border border-[#eaedff]">
              <span className="text-[10px] text-[#5e3f3c]">Sinyal BT</span>
              <span className="font-mono text-secondary font-bold text-[12px] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span> -48 dBm
              </span>
            </div>
            <div className="flex flex-col bg-white p-2 rounded border border-[#eaedff]">
              <span className="text-[10px] text-[#5e3f3c]">Kertas Roll</span>
              <span className="font-mono text-on-surface font-bold text-[12px] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">receipt</span> Siap
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Scan & Self Test */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleScanDevices}
            disabled={isScanning}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] active:scale-[0.98] text-on-surface text-[12px] font-semibold transition-all cursor-pointer"
          >
            <span
              className={`material-symbols-outlined text-secondary text-[18px] ${
                isScanning ? 'animate-spin' : ''
              }`}
            >
              {isScanning ? 'progress_activity' : 'bluetooth_searching'}
            </span>
            <span>{isScanning ? 'Memindai...' : 'Scan Sekitar'}</span>
          </button>

          <button
            type="button"
            onClick={handleTestPrint}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-secondary text-white hover:bg-secondary/90 active:scale-[0.98] text-[12px] font-bold shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">document_scanner</span>
            <span>Test Print Struk</span>
          </button>
        </div>

        {/* Paired History List */}
        <div className="flex flex-col gap-1.5 pt-1">
          <label className="text-[11px] text-[#5e3f3c] uppercase tracking-wider font-bold">
            Perangkat Pernah Dipasangkan (Paired)
          </label>
          <div className="flex flex-col gap-1">
            {devices.map((device) => {
              const isConnected = device.status === 'connected';
              return (
                <div
                  key={device.mac}
                  className={`flex items-center justify-between p-2.5 rounded-lg transition-all ${
                    isConnected
                      ? 'bg-[#d6e3ff]/40 border border-secondary/30'
                      : 'bg-[#f2f3ff] hover:bg-[#eaedff]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        isConnected ? 'text-secondary' : 'text-[#5e3f3c]'
                      }`}
                    >
                      {isConnected ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                    <div className="truncate">
                      <p
                        className={`text-[12px] font-semibold truncate ${
                          isConnected ? 'text-secondary' : 'text-on-surface'
                        }`}
                      >
                        {device.name}
                      </p>
                      <p className="font-mono text-[#5e3f3c] text-[10px]">
                        {device.mac} •{' '}
                        {isConnected
                          ? 'Terhubung'
                          : device.status === 'pairing'
                          ? 'Siap Pairing'
                          : device.status === 'standby'
                          ? 'Standby'
                          : 'Di luar jangkauan'}
                      </p>
                    </div>
                  </div>

                  {isConnected ? (
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      check_circle
                    </span>
                  ) : device.status === 'out_of_range' ? (
                    <span className="material-symbols-outlined text-[#936e6a] text-[16px]">
                      link_off
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnectDevice(device.mac)}
                      className="px-2.5 py-1 rounded bg-[#eaedff] text-on-surface text-[11px] font-semibold hover:bg-secondary hover:text-white transition-colors cursor-pointer"
                    >
                      Sambung
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Format Thermal Kertas */}
      <div className="w-full bg-white rounded-xl shadow-sm border border-[#eaedff] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[22px]">tune</span>
          </div>
          <div>
            <span className="text-[10px] text-primary uppercase tracking-wider block font-bold">
              Konfigurasi Cetak
            </span>
            <h2 className="font-headline font-bold text-[15px] text-on-surface">
              Format Thermal Kertas
            </h2>
          </div>
        </div>

        {/* Paper Size Picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] text-on-surface font-semibold">Lebar Kertas Roll</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, paperWidth: '58' }))}
              className={`p-3 rounded-lg text-left transition-all cursor-pointer ${
                formData.paperWidth === '58'
                  ? 'bg-primary-fixed/30 border-2 border-primary shadow-xs'
                  : 'bg-[#f2f3ff] border border-transparent hover:bg-[#eaedff]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-headline font-bold text-[15px] text-primary">58 mm</span>
                <span className="material-symbols-outlined text-primary text-[20px]">
                  {formData.paperWidth === '58' ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </div>
              <span className="text-[11px] text-[#5e3f3c] block font-medium">32 Karakter / Baris</span>
              <span className="text-[11px] text-[#5e3f3c] mt-0.5 block">Standar SPBU Mobile</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, paperWidth: '80' }))}
              className={`p-3 rounded-lg text-left transition-all cursor-pointer ${
                formData.paperWidth === '80'
                  ? 'bg-secondary-fixed/40 border-2 border-secondary shadow-xs'
                  : 'bg-[#f2f3ff] border border-transparent hover:bg-[#eaedff]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-headline font-bold text-[15px] text-secondary">80 mm</span>
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  {formData.paperWidth === '80' ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </div>
              <span className="text-[11px] text-[#5e3f3c] block font-medium">48 Karakter / Baris</span>
              <span className="text-[11px] text-[#5e3f3c] mt-0.5 block">POS Desktop / Kiosk</span>
            </button>
          </div>
        </div>

        {/* Print Density Slider */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[13px] text-on-surface font-semibold" htmlFor="densitySlider">
              Ketebalan Cetak (Print Density)
            </label>
            <span className="px-2 py-0.5 rounded bg-[#eaedff] text-on-surface font-mono text-[11px] font-bold">
              {densityLabels[densityIndex - 1]}
            </span>
          </div>
          <input
            id="densitySlider"
            type="range"
            min={1}
            max={3}
            step={1}
            value={densityIndex}
            onChange={(e) => handleDensityChange(parseInt(e.target.value, 10))}
            className="w-full accent-primary h-2 bg-[#eaedff] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between px-1 text-[11px] text-[#5e3f3c]">
            <span>Ringan (Hemat)</span>
            <span className="font-bold text-primary">Normal (Direkomendasikan)</span>
            <span>Pekat (Gelap)</span>
          </div>
        </div>

        {/* Feed Lines & Auto-Cut */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-on-surface font-semibold" htmlFor="feedLines">
              Feed Baris Kosong
            </label>
            <select
              id="feedLines"
              value={formData.feedLines}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, feedLines: parseInt(e.target.value, 10) }))
              }
              className="w-full bg-[#f2f3ff] text-on-surface text-[12px] rounded-lg p-2.5 appearance-none focus:outline-none border border-[#eaedff] font-medium"
            >
              <option value="1">1 Baris</option>
              <option value="2">2 Baris</option>
              <option value="3">3 Baris (Standar)</option>
              <option value="4">4 Baris</option>
              <option value="5">5 Baris (Sobek Rapi)</option>
            </select>
          </div>

          <div className="flex flex-col justify-between p-2.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-on-surface font-semibold">Auto-Cut Paper</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoCut}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, autoCut: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-[#dae2fd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
            <span className="text-[10px] text-[#5e3f3c]">Khusus printer 80mm cutter</span>
          </div>
        </div>
      </div>

      {/* Pengaturan Logo Struk (Upload / Ambil dari Galeri) */}
      <div className="w-full bg-white rounded-xl shadow-sm border border-[#eaedff] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">add_photo_alternate</span>
            </div>
            <div>
              <span className="text-[10px] text-primary uppercase tracking-wider block font-bold">
                Branding &amp; Header Struk
              </span>
              <h2 className="font-headline font-bold text-[15px] text-on-surface">
                Pengaturan Logo Struk (Galeri &amp; Upload)
              </h2>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              formData.logoMode === 'custom'
                ? 'bg-secondary/15 text-secondary'
                : formData.logoMode === 'none'
                ? 'bg-neutral-100 text-neutral-600'
                : 'bg-tertiary/15 text-tertiary'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                formData.logoMode === 'custom'
                  ? 'bg-secondary'
                  : formData.logoMode === 'none'
                  ? 'bg-neutral-500'
                  : 'bg-tertiary animate-pulse'
              }`}
            />
            {formData.logoMode === 'custom'
              ? 'Logo Kustom Aktif'
              : formData.logoMode === 'none'
              ? 'Tanpa Logo'
              : 'Logo Resmi Pertamina'}
          </span>
        </div>

        {/* Logo Mode Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#eaedff] p-1 rounded-xl text-center text-[12px]">
          <button
            type="button"
            onClick={handleResetToOfficialLogo}
            className={`py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
              formData.logoMode === 'default'
                ? 'bg-white text-primary shadow-xs font-bold'
                : 'text-[#5e3f3c] hover:text-on-surface'
            }`}
          >
            Resmi Pertamina
          </button>
          <button
            type="button"
            onClick={() => {
              if (formData.customLogoUrl) {
                setFormData((prev) => ({ ...prev, logoMode: 'custom' }));
              } else {
                fileInputRef.current?.click();
              }
            }}
            className={`py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
              formData.logoMode === 'custom'
                ? 'bg-white text-secondary shadow-xs font-bold'
                : 'text-[#5e3f3c] hover:text-on-surface'
            }`}
          >
            Logo Galeri / File
          </button>
          <button
            type="button"
            onClick={handleRemoveLogo}
            className={`py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
              formData.logoMode === 'none'
                ? 'bg-white text-neutral-800 shadow-xs font-bold'
                : 'text-[#5e3f3c] hover:text-on-surface'
            }`}
          >
            Tanpa Logo
          </button>
        </div>

        {/* Upload Zone (Galeri / File Picker) */}
        <div className="flex flex-col gap-2">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
            id="logoFileInput"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDropFile}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
              isDragging
                ? 'border-secondary bg-secondary/10 scale-[1.01]'
                : 'border-[#dae2fd] hover:border-secondary hover:bg-[#f2f3ff] bg-[#faf8ff]'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#eaedff] flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[28px]">photo_library</span>
            </div>
            <div className="text-center">
              <p className="font-headline font-bold text-[13px] text-on-surface">
                Ambil / Upload Logo dari Galeri
              </p>
              <p className="text-[11px] text-[#5e3f3c] mt-0.5">
                Klik untuk memilih file gambar atau seret (drag &amp; drop) foto ke sini
              </p>
              <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                Mendukung PNG, JPG, JPEG, WEBP, SVG (Maksimal 4MB)
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-1 px-4 py-2 rounded-lg bg-secondary text-white font-headline text-[12px] font-bold shadow-xs hover:bg-secondary/90 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span>Pilih Gambar dari Galeri</span>
            </button>
          </div>
        </div>

        {/* Current Custom Logo Preview / Info */}
        {formData.logoMode === 'custom' && formData.customLogoUrl && (
          <div className="bg-[#f2f3ff] rounded-xl p-3 border border-[#eaedff] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-16 h-12 bg-white rounded-lg p-1 border border-[#dae2fd] flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={formData.customLogoUrl}
                  alt="Preview Logo"
                  className={`max-h-full max-w-full object-contain ${
                    formData.logoFilter === 'monochrome'
                      ? 'filter grayscale contrast-200'
                      : formData.logoFilter === 'high-contrast'
                      ? 'filter grayscale contrast-[300%]'
                      : ''
                  }`}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                  Logo Terpasang
                </span>
                <p className="font-headline font-bold text-[13px] text-on-surface truncate">
                  {formData.customLogoName || 'Custom_Logo_SPBU.png'}
                </p>
                <span className="text-[10px] text-[#5e3f3c]">
                  Siap dicetak pada format thermal {formData.paperWidth}mm
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Ganti Foto dari Galeri"
                className="p-2 rounded-lg bg-white hover:bg-[#eaedff] text-secondary border border-[#dae2fd] text-[12px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                <span className="hidden sm:inline">Ganti</span>
              </button>
              <button
                type="button"
                onClick={handleResetToOfficialLogo}
                title="Hapus dan kembalikan ke logo resmi"
                className="p-2 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-red-200 text-[12px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
        )}

        {/* Pilihan Galeri Preset Cepat */}
        <div className="flex flex-col gap-1.5 pt-1">
          <label className="text-[11px] text-[#5e3f3c] uppercase tracking-wider font-bold">
            Atau Pilih dari Galeri Preset SPBU
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_LOGOS.map((preset) => {
              const isSelected =
                formData.logoMode === 'custom' && formData.customLogoUrl === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-lg text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-secondary text-white shadow-xs ring-2 ring-secondary/50'
                      : 'bg-[#f2f3ff] hover:bg-[#eaedff] text-on-surface border border-[#eaedff]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-white text-secondary shadow-2xs'
                      }`}
                    >
                      {preset.tag}
                    </span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    )}
                  </div>
                  <div className="w-full h-8 bg-white/90 rounded p-1 mb-1.5 flex items-center justify-center overflow-hidden">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="max-h-full max-w-full object-contain filter grayscale contrast-150"
                    />
                  </div>
                  <p className="font-headline font-bold text-[11px] truncate leading-tight">
                    {preset.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pengaturan Format Logo (Ukuran, Filter, dan Posisi) */}
        {formData.logoMode !== 'none' && (
          <div className="bg-[#f2f3ff] rounded-xl p-3 border border-[#eaedff] space-y-2.5">
            <span className="text-[11px] text-[#5e3f3c] font-bold uppercase tracking-wider block">
              Format Tampilan Logo Pada Kertas Thermal
            </span>

            {/* Ukuran Logo */}
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-on-surface font-semibold">Ukuran Logo:</span>
              <div className="inline-flex rounded-lg bg-white p-0.5 border border-[#dae2fd]">
                {(['small', 'medium', 'large'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, logoSize: sz }))}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      formData.logoSize === sz
                        ? 'bg-secondary text-white font-bold shadow-2xs'
                        : 'text-[#5e3f3c] hover:text-on-surface'
                    }`}
                  >
                    {sz === 'small' ? 'Kecil' : sz === 'medium' ? 'Sedang' : 'Besar'}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Thermal */}
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-on-surface font-semibold">Efek Thermal:</span>
              <div className="inline-flex rounded-lg bg-white p-0.5 border border-[#dae2fd]">
                {[
                  { id: 'monochrome' as const, label: 'Monokrom (1-Bit)' },
                  { id: 'high-contrast' as const, label: 'Pekat' },
                  { id: 'original' as const, label: 'Original' },
                ].map((flt) => (
                  <button
                    key={flt.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, logoFilter: flt.id }))}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      formData.logoFilter === flt.id
                        ? 'bg-neutral-800 text-white font-bold shadow-2xs'
                        : 'text-[#5e3f3c] hover:text-on-surface'
                    }`}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Posisi Logo */}
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-on-surface font-semibold">Posisi Logo:</span>
              <div className="inline-flex rounded-lg bg-white p-0.5 border border-[#dae2fd]">
                {(['left', 'center'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, logoAlignment: pos }))}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      formData.logoAlignment === pos
                        ? 'bg-secondary text-white font-bold shadow-2xs'
                        : 'text-[#5e3f3c] hover:text-on-surface'
                    }`}
                  >
                    {pos === 'left' ? 'Rata Kiri' : 'Rata Tengah'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Master Identitas SPBU */}
      <div className="w-full bg-white rounded-xl shadow-sm border border-[#eaedff] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-[22px]">local_gas_station</span>
          </div>
          <div>
            <span className="text-[10px] text-tertiary uppercase tracking-wider block font-bold">
              Master Identitas SPBU
            </span>
            <h2 className="font-headline font-bold text-[15px] text-on-surface">
              Data Header &amp; Footer Struk
            </h2>
          </div>
        </div>

        <div className="space-y-3 text-[13px]">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-on-surface font-semibold" htmlFor="spbuNumber">
              Nomor SPBU Pertamina
            </label>
            <div className="flex items-center bg-[#f2f3ff] rounded-lg px-3 py-2 border border-[#eaedff]">
              <span className="material-symbols-outlined text-secondary text-[20px] mr-2">tag</span>
              <input
                id="spbuNumber"
                type="text"
                value={formData.spbuNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, spbuNumber: e.target.value }))}
                className="bg-transparent w-full text-on-surface font-mono font-bold uppercase focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-on-surface font-semibold" htmlFor="spbuPartner">
              Nama Mitra / Unit Pengelola
            </label>
            <div className="flex items-center bg-[#f2f3ff] rounded-lg px-3 py-2 border border-[#eaedff]">
              <span className="material-symbols-outlined text-primary text-[20px] mr-2">
                corporate_fare
              </span>
              <input
                id="spbuPartner"
                type="text"
                value={formData.partnerName}
                onChange={(e) => setFormData((prev) => ({ ...prev, partnerName: e.target.value }))}
                className="bg-transparent w-full text-on-surface focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-on-surface font-semibold" htmlFor="spbuAddress">
              Alamat Lengkap
            </label>
            <div className="flex items-center bg-[#f2f3ff] rounded-lg px-3 py-2 border border-[#eaedff]">
              <span className="material-symbols-outlined text-[#5e3f3c] text-[20px] mr-2">
                location_on
              </span>
              <input
                id="spbuAddress"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="bg-transparent w-full text-on-surface focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-on-surface font-semibold" htmlFor="spbuCity">
                Kecamatan &amp; Kota
              </label>
              <div className="flex items-center bg-[#f2f3ff] rounded-lg px-3 py-2 border border-[#eaedff]">
                <input
                  id="spbuCity"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  className="bg-transparent w-full text-on-surface focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-on-surface font-semibold" htmlFor="spbuPhone">
                Telepon Kantor
              </label>
              <div className="flex items-center bg-[#f2f3ff] rounded-lg px-3 py-2 border border-[#eaedff]">
                <span className="material-symbols-outlined text-[#5e3f3c] text-[18px] mr-1.5">
                  call
                </span>
                <input
                  id="spbuPhone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="bg-transparent w-full text-on-surface font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-on-surface font-semibold" htmlFor="spbuFooter">
              Pesan Footer Struk (Footer Greeting)
            </label>
            <div className="flex items-center bg-[#f2f3ff] rounded-lg px-3 py-2 border border-[#eaedff]">
              <span className="material-symbols-outlined text-[#5e3f3c] text-[20px] mr-2">
                waving_hand
              </span>
              <input
                id="spbuFooter"
                type="text"
                value={formData.footerMessage}
                onChange={(e) => setFormData((prev) => ({ ...prev, footerMessage: e.target.value }))}
                className="bg-transparent w-full text-on-surface font-mono uppercase focus:outline-none"
              />
            </div>
          </div>

          {/* Elemen Grafis Checkboxes */}
          <div className="flex flex-col gap-2 pt-1">
            <label className="text-[12px] text-on-surface font-semibold">
              Elemen Grafis &amp; Validasi Struk
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f3ff] cursor-pointer hover:bg-[#eaedff] transition-colors border border-[#eaedff]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    oil_barrel
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-on-surface font-medium">
                      Cetak Logo Pertamina Utama
                    </span>
                    <span className="text-[10px] text-[#5e3f3c]">
                      Header grafis monokrom bitmap resmi
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.printPertaminaLogo}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, printPertaminaLogo: e.target.checked }))
                  }
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f3ff] cursor-pointer hover:bg-[#eaedff] transition-colors border border-[#eaedff]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">
                    verified
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-on-surface font-medium">
                      Cetak Cap Logo "Pasti Pas!"
                    </span>
                    <span className="text-[10px] text-[#5e3f3c]">
                      Sertifikasi tera meteran takaran dispenser
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.printPastiPasLogo}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, printPastiPasLogo: e.target.checked }))
                  }
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f3ff] cursor-pointer hover:bg-[#eaedff] transition-colors border border-[#eaedff]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    qr_code_2
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-on-surface font-medium">
                      Cetak QR Validasi MyPertamina
                    </span>
                    <span className="text-[10px] text-[#5e3f3c]">
                      Tautan verifikasi barcode transaksi
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.printQrValidation}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, printQrValidation: e.target.checked }))
                  }
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Manajemen Tarif & Harga BBM */}
      <div className="w-full bg-white rounded-xl shadow-sm border border-[#eaedff] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">local_gas_station</span>
            </div>
            <div>
              <span className="text-[10px] text-primary uppercase tracking-wider block font-bold">
                Konfigurasi Produk
              </span>
              <h2 className="font-headline font-bold text-[15px] text-on-surface">
                Manajemen Tarif &amp; Harga BBM
              </h2>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-mono text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
            Sinkron Mesin
          </span>
        </div>

        <p className="text-[11px] text-[#5e3f3c] -mt-1">
          Perubahan tarif per liter otomatis terhubung ke perhitungan nominal dispenser dan cetak nota fisik.
        </p>

        <div className="flex flex-col gap-2">
          {INITIAL_FUELS.map((fuel) => (
            <div
              key={fuel.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] transition-all border border-[#eaedff]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-white font-headline text-[12px] font-bold flex-shrink-0"
                  style={{ backgroundColor: fuel.color }}
                >
                  {fuel.code}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-on-surface">{fuel.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-white font-semibold text-[#5e3f3c]">
                      {fuel.grade}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#5e3f3c] truncate">{fuel.subLabel}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center bg-white rounded-md px-2 py-1 shadow-xs border border-[#dae2fd]">
                  <span className="text-[11px] font-semibold text-[#5e3f3c] mr-1">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={fuelPrices[fuel.id]}
                    onChange={(e) => handleFuelPriceInput(fuel.id, e.target.value)}
                    className="w-16 bg-transparent text-right font-mono font-bold text-on-surface focus:outline-none"
                  />
                  <span className="text-[10px] text-[#5e3f3c] ml-0.5">/L</span>
                </div>
                <span className="material-symbols-outlined text-tertiary text-[18px]">
                  check_circle
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Struk Thermal Mockup */}
      <div className="w-full bg-[#f2f3ff] rounded-xl p-3 flex flex-col gap-2 border border-[#eaedff]">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-[#5e3f3c] uppercase tracking-wider flex items-center gap-1 font-bold">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            Pratinjau Struk Sesuai Format (58mm)
          </span>
          <span className="font-mono text-[10px] text-tertiary font-bold bg-tertiary/10 px-2 py-0.5 rounded">
            Sinkronisasi Otomatis
          </span>
        </div>

        {/* Paper simulation */}
        <div className="bg-white rounded-md shadow-sm p-4 text-on-surface font-mono flex flex-col text-[12px] leading-tight select-none border border-[#eaedff]">
          <div className={`flex flex-col pb-2 ${formData.logoAlignment === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
            {formData.logoMode === 'custom' && formData.customLogoUrl ? (
              <div className="flex flex-col items-center mb-1">
                <img
                  src={formData.customLogoUrl}
                  alt={formData.customLogoName || 'Logo Struk'}
                  className={`w-auto object-contain ${
                    formData.logoSize === 'small'
                      ? 'h-6 max-w-[130px]'
                      : formData.logoSize === 'large'
                      ? 'h-12 max-w-[200px]'
                      : 'h-9 max-w-[160px]'
                  } ${
                    formData.logoFilter === 'monochrome'
                      ? 'filter grayscale contrast-200'
                      : formData.logoFilter === 'high-contrast'
                      ? 'filter grayscale contrast-[300%]'
                      : ''
                  }`}
                />
                {formData.customLogoName && (
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#5e3f3c] mt-0.5">
                    {formData.customLogoName}
                  </span>
                )}
              </div>
            ) : formData.logoMode !== 'none' && formData.printPertaminaLogo ? (
              <div className="flex items-center justify-center gap-1.5 font-headline font-extrabold text-primary mb-1">
                <span className="material-symbols-outlined text-[18px]">local_gas_station</span>
                <span>PERTAMINA</span>
              </div>
            ) : (
              <p className="font-bold text-[12px] uppercase">SPBU PERTAMINA</p>
            )}
            <p className="font-bold">{formData.spbuNumber}</p>
            <p>{formData.address}</p>
            <p>{formData.city}</p>
            <p>Telp. {formData.phone}</p>
            <p className="text-[10px] text-[#5e3f3c] mt-0.5">Minggu, 21 Maret 2018 15:37:23</p>
          </div>

          <div className="border-b border-dashed border-black/30 my-2" />

          <div className="flex justify-between text-[11px]">
            <span>Nomor Printer</span>
            <span className="font-bold">: 1</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Nomor Selang</span>
            <span className="font-bold">: 4</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Jenis BBM</span>
            <span className="font-bold">: Pertamax</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Liter</span>
            <span className="font-bold">: 15,13 L</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Harga/liter</span>
            <span className="font-bold">: Rp {fuelPrices.pertamax}</span>
          </div>

          <div className="border-b border-dashed border-black/30 my-1.5" />

          <div className="flex justify-between items-baseline py-1">
            <span className="font-bold">Total</span>
            <span className="font-black text-[15px]">: Rp 130.118</span>
          </div>

          <div className="border-b border-dashed border-black/30 my-1.5" />

          <div className="flex justify-between text-[11px]">
            <span>Nopol</span>
            <span className="font-bold">: W 416 RH</span>
          </div>

          <div className="mt-3 text-center">
            <p className="font-bold uppercase tracking-wide text-[11px]">{formData.footerMessage}</p>
            {formData.printPastiPasLogo && (
              <div className="flex items-center justify-center gap-1 text-[10px] text-[#5e3f3c] mt-1">
                <span className="material-symbols-outlined text-[12px] text-tertiary">verified</span>
                <span>PASTI PAS! • MyPertamina Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Save Action Button */}
      <div className="w-full pt-1 pb-2">
        <button
          type="button"
          onClick={handleSaveAll}
          className="w-full min-h-[52px] bg-primary hover:bg-primary-container text-white font-headline font-bold text-[15px] rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">save</span>
          <span>Simpan Perubahan Pengaturan</span>
        </button>
      </div>
    </div>
  );
};
