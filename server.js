import express from 'express';
import { createServer } from 'http';
import { setupWebSocket } from './src/integrations/web-socket.js';

const app = express();
const server = createServer(app);
const wss = setupWebSocket(server);

app.use(express.static('dist'));

server.listen(3001, () => {
  console.log('Server is listening on port 3001');
});
