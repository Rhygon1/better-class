import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { Main } from './Main';
import { SignIn, useUser } from "@clerk/clerk-react";
import { SocketProvider } from './socket';
import { TrpcContext } from "./clientContext";

export const Room = () => {
  const navigate = useNavigate()
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [id, _] = useState(params.get("code"));
  const { isSignedIn, user, isLoaded } = useUser()
  const userID = (user?.id) ? (user?.id) : null
  const client = useContext(TrpcContext)

  useEffect(() => {
    let fetchExist = async () => {
      if(!id || !client){
        navigate('/')
        return
      }
      let result = await client.rooms.check.query(id)
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
