import {Button, FlatList, StyleSheet, Text, View} from 'react-native';
import React, {Component} from 'react';
import {Issue} from '../model/Issue';
import { getIssuesFromApi, parseIssuesInfo } from "../../api/nestjsapi";
import SocketIO from '../socket/socketio';
import Loader from '../components/common/Loader';
import {Badge} from 'react-native-elements';
import EventEmitter from 'events';


class HomeScreen extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      event : new EventEmitter(),
      socket: new SocketIO(this.event),
      isLoading: true,
      issues: []
    };
  }

  handler(arg) {
    for(let i = 0; i < this.state.issues.length; i++)
      for(let j = 0; j < this.state.issues[i].length; j++){
          if (this.state.issues[i][j].name === arg) {
            this.state.issues[i][j].selected = true;
            return;
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
        isLoading: false,
      })
    });
  }


  _displayLoading() {
    if (this.state.isLoading){
      return (
        <Loader />
      )
    }
  }

  _displayIssues() {
    const { isLoading, issues } = this.state
    if(!isLoading) {
      return(
        <FlatList
              data={this.state.issues[0]}
              renderItem={({item}) => (
                <Badge value={item.name} status={!item.selected ? 'primary' : 'success'}/>
              )}
            />
      )
    }
  }



  render() {
    return (
      <View style={styles.container}>
        <View style={styles.RectangleShapeViewIssues}>
          <View style={styles.box}>
          {this._displayLoading()}
          {this._displayIssues()}
          </View>
        </View>
        <View style={styles.RectangleShapeViewIssue}>
          <Button
            title="Send Message"
            onPress={() => this.state.socket.sendMessage()}
          />
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
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    flexDirection: 'column'
  },

  RectangleShapeViewIssues: {
    flex: 1,
    borderColor: '#CD7DDD',
    padding: 5,
  },
  RectangleShapeViewIssue: {
    flex: 1,
    backgroundColor: 'white',
  },
  box: {
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
