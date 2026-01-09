import { useEffect } from 'react';
import { useHabitStore } from '@/shared/store/store';
import fireConfetti from '@/shared/utils/confetti';
import { useIdleReady } from '@/shared/hooks/useIdleReady';
import CollectiblesStoreCard from './components/CollectiblesStoreCard';
import HeaderStats from './components/HeaderStats';
import TrophiesBoard from './components/TrophiesBoard';

export default function Milestones() {
  const ready = useIdleReady();
  const unlocked = useHabitStore((s) => s.progress.unlocked || {});
  const seen = useHabitStore((s) => s.progress.seenTrophies || {});
  const markSeen = useHabitStore((s) => s.markTrophiesSeen);
  const syncEmojiTrophies = useHabitStore((s) => s.syncEmojiTrophies);

  useEffect(() => {
    if (!ready) return;
    syncEmojiTrophies();
  }, [ready, syncEmojiTrophies]);

  useEffect(() => {
    if (!ready) return;
    // Determine any newly unlocked trophies that haven't been seen yet
    const newly = Object.keys(unlocked).filter((id) => unlocked[id] && !seen[id]);
    if (newly.length > 0) {
      fireConfetti();
      markSeen(newly);
    }
  }, [ready, unlocked, seen, markSeen]);

  return (
    <div>
      <div className="mt-6">
        {ready ? (
          <div className="fade-in-soft">
            <HeaderStats />
          </div>
        ) : (
          <div className="h-[120px] rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/40" />
        )}
      </div>
      <div className="mt-6">
        {ready ? (
          <div className="fade-in-soft">
            <TrophiesBoard />
          </div>
        ) : (
          <div className="h-[260px] rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/40" />
        )}
      </div>
      <div className="mt-6">
        {ready ? (
          <div className="fade-in-soft">
            <CollectiblesStoreCard />
          </div>
        ) : (
          <div className="h-[340px] rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/40" />
        )}
      </div>
    </div>
  );
}
