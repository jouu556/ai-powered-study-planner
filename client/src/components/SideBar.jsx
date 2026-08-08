import { Link } from "react-router-dom";

export default function Sidebar({ user }) {
  return (
    <aside
      style={{
        width: "220px",
        background: "#2d3436",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      <h2>📌 Dashboard</h2>
      <p>{user.name}</p>
      <p style={{ fontSize: "0.85em", color: "#ccc" }}>{user.email}</p>
      <Link style={sidebarLink} to="/plans">📅 My Plans</Link>
      <Link style={sidebarLink} to="/subjects">📚 My Subjects</Link>
    </aside>
  );
}

const sidebarLink = {
  color: "white",
  textDecoration: "none",
  background: "#636e72",
  padding: "8px 12px",
  borderRadius: "6px",
  fontWeight: "bold",
};
