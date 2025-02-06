import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [text, setText] = useState('');
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    async function loadNotes() {
      try {
        const savedNotes = await AsyncStorage.getItem('notes');
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes));
        }
      } catch (error) {
        console.error("Error reading notes from AsyncStorage", error);
      }
    }
    loadNotes();
  }, []);

  useEffect(() => {
    async function saveNotes() {
      try {
        await AsyncStorage.setItem('notes', JSON.stringify(notes));
        console.log('Notes saved successfully!');
      } catch (error) {
        console.error("Error saving notes to AsyncStorage", error);
      }
    }
    saveNotes();
  }, [notes]);

  // Handler to add a new note and clear the text input
  function saveElement() {
    // Create a new note and add it to the current list of notes. [...notes] is a  spread operator
    setNotes([...notes, { key: notes.length.toString(), name: text }]);
    // Clear the TextInput
    setText('');
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type something you filthy animal..."
        onChangeText={setText}
        value={text}
        onSubmitEditing={saveElement}
        returnKeyType='done'
      />
      <Button title='Save Element' onPress={saveElement} />
      <FlatList
        data={notes}
        renderItem={({ item }) => <Text>{item.name}</Text>}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '80%',           
    height: 40,            
    borderColor: 'gray',   
    borderWidth: 1,        
    paddingHorizontal: 8,
    minWidth: 200   
  },
});
