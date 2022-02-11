import React, {Component} from 'react';
import { getIssuesFromApi, parseIssuesInfo, removeLabelToIssue, addLabelToIssue } from '../../api/nestjsapi';
import SocketIO from '../socket/socketio';
import EventEmitter from 'events';
import { Board, BoardRepository } from 'react-native-draganddrop-board'

let boardRepository;

class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      event: new EventEmitter(),
      socket: new SocketIO(this.event)
    };
  }

  handler(arg) {
    console.log(arg);
    this.loadIssues();
    this.boardRepository.updateData(this.state.board);
  }

  loadIssues() {
    getIssuesFromApi().then(rawJson => {
      this.setState({
        board: [
          {
            id: 1,
            name: 'MUST',
            rows: parseIssuesInfo(rawJson)[1]
          },
          {
            id: 2,
            name: 'SHOULD',
            rows: parseIssuesInfo(rawJson)[2]
          },
          {
            id: 3,
            name: 'COULD',
            rows: parseIssuesInfo(rawJson)[3]
          },
          {
            id: 4,
            name: "WON'T",
            rows: parseIssuesInfo(rawJson)[4]
          },
          {
            id: 5,
            name: "A PRIORISER",
            rows: parseIssuesInfo(rawJson)[0]
          }
        ]
      });
    });
  }

  componentDidMount() {
    this.state.socket.connect();
    this.state.socket.listen();
    this.state.event.addListener('event-name', this.handler);
    this.loadIssues();
    
  }

  render() {
    boardRepository = new BoardRepository(this.state.board);
    const labels = ['', 'MUST', 'SHOULD', 'COULD', "WONT", 'x'];

    return (
      <Board
        boardRepository={boardRepository}
        open={() => {
          this.state.socket.sendMessage();
        }}
        onDragEnd={(srcColumn, destColumn, draggedItem) => {
          const issue = draggedItem.attributes.row;
          const newLabel = labels[destColumn];
          if (issue.moscow === newLabel) return;

          removeLabelToIssue(issue).then(response => {
            if (newLabel === 'x') return;

            addLabelToIssue(issue, newLabel).then(response => {
              console.log(response);
            });
          });
        }}
      />
    );
  }
} 

export default HomeScreen;
