// lib/session.ts
import { cookies } from 'next/headers';

export type Role = 'guest' | 'user' | 'admin';

export type Session = {
  role: Role;
  planActive?: boolean;
  tenantId?: string | null;
};

export const defaultGuestSession: Session = {
  role: 'guest',
  planActive: false,
  tenantId: null,
};

// Nome do cookie da sessão (pode manter assim)
export function getSessionCookieName() {
  return 'pd_session';
}

/**
 * Decode simples: cookie guarda JSON em base64.
 * Se der qualquer erro, cai pra guest.
 */
export function decodeSession(raw: string | undefined | null): Session {
  try {
    if (!raw) return defaultGuestSession;

    const json = Buffer.from(raw, 'base64').toString('utf-8');
    const data = JSON.parse(json) as Partial<Session>;

    // validação básica
    const role: Role =
      data.role === 'admin' || data.role === 'user' || data.role === 'guest'
        ? data.role
        : 'guest';

    return {
      role,
      planActive: Boolean(data.planActive),
      tenantId: data.tenantId ?? null,
    };
  } catch {
    return defaultGuestSession;
  }
}

/**
 * Pega a sessão atual a partir do cookie.
 * OBS: no Next 16 o cookies() pode ser async em alguns ambientes,
 * então usamos await para evitar aqueles erros de "Você esqueceu de usar await?"
 */
export async function getSession(): Promise<Session> {
  const store = await cookies();
  const raw = store.get(getSessionCookieName())?.value;
  return decodeSession(raw);
}
