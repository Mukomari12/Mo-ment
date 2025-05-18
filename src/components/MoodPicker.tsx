/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MoodPickerProps {
  selectedMood: number | null;
  onSelectMood: (score: number) => void;
}

type MoodIcon = 
  | 'emoticon-sad-outline'
  | 'emoticon-confused-outline'
  | 'emoticon-neutral-outline'
  | 'emoticon-happy-outline'
  | 'emoticon-excited-outline';

export const MoodPicker: React.FC<MoodPickerProps> = ({ 
  selectedMood, 
  onSelectMood 
}) => {
  const theme = useTheme();
  
  const moods = [
    { score: 1, icon: 'emoticon-sad-outline' as MoodIcon, label: 'Very Low' },
    { score: 2, icon: 'emoticon-confused-outline' as MoodIcon, label: 'Low' },
    { score: 3, icon: 'emoticon-neutral-outline' as MoodIcon, label: 'Neutral' },
    { score: 4, icon: 'emoticon-happy-outline' as MoodIcon, label: 'Good' },
    { score: 5, icon: 'emoticon-excited-outline' as MoodIcon, label: 'Excellent' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling?</Text>
      <View style={styles.moodContainer}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.score}
            style={[
              styles.moodButton,
              selectedMood === mood.score && {
                backgroundColor: theme.colors.primaryContainer,
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() => onSelectMood(mood.score)}
          >
            <MaterialCommunityIcons
              name={mood.icon}
              size={32}
              color={selectedMood === mood.score ? theme.colors.primary : theme.colors.onSurface}
            />
            <Text 
              style={[
                styles.moodLabel,
                selectedMood === mood.score && { color: theme.colors.primary }
              ]}
            >
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '18%',
  },
  moodLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
}); 