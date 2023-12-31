import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  useUser,
  SignInButton,
  SignOutButton,
} from "@clerk/clerk-react";
import { LogIn, LogOut } from "lucide-react";
import { TrpcContext } from "./clientContext";
import { useContext } from "react";

const formSchema = z.object({
  code: z
    .string()
    .length(6, {
      message: "The code must be 6 characters long",
    })
    .regex(/^[a-zA-Z0-9]+$/, {
      message: "The code must only contain letters and numbers",
    }),
});

export const Home = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const client = useContext(TrpcContext)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  function newRoom() {
    let getCodeAndNavigate = async () => {
      if(!client){
        return
      }
      let result = await client.rooms.create.mutate()
      navigate(`/room?code=${result.code}`);
    };

    getCodeAndNavigate();
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    navigate(`/room?code=${data.code}`);
  }

  return (
    <div className="w-full h-[calc(100dvh)] sm:h-screen bg-defBG flex flex-col justify-around items-center">
      <div className="w-full flex flex-col justify-around items-center">
        <div className="flex justify-center items-center w-full ">
          {isSignedIn ? 
          <SignOutButton>
            <Button className='m-3 h-10 text-md font-semibold flex gap-2 w-2/5 max-w-sm' variant="secondary"><p>Sign Out</p> <LogOut /></Button>
          </SignOutButton> : 
          <SignInButton>
            <Button className='m-3 h-10 text-md font-semibold flex gap-2 w-2/5 max-w-sm' variant="secondary"><p>Sign In</p> <LogIn /></Button>
          </SignInButton>}
        </div>
        <div className="w-full flex flex-col justify-center items-center">
          <Button
            onClick={newRoom}
            className="w-3/4 max-w-sm  my-4 h-14 rounded-lg text-lg lg:max-xl:text-2xl"
          >
            Create Room
          </Button>
          <div className="flex flex-col justify-center items-center w-3/4 max-w-sm my-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-4/5 max-w-md bg-defBG flex flex-col justify-center items-center"
              >
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl className="w-full flex justify-center items-center">
                        <div className="flex justify-center items-center">
                          <div className="w-full max-w-xl flex justify-center gap-4 items-center m-0 p-0">
                            <Input
                              autoFocus
                              maxLength={32}
                              placeholder="Room code"
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
                  className="w-full hy-10 my-3 rounded-lg lg:max-xl:text-2xl lg:max-xl:h-14"
                >
                  Join Room
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};
