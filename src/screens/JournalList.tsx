import React, { useRef, useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Text, Button, useTheme, FAB } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore, Entry } from '../store/useJournalStore';
import EntryCard from '../components/EntryCard';
import Placeholder from '../components/Placeholder';
import { BottomSheetComposeRef } from '../components/BottomSheetCompose';
import * as Haptics from 'expo-haptics';
import { devLog } from '../utils/devLog';
import { LinearGradient } from 'expo-linear-gradient';

type JournalListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'JournalList'>;
};

const JournalListScreen: React.FC<JournalListScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const rawEntries = useJournalStore(s => s.entries);
  const entries = useMemo(
    () => [...rawEntries].sort((a, b) => b.createdAt - a.createdAt),
    [rawEntries]
  );
  
  // Log only when entries count changes to prevent log spam
  useEffect(() => {
    devLog('JournalList entries:', entries.length);
  }, [entries.length]);
  
  const bottomSheetRef = useRef<BottomSheetComposeRef>(null);

  const handleEntryPress = (entry: Entry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('EntryDetail', { id: entry.id });
  };
  
  const handleNewEntry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('TextEntry');
  };
  
  const handleDeleteEntry = (entryId: string) => {
    // Call the removeEntry function from the store
    useJournalStore.getState().removeEntry(entryId);
  };

  return (
    <LinearGradient 
      colors={['#F9F6F2', '#f2ede4']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Text style={[styles.headerTitle, {color: theme.colors.primary, fontFamily: 'PlayfairDisplay_700Bold'}]}>
          Journal Entries ({entries.length})
        </Text>

        {entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Placeholder msg="No entries to display yet." />
            <Button 
              mode="contained" 
              onPress={handleNewEntry}
              buttonColor="#b58a65"
              style={styles.createButton}
            >
              Create First Entry
            </Button>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <EntryCard 
                entry={item} 
                onPress={handleEntryPress}
                style={styles.entryCard}
                navigation={navigation}
                onDelete={handleDeleteEntry}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
        
        {entries.length > 0 && (
          <FAB
            icon="pencil-plus"
            style={styles.fab}
            onPress={handleNewEntry}
            label="New Entry"
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 20,
    marginVertical: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  entryCard: {
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  createButton: {
    marginTop: 20,
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  }
});

export default JournalListScreen; 