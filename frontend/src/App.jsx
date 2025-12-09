import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Forum from "./components/Forum";
import MyCoursesPage from "./pages/mycourses/MyCoursesPage";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang login / home */}
        <Route path="/" element={<Home />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Trang Khóa học của tôi */}
        <Route
          path="/my-courses"
          element={
            <PrivateRoute>
              <MyCoursesPage />
            </PrivateRoute>
          }
        />

        {/* Forum */}
        <Route path="/forum" element={<Forum />} />
      </Routes>
    </Router>
  );
}

export default App;
