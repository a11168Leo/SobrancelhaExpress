import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./auth/AuthPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<AuthPage />} />
        {/* Como o AuthPage tem os dois, não precisa de rota separada para register se for usar o slide */}
      </Routes>
    </Router>
  );
}

export default App;