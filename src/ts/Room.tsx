import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { Main } from './Main';
import { SignIn, useUser } from "@clerk/clerk-react";
import { SocketProvider } from './socket';

interface apiRes {
  exists: boolean;
}

export const Room = () => {
  const navigate = useNavigate()
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [id, _] = useState(params.get("code"));
  const { isSignedIn, user, isLoaded } = useUser()
  const userID = (user?.id) ? (user?.id) : null

  useEffect(() => {
    let fetchExist = async () => {
      let res: Response = await fetch(`/api/room/check/${id}`)
      if (!res.ok) {
        throw new Error('Network response was not ok.');
      }
      let result: apiRes = await res.json();
      if(!result.exists){
        navigate('/')
      }
    }

    fetchExist()
  }, [id, navigate]);

  if (!isLoaded) {
    return null;
  }

  if(!isSignedIn || !userID){
    return (
      <div className="h-screen w-full bg-defBG flex justify-center items-center">
        <SignIn redirectUrl={`/room?code=${id}`}/>
      </div>
    )
  }

  return (
    <SocketProvider>
      <Main code={id ? id : 'none'} userID={userID}/>
    </SocketProvider>
  );
};
