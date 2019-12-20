const http = require('http');
const app = require('./usersApp');

const port = process.env.PORT ||   7779;

const server = http.createServer(app);

server.listen(port);

