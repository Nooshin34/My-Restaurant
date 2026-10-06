import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext.tsx";
import { CartProvider } from "./cart/CartContext.tsx";
import { Layout, RequireAuth } from "./components/Layout.tsx";
import { AdminPage } from "./pages/AdminPage.tsx";
import { CartPage } from "./pages/CartPage.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { MenuPage } from "./pages/MenuPage.tsx";
import { OrdersPage } from "./pages/OrdersPage.tsx";
import { RegisterPage } from "./pages/RegisterPage.tsx";
import { ReservationsPage } from "./pages/ReservationsPage.tsx";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<MenuPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route
                path="orders"
                element={
                  <RequireAuth>
                    <OrdersPage />
                  </RequireAuth>
                }
              />
              <Route
                path="reservations"
                element={
                  <RequireAuth>
                    <ReservationsPage />
                  </RequireAuth>
                }
              />
              <Route
                path="admin"
                element={
                  <RequireAuth>
                    <AdminPage />
                  </RequireAuth>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
