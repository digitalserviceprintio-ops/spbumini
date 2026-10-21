import { FuelProduct, FuelType, SpbuSettings, TransactionRecord, BluetoothDevice } from '../types';

export const INITIAL_FUELS: FuelProduct[] = [
  {
    id: 'pertamax',
    name: 'Pertamax',
    grade: 'RON 92',
    code: '92',
    price: 8600,
    subLabel: 'Bahan Bakar Bensin Non-Subsidi',
    color: '#245eaa',
    badgeBg: 'bg-secondary/15',
    badgeText: 'text-secondary',
  },
  {
    id: 'pertalite',
    name: 'Pertalite',
    grade: 'RON 90',
    code: '90',
    price: 10000,
    subLabel: 'Bahan Bakar Penugasan Khusus (JBKP)',
    color: '#006b32',
    badgeBg: 'bg-tertiary/15',
    badgeText: 'text-tertiary',
  },
  {
    id: 'pertamax-turbo',
    name: 'Turbo',
    grade: 'RON 98',
    code: '98',
    price: 14400,
    subLabel: 'High Octane Racing Grade',
    color: '#bb0013',
    badgeBg: 'bg-primary/15',
    badgeText: 'text-primary',
  },
  {
    id: 'dexlite',
    name: 'Dexlite',
    grade: 'CN 51',
    code: '51',
    price: 13700,
    subLabel: 'Diesel Ringan Mesin Commonrail',
    color: '#008740',
    badgeBg: 'bg-tertiary-container/15',
    badgeText: 'text-tertiary-container',
  },
  {
    id: 'pertamina-dex',
    name: 'Pertamina Dex',
    grade: 'CN 53',
    code: '53',
    price: 14350,
    subLabel: 'Diesel Cetane Tinggi Standar Euro 4',
    color: '#005225',
    badgeBg: 'bg-[#005225]/15',
    badgeText: 'text-[#005225]',
  },
  {
    id: 'biosolar',
    name: 'Biosolar',
    grade: 'Subsidi',
    code: 'B35',
    price: 6800,
    subLabel: 'Solar Subsidi Kuota QR Code (JBT)',
    color: '#475569',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-700',
  },
];

export const DEFAULT_SETTINGS: SpbuSettings = {
  spbuNumber: 'SPBU.54.612.55',
  partnerName: 'PT Pertamina Retail - KSO Tropodo',
  address: 'Jl. Raya Tropodo 9A',
  city: 'Waru - Sidoarjo',
  phone: '031-8667744',
  footerMessage: 'TERIMA KASIH DAN SELAMAT JALAN',
  printPertaminaLogo: true,
  printPastiPasLogo: true,
  printQrValidation: true,
  paperWidth: '58',
  density: 'normal',
  feedLines: 3,
  autoCut: false,
  fuelPrices: {
    pertamax: 8600,
    pertalite: 10000,
    'pertamax-turbo': 14400,
    dexlite: 13700,
    'pertamina-dex': 14350,
    biosolar: 6800,
  },
  logoMode: 'default',
  logoFilter: 'monochrome',
  logoSize: 'medium',
  logoAlignment: 'left',
};

export interface PresetLogo {
  id: string;
  name: string;
  tag: string;
  description: string;
  url: string;
}

export const PRESET_LOGOS: PresetLogo[] = [
  {
    id: 'pertamina-standard',
    name: 'Pertamina Retail (Standar)',
    tag: 'Resmi',
    description: 'Header resmi SPBU monokrom 3 elemen geometris',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_up7az9vmCqyZUxI2HiIUexMKYg4E4nfljKB_zcvhARpMXuyJkCY3AKMJXYsTmLj2iq6nrrSeXkM2Jsyt9v7nGivCmuzH1kTYTS_kMPX_UfpmOat-TLZTsbDqt1aad3KOyrHWikbFBhikoeZ0ehMrQ6EpH2lWlImnk3ZQ7dcY2_mR3HEhFvY9IypPz4b2AKpkWiWvtG1Fw51Ky8eWV9BUWfsZsJ8m2vya7L-M8FteKhIarMZcNsPg',
  },
  {
    id: 'pertamina-dual',
    name: 'Pertamina + Pasti Pas Terkalibrasi',
    tag: 'Dual',
    description: 'Kombinasi logo Pertamina dan stempel akurasi tera',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'pertashop-modular',
    name: 'Pertashop & Mitra Desa',
    tag: 'Pertashop',
    description: 'Format cetak outlet Pertashop & Agen Resmi',
    url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'mypertamina-digital',
    name: 'MyPertamina Loyalty Badge',
    tag: 'Promo',
    description: 'Header kampanye cashback & subsidi terverifikasi',
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=240&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
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
  },
  {
    id: 'SPBU-20180321-041',
    timestamp: '2018-03-21T15:31:10',
    dateStr: 'Minggu, 21 Maret 2018',
    timeStr: '15:31:10 WIB',
    nopol: 'L 1829 XZ',
    vehicleType: 'bike',
    fuelType: 'pertalite',
    fuelName: 'Pertalite',
    liter: 20.00,
    unitPrice: 10000,
    totalPrice: 200000,
    hoseNumber: 2,
    printerNumber: 1,
    paymentMethod: 'cash',
    cashReceived: 200000,
    cashChange: 0,
    shift: 2,
    operatorId: 'admin',
  },
  {
    id: 'SPBU-20180321-040',
    timestamp: '2018-03-21T15:22:45',
    dateStr: 'Minggu, 21 Maret 2018',
    timeStr: '15:22:45 WIB',
    nopol: 'B 9021 TAA',
    vehicleType: 'car',
    fuelType: 'pertamina-dex',
    fuelName: 'Pertamina Dex',
    liter: 35.50,
    unitPrice: 13000,
    totalPrice: 461500,
    hoseNumber: 6,
    printerNumber: 1,
    paymentMethod: 'edc',
    shift: 2,
    operatorId: 'admin',
  },
  {
    id: 'SPBU-20180321-039',
    timestamp: '2018-03-21T15:15:02',
    dateStr: 'Minggu, 21 Maret 2018',
    timeStr: '15:15:02 WIB',
    nopol: 'N 3341 KJ',
    vehicleType: 'bike',
    fuelType: 'pertamax-turbo',
    fuelName: 'Pertamax Turbo',
    liter: 10.00,
    unitPrice: 14400,
    totalPrice: 144000,
    hoseNumber: 3,
    printerNumber: 1,
    paymentMethod: 'qris',
    shift: 2,
    operatorId: 'admin',
  },
];

export const INITIAL_DEVICES: BluetoothDevice[] = [
  {
    name: 'RPP-02N Bluetooth POS',
    mac: '66:32:B1:4A:20:11',
    status: 'connected',
    battery: 88,
    signal: '-48 dBm',
    paperStatus: 'Siap',
  },
  {
    name: 'Panda PRJ-58D POS',
    mac: '88:14:C2:5E:19:02',
    status: 'pairing',
    battery: 76,
    signal: '-65 dBm',
    paperStatus: 'Siap',
  },
  {
    name: 'EPPOS EP5802AI',
    mac: 'DC:0D:30:72:A8:41',
    status: 'standby',
    battery: 92,
    signal: '-70 dBm',
    paperStatus: 'Siap',
  },
  {
    name: 'Iware C58BT / VSC MP-58C',
    mac: 'AA:12:44:90:3F:89',
    status: 'out_of_range',
    battery: 40,
    signal: '-95 dBm',
    paperStatus: 'Tidak Diketahui',
  },
];

// Helper functions for Indonesian format
export function formatRupiah(num: number): string {
  if (isNaN(num)) return '0';
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseRupiah(str: string): number {
  const clean = str.replace(/[^\d]/g, '');
  return parseInt(clean, 10) || 0;
}

export function formatLiter(num: number): string {
  if (isNaN(num)) return '0,00';
  return (Math.round(num * 100) / 100).toFixed(2).replace('.', ',');
}

export function parseLiter(str: string): number {
  const clean = str.replace(',', '.').replace(/[^\d.]/g, '');
  return parseFloat(clean) || 0;
}

export function playThermalSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch {
    // Ignore audio context autoplay restrictions
  }
}
