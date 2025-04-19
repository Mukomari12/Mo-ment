import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Card, Text, Button, Chip, Appbar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useJournalStore, Entry } from '../store/useJournalStore';
import { generateMonthlyReport, MonthlyReport } from '../api/openai';
import PaperSheet from '../components/PaperSheet';
import { useSpacing } from '../utils/useSpacing';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';

type MonthlyCheckupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MonthlyCheckup'
>;

const MonthlyCheckupScreen = () => {
  const navigation = useNavigation<MonthlyCheckupScreenNavigationProp>();
  const theme = useTheme();
  const { hPad } = useSpacing();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const entries = useJournalStore(state => state.entries);
  const monthlyReport = useJournalStore(state => state.monthlyReport);
  const setMonthlyReport = useJournalStore(state => state.setMonthlyReport);
  
  // Get current month in YYYY-MM format
  const currentMonth = new Date().toISOString().substring(0, 7);
  
  // Format month for display (e.g., "April 2023")
  const formatMonthTitle = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(date, 'MMMM yyyy');
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Only fetch if we don't have a report for the current month
        if (!monthlyReport || monthlyReport.month !== currentMonth) {
          setLoading(true);
          setError(null);
          
          const report = await generateMonthlyReport(currentMonth, entries);
          setMonthlyReport(report);
        }
      } catch (err) {
        console.error('Error generating monthly report:', err);
        setError('Could not generate the monthly report. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [currentMonth, entries, monthlyReport, setMonthlyReport]);

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };
  
  // Create an empty report structure to use as placeholder
  const createEmptyReport = (): MonthlyReport => ({
    month: currentMonth,
    topTriggers: [
      { emotion: 'anxious', phrases: [] },
      { emotion: 'happy', phrases: [] }
    ],
    summary: 'No entries found for this month.',
  });

  return (
    <PaperSheet>
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={{ backgroundColor: 'transparent' }}>
          <Appbar.BackAction onPress={handleBackPress} />
          <Appbar.Content 
            title={`${formatMonthTitle(currentMonth)} Check-Up`}
            titleStyle={{ fontFamily: 'PlayfairDisplay_700Bold' }} 
          />
        </Appbar.Header>
        
        <ScrollView 
          contentContainerStyle={{ paddingHorizontal: hPad, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text 
                style={[styles.loadingText, { color: theme.colors.onBackground, fontFamily: 'WorkSans_400Regular' }]}
              >
                Analyzing your journal entries...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text 
                style={[styles.errorText, { color: theme.colors.error, fontFamily: 'WorkSans_400Regular' }]}
              >
                {error}
              </Text>
              <Button 
                mode="contained" 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMonthlyReport(createEmptyReport());
                  navigation.goBack();
                }}
                style={{ marginTop: 20 }}
              >
                Back to Dashboard
              </Button>
            </View>
          ) : monthlyReport ? (
            <>
              {/* Happy Triggers Card */}
              <Card 
                style={[styles.card, { 
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.roundness,
                  elevation: 4,
                  shadowColor: theme.colors.secondary + '26'
                }]}
              >
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text 
                      variant="titleMedium" 
                      style={[styles.cardTitle, { 
                        color: '#4CAF50', 
                        fontFamily: 'PlayfairDisplay_700Bold'
                      }]}
                    >
                      Feeling ✓ Happy
                    </Text>
                  </View>
                  
                  <View style={styles.triggerContainer}>
                    {monthlyReport.topTriggers
                      .find(trigger => trigger.emotion === 'happy')?.phrases
                      .map((phrase, index) => (
                        <Chip 
                          key={index} 
                          style={[styles.chip, { backgroundColor: theme.colors.primary + '30' }]}
                          textStyle={{ fontFamily: 'WorkSans_400Regular', color: theme.colors.onBackground }}
                        >
                          {phrase}
                        </Chip>
                      ))}
                  </View>
                </Card.Content>
              </Card>

              {/* Anxious Triggers Card */}
              <Card 
                style={[styles.card, { 
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.roundness,
                  elevation: 4,
                  shadowColor: theme.colors.secondary + '26',
                  marginTop: 16
                }]}
              >
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text 
                      variant="titleMedium" 
                      style={[styles.cardTitle, { 
                        color: '#FFC107', 
                        fontFamily: 'PlayfairDisplay_700Bold'
                      }]}
                    >
                      Feeling ⚠️ Anxious
                    </Text>
                  </View>
                  
                  <View style={styles.triggerContainer}>
                    {monthlyReport.topTriggers
                      .find(trigger => trigger.emotion === 'anxious')?.phrases
                      .map((phrase, index) => (
                        <Chip 
                          key={index} 
                          style={[styles.chip, { backgroundColor: theme.colors.surfaceVariant }]}
                          textStyle={{ fontFamily: 'WorkSans_400Regular', color: theme.colors.onBackground }}
                        >
                          {phrase}
                        </Chip>
                      ))}
                  </View>
                </Card.Content>
              </Card>

              {/* Summary Card */}
              <Card 
                style={[styles.card, { 
                  backgroundColor: theme.colors.primary + '20',
                  borderRadius: theme.roundness,
                  elevation: 4,
                  shadowColor: theme.colors.secondary + '26',
                  marginTop: 16
                }]}
              >
                <Card.Content>
                  <Text 
                    variant="titleMedium" 
                    style={[styles.summaryTitle, { 
                      fontFamily: 'PlayfairDisplay_700Bold',
                      color: theme.colors.onBackground
                    }]}
                  >
                    Monthly Summary
                  </Text>
                  <Text 
                    style={[styles.summaryText, { 
                      fontFamily: 'WorkSans_400Regular',
                      color: theme.colors.onBackground
                    }]}
                  >
                    {monthlyReport.summary}
                  </Text>
                </Card.Content>
              </Card>

              <Button 
                mode="outlined"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.goBack();
                }}
                style={{ marginTop: 24 }}
                labelStyle={{ fontFamily: 'WorkSans_500Medium' }}
              >
                See previous months
              </Button>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={{ fontFamily: 'WorkSans_400Regular' }}>
                No report available. Please try again later.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </PaperSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
  },
  triggerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    margin: 4,
  },
  summaryTitle: {
    marginBottom: 12,
  },
  summaryText: {
    lineHeight: 22,
  },
});

export default MonthlyCheckupScreen; 