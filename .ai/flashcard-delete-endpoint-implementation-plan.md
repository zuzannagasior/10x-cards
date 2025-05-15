# API Endpoint Implementation Plan: Delete Flashcard

## 1. Przegląd punktu końcowego

Usuwa pojedynczy flashcard z bazy danych.

- **Metoda HTTP:** DELETE
- **URL:** `/api/flashcards/:id`
- **Opis:** Usuwa kartę o podanym `id` należącą do uwierzytelnionego użytkownika.
- **Kody statusu:**
  - 204 No Content – pomyślne usunięcie
  - 401 Unauthorized – brak lub nieprawidłowy JWT
  - 403 Forbidden – użytkownik nie ma uprawnień do usunięcia tej karty
  - 404 Not Found – karta nie istnieje
  - 500 Internal Server Error – nieoczekiwany błąd serwera

## 2. Szczegóły żądania

- **Metoda HTTP:** DELETE
- **Struktura URL:** `/api/flashcards/:id`
- **Parametry ścieżki:**
  - **id** (wymagane, liczba) – identyfikator karty do usunięcia
- **Request Body:** brak

## 3. Wykorzystywane typy

Brak request DTO.

### Response DTO

Brak response (204 No Content).

## 4. Przepływ danych

1. **Autoryzacja:** Middleware w `src/middleware/index.ts` dekoduje JWT i zapisuje obiekt `user` w `locals`.
2. **Parsowanie parametru:** ID karty odczytywane z `params.id` i parsowane jako liczba.
3. **Walidacja i autoryzacja:**
   - Jeżeli `locals.user` nie jest zdefiniowane → 401
   - Wywołanie metody serwisu `FlashcardsService.deleteFlashcard(id, user.id)`
4. **Logika serwisowa:**
   - Sprawdzenie istnienia karty o podanym `id` i `user_id` równym `user.id`
   - Jeżeli brak → wyjątek serwisowy (np. `NotFoundError`) lub zwrócenie wskaźnika
   - Usunięcie rekordu w Supabase
5. **Odpowiedź:**
   - Pomyślne usunięcie → 204 No Content
   - Brak karty → 404
   - Brak uprawnień → 403

## 5. Względy bezpieczeństwa

- **Uwierzytelnianie:** Wymaganie ważnego JWT, middleware Astro wykorzystuje Supabase Auth.
- **Autoryzacja:** Użytkownik może usuwać tylko własne rekordy (`flashcards.user_id === locals.user.id`).
- **Walidacja ID:** Parsowanie `id` jako liczby z dodatkowym guard clause (jeśli `NaN` → 400).
- **Ochrona przed atakami:** Brak ciała żądania eliminuje wektor SQL Injection w treści.

## 6. Obsługa błędów

| Kodeks statusu | Warunek                      | Treść odpowiedzi                     |
| -------------- | ---------------------------- | ------------------------------------ |
| 400            | `id` nie jest liczbą         | `{ error: "Invalid ID parameter" }`  |
| 401            | Brak `locals.user`           | `{ error: "Unauthorized" }`          |
| 403            | `user.id` ≠ właściciel karty | `{ error: "Forbidden" }`             |
| 404            | Nie znaleziono karty         | `{ error: "Not Found" }`             |
| 500            | Błąd po stronie serwera      | `{ error: "Internal server error" }` |

## 7. Rozważania dotyczące wydajności

- Operacja DELETE jest lekka. Jedno zapytanie do bazy z `eq('id', id).eq('user_id', userId)`.
- Indeks na kolumnie `user_id` i `id` zapewnia szybkie filtrowanie.

## 8. Kroki implementacji

1. **DTO/Typy:** Brak dodatkowych DTO.
2. **Serwis:**
   - W `src/lib/services/flashcards.service.ts` dodać metodę:
     ```ts
     async deleteFlashcard(id: number, userId: number): Promise<void> { ... }
     ```
3. **Endpoint:**
   - Utworzyć lub zaktualizować plik `src/pages/api/flashcards/[id].ts`:
     ```ts
     export const DELETE: APIRoute = async ({ params, locals }) => { ... }
     ```
4. **Walidacja:**
   - Parsowanie parametru `id` i guard clause na `NaN`.
5. **Autoryzacja:**
   - Sprawdzenie `locals.user`, rzucenie 401.
6. **Wywołanie serwisu i mapowanie błędów:**
   - `try/catch` i mapowanie wyjątków na odpowiednie kody.
7. **Testy jednostkowe:**
   - Pokryć scenariusze: brak JWT, nieprawidłowy `id`, brak rekordu, pomyślne usunięcie.
8. **Dokumentacja:**
