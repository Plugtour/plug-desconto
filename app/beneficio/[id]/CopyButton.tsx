'use client';

import { useState } from 'react';

export default function CopyButton({
  value,
  disabled,
}: {
  value: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback simples
      const el = document.createElement('textarea');
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      disabled={disabled}
      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
        disabled
          ? 'cursor-not-allowed border-zinc-700 bg-zinc-900 text-zinc-500'
          : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
      }`}
      title={disabled ? 'Voucher utilizado' : 'Copiar voucher'}
    >
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  );
}
