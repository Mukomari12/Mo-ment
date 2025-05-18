import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  Dimensions, 
  Animated, 
  Text as RNText,
  Alert,
  TouchableOpacity,
  ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Card, 
  Text, 
  useTheme,
  Button,
  ActivityIndicator,
  IconButton,
  Surface,
  Chip,
  FAB
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore, Era } from '../store/useJournalStore';
import { format, differenceInDays } from 'date-fns';
import { useSpacing } from '../utils/useSpacing';
import * as Haptics from 'expo-haptics';
import { devLog } from '../utils/devLog';
import { generateEras } from '../api/openai';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;
const SPACING = 12;

type LifeErasScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LifeEras'>;
};

// Get a gradient for a specific era based on its label
const getEraGradient = (label: string): [string, string] => {
  const gradients: Record<string, [string, string]> = {
    "Main Character": ["#FF9966", "#FF5E62"],
    "Villain": ["#434343", "#000000"],
    "Healing": ["#2193b0", "#6dd5ed"],
    "Baddie": ["#833ab4", "#fd1d1d"],
    "Slay": ["#ff00cc", "#333399"],
    "Self-Discovery": ["#1D976C", "#93F9B9"],
    "Spiraling": ["#603813", "#b29f94"],
    "Hot Mess": ["#ff416c", "#ff4b2b"],
    "Cosmic": ["#7F00FF", "#E100FF"],
    "Chronically": ["#4e54c8", "#8f94fb"],
    "Pop Girl": ["#F9A8D4", "#F472B6"],
    "Delulu": ["#D8B4FE", "#A78BFA"],
    "Rizz": ["#FF0080", "#FF8C00"],
    "Luxury": ["#FFDEAD", "#EEE8AA"],
    "Soft Life": ["#DDD6F3", "#FAACA8"],
    "Plot Twist": ["#FF5F6D", "#FFC371"],
    "Fitness": ["#64B678", "#3A76CC"],
    "Dopamine": ["#FF8C00", "#FFFF00"],
    "Burnout": ["#373B44", "#4286f4"],
    "Renaissance": ["#654ea3", "#eaafc8"],
    "Situationship": ["#FC466B", "#3F5EFB"],
    "Revenge": ["#ED213A", "#93291E"],
    "Goblin": ["#2C3E50", "#4CA1AF"],
  };
  
  // Find a matching gradient or return default
  const matchingKey = Object.keys(gradients).find(key => label.includes(key));
  return matchingKey ? gradients[matchingKey] : ["#3494E6", "#EC6EAD"];
};

// Function to generate creative life eras using the OpenAI API
const generateLifeEras = async (entries: Entry[], setEras: (eras: Era[]) => void, setLoading: (loading: boolean) => void, setLastEraGeneration: (timestamp: number) => void) => {
  if (entries.length < 10) {
    console.log('Not enough entries to generate life eras (minimum 10 required)');
    return;
  }
  
  setLoading(true);
  
  try {
    // Format entries for the generateEras API
    const entriesData = entries.map(entry => ({
      id: entry.id,
      date: new Date(entry.createdAt).toISOString().split('T')[0],
      text: entry.content
    }));
    
    // Call the OpenAI API
    const newEras = await generateEras(entriesData);
    
    // Limit to only 2 eras initially
    const limitedEras = newEras.slice(0, 2).map(era => ({
      ...era,
      isExpanded: false // Add expanded state property
    }));
    
    // Set the new eras in the store
    setEras(limitedEras);
    
    // Store the timestamp of generation
    setLastEraGeneration(Date.now());
    
    console.log('Generated new life eras:', limitedEras.length);
  } catch (error) {
    console.error('Error generating life eras:', error);
  } finally {
    setLoading(false);
  }
};

const LifeErasScreen: React.FC<LifeErasScreenProps> = ({ navigation }) => {
  console.log('LifeErasScreen rendered');
  
  const theme = useTheme();
  const { hPad } = useSpacing();
  const eras = useJournalStore((state) => state.eras);
  const entries = useJournalStore((state) => state.entries);
  const setEras = useJournalStore((state) => state.setEras);
  const toggleEraExpanded = useJournalStore((state) => state.toggleEraExpanded);
  const lastEraGeneration = useJournalStore((state) => state.lastEraGeneration);
  const setLastEraGeneration = useJournalStore((state) => state.setLastEraGeneration);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Calculate if user has enough new entries since last generation
  const entriesSinceLastGeneration = useMemo(() => {
    if (!lastEraGeneration) return entries.length;
    return entries.filter(entry => entry.createdAt > lastEraGeneration).length;
  }, [entries, lastEraGeneration]);
  
  const canGenerateNewEra = entriesSinceLastGeneration >= 10;
  
  // Log only when entries or eras count changes to prevent log spam
  useEffect(() => {
    console.log('Life Eras entries:', entries.length, 'eras:', eras.length, 'since last:', entriesSinceLastGeneration);
  }, [entries.length, eras.length, entriesSinceLastGeneration]);
  
  // For smooth animations
  const scrollX = useRef(new Animated.Value(0)).current;
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  // Animation for empty state
  useEffect(() => {
    if (eras.length === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [eras.length, animatedValue]);
  
  const animatedScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });
  
  const animatedOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });
  
  // Set the navigation header title
  useEffect(() => {
    navigation.setOptions({
      title: 'Your Life Eras'
    });
  }, [navigation]);
  
  // Calculate if we have enough entries to generate eras
  const hasEnoughEntries = entries.length >= 10;
  
  // Handle generate button press
  const handleGeneratePress = () => {
    if (!hasEnoughEntries) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Not Enough Entries',
        'You need at least 10 journal entries to generate life eras. Keep journaling!',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (eras.length > 0 && !canGenerateNewEra) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'More Entries Needed',
        `You need 10 new journal entries since your last generation to create a new era. You currently have ${entriesSinceLastGeneration} new entries.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    generateLifeEras(entries, setEras, setLoading, setLastEraGeneration);
  };
  
  // Handle scroll events to determine active card
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (CARD_WIDTH + SPACING));
        if (index !== activeIndex) {
          setActiveIndex(index);
          Haptics.selectionAsync();
        }
      }
    }
  );
  
  // If no eras, show a placeholder with generate button
  if (eras.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#F9F6F2', '#f5efe0']}
          style={styles.gradient}
        >
          <View style={styles.emptyContainer}>
            <Animated.View style={{
              transform: [{ scale: animatedScale }],
              opacity: animatedOpacity
            }}>
              <MaterialCommunityIcons 
                name="timeline-text-outline" 
                size={100} 
                color={theme.colors.primary}
              />
            </Animated.View>
            
            <Text variant="headlineMedium" 
              style={{
                marginVertical: 16, 
                fontFamily: 'PlayfairDisplay_700Bold',
                textAlign: 'center',
                color: theme.colors.primary
              }}
            >
              Discover Your Life Eras
            </Text>
            
            {!hasEnoughEntries ? (
              <Surface style={styles.infoCard}>
                <MaterialCommunityIcons 
                  name="information-outline" 
                  size={24} 
                  color={theme.colors.primary}
                  style={{marginRight: 8}}
                />
                <Text variant="bodyLarge" style={{textAlign: 'center', flex: 1}}>
                  Write at least 10 journal entries to unlock your Life Eras.
                </Text>
              </Surface>
            ) : (
              <>
                <Text variant="bodyLarge" style={{
                  textAlign: 'center', 
                  marginBottom: 24,
                  paddingHorizontal: 20
                }}>
                  AI will analyze your journal entries to identify meaningful chapters in your life journey.
                </Text>
                <Button 
                  mode="contained" 
                  onPress={handleGeneratePress}
                  loading={loading}
                  disabled={loading}
                  style={{
                    marginTop: 16,
                    borderRadius: 30,
                    paddingHorizontal: 24,
                    elevation: 4
                  }}
                  labelStyle={{fontSize: 16, marginVertical: 4}}
                  icon="star-shooting"
                >
                  Generate Life Eras
                </Button>
              </>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }
  
  // Calculate max duration for proportional visualization
  const getMaxDuration = () => {
    if (!eras.length) return 0;
    return Math.max(
      ...eras.map(era => 
        differenceInDays(new Date(era.to), new Date(era.from))
      )
    );
  };
  
  const maxDuration = getMaxDuration();
  
  const renderEraCard = ({ item, index }: { item: Era, index: number }) => {
    const startDate = new Date(item.from);
    const endDate = new Date(item.to);
    const durationDays = differenceInDays(endDate, startDate);
    
    // Calculate width percentage based on duration
    const widthPercentage = (durationDays / maxDuration) * 100;
    
    // Calculate input range for animations based on card width and spacing
    const inputRange = [
      (index - 1) * (CARD_WIDTH + SPACING),
      index * (CARD_WIDTH + SPACING),
      (index + 1) * (CARD_WIDTH + SPACING)
    ];
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp'
    });
    
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp'
    });
    
    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [20, 0, 20],
      extrapolate: 'clamp'
    });
    
    // Get colors for this card based on era label
    const gradientColors = getEraGradient(item.label);
    
    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [{ scale }, { translateY }],
            opacity
          }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            toggleEraExpanded(index);
          }}
        >
          <LinearGradient
            colors={gradientColors}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardContent}>
              <View style={styles.barContainer}>
                <View style={styles.progressBarWrapper}>
                  <View
                    style={[
                      styles.durationBar,
                      { 
                        width: `${widthPercentage}%`,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      }
                    ]}
                  />
                </View>
              </View>
              
              <Text variant="headlineSmall" style={styles.eraTitle}>
                {item.label}
              </Text>
              
              <View style={styles.dateContainer}>
                <Text variant="bodySmall" style={styles.dateText}>
                  {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                </Text>
                <Chip 
                  style={styles.durationChip} 
                  textStyle={styles.durationChipText}
                >
                  {Math.round(durationDays / 30)} months
                </Chip>
              </View>
              
              {/* Display the era description if available */}
              {item.description && (
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.description,
                    { height: item.isExpanded ? undefined : 80 }
                  ]}
                  numberOfLines={item.isExpanded ? undefined : 3}
                >
                  "{item.description}"
                </Text>
              )}
              
              {/* Expand/collapse indicator */}
              <View style={styles.expandIndicator}>
                <MaterialCommunityIcons 
                  name={item.isExpanded ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="rgba(255, 255, 255, 0.8)" 
                />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  const renderDot = (index: number) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + SPACING),
      index * (CARD_WIDTH + SPACING),
      (index + 1) * (CARD_WIDTH + SPACING)
    ];
    
    const dotScale = scrollX.interpolate({
      inputRange,
      outputRange: [1, 1.8, 1],
      extrapolate: 'clamp'
    });
    
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp'
    });
    
    return (
      <Animated.View
        key={index}
        style={[
          styles.dot,
          {
            backgroundColor: theme.colors.primary,
            transform: [{ scale: dotScale }],
            opacity
          }
        ]}
      />
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F9F6F2', '#f5efe0'] as readonly string[]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Surface style={styles.headerCard}>
            <Text 
              variant="titleMedium" 
              style={styles.headerTitle}
            >
              Your Life Journey
            </Text>
            
            <Text
              style={styles.infoText}
            >
              Swipe to explore your unique life chapters
            </Text>
          </Surface>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{marginTop: 16, color: theme.colors.primary}}>Creating your life story...</Text>
            </View>
          ) : (
            <>
              <Animated.FlatList
                data={eras}
                keyExtractor={(item) => item.from + item.to}
                renderItem={renderEraCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                decelerationRate="fast"
                snapToInterval={CARD_WIDTH + SPACING}
                snapToAlignment="center"
                onScroll={handleScroll}
                scrollEventThrottle={16}
                initialScrollIndex={0}
                getItemLayout={(_, index) => ({
                  length: CARD_WIDTH + SPACING,
                  offset: (CARD_WIDTH + SPACING) * index,
                  index,
                })}
                ListFooterComponent={
                  eras.length > 0 && canGenerateNewEra ? (
                    <TouchableOpacity 
                      style={styles.placeholderCard}
                      onPress={handleGeneratePress}
                      activeOpacity={0.7}
                    >
                      <View style={styles.placeholderContent}>
                        <MaterialCommunityIcons 
                          name="plus-circle-outline" 
                          size={40} 
                          color={theme.colors.primary} 
                        />
                        <Text style={styles.placeholderText}>
                          Generate New Era
                        </Text>
                        <Text style={styles.placeholderSubtext}>
                          10 new entries collected
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : eras.length > 0 ? (
                    <View style={styles.placeholderCard}>
                      <View style={styles.placeholderContent}>
                        <MaterialCommunityIcons 
                          name="lock-outline" 
                          size={40} 
                          color={theme.colors.outline} 
                        />
                        <Text style={[styles.placeholderText, {color: theme.colors.outline}]}>
                          More Entries Needed
                        </Text>
                        <Text style={styles.placeholderSubtext}>
                          {entriesSinceLastGeneration}/10 new entries
                        </Text>
                      </View>
                    </View>
                  ) : null
                }
              />
              
              <View style={styles.paginationContainer}>
                {eras.map((_, index) => renderDot(index))}
              </View>
            </>
          )}
        </View>
        
        {eras.length === 0 && (
          <FAB
            icon="autorenew"
            style={styles.fab}
            onPress={handleGeneratePress}
            disabled={loading || !hasEnoughEntries}
            loading={loading}
            label="Generate Eras"
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  headerCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    alignItems: 'center',
  },
  headerTitle: {
    marginBottom: 8,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginHorizontal: SPACING / 2,
    height: 'auto',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardGradient: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 0,
  },
  cardContent: {
    padding: 20,
  },
  eraTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'PlayfairDisplay_700Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  durationChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    height: 24,
  },
  durationChipText: {
    color: 'white',
    fontSize: 12,
  },
  description: {
    color: 'white',
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 8,
    lineHeight: 22,
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    padding: 8,
    borderRadius: 8,
  },
  barContainer: {
    marginBottom: 16,
  },
  progressBarWrapper: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  durationBar: {
    height: '100%',
    borderRadius: 5,
  },
  listContainer: {
    paddingVertical: 20,
    paddingHorizontal: SPACING,
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    elevation: 2,
  },
  placeholderCard: {
    width: CARD_WIDTH,
    height: 300,
    marginHorizontal: SPACING / 2,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  placeholderContent: {
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8a6b52',
  },
  placeholderSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#8a6b52',
    opacity: 0.7,
  },
  expandIndicator: {
    alignItems: 'center',
    marginTop: 8,
  },
});

export default LifeErasScreen; 