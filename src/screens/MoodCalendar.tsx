import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Appbar, Text, Card, useTheme, Chip } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore } from '../store/useJournalStore';

type MoodCalendarScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MoodCalendar'>;
};

type DayData = {
  day: string;
  date: string;
  isEmpty: boolean;
  mood?: number;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAYS_IN_WEEK = 7;
const DAY_WIDTH = (SCREEN_WIDTH - 32) / DAYS_IN_WEEK;

// Helper to get number of days in month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper to get first day of month (0 = Sunday, 1 = Monday, etc.)
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MoodCalendarScreen: React.FC<MoodCalendarScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const moods = useJournalStore(state => state.moods);
  
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  
  // Get current month mood data
  const [monthMoods, setMonthMoods] = useState<Record<string, number>>({});
  
  useEffect(() => {
    // Convert array of mood objects to a map of date -> score
    const moodMap: Record<string, number> = {};
    moods.forEach(mood => {
      const date = mood.date;
      moodMap[date] = mood.score;
    });
    setMonthMoods(moodMap);
  }, [moods]);
  
  const getMoodColor = (score: number) => {
    const moodColors = [
      theme.colors.error,       // 1 - Very Bad
      theme.colors.errorContainer, // 2 - Bad
      theme.colors.surfaceVariant,  // 3 - Neutral
      theme.colors.primaryContainer, // 4 - Good
      theme.colors.primary,     // 5 - Very Good
    ];
    return moodColors[score - 1] || theme.colors.surfaceVariant;
  };
  
  const getMonthData = (): DayData[] => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const days: DayData[] = [];
    
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: '', date: '', isEmpty: true });
    }
    
    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i.toString(),
        date,
        isEmpty: false,
        mood: monthMoods[date]
      });
    }
    
    return days;
  };
  
  const renderCalendar = () => {
    const monthData = getMonthData();
    const weeks: DayData[][] = [];
    let week: DayData[] = [];
    
    // Create weeks
    monthData.forEach((day, index) => {
      week.push(day);
      
      if ((index + 1) % DAYS_IN_WEEK === 0 || index === monthData.length - 1) {
        // Fill remaining days in the last week
        if (index === monthData.length - 1 && week.length < DAYS_IN_WEEK) {
          const remaining = DAYS_IN_WEEK - week.length;
          for (let i = 0; i < remaining; i++) {
            week.push({ day: '', date: '', isEmpty: true });
          }
        }
        
        weeks.push([...week]);
        week = [];
      }
    });
    
    return (
      <View style={styles.calendarContainer}>
        {/* Day headers */}
        <View style={styles.daysHeader}>
          {DAYS.map((day, index) => (
            <View key={`day-${index}`} style={styles.dayHeaderCell}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>{day}</Text>
            </View>
          ))}
        </View>
        
        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {weeks.map((weekDays, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.weekRow}>
              {weekDays.map((day: DayData, dayIndex: number) => (
                <View
                  key={`day-${weekIndex}-${dayIndex}`}
                  style={[
                    styles.dayCell,
                    day.isEmpty ? styles.emptyCell : null,
                    day.date === `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}` 
                      ? { borderColor: theme.colors.primary, borderWidth: 1 }
                      : null
                  ]}
                >
                  <Text style={styles.dayText}>{day.day}</Text>
                  {day.mood && (
                    <View
                      style={[
                        styles.moodDot,
                        { backgroundColor: getMoodColor(day.mood) }
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  const goToPreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Mood Calendar" />
      </Appbar.Header>
      
      <ScrollView style={styles.content}>
        <Card style={styles.calendarCard}>
          <Card.Content>
            <View style={styles.monthSelector}>
              <Appbar.Action icon="chevron-left" onPress={goToPreviousMonth} />
              <Text variant="titleLarge">{MONTHS[month]} {year}</Text>
              <Appbar.Action icon="chevron-right" onPress={goToNextMonth} />
            </View>
            
            {renderCalendar()}
          </Card.Content>
        </Card>
        
        <Card style={styles.legendCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.legendTitle}>Mood Legend</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getMoodColor(1) }]} />
                <Text>Very Bad</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getMoodColor(2) }]} />
                <Text>Bad</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getMoodColor(3) }]} />
                <Text>Neutral</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getMoodColor(4) }]} />
                <Text>Good</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getMoodColor(5) }]} />
                <Text>Very Good</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
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
  calendarCard: {
    marginBottom: 16,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarContainer: {
    width: '100%',
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderCell: {
    width: DAY_WIDTH,
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarGrid: {
    width: '100%',
  },
  weekRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 8,
  },
  dayCell: {
    width: DAY_WIDTH,
    height: DAY_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  emptyCell: {
    opacity: 0,
  },
  dayText: {
    fontSize: 14,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  legendCard: {
    marginBottom: 16,
  },
  legendTitle: {
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '48%',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
});

export default MoodCalendarScreen; 