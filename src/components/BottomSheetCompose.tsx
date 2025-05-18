import React, { useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { devLog } from '../utils/devLog';

export type BottomSheetComposeRef = {
  expand: () => void;
  close: () => void;
};

type BottomSheetComposeProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, any>;
  style?: any; // Allow passing style prop
};

// Define the specific entry screens we'll navigate to
type EntryScreen = 'TextEntry' | 'VoiceEntry' | 'MediaEntry';

const BottomSheetCompose = forwardRef<BottomSheetComposeRef, BottomSheetComposeProps>(
  ({ navigation, style }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    expand: () => {
      devLog('Bottom sheet expand() called');
      console.log('Expanding bottom sheet...');
      if (bottomSheetRef.current) {
        console.log('BottomSheet ref exists, calling snapToIndex(0)');
        bottomSheetRef.current.snapToIndex(0);  // always open to first snap-point
      } else {
        console.log('BottomSheet ref is null or undefined!');
      }
    },
    close: () => {
      bottomSheetRef.current?.close();
    }
  }));

  // Snap points
  const snapPoints = useMemo(() => ['35%', '80%'], []); // second snap for drag

  // Entry options with properly typed icon names
  const entryOptions = [
    {
      icon: 'text-box-outline' as const,
      label: 'Text Entry',
      nav: 'TextEntry' as const,
    },
    {
      icon: 'microphone' as const,
      label: 'Voice Entry',
      nav: 'VoiceEntry' as const,
    },
    {
      icon: 'image-outline' as const,
      label: 'Media Entry',
      nav: 'MediaEntry' as const,
    },
  ];

  // Handle option press
  const handleOptionPress = async (screen: EntryScreen) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Close the sheet first and wait for it to close
    try {
      await bottomSheetRef.current?.close();
      
      // Navigate after sheet is closed
      if (navigation) {
        navigation.navigate(screen);
      }
    } catch (error) {
      devLog('Error in navigation:', error);
    }
  };

  // Backdrop component using the built-in BottomSheetBackdrop
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.4}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#6a4e42' }}
      backgroundStyle={{ 
        backgroundColor: '#fff',
      }}
      style={style}
    >
      <View style={styles.contentContainer}>
        {/* Debug Option - Only in development */}
        <TouchableOpacity
          style={[styles.optionItem, { backgroundColor: '#ffcccc' }]}
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            
            try {
              await bottomSheetRef.current?.close();
              
              if (navigation) {
                navigation.navigate('Debug');
              }
            } catch (error) {
              devLog('Error in debug navigation:', error);
            }
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons 
            name="bug"
            size={28} 
            color="red"
            style={styles.optionIcon}
          />
          <Text style={[styles.optionText, { color: 'red' }]}>
            Debug Navigation
          </Text>
        </TouchableOpacity>

        {entryOptions.map((option) => (
          <TouchableOpacity
            key={option.label}
            style={styles.optionItem}
            onPress={() => handleOptionPress(option.nav)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name={option.icon}
              size={28} 
              color="#b58a65"
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Fallback text if map ran but produced nothing */}
        {entryOptions.length === 0 && (
          <Text style={{textAlign:'center', marginTop:32}}>No entry types defined</Text>
        )}
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9f6f2',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3d2f28',
  },
});

export default BottomSheetCompose; 