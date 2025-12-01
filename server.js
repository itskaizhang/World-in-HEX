// // Credit: https://github.com/sebmorales/basicNodeTemplate/blob/master
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

// STATIC FILE SERVING
// Serves all files from the 'public' folder
app.use(express.static('public'));

// SOCKET.IO SETUP with backwards compatibility
const io = new Server(server, {
  allowEIO3: true, // Allows older clients (Socket.io 2.x) to connect - useful for Node-RED
  cors: {
    origin: "*",   // "*" Allow connections from any website (restrict in production!)
    methods: ["GET", "POST"]
  }
});

// SOCKET.IO REAL-TIME COMMUNICATION
// This is where the magic happens! Socket.io manages connections between clients and server
// Every time someone opens your website, this 'connection' event fires

io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);
  
    
    // socket.on("new-image", (imageData) => {
    //   io.emit("image-broadcast", imageData); 
    // });

    // If there is a message called 'mouse'
    // Trigger mouseMsg function (but we can just write out the function inside)
    socket.on('mouse', (data) => {
        // Messages on coming into the server, but not back out,
        // so we need broadcast -- however when we receive it
        // we can do lot of manipulation with that message
        socket.broadcast.emit('mouse', data);
    }) 

    // Client (participant.js) sent a message called 'upload-image'
    socket.on('upload-image', (imageData) => {
        // console.log('Received image: ', imageData);
        socket.broadcast.emit('upload-image', imageData); // Server broadcasts to all clients (specifically to main.js)
    })

    // Handle socket client disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id)
    })
});
  

//   // Handle client disconnection
//   client.on('disconnect', () => {
//     console.log(`Client disconnected: ${client.id}`);
//     // You could add cleanup code here if needed
//     // For example: remove user from a user list, save their work, etc.
//   });

// START THE SERVER
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
})