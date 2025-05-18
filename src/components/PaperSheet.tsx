import React, { useEffect } from 'react';
import { ImageBackground, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import { devLog } from '../utils/devLog';

type PaperSheetProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

const PaperSheet: React.FC<PaperSheetProps> = ({ children, style }) => {
  // devLog("PaperSheet rendering");
  const theme = useTheme();
  
  // useEffect(() => {
  //   devLog("PaperSheet mounted");
  // }, []);

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.surface, style]}>
        <View style={styles.innerContainer}>
          <ImageBackground
            source={require('../../assets/branding/paper_texture.png')}
            style={styles.background}
            imageStyle={{ opacity: 0.06 }}
            resizeMode="cover"
          >
            {children}
          </ImageBackground>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  surface: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default PaperSheet; 