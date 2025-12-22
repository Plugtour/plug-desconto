type GenerateVoucherParams = {
  offerId: string;
  userId: string;
};

/**
 * Gera um código de voucher simples e previsível
 * (mock – pronto para depois ser substituído por banco de dados)
 */
export function generateVoucherCode({
  offerId,
  userId,
}: GenerateVoucherParams): string {
  const base = `${offerId}-${userId}-${Date.now()}`;

  // transforma em um código curto e legível
  const hash = Buffer.from(base)
    .toString('base64')
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 10);

  return `PD-${hash}`;
}
