import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider } from "react-router-dom";
import { createBrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import Register from "./pages/Register.jsx";
import Login from './pages/Login.jsx';
import Home from "./pages/Home.jsx";
import MessagePage from "./components/MessagePage.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "register",
        element: <Register />,
      },
      {
        path:"login",
        element:<Login/>
      },
      {
        path:"",
        element :<Home/>,
        children:[
          {
            path:":userId",
            element:<MessagePage/>
          }
        ]
      }
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  
    <Provider store={store}>
      <RouterProvider router={router}/>
        
    </Provider>
  
);
