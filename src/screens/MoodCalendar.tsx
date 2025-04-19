import React, { useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Text, useTheme, Chip } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Calendar } from 'react-native-calendars';
import { useJournalStore } from '../store/useJournalStore';
import { format, subMonths, isThisYear } from 'date-fns';
import PaperSheet from '../components/PaperSheet';
import { useSpacing } from '../utils/useSpacing';
import * as Haptics from 'expo-haptics';

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
        fontFamily: string;
      };
    };
  };
};

const MoodCalendarScreen: React.FC<MoodCalendarScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { hPad } = useSpacing();
  const moods = useJournalStore(state => state.moods);
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
    
    moods.forEach(mood => {
      const score = mood.score;
      if (score >= 1 && score <= 5) {
        marked[mood.date] = {
          customStyles: {
            container: {
              backgroundColor: moodColors[score - 1],
              borderRadius: 6,
            },
            text: {
              color: score > 3 ? '#3c2c1d' : '#6a4e42',
              fontFamily: 'WorkSans_400Regular',
            },
          },
        };
      }
    });
    
    return marked;
  }, [moods]);
  
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
  
  return (
    <PaperSheet>
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={{ backgroundColor: 'transparent' }}>
          <Appbar.BackAction onPress={handleBack} />
          <Appbar.Content 
            title="Mood Calendar" 
            titleStyle={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          />
        </Appbar.Header>
        
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
              textMonthFontFamily: 'PlayfairDisplay_700Bold',
              textDayHeaderFontFamily: 'WorkSans_500Medium',
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
                      fontFamily: 'PlayfairDisplay_700Bold',
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
                    textDayHeaderFontFamily: 'WorkSans_500Medium',
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
          <Text 
            style={[
              styles.legendTitle, 
              { 
                fontFamily: 'PlayfairDisplay_700Bold',
                color: theme.colors.onBackground
              }
            ]}
          >
            Mood Legend
          </Text>
          <View style={styles.legendRow}>
            {moodColors.map((color, index) => (
              <View key={index} style={styles.legendItem}>
                <View 
                  style={[
                    styles.colorSquare, 
                    { backgroundColor: color }
                  ]} 
                />
                <Text 
                  style={[
                    styles.legendText, 
                    { 
                      fontFamily: 'WorkSans_400Regular',
                      color: theme.colors.onSurfaceVariant
                    }
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
            ))}
          </View>
          <Text 
            style={[
              styles.legendSubtext, 
              { 
                fontFamily: 'WorkSans_400Regular',
                color: theme.colors.onSurfaceVariant
              }
            ]}
          >
            1 = Low Mood, 5 = High Mood
          </Text>
        </View>
      </SafeAreaView>
    </PaperSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  chip: {
    marginRight: 12,
  },
  calendar: {
    borderRadius: 12,
    elevation: 2,
  },
  monthContainer: {
    marginBottom: 24,
  },
  monthName: {
    fontSize: 18,
    marginBottom: 8,
    marginLeft: 8,
  },
  yearCalendar: {
    borderRadius: 12,
    elevation: 1,
  },
  legendContainer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  legendTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 14,
  },
  legendSubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default MoodCalendarScreen; 