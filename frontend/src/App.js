import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import DiveSitesPage from "./pages/DiveSitesPage";
import AddDiveSitePage from "./pages/AddDiveSitePage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dives" element={<DiveSitesPage />} />
            <Route path="/add" element={<AddDiveSitePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
