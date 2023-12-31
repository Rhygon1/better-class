import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { Main } from './Main';
import { Name } from './Name'
import { SocketContext } from './socket';

interface apiRes {
  exists: boolean;
}

export const Room = () => {
  const navigate = useNavigate()
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [id, _] = useState(params.get("code"));
  const [name, setName] = useState('')
  const context = useContext(SocketContext)
  if(!context) throw new Error
  const { socket } = context

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

  useEffect(() => {
    if(!socket) return 

    socket.emit('changeName', name, id)
  }, [name])

  useEffect(() => {
    socket?.on('homePage', () => {
      console.log('home page')
      navigate('/')
    })

    return () => {
      socket?.off('homePage')
    }
  }, [socket])

  return (
      name ? <Main code={id ? id : 'none'}/> : <Name setname={setName}/>
  );
};
