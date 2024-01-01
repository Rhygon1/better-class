import {
  CardHeader,
  CardTitle,
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
import { UserCard } from "./userCard";
import { response } from "./Main";

type cardProps = {
  [key: string]: {content: string;
  answers?: {[key:string]: response};
  userID?: string;
  socketid?: string};
}

type props = {
  questions: cardProps;
  cardKey: string;
  isTeacher: boolean;
  removeQuestion: Function;
  removeUser: Function;
  titleClassNames?: string;
  headerClassNames?: string;
};

export const BaseCardHeader = (props: props) => {
  return (
    <CardHeader className={`pb-4 pt-1 pr-3 w-full flex flex-row justify-between ${props.headerClassNames}`}>
        <CardTitle className={`break-all text-md pt-5 text-lg ${props.titleClassNames}`}>
          {props.questions[props.cardKey].userID != null ? (
            <UserCard userId={props.questions[props.cardKey].userID} />
          ) : (
            <UserCard userId="" />
          )}
        </CardTitle>
        <div className="flex gap-2">
          {props.isTeacher ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="border border-slate-600 rounded-lg w-28 h-8"
                >
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
                    Remove content
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove this content?
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
  );
};
