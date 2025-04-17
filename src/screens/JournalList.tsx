import React from 'react';
import { StyleSheet, FlatList, SafeAreaView, View } from 'react-native';
import { List, Text, Appbar, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore } from '../store/useJournalStore';
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
  
  return (
    <PaperSheet>
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={{ backgroundColor: 'transparent' }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Journal Entries" titleStyle={{ fontFamily: 'PTSerif-Bold' }} />
        </Appbar.Header>
        
        <FlatList
          data={[...entries].sort((a, b) => b.createdAt - a.createdAt)}
          keyExtractor={entry => entry.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.content.split('\n')[0] || '(untitled)'}
              description={new Date(item.createdAt).toLocaleDateString()}
              onPress={() => navigation.navigate('EntryDetail', { id: item.id })}
              left={() => {
                let icon = 'notebook-outline';
                if (item.type === 'voice') icon = 'microphone-outline';
                if (item.type === 'media') icon = 'image-outline';
                return <List.Icon icon={icon} color={theme.colors.primary} />;
              }}
              titleStyle={styles.entryTitle}
              descriptionStyle={styles.entryDate}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: hPad, paddingVertical: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: theme.colors.surfaceVariant }} />}
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
    fontFamily: 'PTSerif-Regular',
  },
  entryDate: {
    fontFamily: 'PTSerif-Regular',
  }
});

export default JournalList; 