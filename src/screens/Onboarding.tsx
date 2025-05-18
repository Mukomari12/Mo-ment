import React, { useState, useRef, useContext } from 'react';
import { View, FlatList, StyleSheet, Dimensions, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../contexts/AuthContext';

// Constants for AsyncStorage keys
const ONBOARDING_COMPLETE_KEY = 'mowment_onboarding_complete';

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

// Onboarding slide data
const slides = [
  {
    id: '1',
    title: 'Digitize Your Journal',
    description: 'Capture your thoughts, feelings, and experiences in one digital place.',
    image: require('../../assets/branding/ob_digitize.png'),
  },
  {
    id: '2',
    title: 'Track Your Mood',
    description: 'Log your daily mood and visualize patterns over time.',
    image: require('../../assets/branding/ob_mood.png'),
  },
  {
    id: '3',
    title: 'Never Miss a Moment',
    description: 'Set reminders to ensure you never forget to record your precious moments.',
    image: require('../../assets/branding/ob_reminders.png'),
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get('window').width;
  const { user, isVerified } = useContext(AuthContext);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Skip onboarding and navigate to Welcome or Dashboard
  const skipOnboarding = async () => {
    try {
      // Store that onboarding is complete
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      console.log('Onboarding SKIPPED and marked as COMPLETE in AsyncStorage');
      
      // Navigate with subtle haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Choose destination based on auth state
      if (user && isVerified) {
        console.log('User is logged in and verified, navigating to Dashboard');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      } else {
        console.log('User is not logged in or not verified, navigating to Welcome');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      // Navigate anyway in case of error
      if (user && isVerified) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    }
  };

  // Mark onboarding as complete and navigate
  const completeOnboarding = async () => {
    try {
      // Store that onboarding is complete
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      console.log('Onboarding marked as COMPLETE in AsyncStorage');
      
      // Navigate to appropriate screen based on auth state
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (user && isVerified) {
        console.log('User is logged in and verified, navigating to Dashboard');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      } else {
        console.log('User is not logged in or not verified, navigating to Welcome');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      // Navigate anyway in case of error
      if (user && isVerified) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    }
  };

  const goToNextSlide = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Last slide, complete onboarding and navigate to Welcome screen
      completeOnboarding();
    }
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => {    
    return (
      <View style={[styles.slide, { width: screenWidth }]}>
        <Image
          source={item.image}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          {item.title}
        </Text>
        <Text style={styles.description}>
          {item.description}
        </Text>
      </View>
    );
  };

  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex 
                  ? '#b58a65' 
                  : '#EFEBE6',
              }
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              flatListRef.current?.scrollToIndex({
                index,
                animated: true,
              });
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={skipOnboarding}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      
      {renderPaginationDots()}
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={goToNextSlide}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor="#b58a65"
          labelStyle={styles.buttonLabel}
        >
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F2',
  },
  header: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#b58a65',
    fontSize: 16,
    fontWeight: 'bold',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  image: {
    width: 280,
    height: 200,
    marginBottom: 30,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 24,
    color: '#3d2f28',
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: '#3d2f28',
    paddingHorizontal: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 40,
    paddingBottom: 30,
  },
  button: {
    width: '100%',
    borderRadius: 12,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default OnboardingScreen; 