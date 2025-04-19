# API Endpoint Implementation Plan: Generations Endpoint

## 1. Przegląd punktu końcowego

Endpoint POST /generations ma za zadanie inicjować proces generowania propozycji flashcards na podstawie tekstu wejściowego przekazanego przez użytkownika. Endpoint waliduje długość tekstu, tworzy rekord sesji generowania, wyzwala asynchroniczny proces generowania propozycji fiszek za pomocą usługi AI, a następnie zwraca szczegóły sesji wraz z wygenerowanymi propozycjami fiszek.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- URL: /generations
- Parametry:
  - Wymagane:
    - text: string (długość między 1000 a 10000 znaków)
  - Opcjonalne: Brak
- Request Body:
  ```json
  {
    "text": "Input text (required, 1000-10000 characters)"
  }
  ```

## 3. Wykorzystywane typy

- Command Model:
  - `CreateGenerationSessionCommand` (zawiera pole `text`)
- DTO:
  - `CreateGenerationSessionResponseDto` (zawiera `generation_session` oraz `flashcards_proposals`)
  - `GenerationSessionDto`
  - `FlashcardProposalDto`
  <!-- - Inne związane typy:
  - `FlashcardDto`
  - `GenerationSessionErrorLogDto` -->

## 4. Szczegóły odpowiedzi

- Status: 201 Created
- Response Body:
  ```json
  {
    "generation_session": {
      "id": 123,
      "model": "model-identifier",
      "created_at": "timestamp"
    },
    "flashcards_proposals": [
      {
        "front": "Generated question text",
        "back": "Generated answer text"
      }
      // ...
    ]
  }
  ```
- Kody błędów:
  - 400 Bad Request - nieprawidłowa długość tekstu lub brak wymaganych pól
  - 401 Unauthorized - brak lub nieprawidłowy JWT
  - 500 Internal Server Error - nieoczekiwane błędy serwera (zarejestrowane w tabeli `generation_session_error_logs`)

## 5. Przepływ danych

1. Odbiór żądania z polem `text`.
2. Walidacja długości tekstu (musi być między 1000 a 10000 znaków).
3. Weryfikacja autentyczności żądania (sprawdzenie JWT oraz uprawnień użytkownika).
4. Wywołanie procesu generacji propozycji flashcards poprzez dedykowaną usługę `generation.service`.
5. Serwis przekazuje `text` do zewnętrznego serwisu AI w celu wygenerowania fiszek i następnie metadane związane z sesją generowania w tabeli `generation_sessions`:
   - Obliczenie hash'a tekstu wejściowego do pola `source_text_hash`.
   - Ustawienie pola `model` na prawidłowy identyfikator modelu AI,
   - Wypełnienie pola `generated_count`.
6. Zwrócenie odpowiedzi JSON zawierającej szczegóły sesji oraz propozycje flashcards.
7. W przypadku wystąpienia błędu podczas wywoływania AI, rejestrowanie błędy w tabeli `generation_session_error_logs`.

## 6. Względy bezpieczeństwa

- Walidacja autentyczności użytkownika przy pomocy JWT oraz uwierzytelnienia.
- Stosowanie walidacji wejściowej przy użyciu Zod, aby upewnić się, że `text` spełnia wymagane kryteria.
- Użycie przygotowanych zapytań lub ORM w celu ochrony przed SQL Injection.

## 7. Obsługa błędów

- Błąd walidacji (`text` spoza zakresu długości, brak pola `text`): Zwracany status 400 Bad Request.
- Brak autoryzacji (błędny lub brak tokena JWT): Zwracany status 401 Unauthorized.
- Błędy podczas zapisu lub wywołania usługi AI:
  - Rejestrowanie błędu w tabeli `generation_session_error_logs`.
  - Zwracany status 500 Internal Server Error.

## 8. Rozważenia dotyczące wydajności

- Minimalizacja operacji synchronicznych – większość obliczeń (np. generacja propozycji flashcards) odbywa się asynchronicznie.
- Optymalizacja zapytań do bazy danych (indeksy na polach foreign key, takich jak `user_id` i `generation_id`).

## 9. Kroki implementacji

1. Utworzenie nowego endpointu `/generations` w katalogu `src/pages/api` lub zgodnie z obowiązującą strukturą Astro API.
2. Implementacja walidacji żądania:
   - Użycie Zod do walidacji pola `text`.
   - Sprawdzenie długości tekstu (1000-10000 znaków).
3. Dodanie mechanizmy uwierzytelniania poprzez Supabase Auth.
4. Wywołanie asynchronicznej usługi generacji flashcards:
   - Implementacja serwisu `generation.service` odpowiedzialnej za interakcję z AI. Serwis będzie się łączył z zewnętrzym serwisem AI. Na etapie developmentu skorzystamy z mocków zamiast wywoływania serwisu AI.
5. Utworzenie i zapis rekordu sesji generacji w bazie danych:
   - Obliczenie hashu dla `source_text_hash`.
   - Ustawienie odpowiednich pól (np. `model`, `user_id`, `generation_count`).
6. Rejestrowanie błędów w tabeli `generation_session_error_logs` w przypadku niepowodzenia jakiegokolwiek z kroków.
7. Zwrot odpowiedzi:
   - Przy pomyślnym wykonaniu operacji, zwrócenie 201 Created wraz z wygenerowanym obiektem JSON.
