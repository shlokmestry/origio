import { Resend } from 'resend';

// Created on first call so the module can be imported at build time
// without RESEND_API_KEY needing to be set.
let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
