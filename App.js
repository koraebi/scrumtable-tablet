import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { View, Text, Alert } from 'react-native';
import { SOCKET } from '@env'
import { getIssuesFromApi, parseIssuesInfo, addLabel, removeLabel } from './src/services/api';
import { Board, BoardRepository } from 'react-native-draganddrop-board'
import { Issue } from './src/models/issue';

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
  }
];

export default function App()  {
  let boardRepository = new BoardRepository([]);
  let isEditingLabel = false;

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
        }
      ]);
    }
    initBoard();
  }, []);

  useEffect(() => { 
    console.log('Updating boardData');
    boardRepository.updateData(boardData);
  }, [boardData]);

  updateIssue = (message) => {
    if (isEditingLabel) return;
    
    const action = message.action;

    if (action !== 'labeled' && action !== 'unlabeled') return;

    const updatedIssue = message.issue;

    if (lastMovedIssue && updatedIssue.number === lastMovedIssue.number) {
      lastMovedIssue = null;
      return;
    }

    for (let i = 0; i <= 3; i++) {
      const index = boardData[i].rows.findIndex(issue => issue.number === updatedIssue.number);
      
      if (index !== -1) {
        let data = [...boardData];
        const issue = boardData[i].rows[index];
        data[i].rows.splice(index, 1); 

        if (action === 'labeled')  {
          console.log('Labeling issue ' + issue.id + ' : ' + updatedIssue.labels[0].name);
          issue.label = updatedIssue.labels[0].name;
          switch(issue.label) {
            case 'Must':
              data[0].rows.push(issue);
              break;
            case 'Should':
              data[1].rows.push(issue);
              break;
            case 'Could':
              data[2].rows.push(issue);
              break;
            case "Won't":
              data[3].rows.push(issue);
          }
        }

        setBoardData(data);
        return;
      }
    }

    if (action === 'labeled') {
      let data = [...boardData];
      const issue = new Issue(updatedIssue.title, updatedIssue.body, updatedIssue.number, updatedIssue.labels[0].name, updatedIssue.assignee);
      switch(issue.label) {
        case 'Must':
          data[0].rows.push(issue);
          break;
        case 'Should':
          data[1].rows.push(issue);
          break;
        case 'Could':
          data[2].rows.push(issue);
          break;
        case "Won't":
          data[3].rows.push(issue);
      }

      setBoardData(data);
    }
  }

  lockIssue = (issueNumber, lock) => {
    console.log('Locking issue #' + issueNumber);
    for (let i = 0; i <= 3; i++) {
      const index = boardData[i].rows.findIndex(issue => issue.number.toString() === issueNumber);
      if (index !== -1) {
        let data = [...boardData];
        data[i].rows[index].selectionColor = lock ? "red" : "#4734D3"; 
        setBoardData(data);
        return;
      }  
    }
  }
  
  onIssueDragEnd = async (srcColumn, destColumn, draggedItem) => {
    const issue = draggedItem.attributes.row;
    const newLabel = boardData[destColumn - 1].name;

    if (issue.label === newLabel) return;

    isEditingLabel = true;
    await removeLabel(issue);
    await addLabel(issue, newLabel);
    isEditingLabel = false;
  }

  onIssueTouched = (issue) => {
    let title = issue.id + "  " + issue.name;

    let description = "𝗧𝗶𝘁𝗿𝗲 :\n" + issue.name + "\n\n𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻 :\n" + issue.description;
    if (issue.label !== '') {
      description += "\n\n𝗟𝗮𝗯𝗲𝗹 : " + issue.label;
    }
    if (issue.assigneeName) {
      description += "\n\n𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗮𝗯𝗹𝗲 : " + issue.assigneeName
    }
 
    Alert.alert( 
      title,
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