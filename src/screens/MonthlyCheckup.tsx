import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Card, Text, Chip, useTheme, ActivityIndicator, ProgressBar, Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore, globalLimits } from '../store/useJournalStore';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useSpacing } from '../utils/useSpacing';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Define MonthlyReport interface if not imported from types/journal
interface MonthlyReport {
  month: string;
  entriesCount: number;
  avgMoodScore: number;
  mostFrequentMood: string;
  happyTriggers: string[];
  anxiousTriggers: string[];
  summary: string;
}

type MonthlyCheckupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MonthlyCheckup'>;
};

// Helper function to generate a monthly report
const generateMonthlyReport = async () => {
  try {
    if (globalLimits.monthlyAnalysis.count >= 3) {
      Alert.alert(
        "Monthly Limit Reached",
        "You've reached your monthly limit for analysis. Please try again next month."
      );
      return;
    }
    
    setIsLoading(true);
    
    // Fetch entries from the store
    const entries = useJournalStore.getState().entries;
    
    if (entries.length < 5) {
      Alert.alert(
        "Not Enough Entries",
        "You need at least 5 journal entries to generate a monthly report."
      );
      setIsLoading(false);
      return;
    }
    
    const result = await useJournalStore.getState().generateMonthlyReport();
    
    if (result) {
      // Increment the count only after successful generation
      globalLimits.monthlyAnalysis.count += 1;
      console.log(`Monthly analysis count increased to: ${globalLimits.monthlyAnalysis.count}`);
      
      // Log the updated limit to verify it's working
      console.log('Updated global limits:', globalLimits);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setIsLoading(false);
  } catch (error) {
    console.error('Error generating monthly report:', error);
    setIsLoading(false);
    Alert.alert(
      "Error",
      "Failed to generate monthly report. Please try again later."
    );
  }
};

// Helper to convert mood score to label
const getMoodLabel = (score: number): string => {
  switch (score) {
    case 1: return 'Very Low';
    case 2: return 'Low';
    case 3: return 'Neutral';
    case 4: return 'Good';
    case 5: return 'Excellent';
    default: return 'Unknown';
  }
};

// Add this component to show the usage counter
const MonthlyUsageCounter = () => {
  const theme = useTheme();
  const count = globalLimits.monthlyAnalysis.count;
  const total = 3;
  const progress = count / total;
  
  return (
    <View style={styles.usageCounter}>
      <View style={styles.usageHeaderRow}>
        <MaterialCommunityIcons 
          name="chart-timeline-variant" 
          size={20} 
          color={theme.colors.primary} 
        />
        <Text style={styles.usageHeaderText}>
          Monthly Analysis Usage
        </Text>
      </View>
      
      <ProgressBar 
        progress={progress} 
        color={progress === 1 ? '#d32f2f' : theme.colors.primary}
        style={styles.usageProgressBar}
      />
      
      <View style={styles.usageStatsRow}>
        <Text style={styles.usageStatsText}>
          {count} of {total} used this month
        </Text>
        {count === total && (
          <Text style={[styles.usageLimitText, {color: '#d32f2f'}]}>
            Limit reached
          </Text>
        )}
      </View>
    </View>
  );
};

// Add helper function to generate a proper monthly report
const generateMockMonthlyReport = (entries: any[]): MonthlyReport => {
  // Current month string for title
  const currentMonth = format(new Date(), 'MMMM yyyy');
  
  if (entries.length === 0) {
    return {
      month: currentMonth,
      entriesCount: 0,
      avgMoodScore: 0,
      mostFrequentMood: 'Unknown',
      happyTriggers: [],
      anxiousTriggers: [],
      summary: 'No entries for this month yet.',
    };
  }
  
  // Filter entries from current month
  const currentMonthEntries = entries.filter(entry => {
    const entryDate = new Date(entry.createdAt);
    const now = new Date();
    return (
      entryDate.getMonth() === now.getMonth() &&
      entryDate.getFullYear() === now.getFullYear()
    );
  });
  
  // Calculate average mood
  const moodScores = currentMonthEntries
    .filter(entry => entry.mood !== undefined)
    .map(entry => entry.mood);
  
  const avgMoodScore = moodScores.length > 0
    ? moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length
    : 0;
  
  // Determine most frequent mood
  const moodFrequency: Record<string, number> = {};
  currentMonthEntries.forEach(entry => {
    if (entry.mood) {
      const moodLabel = getMoodLabel(entry.mood);
      moodFrequency[moodLabel] = (moodFrequency[moodLabel] || 0) + 1;
    }
  });
  
  const mostFrequentMood = Object.keys(moodFrequency).length > 0
    ? Object.keys(moodFrequency).reduce(
        (a, b) => moodFrequency[a] > moodFrequency[b] ? a : b,
        'Unknown'
      )
    : 'Unknown';
  
  // Mock triggers (would be derived from content analysis in a real app)
  const happyTriggers = ['Family time', 'Exercise', 'Good food'];
  const anxiousTriggers = ['Work deadlines', 'Traffic'];
  
  // Generate a summary
  const summary = `This month, you've recorded ${currentMonthEntries.length} entries with an average mood of ${avgMoodScore.toFixed(1)}. Your most frequent mood was ${mostFrequentMood}.`;
  
  return {
    month: currentMonth,
    entriesCount: currentMonthEntries.length,
    avgMoodScore,
    mostFrequentMood,
    happyTriggers,
    anxiousTriggers,
    summary,
  };
};

const MonthlyCheckupScreen: React.FC<MonthlyCheckupScreenProps> = ({ navigation }) => {
  console.log('MonthlyCheckup props:', { props: { navigation }, routeParams: {} });
  
  const theme = useTheme();
  const { hPad } = useSpacing();
  const entries = useJournalStore(state => state.entries);
  const incrementMonthlyAnalysisCount = useJournalStore(state => state.incrementMonthlyAnalysisCount);
  const monthlyAnalysisCount = useJournalStore(state => state.monthlyAnalysisCount);
  const lastMonthlyAnalysisMonth = useJournalStore(state => state.lastMonthlyAnalysisMonth);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  // Immediate check when component mounts
  useEffect(() => {
    // Only run this once when component mounts
    if (!initialCheckDone) {
      const currentMonth = new Date().toISOString().substring(0, 7);
      console.log('INITIAL CHECK - Analysis count:', monthlyAnalysisCount, 'Month:', lastMonthlyAnalysisMonth);
      
      if (currentMonth === lastMonthlyAnalysisMonth && monthlyAnalysisCount >= 3) {
        console.log('INITIAL CHECK - Limit already reached!');
        setLimitReached(true);
        setIsLoading(false);
        
        // Show an alert to the user
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          'Monthly Limit Reached',
          'You have used all 3 monthly analyses for this month. Please check back next month for new insights.',
          [{ text: 'OK' }]
        );
      }
      
      setInitialCheckDone(true);
    }
  }, [monthlyAnalysisCount, lastMonthlyAnalysisMonth, initialCheckDone]);
  
  // Check if monthly limit is reached on component mount and when values change
  useEffect(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    console.log('LIMIT CHECK - Analysis count:', monthlyAnalysisCount, 'Current month:', currentMonth, 'Last month:', lastMonthlyAnalysisMonth);
    
    if (currentMonth === lastMonthlyAnalysisMonth && monthlyAnalysisCount >= 3) {
      console.log('LIMIT CHECK - Limit reached!');
      setLimitReached(true);
      setIsLoading(false);
    } else {
      setLimitReached(false);
    }
  }, [monthlyAnalysisCount, lastMonthlyAnalysisMonth]);
  
  // Replace the generateMonthlyReport function with this version that properly uses the component state
  const handleGenerateReport = async () => {
    try {
      if (globalLimits.monthlyAnalysis.count >= 3) {
        Alert.alert(
          "Monthly Limit Reached",
          "You've reached your monthly limit for analysis. Please try again next month."
        );
        return;
      }
      
      setIsLoading(true);
      
      if (entries.length < 5) {
        Alert.alert(
          "Not Enough Entries",
          "You need at least 5 journal entries to generate a monthly report."
        );
        setIsLoading(false);
        return;
      }
      
      // Generate a report (mock for now)
      const report = generateMockMonthlyReport(entries);
      
      // Increment the count after successful generation
      globalLimits.monthlyAnalysis.count += 1;
      console.log(`Monthly analysis count increased to: ${globalLimits.monthlyAnalysis.count}`);
      
      // Update the store state to match global state
      incrementMonthlyAnalysisCount();
      
      // Update the report in the component state
      setMonthlyReport(report);
      
      // Log the updated limit to verify it's working
      console.log('Updated global limits:', globalLimits);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating monthly report:', error);
      setIsLoading(false);
      Alert.alert(
        "Error",
        "Failed to generate monthly report. Please try again later."
      );
    }
  };
  
  // Update the recompute function to use the new handleGenerateReport
  const recompute = useCallback(() => {
    // Check if we can run analysis this month
    if (limitReached) {
      console.log('RECOMPUTE - Limit reached, aborting');
      setIsLoading(false);
      
      // Show an alert to the user
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Monthly Limit Reached',
        'You have used all 3 monthly analyses for this month. Please check back next month for new insights.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Only try to compute the report if we have entries
    if (entries.length > 0) {
      setIsLoading(true);
      
      // Increment usage counter - only proceed if under limit
      const canAnalyze = incrementMonthlyAnalysisCount();
      console.log('RECOMPUTE - Can analyze?', canAnalyze);
      
      if (!canAnalyze) {
        console.log('RECOMPUTE - Limit just reached during increment');
        setLimitReached(true);
        setIsLoading(false);
        
        // Show an alert to the user
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          'Monthly Limit Reached',
          'You have used all 3 monthly analyses for this month. Please check back next month for new insights.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Mock computation of monthly report (use our new function)
      setTimeout(() => {
        const report = generateMockMonthlyReport(entries);
        setMonthlyReport(report);
        setIsLoading(false);
      }, 1000);
    } else {
      setIsLoading(false);
      setMonthlyReport(null);
    }
  }, [entries, incrementMonthlyAnalysisCount, limitReached]);
  
  useEffect(() => {
    if (!limitReached && !isLoading && initialCheckDone) {
      console.log('EFFECT - Starting initial computation');
      recompute();
    }
  }, [recompute, limitReached, isLoading, initialCheckDone]);
  
  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={{ backgroundColor: 'transparent' }}>
          <Appbar.BackAction 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }} 
          />
          <Appbar.Content 
            title="Monthly Checkup" 
            titleStyle={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          />
        </Appbar.Header>
        
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16 }}>Analyzing your month...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Show limit reached message
  if (limitReached) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={{ backgroundColor: 'transparent' }}>
          <Appbar.BackAction 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }} 
          />
          <Appbar.Content 
            title="Monthly Limit Reached" 
            titleStyle={{ 
              fontFamily: 'PlayfairDisplay_700Bold',
              color: '#d32f2f' // Red color for warning
            }}
          />
        </Appbar.Header>
        
        <View style={{flex:1, justifyContent:'center', alignItems:'center', padding: 20}}>
          <View style={styles.limitWarningContainer}>
            <MaterialCommunityIcons name="alert-circle" size={64} color="#d32f2f" />
            <Text variant="titleMedium" style={{marginBottom: 12, marginTop: 16, color: '#d32f2f', textAlign: 'center'}}>
              Monthly Analysis Limit Reached
            </Text>
            <Text variant="bodyMedium" style={{textAlign: 'center'}}>
              You've used all 3 monthly analyses for this month. 
              Check back next month for new insights.
            </Text>
            <Text variant="bodySmall" style={{marginTop: 16, textAlign: 'center', fontStyle: 'italic', opacity: 0.7}}>
              Limit resets at the beginning of each month
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  // Show a fallback if there's no data or not enough data for a report
  if (!monthlyReport || entries.length < 5) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={{ backgroundColor: 'transparent' }}>
          <Appbar.BackAction 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }} 
          />
          <Appbar.Content 
            title="Monthly Checkup" 
            titleStyle={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          />
        </Appbar.Header>
        
        <View style={{flex:1, justifyContent:'center', alignItems:'center', padding: 20}}>
          <Text variant="bodyMedium">Not enough data yet. Add at least 5 entries to see your monthly report.</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: 'transparent' }}>
        <Appbar.BackAction 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }} 
        />
        <Appbar.Content 
          title="Monthly Checkup" 
          titleStyle={{ fontFamily: 'PlayfairDisplay_700Bold' }}
        />
      </Appbar.Header>
      
      <MonthlyUsageCounter />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 24 }}
        style={{ paddingHorizontal: hPad }}
      >
        <Text 
          style={[
            styles.monthTitle, 
            { 
              color: theme.colors.onBackground,
              fontFamily: 'PlayfairDisplay_700Bold',
            }
          ]}
        >
          {monthlyReport.month}
        </Text>
        
        {/* Happy triggers */}
        <Card style={styles.card}>
          <Card.Content>
            <Text 
              style={[
                styles.cardTitle, 
                {
                  color: theme.colors.onBackground,
                  fontFamily: 'PlayfairDisplay_700Bold',
                }
              ]}
            >
              What made you happy this month
            </Text>
            
            <View style={styles.chipsContainer}>
              {monthlyReport.happyTriggers.length > 0 ? (
                monthlyReport.happyTriggers.map((trigger: string, index: number) => (
                  <Chip 
                    key={index} 
                    style={[
                      styles.chip,
                      { 
                        backgroundColor: theme.colors.secondaryContainer,
                      }
                    ]}
                  >
                    {trigger}
                  </Chip>
                ))
              ) : (
                <Text 
                  style={[
                    styles.noDataText,
                    { color: theme.colors.onSurfaceVariant }
                  ]}
                >
                  No happy triggers identified yet
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>
        
        {/* Anxious triggers */}
        <Card style={styles.card}>
          <Card.Content>
            <Text 
              style={[
                styles.cardTitle, 
                {
                  color: theme.colors.onBackground,
                  fontFamily: 'PlayfairDisplay_700Bold',
                }
              ]}
            >
              What made you anxious this month
            </Text>
            
            <View style={styles.chipsContainer}>
              {monthlyReport.anxiousTriggers.length > 0 ? (
                monthlyReport.anxiousTriggers.map((trigger: string, index: number) => (
                  <Chip 
                    key={index} 
                    style={[
                      styles.chip,
                      { 
                        backgroundColor: theme.colors.errorContainer,
                      }
                    ]}
                  >
                    {trigger}
                  </Chip>
                ))
              ) : (
                <Text 
                  style={[
                    styles.noDataText,
                    { color: theme.colors.onSurfaceVariant }
                  ]}
                >
                  No anxious triggers identified yet
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>
        
        {/* Monthly summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text 
              style={[
                styles.cardTitle, 
                {
                  color: theme.colors.onBackground,
                  fontFamily: 'PlayfairDisplay_700Bold',
                }
              ]}
            >
              Monthly Summary
            </Text>
            
            <Text 
              style={[
                styles.summaryText,
                { 
                  color: theme.colors.onSurface,
                  fontFamily: 'WorkSans_400Regular',
                }
              ]}
            >
              {monthlyReport.summary}
            </Text>
            
            {monthlyReport.entriesCount > 0 && (
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text 
                    style={[
                      styles.statValue,
                      { 
                        color: theme.colors.primary,
                        fontFamily: 'PlayfairDisplay_700Bold',
                      }
                    ]}
                  >
                    {monthlyReport.entriesCount}
                  </Text>
                  <Text 
                    style={[
                      styles.statLabel,
                      { 
                        color: theme.colors.onSurfaceVariant,
                        fontFamily: 'WorkSans_400Regular',
                      }
                    ]}
                  >
                    Entries
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text 
                    style={[
                      styles.statValue,
                      { 
                        color: theme.colors.primary,
                        fontFamily: 'PlayfairDisplay_700Bold',
                      }
                    ]}
                  >
                    {monthlyReport.avgMoodScore.toFixed(1)}
                  </Text>
                  <Text 
                    style={[
                      styles.statLabel,
                      { 
                        color: theme.colors.onSurfaceVariant,
                        fontFamily: 'WorkSans_400Regular',
                      }
                    ]}
                  >
                    Avg Mood
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text 
                    style={[
                      styles.statValue,
                      { 
                        color: theme.colors.primary,
                        fontFamily: 'PlayfairDisplay_700Bold',
                      }
                    ]}
                  >
                    {monthlyReport.mostFrequentMood}
                  </Text>
                  <Text 
                    style={[
                      styles.statLabel,
                      { 
                        color: theme.colors.onSurfaceVariant,
                        fontFamily: 'WorkSans_400Regular',
                      }
                    ]}
                  >
                    Most Common
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F2',
  },
  monthTitle: {
    fontSize: 24,
    marginVertical: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 4,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontSize: 24,
  },
  statLabel: {
    fontSize: 12,
  },
  noDataText: {
    fontStyle: 'italic',
    marginVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  limitWarningContainer: {
    alignItems: 'center',
  },
  usageCounter: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  usageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#3d2f28',
  },
  usageProgressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  usageStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  usageStatsText: {
    fontSize: 14,
    color: '#666666',
  },
  usageLimitText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MonthlyCheckupScreen; 