// Credit: https://github.com/sebmorales/basicNodeTemplate/blob/master
//  Socket.io + p5.js Template + Node.js Express Server
// Simple template for real-time applications using Socket.io and p5.js

// Import required modules using ES6 syntax (modern JavaScript)
import express from 'express';           // Web framework for creating the server
import { createServer } from 'http';     // Node.js HTTP server
import { Server } from 'socket.io';      // Real-time communication library

// EXPRESS SERVER SETUP
const app = express();
const port = process.env.PORT || 4000;
const server = createServer(app);

// SOCKET.IO SETUP with backwards compatibility
const io = new Server(server, {
  allowEIO3: true, // Allows older clients (Socket.io 2.x) to connect - useful for Node-RED
  cors: {
    origin: "*",        // Allow connections from any website (restrict in production!)
    methods: ["GET", "POST"]
  }
});

// STATIC FILE SERVING
// Serves all files from the 'public' folder
app.use(express.static('./public'));

// SOCKET.IO REAL-TIME COMMUNICATION
// This is where the magic happens! Socket.io manages connections between clients and server
// Every time someone opens your website, this 'connection' event fires

io.on('connection', (client) => {
  console.log(`New client connected: ${client.id}`);
  
  // EVENT LISTENERS - these listen for messages from clients
  // When a client sends a message with a specific name, the corresponding function runs
  
  // you can make as many eventnames as you want. As long as the clients are sending/listenting to them.
  client.on('test', (value) => {
    io.emit('test', value);
  });
  
  client.on('relay', (value) => {
    //Sometimes it's useful to have a generic eventname, where you can send any data without having to updated the server.
    // You can also have layers of routing for example: {"type: "draw", "data: {x:0, y:0 }}"
    // Then the clients get all the data and decide what to do with it based on the "type" value.
    io.emit('relay', value);
  });

  // Handle client disconnection
  client.on('disconnect', () => {
    console.log(`Client disconnected: ${client.id}`);
    // You could add cleanup code here if needed
    // For example: remove user from a user list, save their work, etc.
  });
});

// START THE SERVER
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Draw example: http://localhost:${port}/draw-example/`);
  console.log(`View example: http://localhost:${port}/view-example/`);

});