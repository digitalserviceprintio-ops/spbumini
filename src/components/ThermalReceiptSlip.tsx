import React from 'react';
import { formatRupiah, formatLiter } from '../data/constants';
import { SpbuSettings, TransactionRecord } from '../types';

interface ThermalReceiptSlipProps {
  transaction: TransactionRecord;
  settings: SpbuSettings;
  paperWidth?: '58' | '80';
  density?: 'light' | 'normal' | 'dark';
  zoom?: number;
  className?: string;
  hideShadow?: boolean;
}

export const ThermalReceiptSlip: React.FC<ThermalReceiptSlipProps> = ({
  transaction,
  settings,
  paperWidth = '58',
  density = 'normal',
  zoom = 100,
  className = '',
  hideShadow = false,
}) => {
  const is58mm = paperWidth === '58';
  const widthClass = is58mm ? 'w-[310px] max-w-full' : 'w-[420px] max-w-full';

  // Density classes
  const densityStyles = {
    light: 'text-neutral-700 font-normal',
    normal: 'text-neutral-900 font-medium',
    dark: 'text-black font-semibold',
  }[density];

  const cashReceived = transaction.cashReceived || (Math.ceil(transaction.totalPrice / 50000) * 50000);
  const cashChange = transaction.cashChange !== undefined ? transaction.cashChange : Math.max(0, cashReceived - transaction.totalPrice);

  return (
    <div
      style={{
        transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
        transformOrigin: 'top center',
      }}
      className={`relative select-none transition-transform duration-200 ${widthClass} ${className}`}
    >
      {/* Top Perforated Serrated Zig-zag Cut Edge */}
      <div className="w-full h-3 overflow-hidden flex leading-none text-white drop-shadow-sm">
        <svg className="w-full h-full fill-white" preserveAspectRatio="none" viewBox="0 0 120 12">
          <path d="M0 12 L4 0 L8 12 L12 0 L16 12 L20 0 L24 12 L28 0 L32 12 L36 0 L40 12 L44 0 L48 12 L52 0 L56 12 L60 0 L64 12 L68 0 L72 12 L76 0 L80 12 L84 0 L88 12 L92 0 L96 12 L100 0 L104 12 L108 0 L112 12 L116 0 L120 12 Z" />
        </svg>
      </div>

      {/* Main Thermal Paper Canvas */}
      <div
        className={`bg-white px-5 py-4 ${densityStyles} font-mono text-[13px] leading-[1.35] tracking-tight antialiased ${
          hideShadow ? '' : 'shadow-md'
        }`}
        style={{ fontFamily: '"IBM Plex Sans", "Courier New", monospace' }}
      >
        {/* Header Logo & Pasti Pas Badge Area */}
        <div className={`flex items-start pb-2.5 ${settings.logoAlignment === 'center' ? 'flex-col items-center gap-2' : 'justify-between'}`}>
          {settings.logoMode === 'custom' && settings.customLogoUrl ? (
            <div className={`flex flex-col ${settings.logoAlignment === 'center' ? 'items-center text-center' : 'items-start'}`}>
              <img
                src={settings.customLogoUrl}
                alt={settings.customLogoName || 'Logo Struk SPBU'}
                className={`w-auto object-contain transition-all ${
                  settings.logoSize === 'small'
                    ? 'h-7 max-w-[140px]'
                    : settings.logoSize === 'large'
                    ? 'h-14 max-w-[220px]'
                    : 'h-10 max-w-[180px]'
                } ${
                  settings.logoFilter === 'monochrome'
                    ? 'filter grayscale contrast-200 brightness-90 mix-blend-multiply'
                    : settings.logoFilter === 'high-contrast'
                    ? 'filter grayscale contrast-[300%] brightness-75 mix-blend-multiply'
                    : ''
                }`}
              />
              {settings.customLogoName && (
                <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5 text-neutral-800">
                  {settings.customLogoName}
                </span>
              )}
            </div>
          ) : settings.logoMode !== 'none' && settings.printPertaminaLogo ? (
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-7 text-black fill-current" viewBox="0 0 100 80">
                <polygon points="5,25 35,0 70,0 40,25" />
                <polygon points="0,55 30,30 65,30 35,55" />
                <polygon points="25,80 55,55 90,55 60,80" />
              </svg>
              <div className="flex flex-col text-left">
                <span className="font-extrabold tracking-wider leading-none text-[15px]">PERTAMINA</span>
                <span className="text-[8px] tracking-widest mt-0.5 font-bold">RETAIL INDONESIA</span>
              </div>
            </div>
          ) : (
            <div className="font-bold text-[14px]">SPBU PERTAMINA</div>
          )}

          {settings.printPastiPasLogo && (
            <div className={`p-1 border border-black border-dashed flex flex-col items-center justify-center transform rotate-2 ${settings.logoAlignment === 'center' ? 'mt-1' : ''}`}>
              <div className="flex items-center gap-0.5">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-tighter">PASTI PAS!</span>
              </div>
              <span className="text-[7px] uppercase font-bold tracking-widest">TERKALIBRASI</span>
            </div>
          )}
        </div>

        {/* Station Address Block */}
        <div className="space-y-0.5 text-left font-medium text-black">
          <p className="font-bold tracking-normal text-[13px]">{settings.spbuNumber}</p>
          <p className="text-[12px]">{settings.address}</p>
          <p className="text-[12px]">{settings.city}</p>
          <p className="text-[12px]">Telp. {settings.phone}</p>
          <div className="flex justify-between items-center pt-1 text-[11px] text-neutral-800">
            <span>{transaction.dateStr}</span>
            <span className="font-bold">{transaction.timeStr.replace(' WIB', '')}</span>
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="my-2 border-b border-black border-dashed opacity-80" />

        {/* Dispenser Breakdown */}
        <div className="space-y-1 text-[12px]">
          <div className="flex justify-between">
            <span>Nomor Printer</span>
            <span className="font-bold">: {transaction.printerNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Nomor Selang</span>
            <span className="font-bold">: {transaction.hoseNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Jenis BBM</span>
            <span className="font-bold uppercase tracking-tight">: {transaction.fuelName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Liter</span>
            <span className="font-bold">: {formatLiter(transaction.liter)} L</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Harga/liter</span>
            <span>: Rp {formatRupiah(transaction.unitPrice)}</span>
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="my-2.5 border-b border-black border-dashed opacity-80" />

        {/* Big Bold Thermal Total Line */}
        <div className="flex justify-between items-baseline py-1">
          <span className="text-[16px] font-black tracking-tight uppercase">TOTAL</span>
          <div className="text-right">
            <span className="text-[20px] font-black tracking-tight leading-none">
              : Rp {formatRupiah(transaction.totalPrice)}
            </span>
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="my-2 border-b border-black border-dashed opacity-80" />

        {/* Payment Meta & Vehicle Plate */}
        <div className="space-y-1 text-[12px]">
          <div className="flex justify-between items-center">
            <span>Nopol</span>
            <span className="font-bold text-[13px] bg-neutral-100 px-1 rounded">
              : {transaction.nopol.replace(/\s+/g, ' ')}
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-neutral-800">
            <span>Metode Bayar</span>
            <span className="uppercase font-semibold">
              : {transaction.paymentMethod === 'cash' ? 'TUNAI (CASH)' : transaction.paymentMethod === 'qris' ? 'QRIS MYPERTAMINA' : 'DEBIT / EDC'}
            </span>
          </div>
          {transaction.paymentMethod === 'cash' && (
            <>
              <div className="flex justify-between text-[11px] text-neutral-800">
                <span>Uang Diterima</span>
                <span>: Rp {formatRupiah(cashReceived)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-800">
                <span>Kembalian</span>
                <span>: Rp {formatRupiah(cashChange)}</span>
              </div>
            </>
          )}
        </div>

        {/* QR Code / Barcode Thermal Section */}
        {settings.printQrValidation && (
          <div className="my-3 flex flex-col items-center justify-center space-y-1">
            {/* Monochromatic Scalable Thermal Barcode SVG */}
            <svg className="h-8 w-44 text-black fill-current" preserveAspectRatio="none" viewBox="0 0 160 30">
              <rect x="0" y="0" width="3" height="30" />
              <rect x="5" y="0" width="2" height="30" />
              <rect x="10" y="0" width="5" height="30" />
              <rect x="18" y="0" width="2" height="30" />
              <rect x="23" y="0" width="4" height="30" />
              <rect x="30" y="0" width="1" height="30" />
              <rect x="34" y="0" width="6" height="30" />
              <rect x="43" y="0" width="2" height="30" />
              <rect x="48" y="0" width="5" height="30" />
              <rect x="56" y="0" width="2" height="30" />
              <rect x="62" y="0" width="7" height="30" />
              <rect x="72" y="0" width="3" height="30" />
              <rect x="78" y="0" width="4" height="30" />
              <rect x="85" y="0" width="2" height="30" />
              <rect x="90" y="0" width="6" height="30" />
              <rect x="99" y="0" width="2" height="30" />
              <rect x="104" y="0" width="4" height="30" />
              <rect x="111" y="0" width="5" height="30" />
              <rect x="119" y="0" width="2" height="30" />
              <rect x="124" y="0" width="6" height="30" />
              <rect x="133" y="0" width="2" height="30" />
              <rect x="138" y="0" width="4" height="30" />
              <rect x="145" y="0" width="5" height="30" />
              <rect x="154" y="0" width="3" height="30" />
            </svg>
            <span className="text-[9px] tracking-widest text-neutral-800 font-mono">
              {transaction.id}
            </span>
          </div>
        )}

        {/* Closing Footer Phrase */}
        <div className="pt-2 text-center space-y-0.5">
          <p className="text-[12px] font-extrabold tracking-wider uppercase">
            {settings.footerMessage}
          </p>
          <p className="text-[10px] text-neutral-600">Pertamina Call Center: 135</p>
        </div>

        {/* Feed Lines Spacing */}
        <div style={{ height: `${(settings.feedLines || 2) * 12}px` }} />
      </div>

      {/* Bottom Serrated Zig-zag Cut Edge */}
      <div className="w-full h-3 overflow-hidden flex leading-none text-white drop-shadow-sm">
        <svg className="w-full h-full fill-white rotate-180" preserveAspectRatio="none" viewBox="0 0 120 12">
          <path d="M0 12 L4 0 L8 12 L12 0 L16 12 L20 0 L24 12 L28 0 L32 12 L36 0 L40 12 L44 0 L48 12 L52 0 L56 12 L60 0 L64 12 L68 0 L72 12 L76 0 L80 12 L84 0 L88 12 L92 0 L96 12 L100 0 L104 12 L108 0 L112 12 L116 0 L120 12 Z" />
        </svg>
      </div>
    </div>
  );
};
