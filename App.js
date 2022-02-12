import React, { Component } from 'react';
import io from 'socket.io-client';
import Alert from 'react-native';
import { SOCKET } from '@env'
import { getIssuesFromApi, parseIssuesInfo, removeLabelToIssue, addLabelToIssue } from './src/services/api';
import { Board, BoardRepository } from 'react-native-draganddrop-board'


export default class App extends Component {

  socket = io.connect(SOCKET, {
    transports: ['websocket'],
    forceNew: true,
    reconnectionAttempts: 100,
  });

  labels = ['MUST', 'SHOULD', 'COULD', 'WONT', 'X'];

  state = {
    boardRepository: new BoardRepository([])
  };

  render() {
    return (
      <Board
        boardRepository={this.state.boardRepository}
        open={(issue) => this.onIssueTouched(issue)}
        onDragEnd={(srcColumn, destColumn, draggedItem) => this.onIssueDragEnd(srcColumn, destColumn, draggedItem)}
        boardBackground='black'
      />
    );
  }

  async componentDidMount() {
    await this.loadBoard();

    this.socket.on('updateMobileIssues', (message) => this.updateIssues(message));
    this.socket.on('lockMobileIssue', (message) => this.lockIssue(message));
    this.socket.on('unlockMobileIssue', (message) => this.unlockIssue(message));
  }

  async updateIssues(message) {
    await this.loadBoard();
  }

  async lockIssue(issueID) {
    console.log(issueID + ' is locked');
  }

  async unlockIssue(issueID) {
    console.log(issueID + ' is unlocked');
  }
  
  async onIssueDragEnd(srcColumn, destColumn, draggedItem) {
    const issue = draggedItem.attributes.row;
    const newLabel = this.labels[destColumn - 1];

    if (issue.label.toLowerCase().replace("'", '') === newLabel.toLowerCase()) return;

    if (issue.label !== 'x') {
      await removeLabelToIssue(issue);
    }

    await addLabelToIssue(issue, newLabel);

    this.socket.emit('updateWebIssues', issue.id);
  }

  async onIssueTouched(issue) {
    this.socket.emit('lockWebIssue', issue.id);
  }

  async loadBoard() {
    const json = await getIssuesFromApi();
    const boardData = [
      {
        id: 1,
        name: 'MUST',
        rows: parseIssuesInfo(json)[1]
      },
      {
        id: 2,
        name: 'SHOULD',
        rows: parseIssuesInfo(json)[2]
      },
      {
        id: 3,
        name: 'COULD',
        rows: parseIssuesInfo(json)[3]
      },
      {
        id: 4,
        name: "WON'T",
        rows: parseIssuesInfo(json)[4]
      },
      {
        id: 5,
        name: "A PRIORISER",
        rows: parseIssuesInfo(json)[0]
      }
    ];
    this.setState({
      boardRepository: new BoardRepository(boardData)
    });
  }
}
