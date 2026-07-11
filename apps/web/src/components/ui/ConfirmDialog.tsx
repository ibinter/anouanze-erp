'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titre: string;
  message: string;
  variante?: 'danger' | 'warning' | 'info';
}

const varianteConfig = {
  danger: {
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50',
    btnClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
    btnClass: 'bg-orange-500 hover:bg-orange-600 text-white',
  },
  info: {
    icon: Info,
    iconColor: 'text-primary-600',
    iconBg: 'bg-primary-50',
    btnClass: 'btn-primary',
  },
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  titre,
  message,
  variante = 'info',
}: ConfirmDialogProps) {
  const config = varianteConfig[variante];
  const Icon = config.icon;

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white rounded-xl shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <Dialog.Title className="text-base font-semibold text-neutral-800">{titre}</Dialog.Title>
            <Dialog.Close className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors" onClick={onClose}>
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>
          <div className="px-6 py-5 flex gap-4">
            <div className={cn('p-2.5 rounded-full shrink-0 h-fit', config.iconBg)}>
              <Icon className={cn('w-5 h-5', config.iconColor)} />
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">{message}</p>
          </div>
          <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', config.btnClass)}
            >
              Confirmer
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
