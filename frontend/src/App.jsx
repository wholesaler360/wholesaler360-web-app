import Login from "@/pages/authentication/Login";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter basename="/app">
        <Login />
      </BrowserRouter>
    </>
  );
}

export default App;
