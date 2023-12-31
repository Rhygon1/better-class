import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { X } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogClose,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "../components/ui/dialog"

type props = {
  questions: questionType;
  cardKey: string,
  isTeacher: boolean;
  removeQuestion: Function;
};

type questionType = {
  [key: string]: (string | null)[];
};

export const QuestionCard = (props: props) => {
  return (
    <Card
      className="bg-defBG text-slate-200 m-1.5 my-2 border-slate-700 hover:border-slate-300 transition-all"
    >
      <CardHeader className="pb-4 pt-1 pr-3 w-full flex flex-row justify-between">
        <CardTitle className="break-all text-md pt-5 text-lg">
          {props.questions[props.cardKey][1] ? props.questions[props.cardKey][1] : "Anonymous"}
        </CardTitle>
        {props.isTeacher ? <Dialog>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-6 w-6 md:h-9 md:w-9 rounded-lg">
                    <X className="h-4 w-4 md:h-5 md:w-5"/>
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-defBG">
                <DialogHeader>
                    <DialogTitle className='text-slate-200'>Remove question</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove this question?
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end w-full">
                    <DialogClose asChild>
                        <Button variant="destructive" className="mx-2" onClick={() => props.removeQuestion(props.cardKey)}>Yes</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button variant="ghost" className='text-slate-200 outline outline-1 outline-gray-600 hover:bg-black hover:text-slate-200'>No</Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog> : null}
      </CardHeader>
      <CardContent className="my-0">
        <p className="break-all text-md">{props.questions[props.cardKey][0]}</p>
      </CardContent>
    </Card>
  );
};
