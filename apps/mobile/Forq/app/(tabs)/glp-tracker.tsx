import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { useGlp } from '@/context/GlpContext';
import Slider from '@react-native-community/slider';
import * as NotificationService from '@/services/notificationService';

const SIDE_EFFECTS = [
  { name: 'Nausea', icon: 'water' },
  { name: 'Vomiting', icon: 'warning' },
  { name: 'Constipation', icon: 'alert-circle' },
  { name: 'Diarrhea', icon: 'flash' },
  { name: 'Fatigue', icon: 'moon' },
  { name: 'Headache', icon: 'thunderstorm' },
  { name: 'Dizziness', icon: 'reload' },
  { name: 'Heartburn', icon: 'flame' },
];

const EDUCATION_TIPS = [
  {
    id: '1',
    title: "What's Normal",
    content: 'Mild nausea and reduced appetite are common, especially in the first few weeks. These often improve as your body adjusts.',
    category: 'normal' as const,
    icon: 'information-circle',
  },
  {
    id: '2',
    title: 'Eating Tips',
    content: 'Eat smaller, more frequent meals. Avoid fatty, fried, or sugary foods. Stay well-hydrated throughout the day.',
    category: 'eating' as const,
    icon: 'restaurant',
  },
  {
    id: '3',
    title: 'Managing Side Effects',
    content: 'Take medication at bedtime to sleep through nausea. Ginger tea and bland foods can help with stomach discomfort.',
    category: 'side-effects' as const,
    icon: 'medkit',
  },
  {
    id: '4',
    title: 'Hydration is Key',
    content: 'Drink plenty of water throughout the day. Dehydration can worsen side effects and slow weight loss progress.',
    category: 'general' as const,
    icon: 'water',
  },
  {
    id: '5',
    title: 'Protein Priority',
    content: 'Focus on protein-rich foods to maintain muscle mass. Aim for lean meats, fish, eggs, and Greek yogurt.',
    category: 'eating' as const,
    icon: 'nutrition',
  },
];

const RED_FLAG_SYMPTOMS = [
  'Severe abdominal pain',
  'Persistent vomiting (>24 hours)',
  'Signs of pancreatitis (severe upper stomach pain)',
  'Vision changes',
  'Fast heartbeat or palpitations',
  'Severe allergic reaction (rash, difficulty breathing)',
  'Signs of thyroid tumor (lump in neck, hoarseness)',
  'Suicidal thoughts or severe depression',
];

export default function GlpTrackerScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const {
    medicationInfo,
    setMedicationInfo,
    doseHistory,
    recordDose,
    getLastDose,
    getNextDoseDate,
    getDaysUntilNextDose,
    sideEffects,
    recordSideEffect,
    getTodaysSideEffects,
    appetiteLogs,
    recordAppetite,
    getTodaysAppetite,
    weightEntries,
    recordWeight,
    getWeeklyWeightTrend,
    getWeightChange,
    doseProgression,
    getCurrentPhase,
    notificationsEnabled,
    setNotificationsEnabled,
    loading,
  } = useGlp();

  const [showMedicationSetup, setShowMedicationSetup] = useState(false);
  const [showDoseTaken, setShowDoseTaken] = useState(false);
  const [showSideEffects, setShowSideEffects] = useState(false);
  const [showAppetiteLog, setShowAppetiteLog] = useState(false);
  const [showWeightEntry, setShowWeightEntry] = useState(false);
  const [showSafetyAlert, setShowSafetyAlert] = useState(false);

  // Medication setup form
  const [medName, setMedName] = useState(medicationInfo?.name || '');
  const [medDose, setMedDose] = useState(medicationInfo?.currentDose || '');
  const [medDay, setMedDay] = useState(medicationInfo?.injectionDay || 'Every 7 days');

  // Dose confirmation
  const [doseNotes, setDoseNotes] = useState('');

  // Side effects
  const [selectedEffect, setSelectedEffect] = useState('');
  const [effectSeverity, setEffectSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [effectNotes, setEffectNotes] = useState('');

  // Appetite
  const [hungerLevel, setHungerLevel] = useState(5);
  const [cravingsLevel, setCravingsLevel] = useState(5);
  const [appetiteNotes, setAppetiteNotes] = useState('');

  // Weight
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');

  const lastDose = getLastDose();
  const nextDoseDate = getNextDoseDate();
  const daysUntilNext = getDaysUntilNextDose();
  const todaysSideEffects = getTodaysSideEffects();
  const todaysAppetite = getTodaysAppetite();
  const weeklyWeights = getWeeklyWeightTrend();
  const weightChange = getWeightChange();
  const currentPhase = getCurrentPhase();

  const handleSaveMedication = async () => {
    if (!medName || !medDose || !medDay) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    await setMedicationInfo({
      name: medName,
      currentDose: medDose,
      injectionDay: medDay,
      startDate: new Date(),
    });

    setShowMedicationSetup(false);
  };

  const handleRecordDose = async () => {
    if (!medicationInfo) return;

    await recordDose(medicationInfo.currentDose, doseNotes);
    setDoseNotes('');
    setShowDoseTaken(false);
    Alert.alert('Success', 'Dose recorded successfully!');
  };

  const handleRecordSideEffect = async () => {
    if (!selectedEffect) {
      Alert.alert('Error', 'Please select a side effect');
      return;
    }

    await recordSideEffect(selectedEffect, effectSeverity, effectNotes);
    setSelectedEffect('');
    setEffectSeverity('mild');
    setEffectNotes('');
    setShowSideEffects(false);
  };

  const handleRecordAppetite = async () => {
    await recordAppetite(hungerLevel, cravingsLevel, appetiteNotes);
    setAppetiteNotes('');
    setShowAppetiteLog(false);
  };

  const handleRecordWeight = async () => {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    await recordWeight(weightNum, weightUnit);
    setWeight('');
    setShowWeightEntry(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return '#10B981';
      case 'moderate': return '#F59E0B';
      case 'severe': return '#EF4444';
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>GLP-1 Tracker</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your medication journey
        </Text>
      </View>

      {/* Setup prompt if no medication info */}
      {!medicationInfo && (
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="medkit-outline" size={48} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Set Up Your Medication</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Add your GLP-1 medication details to start tracking
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowMedicationSetup(true)}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main content when medication is set up */}
      {medicationInfo && (
        <View style={styles.content}>
          {/* Medication Info Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Medication & Dose</Text>
              <TouchableOpacity onPress={() => setShowMedicationSetup(true)}>
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.medicationInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="medical" size={20} color={colors.primary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Medication:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{medicationInfo.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="flask" size={20} color={colors.primary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Current Dose:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{medicationInfo.currentDose}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Schedule:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{medicationInfo.injectionDay}</Text>
              </View>
            </View>
          </View>

          {/* Dose Countdown Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Dose Schedule</Text>

            {lastDose ? (
              <View style={styles.doseInfo}>
                <View style={styles.doseItem}>
                  <Text style={[styles.doseLabel, { color: colors.textSecondary }]}>Last Dose</Text>
                  <Text style={[styles.doseValue, { color: colors.text }]}>
                    {formatDateTime(lastDose.timestamp)}
                  </Text>
                  <Text style={[styles.doseDetail, { color: colors.textSecondary }]}>
                    {lastDose.dose}
                  </Text>
                </View>

                {nextDoseDate && daysUntilNext !== null && (
                  <View style={styles.doseItem}>
                    <Text style={[styles.doseLabel, { color: colors.textSecondary }]}>Next Dose</Text>
                    <Text style={[styles.doseValue, { color: colors.text }]}>
                      {formatDate(nextDoseDate)}
                    </Text>
                    <View style={styles.countdown}>
                      <Text style={[styles.countdownNumber, { color: colors.primary }]}>
                        {daysUntilNext}
                      </Text>
                      <Text style={[styles.countdownLabel, { color: colors.textSecondary }]}>
                        days
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No doses recorded yet
              </Text>
            )}

            <TouchableOpacity
              style={[styles.takeDoseButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowDoseTaken(true)}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.takeDoseButtonText}>Dose Taken</Text>
            </TouchableOpacity>

            {/* Notification Toggle */}
            <View style={styles.notificationToggle}>
              <View style={styles.notificationInfo}>
                <Ionicons name="notifications" size={20} color={colors.text} />
                <Text style={[styles.notificationLabel, { color: colors.text }]}>
                  Dose Reminders
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  { backgroundColor: notificationsEnabled ? colors.primary : colors.border },
                ]}
                onPress={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    { transform: [{ translateX: notificationsEnabled ? 20 : 0 }] },
                  ]}
                />
              </TouchableOpacity>
            </View>

            {/* Test Notification Button (Development) */}
            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={async () => {
                try {
                  await NotificationService.scheduleTestNotification();
                  Alert.alert(
                    'Test Scheduled',
                    'A test notification will appear in 5 seconds!',
                    [{ text: 'OK' }]
                  );
                } catch (error) {
                  Alert.alert('Error', 'Failed to schedule test notification');
                  console.error('Test notification error:', error);
                }
              }}
            >
              <Ionicons name="flask" size={16} color={colors.text} />
              <Text style={[styles.testButtonText, { color: colors.text }]}>
                Test Notification
              </Text>
            </TouchableOpacity>
          </View>

          {/* Side Effects Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Side Effects</Text>
              <TouchableOpacity onPress={() => setShowSideEffects(true)}>
                <Ionicons name="add-circle" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {todaysSideEffects.length > 0 ? (
              <View style={styles.sideEffectsList}>
                {todaysSideEffects.map((effect) => (
                  <View key={effect.id} style={styles.sideEffectItem}>
                    <View style={styles.sideEffectInfo}>
                      <Text style={[styles.sideEffectName, { color: colors.text }]}>
                        {effect.name}
                      </Text>
                      <Text style={[styles.sideEffectTime, { color: colors.textSecondary }]}>
                        {formatDateTime(effect.timestamp)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.severityBadge,
                        { backgroundColor: getSeverityColor(effect.severity) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.severityText,
                          { color: getSeverityColor(effect.severity) },
                        ]}
                      >
                        {effect.severity}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No side effects recorded today
              </Text>
            )}

            <View style={styles.sideEffectsGrid}>
              {SIDE_EFFECTS.slice(0, 4).map((effect) => (
                <TouchableOpacity
                  key={effect.name}
                  style={[styles.quickEffectButton, { backgroundColor: colors.background }]}
                  onPress={() => {
                    setSelectedEffect(effect.name);
                    setShowSideEffects(true);
                  }}
                >
                  <Ionicons name={effect.icon as any} size={20} color={colors.primary} />
                  <Text style={[styles.quickEffectText, { color: colors.text }]}>
                    {effect.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Appetite & Hunger Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Appetite & Hunger</Text>
              <TouchableOpacity onPress={() => setShowAppetiteLog(true)}>
                <Ionicons name="add-circle" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {todaysAppetite ? (
              <View style={styles.appetiteInfo}>
                <View style={styles.appetiteRow}>
                  <Text style={[styles.appetiteLabel, { color: colors.textSecondary }]}>
                    Hunger Level
                  </Text>
                  <View style={styles.appetiteBar}>
                    <View
                      style={[
                        styles.appetiteBarFill,
                        {
                          backgroundColor: colors.primary,
                          width: `${(todaysAppetite.hungerLevel / 10) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.appetiteValue, { color: colors.text }]}>
                    {todaysAppetite.hungerLevel}/10
                  </Text>
                </View>
                <View style={styles.appetiteRow}>
                  <Text style={[styles.appetiteLabel, { color: colors.textSecondary }]}>
                    Cravings
                  </Text>
                  <View style={styles.appetiteBar}>
                    <View
                      style={[
                        styles.appetiteBarFill,
                        {
                          backgroundColor: '#F59E0B',
                          width: `${(todaysAppetite.cravingsIntensity / 10) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.appetiteValue, { color: colors.text }]}>
                    {todaysAppetite.cravingsIntensity}/10
                  </Text>
                </View>
                <Text style={[styles.loggedTime, { color: colors.textSecondary }]}>
                  Logged {formatDateTime(todaysAppetite.timestamp)}
                </Text>
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No appetite logged today
              </Text>
            )}
          </View>

          {/* Weight & Progress Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Weight & Progress</Text>
              <TouchableOpacity onPress={() => setShowWeightEntry(true)}>
                <Ionicons name="add-circle" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {weightEntries.length > 0 ? (
              <View style={styles.weightInfo}>
                <View style={styles.currentWeight}>
                  <Text style={[styles.weightLabel, { color: colors.textSecondary }]}>
                    Current Weight
                  </Text>
                  <Text style={[styles.weightValue, { color: colors.text }]}>
                    {weightEntries[0].weight} {weightEntries[0].unit}
                  </Text>
                  <Text style={[styles.weightDate, { color: colors.textSecondary }]}>
                    {formatDate(weightEntries[0].timestamp)}
                  </Text>
                </View>

                {weightChange && (
                  <View style={styles.weightChange}>
                    <View style={styles.changeItem}>
                      <Text style={[styles.changeLabel, { color: colors.textSecondary }]}>
                        Total Change
                      </Text>
                      <Text
                        style={[
                          styles.changeValue,
                          {
                            color: weightChange.amount < 0 ? '#10B981' : '#EF4444',
                          },
                        ]}
                      >
                        {weightChange.amount > 0 ? '+' : ''}
                        {weightChange.amount.toFixed(1)} {weightEntries[0].unit}
                      </Text>
                    </View>
                    <View style={styles.changeItem}>
                      <Text style={[styles.changeLabel, { color: colors.textSecondary }]}>
                        % Change
                      </Text>
                      <Text
                        style={[
                          styles.changeValue,
                          {
                            color: weightChange.percentage < 0 ? '#10B981' : '#EF4444',
                          },
                        ]}
                      >
                        {weightChange.percentage > 0 ? '+' : ''}
                        {weightChange.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                )}

                {weeklyWeights.length > 1 && (
                  <View style={styles.weeklyTrend}>
                    <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>
                      Last 7 Days
                    </Text>
                    <View style={styles.trendChart}>
                      {weeklyWeights.reverse().map((entry, index) => {
                        const maxWeight = Math.max(...weeklyWeights.map((e) => e.weight));
                        const minWeight = Math.min(...weeklyWeights.map((e) => e.weight));
                        const range = maxWeight - minWeight || 1;
                        const height = ((entry.weight - minWeight) / range) * 60 + 20;

                        return (
                          <View key={entry.id} style={styles.trendBar}>
                            <View
                              style={[
                                styles.trendBarFill,
                                {
                                  height,
                                  backgroundColor: colors.primary,
                                },
                              ]}
                            />
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No weight entries yet
              </Text>
            )}
          </View>

          {/* Dose Progression Card */}
          {doseProgression.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Dose Progression</Text>
              <View style={styles.progressionTimeline}>
                {doseProgression.map((phase, index) => (
                  <View key={phase.phase} style={styles.timelineItem}>
                    <View style={styles.timelineMarker}>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor:
                              phase.status === 'current'
                                ? colors.primary
                                : phase.status === 'completed'
                                  ? '#10B981'
                                  : colors.border,
                          },
                        ]}
                      />
                      {index < doseProgression.length - 1 && (
                        <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[styles.phaseTitle, { color: colors.text }]}>
                        Phase {phase.phase}
                      </Text>
                      <Text style={[styles.phaseDose, { color: colors.primary }]}>
                        {phase.dose}
                      </Text>
                      <Text style={[styles.phaseDate, { color: colors.textSecondary }]}>
                        {formatDate(phase.startDate)}
                        {phase.endDate && ` - ${formatDate(phase.endDate)}`}
                      </Text>
                      {phase.status === 'current' && (
                        <View
                          style={[styles.currentBadge, { backgroundColor: colors.primary + '20' }]}
                        >
                          <Text style={[styles.currentBadgeText, { color: colors.primary }]}>
                            Current
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Safety Alerts Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: '#FEF2F2', borderColor: '#EF4444', borderWidth: 1 },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.alertHeader}>
                <Ionicons name="warning" size={24} color="#EF4444" />
                <Text style={[styles.cardTitle, { color: '#991B1B', marginLeft: 8 }]}>
                  Safety Alerts
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowSafetyAlert(true)}>
                <Ionicons name="information-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.alertText, { color: '#991B1B' }]}>
              Contact your healthcare provider immediately if you experience any severe symptoms.
            </Text>
            <TouchableOpacity
              style={[styles.alertButton, { backgroundColor: '#EF4444' }]}
              onPress={() => setShowSafetyAlert(true)}
            >
              <Text style={styles.alertButtonText}>View Warning Signs</Text>
            </TouchableOpacity>
          </View>

          {/* Education Tips */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Education Tips</Text>
            <View style={styles.tipsContainer}>
              {EDUCATION_TIPS.map((tip) => (
                <View
                  key={tip.id}
                  style={[styles.tipCard, { backgroundColor: colors.background }]}
                >
                  <Ionicons name={tip.icon as any} size={32} color={colors.primary} />
                  <Text style={[styles.tipTitle, { color: colors.text }]}>{tip.title}</Text>
                  <Text style={[styles.tipContent, { color: colors.textSecondary }]}>
                    {tip.content}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Disclaimer */}
          <View style={[styles.disclaimer, { backgroundColor: colors.surface }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
              This tracker is for informational purposes only and does not replace professional
              medical advice. Always consult your healthcare provider.
            </Text>
          </View>
        </View>
      )}

      {/* Medication Setup Modal */}
      <Modal visible={showMedicationSetup} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowMedicationSetup(false)}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {medicationInfo ? 'Edit Medication' : 'Set Up Medication'}
                  </Text>
                  <TouchableOpacity onPress={() => setShowMedicationSetup(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.formScrollView}
                  contentContainerStyle={styles.formScrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.form}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Medication Name</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                      ]}
                      value={medName}
                      onChangeText={setMedName}
                      placeholder="e.g., Ozempic, Wegovy, Mounjaro"
                      placeholderTextColor={colors.textSecondary}
                    />

                    <Text style={[styles.inputLabel, { color: colors.text }]}>Current Dose</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                      ]}
                      value={medDose}
                      onChangeText={setMedDose}
                      placeholder="e.g., 0.5mg, 1mg, 2.5mg"
                      placeholderTextColor={colors.textSecondary}
                    />

                    <Text style={[styles.inputLabel, { color: colors.text }]}>Injection Schedule</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                      ]}
                      value={medDay}
                      onChangeText={setMedDay}
                      placeholder="e.g., Every 7 days, Every Monday"
                      placeholderTextColor={colors.textSecondary}
                    />

                    <TouchableOpacity
                      style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                      onPress={handleSaveMedication}
                    >
                      <Text style={styles.primaryButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Dose Taken Modal */}
      <Modal visible={showDoseTaken} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowDoseTaken(false)}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Confirm Dose</Text>
                  <TouchableOpacity onPress={() => setShowDoseTaken(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.formScrollView}
                  contentContainerStyle={styles.formScrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.form}>
                    <View style={styles.doseConfirmInfo}>
                      <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
                      <Text style={[styles.confirmDoseText, { color: colors.text }]}>
                        {medicationInfo?.currentDose}
                      </Text>
                      <Text style={[styles.confirmTimeText, { color: colors.textSecondary }]}>
                        {new Date().toLocaleString()}
                      </Text>
                    </View>

                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Notes (optional)
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                      ]}
                      value={doseNotes}
                      onChangeText={setDoseNotes}
                      placeholder="Any notes about this dose?"
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      numberOfLines={3}
                    />

                    <TouchableOpacity
                      style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                      onPress={handleRecordDose}
                    >
                      <Text style={styles.primaryButtonText}>Confirm Dose Taken</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Side Effects Modal */}
      <Modal visible={showSideEffects} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowSideEffects(false)}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Log Side Effect</Text>
                  <TouchableOpacity onPress={() => setShowSideEffects(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.formScrollView}
                  contentContainerStyle={styles.formScrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.form}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Select Side Effect</Text>
                    <View style={styles.effectsGrid}>
                      {SIDE_EFFECTS.map((effect) => (
                        <TouchableOpacity
                          key={effect.name}
                          style={[
                            styles.effectButton,
                            {
                              backgroundColor: selectedEffect === effect.name
                                ? colors.primary + '20'
                                : colors.background,
                              borderColor: selectedEffect === effect.name
                                ? colors.primary
                                : colors.border,
                            },
                          ]}
                          onPress={() => setSelectedEffect(effect.name)}
                        >
                          <Ionicons
                            name={effect.icon as any}
                            size={24}
                            color={selectedEffect === effect.name ? colors.primary : colors.text}
                          />
                          <Text
                            style={[
                              styles.effectButtonText,
                              {
                                color: selectedEffect === effect.name ? colors.primary : colors.text,
                              },
                            ]}
                          >
                            {effect.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={[styles.inputLabel, { color: colors.text }]}>Severity</Text>
                    <View style={styles.severityButtons}>
                      {['mild', 'moderate', 'severe'].map((severity) => (
                        <TouchableOpacity
                          key={severity}
                          style={[
                            styles.severityButton,
                            {
                              backgroundColor:
                                effectSeverity === severity
                                  ? getSeverityColor(severity) + '20'
                                  : colors.background,
                              borderColor:
                                effectSeverity === severity
                                  ? getSeverityColor(severity)
                                  : colors.border,
                            },
                          ]}
                          onPress={() => setEffectSeverity(severity as any)}
                        >
                          <Text
                            style={[
                              styles.severityButtonText,
                              {
                                color:
                                  effectSeverity === severity
                                    ? getSeverityColor(severity)
                                    : colors.text,
                              },
                            ]}
                          >
                            {severity.charAt(0).toUpperCase() + severity.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={[styles.inputLabel, { color: colors.text }]}>Notes (optional)</Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                      ]}
                      value={effectNotes}
                      onChangeText={setEffectNotes}
                      placeholder="Any additional details?"
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      numberOfLines={3}
                    />

                    <TouchableOpacity
                      style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                      onPress={handleRecordSideEffect}
                    >
                      <Text style={styles.primaryButtonText}>Log Side Effect</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Appetite Log Modal */}
      <Modal visible={showAppetiteLog} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowAppetiteLog(false)}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Log Appetite</Text>
                  <TouchableOpacity onPress={() => setShowAppetiteLog(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.formScrollView}
                  contentContainerStyle={styles.formScrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.form}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Hunger Level: {hungerLevel}/10
                    </Text>
                    <View style={styles.sliderContainer}>
                      <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>Empty</Text>
                      <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={10}
                        step={1}
                        value={hungerLevel}
                        onValueChange={setHungerLevel}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.border}
                      />
                      <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>Full</Text>
                    </View>

                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Cravings: {cravingsLevel}/10
                    </Text>
                    <View style={styles.sliderContainer}>
                      <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>None</Text>
                      <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={10}
                        step={1}
                        value={cravingsLevel}
                        onValueChange={setCravingsLevel}
                        minimumTrackTintColor="#F59E0B"
                        maximumTrackTintColor={colors.border}
                      />
                      <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>Intense</Text>
                    </View>

                    <Text style={[styles.inputLabel, { color: colors.text }]}>Notes (optional)</Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                      ]}
                      value={appetiteNotes}
                      onChangeText={setAppetiteNotes}
                      placeholder="What are you craving?"
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      numberOfLines={3}
                    />

                    <TouchableOpacity
                      style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                      onPress={handleRecordAppetite}
                    >
                      <Text style={styles.primaryButtonText}>Log Appetite</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Weight Entry Modal */}
      <Modal visible={showWeightEntry} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowWeightEntry(false)}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Log Weight</Text>
                  <TouchableOpacity onPress={() => setShowWeightEntry(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.formScrollView}
                  contentContainerStyle={styles.formScrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.form}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Weight</Text>
                    <View style={styles.weightInputRow}>
                      <TextInput
                        style={[
                          styles.input,
                          styles.weightInput,
                          { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                        ]}
                        value={weight}
                        onChangeText={setWeight}
                        placeholder="0.0"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="decimal-pad"
                      />
                      <View style={styles.unitButtons}>
                        <TouchableOpacity
                          style={[
                            styles.unitButton,
                            {
                              backgroundColor:
                                weightUnit === 'lbs' ? colors.primary : colors.background,
                              borderColor: weightUnit === 'lbs' ? colors.primary : colors.border,
                            },
                          ]}
                          onPress={() => setWeightUnit('lbs')}
                        >
                          <Text
                            style={[
                              styles.unitButtonText,
                              { color: weightUnit === 'lbs' ? '#fff' : colors.text },
                            ]}
                          >
                            lbs
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.unitButton,
                            {
                              backgroundColor:
                                weightUnit === 'kg' ? colors.primary : colors.background,
                              borderColor: weightUnit === 'kg' ? colors.primary : colors.border,
                            },
                          ]}
                          onPress={() => setWeightUnit('kg')}
                        >
                          <Text
                            style={[
                              styles.unitButtonText,
                              { color: weightUnit === 'kg' ? '#fff' : colors.text },
                            ]}
                          >
                            kg
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                      onPress={handleRecordWeight}
                    >
                      <Text style={styles.primaryButtonText}>Log Weight</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Safety Alert Modal */}
      <Modal visible={showSafetyAlert} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowSafetyAlert(false)}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <View style={styles.modalHeader}>
                  <View style={styles.alertHeader}>
                    <Ionicons name="warning" size={24} color="#EF4444" />
                    <Text style={[styles.modalTitle, { color: '#991B1B', marginLeft: 8 }]}>
                      Warning Signs
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowSafetyAlert(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.alertContent}>
                  <Text style={[styles.alertDescription, { color: colors.text }]}>
                    Contact your healthcare provider immediately if you experience:
                  </Text>
                  {RED_FLAG_SYMPTOMS.map((symptom, index) => (
                    <View key={index} style={styles.symptomItem}>
                      <Ionicons name="alert-circle" size={20} color="#EF4444" />
                      <Text style={[styles.symptomText, { color: colors.text }]}>{symptom}</Text>
                    </View>
                  ))}
                  <View style={[styles.emergencyBox, { backgroundColor: '#FEF2F2' }]}>
                    <Ionicons name="call" size={24} color="#EF4444" />
                    <Text style={[styles.emergencyText, { color: '#991B1B' }]}>
                      Call 911 for severe symptoms or medical emergencies
                    </Text>
                  </View>
                </ScrollView>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
  },
  medicationInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    flex: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  doseInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  doseItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  doseLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  doseValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  doseDetail: {
    fontSize: 12,
  },
  countdown: {
    alignItems: 'center',
    marginTop: 8,
  },
  countdownNumber: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  countdownLabel: {
    fontSize: 12,
  },
  takeDoseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  takeDoseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationLabel: {
    fontSize: 14,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  testButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sideEffectsList: {
    gap: 8,
  },
  sideEffectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  sideEffectInfo: {
    flex: 1,
  },
  sideEffectName: {
    fontSize: 16,
    fontWeight: '500',
  },
  sideEffectTime: {
    fontSize: 12,
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sideEffectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickEffectButton: {
    flex: 1,
    minWidth: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  quickEffectText: {
    fontSize: 14,
    fontWeight: '500',
  },
  appetiteInfo: {
    gap: 16,
  },
  appetiteRow: {
    gap: 8,
  },
  appetiteLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  appetiteBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  appetiteBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  appetiteValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  loggedTime: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  weightInfo: {
    gap: 16,
  },
  currentWeight: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  weightLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  weightValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  weightDate: {
    fontSize: 12,
    marginTop: 4,
  },
  weightChange: {
    flexDirection: 'row',
    gap: 16,
  },
  changeItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  changeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  changeValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  weeklyTrend: {
    gap: 8,
  },
  trendLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 4,
  },
  trendBar: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  trendBarFill: {
    width: '100%',
    borderRadius: 4,
  },
  progressionTimeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineMarker: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  phaseDose: {
    fontSize: 14,
    marginTop: 2,
  },
  phaseDate: {
    fontSize: 12,
    marginTop: 4,
  },
  currentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertText: {
    fontSize: 14,
    lineHeight: 20,
  },
  alertButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  disclaimer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  primaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  formScrollView: {
    maxHeight: 500,
  },
  formScrollContent: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: -8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  doseConfirmInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  confirmDoseText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  confirmTimeText: {
    fontSize: 14,
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  effectButton: {
    flex: 1,
    minWidth: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  effectButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  severityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  severityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  severityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderLabel: {
    fontSize: 12,
    width: 50,
  },
  slider: {
    flex: 1,
  },
  weightInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  weightInput: {
    flex: 1,
  },
  unitButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  unitButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertContent: {
    maxHeight: 400,
  },
  alertDescription: {
    fontSize: 16,
    marginBottom: 16,
    fontWeight: '500',
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  symptomText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  emergencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  emergencyText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
});
