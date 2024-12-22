import { createBrowserRouter } from "react-router-dom";
import App from "../App.jsx";
import Register from "../pages/Register.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "register",
        element: (
          
            <Register />
          
        ),
      }]
  },
]);

export default router;
