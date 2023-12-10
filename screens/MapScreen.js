import React, { useState } from 'react';
import { View, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { insertMemory, fetchMemories } from '../database/database';
import { useFocusEffect } from '@react-navigation/native';
import { GlobalStyles as styles } from '../styles/Styles';
import { FAB } from '@rneui/themed';
import Geocoder from 'react-native-geocoding';
import { FontAwesome, MaterialCommunityIcons, Fontisto } from '@expo/vector-icons';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useImagePicker } from '../hooks/useImagePicker';
import useLocationTracker from '../hooks/useLocationTracker';
import { EXPO_PUBLIC_GOOGLE_API_KEY } from '@env';
import CustomMarker from '../components/customMarker';

Geocoder.init(EXPO_PUBLIC_GOOGLE_API_KEY);

export default function MapScreen() {
  const [memoryInput, setMemoryInput] = useState('');
  const [memories, setMemories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { isRecording, startRecording, stopRecording, uploadAudio, audioUri, resetAudioUri } = useAudioRecorder();
  const { image, setImage, pickImage, uploadImage } = useImagePicker();
  const location = useLocationTracker();

  const updateMemories = async () => {
    try {
      const fetchedMemories = await fetchMemories();
      const formattedMemories = fetchedMemories.map(memory => ({
        ...memory,
        latitude: parseFloat(memory.latitude),
        longitude: parseFloat(memory.longitude)
      }));
      setMemories(formattedMemories);
    } catch (error) {
      console.error("Error fetching memories: ", error);
      Alert.alert('Error', 'Unable to load memories.');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      updateMemories();
    }, [])
  );

  const formatDate = (date) => {
    let day = date.getDate().toString();
    let month = (date.getMonth() + 1).toString();
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }


  const handleAddMemory = async () => {
    if (!location || !memoryInput.trim()) {
      Alert.alert("Error", "Please enter a memory and ensure your location is available.");
      return;
    }

    try {
      const geocodeResponse = await Geocoder.from(location.latitude, location.longitude);
      const city = geocodeResponse.results[0].address_components.find(component => component.types.includes('locality')).long_name;
      const currentDate = new Date();
      const formattedDate = formatDate(currentDate);

      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage();
        setImage(null); 
      }

      let audioUrl = null;
      if (audioUri) {
        audioUrl = await uploadAudio(); 
      }

      await insertMemory(memoryInput, location.latitude, location.longitude, imageUrl, city, formattedDate, audioUrl);
      setMemoryInput('');
      setImage(null);
      resetAudioUri();
      updateMemories();
      Alert.alert("Memory Added", "Your new memory has been added.");
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding memory: ", error);
      Alert.alert('Error', 'Unable to save memory.');
    }
  };


  return (
    <View style={styles.mapContainer}>
      {location && (
        <MapView
          style={styles.map}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          {memories.map((memory, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: memory.latitude, longitude: memory.longitude }}
              title={memory.quote}
            >
              <CustomMarker memory={memory} />
            </Marker>
          ))}
        </MapView>
      )}

      <FAB
        placement="right"
        color="#007AFF"
        size="large"
        icon={{ name: 'add', color: 'white' }}
        onPress={() => setModalVisible(true)}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Type in a memory quote"
              value={memoryInput}
              onChangeText={setMemoryInput}
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
              <TouchableOpacity onPress={handleAddMemory}>
                <Fontisto name="save" size={24} color="#1565C0" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}