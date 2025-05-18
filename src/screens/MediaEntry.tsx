import React, {useState} from 'react';
import {View, Image, StyleSheet} from 'react-native';
import {Button, TextInput, Appbar} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import {useJournalStore} from '../store/useJournalStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type MediaEntryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MediaEntry'>;
};

export default function MediaEntry({ navigation }: MediaEntryScreenProps) {
  const [uri, setUri] = useState<string|null>(null);
  const [caption, setCaption] = useState('');
  const addMedia = useJournalStore(s => s.addMediaEntry);

  const pick = async(fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
      
    if(!perm.granted) return;
    
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({quality: 0.7})
      : await ImagePicker.launchImageLibraryAsync({quality: 0.7});
      
    if(!res.canceled) setUri(res.assets[0].uri);
  };

  const save = () => {
    if(uri) {
      addMedia(uri, caption);
      navigation.goBack();
    }
  };

  return(
    <View style={styles.root}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()}/>
        <Appbar.Content title="Photo / Video Entry"/>
      </Appbar.Header>

      {!uri ? (
        <>
          <Button mode="contained" style={styles.btn} onPress={() => pick(true)}>Take Photo</Button>
          <Button mode="outlined" style={styles.btn} onPress={() => pick(false)}>Choose from Library</Button>
        </>
      ) : (
        <>
          <Image source={{uri}} style={styles.preview}/>
          <TextInput label="Caption" value={caption} onChangeText={setCaption} style={{margin: 12}}/>
          <Button mode="contained" onPress={save} disabled={!caption}>Save Entry</Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 16
  },
  btn: {
    margin: 8,
    width: '80%'
  },
  preview: {
    width: '90%',
    height: 280,
    borderRadius: 8,
    marginVertical: 12
  }
}); 