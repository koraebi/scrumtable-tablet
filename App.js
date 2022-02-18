import React, { Component } from 'react';
import io from 'socket.io-client';
import { Alert, StyleSheet, View, Text, Modal, ScrollView, Image, Pressable } from 'react-native';
import { SOCKET } from '@env'
import { getIssuesFromApi, parseIssuesInfo, removeLabelToIssue, addLabelToIssue } from './src/services/api';
import { Board, BoardRepository } from 'react-native-draganddrop-board'

let issues = [];
export default class App extends Component {

  socket = io.connect(SOCKET, { 
    transports: ['websocket'],
    forceNew: true,
    reconnectionAttempts: 100,
  });

  labels = ['MUST', 'SHOULD', 'COULD', 'WONT', 'X'];

  state = {
    boardRepository: new BoardRepository([]),
    selectedIssue: {},
    showModal: false
  };

  render() {
    return (
      <View>
        <Board
          boardRepository={this.state.boardRepository}
          open={(issue) => this.onIssueTouched(issue)}
          onDragEnd={(srcColumn, destColumn, draggedItem) => this.onIssueDragEnd(srcColumn, destColumn, draggedItem)}
          boardBackground='black'
          cardContent={(issue) => (
            <View style={[styles.card, {borderColor: issue.selectionColor}]}>
              <View style={styles.row}>
                <Text style={styles.textCardId}>{issue.id}</Text>
                <Text numberOfLines={1} style={[styles.textCard, {color: issue.selectionColor}]}>{issue.name}</Text>
              </View>
              <Text numberOfLines={1} style={{fontSize: 20, color: "gray", marginTop: 5}}>{issue.description}</Text>
            </View>
          )}
        />
        <Modal
          style={styles.modal}
          animationType="slide"
          transparent={false}
          visible={this.state.showModal}
          onRequestClose={() => {
            this.setState({
              showModal: false
            });
          }}
        >
          <ScrollView style={styles.scrollview}>
            <View style={styles.row}>
              <Text style={[styles.text, {fontSize: 30, marginRight: 5}]}>{this.state.selectedIssue.id}</Text>

              <View style={[styles.label, {display: this.state.selectedIssue.displayLabel, right:1, position:'absolute', alignSelf: 'center', borderColor: this.state.selectedIssue.textColor, backgroundColor: this.state.selectedIssue.backgroundColor}]}>
                <Text style={[styles.textLabel, {color: this.state.selectedIssue.textColor}]}>{this.state.selectedIssue.label}</Text>
              </View>
            </View>
            
            <Text style={[styles.text, styles.textTitle]}>{this.state.selectedIssue.name}</Text>

            <View style={[styles.row, {display: this.state.selectedIssue.displayAssignee, marginVertical:10}]}>
              <Image 
                source={{uri: this.state.selectedIssue.assigneeAvatarUrl}}  
                style={{width: 50, height: 50, borderRadius: 50/ 2}} 
              />
              <Text style={[styles.text, styles.textAssignee]}>{this.state.selectedIssue.assigneeName}</Text>
            </View>
            
            <Text style={[styles.text, styles.textDescription]}>{this.state.selectedIssue.description}</Text>
          </ScrollView>
            
          <Pressable
            style={styles.button}
            onPress={() => this.setState({
              showModal: false
            })}
          >
            <Text style={styles.textButton}>FERMER</Text>
          </Pressable>
        </Modal>
      </View>
    );
  }

  async componentDidMount() {
    this.updateIssues("");

    this.socket.on('updateTabletIssues', (message) => this.updateIssues(message));
    this.socket.on('lockTabletIssue', (message) => this.lockIssue(message, true));
    this.socket.on('unlockTabletIssue', (message) => this.lockIssue(message), false);
  }

  async updateIssues(message) {
    const json = await getIssuesFromApi();
    issues = parseIssuesInfo(json);
    this.loadBoard();
  }

  async lockIssue(issueNumber, lock) {
    console.log(issueNumber + ' is locked');

    for (let i = 0; i <= 4; i++) {
      const index = issues[i].findIndex(issue => issue.number.toString() === issueNumber);
      console.log(index);
      if (index !== -1) {
        console.log('FOUND');
        const issue = issues[i][index];
        issue.selectionColor = lock ? "red" : "#4734D3";
        issues[i][index] = issue;
        this.loadBoard();
      } 
    } 
  }
  
  async onIssueDragEnd(srcColumn, destColumn, draggedItem) {
    const issue = draggedItem.attributes.row;
    const newLabel = this.labels[destColumn - 1];

    if (issue.label.toLowerCase().replace("'", '') === newLabel.toLowerCase()) return;

    if (issue.label !== 'X') {
      await removeLabelToIssue(issue);
    }

    await addLabelToIssue(issue, newLabel);

    this.socket.emit('updateWebIssues', issue.id); 
  }

  async onIssueTouched(issue) {
    this.socket.emit('lockWebIssue', issue.id);
    this.setState({
      selectedIssue: issue,
      showModal: true
    });
  }

  loadBoard() {
    const boardData = [
      {
        id: 1, 
        name: 'MUST',
        rows: issues[1]
      },
      {
        id: 2,
        name: 'SHOULD',
        rows: issues[2]
      },
      { 
        id: 3,
        name: 'COULD',
        rows: issues[3]
      },
      {
        id: 4,
        name: "WON'T",
        rows: issues[4]
      }, 
      {
        id: 5,
        name: "TODO",
        rows: issues[0]
      }
    ];

    this.setState({
      boardRepository: new BoardRepository(boardData)
    });
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection:'row'
  },
  card: {
    fontWeight: '400',
    fontSize: 20,
    padding: 10,
    borderRadius: 15,
    backgroundColor: 'white',
    textAlign: "left",
    color: "#4734D3",
    margin: 10,
    borderWidth: 0.5
  },
  text: {
    textAlign: 'left',
  },
  textAssignee: {
    marginLeft: 5,
    alignSelf: 'center',
    textAlign: 'left',
    fontStyle: 'italic',
    fontSize: 20,
    color: 'grey',
    fontWeight: '300'
  },
  textCard: {
    marginRight: 20,
    fontWeight: '400',
    fontSize: 20,
  },
  textCardId: {
    marginRight: 5,
    alignSelf: 'center',
    color: "#8B949E",
    fontWeight: '300',
    fontSize: 20,
  },
  textTitle: {
    color: "#4734D3",
    fontWeight: '400',
    fontSize: 30,
  },
  textDescription: {
    marginBottom: 100,
    marginTop: 10,
    fontWeight: '300',
    fontSize: 20,
    color: 'black'
  },
  textButton: {
    marginHorizontal: 20,
    textAlign: "center",
    color: 'white'
  },
  textLabel: {
    color: 'white',
    flexShrink: 1
  },
  label: {
    marginVertical: 5,
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    elevation: 2,
    textAlign: "center",
    borderRadius: 20,
    borderWidth: 1
  },
  scrollview: {
    marginHorizontal: 30,
    marginTop: 30
  },
  button: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 1,
    backgroundColor: "#4734D3",
    borderRadius: 30,
    padding: 15,
    elevation: 2,
    marginHorizontal: 50,
    marginBottom: 30
  },
  modal: {
    flexDirection:'row',
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    shadowRadius: 4,
    elevation: 5
  },
})