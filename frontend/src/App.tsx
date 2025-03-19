import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSpring, animated } from "react-spring";
import { RootState } from "./store";
import LandingAnimation from "./components/LandingAnimation";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import ForgotPassword from "./components/ForgotPassword";
import Homepage from "./components/Homepage";
import Navbar from "./components/NavBar";
import StockPriceFetcher from "./components/StockPriceFetcher";
import PurchaseStockForm from "./components/TransactStockForm";
import ReportDashboard from "./components/ReportDashboard";
import Userprofile from "./components/Userprofile";

const ProtectedRoute = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  return isLoggedIn ? <Outlet /> : <Navigate to="/" />;
};

const App = () => {
  const [animationDone, setAnimationDone] = useState(false);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  // Fade-out animation for the landing page
  const fadeOutProps = useSpring({
    opacity: animationDone ? 0 : 1, // Fade out when animation is done
    config: { duration: 500 },
    onRest: () => setAnimationDone(true), // Trigger the main content once fade-out is done
  });

  // Fade-in animation for the main content
  const fadeInProps = useSpring({
    opacity: animationDone ? 1 : 0, // Fade in after the landing animation fades out
    config: { duration: 1500 }, // Same duration for smooth transition
  });

  useEffect(() => {
    const timer = setTimeout(() => setAnimationDone(true), 5000); // Wait for 24 seconds before triggering fade-out
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div style={{ position: "relative", width: "100%", height: "100vh"}}>
        {/* Landing Animation with Fade-out */}
        <animated.div
          style={{
            ...fadeOutProps,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
            pointerEvents: animationDone ? "none" : "auto", // Allow clicks only after animation is done
          }}
          >
          <LandingAnimation onAnimationEnd={() => setAnimationDone(true)} />
        </animated.div>


        {/* Main App Content */}
        <animated.div
          style={{
            ...fadeInProps,
            width: "100%",
            height: "100%",
            position: "absolute",
            zIndex: 5,
          }}
        >
          {isLoggedIn && <Navbar />}
          <Routes>
            <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
              <Route path="/dashboard" element={<Homepage />} />
              <Route path="/stock-price-fetch" element={<StockPriceFetcher />} />
              <Route path="/transact-stock-form" element={<PurchaseStockForm />} />
              <Route path="/report-dashboard" element={<ReportDashboard />} />
              <Route path="/user" element={<Userprofile />} />
            </Route>
          </Routes>
        </animated.div>
      </div>
    </Router>
  );
};

export default App;
