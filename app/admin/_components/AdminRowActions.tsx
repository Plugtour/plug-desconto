'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Archive, PauseCircle, PlayCircle, RotateCcw, Trash2 } from 'lucide-react';

type AdminStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado' | 'lixeira';

type ClickEvent = React.MouseEvent<HTMLButtonElement>;

function safeStop(e: ClickEvent) {
  e.preventDefault();
  e.stopPropagation();
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
      <span className="grid place-items-center [&_svg]:transition [&_svg]:text-current">{children}</span>
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
  onTrash,
  onDeleteForever,
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
  onTrash: (id: string) => void;
  onDeleteForever?: (id: string) => void;
  viewBaseHref?: string;
  editBaseHref?: string;
}) {
  const router = useRouter();

  const canPublish = status === 'rascunho' || status === 'pausado';
  const canPause = status === 'publicado';
  const isArchived = status === 'arquivado';
  const isTrashed = status === 'lixeira';

  const go = (url: string) => {
    router.push(url);
  };

  const handleView = (e: ClickEvent) => {
    safeStop(e);
    if (viewBaseHref) {
      const url = `${viewBaseHref}?id=${encodeURIComponent(id)}`;
      go(url);
      return;
    }
    onView(id);
  };

  const handleEdit = (e: ClickEvent) => {
    safeStop(e);
    if (editBaseHref) {
      const url = `${editBaseHref}?id=${encodeURIComponent(id)}`;
      go(url);
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

  const handleTrash = (e: ClickEvent) => {
    safeStop(e);
    onTrash(id);
  };

  const handleDeleteForever = (e: ClickEvent) => {
    safeStop(e);
    if (!onDeleteForever) return;
    onDeleteForever(id);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <RowAction title="Visualizar" onClick={handleView} disabled={isTrashed}>
        <Eye className="h-4 w-4" />
      </RowAction>

      <RowAction title="Editar" onClick={handleEdit} disabled={isTrashed}>
        <Pencil className="h-4 w-4" />
      </RowAction>

      {!isTrashed && (
        <RowAction title="Enviar para lixeira" onClick={handleTrash}>
          <Trash2 className="h-4 w-4" />
        </RowAction>
      )}

      {!isTrashed && canPublish && (
        <RowAction title="Publicar" onClick={handlePublish}>
          <PlayCircle className="h-4 w-4" />
        </RowAction>
      )}

      {!isTrashed && canPause && (
        <RowAction title="Pausar" onClick={handlePause}>
          <PauseCircle className="h-4 w-4" />
        </RowAction>
      )}

      {isTrashed ? (
        <>
          <RowAction title="Restaurar" onClick={handleRestore}>
            <RotateCcw className="h-4 w-4" />
          </RowAction>

          <RowAction title="Excluir definitivamente" onClick={handleDeleteForever} disabled={!onDeleteForever}>
            <Trash2 className="h-4 w-4" />
          </RowAction>
        </>
      ) : isArchived ? (
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
