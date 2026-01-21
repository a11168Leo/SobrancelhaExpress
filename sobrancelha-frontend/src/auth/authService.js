import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  const data = res.data;

  // Salva token no localStorage
  localStorage.setItem("token", data.token);
  localStorage.setItem("name", data.name);
  localStorage.setItem("role", data.role);

  return data;
};

export const register = async (name, email, password, role = "client") => {
  await axios.post(`${API_URL}/register`, { name, email, password, role });
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("role");
};
