import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // Ajuste para seu backend

export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);
    localStorage.setItem("name", res.data.name);
  }
  return res.data;
};
