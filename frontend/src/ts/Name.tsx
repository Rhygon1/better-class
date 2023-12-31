import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../components/ui/form";

type props = {
  setname: Function;
};

const formSchema = z.object({
  username: z
    .string()
    .min(1, {
      message: "Username must be at least 1 character.",
    })
    .max(32, {
      message: "Username can not be more than 32 characters.",
    }),
});

export const Name = (props: props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    form.reset();
    props.setname(data.username);
  }

  return (
    <div className="w-full h-[calc(100dvh)] sm:h-screen bg-defBG flex flex-col justify-center items-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-4/5 max-w-md h-[calc(100dvh)] sm:h-screen bg-defBG flex flex-col justify-center items-center"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormControl className="w-full flex justify-center items-center">
                  <div className="flex justify-center items-center">
                    <div className="w-full max-w-xl flex justify-center gap-4 items-center m-0 p-0">
                      <Input
                        autoFocus
                        maxLength={32}
                        placeholder="Username"
                        className="lg:max-xl:h-12 lg:max-xl:text-lg text-slate-200 w-full m-0"
                        {...field}
                      ></Input>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-4/5 hy-10 my-3 rounded-lg lg:max-xl:text-2xl lg:max-xl:h-14"
          >
            Join Room
          </Button>
        </form>
      </Form>
    </div>
  );
};
