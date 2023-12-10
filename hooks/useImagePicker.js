import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Alert, Platform } from 'react-native';

export const useImagePicker = () => {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const result = await new Promise((resolve) => {
      Alert.alert(
        'Add Image',
        'Choose an image from the library or take a new photo.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
          {
            text: 'Library',
            onPress: () =>
              resolve(
                ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [4, 3],
                  quality: 1,
                })
              ),
          },
          {
            text: 'Camera',
            onPress: async () => {
              if (Platform.OS === 'android') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert(
                    'Permission Required',
                    'Camera permission is required to take photos.'
                  );
                  resolve(null);
                }
              }
              resolve(
                ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [4, 3],
                  quality: 1,
                })
              );
            },
          },
        ],
        { cancelable: true }
      );
    });

    if (result && !result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image) return null;
    const response = await fetch(image);
    const blob = await response.blob();
    const storage = getStorage();
    const storageRef = ref(storage, `images/${new Date().getTime()}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const resetImage = () => {
    setImage(null);
  };

  return { image, setImage, pickImage, uploadImage, resetImage };
};
