import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './Home';
import { Room } from './Room'
import { Main } from './Main'
import { SocketProvider } from './socket';

function App() {
  return  (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room" element={
          <SocketProvider>
          <Room />
          </SocketProvider>
        } />
        <Route path="test" element={<Main code="test"/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
