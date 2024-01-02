import { useState, useContext } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { ScrollArea } from "../components/ui/scrollarea";
import { QuestionCard } from "./QuestionCard";
import { SocketContext } from "./socket";
import TextareaAutosize from "react-textarea-autosize";
import { questionsInter } from "./Main";
import { Checkbox } from "../components/ui/checkbox";
import { Grapes } from "./Grapes";

const formSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, {
      message: "Question must be at least 1 character.",
    })
    .max(256, {
      message: "Question can not be more than 256 characters.",
    }),

  teacherAnon: z.boolean(),
});

type props = {
  questions: questionsInter;
  isTeacher: boolean;
  removeQuestion: Function;
  removeUser: Function;
  removeAnswer: Function;
  code: string;
};

export const Questions = (props: props) => {
  const [grapes, setGrapes] = useState(false)
  const context = useContext(SocketContext);
  if (!context) throw new Error();
  const { socket } = context;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      teacherAnon: false,
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    form.setValue('question', '');
    if(data.question === 'GRAPES :D'){
      setGrapes(true)
      setTimeout(() => setGrapes(false), 6000)
    } else {
      socket?.emit("newQuestion", data.question, data.teacherAnon, props.code);
    }
  }

  return (
    <div className="grow flex flex-col overflow-hidden">
      <ScrollArea className="grow bg-defBG text-slate-200 mb-0 p-4 flex flex-wrap justify-start w-full">
        {Object.keys(props.questions)
          .reverse()
          .map((k) => {
            return (
              <QuestionCard
                key={k}
                removeQuestion={props.removeQuestion}
                removeAnswer={props.removeAnswer}
                removeUser={props.removeUser}
                isTeacher={props.isTeacher}
                cardKey={k}
                questions={props.questions}
                roomCode={props.code}
              />
            );
          })}
      </ScrollArea>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="m-3 mb-4 mt-1 md:mt-4 space-y-6 flex items-center"
        >
          <div className="w-full flex flex-col gap-2">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">
                    Add a question {`(It will be anonymous for all students)`}
                  </FormLabel>
                  <FormControl>
                    <div className="grow flex my-2">
                      <TextareaAutosize
                        placeholder="Question"
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-slate-200 resize-none break-all border-slate-700 focus:border-slate-200"
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            !e.shiftKey &&
                            !e.ctrlKey &&
                            !e.altKey &&
                            !e.metaKey
                          ) {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)();
                          }
                        }}
                        style={{ outline: "none" }}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacherAnon"
              render={({ field }) => (
                <div className="shrink flex justify-between md:justify-start">
                <FormItem className="w-2/7 flex items-center gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      defaultChecked={false}
                      className="duration-100 bg-slate-200 mt-2"
                    ></Checkbox>
                  </FormControl>
                  <FormLabel className="text-slate-200">
                    Make anonymous for teacher
                  </FormLabel>
                  <FormMessage />
                </FormItem>
                  <Button type="submit" className="ml-5 mt-2">
                    Submit
                  </Button>
                </div>
              )}
            />
          </div>
        </form>
      </Form>
      {grapes && <Grapes />}
    </div>
  );
};
