import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";
import "../styles/AppLayout.css";

export default function AppLayout({ loggedInUser, onLogout }) {
  return (
    <div className="app-layout">
      <BottomNavigation />

      <div className="app-layout__main">
        <header className="app-layout__header">
          <h2 className="app-layout__greeting">Hello, {loggedInUser.displayName}</h2>
          <button className="button button--secondary button--small" onClick={onLogout}>
            Logout
          </button>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}