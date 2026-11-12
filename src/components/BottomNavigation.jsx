import { NavLink } from "react-router-dom";
import { navigationItems } from "../data/navigationItems";
import "../styles/BottomNavigation.css";

export default function BottomNavigation() {
  return (
    <nav className="bottom-navigation" aria-label="Main navigation">
      {navigationItems.map((navigationItem) => (
        <NavLink
          key={navigationItem.navigationItemId}
          to={navigationItem.routePath}
          end={navigationItem.routePath === "/"}
          className={({ isActive }) =>
            isActive
              ? "bottom-navigation__link bottom-navigation__link--active"
              : "bottom-navigation__link"
          }
        >
          <span className="bottom-navigation__icon">{navigationItem.iconSymbol}</span>
          <span className="bottom-navigation__label">{navigationItem.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}