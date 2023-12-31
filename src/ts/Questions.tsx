import { useContext } from "react";
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
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scrollarea";
import { QuestionCard } from './QuestionCard'
import { SocketContext } from "./socket";

const formSchema = z.object({
  question: z.string().min(1, {
    message: "Question must be at least 1 character.",
  }).max(256, {
    message: "Question can not be more than 256 characters.",
  }),
});

type props = {
  questions: questionType;
  isTeacher: boolean;
  removeQuestion: Function;
  code: string;
};

type questionType = {
  [key: string]: (string | null)[];
};

export const Questions = (props: props) => {
  const context = useContext(SocketContext);
  if (!context) throw new Error();
  const { socket } = context;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    form.reset()
    socket?.emit("newQuestion", data.question, props.code)
  }

  return (
    <div className="grow flex flex-col overflow-hidden">
      <ScrollArea className="h-5/6 bg-defBG text-slate-200 mb-0 p-4 flex flex-wrap justify-start w-full">
        {Object.keys(props.questions).reverse().map((k) => {
          return (
            <QuestionCard key={k} removeQuestion={props.removeQuestion} isTeacher={props.isTeacher} cardKey={k} questions={props.questions}/>
          );
        })}
      </ScrollArea>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="m-5 mt-2 md:mt-4 space-y-6"
        >
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Add a question</FormLabel>
                <FormControl>
                  <div className="flex my-2">
                    <Input
                      placeholder="Question"
                      className="text-slate-200 break-all border-slate-700 focus:border-slate-200"
                      style={{outline: 'none'}}
                      {...field}
                    />
                    <Button type="submit" className="ml-2">
                      Submit
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};
