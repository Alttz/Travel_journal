import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

const useLocationTracker = () => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission for location is required.');
        return;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 0,
        },
        (newLocation) => {
          setLocation(newLocation.coords);
        }
      );

      return () => {
        subscription.remove();
      };
    })();
  }, []);

  return location;
};

export default useLocationTracker;
