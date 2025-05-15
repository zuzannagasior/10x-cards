# API Endpoint Implementation Plan: GET /flashcards

## 1. Przegląd punktu końcowego

Punkt końcowy **GET /flashcards** zwraca paginowaną listę fiszek należących do uwierzytelnionego użytkownika.

## 2. Szczegóły żądania

- Metoda HTTP: GET
- URL: `/flashcards`
- Query parameters:
  - Wymagane: brak
  - Opcjonalne:
    - `page` (liczba całkowita, domyślnie `1`, >0)
    - `limit` (liczba całkowita, domyślnie `20`, >0, maksymalnie np. `100`)
    - `source` (enum: `manual`, `ai`, `ai-edited`)
- Nagłówki:
  - `Authorization: Bearer <JWT>`

## 3. Wykorzystywane typy

- **FlashcardsListResponseDto**
  - `data`: FlashcardDto[]
  - `pagination`: PaginationDto
- **FlashcardDto** (id, front, back, source, generation_id, created_at, updated_at)
- **PaginationDto** (page, totalPages, totalItems)
- **ListFlashcardsQueryParams** (zdefiniowany w Zod: page, limit, source?)

## 4. Szczegóły odpowiedzi

- **200 OK**
  ```json
  {
    "data": [
      /* FlashcardDto[] */
    ],
    "pagination": { "page": 1, "totalPages": 5, "totalItems": 100 }
  }
  ```
- **400 Bad Request**: nieprawidłowe parametry zapytania (np. `page<=0`, nieprawidłowy `source`)
- **401 Unauthorized**: brak lub niepoprawny JWT
- **500 Internal Server Error**: niespodziewany błąd serwera

## 5. Przepływ danych

1. Klient wysyła GET `/flashcards?page=&limit=&source=` z nagłówkiem `Authorization`.
2. Middleware Astro (`src/middleware/index.ts`) weryfikuje JWT i inicjalizuje `context.locals.supabase`.
3. Handler w `src/pages/api/flashcards.ts`:
   - Wywołuje Zod do walidacji i przekształcenia query params.
   - Pobiera ID użytkownika z `locals.user.id` (ustawione przez middleware).
   - Deleguje do serwisu `flashcards.service.getFlashcards(userId, page, limit, source?)`.
4. W serwisie (`src/lib/flashcards.service.ts`):
   - Buduje zapytanie Supabase:
     - Filtr `eq('user_id', userId)`
     - (opcjonalnie) `eq('source', source)`
     - Paginacja `.range((page-1)*limit, page*limit-1)`
     - Pobranie całkowitej liczby rekordów (`count: 'exact'`)
   - Zwraca: `{ data: FlashcardDto[], count: number }`
5. Handler oblicza `totalPages = ceil(count / limit)`, buduje DTO odpowiedzi i zwraca JSON.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: wymagana autoryzacja via Supabase JWT w nagłówku.
- **Autoryzacja**: filtrowanie rekordów po `user_id` gwarantuje dostęp tylko do własnych zasobów.
- **Walidacja wejścia**: Zod zabezpiecza przed nieprawidłowymi lub złośliwymi parametrami.
- **Ochrona przed nadmiernym obciążeniem**: limitowanie `limit` (np. max 100).

## 7. Obsługa błędów

| Scenariusz                                | Kod | Opis                             |
| ----------------------------------------- | --- | -------------------------------- |
| Niepoprawne parametry zapytania           | 400 | Zod rzuca wyjątek, zwracamy błąd |
| Brak/niepoprawny JWT                      | 401 | Middleware zwraca błąd           |
| Brak sesji lub nieznalezienie user.id     | 401 | Sesja nieznaleziona              |
| Błąd bazy danych / niespodziewany wyjątek | 500 | Logujemy i zwracamy komunikat    |

## 8. Rozważania dotyczące wydajności

- Indeks na kolumnach `user_id` i `source` w tabeli `flashcards`.
- Ograniczenie `limit` do rozsądnej wartości (np. 100).
- Użycie Supabase count optimization zamiast pobierania wszystkich rekordów.

## 9. Kroki implementacji

1. Definicja Zod schema dla query params (`src/lib/schemas/flashcards.ts`).
2. Uzupełnienie serwisu `FlashcardsService` w `src/lib/flashcards.service.ts`.
3. Stworzenie pliku API: `src/pages/api/flashcards.ts`:
   - `export const prerender = false`
   - `export const GET: APIRoute = async ({ request, locals, url }) => { ... }`
4. Integracja walidacji, autoryzacji i wywołania serwisu.
5. Mapowanie wyników na `FlashcardsListResponseDto`.
6. Dodanie testów unit (Vitest) dla serwisu i handlera.
