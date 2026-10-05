import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { api, errorMessage, getBaseUrl, setAuthToken, setBaseUrl } from "./src/api";
import { colors, styles } from "./src/theme";
import type { AuthResponse, CartLine, Category, MenuItem, Order, Reservation, User } from "./src/types";

type Tab = "menu" | "cart" | "orders" | "reserve" | "account";

const TOKEN_KEY = "myrestaurant.token";
const CART_KEY = "myrestaurant.cart";
const API_KEY = "myrestaurant.api";

const orderLabels: Record<string, string> = {
  Pending: "در انتظار",
  Preparing: "در حال آماده‌سازی",
  Ready: "آماده",
  Completed: "تحویل شده",
  Cancelled: "لغو شده",
};

const reservationLabels: Record<string, string> = {
  Pending: "در انتظار",
  Confirmed: "تأیید شده",
  Cancelled: "لغو شده",
};

function money(value: number) {
  return `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;
}

function mediaUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${getBaseUrl()}${path}`;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("menu");
  const [user, setUser] = useState<User | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    const boot = async () => {
      const [storedApi, storedToken, storedCart] = await Promise.all([
        AsyncStorage.getItem(API_KEY),
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(CART_KEY),
      ]);
      if (storedApi) setBaseUrl(storedApi);
      if (storedCart) {
        try {
          const parsed = JSON.parse(storedCart) as CartLine[];
          if (Array.isArray(parsed)) setLines(parsed);
        } catch {
          setLines([]);
        }
      }
      if (storedToken) {
        setAuthToken(storedToken);
        try {
          const response = await api.get<User>("/api/auth/me");
          setUser(response.data);
        } catch {
          setAuthToken(null);
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
      }
      setReady(true);
    };
    void boot();
  }, []);

  useEffect(() => {
    if (ready) void AsyncStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const add = (item: MenuItem) => {
    setLines((current) => {
      const existing = current.find((line) => line.menuItemId === item.id);
      if (!existing) return [...current, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
      return current.map((line) =>
        line.menuItemId === item.id ? { ...line, quantity: Math.min(line.quantity + 1, 20) } : line,
      );
    });
  };

  const setQuantity = (menuItemId: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.menuItemId !== menuItemId)
        : current.map((line) => (line.menuItemId === menuItemId ? { ...line, quantity } : line)),
    );
  };

  const saveSession = async (auth: AuthResponse) => {
    setAuthToken(auth.token);
    setUser(auth.user);
    await AsyncStorage.setItem(TOKEN_KEY, auth.token);
  };

  const logout = async () => {
    setAuthToken(null);
    setUser(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
  };

  if (!ready) {
    return (
      <View style={[styles.screen, { justifyContent: "center" }]}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        {tab === "menu" && <MenuScreen onAdd={add} />}
        {tab === "cart" && (
          <CartScreen
            lines={lines}
            user={user}
            setQuantity={setQuantity}
            onOrdered={() => {
              setLines([]);
              setTab("orders");
            }}
            goAccount={() => setTab("account")}
          />
        )}
        {tab === "orders" && <OrdersScreen user={user} goAccount={() => setTab("account")} />}
        {tab === "reserve" && <ReserveScreen user={user} goAccount={() => setTab("account")} />}
        {tab === "account" && <AccountScreen user={user} onAuth={saveSession} onLogout={logout} />}
      </View>
      <View style={styles.tabs}>
        <TabButton label="منو" active={tab === "menu"} onPress={() => setTab("menu")} />
        <TabButton label={`سبد${lines.length ? ` ${lines.reduce((sum, line) => sum + line.quantity, 0)}` : ""}`} active={tab === "cart"} onPress={() => setTab("cart")} />
        <TabButton label="سفارش" active={tab === "orders"} onPress={() => setTab("orders")} />
        <TabButton label="رزرو" active={tab === "reserve"} onPress={() => setTab("reserve")} />
        <TabButton label="حساب" active={tab === "account"} onPress={() => setTab("account")} />
      </View>
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.tab} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabOn]}>{label}</Text>
    </Pressable>
  );
}

function MenuScreen({ onAdd }: { onAdd: (item: MenuItem) => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categoryId, setCategoryId] = useState("all");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<MenuItem | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Category[]>("/api/categories"),
      api.get<MenuItem[]>("/api/menu-items", { params: { availableOnly: true } }),
    ])
      .then(([categoryResponse, itemResponse]) => {
        setCategories(categoryResponse.data);
        setItems(itemResponse.data);
      })
      .catch((reason) => setError(errorMessage(reason, "منو بارگذاری نشد.")));
  }, []);

  const visible = items.filter((item) => categoryId === "all" || item.categoryId === categoryId);

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>رستوران من</Text>
      <Text style={styles.muted}>منوی امروز را انتخاب کنید.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.chipRow}>
        <Pressable style={[styles.chip, categoryId === "all" && styles.chipOn]} onPress={() => setCategoryId("all")}>
          <Text style={categoryId === "all" ? styles.chipTextOn : styles.chipText}>همه</Text>
        </Pressable>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[styles.chip, categoryId === category.id && styles.chipOn]}
            onPress={() => setCategoryId(category.id)}
          >
            <Text style={categoryId === category.id ? styles.chipTextOn : styles.chipText}>{category.name}</Text>
          </Pressable>
        ))}
      </View>
      {visible.map((item) => (
        <Pressable key={item.id} style={styles.card} onPress={() => setSelected(item)}>
          {mediaUrl(item.imageUrl) ? (
            <Image source={{ uri: mediaUrl(item.imageUrl) ?? "" }} style={styles.photo} />
          ) : null}
          <Text style={styles.muted}>{item.categoryName}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.muted}>{item.description}</Text>
          <View style={styles.row}>
            <Text style={styles.name}>{money(item.price)}</Text>
            <Pressable style={styles.button} onPress={() => onAdd(item)}>
              <Text style={styles.buttonText}>افزودن</Text>
            </Pressable>
          </View>
        </Pressable>
      ))}
      <Modal visible={selected !== null} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBack}>
          <View style={styles.modalCard}>
            {selected && mediaUrl(selected.imageUrl) ? (
              <Image source={{ uri: mediaUrl(selected.imageUrl) ?? "" }} style={styles.modalPhoto} />
            ) : null}
            <Text style={styles.name}>{selected?.name}</Text>
            <Text style={styles.muted}>محتویات</Text>
            <Text style={styles.muted}>{selected?.ingredients || selected?.description}</Text>
            <Pressable style={styles.button} onPress={() => setSelected(null)}>
              <Text style={styles.buttonText}>بستن</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function CartScreen({
  lines,
  user,
  setQuantity,
  onOrdered,
  goAccount,
}: {
  lines: CartLine[];
  user: User | null;
  setQuantity: (id: string, quantity: number) => void;
  onOrdered: () => void;
  goAccount: () => void;
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  const submit = async () => {
    if (!user) {
      goAccount();
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.post("/api/orders", {
        note,
        items: lines.map((line) => ({ menuItemId: line.menuItemId, quantity: line.quantity })),
      });
      onOrdered();
    } catch (reason) {
      setError(errorMessage(reason, "ثبت سفارش انجام نشد."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>سبد</Text>
      {lines.length === 0 && <Text style={styles.muted}>سبد خالی است.</Text>}
      {lines.map((line) => (
        <View key={line.menuItemId} style={styles.card}>
          <Text style={styles.name}>{line.name}</Text>
          <View style={styles.row}>
            <Text>{money(line.price * line.quantity)}</Text>
            <View style={styles.row}>
              <Pressable style={styles.chip} onPress={() => setQuantity(line.menuItemId, line.quantity - 1)}>
                <Text>−</Text>
              </Pressable>
              <Text>{line.quantity}</Text>
              <Pressable style={styles.chip} onPress={() => setQuantity(line.menuItemId, line.quantity + 1)}>
                <Text>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ))}
      <TextInput style={styles.input} value={note} onChangeText={setNote} placeholder="توضیح سفارش" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={[styles.name, { marginBottom: 10 }]}>جمع: {money(total)}</Text>
      <Pressable style={styles.button} disabled={busy || lines.length === 0} onPress={() => void submit()}>
        <Text style={styles.buttonText}>{user ? "ثبت سفارش" : "برای ثبت وارد شوید"}</Text>
      </Pressable>
    </ScrollView>
  );
}

function OrdersScreen({ user, goAccount }: { user: User | null; goAccount: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api
      .get<Order[]>("/api/orders")
      .then((response) => setOrders(response.data))
      .catch((reason) => setError(errorMessage(reason, "سفارش‌ها بارگذاری نشد.")));
  }, [user]);

  if (!user) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>سفارش‌ها</Text>
        <Pressable style={styles.button} onPress={goAccount}>
          <Text style={styles.buttonText}>ورود به حساب</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>سفارش‌ها</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {orders.length === 0 && !error ? <Text style={styles.muted}>سفارشی ثبت نشده است.</Text> : null}
      {orders.map((order) => (
        <View key={order.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.name}>{orderLabels[order.status] ?? order.status}</Text>
            <Text style={styles.muted}>{new Date(order.createdAt).toLocaleString("fa-IR")}</Text>
          </View>
          <Text style={styles.muted}>{order.items.map((item) => `${item.itemName} × ${item.quantity}`).join("، ")}</Text>
          <Text style={styles.name}>{money(order.total)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function ReserveScreen({ user, goAccount }: { user: User | null; goAccount: () => void }) {
  const [items, setItems] = useState<Reservation[]>([]);
  const [guestName, setGuestName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [reservedFor, setReservedFor] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    api
      .get<Reservation[]>("/api/reservations")
      .then((response) => setItems(response.data))
      .catch((reason) => setError(errorMessage(reason, "رزروها بارگذاری نشد.")));
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  if (!user) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>رزرو میز</Text>
        <Pressable style={styles.button} onPress={goAccount}>
          <Text style={styles.buttonText}>ورود به حساب</Text>
        </Pressable>
      </View>
    );
  }

  const submit = async () => {
    setError("");
    const when = new Date(reservedFor);
    if (Number.isNaN(when.getTime())) {
      setError("زمان را به شکل 2026-10-05T19:30 وارد کنید.");
      return;
    }
    try {
      await api.post("/api/reservations", {
        guestName,
        phone,
        partySize: Number(partySize),
        reservedFor: when.toISOString(),
        note,
      });
      setNote("");
      load();
    } catch (reason) {
      setError(errorMessage(reason, "رزرو ثبت نشد."));
    }
  };

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>رزرو میز</Text>
      <TextInput style={styles.input} value={guestName} onChangeText={setGuestName} placeholder="نام مهمان" />
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="شماره تماس" />
      <TextInput style={styles.input} value={partySize} onChangeText={setPartySize} placeholder="تعداد نفرات" keyboardType="number-pad" />
      <TextInput style={styles.input} value={reservedFor} onChangeText={setReservedFor} placeholder="2026-10-05T19:30" />
      <TextInput style={styles.input} value={note} onChangeText={setNote} placeholder="توضیح" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.button} onPress={() => void submit()}>
        <Text style={styles.buttonText}>درخواست رزرو</Text>
      </Pressable>
      <View style={{ height: 16 }} />
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.name}>{item.guestName}</Text>
          <Text style={styles.muted}>
            {new Date(item.reservedFor).toLocaleString("fa-IR")} · {item.partySize} نفر · {reservationLabels[item.status] ?? item.status}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

function AccountScreen({
  user,
  onAuth,
  onLogout,
}: {
  user: User | null;
  onAuth: (auth: AuthResponse) => Promise<void>;
  onLogout: () => Promise<void>;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("customer@myrestaurant.local");
  const [password, setPassword] = useState("Customer123!");
  const [apiUrl, setApiUrl] = useState(getBaseUrl());
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    try {
      const response =
        mode === "login"
          ? await api.post<AuthResponse>("/api/auth/login", { email, password })
          : await api.post<AuthResponse>("/api/auth/register", { fullName, email, password });
      await onAuth(response.data);
    } catch (reason) {
      setError(errorMessage(reason, "ورود انجام نشد."));
    }
  };

  const saveApi = async () => {
    const url = apiUrl.trim().replace(/\/$/, "");
    setBaseUrl(url);
    await AsyncStorage.setItem(API_KEY, url);
    setError("");
  };

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>حساب</Text>
      {user ? (
        <View style={styles.card}>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.muted}>{user.email}</Text>
          <Text style={styles.muted}>{user.role === "Admin" ? "مدیر" : "مشتری"}</Text>
          <Pressable style={[styles.button, styles.ghost]} onPress={() => void onLogout()}>
            <Text style={styles.ghostText}>خروج</Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <View style={styles.chipRow}>
            <Pressable style={[styles.chip, mode === "login" && styles.chipOn]} onPress={() => setMode("login")}>
              <Text style={mode === "login" ? styles.chipTextOn : styles.chipText}>ورود</Text>
            </Pressable>
            <Pressable style={[styles.chip, mode === "register" && styles.chipOn]} onPress={() => setMode("register")}>
              <Text style={mode === "register" ? styles.chipTextOn : styles.chipText}>ثبت‌نام</Text>
            </Pressable>
          </View>
          {mode === "register" && (
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="نام" />
          )}
          <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="ایمیل" />
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="رمز عبور" />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.button} onPress={() => void submit()}>
            <Text style={styles.buttonText}>{mode === "login" ? "ورود" : "ساخت حساب"}</Text>
          </Pressable>
        </View>
      )}
      <Text style={[styles.name, { marginTop: 22 }]}>آدرس API</Text>
      <Text style={styles.muted}>روی گوشی، به‌جای localhost آدرس شبکه کامپیوتر را بگذارید.</Text>
      <TextInput style={styles.input} value={apiUrl} onChangeText={setApiUrl} autoCapitalize="none" />
      <Pressable style={[styles.button, styles.ghost]} onPress={() => void saveApi()}>
        <Text style={styles.ghostText}>ذخیره آدرس</Text>
      </Pressable>
    </ScrollView>
  );
}
