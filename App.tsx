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
      <View style={styles.RectangleShapeViewIssues}>
        <Text>ALL THE ISSUES</Text>
      </View>
      <View style={styles.RectangleShapeViewIssue}>
        <Text>SELECTED ISSUE</Text>
        <Button title="Issue" onPress={() => socket.emit('message', 'Touch')} />
      </View>
      <View style={styles.matrix}>
        <View style={styles.must} />
        <View style={styles.should} />
      </View>
      <View style={styles.matrix}>
        <View style={styles.could} />
        <View style={styles.wont} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#99A3A4',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'space-between',
  },

  RectangleShapeViewIssues: {
    marginTop: 20,
    width: 560,
    height: 120,
    padding: 10,
    backgroundColor: '#CD7DDD',
  },
  RectangleShapeViewIssue: {
    marginTop: 20,
    width: 560,
    height: 120,
    padding: 10,
    backgroundColor: '#CD7DDD',
  },
  matrix: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 10,
  },
  must: {
    backgroundColor: '#78D17B',
    flex: 2,
    marginRight: 5,
    padding: 10,
  },
  should: {
    backgroundColor: '#7FA9E9',
    flex: 2,
    marginLeft: 5,
    padding: 10,
  },
  could: {
    backgroundColor: '#E7DA6E',
    flex: 2,
    marginLeft: 5,
    padding: 10,
  },
  wont: {
    backgroundColor: '#E86868',
    flex: 2,
    marginLeft: 5,
    padding: 10,
  },
});
