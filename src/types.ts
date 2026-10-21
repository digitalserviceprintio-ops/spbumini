export type ScreenType = 'buat-struk' | 'preview-dan-cetak' | 'riwayat-struk' | 'pengaturan-printer-dan-spbu' | 'login-sesi';

export type FuelType = 'pertamax' | 'pertalite' | 'pertamax-turbo' | 'dexlite' | 'pertamina-dex' | 'biosolar';

export interface FuelProduct {
  id: FuelType;
  name: string;
  grade: string;
  code: string;
  subLabel?: string;
  price: number;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export type PaymentMethod = 'cash' | 'qris' | 'edc';
export type VehicleType = 'car' | 'bike';

export interface SpbuSettings {
  spbuNumber: string;
  partnerName: string;
  address: string;
  city: string;
  phone: string;
  footerMessage: string;
  printPertaminaLogo: boolean;
  printPastiPasLogo: boolean;
  printQrValidation: boolean;
  paperWidth: '58' | '80';
  density: 'light' | 'normal' | 'dark';
  feedLines: number;
  autoCut: boolean;
  fuelPrices: Record<FuelType, number>;
  // Logo & Branding Settings
  logoMode: 'default' | 'custom' | 'none';
  customLogoUrl?: string;
  customLogoName?: string;
  logoFilter: 'monochrome' | 'original' | 'high-contrast';
  logoSize: 'small' | 'medium' | 'large';
  logoAlignment: 'left' | 'center';
}

export interface BluetoothDevice {
  name: string;
  mac: string;
  status: 'connected' | 'pairing' | 'standby' | 'out_of_range';
  battery: number;
  signal: string;
  paperStatus: string;
}

export interface TransactionRecord {
  id: string;
  timestamp: string;
  dateStr: string;
  timeStr: string;
  nopol: string;
  vehicleType: VehicleType;
  fuelType: FuelType;
  fuelName: string;
  liter: number;
  unitPrice: number;
  totalPrice: number;
  hoseNumber: number;
  printerNumber: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  cashChange?: number;
  shift: 1 | 2 | 3;
  operatorId: string;
}

export interface CashierSession {
  isLoggedIn: boolean;
  operatorId: string;
  shift: 1 | 2 | 3;
  island: 1 | 2 | 3;
  printerName: string;
}
