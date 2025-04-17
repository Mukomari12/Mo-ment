import React, { useState, useRef } from 'react';
import { View, FlatList, StyleSheet, useWindowDimensions, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useSpacing } from '../utils/useSpacing';
import { RFValue } from 'react-native-responsive-fontsize';
import PaperSheet from '../components/PaperSheet';

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
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const { hPad } = useSpacing();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const goToNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Last slide, navigate to Dashboard
      navigation.replace('Dashboard');
    }
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => {
    // Calculate image size while maintaining aspect ratio for 16:9
    const imageWidth = width * 0.8;
    const imageHeight = (imageWidth * 9) / 16;
    
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={[styles.image, { width: imageWidth, height: imageHeight }]}
            resizeMode="contain"
          />
        </View>
        <Text 
          variant="titleLarge" 
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          {item.title}
        </Text>
        <Text 
          variant="bodyLarge" 
          style={[styles.description, { color: theme.colors.onBackground, paddingHorizontal: hPad }]}
        >
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
                  ? theme.colors.primary 
                  : theme.colors.surfaceVariant,
              }
            ]}
            onPress={() => {
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
    <PaperSheet>
      <SafeAreaView style={styles.safeArea}>
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
        
        <View style={[styles.buttonContainer, { paddingHorizontal: hPad }]}>
          <Button 
            mode="contained" 
            onPress={goToNextSlide}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </View>
      </SafeAreaView>
    </PaperSheet>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  imageContainer: {
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    borderRadius: 12,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: RFValue(22),
  },
  description: {
    textAlign: 'center',
    maxWidth: '90%',
    fontSize: RFValue(16),
    lineHeight: RFValue(24),
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
    paddingBottom: 40,
  },
  button: {
    width: '100%',
    borderRadius: 12,
  },
  buttonContent: {
    height: 56,
  },
});

export default OnboardingScreen; 