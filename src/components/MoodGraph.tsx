import React, { useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Svg, { Polyline, Line, Rect, Text as SvgText } from 'react-native-svg';
import Placeholder from './Placeholder';
import { useJournalStore } from '../store/useJournalStore';
import { devLog } from '../utils/devLog';

type MoodGraphProps = {
  timeRange: '7days' | '30days';
};

const MoodGraph: React.FC<MoodGraphProps> = ({ timeRange }) => {
  const theme = useTheme();
  const entries = useJournalStore(state => state.entries);
  
  // Filter and prepare mood data for the chart
  const moodData = useMemo(() => {
    if (!entries.length) return { chartData: [], averageMood: 0, highestMood: 0, lowestMood: 0 };
    
    const now = new Date().getTime();
    const daysInMs = timeRange === '7days' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    const cutoffTime = now - daysInMs;
    
    // Filter entries by date and only include those with mood data
    const filteredEntries = [...entries]
      .sort((a, b) => a.createdAt - b.createdAt)
      .filter(entry => entry.createdAt >= cutoffTime && entry.mood !== undefined);
    
    if (filteredEntries.length === 0) {
      return { chartData: [], averageMood: 0, highestMood: 0, lowestMood: 0 };
    }
    
    // Prepare data for chart
    const chartData = filteredEntries.map(entry => ({
      x: new Date(entry.createdAt),
      y: entry.mood || 0
    }));
    
    // Calculate stats from the filtered entries
    const moodValues = filteredEntries.map(entry => entry.mood || 0);
    const averageMood = Math.round(moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length * 10) / 10;
    const highestMood = Math.max(...moodValues);
    const lowestMood = Math.min(...moodValues);
    
    return { chartData, averageMood, highestMood, lowestMood };
  }, [entries, timeRange]);

  devLog('MoodGraph data', moodData.chartData.length);
  
  if (moodData.chartData.length === 0) {
    return <Placeholder msg="No mood data yet." />;
  }

  // Chart dimensions
  const svgWidth = Dimensions.get('window').width - 60;
  const svgHeight = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 30 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  
  // Create points for SVG polyline
  const chartPoints = useMemo(() => {
    if (moodData.chartData.length === 0) return "";
    
    // Find min and max dates for x-axis scaling
    const dates = moodData.chartData.map(d => d.x.getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const dateRange = maxDate - minDate || 1; // Avoid division by zero
    
    // Map data points to SVG coordinates
    return moodData.chartData.map(point => {
      // Scale x position based on date
      const x = padding.left + ((point.x.getTime() - minDate) / dateRange) * chartWidth;
      
      // Scale y position (invert y-axis since SVG 0,0 is top-left)
      // Map mood 1-5 to chart height
      const y = svgHeight - padding.bottom - ((point.y - 1) / 4) * chartHeight;
      
      return `${x},${y}`;
    }).join(" ");
  }, [moodData.chartData, chartWidth, chartHeight, padding]);
  
  // Create y-axis labels
  const yAxisLabels = ['1', '2', '3', '4', '5'];
  
  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Text 
          style={[
            styles.chartTitle, 
            { fontFamily: 'PlayfairDisplay_700Bold', color: theme.colors.onBackground }
          ]}
        >
          Mood Trends
        </Text>
        
        <View style={styles.svgContainer}>
          <Svg width={svgWidth} height={svgHeight}>
            {/* Background */}
            <Rect 
              x={padding.left} 
              y={padding.top} 
              width={chartWidth} 
              height={chartHeight} 
              fill="#f5f5f5" 
              opacity={0.3}
            />
            
            {/* Y-axis grid lines and labels */}
            {yAxisLabels.map((label, i) => {
              const y = svgHeight - padding.bottom - (i / 4) * chartHeight;
              return (
                <React.Fragment key={i}>
                  <Line 
                    x1={padding.left} 
                    y1={y} 
                    x2={svgWidth - padding.right} 
                    y2={y} 
                    stroke="#ccc" 
                    strokeWidth="1" 
                    strokeDasharray="5,5"
                  />
                  <SvgText 
                    x={padding.left - 10} 
                    y={y + 5} 
                    fill={theme.colors.onSurfaceVariant} 
                    fontSize="10" 
                    textAnchor="end"
                  >
                    {label}
                  </SvgText>
                </React.Fragment>
              );
            })}
            
            {/* X-axis */}
            <Line 
              x1={padding.left} 
              y1={svgHeight - padding.bottom} 
              x2={svgWidth - padding.right} 
              y2={svgHeight - padding.bottom} 
              stroke="#ccc" 
              strokeWidth="1"
            />
            
            {/* Data line */}
            <Polyline
              points={chartPoints}
              fill="none"
              stroke={theme.colors.primary}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </Svg>
        </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
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
  svgContainer: {
    alignItems: 'center',
    marginHorizontal: -10,
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

export default MoodGraph; 