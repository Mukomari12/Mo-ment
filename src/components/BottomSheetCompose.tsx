import React, { useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, navigationRef, navigate } from '../navigation/AppNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export type BottomSheetComposeRef = {
  expand: () => void;
  close: () => void;
};

type BottomSheetComposeProps = {
  navigation?: NativeStackNavigationProp<RootStackParamList, any>;
};

// Define the specific entry screens we'll navigate to
type EntryScreen = 'TextEntry' | 'VoiceEntry' | 'MediaEntry';

const BottomSheetCompose = forwardRef<BottomSheetComposeRef, BottomSheetComposeProps>(({ navigation: navigationProp }, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  // Get navigation from props or from hook as fallback
  const hookNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const navigation = navigationProp || hookNavigation;
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    expand: () => {
      bottomSheetRef.current?.expand();
    },
    close: () => {
      bottomSheetRef.current?.close();
    }
  }));

  // Snap points
  const snapPoints = useMemo(() => ['35%'], []);

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
  const handleOptionPress = (screen: EntryScreen) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Close the sheet first
    bottomSheetRef.current?.close();
    
    // Try to navigate using the passed navigation prop first
    setTimeout(() => {
      if (navigation) {
        navigation.navigate(screen);
      } else {
        // Fallback to our helper function that uses navigationRef
        navigate(screen);
      }
    }, 300);
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
      backgroundStyle={{ backgroundColor: '#fff' }}
    >
      <View style={styles.contentContainer}>
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