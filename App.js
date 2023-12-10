import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import MapScreen from './screens/MapScreen';
import MemoriesScreen from './screens/MemoriesScreen';
{/* import ProfileScreen from './screens/ProfileScreen'; */ }
import { initializeApp } from "firebase/app";
import {
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_AUTHDOMAIN,
  EXPO_PUBLIC_PROJECTID,
  EXPO_PUBLIC_STORAGEBUCKET,
  EXPO_PUBLIC_MESSAGINGSENDERID,
  EXPO_PUBLIC_APPID
} from '@env';

const firebaseConfig = {
  apiKey: EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: EXPO_PUBLIC_AUTHDOMAIN,
  projectId: EXPO_PUBLIC_PROJECTID,
  storageBucket: EXPO_PUBLIC_STORAGEBUCKET,
  messagingSenderId: EXPO_PUBLIC_MESSAGINGSENDERID,
  appId: EXPO_PUBLIC_APPID
};

initializeApp(firebaseConfig);

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Memories"
          component={MemoriesScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="book" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="map" color={color} size={size} />
            ),
          }}
        />
        {/* <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person" color={color} size={size} />
            ),
          }}
        /> */}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
