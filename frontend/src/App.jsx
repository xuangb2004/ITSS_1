import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Forum from "./components/Forum";
import NotificationsPage from "./components/Notifications";
import MyCoursesPage from "./pages/mycourses/MyCoursesPage";
import CourseDetail from "./components/CourseDetail";
import CartPage from "./components/CartPage";
import CreateCourse from "./components/CreateCourse";

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
          {/* Chi tiết khóa học */}
      <Route path="/course/:id" element={<CourseDetail />} />
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
        <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
        <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
        <Route 
          path="/create-course" 
          element={
            <PrivateRoute>
              <CreateCourse />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
