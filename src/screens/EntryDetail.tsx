import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Text, Appbar, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore } from '../store/useJournalStore';
import PaperSheet from '../components/PaperSheet';
import { useSpacing } from '../utils/useSpacing';
import { format } from 'date-fns';

type EntryDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EntryDetail'>;
  route: RouteProp<RootStackParamList, 'EntryDetail'>;
};

const EntryDetail: React.FC<EntryDetailScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const { hPad } = useSpacing();
  const { id } = route.params;
  const entry = useJournalStore(state => state.entries.find(e => e.id === id));

  if (!entry) {
    return (
      <PaperSheet>
        <SafeAreaView style={styles.container}>
          <Appbar.Header style={{ backgroundColor: 'transparent' }}>
            <Appbar.BackAction onPress={() => navigation.goBack()} />
            <Appbar.Content title="Entry Not Found" titleStyle={{ fontFamily: 'PTSerif-Bold' }} />
          </Appbar.Header>
          <Text style={[styles.errorText, { paddingHorizontal: hPad }]}>
            The requested entry could not be found.
          </Text>
        </SafeAreaView>
      </PaperSheet>
    );
  }

  return (
    <PaperSheet>
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={{ backgroundColor: 'transparent' }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content 
            title={format(new Date(entry.createdAt), 'MMMM d, yyyy')} 
            titleStyle={{ fontFamily: 'PTSerif-Bold' }} 
          />
        </Appbar.Header>
        
        <ScrollView contentContainerStyle={{ padding: hPad }}>
          <Text style={[theme.fonts.bodyLarge, styles.entryContent]}>
            {entry.content}
          </Text>
          {entry.tags && entry.tags.length > 0 && (
            <Text style={[theme.fonts.labelSmall, styles.tagSection]}>
              Tags: {entry.tags.join(', ')}
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </PaperSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  entryContent: {
    marginBottom: 24,
    fontFamily: 'PTSerif-Regular',
    lineHeight: 26,
  },
  tagSection: {
    marginTop: 16,
    opacity: 0.7,
    fontFamily: 'PTSerif-Regular',
  },
  errorText: {
    fontFamily: 'PTSerif-Regular',
    marginTop: 20,
    textAlign: 'center',
  }
});

export default EntryDetail; 