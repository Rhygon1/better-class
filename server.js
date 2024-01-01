import express from 'express';
const app = express();
import http from 'http';
const server = http.createServer(app);
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('1234567890qwertyuioplakjhgfdszxcvbnm', 6);
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const io = new Server(server, {
    cors: {
     origin: "*",
     methods: ["GET", "POST"]
    }
   })
const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(express.static(path.join(__dirname, '/build')))

class Room {
    constructor(){
        this.teacher = {} //socketid: name
        this.students = {}; //[{} socketid: name]
        this.questions = {}
        this.locked = false
    }

    addPerson(newID, name){
        if(Object.keys(this.teacher).length == 0 || Object.keys(this.teacher).includes(newID)){
            this.teacher = {};
            this.teacher[newID] = name
        } else {
            this.students[newID] = name
        }
        console.log(rooms)

        for(let id in this.teacher){
            io.to(id).emit('syncPeople', true, this.teacher, this.students)
        }
        for(let id in this.students){
            io.to(id).emit('syncPeople', false, this.teacher, this.students)
        }
    }

    remUser(oldID){
        if(this.students && this.students[oldID]){
            delete this.students[oldID]
        }

        for(let id in this.teacher){
            io.to(id).emit('syncPeople', true, this.teacher, this.students)
        }
        for(let id in this.students){
            io.to(id).emit('syncPeople', false, this.teacher, this.students)
        }
    }

    newQuestion(question, anonTeacher, socketid){
        if(question.length < 1 || question.length > 256) return
        let newID = uuidv4()
        let name = this.teacher[socketid]
        if(!name) name = this.students[socketid]
        this.questions[newID] = {
            question: question,
            answers: [],
            socketid: socketid
        }

        if(!anonTeacher){
            this.questions[newID] = {
                ...this.questions[newID],
                name
            }
        }

        for(let id in this.teacher){
            io.to(id).emit('syncQuestions', this.questions)
        }
        for(let id in this.students){
            let editedQuestions = { ...this.questions }
            for(let q in editedQuestions) {
                editedQuestions[q] = {
                    question: this.questions[q].question,
                    answers: this.questions[q].answers
                }
            }
            io.to(id).emit('syncQuestions', editedQuestions)
        }
    }

    remQues(quesID){
        if(this.questions && this.questions[quesID]){
            delete this.questions[quesID]
        }

        for(let id in this.teacher){
            io.to(id).emit('syncQuestions', this.questions)
        }
        for(let id in this.students){
            let editedQuestions = { ...this.questions }
            for(let q in editedQuestions) {
                editedQuestions[q] = {
                    question: this.questions[q].question,
                    answers: this.questions[q].answers
                }
            }
            io.to(id).emit('syncQuestions', editedQuestions)
        }
    }
}

let rooms = {}

io.on('connection', socket => {
    console.log(socket.id)

    socket.on('changeName', async (name, id) => {
        if(!rooms[id]){
            return
        }
        if(rooms[id].locked){
            socket.emit('homePage')
            return
        }
        if(Object.keys(rooms[id].teacher).length == 0 || Object.keys(rooms[id].teacher).includes(socket.id)){
            socket.emit('syncValues', rooms[id].teacher, rooms[id].students, rooms[id].questions)
        } else {
            let editedQuestions = { ...rooms[id].questions }
            for(let q in editedQuestions) {
                editedQuestions[q] = {
                    question: rooms[id].questions[q].question,
                    answers: rooms[id].questions[q].answers
                }
            }
            console.log(editedQuestions)
            socket.emit('syncValues', rooms[id].teacher, rooms[id].students, editedQuestions)
        }
        rooms[id].addPerson(socket.id, name)
    })

    socket.on('removeUser', (socketid, roomid) => {
        if(!rooms[roomid] || Object.keys(rooms[roomid].teacher)[0] != socket.id){
            return
        }
        io.to(socketid).emit('homePage')
    })

    socket.on('newQuestion', (question, anonTeacher, roomid) => {
        if(!rooms[roomid]){
            return
        }
        rooms[roomid].newQuestion(question, anonTeacher, socket.id)
    })

    socket.on('removeQuestion', (quesID, roomid) => {
        if(!rooms[roomid] || Object.keys(rooms[roomid].teacher)[0] != socket.id){
            return
        }
        rooms[roomid].remQues(quesID)
    })

    socket.on('setLock', (locked, roomid) => {
        if(!rooms[roomid] || Object.keys(rooms[roomid].teacher)[0] != socket.id){
            return
        }
        rooms[roomid].locked = locked
    })

    socket.on('disconnect', () => {
        console.log(socket.id, ' disconnected')
        for(let id in rooms){
            if(!rooms[id] || !rooms[id].teacher){
                continue
            }
            if(Object.keys(rooms[id].teacher).includes(socket.id)){
                for(let student in rooms[id].students) {
                    console.log(student)
                    io.to(student).emit('homePage')
                }
                delete rooms[id]
            } else if(Object.keys(rooms[id].students).includes(socket.id)){
                rooms[id].remUser(socket.id)
            }
        }
        console.log(rooms)
    })
})

app.get('/api/room/check/:id', (req, res) => {
    if(Object.keys(rooms).includes(req.params.id)){
        res.json({
            exists: true
        })
    } else {
        res.json({
            exists: false
        })
    }
})

app.get('/api/room/create', (req, res) => {
    let newID = nanoid().toLowerCase()
    while(rooms[newID]) newID = nanoid().toLowerCase();
    rooms[newID] = new Room()

    res.json({
        code: newID
    })

    console.log(rooms)
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

server.listen(PORT, () => console.log(PORT))