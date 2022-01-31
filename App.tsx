import React, {useState} from 'react';
//import io from 'socket.io-client';
import {Button, FlatList, StyleSheet, Text, View} from 'react-native';
export default function App() {
  const [data, setData] = useState<any[]>([]);
  console.log(data);

  const getIssuesFromApi = () => {
    return fetch('http://192.168.1.80:3000/issues')
      .then(response => response.json())
      .then(json => setData(json))
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.RectangleShapeViewIssues}>
        <View style={styles.box}>
          <FlatList
            data={data}
            renderItem={({item}) => (
              <Text>
                {item.name}, {item.selected}
              </Text>
            )}
          />
        </View>
      </View>
      <View style={styles.RectangleShapeViewIssue}>
        <Button title="issues" onPress={() => getIssuesFromApi()} />
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
    backgroundColor: '#85728A',
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
  box: {
    width: 100,
    height: 100,
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
