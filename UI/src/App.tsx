import { createBrowserRouter } from "react-router-dom";
import { Login } from "./Pages/login";
import { ForgotPassword } from "./Pages/forgetPassword";
import { Dashboard } from "./Pages/dashboard";

// Define the public routes (Dashboard can be accessed without authentication)
const publicRoutes = [{ path: "/dashboard", element: <Dashboard /> }];

// Define authenticated routes (Login, ForgotPassword, etc.)
const authenticatedRoutes = [
  { path: "/", element: <Login /> },
  { path: "/forget-password", element: <ForgotPassword /> },
];

// Define a wrapper component for authenticated routes
const AuthenticatedProvider = () => {
  return (
    <>
      <Login />
    </>
  );
};

export const App = createBrowserRouter([
  // Public routes (Dashboard is accessible here)
  ...publicRoutes,

  // Authenticated routes (Login and Forgot Password are here)
  {
    path: "/",
    element: <AuthenticatedProvider />,
    children: authenticatedRoutes,
  },
]);
