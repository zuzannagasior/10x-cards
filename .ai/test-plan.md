# Plan Testów dla projektu 10xCards

## 1. Wprowadzenie i cele testowania

Celem testowania jest zapewnienie wysokiej jakości aplikacji Astro 5 + React 19 + TypeScript 5 + Tailwind 4 + Shadcn/ui, opartej o backend Supabase i integrację z Openrouter.ai. Testy zweryfikują poprawność funkcjonalną, integracyjną, wydajnościową i bezpieczeństwo kluczowych elementów systemu oraz stabilność UX.

## 2. Zakres testów

- Warstwa frontendowa (Astro pages, React components, Shadcn/ui)
- Logika biznesowa (usługi w `src/lib`)
- API endpoints (`src/pages/api`)
- Integracja z Supabase (auth, baza danych)
- Integracja z Openrouter.ai (generowanie treści)
- Middleware (`src/middleware/index.ts`)
- Styling i responsywność (Tailwind)

## 3. Typy testów do przeprowadzenia

1. Testy jednostkowe (Vitest / Jest + React Testing Library)
2. Testy integracyjne (API + baza danych testowa / MSW)
3. Testy end-to-end (Cypress lub Playwright)
4. Testy wydajnościowe (Lighthouse, Artillery)
5. Testy bezpieczeństwa (OWASP ZAP, analiza statyczna)
6. Testy wizualne (Percy / Chromatic)

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Autoryzacja i uwierzytelnianie

- Rejestracja nowego użytkownika (poprawne dane / błędne hasło / zduplikowany email)
- Logowanie (pomyślne / niepomyślne / blokada przy zbyt wielu próbach)
- Resetowanie hasła (email istnieje / nieistniejący email)
- Wylogowanie (sesja unieważniona)

### 4.2. Generowanie zestawów fiszek

- Wejście na stronę generowania
- Wywołanie API generacji (pomyślna odpowiedź / timeout / błąd serwera)
- Wyświetlenie wyników w `GenerateView` (poprawna lista / komunikat o błędzie)

### 4.3. Przeglądanie fiszek

- Render listy fiszek (`FlashcardsList` + `FlashcardListItem`)
- Edycja / usuwanie fiszki (API flashcards.ts)
- Obsługa pustej listy

### 4.4. Komponenty UI i layout

- Interakcje z komponentami Shadcn/ui (dropdown, dialog, sheet, button)
- Responsywność tailwindowych klas
- Middleware blokujący dostęp do stron auth / main

### 4.5. Usługi backendowe (`src/lib`)

- flashcards.service: CRUD dla fiszek (poprawne ścieżki kodu / błąd DB)
- generation.service + openrouter.service: obsługa sukcesu / błędu API Openrouter

## 5. Środowisko testowe

- Node.js v18+ (zgodne z Astro)
- Testowa instancja Supabase (możliwość resetu DB między testami)
- Mock serwisu Openrouter (MSW + nagrania odpowiedzi)
- CI GitHub Actions z cachingiem DB i wymuszeniem lint & type check

## 6. Narzędzia do testowania

- Vitest + React Testing Library (unit & integracyjne)
- Cypress / Playwright (E2E)
- MSW (mock API)
- ESLint + TypeScript (analiza statyczna)
- Lighthouse CI (wydajność)
- OWASP ZAP (automatyczne skanowanie bezpieczeństwa)
- Percy / Chromatic (visual regression)

## 7. Harmonogram testów

| Faza                 | Zakres                                   | Termin    |
| -------------------- | ---------------------------------------- | --------- |
| Przygotowanie        | Konfiguracja środowiska, test DB, MSW    | Tydz. 1   |
| Testy jednostkowe    | Serwisy, helpery, biblioteki UI          | Tydz. 2–3 |
| Testy integracyjne   | API endpoints + DB + Openrouter mock     | Tydz. 3–4 |
| Testy E2E            | Scenariusze auth, generacja, CRUD fiszki | Tydz. 5–6 |
| Testy wydajności     | Lighthouse, Artillery                    | Tydz. 6   |
| Testy bezpieczeństwa | OWASP ZAP, analiza kodu                  | Tydz. 6   |
| Raport końcowy       | Podsumowanie, rekomendacje               | Tydz. 7   |

## 8. Kryteria akceptacji testów

- ≥ 90% pokrycia kodu w warstwie usług i komponentów
- 100% krytycznych (auth, generacja, CRUD) testów E2E przechodzi
- Brak blokujących błędów bezpieczeństwa
- Średni wynik Lighthouse ≥ 90 (Performance, Accessibility, Best Practices)
- Brak regresji wizualnych

---

Niniejszy plan testów zapewni kompleksowe pokrycie funkcjonalne, integracyjne, wydajnościowe i bezpieczeństwa projektu, zgodnie ze specyfiką używanych technologii i kluczowymi obszarami ryzyka.
