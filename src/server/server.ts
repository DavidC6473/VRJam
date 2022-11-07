import express from 'express'
import path from 'path'
import http from 'http'
import { Server, Socket } from 'socket.io'

const port: number = 3000


class App {
    private server: http.Server
    private port: number

    private io: Server
    private clients: any = {}

    constructor(port: number) {
        this.port = port
        const app = express()
        app.use(express.static(path.join(__dirname, '../client')))

        this.server = new http.Server(app)

        this.io = new Server(this.server)

        this.io.on('connection', (socket: Socket) => {
            console.log(socket.constructor.name)
            this.clients[socket.id] = {}
            console.log(this.clients)
            console.log('a user connected : ' + socket.id)
            socket.emit('id', socket.id)

            socket.on('disconnect', () => {
                console.log('socket disconnected : ' + socket.id)
                if (this.clients && this.clients[socket.id]) {
                    console.log('deleting ' + socket.id)
                    delete this.clients[socket.id]
                    this.io.emit('removeClient', socket.id)
                }
            })


            socket.on('update', (message: any) => {
                if (this.clients[socket.id]) {
                    this.clients[socket.id].t = message.t; //client timestamp
                    this.clients[socket.id].p = message.p; //position
                    this.clients[socket.id].r = message.r;
                }
            })
            socket.on("connect_error", (err) => {
                console.log(`connect_error due to ${err.message}`);
            });

            var message
            var returnMessage

            socket.on("keydown", (e) => {

                message = e
                //console.log(e.key);
                // synth1.triggerAttack(keyToPitch[e.key]);
                // Tone.context.latencyHint = "interactive";
                //var y = e;
                this.io.emit("noteOn", (message))

            });

            socket.on("keyup", (e) => {

                returnMessage = e
                // console.log(e.key);
                // synth1.triggerRelease();
                this.io.emit("noteOff", (returnMessage))

            });
        });

        setInterval(() => {
            this.io.emit('clients', this.clients)
        }, 50)


       /**** this.io.on("play", (socket) => {
            socket.emit("keyup", (e));
        });

        this.io.on("stop", (socket) => {
            socket.emit("keydown", (e));
        });****/

        

        
         
    }



    public Start() {
        this.server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}.`)
        })
    }
}

new App(port).Start()