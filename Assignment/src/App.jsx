import React, { useState } from "react";
import { createBrowserRouter, RouterProvider, useRouteError } from "react-router-dom";
import DocumentManager from "./Pages/Documentmanager.jsx";
import "./custom.css";

// Error page component to show route errors
function ErrorPage() {
  const error = useRouteError();
  console.error(error);
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Oops! Something went wrong.</h1>
      <p>
        {error.status && <strong>{error.status} — </strong>}
        {error.statusText || error.message || "Unknown error"}
      </p>
    </div>
  );
}

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
        focus={focus}
        setFocus={setFocus}
      />
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "*",
    element: <div>Page Not Found — Try <a href="/">Home</a></div>,
  },
]);
  return <RouterProvider router={router} />;
}

export default App;
