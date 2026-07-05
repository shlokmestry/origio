// EUR base rates refreshed 2026-07-05 from ExchangeRate-API, cross-checked
// against Frankfurter/ECB where available.
export const FX_LAST_UPDATED = "2026-07-05";

export const TO_EUR: Record<string, number> = {
  EUR: 1,
  AED: 0.238055,
  ARS: 0.000587308,
  AUD: 0.606168,
  BGN: 0.511292,
  BRL: 0.168365,
  CAD: 0.615913,
  CHF: 1.08803,
  COP: 0.00025929,
  CRC: 0.00192763,
  CZK: 0.0413371,
  DKK: 0.134019,
  GBP: 1.16736,
  GEL: 0.331193,
  HRK: 0.132723,
  HUF: 0.00282946,
  IDR: 0.0000486518,
  INR: 0.00917336,
  JPY: 0.00542094,
  KES: 0.00676725,
  KRW: 0.000569992,
  MXN: 0.0500512,
  MYR: 0.214643,
  NOK: 0.0888627,
  NZD: 0.499043,
  PLN: 0.233231,
  RON: 0.191107,
  RSD: 0.00852139,
  SEK: 0.0905911,
  SGD: 0.67696,
  THB: 0.0263547,
  TRY: 0.0186656,
  TWD: 0.0273792,
  USD: 0.874257,
  VND: 0.0000336317,
  ZAR: 0.0538651,
};

export const DISPLAY_RATES = {
  eur: 1,
  usd: 1.143829,
  gbp: 0.856632,
  jpy: 184.469896,
} as const;
