import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

type EmptyStateProps = {
  onPress: () => void;
};

const EmptyState: React.FC<EmptyStateProps> = ({ onPress }) => {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/branding/empty_state.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text
        variant="titleMedium"
        style={[styles.text, { color: theme.colors.onBackground }]}
      >
        Start your first entry
      </Text>
      <Button
        mode="contained"
        onPress={onPress}
        style={styles.button}
      >
        New Entry
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  text: {
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    minWidth: 160,
  },
});

export default EmptyState; 