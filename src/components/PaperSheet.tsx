import React, { useEffect } from 'react';
import { ImageBackground, StyleSheet, View, ViewStyle, Text } from 'react-native';
import { useTheme, Surface } from 'react-native-paper';

type PaperSheetProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

const PaperSheet: React.FC<PaperSheetProps> = ({ children, style }) => {
  console.log("PaperSheet rendering");
  const theme = useTheme();
  
  useEffect(() => {
    console.log("PaperSheet mounted");
  }, []);

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
            {/* Debug text */}
            <Text style={{position: 'absolute', top: 5, right: 5, fontSize: 10, color: 'red'}}>
              PAPERSHEET VISIBLE
            </Text>
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