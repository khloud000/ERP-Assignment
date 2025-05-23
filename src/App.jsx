import React, { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DocumentManager from "./Pages/Documentmanager.jsx";
import "./custom.css";


function App() {
  const [focus, setFocus] = useState("send");
  const [enteredValues, setEnteredValues] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    bankAccounts: [],
  });

  const [edited, setEdited] = useState({
    email: false,
    password: false,
  });


  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <DocumentManager
          enteredValues={enteredValues}
          setEnteredValues={setEnteredValues}
          edited={edited}
          setEdited={setEdited}
        />
      ),
    },
   
  
  ]);
  
  return (
    <>
    
      <RouterProvider router={router} />
      
    </>
  );
}

export default App;
