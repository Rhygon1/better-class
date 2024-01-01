import { questionsInter } from "./Main";
import { BaseCardHeader } from "./BaseCard";
import { Card, CardContent } from "src/components/ui/card";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "src/components/ui/collapsible";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Button } from "src/components/ui/button";
import TextareaAutosize from "react-textarea-autosize";
import { AnswerForm } from "./AnswerForm";

type props = {
  questions: questionsInter;
  cardKey: string;
  isTeacher: boolean;
  removeQuestion: Function;
  removeUser: Function;
  removeAnswer: Function;
  roomCode: string;
};

export const QuestionCard = (props: props) => {
  const [answersOpen, setAnswersOpen] = useState(false);

  function removeAnswerWithoutQuesID(ansID: string){
    props.removeAnswer(props.cardKey, ansID)
  }

  return (
    <Card className={`bg-defBG text-slate-200 m-1.5 my-2 ${Object.keys(props.questions[props.cardKey].answers).length ? "border-green-400 hover:border-green-700" : "border-red-500 hover:border-red-700"} transition-all`}>
      <BaseCardHeader {...props} />
      <CardContent className="my-0">
        <TextareaAutosize
          disabled
          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-slate-200 resize-none break-all border-slate-700 focus:border-slate-200 text-md border-none"
          defaultValue={props.questions[props.cardKey].content}
        ></TextareaAutosize>
        <Collapsible open={answersOpen} onOpenChange={setAnswersOpen}>
          <div className="flex gap-2 mb-4">
            <h4 className="text-sm font-semibold flex items-center">
              {Object.keys(props.questions[props.cardKey].answers).length}{" "}
              Response(s)
            </h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <CaretSortIcon className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            {Object.keys(props.questions[props.cardKey].answers).reverse().map(
              (ansKey) => {
                return (
                  <Card
                    key={ansKey}
                    className="bg-defBG text-slate-200 m-1.5 my-0 border-none"
                  >
                    <BaseCardHeader
                      titleClassNames="text-sm pt-0"
                      headerClassNames="px-1"
                      questions={props.questions[props.cardKey].answers}
                      cardKey={ansKey}
                      isTeacher={props.isTeacher}
                      removeUser={props.removeUser}
                      removeQuestion={removeAnswerWithoutQuesID}
                    />
                    <CardContent className="my-0 pb-4">
                      <TextareaAutosize
                        disabled
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-slate-200 resize-none break-all border-slate-700 focus:border-slate-200 text-md border-none"
                        defaultValue={props.questions[props.cardKey].answers[ansKey].content}
                      ></TextareaAutosize>
                    </CardContent>
                  </Card>
                );
              }
            )}
          </CollapsibleContent>
        </Collapsible>
        <AnswerForm roomCode={props.roomCode} questionCode={props.cardKey}/>
      </CardContent>
    </Card>
  );
};
