import axios from "axios";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { User } from "lucide-react";

type UserInfo = {
  username: string;
  hasPfp: boolean;
  pfpUrl: string | undefined;
} | undefined;

type props = {
  userId: string | undefined
}

export const UserCard = (props: props) => {
  const [data, setData] = useState<UserInfo>();

  useEffect(() => {
    if(!props.userId){
      return
    }

    axios
      .get(`/api/users/${props.userId}/`)
      .then((response) => {
        console.log(response.data);
        setData(response.data);
      })
      .catch((error) => {
        setData(undefined)
      });
  }, []);

  return (
    <div className="flex items-center gap-3">
      
        <Avatar className="h-8 w-8 md:h-10 md:w-10">
          <AvatarImage src={data?.pfpUrl}/>
          <AvatarFallback className='bg-defBG'>
            <User />
          </AvatarFallback>
        </Avatar>
      

      <p className="flex items-center text-md md:text-lg text-slate-200">{data?.username ? data?.username : "Anonymous"}</p>
    </div>
  );
};
