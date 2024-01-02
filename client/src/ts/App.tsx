import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./Home";
import { Room } from "./Room";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server/routers";
import { TrpcContext } from "./clientContext";

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/trpc",
    }),
  ],
});

function App() {
  return (
    <TrpcContext.Provider value={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room" element={<Room />} />
        </Routes>
      </BrowserRouter>

    </TrpcContext.Provider>
  );
}

export default App;
