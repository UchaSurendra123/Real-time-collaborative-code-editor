import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token') || 'demo-token',
  },
});

export default socket;
