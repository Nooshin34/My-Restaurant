import type { ReactNode } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.tsx";
import { useCart } from "../cart/CartContext.tsx";

export function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();

  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <img className="mark" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={44} height={44} />
          <span>
            <strong>رستوران من</strong>
            <small>MY RESTAURANT</small>
          </span>
        </NavLink>
        <nav>
          <NavLink to="/" end>
            منو
          </NavLink>
          <NavLink to="/cart">
            سبد
            {count > 0 && <em>{count}</em>}
          </NavLink>
          <NavLink to="/orders">سفارش‌ها</NavLink>
          <NavLink to="/reservations">رزرو میز</NavLink>
          {user?.role === "Admin" && <NavLink to="/admin">مدیریت</NavLink>}
        </nav>
        <div className="account">
          {user ? (
            <>
              <span>{user.fullName}</span>
              <button type="button" className="btn logout" aria-label="خروج" data-tooltip="خروج" onClick={logout}>
                <LogoutIcon />
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn">
              ورود
            </NavLink>
          )}
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <p className="muted">در حال بررسی نشست...</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10 7V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M15 12H4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 9l-3 3 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
