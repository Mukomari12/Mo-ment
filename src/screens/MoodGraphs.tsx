import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  useTheme, 
  Appbar,
  Chip,
  Card,
} from 'react-native-paper';
import { 
  VictoryChart, 
  VictoryArea, 
  VictoryAxis, 
  VictoryLine,
  VictoryVoronoiContainer,
  VictoryLabel,
  VictoryTheme
} from 'victory-native';
import { Svg, Defs, LinearGradient, Stop } from 'react-native-svg';
import PaperSheet from '../components/PaperSheet';
import { useJournalStore } from '../store/useJournalStore';
import { useSpacing } from '../utils/useSpacing';
import { format, subDays } from 'date-fns';
import * as Haptics from 'expo-haptics';

const MoodGraphsScreen = () => {
  const theme = useTheme();
  const { hPad } = useSpacing();
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const moods = useJournalStore(state => state.moods);
  
  const handleRangeChange = (range: '7d' | '30d') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeRange(range);
  };
  
  // Filter data based on selected time range
  const getMoodData = () => {
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : 30;
    const startDate = subDays(now, daysAgo);
    
    return moods
      .filter(mood => new Date(mood.date) >= startDate)
      .map(mood => ({
        x: new Date(mood.date),
        y: mood.score,
        date: mood.date
      }))
      .sort((a, b) => a.x.getTime() - b.x.getTime());
  };
  
  const moodData = getMoodData();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - (hPad * 2) - 32; // Account for card padding
  
  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM d');
  };
  
  return (
    <PaperSheet>
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={{ backgroundColor: 'transparent' }}>
          <Appbar.BackAction onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
          <Appbar.Content 
            title="Mood Insights" 
            titleStyle={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          />
        </Appbar.Header>
        
        <View style={[styles.content, { paddingHorizontal: hPad }]}>
          {/* Time Range Filter */}
          <View style={styles.filterContainer}>
            <Chip 
              selected={timeRange === '7d'} 
              onPress={() => handleRangeChange('7d')}
              style={[
                styles.chip, 
                { 
                  backgroundColor: timeRange === '7d' 
                    ? theme.colors.primary + '30' 
                    : theme.colors.surfaceVariant
                }
              ]}
            >
              7 days
            </Chip>
            <Chip 
              selected={timeRange === '30d'} 
              onPress={() => handleRangeChange('30d')}
              style={[
                styles.chip, 
                { 
                  backgroundColor: timeRange === '30d' 
                    ? theme.colors.primary + '30' 
                    : theme.colors.surfaceVariant
                }
              ]}
            >
              30 days
            </Chip>
          </View>
          
          {/* Mood Chart */}
          <Card 
            style={[
              styles.chartCard, 
              { 
                elevation: 4, 
                shadowColor: theme.colors.secondary + '26',
                backgroundColor: theme.colors.surface,
                borderRadius: theme.roundness,
              }
            ]}
          >
            <Card.Content>
              <Text 
                variant="titleMedium" 
                style={{ 
                  marginBottom: 16, 
                  fontFamily: 'PlayfairDisplay_700Bold' 
                }}
              >
                Mood Trends
              </Text>
              
              {moodData.length > 0 ? (
                <View style={styles.chartContainer}>
                  <Svg height={220} width={chartWidth}>
                    <Defs>
                      <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity={0.25} />
                        <Stop offset="100%" stopColor={theme.colors.primary} stopOpacity={0.05} />
                      </LinearGradient>
                    </Defs>
                    <VictoryChart
                      width={chartWidth}
                      height={200}
                      padding={{ top: 10, bottom: 40, left: 50, right: 20 }}
                      domainPadding={{ y: 10 }}
                      theme={VictoryTheme.material}
                      containerComponent={
                        <VictoryVoronoiContainer
                          voronoiDimension="x"
                          labels={({ datum }) => `${formatDate(datum.date)}: ${datum.y}`}
                          labelComponent={
                            <VictoryLabel
                              style={{ 
                                fill: theme.colors.onSurface, 
                                fontFamily: 'WorkSans_400Regular' 
                              }}
                              dy={-15}
                              backgroundStyle={{
                                fill: theme.colors.surfaceVariant,
                                stroke: theme.colors.primary,
                                strokeWidth: 1,
                                rx: 4
                              }}
                              backgroundPadding={{ top: 4, bottom: 4, left: 6, right: 6 }}
                            />
                          }
                        />
                      }
                    >
                      <VictoryAxis 
                        tickFormat={(x) => {
                          // Only show a few dates to avoid clutter
                          const date = new Date(x);
                          const index = moodData.findIndex(d => d.x.getTime() === date.getTime());
                          
                          // For 7 days, show every other day
                          // For 30 days, show every 5 days
                          const showEvery = timeRange === '7d' ? 2 : 5;
                          
                          if (index % showEvery === 0 || index === moodData.length - 1) {
                            return format(date, 'MMM d');
                          }
                          return '';
                        }}
                        style={{
                          tickLabels: { 
                            fontSize: 10, 
                            padding: 5,
                            fontFamily: 'WorkSans_400Regular',
                            fill: theme.colors.onSurface
                          },
                          axis: { stroke: theme.colors.onSurfaceVariant, strokeWidth: 1 }
                        }}
                      />
                      <VictoryAxis 
                        dependentAxis
                        domain={[0, 6]}
                        tickValues={[1, 2, 3, 4, 5]}
                        style={{
                          tickLabels: { 
                            fontSize: 10, 
                            padding: 5,
                            fontFamily: 'WorkSans_400Regular',
                            fill: theme.colors.onSurface
                          },
                          axis: { stroke: theme.colors.onSurfaceVariant, strokeWidth: 1 },
                          grid: { 
                            stroke: theme.colors.surfaceVariant, 
                            strokeWidth: 1,
                            strokeDasharray: '4, 4'
                          }
                        }}
                      />
                      <VictoryArea 
                        data={moodData}
                        interpolation="monotoneX"
                        style={{
                          data: { 
                            fill: "url(#grad)",
                            strokeWidth: 0
                          }
                        }}
                      />
                      <VictoryLine 
                        data={moodData}
                        interpolation="monotoneX"
                        style={{
                          data: { 
                            stroke: theme.colors.primary,
                            strokeWidth: 2
                          }
                        }}
                      />
                    </VictoryChart>
                  </Svg>
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={{ fontFamily: 'WorkSans_400Regular' }}>
                    Not enough data to display for the selected time range.
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
          
          {/* Stats Summary */}
          <Card 
            style={[
              styles.statsCard, 
              { 
                elevation: 4, 
                shadowColor: theme.colors.secondary + '26',
                backgroundColor: theme.colors.surface,
                borderRadius: theme.roundness,
              }
            ]}
          >
            <Card.Content>
              <Text 
                variant="titleSmall" 
                style={{ 
                  marginBottom: 8, 
                  fontFamily: 'PlayfairDisplay_700Bold' 
                }}
              >
                Summary
              </Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statColumn}>
                  <Text style={styles.statLabel}>Average Mood</Text>
                  <Text style={styles.statValue}>
                    {moodData.length > 0
                      ? (moodData.reduce((sum, item) => sum + item.y, 0) / moodData.length).toFixed(1)
                      : 'N/A'
                    }
                  </Text>
                </View>
                
                <View style={styles.statColumn}>
                  <Text style={styles.statLabel}>Highest</Text>
                  <Text style={styles.statValue}>
                    {moodData.length > 0
                      ? Math.max(...moodData.map(d => d.y))
                      : 'N/A'
                    }
                  </Text>
                </View>
                
                <View style={styles.statColumn}>
                  <Text style={styles.statLabel}>Lowest</Text>
                  <Text style={styles.statValue}>
                    {moodData.length > 0
                      ? Math.min(...moodData.map(d => d.y))
                      : 'N/A'
                    }
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          {/* Legend */}
          <View style={styles.legend}>
            <Text 
              style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}
            >
              1 = Very Low, 5 = Very High
            </Text>
          </View>
        </View>
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
    paddingBottom: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  chip: {
    marginRight: 12,
  },
  chartCard: {
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statColumn: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'WorkSans_400Regular',
    fontSize: 12,
    color: '#6a4e42',
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#b58a65',
  },
  legend: {
    alignItems: 'center',
    marginTop: 8,
  },
  legendText: {
    fontFamily: 'WorkSans_400Regular',
    fontSize: 12,
  },
});

export default MoodGraphsScreen; 