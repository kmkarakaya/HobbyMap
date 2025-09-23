import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import DiveSitesPage from "./pages/DiveSitesPage";
import AddDiveSitePage from "./pages/AddDiveSitePage";
import EditDiveSitePage from "./pages/EditDiveSitePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AboutPage from "./pages/AboutPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import "./App.css";

function App() {
  return (
    <FirebaseProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route 
                path="/entries" 
                element={
                  <ProtectedRoute>
                    <DiveSitesPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route
                path="/add"
                element={
                  <ProtectedRoute>
                    <AddDiveSitePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditDiveSitePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </FirebaseProvider>
  );
}

export default App;
