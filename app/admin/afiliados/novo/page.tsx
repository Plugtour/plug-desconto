'use client';

// app/admin/afiliados/novo/page.tsx
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

type AffiliateStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado';

export default function AdminNovoAfiliadoPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cupom, setCupom] = useState('');
  const [status, setStatus] = useState<AffiliateStatus>('rascunho');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave =
    nome.trim().length >= 3 &&
    email.trim().length >= 5 &&
    whatsapp.trim().length >= 8 &&
    cupom.trim().length >= 3;

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);

    // MVP: mock
    await new Promise((r) => setTimeout(r, 450));

    alert(
      [
        'Salvar afiliado (mock):',
        `Nome: ${nome}`,
        `Email: ${email}`,
        `WhatsApp: ${whatsapp}`,
        `Cupom: ${cupom.toUpperCase()}`,
        `Status: ${status}`,
        `Notas: ${notas || '-'}`,
      ].join('\n')
    );

    setSaving(false);
  };

  const card = [
    'rounded-xl border p-4',
    'border-zinc-200 bg-white',
    'dark:border-zinc-900 dark:bg-zinc-950',
  ].join(' ');

  const label = 'block text-sm text-zinc-700 dark:text-zinc-300';

  const inputBase = [
    'mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none',
    'border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400',
    'dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-700',
  ].join(' ');

  const help = 'mt-2 text-xs text-zinc-500';

  return (
    <main className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-2">
            <Link
              href="/admin/afiliados"
              className={[
                'inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition',
                'text-zinc-700 hover:bg-zinc-100',
                'dark:text-zinc-300 dark:hover:bg-zinc-900',
              ].join(' ')}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Novo afiliado</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            MVP: cadastro básico. Comissões e subafiliados entram depois.
          </p>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={!canSave || saving}
          className={[
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
            canSave && !saving
              ? [
                  'bg-zinc-900 text-white hover:bg-zinc-800',
                  'dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white',
                ].join(' ')
              : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
          ].join(' ')}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Coluna principal */}
        <div className="md:col-span-2 space-y-4">
          <div className={card}>
            <label className={label}>Nome</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Ana Ribeiro"
              className={inputBase}
            />
            <p className={help}>Mínimo: 3 caracteres.</p>
          </div>

          <div className={card}>
            <label className={label}>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: ana@email.com"
              className={inputBase}
            />
          </div>

          <div className={card}>
            <label className={label}>WhatsApp</label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ex: (54) 99999-0000"
              className={inputBase}
            />
            <p className={help}>Obrigatório.</p>
          </div>

          <div className={card}>
            <label className={label}>Notas internas</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ex: canal de aquisição, contato, regras..."
              rows={5}
              className={[inputBase, 'resize-none'].join(' ')}
            />
          </div>
        </div>

        {/* Lateral */}
        <div className="space-y-4">
          <div className={card}>
            <label className={label}>Cupom</label>
            <input
              value={cupom}
              onChange={(e) => setCupom(e.target.value.toUpperCase())}
              placeholder="Ex: ANA10"
              className={inputBase}
            />
            <p className={help}>Mínimo: 3 caracteres.</p>
          </div>

          <div className={card}>
            <label className={label}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AffiliateStatus)}
              className={inputBase}
            >
              <option value="rascunho">Rascunho</option>
              <option value="publicado">Publicado</option>
              <option value="pausado">Pausado</option>
              <option value="arquivado">Arquivado</option>
            </select>

            <p className={help}>Para remover do ar, use “Pausado” ou “Arquivado”.</p>
          </div>

          <div
            className={[
              'rounded-xl border border-dashed p-4 text-xs',
              'border-zinc-300 bg-white text-zinc-500',
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500',
            ].join(' ')}
          >
            Próximo: vínculo com cupons, regras e métricas.
          </div>
        </div>
      </section>
    </main>
  );
}
