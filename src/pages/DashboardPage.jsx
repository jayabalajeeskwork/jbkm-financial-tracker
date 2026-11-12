import "../styles/DashboardPage.css";

export default function DashboardPage({ loggedInUser }) {
  return (
    <div className="page-stack">
      <section className="card dashboard-welcome-card">
        <h1 className="dashboard-welcome-card__title">Dashboard</h1>
        <p className="dashboard-welcome-card__text">
          Welcome, {loggedInUser.displayName}. Your dashboard features will appear here.
        </p>
      </section>
    </div>
  );
}