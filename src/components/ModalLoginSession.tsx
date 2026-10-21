import React, { useState } from 'react';
import { CashierSession } from '../types';

interface ModalLoginSessionProps {
  session: CashierSession;
  onUpdateSession: (newSession: CashierSession) => void;
  onClose: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const ModalLoginSession: React.FC<ModalLoginSessionProps> = ({
  session,
  onUpdateSession,
  onClose,
  onShowToast,
}) => {
  const [selectedShift, setSelectedShift] = useState<1 | 2 | 3>(session.shift);
  const [selectedIsland, setSelectedIsland] = useState<1 | 2 | 3>(session.island);
  const [username, setUsername] = useState<string>(session.operatorId || 'admin');
  const [password, setPassword] = useState<string>('admin123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [remember, setRemember] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const fillDefaultCreds = () => {
    setUsername('admin');
    setPassword('admin123');
    onShowToast('Kredensial default dimasukkan (admin / admin123)', 'vpn_key');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      onUpdateSession({
        isLoggedIn: true,
        operatorId: username,
        shift: selectedShift,
        island: selectedIsland,
        printerName: 'RPP-02N Bluetooth POS',
      });
      setLoading(false);
      onShowToast(
        `Sesi kasir aktif: ${username} • Shift ${selectedShift} • Pulau ${selectedIsland}`,
        'check_circle'
      );
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#283044]/75 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#faf8ff] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in slide-in-from-bottom duration-200 border border-[#eaedff]">
        {/* Header Bar */}
        <div className="bg-white p-4 border-b border-[#eaedff] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-0.5">
                <span className="w-2.5 h-6 rounded-sm bg-primary transform -skew-x-12" />
                <span className="w-2.5 h-7 rounded-sm bg-secondary transform -skew-x-12" />
                <span className="w-2.5 h-5 rounded-sm bg-tertiary transform -skew-x-12" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-[15px] text-on-surface uppercase leading-none">
                  Pertamina SPBU POS
                </span>
                <span className="text-[11px] text-[#5e3f3c] font-medium mt-0.5">
                  Sistem Kasir &amp; Thermal Receipt Engine
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-tertiary/10 rounded-full">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                <span className="text-[10px] text-tertiary font-bold tracking-wide">ONLINE</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#eaedff] hover:bg-[#dae2fd] text-[#5e3f3c] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#eaedff] px-3 py-1.5 rounded-lg text-on-surface text-[12px]">
            <div className="flex items-center gap-1.5 truncate">
              <span className="material-symbols-outlined text-secondary text-base">
                local_gas_station
              </span>
              <span className="font-mono font-bold truncate">SPBU 54.612.55 • Tropodo 9A</span>
            </div>
            <span className="text-[10px] bg-white text-secondary px-2 py-0.5 rounded shadow-xs font-semibold shrink-0">
              Dispenser Terhubung
            </span>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Shift & Island Setup Card */}
          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-[#eaedff] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                <span className="font-headline text-[13px] text-on-surface font-bold uppercase">
                  Pilih Shift &amp; Pulau Pompa
                </span>
              </div>
              <span className="text-[10px] text-[#5e3f3c] bg-[#eaedff] px-2 py-0.5 rounded font-bold">
                Wajib Isi
              </span>
            </div>

            {/* Shift Switcher */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { num: 1 as const, label: 'Shift 1', time: '06:00-14:00' },
                { num: 2 as const, label: 'Shift 2', time: '14:00-22:00' },
                { num: 3 as const, label: 'Shift 3', time: '22:00-06:00' },
              ].map((s) => {
                const isActive = selectedShift === s.num;
                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setSelectedShift(s.num)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-[#eaedff] text-on-surface hover:bg-[#dae2fd]'
                    }`}
                  >
                    <span className="font-bold text-[12px]">{s.label}</span>
                    <span
                      className={`text-[10px] ${
                        isActive ? 'text-white/80' : 'text-[#5e3f3c]'
                      }`}
                    >
                      {s.time}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Island Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-[#5e3f3c] font-bold uppercase tracking-wider">
                Pulau / Dispenser Bertugas
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { num: 1 as const, label: 'Pulau 1 (1-2)' },
                  { num: 2 as const, label: 'Pulau 2 (3-4)' },
                  { num: 3 as const, label: 'Pulau 3 (5-6)' },
                ].map((i) => {
                  const isActive = selectedIsland === i.num;
                  return (
                    <button
                      key={i.num}
                      type="button"
                      onClick={() => setSelectedIsland(i.num)}
                      className={`py-2 px-1 rounded-lg text-[11px] font-semibold text-center truncate transition-all cursor-pointer ${
                        isActive
                          ? 'bg-secondary text-white shadow-md'
                          : 'bg-[#eaedff] text-on-surface hover:bg-[#dae2fd]'
                      }`}
                    >
                      {i.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Credentials Helper Banner */}
          <div className="bg-[#e2e7ff] rounded-xl p-3 shadow-xs flex items-center justify-between gap-2 border border-[#dae2fd]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-[18px]">vpn_key</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-on-surface uppercase tracking-wide">
                  Kredensial Default
                </span>
                <span className="font-mono text-[11px] text-[#5e3f3c] truncate">
                  User: <b className="text-on-surface">admin</b> | Sandi:{' '}
                  <b className="text-on-surface">admin123</b>
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={fillDefaultCreds}
              className="shrink-0 bg-white text-secondary px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer hover:bg-secondary hover:text-white"
            >
              Gunakan
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="bg-white rounded-xl p-3.5 shadow-sm border border-[#eaedff] flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label
                className="text-[11px] text-[#5e3f3c] font-bold uppercase tracking-wider flex items-center gap-1"
                htmlFor="usernameInput"
              >
                <span className="material-symbols-outlined text-[14px]">badge</span>
                ID Operator / Username
              </label>
              <div className="flex items-center bg-[#f2f3ff] rounded-lg px-3 py-2 border border-[#eaedff] focus-within:border-secondary">
                <span className="material-symbols-outlined text-[#5e3f3c] mr-2 text-[20px]">
                  person
                </span>
                <input
                  id="usernameInput"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent text-[13px] text-on-surface focus:outline-none"
                  placeholder="Masukkan ID kasir"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label
                className="text-[11px] text-[#5e3f3c] font-bold uppercase tracking-wider flex items-center gap-1"
                htmlFor="passwordInput"
              >
                <span className="material-symbols-outlined text-[14px]">lock</span>
                PIN Akses / Kata Sandi
              </label>
              <div className="flex items-center bg-[#f2f3ff] rounded-lg px-3 py-2 border border-[#eaedff] focus-within:border-secondary">
                <span className="material-symbols-outlined text-[#5e3f3c] mr-2 text-[20px]">key</span>
                <input
                  id="passwordInput"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-[13px] text-on-surface focus:outline-none"
                  placeholder="Masukkan PIN sandi"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#5e3f3c] hover:text-on-surface p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                />
                <span className="text-[12px] text-on-surface font-medium">
                  Ingat Kredensial di Terminal Ini
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#f2f3ff] rounded-lg border border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[20px]">print</span>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-on-surface">RPP-02N BT POS (58mm)</span>
                  <span className="text-[10px] text-tertiary font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" /> Siap
                    Cetak Struk
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#5e3f3c]">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  bluetooth_connected
                </span>
                <span className="text-[11px] font-bold font-mono">100%</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[50px] bg-primary hover:bg-primary-container text-white rounded-xl font-headline font-bold text-[14px] uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">
                    progress_activity
                  </span>
                  <span>Membuka Sesi Kasir...</span>
                </>
              ) : (
                <>
                  <span>Masuk &amp; Buka Sesi Kasir</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Indonesian Pertamina Fuel Grades Ticker */}
          <div className="flex items-center justify-center gap-2 py-1 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-tertiary/15 text-tertiary text-[11px] font-bold">
              Pertalite
            </span>
            <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary text-[11px] font-bold">
              Pertamax
            </span>
            <span className="px-2 py-0.5 rounded bg-primary/15 text-primary text-[11px] font-bold">
              Turbo
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px] font-bold">
              Dexlite
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center gap-0.5 text-[#5e3f3c] text-[11px]">
            <span className="font-mono font-semibold">Versi 2.4.0 (ESC/POS Thermal Engine v1.8)</span>
            <span className="opacity-80">PT Pertamina Retail • Hak Cipta Dilindungi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
