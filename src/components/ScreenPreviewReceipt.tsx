import React, { useState } from 'react';
import { TransactionRecord, SpbuSettings } from '../types';
import { formatRupiah, playThermalSound } from '../data/constants';
import { ThermalReceiptSlip } from './ThermalReceiptSlip';

interface ScreenPreviewReceiptProps {
  transaction: TransactionRecord;
  settings: SpbuSettings;
  onEditData: () => void;
  onPrintComplete: (tx: TransactionRecord, copies: number) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const ScreenPreviewReceipt: React.FC<ScreenPreviewReceiptProps> = ({
  transaction,
  settings,
  onEditData,
  onPrintComplete,
  onShowToast,
}) => {
  const [paperSize, setPaperSize] = useState<'58' | '80'>(settings.paperWidth || '58');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [density, setDensity] = useState<'light' | 'normal' | 'dark'>(settings.density || 'normal');
  const [copyCount, setCopyCount] = useState<number>(1);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const handleZoomIn = () => {
    if (zoomLevel < 120) setZoomLevel((prev) => prev + 10);
  };

  const handleZoomOut = () => {
    if (zoomLevel > 80) setZoomLevel((prev) => prev - 10);
  };

  const handleIncCopy = () => {
    if (copyCount < 5) setCopyCount((prev) => prev + 1);
  };

  const handleDecCopy = () => {
    if (copyCount > 1) setCopyCount((prev) => prev - 1);
  };

  const handleTestPrint = () => {
    playThermalSound();
    onShowToast('Mengirim ESC/POS Self Test ke RPP-02N...', 'print');
  };

  const handleTriggerPrint = () => {
    setIsPrinting(true);
    playThermalSound();
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([60, 40, 60]);
    }

    onShowToast(
      `Mencetak ${copyCount} salinan struk ${transaction.nopol} (Rp ${formatRupiah(transaction.totalPrice)})...`,
      'task_alt'
    );

    setTimeout(() => {
      onPrintComplete(transaction, copyCount);
      setIsPrinting(false);
    }, 1200);
  };

  const handleShareOrPdf = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="flex flex-col w-full pb-6 space-y-4">
      {/* Top Hardware Telemetry Pill */}
      <div className="w-full bg-white rounded-xl p-3 flex items-center justify-between shadow-sm border border-[#eaedff]">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#e2e7ff] flex items-center justify-center flex-shrink-0 text-secondary">
            <span className="material-symbols-outlined text-[20px]">print</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <span className="text-[12px] text-on-surface font-semibold truncate">
                RPP02N Thermal (ESC/POS)
              </span>
            </div>
            <span className="text-[11px] text-[#5e3f3c] truncate">
              Baterai 85% • Kertas Siap • BT Siap
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            type="button"
            onClick={handleTestPrint}
            className="px-2.5 py-1 bg-[#eaedff] text-secondary hover:bg-secondary hover:text-white rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[14px]">sensors</span>
            <span>Tes</span>
          </button>
        </div>
      </div>

      {/* Thermal Paper Setting Controls Bar */}
      <div className="bg-white rounded-xl p-3 space-y-3 shadow-sm border border-[#eaedff]">
        {/* Size segmented switcher & Zoom control */}
        <div className="flex items-center justify-between gap-2">
          <div className="grid grid-cols-2 p-1 bg-[#eaedff] rounded-lg flex-1">
            <button
              type="button"
              onClick={() => setPaperSize('58')}
              className={`py-1.5 text-center rounded-md text-[12px] transition-all font-bold flex items-center justify-center gap-1 cursor-pointer ${
                paperSize === '58'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-[#5e3f3c] hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">straighten</span>
              <span>58mm Roll</span>
            </button>

            <button
              type="button"
              onClick={() => setPaperSize('80')}
              className={`py-1.5 text-center rounded-md text-[12px] transition-all font-bold flex items-center justify-center gap-1 cursor-pointer ${
                paperSize === '80'
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-[#5e3f3c] hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">aspect_ratio</span>
              <span>80mm Kios</span>
            </button>
          </div>

          {/* Quick Zoom control */}
          <div className="flex items-center bg-[#eaedff] rounded-lg p-1 space-x-1">
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-8 h-7 flex items-center justify-center text-[#5e3f3c] hover:text-on-surface rounded active:bg-[#dae2fd] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <span className="font-mono text-[11px] text-on-surface px-1 font-bold">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-8 h-7 flex items-center justify-center text-[#5e3f3c] hover:text-on-surface rounded active:bg-[#dae2fd] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        </div>

        {/* Density Profile Switcher */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[12px] text-[#5e3f3c] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">contrast</span> Kepekatan Thermal:
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setDensity('light')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                density === 'light'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'bg-[#eaedff] text-[#5e3f3c]'
              }`}
            >
              Eco
            </button>
            <button
              type="button"
              onClick={() => setDensity('normal')}
              className={`px-2.5 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                density === 'normal'
                  ? 'bg-neutral-800 text-white font-bold shadow-xs'
                  : 'bg-[#eaedff] text-[#5e3f3c]'
              }`}
            >
              Pasti Pas (Bold)
            </button>
            <button
              type="button"
              onClick={() => setDensity('dark')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                density === 'dark'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'bg-[#eaedff] text-[#5e3f3c]'
              }`}
            >
              Maksimal
            </button>
          </div>
        </div>
      </div>

      {/* Realistis Thermal Paper Canvas Preview */}
      <div className="w-full flex justify-center py-2 px-1 overflow-x-hidden">
        <ThermalReceiptSlip
          transaction={transaction}
          settings={{ ...settings, paperWidth: paperSize }}
          paperWidth={paperSize}
          density={density}
          zoom={zoomLevel}
        />
      </div>

      {/* Operational Summary Chips */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#f2f3ff] rounded-xl p-2.5 flex items-center space-x-2.5 shadow-xs border border-[#eaedff]">
          <div className="w-9 h-9 rounded-lg bg-[#eaedff] flex items-center justify-center text-primary flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">local_gas_station</span>
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#5e3f3c] block truncate">Nozzle Pompa</span>
            <span className="font-headline font-bold text-[14px] text-on-surface">
              Dispenser {transaction.hoseNumber}
            </span>
          </div>
        </div>

        <div className="bg-[#f2f3ff] rounded-xl p-2.5 flex items-center space-x-2.5 shadow-xs border border-[#eaedff]">
          <div className="w-9 h-9 rounded-lg bg-[#eaedff] flex items-center justify-center text-secondary flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">payments</span>
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#5e3f3c] block truncate">Pola Transaksi</span>
            <span className="font-headline font-bold text-[14px] text-on-surface truncate">
              Rp {formatRupiah(transaction.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Copy Multiplier & Print Controls */}
      <div className="bg-white rounded-xl p-3.5 space-y-3 shadow-md border border-[#eaedff]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">content_copy</span>
            <span className="text-[13px] text-on-surface font-semibold">Salinan Cetak (Copy)</span>
          </div>

          {/* Incrementer */}
          <div className="flex items-center bg-[#eaedff] rounded-lg p-1 space-x-2">
            <button
              type="button"
              onClick={handleDecCopy}
              className="w-8 h-8 rounded bg-white text-on-surface flex items-center justify-center font-bold active:bg-[#dae2fd] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <span className="font-headline text-[15px] text-on-surface font-bold px-2">
              {copyCount}x
            </span>
            <button
              type="button"
              onClick={handleIncCopy}
              className="w-8 h-8 rounded bg-white text-on-surface flex items-center justify-center font-bold active:bg-[#dae2fd] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        </div>

        {/* Secondary Fast Action Utilities */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onEditData}
            className="h-11 px-3 bg-[#eaedff] text-on-surface hover:bg-[#dae2fd] rounded-xl text-[12px] font-semibold flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            <span>Edit Data BBM</span>
          </button>

          <button
            type="button"
            onClick={handleShareOrPdf}
            className="h-11 px-3 bg-[#eaedff] text-secondary hover:bg-[#dae2fd] rounded-xl text-[12px] font-semibold flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Cetak Fisik / PDF</span>
          </button>
        </div>

        {/* Master Action: High-Tactile Print Trigger */}
        <button
          type="button"
          onClick={handleTriggerPrint}
          disabled={isPrinting}
          className="w-full min-h-[54px] bg-primary hover:bg-primary-container text-white rounded-xl font-headline text-[15px] font-bold flex items-center justify-center space-x-2 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
        >
          {isPrinting ? (
            <>
              <span className="material-symbols-outlined text-[24px] animate-spin">
                progress_activity
              </span>
              <span>Mencetak ke Bluetooth POS...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[24px]">print</span>
              <span>
                CETAK STRUK SEKARANG ({copyCount} Salinan)
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
