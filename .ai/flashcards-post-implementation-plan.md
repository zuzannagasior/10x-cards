# API Endpoint Implementation Plan: Create Flashcards

## 1. Przegląd punktu końcowego

Endpoint służy do tworzenia jednego lub wielu flashcards. Obsługuje zarówno ręczne tworzenie, jak i fiszki generowane przez AI. Endpoint przyjmuje dane wejściowe, waliduje je zgodnie z wymaganiami (np. długość tekstu, poprawny typ źródła), a następnie zapisuje rekord w tabeli `flashcards` w bazie danych Supabase.

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **Struktura URL:** /flashcards
- **Parametry / Request Body:**
  - Struktura:
    ```json
    {
      "flashcards": [
        {
          "front": "Question text (max 200 characters)",
          "back": "Answer text (max 500 characters)",
          "source": "manual" | "ai" | "ai-edited",
          "generation_id": "optional, required for ai/ai-edited sources"
        }
      ]
    }
    ```
  - **Wymagane pola:**
    - `front` (string, max 200 znaków)
    - `back` (string, max 500 znaków)
    - `source` (wartość: "manual", "ai", lub "ai-edited")
  - **Opcjonalne pole:**
    - `generation_id` (wymagane, jeśli `source` jest "ai" lub "ai-edited")

## 3. Wykorzystywane typy

- **DTO i Command Modele:**
  - `CreateFlashcardCommand` – reprezentuje pojedynczą kartę, z rozróżnieniem na typ manual lub AI (z wymogiem `generation_id` dla AI).
  - `CreateFlashcardsRequestDto` – zawiera tablicę flashcards do utworzenia.
  - `FlashcardDto` – struktura zwracana w odpowiedzi, zawiera pola takie jak `id`, `front`, `back`, `source`, `generation_id`, `created_at`, `updated_at`.

## 4. Szczegóły odpowiedzi

- **Kod statusu przy powodzeniu:** 201 Created
- **Struktura odpowiedzi:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "front": "Question text",
        "back": "Answer text",
        "source": "manual",
        "generation_id": null,
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
      // ... kolejne rekordy
    ]
  }
  ```
- **Błędy:**
  - 400 Bad Request – walidacja nie powiodła się (np. przekroczenie limitu znaków, brak wymaganych pól)
  - 401 Unauthorized – brak lub nieważny JWT
  - 500 Internal Server Error – nieoczekiwany błąd serwera

## 5. Przepływ danych

1. Żądanie przychodzi z danymi wejściowymi zawartymi w ciele żądania.
2. Middleware autoryzacyjne sprawdza poprawność tokenu JWT, uzyskując dostęp do użytkownika.
3. Warstwa kontrolera/endpointu przekazuje żądanie do odpowiedniej warstwy serwisowej.
4. Serwis waliduje dane wejściowe (np. długość pól, obecność `generation_id` dla AI) przy użyciu narzędzi takich jak Zod.
5. Serwis wykonuje operację zapisu w bazie (Supabase), korzystając z przygotowanych zapytań lub ORM.
6. Po udanym utworzeniu, serwis zwraca zapisane rekordy flashcards z przypisanymi identyfikatorami i znacznikami czasowymi.
7. Kontroler formatuje odpowiedź i zwraca ją klientowi.

## 6. Względy bezpieczeństwa

- Autoryzacja: Endpoint wymaga poprawnego tokenu JWT; sprawdzenie odbywa się poprzez middleware.
- Walidacja wejścia: Wszystkie dane wejściowe są walidowane pod kątem długości i typów, aby zabezpieczyć przed SQL Injection oraz innymi atakami.
- Połączenie HTTPS: Wszystkie żądania muszą być przesyłane przez bezpieczne połączenie HTTPS.
- Obsługa błędów: Szczegółowe logowanie błędów przy nieprawidłowych danych wejściowych lub błędach po stronie serwera.

## 7. Obsługa błędów

- **Błędy walidacji:** Zwracany kod 400 z opisem błędów (np. "Field 'front' exceeds 200 characters").
- **Błędy autoryzacji:** Zwracany kod 401, gdy token JWT jest nieważny lub niepodany.
- **Błędy serwera:** Zwracany kod 500 w przypadku nieoczekiwanych problemów.

## 8. Rozważania dotyczące wydajności

- Optymalizacja zapytań: Korzystanie z indeksów na kolumnach `user_id` i `generation_id` w tabeli `flashcards`.
- Insercja zbiorcza: W przypadku wielu flashcards zaplanować insercję zbiorczą, aby zminimalizować liczbę zapytań do bazy.

## 9. Etapy wdrożenia

1. **Przygotowanie środowiska i narzędzi:**
   - Upewnić się, że środowisko posiada konfigurację Supabase, autoryzację JWT oraz ustawione zmienne środowiskowe.
2. **Definicja typów i walidacja:**
   - Zaimplementować i zaktualizować typy DTO oraz schematy walidacji z użyciem Zod, zgodnie z `src/types.ts`.
3. **Implementacja logiki serwisowej:**
   - Utworzyć (lub rozszerzyć) serwis odpowiedzialny za tworzenie flashcards, który:
     - Sprawdzi poprawność `generation_id` dla AI flashcards.
     - Wykona insercję zbiorczą w bazie danych.
4. **Implementacja endpointu:**
   - Utworzyć odpowiedni handler dla żądania POST /flashcards, korzystając z wcześniej zaimplementowanej logiki serwisowej i middleware autoryzacyjnym.
