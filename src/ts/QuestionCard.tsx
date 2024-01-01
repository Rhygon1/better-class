import { useRef, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Textarea } from "src/components/ui/textarea";
import { questionsInter } from "./Main";

type props = {
  questions: questionsInter;
  cardKey: string;
  isTeacher: boolean;
  removeQuestion: Function;
  removeUser: Function;
};

export const QuestionCard = (props: props) => {
  const questionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (questionRef.current) {
      questionRef.current.style.height = "auto";
      questionRef.current.style.height = `${questionRef.current.scrollHeight}px`;
    }
  }, []);

  return (
    <Card className="bg-defBG text-slate-200 m-1.5 my-2 border-slate-700 hover:border-slate-300 transition-all">
      <CardHeader className="pb-4 pt-1 pr-3 w-full flex flex-row justify-between">
        <CardTitle className="break-all text-md pt-5 text-lg">
          {props.questions[props.cardKey].name
            ? props.questions[props.cardKey].name
            : "Anonymous"}
        </CardTitle>
        <div className="flex gap-4">
          {props.isTeacher ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="rounded-lg w-28 h-8">
                  Remove student
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
                      onClick={() =>
                        props.removeUser(
                          props.questions[props.cardKey].socketid
                        )
                      }
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

          {props.isTeacher ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 md:h-9 md:w-9 rounded-lg"
                >
                  <X className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-defBG">
                <DialogHeader>
                  <DialogTitle className="text-slate-200">
                    Remove question
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove this question?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end w-full">
                  <DialogClose asChild>
                    <Button
                      variant="destructive"
                      className="mx-2"
                      onClick={() => props.removeQuestion(props.cardKey)}
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
      </CardHeader>
      <CardContent className="my-0">
        <Textarea
          disabled
          ref={questionRef}
          className="resize-none break-all text-md border-none"
          defaultValue={props.questions[props.cardKey].question}
        ></Textarea>
      </CardContent>
    </Card>
  );
};
