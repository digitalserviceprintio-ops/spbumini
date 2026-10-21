import React from 'react';
import { TransactionRecord, SpbuSettings } from '../types';
import { ThermalReceiptSlip } from './ThermalReceiptSlip';

interface ModalOriginalReceiptProps {
  onClose: () => void;
  sampleTransaction: TransactionRecord;
  settings: SpbuSettings;
}

export const ModalOriginalReceipt: React.FC<ModalOriginalReceiptProps> = ({
  onClose,
  sampleTransaction,
  settings,
}) => {
  const originalReceiptUrl = '/assets/aistudio/Image_1_280ca9b4.jpeg';

  return (
    <div className="fixed inset-0 z-50 bg-[#283044]/80 backdrop-blur-sm flex flex-col justify-center items-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-[#eaedff]">
        {/* Header */}
        <div className="p-4 bg-[#eaedff] flex items-center justify-between border-b border-[#dae2fd]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">compare</span>
            <div>
              <h3 className="font-headline font-bold text-[16px] text-on-surface">
                Komparasi Struk Fisik Asli vs Struk Digital 58mm
              </h3>
              <p className="text-[11px] text-[#5e3f3c]">
                Foto kertas thermal asli SPBU 54.612.55 vs Simulasi ESC/POS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#dae2fd] hover:bg-[#c3cff8] flex items-center justify-center text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Comparison Body */}
        <div className="p-4 overflow-y-auto bg-[#faf8ff] grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* Left: Original Photo */}
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
              <span className="material-symbols-outlined text-[15px]">photo_camera</span>
              <span>1. Foto Kertas Struk Fisik Asli</span>
            </div>
            <div className="w-full bg-white rounded-xl p-2 shadow-sm border border-[#eaedff] flex justify-center">
              <img
                src={originalReceiptUrl}
                alt="Foto Struk Fisik Asli SPBU Pertamina"
                className="max-h-[480px] w-auto object-contain rounded shadow-xs"
              />
            </div>
            <p className="text-[11px] text-[#5e3f3c] text-center font-mono">
              Minggu, 21 Maret 2018 15:37:23 • Pertamax 15,13 L • Rp 130.118
            </p>
          </div>

          {/* Right: Digital Thermal Slip */}
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-[11px] font-bold">
              <span className="material-symbols-outlined text-[15px]">print</span>
              <span>2. Hasil Render Digital Thermal POS</span>
            </div>
            <div className="w-full bg-[#f2f3ff] rounded-xl p-3 shadow-sm border border-[#eaedff] flex justify-center overflow-x-hidden">
              <ThermalReceiptSlip
                transaction={sampleTransaction}
                settings={settings}
                paperWidth="58"
                density="normal"
                zoom={100}
              />
            </div>
            <p className="text-[11px] text-tertiary font-bold text-center flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              100% Presisi Format &amp; Karakter ESC/POS
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-[#eaedff] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-primary text-white font-headline font-bold text-[13px] rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};
