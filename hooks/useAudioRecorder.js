import { useState } from 'react';
import { Audio } from 'expo-av';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);

  const startRecording = async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (permission.status !== 'granted') {
      alert('Permission for audio recording is required.');
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const newRecording = new Audio.Recording();
    try {
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start audio recording', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop audio recording', error);
    }
  };

  const uploadAudio = async () => {
    if (!audioUri) return;

    const response = await fetch(audioUri);
    const blob = await response.blob();
    const storage = getStorage();
    const storageRef = ref(storage, 'audios/' + new Date().getTime());

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const resetAudioUri = () => {
    setAudioUri(null);
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    uploadAudio,
    audioUri,
    resetAudioUri,
  };
};
