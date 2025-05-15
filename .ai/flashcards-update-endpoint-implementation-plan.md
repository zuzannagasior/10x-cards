# API Endpoint Implementation Plan: Update Flashcard

## 1. Przegląd endpointa

Endpoint umożliwia aktualizację istniejącej karty flashcard (pola `front` i `back`). W przypadku kart wygenerowanych przez AI, pole `source` zostanie automatycznie zmienione na `ai-edited`.

## 2. Szczegóły żądania

- Metoda HTTP: PUT
- Struktura URL: `/api/flashcards/:id`
- Parametry:
  - Wymagane:
    - `id` (ścieżka): liczba — identyfikator karty do aktualizacji
  - Opcjonalne: brak
- Request Body (JSON):
  ```json
  {
    "front": "Zaktualizowane pytanie (max 200 znaków)",
    "back": "Zaktualizowana odpowiedź (max 500 znaków)"
  }
  ```
- Wykorzystywane typy:
  - `UpdateFlashcardCommand` (src/types.ts)
  - `FlashcardDto` (src/types.ts)
  - DTO błędów: `{ error: string }`
- Walidacja:
  - `front`: string, wymagane, długość ≤ 200 znaków
  - `back`: string, wymagane, długość ≤ 500 znaków

## 3. Szczegóły odpowiedzi

- Kod statusu: 200 OK
- Treść odpowiedzi (JSON):
  ```json
  {
    "id": 1,
    "front": "Zaktualizowane pytanie",
    "back": "Zaktualizowana odpowiedź",
    "source": "manual" | "ai-edited",
    "generation_id": null | 123,
    "created_at": "2025-05-01T12:00:00Z",
    "updated_at": "2025-05-10T15:30:00Z"
  }
  ```

## 4. Przepływ danych

1. Middleware (`src/middleware/index.ts`) dekoduje JWT i ustawia `locals.user` oraz `locals.supabase`.
2. W punkcie API (`src/pages/api/flashcards/[id].ts`):
   1. Parsowanie parametru `id` z `params.id` → liczba; jeśli `NaN` → 400.
   2. Parsowanie i walidacja body za pomocą Zod; w razie błędów → 400.
   3. Sprawdzenie `locals.user`; jeśli brak → 401.
   4. Pobranie istniejącej karty:
      ```ts
      const { data: existing, error: selectError } = await locals.supabase
        .from("flashcards")
        .select("user_id,source,generation_id")
        .eq("id", id)
        .single();
      ```
      - Brak rekordu (`existing` undefined) → 404.
      - `existing.user_id !== locals.user.id` → 403.
   5. Ustalenie nowej wartości `source`:
      ```ts
      const newSource = existing.source === "ai" ? "ai-edited" : existing.source;
      ```
   6. Aktualizacja rekordu:
      ```ts
      const { data: updated, error: updateError } = await locals.supabase
        .from("flashcards")
        .update({ front, back, source: newSource })
        .eq("id", id)
        .eq("user_id", locals.user.id)
        .select("*")
        .single();
      ```
3. Zwrócenie zaktualizowanego rekordu.

## 5. Względy bezpieczeństwa

- Uwierzytelnianie przez middleware Supabase Auth (JWT).
- Autoryzacja: tylko właściciel karty (`flashcards.user_id === locals.user.id`).
- Walidacja wejścia za pomocą Zod.
- Ochrona przed SQL Injection przez użycie parametrów Supabase SDK.

## 6. Obsługa błędów

| Kod | Warunek                                      | Treść odpowiedzi                          |
| --- | -------------------------------------------- | ----------------------------------------- |
| 400 | Nieprawidłowy `id` lub błędna walidacja body | `{ error: "Invalid request parameters" }` |
| 401 | Brak lub nieważny JWT                        | `{ error: "Unauthorized" }`               |
| 403 | Próba aktualizacji karty innego użytkownika  | `{ error: "Forbidden" }`                  |
| 404 | Nie znaleziono karty o podanym `id`          | `{ error: "Not Found" }`                  |
| 500 | Nieoczekiwany błąd serwera                   | `{ error: "Internal server error" }`      |

## 7. Rozważania dotyczące wydajności

- Indeksy na kolumnach `id` i `user_id` zapewniają szybkie zapytania.

## 8. Kroki implementacji

1. Utworzyć Zod schema w `src/lib/schemas/flashcards.schema.ts`:
   ```ts
   export const updateFlashcardSchema = z.object({
     front: z.string().max(200),
     back: z.string().max(500),
   });
   ```
2. Dodać metodę `updateFlashcard` do serwisu w `src/lib/services/flashcards.service.ts`.
3. Utworzyć lub zaktualizować plik `src/pages/api/flashcards/[id].ts`:
   - Dodać `export const PUT: APIRoute = async ({ request, params, locals }) => { ... }`.
   - Importować Zod schema, typy DTO i serwis.
4. Obsłużyć przypadki błędów i zwracać odpowiednie kody statusu.
5. Napisać testy jednostkowe (Vitest).
