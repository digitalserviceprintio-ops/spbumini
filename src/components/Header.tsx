import React from 'react';
import { ScreenType, CashierSession } from '../types';

interface HeaderProps {
  currentScreen: ScreenType;
  session: CashierSession;
  onOpenSessionModal: () => void;
  onOpenOriginalReceiptModal: () => void;
  btConnected: boolean;
  onToggleBt: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  session,
  onOpenSessionModal,
  onOpenOriginalReceiptModal,
  btConnected,
  onToggleBt,
}) => {
  const screenTitleMap: Record<ScreenType, string> = {
    'buat-struk': 'Buat Struk',
    'preview-dan-cetak': 'Preview Dan Cetak',
    'riwayat-struk': 'Riwayat Struk',
    'pengaturan-printer-dan-spbu': 'Pengaturan Printer Dan Spbu',
    'login-sesi': 'Buka Sesi Kasir',
  };

  const pertaminaLogoUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_up7az9vmCqyZUxI2HiIUexMKYg4E4nfljKB_zcvhARpMXuyJkCY3AKMJXYsTmLj2iq6nrrSeXkM2Jsyt9v7nGivCmuzH1kTYTS_kMPX_UfpmOat-TLZTsbDqt1aad3KOyrHWikbFBhikoeZ0ehMrQ6EpH2lWlImnk3ZQ7dcY2_mR3HEhFvY9IypPz4b2AKpkWiWvtG1Fw51Ky8eWV9BUWfsZsJ8m2vya7L-M8FteKhIarMZcNsPg';

  return (
    <header className="fixed top-0 w-full z-40 bg-[#faf8ff]/95 backdrop-blur-xl border-b border-[#eaedff] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-xl mx-auto h-20 px-3 sm:px-4 flex items-center justify-between gap-2">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            alt="Pertamina SPBU Print Logo"
            className="h-8 w-auto object-contain flex-shrink-0"
            src={pertaminaLogoUrl}
            onError={(e) => {
              // Fallback to stylized SVG emblem if image load fails
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Fallback emblem if needed */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-headline font-bold text-[15px] sm:text-[16px] text-primary tracking-tight truncate leading-tight">
                Pertamina SPBU POS
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase">
                58mm
              </span>
            </div>
            <span className="text-[12px] text-[#5e3f3c] truncate leading-tight font-medium">
              {screenTitleMap[currentScreen]}
            </span>
          </div>
        </div>

        {/* Right: Actions & Status */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Compare with Real Photo Button */}
          <button
            onClick={onOpenOriginalReceiptModal}
            title="Lihat Foto Struk Fisik Asli"
            type="button"
            className="hidden xs:inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] text-[#245eaa] text-[11px] font-semibold transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[15px]">photo_camera</span>
            <span className="hidden sm:inline">Foto Asli</span>
          </button>

          {/* Bluetooth Status Pill */}
          <button
            onClick={onToggleBt}
            type="button"
            title={btConnected ? 'Printer Terhubung (Klik untuk disconnect)' : 'Printer Terputus (Klik untuk menghubungkan)'}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-mono transition-all ${
              btConnected ? 'bg-[#e2e7ff] text-[#131b2e]' : 'bg-red-50 text-red-600 border border-red-200'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {btConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  btConnected ? 'bg-tertiary' : 'bg-red-500'
                }`}
              />
            </span>
            <span className="material-symbols-outlined text-secondary text-[16px]">
              {btConnected ? 'bluetooth' : 'bluetooth_disabled'}
            </span>
            <span className="font-medium hidden sm:inline">
              {btConnected ? 'RPP-02N Connected' : 'Disconnected'}
            </span>
            <span className="font-medium sm:hidden">
              {btConnected ? 'RPP-02N' : 'Offline'}
            </span>
          </button>

          {/* Operator Avatar Button */}
          <button
            onClick={onOpenSessionModal}
            type="button"
            title={`Kasir: ${session.operatorId} • Shift ${session.shift} • Pulau ${session.island}`}
            className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm hover:opacity-90 active:scale-95 transition-all relative"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-tertiary text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
              {session.shift}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
