import React, { useState, useEffect } from 'react';
import { ScreenType, SpbuSettings, TransactionRecord, CashierSession } from './types';
import { DEFAULT_SETTINGS, INITIAL_TRANSACTIONS } from './data/constants';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ScreenCreateReceipt } from './components/ScreenCreateReceipt';
import { ScreenPreviewReceipt } from './components/ScreenPreviewReceipt';
import { ScreenReceiptHistory } from './components/ScreenReceiptHistory';
import { ScreenSettings } from './components/ScreenSettings';
import { ModalLoginSession } from './components/ModalLoginSession';
import { ModalOriginalReceipt } from './components/ModalOriginalReceipt';
import { ThermalReceiptSlip } from './components/ThermalReceiptSlip';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('buat-struk');

  // Persistence: Settings
  const [settings, setSettings] = useState<SpbuSettings>(() => {
    try {
      const saved = localStorage.getItem('pertamina_spbu_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Persistence: Transactions
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('pertamina_spbu_txs');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Cashier Session
  const [session, setSession] = useState<CashierSession>({
    isLoggedIn: true,
    operatorId: 'admin',
    shift: 2,
    island: 2,
    printerName: 'RPP-02N Bluetooth POS',
  });

  // Current Transaction Form Draft
  const [currentTx, setCurrentTx] = useState<TransactionRecord>({
    id: 'SPBU-20180321-042',
    timestamp: '2018-03-21T15:37:23',
    dateStr: 'Minggu, 21 Maret 2018',
    timeStr: '15:37:23 WIB',
    nopol: 'W 416 RH',
    vehicleType: 'car',
    fuelType: 'pertamax',
    fuelName: 'Pertamax',
    liter: 15.13,
    unitPrice: 8600,
    totalPrice: 130118,
    hoseNumber: 4,
    printerNumber: 1,
    paymentMethod: 'cash',
    cashReceived: 150000,
    cashChange: 19882,
    shift: 2,
    operatorId: 'admin',
  });

  // Hardware Bluetooth state
  const [btConnected, setBtConnected] = useState<boolean>(true);

  // Modals
  const [showSessionModal, setShowSessionModal] = useState<boolean>(false);
  const [showOriginalModal, setShowOriginalModal] = useState<boolean>(false);

  // Toast Notification
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    icon: string;
  }>({
    visible: false,
    message: '',
    icon: 'check_circle',
  });

  // Persist settings whenever changed
  useEffect(() => {
    try {
      localStorage.setItem('pertamina_spbu_settings', JSON.stringify(settings));
    } catch {
      // storage unavailable
    }
  }, [settings]);

  // Persist transactions whenever changed
  useEffect(() => {
    try {
      localStorage.setItem('pertamina_spbu_txs', JSON.stringify(transactions));
    } catch {
      // storage unavailable
    }
  }, [transactions]);

  const showToast = (message: string, icon = 'check_circle') => {
    setToast({ visible: true, message, icon });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
  };

  const handlePrintComplete = (tx: TransactionRecord, copies: number) => {
    // Add to history if not duplicate
    setTransactions((prev) => {
      const exists = prev.some((t) => t.id === tx.id);
      return exists ? prev : [tx, ...prev];
    });

    showToast(`Struk ${tx.nopol} berhasil dicetak (${copies}x)!`, 'task_alt');
  };

  const handleQuickPrint = (tx: TransactionRecord) => {
    setTransactions((prev) => {
      const exists = prev.some((t) => t.id === tx.id);
      return exists ? prev : [tx, ...prev];
    });
    showToast(`Struk ${tx.nopol} dikirim langsung ke Bluetooth (RPP-02N)`, 'print');
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col antialiased">
      {/* Toast Notification */}
      <div
        className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 max-w-sm w-[90%] flex items-center gap-2.5 p-3 rounded-xl bg-[#283044] text-[#eef0ff] shadow-xl pointer-events-none ${
          toast.visible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-4 scale-95'
        }`}
      >
        <span className="material-symbols-outlined text-[#78fc9c] text-[22px]">
          {toast.icon}
        </span>
        <p className="text-[13px] font-medium truncate flex-1">{toast.message}</p>
      </div>

      {/* Global Header */}
      <Header
        currentScreen={currentScreen}
        session={session}
        onOpenSessionModal={() => setShowSessionModal(true)}
        onOpenOriginalReceiptModal={() => setShowOriginalModal(true)}
        btConnected={btConnected}
        onToggleBt={() => {
          setBtConnected(!btConnected);
          showToast(
            btConnected ? 'Printer Bluetooth Terputus' : 'Printer RPP-02N Terhubung (Ready)',
            btConnected ? 'bluetooth_disabled' : 'bluetooth_connected'
          );
        }}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-xl mx-auto pt-24 pb-24 px-3 sm:px-4 flex flex-col">
        {currentScreen === 'buat-struk' && (
          <ScreenCreateReceipt
            settings={settings}
            session={session}
            currentTransaction={currentTx}
            onUpdateTransaction={setCurrentTx}
            onGoToPreview={() => setCurrentScreen('preview-dan-cetak')}
            onQuickPrint={handleQuickPrint}
          />
        )}

        {currentScreen === 'preview-dan-cetak' && (
          <ScreenPreviewReceipt
            transaction={currentTx}
            settings={settings}
            onEditData={() => setCurrentScreen('buat-struk')}
            onPrintComplete={handlePrintComplete}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'riwayat-struk' && (
          <ScreenReceiptHistory
            transactions={transactions}
            settings={settings}
            activeShift={session.shift}
            onSelectShift={(newShift) => setSession((s) => ({ ...s, shift: newShift }))}
            onShowToast={showToast}
            onViewReceipt={(tx) => {
              setCurrentTx(tx);
              setCurrentScreen('preview-dan-cetak');
            }}
          />
        )}

        {currentScreen === 'pengaturan-printer-dan-spbu' && (
          <ScreenSettings
            settings={settings}
            onSaveSettings={(newS) => {
              setSettings(newS);
              // Also sync currentTx fuel unitPrice if needed
              const updatedPrice = newS.fuelPrices[currentTx.fuelType] || currentTx.unitPrice;
              setCurrentTx((prev) => ({
                ...prev,
                unitPrice: updatedPrice,
                totalPrice: Math.round(prev.liter * updatedPrice),
              }));
            }}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Global Bottom Navigation Bar */}
      <BottomNav
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        pendingTotal={currentTx.totalPrice}
      />

      {/* Login / Shift Assignment Modal */}
      {showSessionModal && (
        <ModalLoginSession
          session={session}
          onUpdateSession={setSession}
          onClose={() => setShowSessionModal(false)}
          onShowToast={showToast}
        />
      )}

      {/* Compare with Original Photo Modal */}
      {showOriginalModal && (
        <ModalOriginalReceipt
          sampleTransaction={currentTx}
          settings={settings}
          onClose={() => setShowOriginalModal(false)}
        />
      )}

      {/* Print-Only Style Container (for actual window.print()) */}
      <div className="hidden print:block fixed inset-0 bg-white p-0 m-0 z-[99999]">
        <div className="w-[58mm] mx-auto pt-2">
          <ThermalReceiptSlip
            transaction={currentTx}
            settings={settings}
            paperWidth={settings.paperWidth}
            density="dark"
            hideShadow={true}
          />
        </div>
      </div>
    </div>
  );
}
