import { useState, useContext, useEffect } from "react";
import { MainHeader } from "./mainHeader";
import { Questions } from "./Questions";
import { Sidebar } from "react-pro-sidebar";
import { ScrollArea } from "../components/ui/scrollarea";
import { Separator } from "../components/ui/seperator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { SocketContext } from "./socket";
import { useNavigate } from "react-router-dom";
import { UserCard } from "./userCard";

type propsType = {
  code: string;
  userID: string;
};

interface userSockets {
  [key: string]: string;
}

export interface response {
  content: string;
  userID?: string;
  socketid?: string;
}

interface questionInter {
  content: string;
  answers: {[key:string]: response};
  userID?: string;
  socketid?: string;
}

export interface questionsInter {
  [key: string]: questionInter;
}

export const Main = (props: propsType) => {
  const navigate = useNavigate()
  const [isTeacher, setIsTeacher] = useState(false);
  const [teacher, setTeacher] = useState<userSockets>({});
  const [students, setStudents] = useState<userSockets>({});
  const [questions, setQuestions] = useState<questionsInter>({});
  const [sidebar, setSidebar] = useState(false);
  const [tts, setTTS] = useState(false);
  const context = useContext(SocketContext);
  if (!context) throw new Error();
  const { socket } = context;

  useEffect(() => {
    function syncValuesHandler(
      newTeacher: userSockets,
      newStudents: userSockets,
      newQuestions: questionsInter
    ) {
      console.log(newTeacher, newStudents, newQuestions)
      setTeacher(newTeacher);
      setStudents(newStudents);
      setQuestions(newQuestions);
    }

    function syncPeopleHandler(
      ownTeacher: boolean,
      newTeacher: userSockets,
      newStudents: userSockets
    ) {
      if (ownTeacher != isTeacher) setIsTeacher(ownTeacher);
      setTeacher(newTeacher);
      setStudents(newStudents);
    }

    function syncQuestionsHandler(newQuestions: questionsInter) {
      setQuestions(newQuestions);
    }

    function homePageHandler(){
      navigate('/')
    }

    function ttsHandler(ques: string){
      if(!tts) return
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      const utterance = new SpeechSynthesisUtterance(ques);
      utterance.voice = voices[4]
      synth.speak(utterance);      
    }

    socket?.on("syncValues", syncValuesHandler);
    socket?.on("syncPeople", syncPeopleHandler);
    socket?.on("syncQuestions", syncQuestionsHandler);
    socket?.on('homePage', homePageHandler)
    socket?.on('tts', ttsHandler);

    return () => {
      socket?.off("syncValues", syncValuesHandler);
      socket?.off("syncPeople", syncPeopleHandler);
      socket?.off("syncQuestions", syncQuestionsHandler);
      socket?.off('homePage', homePageHandler)
      socket?.off('tts', ttsHandler);
    };
  }, [socket, teacher, students, questions]);

  useEffect(() => {
    socket?.emit('changeUserID', props.userID, props.code)
  }, [socket])

  function removeQuestion(id: string) {
    socket?.emit("removeQuestion", id, props.code);
  }

  function removeUser(id: string) {
    socket?.emit("removeUser", id, props.code);
  }

  function removeAnswer(quesID: string, ansID: string){
    socket?.emit('removeAnswer', quesID, ansID, props.code)
  }

  return (
    <div className="flex justify-end h-[calc(100dvh)] sm:h-screen">
      <Sidebar
        onBackdropClick={() => setSidebar(false)}
        breakPoint="md"
        backgroundColor="rgb(9,9,11)"
        width="300px"
        toggled={sidebar}
      >
        <ScrollArea className="m-4">
          <div className="mb-9">
            <h3 className="text-slate-200 font-bold text-lg mb-3">Teacher</h3>
            {Object.keys(teacher).map((KeyT) => {
              return (
                <div key={KeyT}>
                  <div className="text-slate-200 text-md">
                    <UserCard userId={teacher[KeyT]}/>
                  </div>
                  <Separator className="my-2 mb-6"></Separator>
                </div>
              );
            })}
          </div>
          <div className="mb-5">
            <h3 className="text-slate-200 font-bold text-lg mb-3">Students</h3>
            {Object.keys(students).map((KeyT) => {
              return (
                <div key={KeyT}>
                  <div className="flex justify-between">
                    <div className="text-slate-200 text-md flex justify-center items-center">
                      <UserCard userId={students[KeyT]}/>
                    </div>
                    {isTeacher ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="rounded-lg">
                            Remove
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-defBG z-[100]">
                          <DialogHeader>
                            <DialogTitle className="text-slate-200">
                              Remove student
                            </DialogTitle>
                            <DialogDescription>
                              Are you sure you want to remove this student?
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end w-full">
                            <DialogClose asChild>
                              <Button
                                variant="destructive"
                                className="mx-2"
                                onClick={() => removeUser(KeyT)}
                              >
                                Yes
                              </Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button
                                variant="ghost"
                                className="text-slate-200 outline outline-1 outline-gray-600 hover:bg-black hover:text-slate-200"
                              >
                                No
                              </Button>
                            </DialogClose>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : null}
                  </div>
                  <Separator className="my-2 mb-6"></Separator>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </Sidebar>
      <div
        className={`w-full h-[calc(100dvh)] sm:h-screen bg-defBG flex flex-col`}
      >
        <MainHeader
          code={props.code}
          isTeacher={isTeacher}
          tts={tts}
          settts={setTTS}
          setSidebar={setSidebar}
        />
        <Questions
          questions={questions}
          removeQuestion={removeQuestion}
          removeUser={removeUser}
          removeAnswer={removeAnswer}
          isTeacher={isTeacher}
          code={props.code}
        />
      </div>
    </div>
  );
};
