import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface PlaceholderProps {
  msg: string;
}

const Placeholder = ({ msg }: PlaceholderProps) => (
  <View style={styles.container}>
    <Text variant="bodyLarge" style={styles.text}>{msg}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  text: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default Placeholder; 