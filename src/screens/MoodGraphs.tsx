import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import { Appbar, Text, useTheme, SegmentedButtons } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore } from '../store/useJournalStore';
import PaperSheet from '../components/PaperSheet';
import * as Haptics from 'expo-haptics';

type MoodGraphsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MoodGraphs'>;
};

const MoodGraphsScreen: React.FC<MoodGraphsScreenProps> = ({ navigation }) => {
  console.log('MoodGraphs props:', { props: { navigation }, routeParams: {} });
  
  const theme = useTheme();
  const entries = useJournalStore(state => state.entries);
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');
  
  // Filter and prepare mood data for the chart
  const moodData = useMemo(() => {
    if (!entries.length) return { labels: [], values: [], averageMood: 0, highestMood: 0, lowestMood: 0 };
    
    const now = new Date().getTime();
    const daysInMs = timeRange === '7days' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    const cutoffTime = now - daysInMs;
    
    // Filter entries by date and only include those with mood data
    const filteredEntries = entries
      .filter(entry => entry.createdAt >= cutoffTime && entry.mood !== undefined)
      .sort((a, b) => a.createdAt - b.createdAt);
    
    if (filteredEntries.length === 0) {
      return { labels: [], values: [], averageMood: 0, highestMood: 0, lowestMood: 0 };
    }
    
    // Format dates for labels
    const labels = filteredEntries.map(entry => {
      const date = new Date(entry.createdAt);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    // Prepare mood values
    const values = filteredEntries.map(entry => entry.mood || 0);
    
    // Calculate stats
    const averageMood = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length * 10) / 10;
    const highestMood = Math.max(...values);
    const lowestMood = Math.min(...values);
    
    return { labels, values, averageMood, highestMood, lowestMood };
  }, [entries, timeRange]);
  
  const handleTimeRangeChange = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeRange(value as '7days' | '30days');
  };
  
  // Show a fallback if there are no entries
  if (entries.length === 0) {
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
              title="Mood Insights" 
              titleStyle={{ fontFamily: 'PlayfairDisplay_700Bold' }}
            />
          </Appbar.Header>
          
          <View style={{flex:1, justifyContent:'center', alignItems:'center', padding: 20}}>
            <Text variant="bodyMedium">Add at least one entry to view analytics.</Text>
          </View>
        </SafeAreaView>
      </PaperSheet>
    );
  }
  
  // Show a special message if there's no mood data for the selected range
  if (moodData.labels.length === 0) {
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
              title="Mood Insights" 
              titleStyle={{ fontFamily: 'PlayfairDisplay_700Bold' }}
            />
          </Appbar.Header>
          
          <View style={styles.timeFilterContainer}>
            <SegmentedButtons
              value={timeRange}
              onValueChange={handleTimeRangeChange}
              buttons={[
                {
                  value: '7days',
                  label: 'Last 7 Days',
                },
                {
                  value: '30days',
                  label: 'Last 30 Days',
                }
              ]}
              style={styles.segmentedButtons}
            />
          </View>
          
          <View style={{flex:1, justifyContent:'center', alignItems:'center', padding: 20}}>
            <Text variant="bodyMedium">No mood data available for this time period.</Text>
          </View>
        </SafeAreaView>
      </PaperSheet>
    );
  }
  
  // Width for the chart (full screen width minus padding)
  const screenWidth = Dimensions.get('window').width - 40;
  
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
            title="Mood Insights" 
            titleStyle={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          />
        </Appbar.Header>
        
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.timeFilterContainer}>
            <SegmentedButtons
              value={timeRange}
              onValueChange={handleTimeRangeChange}
              buttons={[
                {
                  value: '7days',
                  label: 'Last 7 Days',
                },
                {
                  value: '30days',
                  label: 'Last 30 Days',
                }
              ]}
              style={styles.segmentedButtons}
            />
          </View>
          
          <View style={styles.chartContainer}>
            <Text 
              style={[
                styles.chartTitle, 
                { fontFamily: 'PlayfairDisplay_700Bold', color: theme.colors.onBackground }
              ]}
            >
              Mood Trends
            </Text>
            
            <LineChart
              data={{
                labels: moodData.labels,
                datasets: [
                  {
                    data: moodData.values,
                    color: () => theme.colors.primary,
                    strokeWidth: 3
                  }
                ]
              }}
              width={screenWidth}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 0,
                color: () => theme.colors.primary,
                labelColor: () => theme.colors.onSurfaceVariant,
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: theme.colors.primary
                },
                style: {
                  borderRadius: 16
                }
              }}
              bezier
              style={styles.chart}
              fromZero
              yAxisSuffix=""
              yAxisInterval={1}
              segments={5}
            />
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text variant="labelMedium" style={styles.statLabel}>Average Mood</Text>
              <Text 
                variant="headlineSmall" 
                style={[
                  styles.statValue, 
                  { fontFamily: 'PlayfairDisplay_700Bold', color: theme.colors.primary }
                ]}
              >
                {moodData.averageMood}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text variant="labelMedium" style={styles.statLabel}>Highest</Text>
              <Text 
                variant="headlineSmall" 
                style={[
                  styles.statValue, 
                  { fontFamily: 'PlayfairDisplay_700Bold', color: theme.colors.primary }
                ]}
              >
                {moodData.highestMood}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text variant="labelMedium" style={styles.statLabel}>Lowest</Text>
              <Text 
                variant="headlineSmall" 
                style={[
                  styles.statValue, 
                  { fontFamily: 'PlayfairDisplay_700Bold', color: theme.colors.primary }
                ]}
              >
                {moodData.lowestMood}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </PaperSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  timeFilterContainer: {
    marginBottom: 20,
  },
  segmentedButtons: {
    backgroundColor: '#f5efe7',
  },
  chartContainer: {
    marginBottom: 24,
    backgroundColor: '#f9f6f2',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
    paddingRight: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9f6f2',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    textAlign: 'center',
  },
});

export default MoodGraphsScreen; 