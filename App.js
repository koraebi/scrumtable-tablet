import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { View, Text, Alert } from 'react-native';
import { SOCKET } from '@env'
import { getIssuesFromApi, parseIssuesInfo, removeLabels, addLabel } from './src/services/api';
import { Board, BoardRepository } from 'react-native-draganddrop-board'

console.log("Start 0"); 

const boardDataTemplate = [
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
  }, 
  {
    id: 5,
    name: "ToDos",
    rows: []
  }
];

export default function App()  {
  console.log("Start 1"); 

  let lastMovedIssue;
  let boardRepository = new BoardRepository([]);

  const [boardData, setBoardData] = useState(boardDataTemplate);
 
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
  }, []);

  useEffect(() => { 
    if (boardData === boardDataTemplate) {
      console.log('Initializing boardData');
      initBoard = async () => {
        const json = await getIssuesFromApi();
        const issues = await parseIssuesInfo(json); 
        setBoardData([
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
          }, 
          {
            id: 5,
            name: "ToDos",
            rows: issues[4]
          }
        ]);
      }
      initBoard();
    } else { 
      console.log('Updating boardData: ' + JSON.stringify(boardData));
      boardRepository.updateData(boardData);
      boardRepository.updateData(boardData);
    }
  }, [boardData]);

  updateIssue = (message) => {
    const action = message.action;
    if (action !== 'labeled' && action !== 'unlabeled') return;

    const updatedIssue = message.issue;

    if (lastMovedIssue && updatedIssue.number === lastMovedIssue.number) {
      lastMovedIssue = null;
      return; 
    }

    for (let i = 0; i <= 4; i++) {
      const index = boardData[i].rows.findIndex(issue => issue.number === updatedIssue.number);
      if (index !== -1) {
        let issue = boardData[i].rows[index];
        let data = [...boardData];
        data[i].rows.splice(index, 1); 

        if (action === 'unlabeled') { 
          console.log('Removing issue #' + issue.number + ' label ' + issue.label);
          issue.label = '';
          data[4].rows.push(issue);
        } else {
          console.log('Changing issue #' + issue.number + ' from label ' + issue.label + ' to ' + updatedIssue.labels[0].name);
          issue.label = updatedIssue.labels[0].name;
          switch(issue.label) {
            case 'Must':
              data[0].rows.push(issue);
              console.log('pushed to Must');
              break;
            case 'Should':
              data[1].rows.push(issue);
              console.log('pushed to Should');
              break;
            case 'Could':
              data[2].rows.push(issue);
              console.log('pushed to Could');
              break;
            case "Won't":
              data[3].rows.push(issue);
              console.log('pushed to Wont');
          }
        }

        setBoardData(data);
        return;
      }  
    }
  }

  lockIssue = (issueNumber, lock) => {
    console.log('Locking issue #' + issueNumber);
    for (let i = 0; i <= 4; i++) {
      const index = boardData[i].rows.findIndex(issue => issue.number.toString() === issueNumber);
      if (index !== -1) {
        let data = [...boardData];
        data[i].rows[index].selectionColor = lock ? "red" : "#4734D3"; 
        console.log('Locked' + issueNumber);

        setBoardData(data);
        return;
      }  
    }
  }
  
  onIssueDragEnd = async (srcColumn, destColumn, draggedItem) => {
    const issue = draggedItem.attributes.row;
    const newLabel = boardData[destColumn - 1].name;

    if ((issue.label === newLabel) || (issue.label === '' && newLabel === 'ToDos')) return;

    if (newLabel === "ToDos") {
      await removeLabels(issue);
    } else {
      await addLabel(issue, newLabel);
    } 
 
    lastMovedIssue = issue;
  }

  onIssueTouched = (issue) => {
    let description = issue.description ?? "";
    if (issue.assigneeName) {
      description += "\n\nAssigné à : " + issue.assigneeName
    }

    Alert.alert( 
      issue.id + "  " + issue.name,
      description,
    )
  }

  return (
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
  )
}