import React from 'react';
import { View, Image } from 'react-native';
import { GlobalStyles as styles } from '../styles/Styles';
import defaultMarkerImage from '../assets/default_marker.png';

const CustomMarker = ({ memory }) => (
  <View style={styles.markerContainer}>
    <View style={styles.markerImageContainer}>
      <Image
        source={memory.image ? { uri: memory.image } : defaultMarkerImage}
        style={styles.markerImage}
        resizeMode="cover"
      />
    </View>
    <View style={styles.markerArrow} />
  </View>
);

export default CustomMarker;
