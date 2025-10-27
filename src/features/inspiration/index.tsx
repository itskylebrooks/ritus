import React, { useState } from 'react'
import { Check, Compass, Lightbulb } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { transitions } from '@/shared/animations'
import { useHabitStore } from '@/shared/store/store'

interface HabitDef {
	name: string
	mode: 'build' | 'break'
	frequency: 'daily' | 'weekly' | 'monthly'
	weeklyTarget?: number
	monthlyTarget?: number
	description?: string
}

interface HabitSet {
	title: string
	subtitle: string
	habits: HabitDef[]
}

const COMPASS_SETS = [
	{
		dir: 'North',
		arrow: '↑',
		title: 'Truth & Freedom',
		note: 'I’ve always felt lies and manipulation like static in the air. My North is about honesty, independence, and mental clarity — the kind that lets you breathe. These habits remind me to live by choice, not by autopilot.',
		disclaimer: 'I share these from personal experience — not all forms of “freedom” feel the same to everyone. Take what fits your rhythm.',
		habits: [
				{ name: 'Morning Silence', mode: 'build', frequency: 'daily' },
				{ name: 'No Social Media in Morning', mode: 'break', frequency: 'daily' },
				{ name: 'Inbox Once a Day', mode: 'break', frequency: 'daily' },
					{ name: 'Deep Work Session', mode: 'build', frequency: 'weekly', weeklyTarget: 3 },
					{ name: 'Digital Sabbath', mode: 'break', frequency: 'weekly', weeklyTarget: 1 },
				{ name: 'Plan Tomorrow Before Sleep', mode: 'build', frequency: 'daily' },
					{ name: 'Declutter Workspace', mode: 'build', frequency: 'weekly', weeklyTarget: 1 },
					{ name: 'Monthly Reflection', mode: 'build', frequency: 'monthly', monthlyTarget: 1 },
				{ name: 'No Multitasking', mode: 'break', frequency: 'daily' },
					{ name: 'Walk Without Headphones', mode: 'build', frequency: 'weekly', weeklyTarget: 2 },
					{ name: 'Minimal Day', mode: 'break', frequency: 'weekly', weeklyTarget: 1 },
		],
	},
	{
		dir: 'East',
		arrow: '→',
		title: 'Faith & Hope',
		note: 'The East is light. For me, faith isn’t dogma — it’s the quiet certainty that meaning still exists, even when logic fails. These habits help me stay open, anchored in something higher than achievement.',
		disclaimer: 'My reflections here come from a Christian frame, but the point is not religion — it’s faith in something that lifts you beyond yourself.',
		habits: [
				{ name: 'Read Before Bed', mode: 'build', frequency: 'daily' },
				{ name: 'Pray or Meditate', mode: 'build', frequency: 'daily' },
				{ name: 'No Alcohol', mode: 'break', frequency: 'daily' },
					{ name: 'Write a Blessing', mode: 'build', frequency: 'weekly', weeklyTarget: 1 },
					{ name: 'Attend Aikido', mode: 'build', frequency: 'weekly', weeklyTarget: 2 },
				{ name: 'Morning Walk', mode: 'build', frequency: 'daily' },
				{ name: 'Gratitude Prayer', mode: 'build', frequency: 'daily' },
				{ name: 'Limit News Intake', mode: 'break', frequency: 'daily' },
					{ name: 'Reflect on Scripture / Wisdom Text', mode: 'build', frequency: 'weekly', weeklyTarget: 3 },
					{ name: 'Act of Service', mode: 'build', frequency: 'weekly', weeklyTarget: 1 },
		],
	},
	{
		dir: 'West',
		arrow: '←',
		title: 'Growth & Mastery',
		note: 'I see discipline as art — something built brick by brick. My West keeps me grounded in work, study, and effort that actually changes who I am. It’s not about perfection, just the next small proof that I’m learning.',
		disclaimer: 'Discipline means different things to different people. Don’t use it to punish yourself — it’s meant to build trust with your future self.',
		habits: [
				{ name: 'Code for 1 Hour', mode: 'build', frequency: 'daily' },
					{ name: 'Study English', mode: 'build', frequency: 'weekly', weeklyTarget: 2 },
			{ name: 'Journal Reflection', mode: 'build', frequency: 'daily' },
			{ name: 'Cold Shower', mode: 'build', frequency: 'daily' },
					{ name: 'Sunday Review', mode: 'build', frequency: 'weekly', weeklyTarget: 1 },
				{ name: 'Read 30 Minutes', mode: 'build', frequency: 'daily' },
				{ name: 'Practice a Skill', mode: 'build', frequency: 'daily' },
				{ name: 'Limit Distractions', mode: 'break', frequency: 'daily' },
					{ name: 'Weekly Sprint', mode: 'build', frequency: 'weekly', weeklyTarget: 1 },
					{ name: 'Teach What You Learn', mode: 'build', frequency: 'weekly', weeklyTarget: 1 },
						{ name: 'Monthly Review', mode: 'build', frequency: 'monthly', monthlyTarget: 1 },
		],
	},
	{
		dir: 'South',
		arrow: '↓',
		title: 'Love & Care',
		note: 'Even in frustration, I always return to the wish that people around me feel safe. The South reminds me that strength without tenderness becomes armor — and armor isolates.',
		disclaimer: 'I’m not good at this every day. These habits are simply my practice in learning gentleness — yours might look very different.',
		habits: [
			{ name: 'Gratitude Note', mode: 'build', frequency: 'daily' },
			{ name: 'Evening Stretch', mode: 'build', frequency: 'daily' },
			{ name: 'No Complaining', mode: 'break', frequency: 'daily' },
					{ name: 'Call a Friend', mode: 'build', frequency: 'weekly', weeklyTarget: 1 },
					{ name: 'Cook Mindfully', mode: 'build', frequency: 'weekly', weeklyTarget: 1 },
				{ name: 'Listen Without Fixing', mode: 'build', frequency: 'daily' },
				{ name: 'Compliment Someone', mode: 'build', frequency: 'daily' },
					{ name: 'Family Dinner', mode: 'build', frequency: 'weekly', weeklyTarget: 1 },
					{ name: 'Random Kindness', mode: 'build', frequency: 'weekly', weeklyTarget: 2 },
					{ name: 'Family Budget Review', mode: 'build', frequency: 'monthly', monthlyTarget: 1 },
				{ name: 'No Gossip', mode: 'break', frequency: 'daily' },
		],
	},
]

export default function Inspiration() {
	const addHabit = useHabitStore((s) => s.addHabit)
	const [recentlyAdded, setRecentlyAdded] = useState<string[]>([])

	const handleAdd = (h: HabitDef) => {
		// Map frequency and mode to store call; include monthlyTarget when relevant
		const freq = h.frequency
		const weekly = h.weeklyTarget ?? 1
		const monthly = h.monthlyTarget ?? 1
		// pass both targets; store will only persist the relevant one
		addHabit(h.name, freq as any, weekly, monthly, h.mode)
		// give quick visual feedback on the pill itself
		setRecentlyAdded((s) => [...s, h.name])
		setTimeout(() => setRecentlyAdded((s) => s.filter((n) => n !== h.name)), 1400)
	}

	return (
		<div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
					{/* Hero */}
					<section>
						<h2 className="text-xl font-semibold flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Inspiration</h2>
						<p className="mt-4 text-neutral-600 dark:text-neutral-300">Ritus isn’t about control. It’s about rhythm — the daily choices that quietly shape who you become. This page gathers small insights and examples to help you understand habits, build them with intention, and replace what holds you back.</p>
					</section>

					{/* How habits form */}
					<section>
						<h2 className="text-lg font-medium">How habits really form</h2>
						<p className="mt-2 text-neutral-600 dark:text-neutral-300">A habit isn’t a rule you follow — it’s a vote for the person you want to become. Consistency matters more than intensity: five minutes done every day beats an hour done once a week. Most habits fail because people expect motivation to last forever. But discipline isn’t about feeling ready — it’s about making action easier than resistance.</p>
						<div className="mt-4 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-3">
							<p className="text-sm italic text-center text-neutral-600 dark:text-neutral-300">“Make it obvious, make it easy, make it rewarding.” — three quiet laws of behavioral design.</p>
						</div>
					</section>

					{/* Why breaking habits */}
					<section>
						<h2 className="text-lg font-medium">Why breaking habits feels harder</h2>
						<p className="mt-2 text-neutral-600 dark:text-neutral-300">Bad habits often solve a real need — stress, comfort, boredom. That’s why willpower alone rarely works. To stop something, you have to replace it with something better. “Don’t scroll” becomes “go for a walk.” “Don’t drink” becomes “call a friend.” Every habit you break must make space for something gentler to take its place.</p>
					</section>

					{/* How to start new habits */}
					<section>
						<h2 className="text-lg font-medium">How to start new habits</h2>
						<ul className="mt-2 space-y-2 text-neutral-600 dark:text-neutral-300">
							<li>Start embarrassingly small. Do less than you think you should — consistency first, expansion later.</li>
							<li>Pair new with existing. Attach a habit to a trigger (“after coffee, I’ll stretch”).</li>
							<li>Forgive breaks. Missing one day doesn’t matter. Missing twice does.</li>
							<li>Track to remember, not to punish. The goal is awareness, not perfection.</li>
						</ul>
					</section>

					{/* Compass intro (replaces previous habit-sets intro) */}
					<section className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
						<h2 className="text-xl font-semibold flex items-center gap-2"><Compass className="w-5 h-5" /> The Compass</h2>
						<p className="mt-4 text-neutral-600 dark:text-neutral-300">Ritus is more than a tracker. It’s a way to stay oriented when life feels scattered. Over time, I noticed that my own habits follow a kind of compass — four directions that keep me balanced when I drift too far toward work, pressure, or noise. This isn’t a system or a rulebook. It’s just how I’ve learned to stay grounded. Maybe some of it will resonate with you, maybe not — and that’s perfectly fine.</p>
					</section>

			{COMPASS_SETS.map((set: any) => (
				<section key={set.dir}>
					<div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-black shadow-sm">
											<div>
												<h3 className="text-lg font-semibold flex items-center gap-2">
													<span className="text-xl text-neutral-600 dark:text-neutral-400">{set.arrow}</span>
													<span>{set.title}</span>
												</h3>
												<p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{set.note}</p>
												<p className="mt-2 italic text-xs text-neutral-500">{set.disclaimer}</p>
											</div>

									<div className="mt-4">
										<div className="flex flex-wrap gap-3 justify-center">
											{set.habits.map((h: any) => (
												<motion.button
														key={h.name}
														type="button"
														onClick={() => handleAdd(h)}
													className={`relative inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm transition-colors duration-150 transform-gpu align-middle ${h.mode === 'build' ? 'border-emerald-600 dark:border-emerald-500' : 'border-red-500 dark:border-red-500'} text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 ${recentlyAdded.includes(h.name) ? 'cursor-not-allowed' : ''}`}
														title={`${h.name} — ${h.mode} · ${h.frequency}`}
																			whileHover={{ scale: 1.05 }}
																			whileTap={{ scale: 0.95 }}
									transition={transitions.fadeSm}
													>
														<>
															{/* Keep name and frequency in DOM to preserve pill width; fade them when showing the added overlay */}
															<span className={`${recentlyAdded.includes(h.name) ? 'opacity-0' : 'opacity-100'} whitespace-normal leading-tight transition-opacity duration-150`}>{h.name}</span>
																														<span className={`${recentlyAdded.includes(h.name) ? 'opacity-0' : 'opacity-60'} text-[10px] ml-1 flex-none transition-opacity duration-150`}>{h.frequency === 'daily' ? 'D' : h.frequency === 'weekly' ? `W${h.weeklyTarget ? h.weeklyTarget : ''}` : `M${h.monthlyTarget ?? 1}`}</span>
																<AnimatePresence>
																	{recentlyAdded.includes(h.name) && (
																		<motion.span
																			initial={{ opacity: 0, scale: 0.98 }}
																			animate={{ opacity: 1, scale: 1 }}
																			exit={{ opacity: 0, scale: 0.98 }}
								transition={transitions.fadeSm}
																			className="absolute inset-0 flex items-center justify-center pointer-events-none text-neutral-800 dark:text-neutral-100"
																		>
																			<Check className="w-4 h-4 mr-1" />
																			<span className="text-sm">Added</span>
																		</motion.span>
																	)}
																</AnimatePresence>
														</>
													</motion.button>
												))}
							</div>
						</div>
					</div>
				</section>
			))}

			{/* Center Balance */}
			<section>
				<div className="text-center">
					<p className="italic text-neutral-500">Freedom without love turns into loneliness. Love without freedom turns into dependency. Growth without faith turns into burnout. Faith without growth turns into stagnation.</p>
				</div>
			</section>
		</div>
	)
}
