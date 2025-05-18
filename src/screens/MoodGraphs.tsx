import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform, Alert } from 'react-native';
import { Text, useTheme, ActivityIndicator, Chip, ProgressBar, Card, Avatar, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { analyzeMoodTrends, MoodAnalysis, EmotionTrend } from '../api/openai';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore, globalLimits } from '../store/useJournalStore';

type MoodGraphsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MoodGraphs'>;

const TREND_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  'increasing': 'trending-up',
  'decreasing': 'trending-down',
  'stable': 'trending-neutral',
};

const TREND_COLORS = {
  increasing: '#4CAF50',
  decreasing: '#F44336',
  stable: '#9E9E9E',
};

const formatDateRange = (period: 'month' | 'all') => {
  const today = new Date();
  if (period === 'month') {
    const month = today.toLocaleString('default', { month: 'long' });
    return `${month} ${today.getFullYear()}`;
  } else {
    return 'All Time';
  }
};

// Add this component to show the usage counter
const MoodAnalysisUsageCounter = () => {
  const theme = useTheme();
  const count = globalLimits.monthlyAnalysis.count;
  const total = 3;
  const progress = count / total;
  
  return (
    <View style={styles.usageCounter}>
      <View style={styles.usageHeaderRow}>
        <MaterialCommunityIcons 
          name="brain" 
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

const MoodGraphsScreen: React.FC = () => {
  const navigation = useNavigation<MoodGraphsScreenNavigationProp>();
  const { entries } = useJournalEntries();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Get and set mood analysis from the global store
  const moodAnalysis = useJournalStore(state => state.moodAnalysis);
  const addMoodAnalysis = useJournalStore(state => state.addMoodAnalysis);
  const incrementMonthlyAnalysisCount = useJournalStore(state => state.incrementMonthlyAnalysisCount);
  
  // Get the current month in YYYY-MM format
  const currentMonth = new Date().toISOString().substring(0, 7);
  // Initialize from stored analysis if it exists
  const [analysis, setAnalysis] = useState<MoodAnalysis | null>(
    moodAnalysis[currentMonth] || null
  );
  
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'all'>('month');
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  // Set the navigation header title
  useEffect(() => {
    navigation.setOptions({
      title: 'Mood Analysis'
    });
  }, [navigation]);

  // Check if monthly limit is reached
  useEffect(() => {
    const checkLimit = () => {
      const isLimitReached = globalLimits.monthlyAnalysis.count >= 3;
      setLimitReached(isLimitReached);
      return isLimitReached;
    };
    
    checkLimit();
  }, [globalLimits.monthlyAnalysis.count]);

  const filterEntriesByPeriod = useCallback(() => {
    if (selectedPeriod === 'month') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return entries.filter(entry => new Date(entry.createdAt) >= firstDay);
    }
    return entries;
  }, [entries, selectedPeriod]);

  const fetchAnalysis = useCallback(async (refresh = false) => {
    // First check if we've reached the monthly limit
    if (globalLimits.monthlyAnalysis.count >= 3) {
      Alert.alert(
        "Monthly Limit Reached",
        "You've reached your monthly limit for mood analysis. Please try again next month."
      );
      setLimitReached(true);
      return;
    }
    
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const filteredEntries = filterEntriesByPeriod();
      console.log(`Analyzing ${filteredEntries.length} entries for ${selectedPeriod} period`);
      
      if (filteredEntries.length === 0) {
        const emptyAnalysis = {
          emotions: [],
          summary: "No entries available for analysis.",
          insights: "Add journal entries to see your mood analysis.",
          recommendations: ["Start journaling to track your emotional patterns."]
        };
        setAnalysis(emptyAnalysis);
        const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
        addMoodAnalysis(currentMonth, emptyAnalysis);
        return;
      }
      
      if (filteredEntries.length < 3) {
        Alert.alert(
          "Not Enough Entries",
          "You need at least 3 journal entries to analyze mood trends."
        );
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      const result = await analyzeMoodTrends(filteredEntries);
      console.log('Analysis completed:', JSON.stringify(result, null, 2));
      
      // Update the store state using incrementMonthlyAnalysisCount
      incrementMonthlyAnalysisCount();
      // Also update the global limits count
      globalLimits.monthlyAnalysis.count += 1;
      
      setAnalysis(result);
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      addMoodAnalysis(currentMonth, result);
      
      // Check if we've now reached the limit
      if (globalLimits.monthlyAnalysis.count >= 3) {
        setLimitReached(true);
      }

      // A little delay to make the loading feel more natural
      setTimeout(() => {
        if (refresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }, 500);
    } catch (error) {
      console.error('Error analyzing mood trends:', error);
      setError('Failed to analyze mood trends. Please try again.');
      if (refresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [filterEntriesByPeriod, incrementMonthlyAnalysisCount, selectedPeriod, addMoodAnalysis]);

  const onRefresh = useCallback(() => {
    fetchAnalysis(true);
  }, [fetchAnalysis]);

  const handlePeriodChange = (period: 'month' | 'all') => {
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
    setSelectedPeriod(period);
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happiness':
      case 'joy':
      case 'excited':
        return 'emoticon-happy-outline';
      case 'sadness':
      case 'sad':
        return 'emoticon-sad-outline';
      case 'anger':
      case 'angry':
        return 'emoticon-angry-outline';
      case 'anxiety':
      case 'anxious':
      case 'stress':
      case 'stressed':
        return 'head-sync-outline';
      case 'fear':
        return 'ghost-outline';
      case 'surprise':
        return 'emoticon-excited-outline';
      case 'disgust':
        return 'emoticon-sick-outline';
      case 'contentment':
      case 'content':
        return 'emoticon-cool-outline';
      case 'love':
        return 'heart-outline';
      default:
        return 'emoticon-neutral-outline';
    }
  };

  const renderEmotionCard = (emotion: EmotionTrend) => {
    return (
      <Card key={emotion.emotion} style={styles.emotionCard}>
        <Card.Content>
          <View style={styles.emotionHeader}>
            <Avatar.Icon 
              size={40} 
              icon={getEmotionIcon(emotion.emotion)} 
              style={{ backgroundColor: theme.colors.surfaceVariant }}
            />
            <View style={styles.emotionTitleContainer}>
              <Text variant="titleMedium" style={styles.emotionTitle}>
                {emotion.emotion}
              </Text>
              <View style={styles.trendContainer}>
                <MaterialCommunityIcons 
                  name={TREND_ICONS[emotion.trend]} 
                  size={16} 
                  color={TREND_COLORS[emotion.trend]} 
                />
                <Text style={[styles.trendText, { color: TREND_COLORS[emotion.trend] }]}>
                  {emotion.trend}
                </Text>
              </View>
            </View>
            <Text variant="headlineSmall" style={styles.score}>
              {emotion.score}
            </Text>
          </View>
          
          <ProgressBar 
            progress={emotion.score / 100} 
            color={TREND_COLORS[emotion.trend]} 
            style={styles.progressBar}
          />
          
          <Text variant="bodyLarge" style={styles.triggersTitle}>Triggers:</Text>
          <View style={styles.triggersContainer}>
            {emotion.triggers.map((trigger, index) => (
              <Chip key={index} style={styles.triggerChip} textStyle={styles.chipText}>
                {trigger}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const hasEnoughEntries = filterEntriesByPeriod().length >= 3;
  const hasAnalysis = analysis && analysis.emotions.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: '#F9F6F2' }]}>
      <MoodAnalysisUsageCounter />
      
      <View style={styles.filterContainer}>
        <Chip
          selected={selectedPeriod === 'month'}
          onPress={() => handlePeriodChange('month')}
          style={[
            styles.filterChip,
            selectedPeriod === 'month' && styles.selectedFilterChip,
          ]}
          textStyle={selectedPeriod === 'month' ? styles.selectedChipText : styles.chipText}
        >
          This Month
        </Chip>
        <Chip
          selected={selectedPeriod === 'all'}
          onPress={() => handlePeriodChange('all')}
          style={[
            styles.filterChip,
            selectedPeriod === 'all' && styles.selectedFilterChip,
          ]}
          textStyle={selectedPeriod === 'all' ? styles.selectedChipText : styles.chipText}
        >
          All Time
        </Chip>
      </View>

      <View style={styles.headerRow}>
        <Text variant="titleLarge" style={styles.dateRangeText}>
          {formatDateRange(selectedPeriod)}
        </Text>
        
        <Button
          mode="contained"
          onPress={() => fetchAnalysis()}
          loading={loading}
          disabled={loading || !hasEnoughEntries || limitReached}
          icon={hasAnalysis ? "refresh" : "brain"} 
          style={styles.generateButton}
          labelStyle={styles.generateButtonLabel}
        >
          {hasAnalysis ? "Regenerate" : "Generate"}
        </Button>
      </View>

      {limitReached && (
        <View style={styles.limitBanner}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#F44336" />
          <Text style={styles.limitBannerText}>
            Monthly limit reached. New analyses available next month.
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {hasAnalysis && (
          <Text style={styles.infoText}>
            Analysis stays the same until you click Regenerate.
          </Text>
        )}
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Analyzing your moods...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <Button mode="contained" onPress={() => fetchAnalysis()} style={styles.retryButton}>
              Retry
            </Button>
          </View>
        ) : hasAnalysis ? (
          <>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.summaryTitle}>Summary</Text>
                <Text style={styles.summaryText}>{analysis.summary}</Text>
              </Card.Content>
            </Card>

            <Text variant="titleMedium" style={styles.sectionTitle}>Emotional Trends</Text>
            {analysis.emotions.map(emotion => renderEmotionCard(emotion))}

            <Card style={styles.insightsCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.insightsTitle}>Insights</Text>
                <Text style={styles.insightsText}>{analysis.insights}</Text>
              </Card.Content>
            </Card>

            <Text variant="titleMedium" style={styles.sectionTitle}>Recommendations</Text>
            <Card style={styles.recommendationsCard}>
              <Card.Content>
                {analysis.recommendations.map((recommendation, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <MaterialCommunityIcons name="lightbulb-outline" size={24} color="#FFB74D" />
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="chart-line-variant" size={84} color="#b58a65" />
            <Text style={styles.emptyTitle}>
              {hasEnoughEntries 
                ? "Ready for Analysis" 
                : "Not Enough Entries"}
            </Text>
            <Text style={styles.emptyText}>
              {hasEnoughEntries 
                ? "Use the Generate Analysis button above to analyze your mood patterns."
                : "Add at least 3 journal entries to unlock mood analysis."}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginTop: 4,
  },
  filterChip: {
    marginRight: 8,
  },
  selectedFilterChip: {
    backgroundColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
  },
  selectedChipText: {
    fontSize: 14,
    color: 'white',
  },
  dateRangeText: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
    padding: 16,
  },
  errorText: {
    marginTop: 16,
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 18,
  },
  limitMessage: {
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    minHeight: 300,
  },
  emptyTitle: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryTitle: {
    marginBottom: 12,
  },
  summaryText: {
    lineHeight: 22,
  },
  emotionCard: {
    marginBottom: 16,
  },
  emotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emotionTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  emotionTitle: {
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    marginLeft: 4,
    fontSize: 12,
  },
  score: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  triggersTitle: {
    marginBottom: 8,
  },
  triggersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  triggerChip: {
    margin: 4,
    backgroundColor: '#EEEEEE',
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
    marginLeft: 4,
  },
  insightsCard: {
    marginBottom: 24,
    marginTop: 8,
  },
  insightsTitle: {
    marginBottom: 12,
  },
  insightsText: {
    lineHeight: 22,
  },
  recommendationsCard: {
    marginTop: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  recommendationText: {
    flex: 1,
    marginLeft: 12,
    lineHeight: 22,
  },
  generateButton: {
    borderRadius: 20,
  },
  generateButtonLabel: {
    paddingHorizontal: 8,
  },
  infoText: {
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
    fontSize: 12,
    opacity: 0.7,
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
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  limitBannerText: {
    marginLeft: 8,
    color: '#D32F2F',
    fontSize: 14,
  },
});

export default MoodGraphsScreen; 