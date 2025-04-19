import React, { useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, List } from 'react-native-paper';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as Haptics from 'expo-haptics';

export type BottomSheetComposeRef = {
  expand: () => void;
  close: () => void;
};

type ComposeNavigationProps = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

const BottomSheetCompose = forwardRef<BottomSheetComposeRef, {}>((_, ref) => {
  const theme = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const navigation = useNavigation<ComposeNavigationProps>();

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

  // Entry options
  const entryOptions = [
    {
      icon: 'text-box-outline',
      label: 'Text Entry',
      nav: 'TextEntry' as const,
    },
    {
      icon: 'microphone',
      label: 'Voice Entry',
      nav: 'VoiceEntry' as const,
    },
    {
      icon: 'image-outline',
      label: 'Media Entry',
      nav: 'MediaEntry' as const,
    },
  ];

  // Handle option press
  const handleOptionPress = (screen: 'TextEntry' | 'VoiceEntry' | 'MediaEntry') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRef.current?.close();
    
    // Navigate after a slight delay to allow the sheet to close
    setTimeout(() => {
      navigation.navigate(screen);
    }, 300);
  };

  // Custom backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
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
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
    >
      <View style={styles.contentContainer}>
        {entryOptions.map((option) => (
          <List.Item
            key={option.label}
            title={option.label}
            titleStyle={{ fontFamily: 'WorkSans_500Medium' }}
            left={(props) => (
              <List.Icon 
                {...props} 
                icon={option.icon} 
                color={theme.colors.primary}
              />
            )}
            onPress={() => handleOptionPress(option.nav)}
            style={styles.listItem}
            rippleColor={theme.colors.primary + '20'}
          />
        ))}
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 12,
  },
  listItem: {
    paddingVertical: 8,
  },
});

export default BottomSheetCompose; 