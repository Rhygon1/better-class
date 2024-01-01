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
import clerkClient from '@clerk/clerk-sdk-node';
import 'dotenv/config';

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
    constructor() {
        this.teacher = {} //socketid: id
        this.students = {}; //[{} socketid: name]
        this.questions = {}
        this.locked = false
    }

    addPerson(newID, userID) {
        if (Object.keys(this.teacher).length == 0 || Object.keys(this.teacher).includes(newID)) {
            this.teacher = {};
            this.teacher[newID] = userID
        } else {
            this.students[newID] = userID
        }
        console.log(rooms)

        this.syncPeople()
    }

    remUser(oldID) {
        if (this.students && this.students[oldID]) {
            delete this.students[oldID]
        }

        this.syncPeople()
    }

    newQuestion(question, anonTeacher, socketid) {
        if (question.length < 1 || question.length > 256) return
        let newID = uuidv4()
        let userID = this.teacher[socketid]
        if (!userID) userID = this.students[socketid]
        this.questions[newID] = {
            content: question,
            answers: {},
            socketid: socketid
        }

        if (!anonTeacher) {
            this.questions[newID] = {
                ...this.questions[newID],
                userID
            }
        }

        this.syncQuestions()
    }

    remQues(quesID) {
        if (this.questions && this.questions[quesID]) {
            delete this.questions[quesID]
        }

        this.syncQuestions()
    }

    newAnswer(answer, anonTeacher, socketid, quesid){
        if (answer.length < 1 || answer.length > 256 || !this.questions[quesid] || !this.questions) return
        let newID = uuidv4()
        let userID = this.teacher[socketid]
        if (!userID) userID = this.students[socketid]
        this.questions[quesid].answers[newID] = {
            content: answer,
            socketid: socketid
        }

        if (!anonTeacher) {
            this.questions[quesid].answers[newID] = {
                ...this.questions[quesid].answers[newID],
                userID
            }
        }

        this.syncQuestions()
    }

    remAns(quesID, ansID) {
        if (this.questions && this.questions[quesID] && this.questions[quesID].answers[ansID]) {
            delete this.questions[quesID].answers[ansID]
        }

        this.syncQuestions()
    }

    getEditedForStudentAnswers(answers){
        let editedAnswers = { ...answers }
        for (let q in editedAnswers) {
            editedAnswers[q] = {
                content: answers[q].content,
            }
        }

        return editedAnswers
    }

    getEditedForStudentQuestions() {
        let editedQuestions = { ...this.questions }
        for (let q in editedQuestions) {
            editedQuestions[q] = {
                content: this.questions[q].content,
                answers: this.getEditedForStudentAnswers(this.questions[q].answers)
            }
        }

        return editedQuestions
    }

    syncQuestions() {
        for (let id in this.teacher) {
            io.to(id).emit('syncQuestions', this.questions)
        }
        for (let id in this.students) {
            let editedQuestions = this.getEditedForStudentQuestions()
            io.to(id).emit('syncQuestions', editedQuestions)
        }
    }

    syncPeople() {
        for (let id in this.teacher) {
            io.to(id).emit('syncPeople', true, this.teacher, this.students)
        }
        for (let id in this.students) {
            io.to(id).emit('syncPeople', false, this.teacher, this.students)
        }
    }
}

let rooms = {}

io.on('connection', socket => {
    console.log(socket.id)

    socket.on('changeUserID', async (UserID, id) => {
        if (!rooms[id] || rooms[id].locked) {
            socket.emit('homePage')
            return
        }
        if (Object.keys(rooms[id].teacher).length == 0 || Object.keys(rooms[id].teacher).includes(socket.id)) {
            socket.emit('syncValues', rooms[id].teacher, rooms[id].students, rooms[id].questions)
        } else {
            let editedQuestions = rooms[id].getEditedForStudentQuestions()
            socket.emit('syncValues', rooms[id].teacher, rooms[id].students, editedQuestions)
        }
        rooms[id].addPerson(socket.id, UserID)
    })

    socket.on('removeUser', (socketid, roomid) => {
        if (!rooms[roomid] || Object.keys(rooms[roomid].teacher)[0] != socket.id) {
            return
        }
        io.to(socketid).emit('homePage')
    })

    socket.on('newQuestion', (question, anonTeacher, roomid) => {
        if (!rooms[roomid]) {
            return
        }
        rooms[roomid].newQuestion(question, anonTeacher, socket.id)
        for (let teach in rooms[roomid].teacher){
            io.to(teach).emit('tts', question)
        }
    })

    socket.on('removeQuestion', (quesID, roomid) => {
        if (!rooms[roomid] || Object.keys(rooms[roomid].teacher)[0] != socket.id) {
            return
        }
        rooms[roomid].remQues(quesID)
    })

    socket.on('addAnswer', (answer, anonTeacher, roomid, quesid) => {
        if (!rooms[roomid]) {
            return
        }
        rooms[roomid].newAnswer(answer, anonTeacher, socket.id, quesid)
    })

    socket.on('removeAnswer', (quesID, ansID, roomID) => {
        if (!rooms[roomID] || Object.keys(rooms[roomID].teacher)[0] != socket.id) {
            return
        }
        rooms[roomID].remAns(quesID, ansID)
    })

    socket.on('setLock', (locked, roomid) => {
        if (!rooms[roomid] || Object.keys(rooms[roomid].teacher)[0] != socket.id) {
            return
        }
        rooms[roomid].locked = locked
    })

    socket.on('disconnect', () => {
        console.log(socket.id, ' disconnected')
        for (let id in rooms) {
            if (!rooms[id] || !rooms[id].teacher) {
                continue
            }
            if (Object.keys(rooms[id].teacher).includes(socket.id)) {
                for (let student in rooms[id].students) {
                    io.to(student).emit('homePage')
                }
                delete rooms[id]
            } else if (Object.keys(rooms[id].students).includes(socket.id)) {
                rooms[id].remUser(socket.id)
            }
        }
        console.log(rooms)
    })
})

app.get('/api/room/check/:id', (req, res) => {
    if (Object.keys(rooms).includes(req.params.id)) {
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
    while (rooms[newID]) newID = nanoid().toLowerCase();
    rooms[newID] = new Room()

    res.json({
        code: newID
    })

    console.log(rooms)
})

app.get('/api/users/:id', async (req, res) => {
    let userInfo;
    try {
        userInfo = await clerkClient.users.getUser(req.params.id)
    } catch (e) {
        console.log(e)
        res.sendStatus(404)
        console.log('error', req.params.id)
        return
    }

    let name = userInfo.username;
    if (userInfo.username == undefined) {
        name = userInfo.firstName
        console.log(name)
    }

    res.json({
        username: name,
        hasPfp: userInfo.hasImage,
        pfpUrl: userInfo.imageUrl
    })
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

server.listen(PORT, () => console.log(PORT))