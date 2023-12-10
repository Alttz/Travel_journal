import React from 'react';
import { View, Button, Alert } from 'react-native';
import { dropTable } from '../database/database';

export default function ProfileScreen() {
  
  const handleDropTable = () => {
    dropTable()
      .then(() => {
        Alert.alert("Success", "The table has been dropped.");
      })
      .catch(error => {
        console.error("Error dropping table: ", error);
        Alert.alert("Error", "Failed to drop the table.");
      });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Drop Table" onPress={handleDropTable} />
    </View>
  );
}