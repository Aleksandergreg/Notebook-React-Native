import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Define firebaseConfig BEFORE using it
const firebaseConfig = {
  apiKey: "AIzaSyA5Yw04254JP0Ge9fZtk71YkvmKmU2bb-s",
  authDomain: "notebookapp-5720f.firebaseapp.com",
  projectId: "notebookapp-5720f",
  storageBucket: "notebookapp-5720f.firebasestorage.app",
  messagingSenderId: "787281543542",
  appId: "1:787281543542:web:f8aa1dc4ddfc13cdb07a57",
  measurementId: "G-C0ZTTRM30X"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const STORAGE_KEY = 'notes';

function ListPage({ navigation }) {
  const [text, setText] = useState('');
  const [notes, setNotes] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadNotes = async () => {
        try {
          const savedNotes = await AsyncStorage.getItem(STORAGE_KEY);
          if (savedNotes) {
            setNotes(JSON.parse(savedNotes));
          }
        } catch (error) {
          console.error('Error loading notes:', error);
        }
      };
      loadNotes();
    }, [])
  );

  const saveElement = async () => {
    if (text.trim().length === 0) return;
    const newNote = { 
      key: Date.now().toString(), 
      name: text,
      createdAt: new Date().toISOString()  // Optional: include a timestamp
    };
    const updatedNotes = [...notes, newNote];
    try {
      // Save locally
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
      
      // Save to Firebase Firestore
      await addDoc(collection(db, "notes"), newNote);
      
      setText('');
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const renderItem = ({ item }) => {
    let displayText = item.name;
    if (displayText.length > 25) {
      displayText = displayText.substring(0, 25) + '...';
    }
    return (
      <Pressable
        style={styles.noteItem}
        onPress={() => navigation.navigate('DetailPage', { note: item })}
      >
        <Text style={styles.noteText}>{displayText}</Text>
      </Pressable>
    );
  };

  const clearNotes = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setNotes([]); // Update state to clear notes from UI
      console.log('Notes cleared!');
    } catch (error) {
      console.error("Error clearing notes from AsyncStorage", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Skriv din note her..."
        value={text}
        onChangeText={setText}
        onSubmitEditing={saveElement}
        returnKeyType='done'
      />
      <Button title="Save Element" onPress={saveElement} />
      <Button title='Clear Data' onPress={clearNotes} />
      <FlatList
        style={styles.flatList}
        data={notes}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
      />
      <StatusBar style="auto" />
    </View>
  );
}

function DetailPage({ route, navigation }) {
  const { note } = route.params;
  const [text, setText] = useState(note.name);

  const saveNote = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem(STORAGE_KEY);
      const notes = storedNotes ? JSON.parse(storedNotes) : [];
      const updatedNotes = notes.map((n) =>
        n.key === note.key ? { ...n, name: text } : n
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      navigation.goBack();
    } catch (error) {
      console.error('Error saving updated note:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.detailInput}
        value={text}
        onChangeText={setText}
        multiline
      />
      <Button title="GEM" onPress={saveNote} />
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ListPage">
        <Stack.Screen name="ListPage" component={ListPage} options={{ title: 'Notes' }} />
        <Stack.Screen name="DetailPage" component={DetailPage} options={{ title: 'Note Detail' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
  },
  detailInput: {
    borderColor: 'gray',
    borderWidth: 1,
    padding: 8,
    height: 200,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  noteItem: {
    padding: 8,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  noteText: {
    fontSize: 16,
  },
  flatList: {
    marginTop: 16,
  },
});
