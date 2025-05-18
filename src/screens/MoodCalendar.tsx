import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, Chip } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Calendar } from 'react-native-calendars';
import { useJournalStore } from '../store/useJournalStore';
import { format, subMonths, isThisYear } from 'date-fns';
import { useSpacing } from '../utils/useSpacing';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type MoodCalendarScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MoodCalendar'>;
};

type MarkedDates = {
  [date: string]: {
    customStyles: {
      container: {
        backgroundColor: string;
        borderRadius: number;
      };
      text: {
        color: string;
      };
    };
  };
};

const MoodCalendarScreen: React.FC<MoodCalendarScreenProps> = ({ navigation }) => {
  console.log('MoodCalendarScreen rendered');
  
  const theme = useTheme();
  const { hPad } = useSpacing();
  const moods = useJournalStore(state => state.moods);
  const entries = useJournalStore(state => state.entries);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  
  // Mood color mapping for heatmap (1-5 scale)
  const moodColors = [
    '#ede8e2', // 1 - very light beige
    '#d8cfc6', // 2 - light beige
    '#c4b5aa', // 3 - medium beige
    '#af9c8e', // 4 - darker beige
    '#9a836f'  // 5 - darkest beige (close to camel primary)
  ];
  
  // Generate marked dates for calendar
  const markedDates = useMemo(() => {
    const marked: MarkedDates = {};
    
    // Instead of using the moods array, we'll generate dates from entries with mood data
    entries.forEach(entry => {
      if (entry.mood) {
        // Convert the timestamp to date string format (YYYY-MM-DD)
        const date = new Date(entry.createdAt).toISOString().split('T')[0];
        
        // If the mood is a number directly, use it
        let score: number;
        if (typeof entry.mood === 'number') {
          score = entry.mood;
        } else if (typeof entry.mood === 'object' && entry.mood !== null) {
          // If the mood is an Emotion object with a label, convert it to a number
          // This is just a simplistic mapping - you may want to enhance this
          const moodMap: Record<string, number> = {
            'Very Low': 1,
            'Low': 2,
            'Neutral': 3,
            'Good': 4,
            'Excellent': 5
          };
          score = moodMap[entry.mood.label] || 3; // Default to neutral if no match
        } else {
          return; // Skip this entry if no valid mood
        }
        
        // Keep scores within the 1-5 range
        const clampedScore = Math.min(5, Math.max(1, score));
        
        marked[date] = {
          customStyles: {
            container: {
              backgroundColor: moodColors[clampedScore - 1],
              borderRadius: 6,
            },
            text: {
              color: clampedScore > 3 ? '#3c2c1d' : '#6a4e42',
            },
          },
        };
      }
    });
    
    return marked;
  }, [entries, moodColors]);
  
  // Only log when marked dates count changes, not on every render
  useEffect(() => {
    const markedDatesCount = Object.keys(markedDates).length;
    const entriesWithMoodCount = entries.filter(entry => entry.mood !== undefined).length;
    console.log('MoodCalendar marked dates:', markedDatesCount, 'from', entriesWithMoodCount, 'entries with mood data');
  }, [markedDates, entries]);
  
  const toggleViewMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode(prev => prev === 'month' ? 'year' : 'month');
  };
  
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };
  
  // Get current date formatted
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  
  // Get past year dates for year view
  const getYearMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      months.push(format(subMonths(now, i), 'yyyy-MM'));
    }
    return months.reverse();
  };
  
  // Render month name header
  const renderMonthName = (month: string) => {
    const date = new Date(month + '-01');
    const monthName = format(date, 'MMMM');
    const yearText = !isThisYear(date) ? format(date, ' yyyy') : '';
    return `${monthName}${yearText}`;
  };
  
  // Show a fallback if there's no data
  const entriesWithMood = entries.filter(entry => entry.mood !== undefined);
  if (entriesWithMood.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text variant="headlineMedium">No Mood Data</Text>
          <Text variant="bodyLarge" style={{textAlign: 'center', marginTop: 10}}>
            Create entries with mood ratings to see your calendar.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.filterContainer, { paddingHorizontal: hPad }]}>
        <Chip
          selected={viewMode === 'month'}
          onPress={() => toggleViewMode()}
          style={[
            styles.chip,
            {
              backgroundColor: viewMode === 'month'
                ? theme.colors.primary + '30'
                : theme.colors.surfaceVariant,
            },
          ]}
        >
          Month View
        </Chip>
        
        <Chip
          selected={viewMode === 'year'}
          onPress={() => toggleViewMode()}
          style={[
            styles.chip,
            {
              backgroundColor: viewMode === 'year'
                ? theme.colors.primary + '30'
                : theme.colors.surfaceVariant,
            },
          ]}
        >
          Year View
        </Chip>
      </View>
      
      {viewMode === 'month' ? (
        <Calendar
          markingType="custom"
          markedDates={markedDates}
          initialDate={currentDate}
          theme={{
            calendarBackground: 'transparent',
            textSectionTitleColor: theme.colors.onBackground,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: theme.colors.primary,
            dayTextColor: theme.colors.onBackground,
            textDisabledColor: theme.colors.onSurfaceDisabled,
            monthTextColor: theme.colors.onBackground,
            textMonthFontSize: 18,
            textDayFontSize: 16,
            textDayHeaderFontSize: 13
          }}
          enableSwipeMonths={true}
          style={[
            styles.calendar,
            {
              marginHorizontal: hPad,
              marginBottom: 16,
            }
          ]}
        />
      ) : (
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: hPad }}
        >
          {getYearMonths().map(month => (
            <View key={month} style={styles.monthContainer}>
              <Text 
                style={[
                  styles.monthName, 
                  { 
                    color: theme.colors.onBackground,
                  }
                ]}
              >
                {renderMonthName(month)}
              </Text>
              <Calendar
                markingType="custom"
                markedDates={markedDates}
                hideArrows
                hideExtraDays
                initialDate={`${month}-01`}
                theme={{
                  calendarBackground: 'transparent',
                  textSectionTitleColor: theme.colors.onBackground,
                  selectedDayBackgroundColor: theme.colors.primary,
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: theme.colors.primary,
                  dayTextColor: theme.colors.onBackground,
                  textDisabledColor: theme.colors.onSurfaceDisabled,
                  monthTextColor: 'transparent', // Hide month name (we show our own)
                  textDayFontSize: 14,
                  textDayHeaderFontSize: 12
                }}
                style={styles.yearCalendar}
              />
            </View>
          ))}
        </ScrollView>
      )}
      
      <View style={[styles.legendContainer, { paddingHorizontal: hPad }]}>
        <Text style={styles.legendTitle}>Mood Legend</Text>
        <View style={styles.legend}>
          {moodColors.map((color, index) => (
            <View key={index} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor,
                  { backgroundColor: color }
                ]} 
              />
              <Text style={styles.legendText}>
                {index === 0 ? 'Low' : index === 4 ? 'High' : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F2',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#3d2f28',
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  chip: {
    minWidth: 120,
  },
  calendar: {
    borderRadius: 10,
    elevation: 2,
    marginTop: 10,
  },
  yearCalendar: {
    borderRadius: 10,
    marginBottom: 8,
  },
  monthContainer: {
    marginBottom: 24,
  },
  monthName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 8,
  },
  legendContainer: {
    marginVertical: 16,
  },
  legendTitle: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    alignItems: 'center',
  },
  legendColor: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginBottom: 4,
  },
  legendText: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default MoodCalendarScreen; 