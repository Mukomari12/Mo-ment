import React from 'react';
import { View, StyleSheet, Image, SafeAreaView, Dimensions } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useSpacing } from '../utils/useSpacing';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { hPad } = useSpacing();
  const { width } = Dimensions.get('window');

  const handleGetStarted = () => {
    console.log("Get Started button pressed");
    navigation.navigate('Onboarding');
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: '#F9F6F2'}]}>
      {/* Main container with fixed positioning for reliable layout */}
      <View style={styles.content}>
        {/* Top section with logo and text */}
        <View style={styles.topSection}>
          <Image 
            source={require('../../assets/branding/logo_1024.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text 
            style={styles.appTitle}
            variant="headlineLarge"
          >
            Mo-ment
          </Text>
          <Text 
            style={styles.tagline}
          >
            Capture life, one moment at a time
          </Text>
        </View>
        
        {/* Bottom section with button */}
        <View style={styles.bottomSection}>
          <Button 
            mode="contained" 
            onPress={handleGetStarted}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
            buttonColor="#b58a65"
          >
            Get Started
          </Button>
          <Text 
            style={styles.definition}
          >
            (n.) "for&nbsp;all&nbsp;the&nbsp;moments&nbsp;that&nbsp;truly&nbsp;matter"
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F2',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 100,
    paddingBottom: 50,
  },
  topSection: {
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appTitle: {
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 8,
    color: '#3d2f28',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: '#3d2f28',
    textAlign: 'center',
  },
  bottomSection: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 30,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonContent: {
    height: 56,
    width: '100%',
  },
  definition: {
    fontStyle: 'italic',
    fontSize: 14,
    fontFamily: 'Baskerville',
    color: '#3d2f28',
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default WelcomeScreen; 