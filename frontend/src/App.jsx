import React from "react";
import Loginform from "./components/form/Login";
import Signupform from "./components/form/Signup";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import Layout from "./components/layout/Layout";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />
        <Route path="/signup" element={<Signupform />} />
        <Route path="/login" element={<Loginform />} />
      </Routes>
    </Router>
  );
};

export default App;
