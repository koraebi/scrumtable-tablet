import React from 'react';
import io from 'socket.io-client';
import {Alert, Button, StyleSheet, Text, View} from 'react-native';

export default function App() {
  const socket = io('http://localhost:3000');

  socket.on('message', (message: string | undefined) => {
    Alert.alert('Message', message);
  });

  return (
    <View style={styles.container}>
      <Text>Scrumtable</Text>
      <Button title="Message" onPress={() => socket.emit('message', 'Touch')} />
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
});
