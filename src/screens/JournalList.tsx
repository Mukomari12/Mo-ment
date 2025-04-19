import React, { useMemo } from 'react';
import { StyleSheet, SectionList, SafeAreaView, View } from 'react-native';
import { List, Text, Appbar, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore, Entry } from '../store/useJournalStore';
import PaperSheet from '../components/PaperSheet';
import { useSpacing } from '../utils/useSpacing';
import { format } from 'date-fns';

type JournalListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'JournalList'>;
};

const JournalList: React.FC<JournalListScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { hPad } = useSpacing();
  const entries = useJournalStore(state => state.entries);
  
  // Group entries by month
  const groupedEntries = useMemo(() => {
    const grouped: { title: string; data: Entry[] }[] = [];
    const months: Record<string, Entry[]> = {};
    
    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort((a, b) => b.createdAt - a.createdAt);
    
    // Group by month
    sortedEntries.forEach(entry => {
      const date = new Date(entry.createdAt);
      const monthKey = format(date, 'MMMM yyyy');
      
      if (!months[monthKey]) {
        months[monthKey] = [];
      }
      
      months[monthKey].push(entry);
    });
    
    // Convert to SectionList format
    Object.keys(months).forEach(month => {
      grouped.push({
        title: month,
        data: months[month]
      });
    });
    
    return grouped;
  }, [entries]);
  
  return (
    <PaperSheet>
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={{ backgroundColor: 'transparent' }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Journal Entries" titleStyle={{ fontFamily: 'PlayfairDisplay_700Bold' }} />
        </Appbar.Header>
        
        <SectionList
          sections={groupedEntries}
          keyExtractor={entry => entry.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.content.split('\n')[0] || '(untitled)'}
              description={format(new Date(item.createdAt), 'MMM d, yyyy')}
              onPress={() => navigation.navigate('EntryDetail', { id: item.id })}
              left={() => {
                let icon = 'notebook-outline';
                if (item.type === 'voice') icon = 'microphone-outline';
                if (item.type === 'media') icon = 'image-outline';
                return <List.Icon icon={icon} color={theme.colors.primary} />;
              }}
              right={() => item.emotion && (
                <Text style={styles.emotionEmoji}>{item.emotion.emoji}</Text>
              )}
              titleStyle={styles.entryTitle}
              descriptionStyle={styles.entryDate}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
              <Text variant="titleMedium" style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: hPad, paddingVertical: 16 }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: theme.colors.surfaceVariant }} />
          )}
          stickySectionHeadersEnabled={true}
        />
      </SafeAreaView>
    </PaperSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  entryTitle: {
    fontFamily: 'WorkSans_400Regular',
  },
  entryDate: {
    fontFamily: 'WorkSans_400Regular',
    fontSize: 12,
  },
  sectionHeader: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  emotionEmoji: {
    fontSize: 20,
    marginRight: 8,
  }
});

export default JournalList; 