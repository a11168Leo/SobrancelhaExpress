export const getToken = () => localStorage.getItem("token");
export const saveToken = (token) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");

export const getRole = () => localStorage.getItem("role");
export const saveRole = (role) => localStorage.setItem("role", role);

export const getProfessionalId = () => localStorage.getItem("professionalId");

export const isLoggedIn = () => !!getToken();

export const getCurrentUser = () => ({
  name: localStorage.getItem("name") || "Profissional",
  role: getRole()
});

export const logout = () => {
  removeToken();
  localStorage.removeItem("name");
  localStorage.removeItem("role");
  localStorage.removeItem("professionalId");
};
