// lib/auth.ts
import { getSession, defaultGuestSession, type Role, type Session } from '@/lib/session';

export class AccessDeniedError extends Error {
  code = 'ACCESS_DENIED' as const;
}

/**
 * Retorna a sessão atual (ou guest).
 */
export async function requireSession(): Promise<Session> {
  try {
    return await getSession();
  } catch {
    return defaultGuestSession;
  }
}

/**
 * Bloqueia se o usuário não tiver um dos perfis permitidos.
 */
export async function requireRole(roles: Role[]): Promise<Session> {
  const session = await requireSession();
  if (!roles.includes(session.role)) {
    throw new AccessDeniedError('Acesso negado');
  }
  return session;
}
