import useBackupSuggestion from '@/shared/hooks/useBackupSuggestion';
import { Fragment } from 'react';
import ConfirmModal from './ConfirmModal';

export default function BackupSuggestion() {
  const { open, close, exportNow } = useBackupSuggestion();

  return (
    <Fragment>
      <ConfirmModal
        open={open}
        onClose={close}
        onConfirm={exportNow}
        title="Backup your data"
        message={
          'It’s a good idea to keep a backup of your habits and progress. Exporting a copy lets you restore your data if needed.'
        }
        confirmLabel="Export"
        confirmVariant="success"
        cancelLabel="Close"
      />
    </Fragment>
  );
}
