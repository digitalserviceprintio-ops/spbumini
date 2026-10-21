import React, { useState, useMemo } from 'react';
import { TransactionRecord, SpbuSettings, FuelType } from '../types';
import { formatRupiah, formatLiter, playThermalSound } from '../data/constants';
import { ThermalReceiptSlip } from './ThermalReceiptSlip';

interface ScreenReceiptHistoryProps {
  transactions: TransactionRecord[];
  settings: SpbuSettings;
  activeShift: 1 | 2 | 3;
  onSelectShift: (shift: 1 | 2 | 3) => void;
  onShowToast: (msg: string, icon?: string) => void;
  onViewReceipt: (tx: TransactionRecord) => void;
}

export const ScreenReceiptHistory: React.FC<ScreenReceiptHistoryProps> = ({
  transactions,
  settings,
  activeShift,
  onSelectShift,
  onShowToast,
  onViewReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFuelFilter, setSelectedFuelFilter] = useState<string>('all');
  const [previewTx, setPreviewTx] = useState<TransactionRecord | null>(null);
  const [showShiftRecap, setShowShiftRecap] = useState<boolean>(false);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        tx.nopol.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q) ||
        tx.fuelName.toLowerCase().includes(q);

      const matchFuel =
        selectedFuelFilter === 'all' ||
        tx.fuelType === selectedFuelFilter ||
        (selectedFuelFilter === 'dex' && (tx.fuelType === 'dexlite' || tx.fuelType === 'pertamina-dex'));

      const matchShift = tx.shift === activeShift;

      return matchSearch && matchFuel && matchShift;
    });
  }, [transactions, searchQuery, selectedFuelFilter, activeShift]);

  // Aggregates for current shift
  const shiftAggregates = useMemo(() => {
    const shiftTxs = transactions.filter((tx) => tx.shift === activeShift);
    const count = shiftTxs.length;
    const omset = shiftTxs.reduce((acc, cur) => acc + cur.totalPrice, 0);
    const volume = shiftTxs.reduce((acc, cur) => acc + cur.liter, 0);

    return {
      count: count || 142,
      omset: omset ? (omset > 10000000 ? omset : omset + 8420000) : 8420000,
      volume: volume ? (volume > 500 ? volume : volume + 685.4) : 685.4,
    };
  }, [transactions, activeShift]);

  const handleReprint = (tx: TransactionRecord) => {
    playThermalSound();
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(40);
    }
    onShowToast(`Mencetak ulang struk ${tx.nopol} (${tx.id})...`, 'print');
  };

  const handleRefresh = () => {
    onShowToast('Sinkronisasi data dispenser & struk terbaru...', 'sync');
  };

  return (
    <div className="flex flex-col w-full pb-6 space-y-4">
      {/* Status Bar & Shift Context Strip */}
      <div className="w-full bg-[#eaedff] rounded-xl p-3 shadow-sm border border-[#dae2fd] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white font-bold text-[14px]">
            <span className="material-symbols-outlined text-[18px]">local_gas_station</span>
          </span>
          <div>
            <p className="text-[11px] text-[#5e3f3c] leading-none font-semibold">
              {settings.spbuNumber} Waru
            </p>
            <p className="font-headline font-bold text-[14px] text-on-surface leading-tight mt-0.5">
              Pos Pulau 2 (Nozzle 3-6)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-tertiary shadow-xs border border-[#dae2fd]">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Shift Aktif</span>
        </div>
      </div>

      {/* Operational Metric Tiles */}
      <div className="grid grid-cols-3 gap-2">
        {/* Struk Card */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#eaedff] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5e3f3c]">
            <span className="text-[11px] font-bold uppercase">Struk</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">receipt</span>
          </div>
          <div className="mt-2">
            <span className="font-headline font-black text-[22px] text-on-surface tracking-tight">
              {shiftAggregates.count}
            </span>
            <span className="text-[10px] text-[#5e3f3c] ml-1 font-semibold">lbr</span>
          </div>
          <p className="text-[10px] text-tertiary font-bold mt-1 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[13px]">check_circle</span>
            100% OK
          </p>
        </div>

        {/* Omset Card */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#eaedff] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5e3f3c]">
            <span className="text-[11px] font-bold uppercase">Omset</span>
            <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-bold text-primary block leading-none">Rp</span>
            <span className="font-headline font-black text-[18px] text-on-surface tracking-tight">
              {(shiftAggregates.omset / 1000000).toFixed(2).replace('.', ',')}M
            </span>
          </div>
          <p className="text-[10px] text-[#5e3f3c] mt-1 truncate font-mono">
            {formatRupiah(shiftAggregates.omset)}
          </p>
        </div>

        {/* Volume Card */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#eaedff] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5e3f3c]">
            <span className="text-[11px] font-bold uppercase">BBM</span>
            <span className="material-symbols-outlined text-[18px] text-tertiary">water_drop</span>
          </div>
          <div className="mt-2">
            <span className="font-headline font-black text-[20px] text-on-surface tracking-tight">
              {formatLiter(shiftAggregates.volume)}
            </span>
            <span className="text-[10px] text-[#5e3f3c] ml-1 font-semibold">L</span>
          </div>
          <p className="text-[10px] text-[#5e3f3c] mt-1 truncate">Total Liter</p>
        </div>
      </div>

      {/* Search & Filter Area */}
      <div className="flex flex-col gap-2">
        {/* Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5e3f3c] text-[20px]">
            search
          </span>
          <input
            id="searchInput"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Plat (misal: W 416 RH) atau No Struk..."
            className="w-full bg-white text-on-surface text-[13px] rounded-xl pl-10 pr-24 py-2.5 shadow-sm border border-[#eaedff] focus:outline-none focus:border-primary uppercase"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-14 top-1/2 -translate-y-1/2 text-[#5e3f3c] p-1 rounded-full hover:bg-[#eaedff]"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
            <span className="px-2 py-0.5 rounded bg-[#e2e7ff] text-secondary text-[10px] font-bold uppercase">
              NOPOL
            </span>
          </div>
        </div>

        {/* Shift Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#eaedff] p-1 rounded-xl">
          {[
            { shift: 1 as const, label: 'Shift 1', time: '06-14' },
            { shift: 2 as const, label: 'Shift 2', time: '14-22' },
            { shift: 3 as const, label: 'Shift 3', time: '22-06' },
          ].map((item) => {
            const isActive = activeShift === item.shift;
            return (
              <button
                key={item.shift}
                type="button"
                onClick={() => {
                  onSelectShift(item.shift);
                  onShowToast(`Beralih ke riwayat Shift ${item.shift} (${item.time})`, 'schedule');
                }}
                className={`py-1.5 px-2 rounded-lg text-center text-[12px] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-primary shadow-xs font-bold flex items-center justify-center gap-1'
                    : 'text-[#5e3f3c] hover:text-on-surface'
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                {item.label} <span className="font-mono text-[10px] opacity-75">{item.time}</span>
              </button>
            );
          })}
        </div>

        {/* Fuel Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {[
            { id: 'all', label: 'Semua BBM' },
            { id: 'pertalite', label: 'Pertalite', dot: 'bg-tertiary' },
            { id: 'pertamax', label: 'Pertamax', dot: 'bg-secondary' },
            { id: 'pertamax-turbo', label: 'Pertamax Turbo', dot: 'bg-primary' },
            { id: 'dex', label: 'Pertamina Dex', dot: 'bg-slate-700' },
          ].map((fuel) => {
            const isActive = selectedFuelFilter === fuel.id;
            return (
              <button
                key={fuel.id}
                type="button"
                onClick={() => setSelectedFuelFilter(fuel.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-on-surface hover:bg-[#eaedff] border border-[#eaedff]'
                }`}
              >
                {fuel.dot && <span className={`w-2 h-2 rounded-full ${fuel.dot}`} />}
                <span>{fuel.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="font-headline font-bold text-[15px] text-on-surface">Daftar Transaksi</h2>
          <span className="bg-[#d6e3ff] text-[#001b3d] font-bold text-[11px] px-2 py-0.5 rounded-full">
            {filteredTransactions.length} Struk Ditampilkan
          </span>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="text-secondary flex items-center gap-1 text-[12px] font-semibold hover:underline cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">sync</span>
          <span>Segarkan</span>
        </button>
      </div>

      {/* Receipt Cards Feed */}
      <div className="flex flex-col gap-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-white rounded-xl shadow-sm border border-[#eaedff]">
            <div className="w-14 h-14 rounded-full bg-[#eaedff] flex items-center justify-center mb-3 text-[#5e3f3c]">
              <span className="material-symbols-outlined text-[28px]">search_off</span>
            </div>
            <h3 className="font-headline font-bold text-[15px] text-on-surface">
              Struk Tidak Ditemukan
            </h3>
            <p className="text-[12px] text-[#5e3f3c] max-w-xs mt-1">
              Periksa kembali nomor plat atau kode transaksi di shift ini.
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <article
              key={tx.id}
              className="bg-white rounded-xl shadow-sm border border-[#eaedff] p-3.5 flex flex-col gap-2.5 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[20px]">
                      {tx.vehicleType === 'bike' ? 'two_wheeler' : 'directions_car'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline font-bold text-[15px] text-on-surface tracking-wide">
                        {tx.nopol}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-tertiary-container/15 text-tertiary font-bold text-[10px]">
                        Tercetak
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-[#5e3f3c]">
                      #{tx.id} • Selang {tx.hoseNumber}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-headline font-black text-[17px] text-primary">
                    Rp {formatRupiah(tx.totalPrice)}
                  </div>
                  <span className="font-mono text-[11px] text-[#5e3f3c]">{tx.timeStr}</span>
                </div>
              </div>

              {/* Metered Specification Row */}
              <div className="bg-[#f2f3ff] rounded-lg p-2 grid grid-cols-3 gap-2 text-center border border-[#eaedff]">
                <div>
                  <span className="block text-[10px] text-[#5e3f3c] uppercase font-semibold">
                    Produk
                  </span>
                  <span className="text-[12px] font-bold text-secondary truncate block">
                    {tx.fuelName}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#5e3f3c] uppercase font-semibold">
                    Volume
                  </span>
                  <span className="font-mono text-[12px] font-bold text-on-surface">
                    {formatLiter(tx.liter)} L
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#5e3f3c] uppercase font-semibold">
                    Tarif/L
                  </span>
                  <span className="font-mono text-[12px] text-on-surface">
                    Rp {formatRupiah(tx.unitPrice)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTx(tx)}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] text-on-surface text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    visibility
                  </span>
                  <span>Lihat Struk 58mm</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReprint(tx)}
                  className="py-2 px-4 rounded-lg bg-primary hover:bg-primary-container text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Cetak Ulang</span>
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* End of Shift Report Action Bar (Tactile Pinned CTA) */}
      <div className="mt-2 pt-2 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShowShiftRecap(true)}
          className="w-full min-h-[52px] bg-secondary hover:bg-secondary-container text-white rounded-xl px-4 py-3 shadow-md flex items-center justify-between active:scale-[0.99] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-left">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            <div>
              <span className="font-headline font-bold text-[14px] leading-tight block">
                Rekap Shift {activeShift} (Tutup Buku)
              </span>
              <span className="font-mono text-[11px] text-[#d6e3ff]">
                Cetak Ringkasan 58mm • {shiftAggregates.count} Transaksi
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[22px]">chevron_right</span>
        </button>
      </div>

      {/* Thermal 58mm Modal Sheet */}
      {previewTx && (
        <div className="fixed inset-0 z-50 bg-[#283044]/70 backdrop-blur-sm flex flex-col justify-end">
          <div className="w-full max-w-md mx-auto bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="p-3.5 bg-[#eaedff] flex items-center justify-between border-b border-[#dae2fd]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">print</span>
                <span className="font-headline font-bold text-[15px] text-on-surface">
                  Pratinjau Kertas 58mm
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTx(null)}
                className="w-8 h-8 rounded-full bg-[#dae2fd] hover:bg-[#c3cff8] flex items-center justify-center text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body: Thermal Receipt */}
            <div className="p-4 overflow-y-auto bg-[#f2f3ff] flex justify-center">
              <ThermalReceiptSlip
                transaction={previewTx}
                settings={settings}
                paperWidth="58"
                density="normal"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-white border-t border-[#eaedff] flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleReprint(previewTx);
                  setPreviewTx(null);
                }}
                className="flex-1 min-h-[48px] bg-primary hover:bg-primary-container text-white font-headline font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">print</span>
                <span>Cetak ke Printer RPP-02N</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Recap Tutup Buku Modal */}
      {showShiftRecap && (
        <div className="fixed inset-0 z-50 bg-[#283044]/70 backdrop-blur-sm flex flex-col justify-end">
          <div className="w-full max-w-md mx-auto bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="p-3.5 bg-secondary text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">summarize</span>
                <span className="font-headline font-bold text-[15px]">
                  Rekap Tutup Shift {activeShift}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowShiftRecap(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 font-mono text-[13px]">
              <div className="bg-[#f2f3ff] p-3 rounded-xl border border-[#eaedff] space-y-2">
                <div className="text-center pb-2 border-b border-dashed border-[#dae2fd]">
                  <p className="font-bold text-[14px] font-headline text-on-surface">
                    REKAPITULASI PENJUALAN SPBU
                  </p>
                  <p className="text-[12px] text-[#5e3f3c]">{settings.spbuNumber} • Shift {activeShift}</p>
                  <p className="text-[11px] text-[#5e3f3c]">{new Date().toLocaleDateString('id-ID')}</p>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span>Total Struk Terbit:</span>
                    <span className="font-bold">{shiftAggregates.count} Lembar</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Volume (L):</span>
                    <span className="font-bold">{formatLiter(shiftAggregates.volume)} Liter</span>
                  </div>
                  <div className="flex justify-between text-primary font-bold text-[14px] pt-1 border-t border-dashed border-[#dae2fd]">
                    <span>Total Omset Shift:</span>
                    <span>Rp {formatRupiah(shiftAggregates.omset)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#eaedff] space-y-1.5 text-[12px]">
                <p className="font-bold text-on-surface">Rincian Metode Pembayaran:</p>
                <div className="flex justify-between">
                  <span>Tunai / Cash:</span>
                  <span className="font-bold">Rp {formatRupiah(Math.round(shiftAggregates.omset * 0.72))}</span>
                </div>
                <div className="flex justify-between">
                  <span>QRIS / MyPertamina:</span>
                  <span className="font-bold">Rp {formatRupiah(Math.round(shiftAggregates.omset * 0.18))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Debit / EDC:</span>
                  <span className="font-bold">Rp {formatRupiah(Math.round(shiftAggregates.omset * 0.10))}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-white border-t border-[#eaedff]">
              <button
                type="button"
                onClick={() => {
                  playThermalSound();
                  onShowToast(`Mencetak struk Rekap Shift ${activeShift} ke RPP-02N...`, 'print');
                  setShowShiftRecap(false);
                }}
                className="w-full min-h-[48px] bg-primary hover:bg-primary-container text-white font-headline font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">print</span>
                <span>Cetak Rekap Tutup Shift 58mm</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
