/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Emotion } from '../store/useJournalStore';

type EmotionChipProps = {
  emotion: Emotion;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
};

const EmotionChip: React.FC<EmotionChipProps> = ({ 
  emotion, 
  size = 'medium', 
  showLabel = true 
}) => {
  const theme = useTheme();
  
  const getSize = () => {
    switch (size) {
      case 'small': return { container: 22, emoji: 14, fontSize: 10 };
      case 'large': return { container: 38, emoji: 24, fontSize: 14 };
      default: return { container: 30, emoji: 18, fontSize: 12 };
    }
  };
  
  const sizeValues = getSize();
  
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.colors.primary + '30', // 30% opacity
        borderColor: theme.colors.primary,
        height: sizeValues.container,
        paddingHorizontal: showLabel ? 8 : sizeValues.container / 4,
        borderRadius: sizeValues.container / 2,
      }
    ]}>
      <Text style={[styles.emoji, { fontSize: sizeValues.emoji }]}>
        {emotion.emoji}
      </Text>
      
      {showLabel && (
        <Text style={[
          styles.label, 
          { 
            color: theme.colors.onSurface,
            fontSize: sizeValues.fontSize,
            marginLeft: 4,
            fontFamily: 'WorkSans_500Medium'
          }
        ]}>
          {emotion.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
  },
  emoji: {
    lineHeight: 22,
  },
  label: {
    textTransform: 'capitalize',
  }
});

export default EmotionChip; 