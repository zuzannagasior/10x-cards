# Specyfikacja modułu autentykacji (US-007)

Poniższa dokumentacja opisuje architekturę frontendu, backendu oraz systemu autentykacji i autoryzacji użytkowników w projekcie 10xCards. Opracowano zgodnie z wymaganiami PRD (US-007) oraz technologiami wymienionymi w pliku `.ai/tech-stack.md`.

---

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Struktura stron i layoutów

- `src/layouts/AuthLayout.astro`

  - Layout dla stron związanych z logowaniem, rejestracją i odzyskiwaniem hasła.
  - Zawiera wspólne elementy UI: logo, tytuł sekcji, kontener formularza, proste navlinki (np. „Logowanie” / „Rejestracja”).

- `src/layouts/MainLayout.astro`

  - Główny layout aplikacji (widok chroniony i publiczny).
  - Zawiera pasek nawigacyjny z przyciskiem wylogowania (React `AuthButton`), linki do profilu i strony głównej.

- Strony Astro:

  - `src/pages/login.astro` → używa `AuthLayout` + komponent React `LoginForm` (client:load)
  - `src/pages/register.astro` → używa `AuthLayout` + `RegisterForm`
  - `src/pages/forgot-password.astro` → `AuthLayout` + `ForgotPasswordForm`
  - `src/pages/reset-password.astro` → `AuthLayout` + `ResetPasswordForm`
  - Strony chronione (np. `/generate`) zachowują `MainLayout`.

- `src/middleware/index.ts`
  - Lista ścieżek wymagających autentykacji.
  - Middleware przechwytuje żądania do stron chronionych i przekierowuje na `/login` w przypadku braku aktywnej sesji.

### 1.2 Komponenty React (client-side)

W katalogu `src/components/auth`:

- `LoginForm.tsx`

  - Pola: `email`, `password`.
  - Request: `POST /api/auth/login`.
  - Obsługa błędów: walidacja klienta (regex email, długość hasła ≥ 8), wyświetlanie komunikatów pod polami lub toast.

- `RegisterForm.tsx`

  - Pola: `email`, `password`, `confirmPassword`.
  - Request: `POST /api/auth/register`.
  - Walidacja: email, długość hasła ≥ 8, `password === confirmPassword`.

- `ForgotPasswordForm.tsx`

  - Pole: `email`.
  - Request: `POST /api/auth/forgot-password`.
  - Po wysłaniu: komunikat „Sprawdź swoją skrzynkę pocztową”.

- `ResetPasswordForm.tsx`

  - Pola: `newPassword`, `confirmPassword`.
  - Pobiera `access_token` z query string.
  - Request: `POST /api/auth/reset-password`.
  - Walidacja jak w rejestracji.

- `AuthButton.tsx`
  - Przyciski: „Wyloguj” – wywołuje do API `POST /api/auth/logout`, usuwa sesję, przekierowuje na `/login`.

### 1.3 Walidacja i komunikaty błędów

- Client-side: validacja przy submit:
  - `email` zgodny z RFC.
  - `password` ≥ 8 znaków.
  - `confirmPassword` równe `password`.
  - Pola wymagane.
- Server-side: ponowna walidacja (zabezpieczenie formy przed złośliwymi żądaniami).
- Komunikaty:
  - Inline pod polami.
  - Globalny alert/toast dla błędów serwera.
  - Komunikaty sukcesów (np. „Rejestracja zakończona sukcesem, sprawdź maila”).

### 1.4 Kluczowe scenariusze użytkownika

1. Rejestracja nowego konta
2. Logowanie istniejącego użytkownika
3. Odzyskiwanie hasła (prośba + reset)
4. Wylogowanie
5. Przekierowania w przypadku braku autentykacji

---

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura endpointów API

Katalog: `src/pages/api/auth/`

- `register.ts` (POST)

  - Input: `{ email, password }`
  - Działanie: `supabase.auth.signUp`
  - Response: `{ status: 200, message: string }` albo `{ status: 400|500, error: string }`

- `login.ts` (POST)

  - Input: `{ email, password }`
  - Działanie: `supabase.auth.signInWithPassword`
  - Serwuje `Set-Cookie` z sesją HTTP-only.

- `logout.ts` (POST)

  - Działanie: `supabase.auth.signOut`, czyszczenie ciasteczek.

- `forgot-password.ts` (POST)

  - Input: `{ email }`
  - Działanie: `supabase.auth.resetPasswordForEmail` z parametrem redirect URL do `/reset-password`.

- `reset-password.ts` (POST)
  - Input: `{ access_token, newPassword }`
  - Działanie: `supabase.auth.updateUser(access_token, { password: newPassword })`

### 2.2 Modele danych i DTO

W `src/types.ts`:

```ts
export interface RegisterDTO {
  email: string;
  password: string;
}
export interface LoginDTO {
  email: string;
  password: string;
}
export interface ForgotPasswordDTO {
  email: string;
}
export interface ResetPasswordDTO {
  access_token: string;
  newPassword: string;
}
export interface APIResponse<T> {
  data?: T;
  error?: { message: string; code?: string };
}
```

### 2.3 Walidacja i obsługa wyjątków

- Biblioteka Zod (`src/lib/validation/auth.ts`): Schemas dla każdego DTO.
- W handlerach pierwszy krok: parsowanie i walidacja body.
- Jeśli walidacja nie przejdzie → 400 z opisem błędów.
- Try/catch dla wywołań Supabase → logowanie błędów (`console.error` lub `src/lib/logger`) i zwracanie 500.

### 2.4 Rendering SSR i middleware

- `src/middleware/index.ts` – sprawdza cookie, pobiera sesję supabase:
  ```ts
  import { getSession } from "src/db/supabaseServerClient";
  export async function onRequest({ request, redirect }) {
    const session = await getSession(request.headers.get("cookie"));
    if (!session && protectedPaths.includes(request.url.pathname)) {
      throw redirect(302, "/login");
    }
  }
  ```
- W `astro.config.mjs` nie wymagane dodatkowe zmiany (adapter Node standalone).

---

## 3. SYSTEM AUTENTYKACJI

### 3.1 Konfiguracja klienta Supabase

- `src/db/supabaseClient.ts`
  - Eksport klienta `createClient(SUPABASE_URL, SUPABASE_ANON_KEY)` dla frontendu.
  - Eksport serwerowego klienta z `SUPABASE_SERVICE_KEY` dla API.

### 3.2 Przechowywanie sesji

- Sesja zarządzana przez Supabase – HTTP-only Secure cookies.
- Frontend nie ma dostępu do cookie, jedynie API/SSR sprawdza je w middleware.

### 3.3 Flows autentykacji

1. **Rejestracja** → email/hasło → link potwierdzający (jeśli włączone) lub natychmiastowy login.
2. **Logowanie** → ustanowienie sesji w cookie.
3. **Odzyskiwanie hasła** → email → link z tokenem → strona resetowania.
4. **Reset hasła** → token + nowe hasło → sesja (opcjonalnie ponowne logowanie).
5. **Wylogowanie** → usunięcie sesji.

### 3.4 Bezpieczeństwo i środowisko

- Zmienne środowiskowe w `.env`:
  ```text
  SUPABASE_URL=
  SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_KEY=
  PUBLIC_REDIRECT_URL=http://localhost:3000/reset-password
  ```
- CORS i nagłówki zabezpieczone domyślnie przez Astro/Node.

---

Powstała struktura gwarantuje spójność z istniejącą architekturą Astro + React + Supabase oraz wymaganiami PRD i dokumentacją technologiczną.
