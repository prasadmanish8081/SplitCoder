import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Topics from "./pages/admin/Topics";
import Problems from "./pages/admin/Problems";
import AdminTutorials from "./pages/admin/Tutorials";
import Instructions from "./pages/admin/Instructions";
import Students from "./pages/admin/Students";
import AdminPrivateRoute from "./components/AdminPrivateRoute";
import StudentPrivateRoute from "./components/StudentPrivateRoute";
import StudentDashboard from "./pages/student/Dashboard";
import StudentLogin from "./pages/student/Login";
import Register from "./pages/student/Register";
import Learn from "./pages/student/Learn";
import InstructionsPage from "./pages/student/Instructions";
import TopicDetail from "./pages/student/TopicDetail";
import Profile from "./pages/student/Profile";
import ProblemsPage from "./pages/student/Problems";
import Tutorials from "./pages/student/Tutorials";
import TutorialPlayer from "./pages/student/TutorialPlayer";
import Notebook from "./pages/student/Notebook";
import ProgressPage from "./pages/student/Progress";
import Home from "./pages/Home";

const App = () => {
  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light";
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("theme-dark");
    else root.classList.remove("theme-dark");
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<Login/>} />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminPrivateRoute>
              <Dashboard/>
            </AdminPrivateRoute>
          } 
        />
        <Route
          path="/admin/topics"
          element={
            <AdminPrivateRoute>
              <Topics/>
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/problems"
          element={
            <AdminPrivateRoute>
              <Problems/>
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/tutorials"
          element={
            <AdminPrivateRoute>
              <AdminTutorials/>
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <AdminPrivateRoute>
              <Students/>
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/instructions"
          element={
            <AdminPrivateRoute>
              <Instructions/>
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/"
          element={<Home/>}
        />

        <Route path="/login" element={<StudentLogin/>}/>
        <Route path="/register" element={<Register/>}/>

        <Route path="/dashboard"
          element={
            <StudentPrivateRoute>
              <StudentDashboard/>
            </StudentPrivateRoute>
          }
        />

        <Route path="/profile" element={
          <StudentPrivateRoute>
            <Profile/>
          </StudentPrivateRoute>
        }/>

        <Route path="/problems" element={
          <StudentPrivateRoute>
            <ProblemsPage/>
          </StudentPrivateRoute>
        }/>

        <Route path="/tutorials" element={
          <StudentPrivateRoute>
            <Tutorials/>
          </StudentPrivateRoute>
        }/>
        <Route path="/tutorials/:tutorialId" element={
          <StudentPrivateRoute>
            <TutorialPlayer/>
          </StudentPrivateRoute>
        }/>
        <Route path="/notebook" element={
          <StudentPrivateRoute>
            <Notebook/>
          </StudentPrivateRoute>
        }/>
        <Route path="/progress" element={
          <StudentPrivateRoute>
            <ProgressPage/>
          </StudentPrivateRoute>
        }/>

        <Route path="/instructions/:topicId" element={
          <StudentPrivateRoute>
            <InstructionsPage/>
          </StudentPrivateRoute>
        }/>

        <Route path="/topic/:topicId" element={
          <StudentPrivateRoute>
            <TopicDetail/>
          </StudentPrivateRoute>
        }/>

        <Route path="/learn/:topicId" element={
          <StudentPrivateRoute>
            <Learn/>
          </StudentPrivateRoute>
        }/>


      </Routes>
    </Router>
  )
}

export default App;
