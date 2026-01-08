import Card from './component/Card.jsx'
import Card2 from './component/Card2.jsx'
import Header from './component/Header.jsx'
import Footer from './component/Footer.jsx'
import LogIn from './component/LogIn.jsx'
import SignUp from './component/SignUp.jsx'
import ForgotPassword from './component/ForgotPassword.jsx'
import HomePage from './component/HomePage.jsx'
import TravelerDashboard from './component/TravelerDashboard.jsx'
import AnalystDashboard from './component/AnalystDashboard.jsx'
import AdminDashboard from './component/AdminDashboard.jsx'
import RoadLabeling from './component/RoadLabeling.jsx'
import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  // useEffect(()=>{alert("Welcome to app")},[])
  
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<TravelerDashboard />} />
        <Route path="/analyst-dashboard" element={<AnalystDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/road-labeling" element={<RoadLabeling />} />
      </Routes>
    </Router>
  )
}

export default App
