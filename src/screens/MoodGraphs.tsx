import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Appbar, Text, SegmentedButtons, useTheme, Card } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Svg, { Path, Line, Text as SvgText, G } from 'react-native-svg';
import { useJournalStore } from '../store/useJournalStore';

type MoodGraphsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MoodGraphs'>;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRAPH_WIDTH = SCREEN_WIDTH - 40;
const GRAPH_HEIGHT = 220;
const PADDING = { top: 20, right: 10, bottom: 30, left: 40 };

const MoodGraphsScreen: React.FC<MoodGraphsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const moods = useJournalStore(state => state.moods);
  const [timeframe, setTimeframe] = useState('week');
  const [moodData, setMoodData] = useState(moods);

  useEffect(() => {
    // Filter data based on selected timeframe
    if (timeframe === 'week') {
      setMoodData(moods.slice(0, 7));
    } else {
      setMoodData(moods);
    }
  }, [timeframe, moods]);

  const renderAreaChart = () => {
    if (!moodData.length) return null;

    // Calculate scaling factors
    const xScale = (GRAPH_WIDTH - PADDING.left - PADDING.right) / (moodData.length - 1);
    const yScale = (GRAPH_HEIGHT - PADDING.top - PADDING.bottom) / 4; // For range 1-5

    // Generate path for the area chart
    let pathD = '';
    const points: [number, number][] = [];

    moodData.forEach((item, index) => {
      const x = PADDING.left + index * xScale;
      const y = GRAPH_HEIGHT - PADDING.bottom - (item.score - 1) * yScale;
      points.push([x, y]);

      if (index === 0) {
        pathD += `M ${x},${y}`;
      } else {
        pathD += ` L ${x},${y}`;
      }
    });

    // Complete the path to form a closed area
    pathD += ` L ${points[points.length - 1][0]},${GRAPH_HEIGHT - PADDING.bottom}`;
    pathD += ` L ${points[0][0]},${GRAPH_HEIGHT - PADDING.bottom}`;
    pathD += ' Z';

    // Generate x-axis labels (dates)
    const xLabels = moodData.map((item) => {
      const date = new Date(item.date);
      return date.getDate().toString();
    });

    // Generate grid lines and y-axis labels
    const yLabels = ['1', '2', '3', '4', '5'];
    const yGridLines = yLabels.map((label, index) => {
      const y = GRAPH_HEIGHT - PADDING.bottom - index * yScale;
      return (
        <Line
          key={`grid-${index}`}
          x1={PADDING.left}
          y1={y}
          x2={GRAPH_WIDTH - PADDING.right}
          y2={y}
          stroke={theme.colors.outlineVariant}
          strokeWidth={0.5}
          strokeDasharray="5,5"
        />
      );
    });

    return (
      <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
        {/* Y-axis labels */}
        {yLabels.map((label, index) => (
          <SvgText
            key={`y-label-${index}`}
            x={PADDING.left - 10}
            y={GRAPH_HEIGHT - PADDING.bottom - index * yScale + 5}
            fontSize="12"
            fill={theme.colors.onSurfaceVariant}
            textAnchor="end"
          >
            {label}
          </SvgText>
        ))}

        {/* X-axis labels */}
        {xLabels.map((label, index) => {
          const x = PADDING.left + index * xScale;
          return (
            <SvgText
              key={`x-label-${index}`}
              x={x}
              y={GRAPH_HEIGHT - 10}
              fontSize="10"
              fill={theme.colors.onSurfaceVariant}
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}

        {/* Grid lines */}
        {yGridLines}

        {/* Area chart */}
        <Path
          d={pathD}
          fill={`${theme.colors.primary}40`} // Add transparency
          stroke={theme.colors.primary}
          strokeWidth={2}
        />

        {/* Data points */}
        {points.map(([x, y], index) => (
          <G key={`point-${index}`}>
            <SvgText
              x={x}
              y={y - 10}
              fontSize="10"
              fill={theme.colors.primary}
              textAnchor="middle"
            >
              {moodData[index].score}
            </SvgText>
            <Path
              d={`M ${x-4},${y} a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0`}
              fill={theme.colors.primary}
            />
          </G>
        ))}
      </Svg>
    );
  };

  const getAverageMood = () => {
    if (!moodData.length) return 0;
    const sum = moodData.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / moodData.length).toFixed(1);
  };

  const getMoodTrend = () => {
    if (moodData.length < 2) return 'Neutral';
    
    const first = moodData[moodData.length - 1].score;
    const last = moodData[0].score;
    const diff = last - first;
    
    if (diff > 1) return 'Improving significantly';
    if (diff > 0) return 'Slightly improving';
    if (diff < -1) return 'Declining significantly';
    if (diff < 0) return 'Slightly declining';
    return 'Stable';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Mood Graphs" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <SegmentedButtons
          value={timeframe}
          onValueChange={setTimeframe}
          buttons={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
          style={styles.segmentedButtons}
        />

        <Card style={styles.graphCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.graphTitle}>
              Mood Over {timeframe === 'week' ? 'Past Week' : 'Past Month'}
            </Text>
            <View style={styles.graphContainer}>
              {renderAreaChart()}
            </View>
          </Card.Content>
        </Card>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="labelLarge">Average Mood</Text>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                {getAverageMood()}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="labelLarge">Trend</Text>
              <Text variant="titleMedium" style={{ color: theme.colors.secondary }}>
                {getMoodTrend()}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  graphCard: {
    marginBottom: 16,
  },
  graphTitle: {
    marginBottom: 16,
  },
  graphContainer: {
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
  },
});

export default MoodGraphsScreen; 