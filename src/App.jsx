import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { firebaseAuthentication } from "./services/firebaseConfiguration";
import { staticUserProfilesByEmail } from "./data/staticUsers";
import LoginPage from "./components/LoginPage";
import MonthlyExpensePage from "./components/MonthlyExpensePage";

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
          const staticUserProfile = staticUserProfilesByEmail[firebaseUser.email];

          if (!staticUserProfile) {
            // Valid Firebase user, but not listed in staticUsers.js
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
      }
    );

    return unsubscribeFromAuthentication;
  }, []);

  const handleLogout = () => signOut(firebaseAuthentication);

  if (isCheckingLoginStatus) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (!loggedInUser) return <LoginPage />;

  return <MonthlyExpensePage loggedInUser={loggedInUser} onLogout={handleLogout} />;
}