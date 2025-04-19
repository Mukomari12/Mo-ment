import React from 'react';
import { ImageBackground, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

type PaperSheetProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

const PaperSheet: React.FC<PaperSheetProps> = ({ children, style }) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      <ImageBackground
        source={require('../../assets/branding/paper_texture.png')}
        style={styles.background}
        imageStyle={{ opacity: 0.06 }}
        resizeMode="cover"
      >
        {children}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default PaperSheet; 