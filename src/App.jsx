import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { firebaseAuthentication } from "./services/firebaseConfiguration";
import { staticUserProfilesByEmail } from "./data/staticUsers";

import LoginPage from "./components/LoginPage";
import AppLayout from "./components/AppLayout";

import DashboardPage from "./pages/DashboardPage";
import ExpensePage from "./pages/ExpensePage";
import InvestmentPage from "./pages/InvestmentPage";

import StewardshipPage from "./pages/StewardshipPage";
import LendingPage from "./pages/LendingPage";

import WalletPage from "./pages/WalletPage";

import GoalsPage from "./pages/GoalsPage";
export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isCheckingLoginStatus, setIsCheckingLoginStatus] = useState(true);

  useEffect(() => {
    const unsubscribeFromAuthentication = onAuthStateChanged(
      firebaseAuthentication,
      async (firebaseUser) => {
        if (!firebaseUser) {
          setLoggedInUser(null);
        } else {
          const staticUserProfile =
            staticUserProfilesByEmail[firebaseUser.email];

          if (!staticUserProfile) {
            await signOut(firebaseAuthentication);
            setLoggedInUser(null);
          } else {
            setLoggedInUser({
              userId: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: staticUserProfile.displayName,
            });
          }
        }

        setIsCheckingLoginStatus(false);
      },
    );

    return unsubscribeFromAuthentication;
  }, []);

  const handleLogout = () => signOut(firebaseAuthentication);

  if (isCheckingLoginStatus) {
    return <p className="loading-message">Loading...</p>;
  }

  if (!loggedInUser) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route
        element={
          <AppLayout loggedInUser={loggedInUser} onLogout={handleLogout} />
        }
      >
        <Route
          path="/"
          element={<DashboardPage loggedInUser={loggedInUser} />}
        />

        <Route
          path="/expenses"
          element={<ExpensePage loggedInUser={loggedInUser} />}
        />

        <Route
          path="/investments"
          element={<InvestmentPage loggedInUser={loggedInUser} />}
        />
        <Route
          path="/stewardship"
          element={<StewardshipPage loggedInUser={loggedInUser} />}
        />

        <Route
          path="/lending"
          element={<LendingPage loggedInUser={loggedInUser} />}
        />

        <Route
          path="/wallet"
          element={<WalletPage loggedInUser={loggedInUser} />}
        />

        <Route path="/goals" element={<GoalsPage userId={user.uid} />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
