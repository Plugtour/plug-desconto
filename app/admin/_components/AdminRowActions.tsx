'use client';

import React from 'react';
import { Eye, Pencil, Archive, PauseCircle, PlayCircle, RotateCcw } from 'lucide-react';

type AdminStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado';

type ClickEvent = React.MouseEvent<HTMLButtonElement>;

function safeStop(e: ClickEvent) {
  e.preventDefault();
  e.stopPropagation();
}

function openInNewTab(url: string) {
  if (typeof window === 'undefined') return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function RowAction({
  title,
  onClick,
  children,
  disabled,
}: {
  title: string;
  onClick: (e: ClickEvent) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        'group grid h-9 w-9 place-items-center rounded-lg transition',
        // ✅ cores seguras no claro/escuro (sem "quadrado preto" agressivo)
        disabled
          ? 'cursor-not-allowed opacity-40'
          : [
              'text-zinc-500 hover:text-zinc-900 active:text-zinc-900',
              'hover:bg-zinc-100 active:bg-zinc-200',
              'dark:text-zinc-400 dark:hover:text-zinc-100 dark:active:text-zinc-100',
              'dark:hover:bg-zinc-900/60 dark:active:bg-zinc-900/80',
            ].join(' '),
      ].join(' ')}
    >
      {/* garante que o SVG herde cor corretamente */}
      <span className="grid place-items-center [&_svg]:transition [&_svg]:text-current">
        {children}
      </span>
    </button>
  );
}

export default function AdminRowActions({
  id,
  status,
  onView,
  onEdit,
  onPublish,
  onPause,
  onArchive,
  onRestore,
  viewBaseHref,
  editBaseHref,
}: {
  id: string;
  status: AdminStatus;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onPublish: (id: string) => void;
  onPause: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  viewBaseHref?: string;
  editBaseHref?: string;
}) {
  const canPublish = status === 'rascunho' || status === 'pausado';
  const canPause = status === 'publicado';
  const isArchived = status === 'arquivado';

  const handleView = (e: ClickEvent) => {
    safeStop(e);
    if (viewBaseHref) {
      const url = `${viewBaseHref}?id=${encodeURIComponent(id)}`;
      openInNewTab(url);
      return;
    }
    onView(id);
  };

  const handleEdit = (e: ClickEvent) => {
    safeStop(e);
    if (editBaseHref) {
      const url = `${editBaseHref}?id=${encodeURIComponent(id)}`;
      openInNewTab(url);
      return;
    }
    onEdit(id);
  };

  const handlePublish = (e: ClickEvent) => {
    safeStop(e);
    onPublish(id);
  };

  const handlePause = (e: ClickEvent) => {
    safeStop(e);
    onPause(id);
  };

  const handleArchive = (e: ClickEvent) => {
    safeStop(e);
    onArchive(id);
  };

  const handleRestore = (e: ClickEvent) => {
    safeStop(e);
    onRestore(id);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <RowAction title="Visualizar" onClick={handleView}>
        <Eye className="h-4 w-4" />
      </RowAction>

      <RowAction title="Editar" onClick={handleEdit}>
        <Pencil className="h-4 w-4" />
      </RowAction>

      {canPublish && (
        <RowAction title="Publicar" onClick={handlePublish}>
          <PlayCircle className="h-4 w-4" />
        </RowAction>
      )}

      {canPause && (
        <RowAction title="Pausar" onClick={handlePause}>
          <PauseCircle className="h-4 w-4" />
        </RowAction>
      )}

      {isArchived ? (
        <RowAction title="Restaurar" onClick={handleRestore}>
          <RotateCcw className="h-4 w-4" />
        </RowAction>
      ) : (
        <RowAction title="Arquivar" onClick={handleArchive}>
          <Archive className="h-4 w-4" />
        </RowAction>
      )}
    </div>
  );
}
