import { io } from 'socket.io-client';
import Alert from 'react-native';
import { SOCKET } from '@env'

class Socket {
  handler;

  constructor(props) {
    this.handler = io(SOCKET);
    console.log("HERE");
    console.log(this.handler);
    this.sendMessage = this.sendMessage.bind(this);
  }

  sendMessage(message) {
    handler.emit('msgToWeb', message);
  }
}

export default Socket;
