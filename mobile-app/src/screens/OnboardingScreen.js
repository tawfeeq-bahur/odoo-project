import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import { PrimaryButton, OutlineButton } from '../components/UIComponents';
import { ONBOARDING_SCENE_TYPES, ONBOARDING_INTERESTS } from '../utils/constants';

const TOTAL_STEPS = 8;

const TRAVEL_FREQ = ['Rarely', '1-2/year', '3-5/year', '6+/year'];
const GROUP_TYPES = ['Solo 🧑', 'Couple 💑', 'Friends 👥', 'Family 👨‍👩‍👧', 'Corporate 💼'];
const BUDGETS = ['Budget (<₹5k)', 'Mid (₹5k-15k)', 'Comfort (₹15k-30k)', 'Luxury (₹30k+)'];
const PACE = ['Relaxed', 'Moderate', 'Fast-paced', 'Spontaneous'];
const TIME = ['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec', 'Any time'];

export default function OnboardingScreen({ navigation }) {
  const { savePreferences } = useAuth();
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState({
    sceneTypes: [],
    travelFrequency: '',
    groupType: '',
    budgetRange: '',
    interests: [],
    travelPace: '',
    preferredTime: '',
    dreamDestinations: '',
  });

  const toggle = (key, value) => {
    setPrefs((p) => {
      const arr = p[key];
      return {
        ...p,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };
  const pick = (key, value) => setPrefs((p) => ({ ...p, [key]: value }));

  const handleFinish = async () => {
    await savePreferences(prefs);
    // Navigate to main app (AuthContext sets user, AppNavigator will auto-switch)
    // We navigate to the main tab — onboarding is complete
  };

  const canProceed = () => {
    switch (step) {
      case 1: return prefs.sceneTypes.length > 0;
      case 2: return !!prefs.travelFrequency;
      case 3: return !!prefs.groupType;
      case 4: return !!prefs.budgetRange;
      case 5: return prefs.interests.length > 0;
      case 6: return !!prefs.travelPace;
      case 7: return !!prefs.preferredTime;
      case 8: return true;
      default: return true;
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{step} / {TOTAL_STEPS}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <StepContent step={step} prefs={prefs} toggle={toggle} pick={pick} />
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <OutlineButton title="Back" onPress={() => setStep(s => s - 1)} style={styles.footerBtn} />
        )}
        {step < TOTAL_STEPS ? (
          <PrimaryButton
            title="Next"
            onPress={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            style={styles.footerBtnPrimary}
          />
        ) : (
          <PrimaryButton
            title="🚀 Start Exploring"
            onPress={handleFinish}
            style={styles.footerBtnPrimary}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function StepContent({ step, prefs, toggle, pick }) {
  const renderChips = (options, selectedArr, onToggle) => (
    <View style={styles.chips}>
      {options.map((opt) => {
        const selected = selectedArr.includes(typeof opt === 'string' ? opt : opt.id);
        const val = typeof opt === 'string' ? opt : opt.id;
        const label = typeof opt === 'string' ? opt : opt.label;
        return (
          <TouchableOpacity
            key={val}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onToggle(val)}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderSingle = (options, selected, onPick) => (
    <View style={styles.chips}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, selected === opt && styles.chipSelected]}
          onPress={() => onPick(opt)}
        >
          <Text style={[styles.chipText, selected === opt && styles.chipTextSelected]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const steps = [
    {
      title: 'What scenes excite you?',
      sub: 'Select all that apply',
      content: renderChips(ONBOARDING_SCENE_TYPES, prefs.sceneTypes, (v) => toggle('sceneTypes', v)),
    },
    {
      title: 'How often do you travel?',
      sub: 'Choose one',
      content: renderSingle(TRAVEL_FREQ, prefs.travelFrequency, (v) => pick('travelFrequency', v)),
    },
    {
      title: 'Who do you travel with?',
      sub: 'Choose one',
      content: renderSingle(GROUP_TYPES, prefs.groupType, (v) => pick('groupType', v)),
    },
    {
      title: "What's your budget range?",
      sub: 'Per person, per trip',
      content: renderSingle(BUDGETS, prefs.budgetRange, (v) => pick('budgetRange', v)),
    },
    {
      title: 'Your interests?',
      sub: 'Select all that apply',
      content: renderChips(ONBOARDING_INTERESTS, prefs.interests, (v) => toggle('interests', v)),
    },
    {
      title: 'Travel pace?',
      sub: 'How do you like to travel?',
      content: renderSingle(PACE, prefs.travelPace, (v) => pick('travelPace', v)),
    },
    {
      title: 'Best time to travel?',
      sub: 'Pick a season or anytime',
      content: renderSingle(TIME, prefs.preferredTime, (v) => pick('preferredTime', v)),
    },
    {
      title: "✈️ Dream Destinations",
    sub: "Tell us where you've always wanted to go",
      content: (
        <TextInput
          style={styles.textArea}
          value={prefs.dreamDestinations}
          onChangeText={(v) => pick('dreamDestinations', v)}
          placeholder="e.g. Maldives, Ladakh, Paris…"
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={4}
          autoCapitalize="words"
        />
      ),
    },
  ];

  const s = steps[step - 1];
  return (
    <View style={styles.stepBox}>
      <Text style={styles.stepTitle}>{s.title}</Text>
      <Text style={styles.stepSub}>{s.sub}</Text>
      {s.content}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  progressContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.base,
    paddingBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  progressTrack: { flex: 1, height: 6, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.full },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.full },
  progressText: { color: COLORS.textSecondary, fontSize: FONTS.xs, minWidth: 36, textAlign: 'right' },
  scroll: { padding: SPACING.xl },
  stepBox: {},
  stepTitle: { fontSize: FONTS['2xl'], fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  stepSub: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginBottom: SPACING.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600' },
  chipTextSelected: { color: COLORS.white },
  textArea: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONTS.base,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.xl,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  footerBtn: { flex: 1 },
  footerBtnPrimary: { flex: 2 },
});
