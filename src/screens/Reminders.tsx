import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Appbar, Text, Card, Switch, Button, Portal, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useJournalStore } from '../store/useJournalStore';
import DateTimePicker from '@react-native-community/datetimepicker';

type RemindersScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Reminders'>;
};

const RemindersScreen: React.FC<RemindersScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { settings, setSettings } = useJournalStore(state => ({
    settings: state.settings,
    setSettings: state.setSettings,
  }));

  const [showTimePicker, setShowTimePicker] = useState(false);

  // Convert time string to Date object for time picker
  const timeToDate = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };

  // Convert Date object back to time string
  const dateToTimeString = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [time, setTime] = useState(timeToDate(settings.reminderTime));

  const onTimeChange = (_: any, selectedTime: Date | undefined) => {
    // Close the picker for iOS
    if (Platform.OS === 'ios') {
      setShowTimePicker(false);
    }

    if (selectedTime) {
      setTime(selectedTime);
      const timeString = dateToTimeString(selectedTime);
      setSettings({ reminderTime: timeString });
    }
  };

  const toggleReminders = () => {
    setSettings({ remindersOn: !settings.remindersOn });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Journal Reminders" />
      </Appbar.Header>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons 
                name="bell-outline" 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text variant="titleLarge" style={styles.title}>
                Daily Reminders
              </Text>
            </View>
            
            <Text variant="bodyMedium" style={styles.description}>
              Set a daily reminder to write in your journal. 
              We'll send you a notification to help you stay consistent.
            </Text>
            
            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Enable reminders</Text>
              <Switch 
                value={settings.remindersOn} 
                onValueChange={toggleReminders}
                color={theme.colors.primary}
              />
            </View>
            
            {settings.remindersOn && (
              <View style={styles.timeSection}>
                <Text variant="bodyLarge" style={styles.timeLabel}>
                  Reminder Time
                </Text>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowTimePicker(true)}
                  style={styles.timeButton}
                >
                  {formatTime(settings.reminderTime)}
                </Button>
                
                {showTimePicker && (
                  <Portal>
                    <View style={[
                      styles.pickerContainer, 
                      { backgroundColor: theme.colors.surface }
                    ]}>
                      <View style={styles.pickerHeader}>
                        <Text variant="titleMedium">Select Time</Text>
                        <Button onPress={() => setShowTimePicker(false)}>Done</Button>
                      </View>
                      <DateTimePicker
                        value={time}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onTimeChange}
                        style={styles.timePicker}
                      />
                    </View>
                  </Portal>
                )}
              </View>
            )}
          </Card.Content>
        </Card>
        
        <Card style={[styles.card, styles.tipsCard]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.tipsTitle}>
              Tips for a Great Journaling Habit
            </Text>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={20} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={styles.tipText}>
                Set a reminder at a time when you're usually free
              </Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={20} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={styles.tipText}>
                Start with just 5 minutes a day
              </Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={20} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={styles.tipText}>
                Combine journaling with another daily habit
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>
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
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 24,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeSection: {
    marginTop: 8,
  },
  timeLabel: {
    marginBottom: 8,
  },
  timeButton: {
    alignSelf: 'flex-start',
  },
  pickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 5,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timePicker: {
    width: '100%',
  },
  tipsCard: {
    marginTop: 8,
  },
  tipsTitle: {
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    marginLeft: 8,
  },
});

export default RemindersScreen; 