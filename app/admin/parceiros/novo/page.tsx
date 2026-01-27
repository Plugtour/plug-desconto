'use client';

// app/admin/parceiros/novo/page.tsx
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

type PartnerStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado';

export default function AdminNovoParceiroPage() {
  const categories = useMemo(
    () => ['Gastronomia', 'Atrações', 'Passeios', 'Hospedagem', 'Transporte', 'Compras', 'Serviços'],
    []
  );

  const cities = useMemo(() => ['Gramado', 'Canela', 'Nova Petrópolis', 'São Francisco de Paula'], []);

  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState(categories[0] ?? '');
  const [cidade, setCidade] = useState(cities[0] ?? '');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [status, setStatus] = useState<PartnerStatus>('rascunho');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = nome.trim().length >= 3 && whatsapp.trim().length >= 8;

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);

    // MVP: mock
    await new Promise((r) => setTimeout(r, 450));

    alert(
      [
        'Salvar parceiro (mock):',
        `Nome: ${nome}`,
        `Categoria: ${categoria}`,
        `Cidade: ${cidade}`,
        `WhatsApp: ${whatsapp}`,
        `Instagram: ${instagram || '-'}`,
        `Status: ${status}`,
        `Obs: ${observacoes || '-'}`,
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
              href="/admin/parceiros"
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

          <h1 className="text-2xl font-semibold tracking-tight">Novo parceiro</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            MVP: cadastro básico. Depois conectamos na fonte única do admin.
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
              placeholder="Ex: Cantina Bella"
              className={inputBase}
            />
            <p className={help}>Mínimo: 3 caracteres.</p>
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
            <label className={label}>Instagram (opcional)</label>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="Ex: @cantinabella"
              className={inputBase}
            />
          </div>

          <div className={card}>
            <label className={label}>Notas internas</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: regras de repasse, contrato, contato responsável..."
              rows={5}
              className={[inputBase, 'resize-none'].join(' ')}
            />
          </div>
        </div>

        {/* Lateral */}
        <div className="space-y-4">
          <div className={card}>
            <label className={label}>Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={inputBase}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className={card}>
            <label className={label}>Cidade</label>
            <select value={cidade} onChange={(e) => setCidade(e.target.value)} className={inputBase}>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className={card}>
            <label className={label}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PartnerStatus)}
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
            Próximo: logo, imagens, endereço, termos e contatos.
          </div>
        </div>
      </section>
    </main>
  );
}
