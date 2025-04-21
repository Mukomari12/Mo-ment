import React, { useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  Dimensions, 
  Animated, 
  Text as RNText 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Appbar, 
  Card, 
  Text, 
  useTheme 
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore, Era } from '../store/useJournalStore';
import { format, differenceInDays } from 'date-fns';
import PaperSheet from '../components/PaperSheet';
import { useSpacing } from '../utils/useSpacing';
import * as Haptics from 'expo-haptics';

type TimelineScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Timeline'>;
};

const TimelineScreen: React.FC<TimelineScreenProps> = ({ navigation }) => {
  console.log('Timeline props:', { props: { navigation }, routeParams: {} });
  
  const theme = useTheme();
  const { hPad } = useSpacing();
  const eras = useJournalStore((state) => state.eras);
  const entries = useJournalStore((state) => state.entries);
  
  // For smooth animations
  const scrollX = useRef(new Animated.Value(0)).current;
  
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
  
  const renderEraCard = ({ item }: { item: Era }) => {
    const startDate = new Date(item.from);
    const endDate = new Date(item.to);
    const durationDays = differenceInDays(endDate, startDate);
    
    // Calculate width percentage based on duration
    const widthPercentage = (durationDays / maxDuration) * 100;
    
    return (
      <Card 
        style={[
          styles.eraCard, 
          { 
            backgroundColor: theme.colors.surface,
            borderRadius: theme.roundness,
            elevation: 4,
            shadowColor: theme.colors.secondary + '26',
          }
        ]}
      >
        <Card.Content>
          <View style={styles.barContainer}>
            <View style={styles.progressBarWrapper}>
              <View
                style={[
                  styles.durationBar,
                  { 
                    width: `${widthPercentage}%`,
                    backgroundColor: theme.colors.primary,
                  }
                ]}
              />
            </View>
          </View>
          
          <Text 
            variant="titleMedium" 
            style={{ 
              fontFamily: 'PlayfairDisplay_700Bold',
              marginBottom: 4,
            }}
          >
            {item.label}
          </Text>
          
          <Text 
            variant="bodySmall" 
            style={{ 
              fontFamily: 'WorkSans_400Regular',
              color: theme.colors.onSurfaceVariant,
            }}
          >
            {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
          </Text>
          
          <Text
            variant="bodyMedium"
            style={{
              fontFamily: 'WorkSans_400Regular',
              marginTop: 16,
              flexShrink: 1,
            }}
            numberOfLines={6}
          >
            {`${durationDays} days - ${Math.round(durationDays / 30)} months`}
          </Text>
        </Card.Content>
      </Card>
    );
  };
  
  // Show a fallback if there are no entries or eras
  if (entries.length === 0 || eras.length === 0) {
    return (
      <PaperSheet>
        <SafeAreaView style={styles.container}>
          <Appbar.Header style={{ backgroundColor: 'transparent' }}>
            <Appbar.BackAction 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.goBack();
              }} 
            />
            <Appbar.Content 
              title="Life Timeline" 
              titleStyle={{ fontFamily: 'PlayfairDisplay_700Bold' }}
            />
          </Appbar.Header>
          
          <View style={{flex:1, justifyContent:'center', alignItems:'center', padding: 20}}>
            <Text variant="bodyMedium">Add at least one entry to view analytics.</Text>
          </View>
        </SafeAreaView>
      </PaperSheet>
    );
  }
  
  return (
    <PaperSheet>
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={{ backgroundColor: 'transparent' }}>
          <Appbar.BackAction 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }} 
          />
          <Appbar.Content 
            title="Life Timeline" 
            titleStyle={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          />
        </Appbar.Header>
        
        <View style={styles.content}>
          {eras.length > 0 ? (
            <>
              <Text 
                variant="titleSmall" 
                style={[
                  styles.subtitle, 
                  { 
                    paddingHorizontal: hPad, 
                    fontFamily: 'PlayfairDisplay_700Bold',
                    color: theme.colors.onBackground,
                  }
                ]}
              >
                Your Life Eras
              </Text>
              
              <Animated.FlatList
                data={eras}
                keyExtractor={(item) => item.from + item.to}
                renderItem={renderEraCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: hPad, paddingVertical: 20 }}
                decelerationRate="fast"
                snapToInterval={260} // Card width + margins
                snapToAlignment="start"
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: true }
                )}
              />
              
              <Text 
                style={[
                  styles.hint, 
                  { 
                    paddingHorizontal: hPad,
                    color: theme.colors.onSurfaceVariant,
                    fontFamily: 'WorkSans_400Regular',
                  }
                ]}
              >
                Swipe to explore different eras in your life
              </Text>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text 
                style={{ 
                  fontFamily: 'WorkSans_400Regular',
                  textAlign: 'center',
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                No life eras found. Continue journaling to see your life timeline.
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </PaperSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  subtitle: {
    marginBottom: 8,
  },
  eraCard: {
    width: 240,
    marginRight: 20,
    marginBottom: 10,
  },
  barContainer: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    marginBottom: 16,
  },
  progressBarWrapper: {
    overflow: 'hidden',
    borderRadius: 3,
    height: '100%',
  },
  durationBar: {
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
});

export default TimelineScreen; 