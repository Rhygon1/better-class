import express from "express";
const app = express();
import http from "http";
const server = http.createServer(app);
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import { Server } from "socket.io";
import path from "path";
import "dotenv/config";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const PORT = process.env.PORT || 5000;

export const createContext = () => {return {rooms: rooms}}

app.use(cors());
app.use(express.static(path.join(__dirname, "../../client/build")));
app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext}));

export interface response {
  content: string;
  userID?: string;
  socketid?: string;
}

interface questionInter {
  content: string;
  answers: { [key: string]: response };
  userID?: string;
  socketid?: string;
}

export interface questionsInter {
  [key: string]: questionInter;
}

export class Room {
  teacher: { [key: string]: string };
  students: { [key: string]: string };
  questions: questionsInter;
  locked: boolean;

  constructor() {
    this.teacher = {}; //socketid: id
    this.students = {}; //[{} socketid: name]
    this.questions = {};
    this.locked = false;
  }

  addPerson(newID: string, userID: string) {
    if (
      Object.keys(this.teacher).length == 0 ||
      Object.keys(this.teacher).includes(newID)
    ) {
      this.teacher = {};
      this.teacher[newID] = userID;
    } else {
      this.students[newID] = userID;
    }
    console.log(rooms);

    this.syncPeople();
  }

  remUser(oldID: string) {
    if (this.students && this.students[oldID]) {
      delete this.students[oldID];
    }

    this.syncPeople();
  }

  newQuestion(question: string, anonTeacher: boolean, socketid: string) {
    if (question.length < 1 || question.length > 256) return;
    let newID = uuidv4();
    let userID = this.teacher[socketid];
    if (!userID) userID = this.students[socketid];
    this.questions[newID] = {
      content: question,
      answers: {},
      socketid: socketid,
    };

    if (!anonTeacher) {
      this.questions[newID] = {
        ...this.questions[newID],
        userID,
      };
    }

    this.syncQuestions();
  }

  remQues(quesID: string) {
    if (this.questions && this.questions[quesID]) {
      delete this.questions[quesID];
    }

    this.syncQuestions();
  }

  newAnswer(
    answer: string,
    anonTeacher: boolean,
    socketid: string,
    quesid: string
  ) {
    if (
      answer.length < 1 ||
      answer.length > 256 ||
      !this.questions[quesid] ||
      !this.questions
    )
      return;
    let newID = uuidv4();
    let userID = this.teacher[socketid];
    if (!userID) userID = this.students[socketid];
    this.questions[quesid].answers[newID] = {
      content: answer,
      socketid: socketid,
    };

    if (!anonTeacher) {
      this.questions[quesid].answers[newID] = {
        ...this.questions[quesid].answers[newID],
        userID,
      };
    }

    this.syncQuestions();
  }

  remAns(quesID: string, ansID: string) {
    if (
      this.questions &&
      this.questions[quesID] &&
      this.questions[quesID].answers[ansID]
    ) {
      delete this.questions[quesID].answers[ansID];
    }

    this.syncQuestions();
  }

  getEditedForStudentAnswers(answers: { [key: string]: response }) {
    let editedAnswers = { ...answers };
    for (let q in editedAnswers) {
      editedAnswers[q] = {
        content: answers[q].content,
      };
    }

    return editedAnswers;
  }

  getEditedForStudentQuestions() {
    let editedQuestions = { ...this.questions };
    for (let q in editedQuestions) {
      editedQuestions[q] = {
        content: this.questions[q].content,
        answers: this.getEditedForStudentAnswers(this.questions[q].answers),
      };
    }

    return editedQuestions;
  }

  syncQuestions() {
    for (let id in this.teacher) {
      io.to(id).emit("syncQuestions", this.questions);
    }
    for (let id in this.students) {
      let editedQuestions = this.getEditedForStudentQuestions();
      io.to(id).emit("syncQuestions", editedQuestions);
    }
  }

  syncPeople() {
    for (let id in this.teacher) {
      io.to(id).emit("syncPeople", true, this.teacher, this.students);
    }
    for (let id in this.students) {
      io.to(id).emit("syncPeople", false, this.teacher, this.students);
    }
  }
}

let rooms: { [key: string]: Room } = {};

io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("changeUserID", async (UserID, id) => {
    if (!rooms[id] || rooms[id].locked) {
      socket.emit("homePage");
      return;
    }
    if (
      Object.keys(rooms[id].teacher).length == 0 ||
      Object.keys(rooms[id].teacher).includes(socket.id)
    ) {
      socket.emit(
        "syncValues",
        rooms[id].teacher,
        rooms[id].students,
        rooms[id].questions
      );
    } else {
      let editedQuestions = rooms[id].getEditedForStudentQuestions();
      socket.emit(
        "syncValues",
        rooms[id].teacher,
        rooms[id].students,
        editedQuestions
      );
    }
    rooms[id].addPerson(socket.id, UserID);
  });

  socket.on("removeUser", (socketid, roomid) => {
    if (!rooms[roomid] || Object.keys(rooms[roomid].teacher)[0] != socket.id) {
      return;
    }
    io.to(socketid).emit("homePage");
  });

  socket.on("newQuestion", (question, anonTeacher, roomid) => {
    if (!rooms[roomid]) {
      return;
    }
    rooms[roomid].newQuestion(question, anonTeacher, socket.id);
    for (let teach in rooms[roomid].teacher) {
      io.to(teach).emit("tts", question);
    }
  });

  socket.on("removeQuestion", (quesID, roomid) => {
    if (!rooms[roomid] || Object.keys(rooms[roomid].teacher)[0] != socket.id) {
      return;
    }
    rooms[roomid].remQues(quesID);
  });

  socket.on("addAnswer", (answer, anonTeacher, roomid, quesid) => {
    if (!rooms[roomid]) {
      return;
    }
    rooms[roomid].newAnswer(answer, anonTeacher, socket.id, quesid);
  });

  socket.on("removeAnswer", (quesID, ansID, roomID) => {
    if (!rooms[roomID] || Object.keys(rooms[roomID].teacher)[0] != socket.id) {
      return;
    }
    rooms[roomID].remAns(quesID, ansID);
  });

  socket.on("setLock", (locked, roomid) => {
    if (!rooms[roomid] || Object.keys(rooms[roomid].teacher)[0] != socket.id) {
      return;
    }
    rooms[roomid].locked = locked;
  });

  socket.on("disconnect", () => {
    console.log(socket.id, " disconnected");
    for (let id in rooms) {
      if (!rooms[id] || !rooms[id].teacher) {
        continue;
      }
      if (Object.keys(rooms[id].teacher).includes(socket.id)) {
        for (let student in rooms[id].students) {
          io.to(student).emit("homePage");
        }
        delete rooms[id];
      } else if (Object.keys(rooms[id].students).includes(socket.id)) {
        rooms[id].remUser(socket.id);
      }
    }
    console.log(rooms);
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/build", "index.html"));
});

server.listen(PORT, () => console.log(PORT));
