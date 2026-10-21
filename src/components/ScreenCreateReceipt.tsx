import React, { useState, useEffect } from 'react';
import { FuelType, PaymentMethod, VehicleType, SpbuSettings, TransactionRecord, CashierSession } from '../types';
import { INITIAL_FUELS, formatRupiah, parseRupiah, formatLiter, parseLiter, playThermalSound } from '../data/constants';

interface ScreenCreateReceiptProps {
  settings: SpbuSettings;
  session: CashierSession;
  currentTransaction: TransactionRecord;
  onUpdateTransaction: (tx: TransactionRecord) => void;
  onGoToPreview: () => void;
  onQuickPrint: (tx: TransactionRecord) => void;
}

export const ScreenCreateReceipt: React.FC<ScreenCreateReceiptProps> = ({
  settings,
  session,
  currentTransaction,
  onUpdateTransaction,
  onGoToPreview,
  onQuickPrint,
}) => {
  const [selectedNozzle, setSelectedNozzle] = useState<number>(currentTransaction.hoseNumber || 4);
  const [selectedFuel, setSelectedFuel] = useState<FuelType>(currentTransaction.fuelType || 'pertamax');
  const [rupiahStr, setRupiahStr] = useState<string>(formatRupiah(currentTransaction.totalPrice || 130118));
  const [literStr, setLiterStr] = useState<string>(formatLiter(currentTransaction.liter || 15.13));
  const [nopol, setNopol] = useState<string>(currentTransaction.nopol || 'W 416 RH');
  const [vehicle, setVehicle] = useState<VehicleType>(currentTransaction.vehicleType || 'car');
  const [payment, setPayment] = useState<PaymentMethod>(currentTransaction.paymentMethod || 'cash');
  const [autoPrint, setAutoPrint] = useState<boolean>(true);
  const [includeLogo, setIncludeLogo] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Active fuel product
  const currentFuelObj = INITIAL_FUELS.find((f) => f.id === selectedFuel) || INITIAL_FUELS[0];
  const unitPrice = settings.fuelPrices[selectedFuel] || currentFuelObj.price;

  // Sync state whenever selectedFuel or unitPrice changes
  const handleFuelSelect = (fuelId: FuelType) => {
    setSelectedFuel(fuelId);
    const newPrice = settings.fuelPrices[fuelId] || INITIAL_FUELS.find((f) => f.id === fuelId)?.price || 8600;
    const currentLiters = parseLiter(literStr);
    const newRupiah = Math.round(currentLiters * newPrice);
    setRupiahStr(formatRupiah(newRupiah));
    
    onUpdateTransaction({
      ...currentTransaction,
      fuelType: fuelId,
      fuelName: INITIAL_FUELS.find((f) => f.id === fuelId)?.name || 'Pertamax',
      unitPrice: newPrice,
      totalPrice: newRupiah,
      liter: currentLiters,
    });
  };

  // Sync from Rupiah input
  const handleRupiahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const num = parseRupiah(rawVal);
    setRupiahStr(formatRupiah(num));
    const calculatedLiter = unitPrice > 0 ? num / unitPrice : 0;
    setLiterStr(formatLiter(calculatedLiter));

    onUpdateTransaction({
      ...currentTransaction,
      totalPrice: num,
      liter: Math.round(calculatedLiter * 100) / 100,
      unitPrice,
    });
  };

  // Sync from Liter input
  const handleLiterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setLiterStr(rawVal);
    const numLiter = parseLiter(rawVal);
    const calculatedRupiah = Math.round(numLiter * unitPrice);
    setRupiahStr(formatRupiah(calculatedRupiah));

    onUpdateTransaction({
      ...currentTransaction,
      liter: numLiter,
      totalPrice: calculatedRupiah,
      unitPrice,
    });
  };

  // Preset button click
  const handlePresetClick = (amount: number | 'full') => {
    if (amount === 'full') {
      const fullLiters = vehicle === 'car' ? 45.0 : 4.5;
      const fullRupiah = Math.round(fullLiters * unitPrice);
      setLiterStr(formatLiter(fullLiters));
      setRupiahStr(formatRupiah(fullRupiah));
      onUpdateTransaction({
        ...currentTransaction,
        liter: fullLiters,
        totalPrice: fullRupiah,
        unitPrice,
      });
    } else {
      const calculatedLiter = unitPrice > 0 ? amount / unitPrice : 0;
      setRupiahStr(formatRupiah(amount));
      setLiterStr(formatLiter(calculatedLiter));
      onUpdateTransaction({
        ...currentTransaction,
        totalPrice: amount,
        liter: Math.round(calculatedLiter * 100) / 100,
        unitPrice,
      });
    }
  };

  // Region prefix click
  const handleRegionClick = (prefix: string) => {
    const cleanPlate = nopol.replace(/^[A-Z]+\s*/, '');
    const newPlate = `${prefix} ${cleanPlate || '416 RH'}`;
    setNopol(newPlate);
    onUpdateTransaction({
      ...currentTransaction,
      nopol: newPlate,
    });
  };

  // Plate text input
  const handlePlateChange = (val: string) => {
    const upper = val.toUpperCase();
    setNopol(upper);
    onUpdateTransaction({
      ...currentTransaction,
      nopol: upper,
    });
  };

  // Reset form
  const handleReset = () => {
    const defaultRupiah = 130118;
    const defaultPrice = 8600;
    const defaultLiter = 15.13;
    setSelectedNozzle(4);
    setSelectedFuel('pertamax');
    setRupiahStr(formatRupiah(defaultRupiah));
    setLiterStr(formatLiter(defaultLiter));
    setNopol('W 416 RH');
    setVehicle('car');
    setPayment('cash');

    onUpdateTransaction({
      ...currentTransaction,
      hoseNumber: 4,
      fuelType: 'pertamax',
      fuelName: 'Pertamax',
      unitPrice: defaultPrice,
      totalPrice: defaultRupiah,
      liter: defaultLiter,
      nopol: 'W 416 RH',
      vehicleType: 'car',
      paymentMethod: 'cash',
    });
  };

  // Submit & Proceed to Preview
  const handleSubmit = () => {
    setIsSubmitting(true);
    playThermalSound();
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    const txToSave: TransactionRecord = {
      ...currentTransaction,
      id: `SPBU-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      dateStr: new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date()),
      timeStr: new Intl.DateTimeFormat('id-ID', { timeStyle: 'medium' }).format(new Date()) + ' WIB',
      hoseNumber: selectedNozzle,
      fuelType: selectedFuel,
      fuelName: currentFuelObj.name,
      unitPrice,
      totalPrice: parseRupiah(rupiahStr),
      liter: parseLiter(literStr),
      nopol,
      vehicleType: vehicle,
      paymentMethod: payment,
      shift: session.shift,
      operatorId: session.operatorId,
    };

    onUpdateTransaction(txToSave);

    if (autoPrint) {
      onQuickPrint(txToSave);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onGoToPreview();
    }, 400);
  };

  return (
    <div className="flex flex-col w-full pb-6 space-y-4">
      {/* Station Banner & Dispenser Quick Info Card */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-[#eaedff] flex items-center justify-between">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary mt-0.5">
            <span className="material-symbols-outlined text-[20px]">local_gas_station</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-headline font-bold text-[16px] text-on-surface tracking-tight">
                {settings.spbuNumber}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-tertiary-container text-white text-[10px] font-bold">
                <span className="material-symbols-outlined text-[12px]">verified</span> Pasti Pas!
              </span>
            </div>
            <p className="text-[12px] text-[#5e3f3c] truncate">
              {settings.address}, {settings.city}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end flex-shrink-0 pl-2">
          <div className="bg-[#eaedff] px-2.5 py-1 rounded-md text-right">
            <span className="block text-[10px] text-[#5e3f3c] uppercase font-bold">Printer #</span>
            <span className="font-mono text-[12px] font-bold text-secondary">
              01 • {settings.paperWidth}mm
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Selector Selang / Nozzle & Shift */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-[#eaedff] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[18px]">valve</span>
            <span className="font-headline font-semibold text-[14px] text-on-surface">
              Pilih Nomor Selang / Nozzle
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#5e3f3c]">
            Shift {session.shift} ({session.shift === 1 ? 'Pagi' : session.shift === 2 ? 'Siang' : 'Malam'})
          </span>
        </div>

        {/* Nozzle Buttons Horizontal Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1" id="nozzle-selector">
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const isActive = selectedNozzle === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => {
                  setSelectedNozzle(num);
                  onUpdateTransaction({ ...currentTransaction, hoseNumber: num });
                }}
                className={`flex-1 min-w-[54px] py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-secondary text-white font-bold shadow-sm scale-[1.02]'
                    : 'bg-[#eaedff] text-on-surface hover:bg-[#dae2fd]'
                }`}
              >
                <span
                  className={`block text-[10px] leading-none mb-1 font-semibold ${
                    isActive ? 'text-[#d6e3ff]' : 'text-[#5e3f3c]'
                  }`}
                >
                  NOZZLE
                </span>
                <span className="font-headline font-bold text-[15px]">
                  0{num}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Pilihan Jenis BBM Pertamina */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-[#eaedff] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">opacity</span>
            <span className="font-headline font-semibold text-[14px] text-on-surface">
              Jenis Bahan Bakar (BBM)
            </span>
          </div>
          <span className="text-[11px] text-tertiary flex items-center gap-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" /> Tangki Stabil
          </span>
        </div>

        {/* 2-Column Fuel Grid */}
        <div className="grid grid-cols-2 gap-2" id="fuel-selector">
          {INITIAL_FUELS.map((fuel) => {
            const isActive = selectedFuel === fuel.id;
            const price = settings.fuelPrices[fuel.id] || fuel.price;

            return (
              <button
                key={fuel.id}
                type="button"
                onClick={() => handleFuelSelect(fuel.id)}
                className={`flex flex-col p-2.5 rounded-xl text-left relative overflow-hidden transition-all cursor-pointer ${
                  isActive
                    ? 'bg-secondary text-white shadow-md scale-[1.01] ring-2 ring-secondary/50'
                    : 'bg-[#f2f3ff] text-on-surface hover:bg-[#eaedff]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span
                    className={`font-headline font-bold text-[15px] tracking-tight ${
                      isActive
                        ? 'text-white'
                        : fuel.id === 'pertalite'
                        ? 'text-tertiary'
                        : fuel.id === 'pertamax-turbo'
                        ? 'text-primary'
                        : fuel.id === 'dexlite'
                        ? 'text-tertiary-container'
                        : 'text-on-surface'
                    }`}
                  >
                    {fuel.name}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-black/5 text-[#5e3f3c]'
                    }`}
                  >
                    {fuel.grade}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-auto">
                  <span
                    className={`text-[11px] ${
                      isActive ? 'text-[#d6e3ff]' : 'text-[#5e3f3c]'
                    }`}
                  >
                    Tarif/liter:
                  </span>
                  <span className="font-mono font-bold text-[13px]">
                    Rp {formatRupiah(price)}
                  </span>
                </div>

                {isActive && (
                  <div className="absolute -right-2 -bottom-2 opacity-15 pointer-events-none">
                    <span className="material-symbols-outlined text-[48px]">
                      local_fire_department
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 3: Kalkulator Dua Arah Rupiah <-> Liter (Sync Otomatis) */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-[#eaedff] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[18px]">calculate</span>
            <span className="font-headline font-semibold text-[14px] text-on-surface">
              Perhitungan Volume &amp; Biaya
            </span>
          </div>
          <div className="px-2 py-0.5 rounded bg-[#eaedff] text-[#5e3f3c] text-[11px] font-semibold">
            Auto-Sync Rate
          </div>
        </div>

        {/* Main Rupiah Display Input */}
        <div className="bg-[#f2f3ff] rounded-xl p-3 flex flex-col space-y-1 border border-[#e2e7ff] focus-within:border-primary transition-colors">
          <div className="flex items-center justify-between">
            <label
              className="text-[11px] text-[#5e3f3c] uppercase font-bold"
              htmlFor="input-rupiah"
            >
              Total Pembayaran
            </label>
            <span className="text-[11px] text-secondary font-medium flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">edit</span> Ketik nominal
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline font-bold text-[22px] text-primary">Rp</span>
            <input
              id="input-rupiah"
              type="text"
              inputMode="numeric"
              value={rupiahStr}
              onChange={handleRupiahChange}
              className="w-full bg-transparent font-headline text-[26px] sm:text-[30px] font-black text-on-surface tracking-tight focus:outline-none focus:text-primary"
            />
          </div>
        </div>

        {/* Preset Rupiah Buttons */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5" id="preset-nominal">
          {[20000, 50000, 100000, 130118].map((amt) => {
            const isMatch = parseRupiah(rupiahStr) === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => handlePresetClick(amt)}
                className={`py-1.5 px-2.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isMatch
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-[#eaedff] hover:bg-[#dae2fd] text-on-surface'
                }`}
              >
                Rp {formatRupiah(amt)}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handlePresetClick('full')}
            className="py-1.5 px-2.5 rounded-lg bg-tertiary-container text-white font-bold text-[12px] whitespace-nowrap flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">local_gas_station</span> Full
          </button>
        </div>

        {/* Volume Liter & Satuan Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-[#eaedff] rounded-lg p-2.5 flex flex-col justify-between border border-[#dae2fd]">
            <div className="flex items-center justify-between mb-1">
              <label
                className="text-[11px] text-[#5e3f3c] uppercase font-bold"
                htmlFor="input-liter"
              >
                Volume Bahan Bakar
              </label>
            </div>
            <div className="flex items-baseline justify-between">
              <input
                id="input-liter"
                type="text"
                inputMode="decimal"
                value={literStr}
                onChange={handleLiterChange}
                className="w-24 bg-transparent font-headline text-[20px] font-bold text-on-surface focus:outline-none focus:text-secondary"
              />
              <span className="font-headline font-bold text-secondary text-[16px]">Liter</span>
            </div>
          </div>

          <div className="bg-[#eaedff] rounded-lg p-2.5 flex flex-col justify-between border border-[#dae2fd]">
            <span className="text-[11px] text-[#5e3f3c] uppercase font-bold mb-1">
              Harga / Liter Satuan
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] text-[#5e3f3c] font-semibold">Rp</span>
              <span className="font-headline font-bold text-[20px] text-on-surface">
                {formatRupiah(unitPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Data Kendaraan (Plat Nomor) & Kategori */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-[#eaedff] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#5e3f3c] text-[18px]">
              directions_car
            </span>
            <span className="font-headline font-semibold text-[14px] text-on-surface">
              Plat Nomor Kendaraan (Nopol)
            </span>
          </div>

          {/* Motor / Mobil Segments */}
          <div className="inline-flex rounded-lg bg-[#eaedff] p-0.5">
            <button
              type="button"
              onClick={() => {
                setVehicle('car');
                onUpdateTransaction({ ...currentTransaction, vehicleType: 'car' });
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                vehicle === 'car'
                  ? 'bg-white text-on-surface shadow-xs'
                  : 'text-[#5e3f3c]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">directions_car</span> Mobil
            </button>
            <button
              type="button"
              onClick={() => {
                setVehicle('bike');
                onUpdateTransaction({ ...currentTransaction, vehicleType: 'bike' });
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                vehicle === 'bike'
                  ? 'bg-white text-on-surface shadow-xs'
                  : 'text-[#5e3f3c]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">two_wheeler</span> Motor
            </button>
          </div>
        </div>

        {/* Big Indonesian License Plate Box */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#e2e7ff] rounded-xl p-2.5 flex items-center gap-2 border border-[#dae2fd]">
            <span className="material-symbols-outlined text-[#5e3f3c] text-[20px]">badge</span>
            <input
              id="input-nopol"
              type="text"
              value={nopol}
              onChange={(e) => handlePlateChange(e.target.value)}
              placeholder="W 416 RH"
              className="w-full bg-transparent font-mono text-[16px] font-bold tracking-wider uppercase text-on-surface focus:outline-none"
            />
          </div>

          {/* Quick Region Chips */}
          <div className="flex gap-1" id="plate-region-shortcuts">
            {['W', 'L', 'B', 'N'].map((prefix) => (
              <button
                key={prefix}
                type="button"
                onClick={() => handleRegionClick(prefix)}
                className="w-8 h-10 rounded-lg bg-[#eaedff] hover:bg-secondary hover:text-white text-on-surface font-headline font-bold text-center transition-colors cursor-pointer"
              >
                {prefix}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 5: Metode Pembayaran */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-[#eaedff] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[18px]">payments</span>
            <span className="font-headline font-semibold text-[14px] text-on-surface">
              Metode Pembayaran
            </span>
          </div>
          <span className="text-[11px] font-bold text-tertiary">LUNAS</span>
        </div>

        <div className="grid grid-cols-3 gap-2" id="payment-methods">
          {[
            { id: 'cash' as PaymentMethod, label: 'Tunai / Cash', icon: 'payments' },
            { id: 'qris' as PaymentMethod, label: 'MyPertamina', icon: 'qr_code_2' },
            { id: 'edc' as PaymentMethod, label: 'Debit / EDC', icon: 'credit_card' },
          ].map((item) => {
            const isActive = payment === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPayment(item.id);
                  onUpdateTransaction({ ...currentTransaction, paymentMethod: item.id });
                }}
                className={`py-2.5 px-2 rounded-xl text-[12px] text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#e2e7ff] text-on-surface font-bold shadow-sm ring-1 ring-secondary'
                    : 'bg-[#f2f3ff] text-[#5e3f3c] hover:bg-[#eaedff]'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isActive ? 'text-tertiary' : 'text-[#5e3f3c]'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 6: Toggle Cetak & Konfigurasi Printer */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-[#eaedff] space-y-2.5">
        <div className="flex items-center justify-between py-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#5e3f3c] text-[18px]">print</span>
            <div className="flex flex-col">
              <span className="text-[13px] text-on-surface font-semibold">
                Cetak Otomatis Selesai Isi
              </span>
              <span className="text-[11px] text-[#5e3f3c]">
                Kirim langsung ke thermal Bluetooth (RPP-02N)
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoPrint}
              onChange={(e) => setAutoPrint(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-[#dae2fd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary" />
          </label>
        </div>

        <div className="flex items-center justify-between py-0.5 pt-2 border-t border-[#eaedff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#5e3f3c] text-[18px]">verified</span>
            <div className="flex flex-col">
              <span className="text-[13px] text-on-surface font-semibold">
                Sertakan Logo Pasti Pas &amp; Pertamina
              </span>
              <span className="text-[11px] text-[#5e3f3c]">
                Header grafis mono bitmap {settings.paperWidth}mm
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={includeLogo}
              onChange={(e) => setIncludeLogo(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-[#dae2fd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
          </label>
        </div>
      </div>

      {/* Live Mini Receipt Snapshot Bar (Delight Feedback) */}
      <div className="bg-[#f2f3ff] rounded-xl p-3 flex items-center justify-between border border-[#e2e7ff]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary text-[20px]">
            check_circle
          </span>
          <div className="flex flex-col">
            <span className="text-[12px] text-on-surface font-bold">Struk Siap Dicetak</span>
            <span className="font-mono text-[11px] text-[#5e3f3c]">
              Selang #{selectedNozzle} • {currentFuelObj.name} • {literStr} L
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#5e3f3c] block uppercase font-semibold">
            Nopol Terdaftar
          </span>
          <span className="font-mono font-bold text-on-surface text-[13px]">
            {nopol || '-'}
          </span>
        </div>
      </div>

      {/* Action Bar: Sticky Form Actions */}
      <div className="pt-2 flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleReset}
          title="Reset Form ke Pengaturan Awal"
          className="px-4 py-3.5 rounded-xl bg-[#eaedff] hover:bg-[#dae2fd] text-[#5e3f3c] font-headline font-semibold text-[14px] flex items-center justify-center gap-1.5 transition-colors flex-shrink-0 cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          <span>Reset</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-white font-headline text-[15px] font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[20px]">
                progress_activity
              </span>
              <span>Memproses Struk...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[22px]">print</span>
              <span className="truncate">
                Preview &amp; Cetak (Rp {rupiahStr})
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
