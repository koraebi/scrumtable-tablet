import {Button, FlatList, StyleSheet, Text, View} from 'react-native';
import React, {Component} from 'react';
import {getIssuesFromApi, parseIssuesInfo} from '../../api/nestjsapi';
import SocketIO from '../socket/socketio';
import EventEmitter from 'events';
import {Card, Title, Paragraph} from 'react-native-elements';

class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      event: new EventEmitter(),
      socket: new SocketIO(this.event),
      issues: [],
    };
  }

  handler(arg) {
    for (let i = 0; i < this.state.issues.length; i++) {
      for (let j = 0; j < this.state.issues[i].length; j++) {
        if (this.state.issues[i][j].name === arg) {
          this.state.issues[i][j].selected = true;
          return;
        }
      }
    }
  }

  componentDidMount() {
    this.state.socket.connect();
    this.state.socket.listen();
    this.state.event.addListener('event-name', this.handler);
    getIssuesFromApi().then(rawJson => {
      this.setState({
        issues: parseIssuesInfo(rawJson),
      });
    });
  }
  _displayIssues() {
    const issues = this.state.issues;
    return (
      <FlatList
        data={this.state.issues[0]}
        renderItem={({item}) => (
          <Card bottomRightText="30 km">
            <Text style={{color: '#000000', paddingVertical: 10}}>
              {item.name}
            </Text>
          </Card>
        )}
      />
    );
  }

  _displayMust() {
    return (
      <FlatList
        data={this.state.issues[1]}
        renderItem={({item}) => (
          <Card style={styles.boxIssues}>
            <Text style={{color: '#000000', paddingVertical: 10}}>
              {item.name}
            </Text>
          </Card>
        )}
      />
    );
  }

  _displayShould() {
    return (
      <FlatList
        data={this.state.issues[2]}
        renderItem={({item}) => (
          <Card>
            <Text style={{color: '#000000', paddingVertical: 10}}>
              {item.name}
            </Text>
          </Card>
        )}
      />
    );
  }
  _displayCould() {
    return (
      <FlatList
        data={this.state.issues[3]}
        renderItem={({item}) => (
          <Card>
            <Text style={{color: '#000000', paddingVertical: 10}}>
              {item.name}
            </Text>
          </Card>
        )}
      />
    );
  }

  _displayWont() {
    return (
      <FlatList
        data={this.state.issues[4]}
        renderItem={({item}) => (
          <Card>
            <Text style={{color: '#000000', paddingVertical: 10}}>
              {item.name}
            </Text>
          </Card>
        )}
      />
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.RectangleShapeViewIssues}>
          <Button
            title="Send Message"
            onPress={() => this.state.socket.sendMessage()}
          />
          <View style={styles.box}>{this._displayIssues()}</View>
        </View>
        <View style={styles.RectangleShapeViewIssue}></View>
        <View style={styles.matrix}>
          <View style={styles.must}>
            <View style={styles.box}>{this._displayMust()}</View>
          </View>
          <View style={styles.should}>
            <View style={styles.box}>{this._displayShould()}</View>
          </View>
        </View>
        <View style={styles.matrix}>
          <View style={styles.could}>
            <View style={styles.box}>{this._displayCould()}</View>
          </View>
          <View style={styles.wont}>
            <View style={styles.box}>{this._displayWont()}</View>
          </View>
        </View>
      </View>
    );
  }
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    flexDirection: 'column',
  },

  name: {
    fontSize: 16,
    marginTop: 5,
    color: '#CD7DDD',
  },
  RectangleShapeViewIssues: {
    flex: 1,
    borderColor: '#CD7DDD',
    backgroundColor: '#78D17B',
    padding: 5,
  },
  RectangleShapeViewIssue: {
    flex: 1,
    backgroundColor: '#CD7DDD',
  },
  box: {},
  boxIssues: {
    paddingTop: 30,
    paddingBottom: 30,
    backgroundColor: '#CD7DDD',
  },
  matrix: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  must: {
    backgroundColor: '#78D17B',
    flex: 1,
  },
  should: {
    backgroundColor: '#7FA9E9',
    flex: 1,
  },
  could: {
    backgroundColor: '#E7DA6E',
    flex: 1,
  },
  wont: {
    backgroundColor: '#E86868',
    flex: 1,
  },
});
