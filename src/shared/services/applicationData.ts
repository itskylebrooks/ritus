import { useHabitStore } from '@/shared/store/store';
import useThemeStore from '@/shared/store/theme';
import { clearRitusStorage } from '@/shared/utils/storage';

export { exportAllData, importAllData } from '@/shared/utils/dataTransfer';

export function resetApplicationData(): void {
  clearRitusStorage();
  useHabitStore.getState().resetAllData();
  useThemeStore.getState().setMode('system');
}
