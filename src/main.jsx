import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { AuthProvider } from "./routes/context/AuthProvider.jsx";

import App from "./App.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";

import Home from "./routes/Home.jsx";
import Leads from "./routes/Leads.jsx";
import ErrorPega from "./routes/ErrorPega.jsx";
import Company from "./routes/Company.jsx";
import CompanyDetalhes from "./routes/CompanyDetalhes.jsx";
import CRMLayout from "./routes/CRM.jsx";
import Register from "./routes/RegisterUser.jsx";
import Log from "./routes/Log.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPega />,

    children: [
      // ROTAS PÚBLICAS

      {
        path: "login",
        element: <Log />,
      },
      {
        path: "register",
        element: <Register />,
      },

      // ROTAS PRIVADAS
      {
        element: <PrivateRoute />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "home",
            element: <Home />,
          },

          {
            path: "leads",
            element: <Leads />,
          },
          {
            path: "company",
            element: <Company />,
          },
          {
            path: "company/:id",
            element: <CompanyDetalhes />,
          },
          {
            path: "crm",
            element: <CRMLayout />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
