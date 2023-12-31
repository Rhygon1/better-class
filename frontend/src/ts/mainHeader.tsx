import React from "react";
import { Button } from "../components/ui/button";
import { HomeIcon } from "@radix-ui/react-icons";
import { UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";

type props = {
  code: String,
  tts: boolean,
  settts: Function,
  setSidebar: Function,
  isTeacher: boolean;
};

export const MainHeader = (props: props) => {
    const navigate = useNavigate();

    function homepage(){
        navigate('/')
    }

    function changeTTS(): void {
        props.settts((curr: Boolean) => !curr)
    }

    function changeSidebar(): void {
        props.setSidebar((curr: Boolean) => !curr)
    }

    return (
    <div className="h-1/5 bg-red text-slate-200 flex flex-col justify-start">
    <div className="flex justify-between">
      <div className="h-full">
        <Button variant="ghost" size="icon" onClick={changeSidebar} className="m-3 outline outline-white outline-1 md:hidden">
          <UsersRound className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="h-full flex">
        {props.isTeacher ? <div className="flex items-center space-x-2 mx-1">
            <Label htmlFor="tts">TTS</Label>
            <Switch id="tts" checked={props.tts} onCheckedChange={changeTTS}/>
        </div> : null}
        <Button onClick={homepage} variant="ghost" size="icon" className="m-3 outline outline-white outline-1">
          <HomeIcon className="h-4 w-4" />
        </Button>
      </div>
    </div >
    <div className="flex justify-center">
      <h1 className="text-[2.7rem] bold">{props.code}</h1>
    </div>
    </div>
  );
};
