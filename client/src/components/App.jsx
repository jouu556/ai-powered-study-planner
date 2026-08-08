// src/components/App.jsx
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./AuthPage";
import ProfilePage from "./ProfilePage";
import MyPlansPage from "./MyPlansPage";
import MySubjectsPage from "./MySubjectsPage";

function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage setUser={setUser} />} />
        <Route path="/profile" element={<ProfilePage user={user} />} />
        <Route path="/plans" element={<MyPlansPage user={user} />} />
        <Route path="/subjects" element={<MySubjectsPage user={user} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
