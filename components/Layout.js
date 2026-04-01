import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "../lib/auth-client";

export default function Layout({ children }) {
  const router = useRouter();
  const { data: session } = useSession();

  async function handleLogout() {
    await signOut();
    router.push("/auth/login");
  }

  const navItems = [
    { href: "/dashboard", icon: "📊", label: "Dashboard" },
    { href: "/transactions", icon: "💸", label: "Transações" },
    { href: "/categories", icon: "🏷️", label: "Categorias" },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">BaseFinance</h1>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${router.pathname.startsWith(item.href) ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {session && (
            <div className="user-info">
              <div className="user-avatar">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="user-details">
                <span className="user-name">{session.user.name}</span>
                <span className="user-email">{session.user.email}</span>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
