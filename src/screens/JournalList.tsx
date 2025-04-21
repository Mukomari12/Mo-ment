import React from 'react';
import { View, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Text, Appbar, Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore, Entry } from '../store/useJournalStore';
import EntryCard from '../components/EntryCard';
import PaperSheet from '../components/PaperSheet';
import * as Haptics from 'expo-haptics';

type JournalListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'JournalList'>;
};

const JournalListScreen: React.FC<JournalListScreenProps> = ({ navigation }) => {
  console.log('JournalList props:', { props: { navigation }, routeParams: {} });
  
  const entries = useJournalStore(state => state.entries);

  const handleEntryPress = (entry: Entry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('EntryDetail', { id: entry.id });
  };
  
  const handleNewEntry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('TextEntry');
  };

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
            title="Journal Entries" 
            titleStyle={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          />
        </Appbar.Header>
        
        {entries.length === 0 ? (
          <View style={{flex:1, justifyContent:'center', alignItems:'center', padding: 20}}>
            <Text variant="bodyMedium" style={{marginBottom: 20}}>No entries to display yet.</Text>
            <Button 
              mode="contained" 
              onPress={handleNewEntry}
              buttonColor="#b58a65"
              style={{borderRadius: 8}}
            >
              Create First Entry
            </Button>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <EntryCard 
                entry={item} 
                onPress={handleEntryPress}
                style={styles.entryCard}
                navigation={navigation}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </PaperSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  entryCard: {
    marginBottom: 12,
  },
});

export default JournalListScreen; 