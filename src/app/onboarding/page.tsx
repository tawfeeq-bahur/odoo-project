'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSharedState } from '@/components/AppLayout';
import type { TravelPreferences } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Trees,
  Building2,
  Route,
  Waves,
  Mountain,
  Sun,
  Landmark,
  Binoculars,
  Timer,
  CalendarDays,
  Globe,
  Backpack,
  Users,
  UserRound,
  Heart,
  School,
  Wallet,
  CreditCard,
  Gem,
  Utensils,
  Zap,
  BookOpen,
  ShoppingBag,
  PawPrint,
  Camera,
  Star,
  Dumbbell,
  Turtle,
  Gauge,
  Rocket,
  CloudSun,
  Moon,
  SunMoon,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type SceneType = TravelPreferences['sceneTypes'][number];
type InterestType = TravelPreferences['interests'][number];

// ─── Option cards helper ──────────────────────────────────────────────────────

interface OptionCard<T extends string> {
  value: T;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

// ─── Step definitions ─────────────────────────────────────────────────────────

const SCENE_OPTIONS: OptionCard<SceneType>[] = [
  { value: 'greenery', label: 'Greenery & Forests', description: 'Lush forests, tea estates, jungle treks', icon: Trees, color: 'bg-green-500/10 border-green-400 text-green-600 dark:text-green-400' },
  { value: 'cities', label: 'Cities & Urban', description: 'Skylines, street food, nightlife', icon: Building2, color: 'bg-blue-500/10 border-blue-400 text-blue-600 dark:text-blue-400' },
  { value: 'roadways', label: 'Scenic Roadways', description: 'Highway drives, ghats, road trips', icon: Route, color: 'bg-orange-500/10 border-orange-400 text-orange-600 dark:text-orange-400' },
  { value: 'beaches', label: 'Beaches & Coasts', description: 'Sunsets, sand, coastal vibes', icon: Waves, color: 'bg-cyan-500/10 border-cyan-400 text-cyan-600 dark:text-cyan-400' },
  { value: 'mountains', label: 'Mountains & Peaks', description: 'Trekking, snow, clear air', icon: Mountain, color: 'bg-slate-500/10 border-slate-400 text-slate-600 dark:text-slate-400' },
  { value: 'deserts', label: 'Deserts & Dunes', description: 'Golden sands, starry nights, camels', icon: Sun, color: 'bg-yellow-500/10 border-yellow-400 text-yellow-600 dark:text-yellow-400' },
  { value: 'heritage', label: 'Heritage & History', description: 'Forts, temples, ancient ruins', icon: Landmark, color: 'bg-amber-500/10 border-amber-400 text-amber-600 dark:text-amber-400' },
  { value: 'nature', label: 'Nature & Wildlife', description: 'National parks, birds, safaris', icon: Binoculars, color: 'bg-emerald-500/10 border-emerald-400 text-emerald-600 dark:text-emerald-400' },
];

const FREQUENCY_OPTIONS: OptionCard<TravelPreferences['travelFrequency']>[] = [
  { value: 'daily', label: 'Daily Explorer', description: 'Local places, short rides, everyday adventure', icon: Timer, color: 'bg-pink-500/10 border-pink-400 text-pink-600 dark:text-pink-400' },
  { value: 'weekends', label: 'Weekend Warrior', description: 'Quick 2-day getaways every weekend', icon: CalendarDays, color: 'bg-purple-500/10 border-purple-400 text-purple-600 dark:text-purple-400' },
  { value: 'monthly', label: 'Monthly Adventurer', description: 'One solid trip per month', icon: Globe, color: 'bg-indigo-500/10 border-indigo-400 text-indigo-600 dark:text-indigo-400' },
  { value: 'long-haul', label: 'Long-Haul Traveller', description: 'Big multi-week journeys', icon: Backpack, color: 'bg-rose-500/10 border-rose-400 text-rose-600 dark:text-rose-400' },
];

const GROUP_OPTIONS: OptionCard<TravelPreferences['groupType']>[] = [
  { value: 'solo', label: 'Solo', description: 'Just me, myself & I', icon: UserRound, color: 'bg-violet-500/10 border-violet-400 text-violet-600 dark:text-violet-400' },
  { value: 'friends', label: 'Friends Gang', description: 'Loud, fun, unforgettable', icon: Users, color: 'bg-orange-500/10 border-orange-400 text-orange-600 dark:text-orange-400' },
  { value: 'family', label: 'Family Trip', description: 'All generations on the road', icon: Heart, color: 'bg-red-500/10 border-red-400 text-red-600 dark:text-red-400' },
  { value: 'couple', label: 'Couple', description: 'Romantic & cozy escapes', icon: Heart, color: 'bg-pink-500/10 border-pink-400 text-pink-600 dark:text-pink-400' },
  { value: 'school', label: 'School / College', description: 'Educational tours & outings', icon: School, color: 'bg-teal-500/10 border-teal-400 text-teal-600 dark:text-teal-400' },
];

const BUDGET_OPTIONS: OptionCard<TravelPreferences['budgetRange']>[] = [
  { value: 'budget', label: 'Budget Explorer', description: 'Under ₹5,000 per trip', icon: Wallet, color: 'bg-lime-500/10 border-lime-400 text-lime-600 dark:text-lime-400' },
  { value: 'mid-range', label: 'Mid-Range', description: '₹5,000 – ₹25,000 per trip', icon: CreditCard, color: 'bg-sky-500/10 border-sky-400 text-sky-600 dark:text-sky-400' },
  { value: 'luxury', label: 'Luxury Traveller', description: '₹25,000+ per trip, no compromises', icon: Gem, color: 'bg-fuchsia-500/10 border-fuchsia-400 text-fuchsia-600 dark:text-fuchsia-400' },
];

const INTEREST_OPTIONS: OptionCard<InterestType>[] = [
  { value: 'food', label: 'Food & Cuisine', description: 'Local dishes, street food tour', icon: Utensils, color: 'bg-orange-500/10 border-orange-400 text-orange-600 dark:text-orange-400' },
  { value: 'adventure', label: 'Adventure Sports', description: 'Trekking, rafting, paragliding', icon: Zap, color: 'bg-yellow-500/10 border-yellow-400 text-yellow-600 dark:text-yellow-400' },
  { value: 'culture', label: 'Culture & History', description: 'Museums, temples, festivals', icon: BookOpen, color: 'bg-amber-500/10 border-amber-400 text-amber-600 dark:text-amber-400' },
  { value: 'shopping', label: 'Shopping', description: 'Local markets, handicrafts', icon: ShoppingBag, color: 'bg-pink-500/10 border-pink-400 text-pink-600 dark:text-pink-400' },
  { value: 'wildlife', label: 'Wildlife & Safari', description: 'Animals, birds, national parks', icon: PawPrint, color: 'bg-green-500/10 border-green-400 text-green-600 dark:text-green-400' },
  { value: 'photography', label: 'Photography', description: 'Golden hours, landscapes, portraits', icon: Camera, color: 'bg-slate-500/10 border-slate-400 text-slate-600 dark:text-slate-400' },
  { value: 'spiritual', label: 'Spiritual', description: 'Temples, pilgrimages, meditation', icon: Star, color: 'bg-indigo-500/10 border-indigo-400 text-indigo-600 dark:text-indigo-400' },
  { value: 'sports', label: 'Sports', description: 'Cycling, cricket grounds, arenas', icon: Dumbbell, color: 'bg-cyan-500/10 border-cyan-400 text-cyan-600 dark:text-cyan-400' },
];

const PACE_OPTIONS: OptionCard<TravelPreferences['travelPace']>[] = [
  { value: 'relaxed', label: 'Relaxed', description: 'Slow down, breathe, soak it all in', icon: Turtle, color: 'bg-teal-500/10 border-teal-400 text-teal-600 dark:text-teal-400' },
  { value: 'moderate', label: 'Moderate', description: 'Balanced — see the highlights, have downtime', icon: Gauge, color: 'bg-blue-500/10 border-blue-400 text-blue-600 dark:text-blue-400' },
  { value: 'fast-paced', label: 'Fast-Paced', description: 'See every corner, maximise every day', icon: Rocket, color: 'bg-red-500/10 border-red-400 text-red-600 dark:text-red-400' },
];

const TIME_OPTIONS: OptionCard<TravelPreferences['preferredTime']>[] = [
  { value: 'day', label: 'Daytime', description: 'Morning starts, sunny adventures', icon: CloudSun, color: 'bg-yellow-500/10 border-yellow-400 text-yellow-600 dark:text-yellow-400' },
  { value: 'night', label: 'Night Journeys', description: 'Overnight trains, moonlit drives', icon: Moon, color: 'bg-indigo-500/10 border-indigo-400 text-indigo-600 dark:text-indigo-400' },
  { value: 'both', label: 'Both Work Fine', description: 'Flexible, I go whenever!', icon: SunMoon, color: 'bg-purple-500/10 border-purple-400 text-purple-600 dark:text-purple-400' },
];

// ─── Reusable single-select card ──────────────────────────────────────────────

function SingleSelectCard<T extends string>({
  option,
  selected,
  onSelect,
}: {
  option: OptionCard<T>;
  selected: boolean;
  onSelect: (v: T) => void;
}) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(option.value)}
      className={cn(
        'relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all hover:scale-[1.02]',
        option.color,
        selected ? 'ring-2 ring-offset-2 ring-primary scale-[1.02] border-primary' : 'border-border',
      )}
    >
      {selected && (
        <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
      )}
      <Icon className="h-6 w-6" />
      <span className="font-semibold text-sm leading-tight">{option.label}</span>
      <span className="text-xs text-muted-foreground leading-snug">{option.description}</span>
    </button>
  );
}

// ─── Reusable multi-select card ───────────────────────────────────────────────

function MultiSelectCard<T extends string>({
  option,
  selected,
  onToggle,
}: {
  option: OptionCard<T>;
  selected: boolean;
  onToggle: (v: T) => void;
}) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={() => onToggle(option.value)}
      className={cn(
        'relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all hover:scale-[1.02]',
        option.color,
        selected ? 'ring-2 ring-offset-2 ring-primary scale-[1.02] border-primary' : 'border-border',
      )}
    >
      {selected && (
        <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
      )}
      <Icon className="h-6 w-6" />
      <span className="font-semibold text-sm leading-tight">{option.label}</span>
      <span className="text-xs text-muted-foreground leading-snug">{option.description}</span>
    </button>
  );
}

// ─── Steps metadata ────────────────────────────────────────────────────────────

const STEPS = [
  { title: 'What scenery speaks to you?', subtitle: 'Pick all that give you that travel feeling ✨', multi: true },
  { title: 'How often do you travel?', subtitle: 'Your travel frequency tells us a lot', multi: false },
  { title: 'Who do you travel with?', subtitle: 'Your squad changes everything', multi: false },
  { title: "What's your budget vibe?", subtitle: 'No judgment — just better suggestions!', multi: false },
  { title: 'What are your travel interests?', subtitle: 'Pick everything that excites you', multi: true },
  { title: "What's your travel pace?", subtitle: 'How fast do you like to move?', multi: false },
  { title: 'When do you prefer to travel?', subtitle: 'Morning glory or midnight road-tripper?', multi: false },
  { title: 'Dream destinations & special notes', subtitle: 'Anything special AI should know about you?', multi: false },
];

// ─── Main Component ────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { savePreferences } = useSharedState();

  const [step, setStep] = useState(0);
  const [sceneTypes, setSceneTypes] = useState<SceneType[]>([]);
  const [travelFrequency, setTravelFrequency] = useState<TravelPreferences['travelFrequency'] | ''>('');
  const [groupType, setGroupType] = useState<TravelPreferences['groupType'] | ''>('');
  const [budgetRange, setBudgetRange] = useState<TravelPreferences['budgetRange'] | ''>('');
  const [interests, setInterests] = useState<InterestType[]>([]);
  const [travelPace, setTravelPace] = useState<TravelPreferences['travelPace'] | ''>('');
  const [preferredTime, setPreferredTime] = useState<TravelPreferences['preferredTime'] | ''>('');
  const [dreamDestinations, setDreamDestinations] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const totalSteps = STEPS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const toggleScene = (v: SceneType) =>
    setSceneTypes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const toggleInterest = (v: InterestType) =>
    setInterests(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const canProceed = () => {
    if (step === 0) return sceneTypes.length > 0;
    if (step === 1) return travelFrequency !== '';
    if (step === 2) return groupType !== '';
    if (step === 3) return budgetRange !== '';
    if (step === 4) return interests.length > 0;
    if (step === 5) return travelPace !== '';
    if (step === 6) return preferredTime !== '';
    return true; // step 7 is optional free text
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    const prefs: TravelPreferences = {
      sceneTypes,
      travelFrequency: travelFrequency as TravelPreferences['travelFrequency'],
      groupType: groupType as TravelPreferences['groupType'],
      budgetRange: budgetRange as TravelPreferences['budgetRange'],
      interests,
      travelPace: travelPace as TravelPreferences['travelPace'],
      preferredTime: preferredTime as TravelPreferences['preferredTime'],
      dreamDestinations,
      specialNotes,
    };
    savePreferences(prefs);
    setDone(true);
    setTimeout(() => router.push('/login'), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-start justify-center p-4 py-10">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-widest">AI Personalisation</span>
          </div>
          <h1 className="text-3xl font-bold mb-1">Let's know you better</h1>
          <p className="text-muted-foreground text-sm">
            Answer {totalSteps} quick questions — our AI will tailor everything for you
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 h-1 rounded-full transition-colors',
                  i < step ? 'bg-primary' : i === step ? 'bg-primary/60' : 'bg-muted',
                )}
              />
            ))}
          </div>
        </div>

        {/* Done screen */}
        {done ? (
          <Card className="border-2 shadow-xl">
            <CardContent className="py-16 flex flex-col items-center gap-4">
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              <h2 className="text-2xl font-bold">All set!</h2>
              <p className="text-muted-foreground text-center">
                Your travel personality is saved. AI will now personalise every suggestion for you.
              </p>
              <p className="text-sm text-muted-foreground">Redirecting to login…</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 shadow-xl">
            <CardContent className="pt-8 pb-6 px-6 space-y-6">
              {/* Step heading */}
              <div>
                <h2 className="text-xl font-bold">{STEPS[step].title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{STEPS[step].subtitle}</p>
                {STEPS[step].multi && (
                  <Badge variant="outline" className="mt-2 text-xs">Select multiple</Badge>
                )}
              </div>

              {/* Step 0 — Scene types */}
              {step === 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SCENE_OPTIONS.map(opt => (
                    <MultiSelectCard
                      key={opt.value}
                      option={opt}
                      selected={sceneTypes.includes(opt.value)}
                      onToggle={toggleScene}
                    />
                  ))}
                </div>
              )}

              {/* Step 1 — Frequency */}
              {step === 1 && (
                <div className="grid grid-cols-2 gap-3">
                  {FREQUENCY_OPTIONS.map(opt => (
                    <SingleSelectCard
                      key={opt.value}
                      option={opt}
                      selected={travelFrequency === opt.value}
                      onSelect={setTravelFrequency}
                    />
                  ))}
                </div>
              )}

              {/* Step 2 — Group type */}
              {step === 2 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {GROUP_OPTIONS.map(opt => (
                    <SingleSelectCard
                      key={opt.value}
                      option={opt}
                      selected={groupType === opt.value}
                      onSelect={setGroupType}
                    />
                  ))}
                </div>
              )}

              {/* Step 3 — Budget */}
              {step === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BUDGET_OPTIONS.map(opt => (
                    <SingleSelectCard
                      key={opt.value}
                      option={opt}
                      selected={budgetRange === opt.value}
                      onSelect={setBudgetRange}
                    />
                  ))}
                </div>
              )}

              {/* Step 4 — Interests */}
              {step === 4 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {INTEREST_OPTIONS.map(opt => (
                    <MultiSelectCard
                      key={opt.value}
                      option={opt}
                      selected={interests.includes(opt.value)}
                      onToggle={toggleInterest}
                    />
                  ))}
                </div>
              )}

              {/* Step 5 — Pace */}
              {step === 5 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PACE_OPTIONS.map(opt => (
                    <SingleSelectCard
                      key={opt.value}
                      option={opt}
                      selected={travelPace === opt.value}
                      onSelect={setTravelPace}
                    />
                  ))}
                </div>
              )}

              {/* Step 6 — Preferred time */}
              {step === 6 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TIME_OPTIONS.map(opt => (
                    <SingleSelectCard
                      key={opt.value}
                      option={opt}
                      selected={preferredTime === opt.value}
                      onSelect={setPreferredTime}
                    />
                  ))}
                </div>
              )}

              {/* Step 7 — Free text */}
              {step === 7 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Dream destinations</label>
                    <Textarea
                      placeholder="E.g. Ladakh, Bali, Munnar, Kashmir, Paris…"
                      className="min-h-[80px] resize-none"
                      value={dreamDestinations}
                      onChange={e => setDreamDestinations(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Anything special the AI should know?</label>
                    <Textarea
                      placeholder="E.g. I'm vegetarian, I can't handle cold weather, I prefer window seats…"
                      className="min-h-[80px] resize-none"
                      value={specialNotes}
                      onChange={e => setSpecialNotes(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This is optional but helps our AI give you hyper-personalised suggestions.
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={() => setStep(s => s - 1)}
                  disabled={step === 0}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || saving}
                  className="gap-1 px-6"
                >
                  {saving ? 'Saving…' : step === totalSteps - 1 ? (
                    <><Sparkles className="h-4 w-4" /> Finish & Start Exploring</>
                  ) : (
                    <>Next <ChevronRight className="h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skip link */}
        {!done && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Skip for now — I'll personalise later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
