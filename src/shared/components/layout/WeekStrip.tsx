import { useHabitStore } from '@/shared/store/store';
import { ACCENTS } from '@/shared/theme/accent';
import { type Habit } from '@/shared/types';
import { daysThisWeek, iso } from '@/shared/utils/date';
import { format } from 'date-fns';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';

function WeekStripDay({
  date,
  habit,
  done,
  onToggle,
  showList,
  hasGlow,
  appliedAccentId,
}: {
  date: Date;
  habit: Habit;
  done: boolean;
  onToggle: (d: Date) => void;
  showList: boolean;
  hasGlow: boolean;
  appliedAccentId: keyof typeof ACCENTS;
}) {
  const controls = useAnimation();
  const mounted = useRef(false);
  const prevDone = useRef(done);

  const shortLabel = format(date, 'EE');
  const fullLabel = format(date, 'EEEE');
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const isPast = date < todayStart;
  const isFuture = date > todayStart;
  const disabled = isFuture || habit.archived;

  useEffect(() => {
    // Skip animation on first render
    if (!mounted.current) {
      mounted.current = true;
      prevDone.current = done;
      return;
    }

    if (done !== prevDone.current) {
      // Trigger momentary glow animation ONLY when marking (done becomes true)
      if (hasGlow && done) {
        const isBreak = habit.mode === 'break';
        const isDark = document.documentElement.classList.contains('dark');

        let glowColor: string;
        let transparentColor: string;

        if (isBreak) {
          // Brighter/stronger glow for break habits (Emerald)
          glowColor = 'rgba(16, 185, 129, 0.9)';
          transparentColor = 'rgba(16, 185, 129, 0)';
        } else {
          // Resolve standard accent color
          const accentDef = ACCENTS[appliedAccentId] || ACCENTS['default'];
          const hex = isDark ? accentDef.dark : accentDef.light;

          // Convert hex to rgb for interpolation
          // Assuming hex is #RRGGBB
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);

          glowColor = `rgba(${r}, ${g}, ${b}, 0.8)`; // slightly transparent peak
          transparentColor = `rgba(${r}, ${g}, ${b}, 0)`;
        }

        const peakBlur = isBreak ? '16px' : '12px';
        const peakSpread = isBreak ? '5px' : '3px';

        // Final state: larger blur/spread but transparent, simulating diffusion
        const endBlur = isBreak ? '32px' : '24px';
        const endSpread = isBreak ? '12px' : '8px';

        controls.start({
          boxShadow: [
            '0 0 0px 0px transparent',
            `0 0 ${peakBlur} ${peakSpread} ${glowColor}`,
            `0 0 ${endBlur} ${endSpread} ${transparentColor}`,
          ],
          transition: {
            duration: 1.5,
            times: [0, 0.2, 1],
            ease: ['easeOut', 'easeOut'], // Fast attack, smooth long decay
          },
        });
      }
      prevDone.current = done;
    }
  }, [done, hasGlow, controls, habit.mode, appliedAccentId]);

  let cls = '';
  if (habit.mode === 'break') {
    const isMarked = done;
    cls = isMarked
      ? 'border-transparent bg-emerald-600 text-white'
      : isPast
        ? 'border-transparent bg-red-500 text-white'
        : 'border-subtle text-strong hover:bg-surface-alt';
  } else {
    cls = done
      ? 'weekstrip-done border-transparent'
      : 'border-subtle text-strong hover:bg-surface-alt';
  }

  const ariaLabel = `${format(date, 'EEEE, d MMM')}: ${
    done ? 'Completed' : disabled ? 'Not available' : 'Not completed'
  }`;

  return (
    <motion.button
      onClick={() => {
        if (!disabled) onToggle(date);
      }}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      title={`${shortLabel} ${format(date, 'd MMM')}`}
      className={`grid h-8 place-items-center border text-xs font-medium ${
        showList ? 'w-8 rounded-full sm:w-auto sm:px-3 sm:rounded-lg' : 'w-8 rounded-full'
      } ${cls} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      animate={controls}
    >
      {showList ? (
        <>
          <span className="sm:hidden">{shortLabel[0]}</span>
          <span className="hidden sm:inline whitespace-nowrap">{fullLabel}</span>
        </>
      ) : (
        shortLabel[0]
      )}
    </motion.button>
  );
}

export default function WeekStrip({
  habit,
  completionKeys,
  onToggle,
}: {
  habit: Habit;
  completionKeys: Set<string>;
  onToggle: (d: Date) => void;
}) {
  const weekStart = useHabitStore((s) => s.weekStart);
  const showList = useHabitStore((s) => s.showList ?? false);
  const appliedCollectibles = useHabitStore((s) => s.progress.appliedCollectibles || {});
  const hasGlow = (appliedCollectibles['animation'] || '').includes('anim_lumina_touch');
  const appliedAccentId = (appliedCollectibles['accent'] as keyof typeof ACCENTS) || 'default';
  const week = useMemo(
    () => daysThisWeek(new Date(), weekStart === 'sunday' ? 0 : 1),
    [weekStart],
  );

  return (
    <div className={`flex ${showList ? 'gap-1.5 sm:gap-2.5' : 'gap-1.5'}`}>
      {week.map((d) => {
        const key = iso(d).slice(0, 10);
        const done = completionKeys.has(key);
        return (
          <WeekStripDay
            key={d.toISOString()}
            date={d}
            habit={habit}
            done={done}
            onToggle={onToggle}
            showList={showList}
            hasGlow={hasGlow}
            appliedAccentId={appliedAccentId}
          />
        );
      })}
    </div>
  );
}
