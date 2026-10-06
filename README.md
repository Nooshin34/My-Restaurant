# رستوران من

سه پروژه جدا:

- `backend` — ASP.NET Core Web API روی .NET 11، با EF Core، SQL Server و JWT
- `web` — React + TypeScript + Axios + React Router
- `mobile` — React Native + Expo + Axios

## پیش‌نیاز

- SDK نسخه .NET 11 (این پروژه با `11.0.100-rc.1` ساخته شده)
- Node.js
- SQL Server. روی این سیستم LocalDB و SQL Server کامل هر دو موجودند. اتصال پیش‌فرض LocalDB است.

اگر `dotnet --version` هنوز 9 را نشان می‌دهد، SDK 11 در پروفایل کاربر نصب شده. در PowerShell:

```powershell
$env:PATH = "$env:LOCALAPPDATA\Microsoft\dotnet;" + $env:PATH
dotnet --version
```

## پایگاه داده

اتصال در `backend/src/MyRestaurant.Api/appsettings.json`:

```text
Server=(localdb)\mssqllocaldb;Database=MyRestaurant;Trusted_Connection=True;TrustServerCertificate=True
```

برای SQL Server داخل Docker، در `docker-compose.yml` سرویس بالا می‌آید و اتصال این است:

```text
Server=localhost,1433;Database=MyRestaurant;User Id=sa;Password=MyRestaurant_Dev_2026!;TrustServerCertificate=True
```

با اولین اجرای API، مایگریشن اعمال می‌شود و منوی نمونه ساخته می‌شود.

حساب‌های نمونه:

| نقش | ایمیل | رمز |
| --- | --- | --- |
| مدیر | admin@myrestaurant.local | Admin123! |
| مشتری | customer@myrestaurant.local | Customer123! |

کلید JWT داخل `appsettings.json` فقط برای توسعه محلی است. قبل از انتشار عوضش کنید.

## اجرا

API روی `http://localhost:5080`:

```powershell
$env:PATH = "$env:LOCALAPPDATA\Microsoft\dotnet;" + $env:PATH
dotnet run --project backend/src/MyRestaurant.Api
```

وب روی `http://localhost:5173`:

```powershell
cd web
npm install
npm run dev
```

موبایل:

```powershell
cd mobile
npm install
npx expo start
```

روی شبیه‌ساز اندروید آدرس API به‌صورت پیش‌فرض `http://10.0.2.2:5080` است. روی گوشی واقعی، در تب حساب آدرس شبکه کامپیوتر را بگذارید، مثلاً `http://192.168.1.20:5080`.

## انتشار وب روی GitHub Pages

گیت‌هاب پیجز فقط فایل‌های ثابت وب را میزبانی می‌کند. API و SQL Server آنجا اجرا نمی‌شوند. با push به شاخهٔ `main` که پوشهٔ `web` را تغییر دهد، workflow سایت را می‌سازد و منتشر می‌کند.

آدرس سایت: `https://nooshin34.github.io/My-Restaurant/`

یک بار در مخزن، از Settings سپس Pages، منبع ساخت را روی GitHub Actions بگذارید.

برای اینکه منو و ورود روی سایت منتشرشده کار کند، API باید روی یک آدرس عمومی در دسترس باشد. متغیر مخزن `VITE_API_URL` را همان آدرس بگذارید، مثلاً `https://api.example.com`. بدون این متغیر، سایت منتشرشده همچنان به `http://localhost:5080` وصل می‌شود.

## API

| مسیر | دسترسی |
| --- | --- |
| `POST /api/auth/register` و `POST /api/auth/login` و `GET /api/auth/me` | ثبت‌نام و ورود آزاد است؛ پروفایل با JWT |
| `GET /api/categories` و `GET /api/menu-items` | عمومی |
| `POST/PUT/DELETE` منو و دسته‌ها | فقط مدیر |
| `POST /api/orders` و `GET /api/orders` | کاربر واردشده؛ مدیر همه سفارش‌ها را می‌بیند |
| `PATCH /api/orders/{id}/status` | فقط مدیر |
| `POST /api/reservations` و `POST /api/reservations/{id}/cancel` | کاربر واردشده |
| `PATCH /api/reservations/{id}/status` | فقط مدیر |

سند OpenAPI در حالت Development: `http://localhost:5080/openapi/v1.json`
