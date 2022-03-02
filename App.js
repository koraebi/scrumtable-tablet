import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { View, Alert, StyleSheet, Text, Modal, ScrollView, Image, Pressable } from 'react-native';
import { SOCKET } from '@env'
import { getIssuesFromApi, parseIssuesInfo, setLabel } from './src/services/api';
import { Board, BoardRepository } from 'react-native-draganddrop-board'
import { Issue } from './src/models/issue';

const boardRepository = new BoardRepository([
  {
    id: 1, 
    name: 'Must',  
    rows: []
  }, 
  {
    id: 2, 
    name: 'Should',
    rows: []
  },  
  { 
    id: 3,
    name: 'Could',
    rows: []
  }, 
  {
    id: 4,
    name: "Won't", 
    rows: []
  }
]);

export default function App()  {
  let isEditing = false;

  const [boardData, setBoardData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState({});
 
  useEffect(() => { 
    console.log("Init"); 

    const socket = io.connect(SOCKET, {
      transports: ['websocket'], 
      forceNew: true,
      reconnectionAttempts: 100,
    }); 
    socket.on('updateIssue', (message) => updateIssue(message));
    socket.on('lockTabletIssue', (issueNumber) => lockIssue(issueNumber, true));
    socket.on('unlockTabletIssue', (issueNumber) => lockIssue(issueNumber), false);

    initBoard = async () => {
      const json = await getIssuesFromApi();
      const issues = await parseIssuesInfo(json); 
      const data = [
        {
          id: 1, 
          name: 'Must',  
          rows: issues[0]
        }, 
        {
          id: 2, 
          name: 'Should',
          rows: issues[1]
        }, 
        { 
          id: 3,
          name: 'Could',
          rows: issues[2]
        }, 
        {
          id: 4,
          name: "Won't", 
          rows: issues[3]
        }
      ];
      boardRepository.updateData(data);
      setBoardData(data);
    }
    initBoard();
  }, []);

  useEffect(() => { 
    console.log('Board reloaded');
  }, [boardData]);

  updateIssue = (message) => {
    if (isEditing) {
      isEditing = false;
      return;
    }

    let data = [...boardData];

    for (let i = 0; i <= 3; i++) {
      const index = data[i].rows.findIndex(issue => issue.number === message.issue.number);
      
      if (index !== -1) {
        data[i].rows.splice(index, 1); 
        break;
      }
    }

    const issue = new Issue(message.issue.title, message.issue.body, message.issue.number, message.label, message.issue.assignee);

    switch(message.label) {
      case 'Must':
        data[0].rows.push(issue);
        console.log('Label \"Must\" set to issue ' + issue.id);
        break;
      case 'Should':
        data[1].rows.push(issue);
        console.log('Label \"Should\" set to issue ' + issue.id);
        break;
      case 'Could':
        data[2].rows.push(issue);
        console.log('Label \"Could\" set to issue ' + issue.id);
        break;
      case "Won't":
        data[3].rows.push(issue);
        console.log("Label \"Won't\" set to issue " + issue.id);
        break;
      default:
        console.log('Issue ' + issue.id + ' deleted from the board');
    }

    boardRepository.updateData(data);
    setBoardData(data);
  }

  lockIssue = (issueNumber, lock) => {
    console.log('Locking issue #' + issueNumber);
    for (let i = 0; i <= 3; i++) {
      const index = boardData[i].rows.findIndex(issue => issue.number.toString() === issueNumber);
      if (index !== -1) {
        let data = [...boardData];
        data[i].rows[index].selectionColor = lock ? "red" : "#4734D3"; 
        boardRepository.updateData(data);
        setBoardData(data);
        break;
      }  
    }
  }
  
  onIssueDragEnd = async (srcColumn, destColumn, draggedItem) => {
    const editedIssue = draggedItem.attributes.row;
    const newLabel = boardData[destColumn - 1].name;

    if (editedIssue.label === newLabel) return;

    let data = [...boardData];
    for (let i = 0; i <= 3; i++) {
      const index = boardData[i].rows.findIndex(issue => issue.number.toString() === editedIssue.number);
      if (index !== -1) {
        data[i].rows[index].label = newLabel; 
        break;
      }
    }
    
    isEditing = true;
    setLabel(editedIssue.number, newLabel);
    setBoardData(data);
  }

  onIssueTouched = (issue) => {
    setSelectedIssue(issue);
    setShowModal(true);
  }

  return (
    <View>
      <Board
        boardRepository={boardRepository}
        open={(issue) => onIssueTouched(issue)}
        onDragEnd={(srcColumn, destColumn, draggedItem) => onIssueDragEnd(srcColumn, destColumn, draggedItem)}
        boardBackground='black'
        cardContent={(issue) => (
          <View style={{
            borderColor: issue.selectionColor,
            marginRight: 20,
            fontSize: 20,
            fontWeight: '400',
            padding: 10,
            borderRadius: 15,
            backgroundColor: 'white',
            textAlign: "left",
            color: "#4734D3",
            margin: 10,
            borderWidth: 0.5}}
          >
            <View style={{flexDirection:'row'}}>
              <Text style={{
                marginRight: 5,
                alignSelf: 'center',
                color: "#8B949E",
                fontWeight: '300',
                fontSize: 20}}
              >{issue.id}</Text>
              <Text numberOfLines={1} style={{
                marginRight: 20,
                fontWeight: '400',
                fontSize: 20,
                color: issue.selectionColor}}
              >{issue.name}</Text>
            </View>
            <Text numberOfLines={1} style={{fontSize: 20, color: "gray", marginTop: 5}}>{issue.description}</Text>
          </View>
        )}
      />
      <Modal
          style={styles.modal}
          animationType="slide" 
          transparent={false}
          visible={showModal}
        >
          <ScrollView style={styles.scrollview}>
            <View style={styles.row}>
              <Text style={[styles.text, {fontSize: 30, marginRight: 5}]}>{selectedIssue.id}</Text>

              <View style={[styles.label, {display: selectedIssue.displayLabel, right:1, position:'absolute', alignSelf: 'center', borderColor: selectedIssue.textColor, backgroundColor: selectedIssue.backgroundColor}]}>
                <Text style={[styles.textLabel, {color: selectedIssue.textColor}]}>{selectedIssue.label}</Text>
              </View>
            </View>
            
            <Text style={[styles.text, styles.textTitle]}>{selectedIssue.name}</Text>

            <View style={[styles.row, {display: selectedIssue.displayAssignee, marginVertical:10}]}>
              <Image 
                source={{uri: selectedIssue.assigneeAvatarUrl}}  
                style={{width: 50, height: 50, borderRadius: 50/ 2}} 
              />
              <Text style={[styles.text, styles.textAssignee]}>{selectedIssue.assigneeName}</Text>
            </View>
            
            <Text style={[styles.text, styles.textDescription]}>{selectedIssue.description}</Text>
          </ScrollView>
            
          <Pressable
            style={styles.button}
            onPress={() => setShowModal(false)}
          >
            <Text style={styles.textButton}>FERMER</Text>
          </Pressable>
      </Modal>
    </View>
  )
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