import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from 'react-native-paper';

const WaveRecorder: React.FC = () => {
  const theme = useTheme();
  const [waveAnimations] = useState(() => Array(30).fill(0).map(() => new Animated.Value(0)));
  
  // Generate random heights for a realistic wave effect
  const generateRandomHeight = () => {
    return Math.random() * 0.7 + 0.3; // Between 0.3 and 1.0
  };

  useEffect(() => {
    // Create animations for each bar with different durations
    const animations = waveAnimations.map((anim, index) => {
      const duration = 400 + Math.random() * 600; // Between 400ms and 1000ms
      
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: generateRandomHeight(),
            duration: duration,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: generateRandomHeight() * 0.3,
            duration: duration,
            useNativeDriver: false,
          }),
        ])
      );
    });

    // Start all animations
    Animated.parallel(animations).start();

    // Cleanup on unmount
    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [waveAnimations]);

  return (
    <View style={styles.container}>
      <View style={styles.waveContainer}>
        {waveAnimations.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                backgroundColor: theme.colors.primary,
                height: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  bar: {
    width: 3,
    borderRadius: 3,
    flex: 1,
    marginHorizontal: 1,
  },
});

export default WaveRecorder; 