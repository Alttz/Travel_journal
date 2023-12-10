import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, View, TouchableOpacity, FlatList, Alert, Image, TextInput, Button, Modal } from 'react-native';
import { Audio } from 'expo-av';
import { GlobalStyles as styles } from '../styles/Styles';
import { createTable, fetchMemories, deleteMemory, updateMemory } from '../database/database';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome, MaterialCommunityIcons, Fontisto } from '@expo/vector-icons';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useImagePicker } from '../hooks/useImagePicker';

export default function MemoriesScreen() {
  const [memories, setMemories] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const soundRef = useRef(null);

  const { isRecording, startRecording, stopRecording, audioUri, resetAudioUri } = useAudioRecorder();
  const { image, pickImage, uploadImage, resetImage } = useImagePicker();

  useEffect(() => {
    createTable();
    updateList();
  }, []);

  const updateList = useCallback(() => {
    fetchMemories()
      .then(fetchedMemories => {
        setMemories(fetchedMemories);
      })
      .catch(error => {
        console.error("Failed to fetch memories:", error);
        Alert.alert('Error', 'Failed to load memories.');
      });
  }, []);

  useFocusEffect(updateList);

  const toggleAudioPlayback = async (audioUrl, memoryId) => {
    if (playingAudio === memoryId) {
      await soundRef.current.stopAsync();
      setPlayingAudio(null);
    } else {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      soundRef.current = sound;

      soundRef.current.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingAudio(null);
        }
      });

      await sound.playAsync();
      setPlayingAudio(memoryId);
    }
  };


  const deleteItem = (id) => {
    deleteMemory(id).then(() => {
      updateList();
    }).catch(error => {
      console.error("Error deleting memory:", error);
      Alert.alert('Error', 'Unable to delete memory.');
    });
  }

  const editItem = (id) => {
    const memoryToEdit = memories.find(memory => memory.id === id);
    if (memoryToEdit) {
      setEditingMemory(memoryToEdit);
      resetAudioUri();
      setEditModalVisible(true);
    }
  };

  const handleEditSave = async () => {
    if (editingMemory) {
      try {
        let imageUrl = editingMemory.image;

        if (image) {
          imageUrl = await uploadImage();
        }

        let audioUrl = audioUri ? audioUri : editingMemory.audio;

        await updateMemory(
          editingMemory.id,
          editingMemory.quote,
          editingMemory.latitude,
          editingMemory.longitude,
          imageUrl,
          editingMemory.city,
          audioUrl
        );
        setEditModalVisible(false);
        setEditingMemory(null);
        resetAudioUri();
        resetImage();

        updateList();
      } catch (error) {
        console.error("Error updating memory:", error);
        Alert.alert('Error', 'Unable to update memory.');
      }
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Memories</Text>
      <FlatList
        style={styles.fullWidth}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.memoryCard}>
            <Text style={styles.dateText}>{item.date}</Text>
            <Text style={styles.memoryText}>"{item.quote}"</Text>
            {item.image && (
              <Image
                source={{ uri: item.image }}
                style={styles.image}
              />
            )}
            <Text style={styles.locationText}>{item.city}</Text>

            <View style={styles.buttonContainer}>
              {item.audio && (
                <TouchableOpacity onPress={() => toggleAudioPlayback(item.audio, item.id)}>
                  <FontAwesome
                    name={playingAudio === item.id ? 'stop-circle' : 'play-circle'}
                    size={40}
                    color={playingAudio === item.id ? 'red' : 'green'}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => editItem(item.id)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteItem(item.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        data={memories}
      />
      <Modal
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Edit Memory Quote"
              value={editingMemory?.quote}
              onChangeText={(text) => setEditingMemory({ ...editingMemory, quote: text })}
            />
            <View style={styles.buttonRow}>
              {isRecording ? (
                <TouchableOpacity onPress={stopRecording}>
                  <FontAwesome name="stop-circle" size={24} color="#FF5733" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={startRecording}>
                  <FontAwesome name="microphone" size={24} color="#4CAF50" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={pickImage}>
                <MaterialCommunityIcons name="image-plus" size={24} color="#9C27B0" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEditSave}>
                <Fontisto name="save" size={24} color="#1565C0" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            {image && (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}