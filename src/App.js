import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import CreateTaskPage from "./pages/CreateTask";
import Reports from "./components/Reports";
import PrivateRoute from "./components/PrivateRoute";
import SubmitReview from './components/SubmitReview';
import TaskManager from "./components/TaskManager";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-task" element={<CreateTaskPage />} />
        <Route path="/submit-review/:id" element={<SubmitReview />} />
       { /*<Route path="/tasks" element={<TaskManager />} />*/}
        <Route path="/reports" element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        } />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;