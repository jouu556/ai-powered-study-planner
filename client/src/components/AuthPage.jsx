import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfilePage from "./ProfilePage";

export default function AuthPage( {setUser} ) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    studyField: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "/login" : "/register";
      const response = await axios.post(`http://localhost:3000${endpoint}`, formData);
    if (response.data.success) {
      setUser(response.data.user);  // store user globally
      navigate("/profile");         // redirect to profile
    } else {
      setMessage(response.data.message);
    }
    } catch (err) {
      if (err.response) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Something went wrong. Try again.");
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="username"
          placeholder="Email"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {/* Show extra fields ONLY when registering */}
        {!isLogin && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="studyField"
              placeholder="Study Field"
              value={formData.studyField}
              onChange={handleChange}
              required
            />
          </>
        )}

        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>

      <p style={{ color: "red" }}>{message}</p>

      <p>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage("");
          }}
        >
          {isLogin ? "Register here" : "Login here"}
        </button>
      </p>
    </div>
  );
}
