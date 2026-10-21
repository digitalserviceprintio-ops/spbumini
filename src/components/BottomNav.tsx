import React from 'react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  pendingTotal?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const tabs = [
    {
      id: 'buat-struk' as ScreenType,
      label: 'Buat Struk',
      icon: 'receipt_long',
    },
    {
      id: 'preview-dan-cetak' as ScreenType,
      label: 'Preview & Cetak',
      icon: 'print',
    },
    {
      id: 'riwayat-struk' as ScreenType,
      label: 'Riwayat',
      icon: 'history',
    },
    {
      id: 'pengaturan-printer-dan-spbu' as ScreenType,
      label: 'Pengaturan',
      icon: 'tune',
    },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-40 bg-[#faf8ff]/95 backdrop-blur-xl border-t border-[#eaedff] shadow-[0_-2px_12px_rgba(0,0,0,0.05)]">
      <div className="max-w-xl mx-auto grid grid-cols-4 items-center h-16 px-1">
        {tabs.map((tab) => {
          const isActive = currentScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all relative ${
                isActive
                  ? 'text-primary font-bold scale-[1.02]'
                  : 'text-[#5e3f3c] hover:text-[#131b2e]'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-primary rounded-b-full" />
              )}
              <span className={`material-symbols-outlined text-[24px] ${isActive ? 'fill-1' : ''}`}>
                {tab.icon}
              </span>
              <span className="text-[10px] tracking-tight mt-0.5 text-center leading-tight truncate w-full px-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
