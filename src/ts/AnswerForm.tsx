import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../components/ui/button";
import TextareaAutosize from "react-textarea-autosize";
import { Checkbox } from "../components/ui/checkbox";
import { response } from "./Main";
import { useContext } from "react";
import { SocketContext } from "./socket";

const formSchema = z.object({
  answer: z
    .string()
    .trim()
    .min(1, {
      message: "Answer must be at least 1 character.",
    })
    .max(256, {
      message: "Answer can not be more than 256 characters.",
    }),

  teacherAnon: z.boolean(),
});

type props = {
    roomCode: string;
    questionCode: string;
}

export const AnswerForm = (props: props) => {
  const context = useContext(SocketContext);
  if (!context) throw new Error();
  const { socket } = context;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answer: "",
      teacherAnon: false,
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    form.setValue("answer", "");
    socket?.emit("addAnswer", data.answer, data.teacherAnon, props.roomCode, props.questionCode);
  }

  return (
    <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="m-0 mb-4 mt-6 space-y-3 flex items-center"
        >
          <div className="w-full flex flex-col -gap-4">
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="grow flex my-2">
                      <TextareaAutosize
                        placeholder="Answer the question! Your response will be anonymous to all students..."
                        className="mx-0 px-0 flex w-full rounded-md bg-transparent py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-slate-200 resize-none break-all border-none"
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
  );
};
