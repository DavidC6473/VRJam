# VRJam

VRJam is a web application that enables users to interact in a virtual reality (VR) environment and collaborate in real time by playing music together using their computer keyboard. This README provides an overview of the VRJam project, including its key components, technologies used, technical challenges faced, and the overall impact it has on remote music collaboration.

## Table of Contents

- [Introduction](#introduction)
- [Key Components](#key-components)
- [Technologies Used](#technologies-used)
- [Running the Application](#running-the-application)
- [Technical Challenges](#technical-challenges)
- [Conclusion](#conclusion)

## Introduction

VRJam is a unique web application designed to facilitate real-time music collaboration in a VR environment. Users can connect to the application through their web browsers, put on a VR headset, and immerse themselves in a virtual room where they can interact with other users and play music together. The project leverages modern web technologies and audio processing to provide an innovative platform for remote musicians to collaborate seamlessly.

## Key Components

The VRJam application consists of two main components: the server and the client.

**Server**: The server-side implementation is built using TypeScript, Node.js, and Express.js. It provides a REST API for user authentication and manages the virtual environment. Socket.io is used to establish a bidirectional communication channel between the server and the client, enabling real-time data exchange between users. WebRTC is utilized for peer-to-peer communication, allowing for low-latency audio transmission. Tone.js handles audio processing and synthesis on the server side, ensuring synchronized and high-quality audio output from each client.

**Client**: The client-side implementation utilizes Three.js, a popular JavaScript library for 3D graphics programming. Three.js is used to create the immersive 3D virtual environment, which includes a virtual room for user movement and a stage for performances. Socket.io is also employed on the client side to establish a connection with the server and facilitate real-time communication with other users in the virtual room. Tone.js handles audio processing and synthesis on the client side, enabling users to play and hear music in real time.

## Technologies Used

The following technologies were instrumental in the development of VRJam:

- **TypeScript**: A statically-typed superset of JavaScript used to write server-side and client-side code, providing enhanced development productivity and improved code quality.
- **Node.js**: A JavaScript runtime environment that enables server-side application development using JavaScript. It offers a vast ecosystem of packages and libraries for building scalable web applications.
- **Express.js**: A popular web application framework for Node.js that simplifies the development of REST APIs and provides a robust foundation for handling HTTP requests and responses.
- **Socket.io**: A real-time bidirectional communication library that enables event-based, low-latency communication between the server and the client. It facilitates real-time collaboration and data exchange among users.
- **WebRTC**: A web standard that enables peer-to-peer communication between web browsers. It is used in VRJam to establish direct audio connections between users, reducing latency and enhancing the real-time music collaboration experience.
- **Tone.js**: A JavaScript library for audio processing and synthesis. It is employed in VRJam to handle audio generation, effects, and synchronization across all connected clients, ensuring a cohesive and synchronized music experience.
- **Three.js**: A powerful JavaScript library for 3D graphics programming. It is utilized to create an immersive virtual environment in VRJam, enabling users to navigate, interact, and perform in a visually appealing and engaging VR setting.

## Running the Application

To run the VRJam application, follow these steps:

1. Ensure that you have Node.js installed on your machine. You can download it from the official website: https://nodejs.org/

2. Clone the VRJam repository to your local machine:
git clone https://github.com/your-username/vrjam.git

3. Navigate to the project directory:
cd vrjam

4. Install the project dependencies using npm:
npm install

5. Build the project:
npm run build

6. Start the server:
npm start

7. Open your web browser and visit http://localhost:3000 to access the VRJam application.

**Note:** The application may require additional setup or configuration steps, such as providing API keys or configuring database connections. Please refer to the project documentation or README for any specific instructions related to your setup.

## Technical Challenges

The development of VRJam presented several technical challenges:

1. **Achieving Low Latency**: VRJam aimed to provide a seamless real-time music collaboration experience. However, achieving low enough latency was a challenge due to network limitations. Despite employing latency reduction techniques such as WebRTC for peer-to-peer communication and server-side audio processing with Tone.js, the target latency was not fully achieved. Extensive experimentation and optimization were necessary to strike the optimal balance between latency reduction and audio quality.

2. **Network Stability and Disconnections**: Network instability led to intermittent disconnections between users. To address this issue, modifications were made to the Socket.io connection protocol, and a custom client-side reconnection algorithm was developed. These enhancements ensured that users were automatically reconnected to the server in the event of a disconnection, allowing for uninterrupted collaboration.

## Conclusion

VRJam is an innovative web application that enables real-time music collaboration in a virtual reality environment. By leveraging technologies such as TypeScript, Node.js, Express.js, Socket.io, WebRTC, Tone.js, and Three.js, VRJam provides a platform for musicians to connect, perform, and create music together, regardless of their physical locations. Despite facing challenges related to latency and network stability, the resulting application demonstrates the potential of modern web technologies to foster remote collaboration and unleash creativity in the realm of music.
