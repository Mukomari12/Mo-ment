import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Card, Text, Chip, useTheme, ActivityIndicator } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import PaperSheet from '../components/PaperSheet';
import { useJournalStore } from '../store/useJournalStore';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useSpacing } from '../utils/useSpacing';

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
const generateMonthlyReport = (entries: any[]): MonthlyReport => {
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
  
  const mostFrequentMood = Object.keys(moodFrequency).reduce(
    (a, b) => moodFrequency[a] > moodFrequency[b] ? a : b,
    'Unknown'
  );
  
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

const MonthlyCheckupScreen: React.FC<MonthlyCheckupScreenProps> = ({ navigation }) => {
  console.log('MonthlyCheckup props:', { props: { navigation }, routeParams: {} });
  
  const theme = useTheme();
  const { hPad } = useSpacing();
  const entries = useJournalStore(state => state.entries);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const recompute = useCallback(() => {
    // Only try to compute the report if we have entries
    if (entries.length > 0) {
      setIsLoading(true);
      // Mock computation of monthly report
      setTimeout(() => {
        // Generate a mock monthly report from entries
        const report = generateMonthlyReport(entries);
        setMonthlyReport(report);
        setIsLoading(false);
      }, 1000);
    } else {
      setIsLoading(false);
      setMonthlyReport(null);
    }
  }, [entries]);
  
  useEffect(() => {
    recompute();
  }, [recompute]);
  
  // Show loading state
  if (isLoading) {
    return (
      <PaperSheet>
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
      </PaperSheet>
    );
  }
  
  // Show a fallback if there's no data or not enough data for a report
  if (!monthlyReport || entries.length < 5) {
    return (
      <PaperSheet>
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
      </PaperSheet>
    );
  }
  
  return (
    <PaperSheet>
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
    </PaperSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default MonthlyCheckupScreen; 