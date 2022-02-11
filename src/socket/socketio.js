import io from 'socket.io-client';
import EventEmitter from 'events';
import {Alert} from 'react-native';

class SocketIO {
  socket;
  x;

  constructor(x) {
    this.x = x;
  }

  connect() {
    this.socket = io('http://52.88.52.11:3000');
  }

  listen() {
    let issueName = '';
    this.socket.on('msgFromWeb', message => {
      console.log(message);
      if (message.includes('Locked')) issueName = message.substring(6);
      Alert.alert('Message', issueName);
    });
  }

  sendMessage() {
    this.socket.emit('msgToWeb', 'Message depuis le mobile');
  }
}

export default SocketIO;
