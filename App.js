import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { StyleSheet, View, Text, Modal, ScrollView, Image, Pressable, Alert } from 'react-native';
import { SOCKET } from '@env'
import { getIssuesFromApi, parseIssuesInfo, removeLabels, addLabel } from './src/services/api';
import { Board, BoardRepository } from 'react-native-draganddrop-board'
import { Button } from 'react-native-elements/dist/buttons/Button';

export default function App()  {
  const socket = io.connect(SOCKET, { 
    transports: ['websocket'],
    forceNew: true,
    reconnectionAttempts: 100,
  });
  socket.on('updateTabletIssue', (issue) => this.updateIssue(issue));
  socket.on('lockTabletIssue', (issueNumber) => this.lockIssue(issueNumber, true));
  socket.on('unlockTabletIssue', (issueNumber) => this.lockIssue(issueNumber), false);

  let boardRepository = new BoardRepository([]); 

  const [lastMovedIssue, setLastMovedIssue] = useState({});
  const [boardData, setBoardData] = useState([
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
  ]);

  useEffect(() => {
    const fetchIssues = async () => {
      const json = await getIssuesFromApi();
      const issues = await parseIssuesInfo(json);
      boardData[0].rows = issues[0];
      boardData[1].rows = issues[1];
      boardData[2].rows = issues[2];
      boardData[3].rows = issues[3];
      boardData[4].rows = issues[4];
      setBoardData(boardData);
    }
    fetchIssues();
  }, []);

  useEffect(() => {
    boardRepository.updateData(boardData);
  }, [boardData]);

  updateIssue = (issue) => {
    if (issue.number === lastMovedIssue.number) return;

    for (let i = 0; i <= 4; i++) {
      const index = boardData[i].rows.findIndex(issue => issue.number.toString() === issueNumber);
      if (index !== -1) {
        boardData[i].rows[index].label = issue.label;
        setBoardData(boardData);
        return;
      } 
    } 
  }

  lockIssue = (issueNumber, lock) => {
    for (let i = 0; i <= 4; i++) {
      const index = boardData[i].rows.findIndex(issue => issue.number.toString() === issueNumber);
      if (index !== -1) {
        boardData[i].rows[index].selectionColor = lock ? "red" : "#4734D3";
        setBoardData(boardData);
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