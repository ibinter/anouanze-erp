import { FileText, FileImage, FileSpreadsheet, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileIconProps {
  mimeType: string;
  className?: string;
}

export function FileIcon({ mimeType, className }: FileIconProps) {
  if (mimeType === 'application/pdf') {
    return <FileText className={cn('text-red-500', className)} />;
  }
  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return <FileText className={cn('text-blue-500', className)} />;
  }
  if (
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return <FileSpreadsheet className={cn('text-green-600', className)} />;
  }
  if (mimeType.startsWith('image/')) {
    return <FileImage className={cn('text-purple-500', className)} />;
  }
  return <File className={cn('text-neutral-400', className)} />;
}
