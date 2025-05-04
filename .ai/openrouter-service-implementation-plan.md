# Przewodnik implementacji usługi OpenRouterService

## 1. Opis usługi

- Warstwa komunikacji z API OpenRouter, umożliwiająca wysyłanie żądań czatowych opartych na LLM oraz odbiór ustrukturyzowanych odpowiedzi.
- Abstrakcja nad HTTP: zarządzanie autoryzacją, ustawianie komunikatów (system, użytkownika), obsługą parametrów modelu i walidacją odpowiedzi.

## 2. Opis konstruktora

Konstruktor `OpenRouterService(config: OpenRouterConfig)` przyjmuje obiekt konfiguracji:

- `apiKey: string` – klucz dostępu do OpenRouter (wymagane).
- `baseUrl?: string` – adres endpointu API (domyślnie `https://api.openrouter.ai/v1`).
- `defaultModel?: string` – nazwa domyślnego modelu (np. `gpt-4-openrouter`).
- `defaultParams?: ModelParams` – domyślne parametry modelu (np. `{ temperature: 0.7, max_tokens: 1024 }`).

Wersje weryfikują obecność `apiKey` i rzucają błąd przy jego braku (guard clause).

## 3. Publiczne metody i pola

- `sendChat(message: string): Promise<ChatResponse>`
  - Wysyła pojedynczą wiadomość użytkownika do API, zwracając ustrukturyzowaną odpowiedź.
- `setApiKey(key: string): void`
  - Aktualizuje `apiKey` w czasie działania aplikacji.
- `setSystemMessage(message: string): void`
  - Ustawia domyślny komunikat systemowy wykorzystywany w metodzie `sendChat`.
- `setUserMessage(message: string): void`
  - Ustawia domyślny komunikat użytkownika wykorzystywany w metodzie `sendChat`.
- `setModel(model: string, parameters?: ModelParams): void`
  - Ustawia nazwę modelu i parametry wykorzystywane w metodzie `sendChat`.
- `setResponseFormat(format: ResponseFormat): void`
  - Ustawia format odpowiedzi (schemat JSON) dla ustrukturyzowanych odpowiedzi.

## 4. Prywatne metody i pola

- `defaultModel: string`
  - Przechowuje domyślną nazwę modelu.
- `defaultParams: ModelParams`
  - Przechowuje domyślne parametry modelu.
- `systemMessage: string`
  - Przechowuje domyślny komunikat systemowy.
- `userMessage: string`
  - Przechowuje domyślny komunikat użytkownika.
- `responseFormat: ResponseFormat`
  - Przechowuje konfigurację schematu JSON dla odpowiedzi.
- `buildPayload(message: string)`  
  Tworzy obiekt żądania:

  - `messages`: tablica z dwoma obiektami:
    1. `{ role: 'system', content: this.systemMessage }`
    2. `{ role: 'user', content: message }`
  - `model`: this.defaultModel
  - `parameters`: this.defaultParams
  - `response_format`: this.responseFormat

- `validateResponse(data: any)`  
  Waliduje odpowiedź przy użyciu biblioteki JSON Schema (np. AJV).

- `handleError(error: any)`  
  Normalizuje błędy HTTP i biznesowe do ujednoliconego typu `ServiceError`.

## 5. Obsługa błędów

1. Nieautoryzowany dostęp (HTTP 401)
   - Rzucenie `AuthenticationError`.
2. Przekroczenie limitu żądań (HTTP 429)
   - Rzucenie `RateLimitError` z możliwością retry po określonym czasie.
3. Błąd sieci (timeout, DNS)
   - Rzucenie `NetworkError` z logiką retry.
4. Nieprawidłowy format odpowiedzi (parse error)
   - Rzucenie `ResponseFormatError`.
5. Błędy serwera (HTTP 5xx)
   - Rzucenie `ServerError` oraz logowanie szczegółów.

Dla każdego scenariusza stosować wczesny zwrot (guard clause) i przejrzyste komunikaty błędów.

## 6. Kwestie bezpieczeństwa

- Przechowywanie kluczy (`apiKey`) wyłącznie w zmiennych środowiskowych (`.env`).
- Maskowanie wrażliwych danych w logach – nigdy nie logować pełnego `apiKey`.
- Wymuszanie HTTPS (TLS) dla wszystkich połączeń.
- Ograniczanie dostępu do endpointów serwisu przy pomocy mechanizmów autoryzacji wewnętrznej (jeśli dotyczy).

## 7. Plan wdrożenia krok po kroku

1. Utworzenie pliku `src/lib/OpenRouterService.ts` i deklaracja klasy `OpenRouterService`.
2. Implementacja konstruktora:
   - Weryfikacja `apiKey`.
   - Przypisanie pól konfiguracyjnych: `apiKey`, `baseUrl`
3. Implementacja prywatnych metod:
   - `buildPayload(message: string)` (budowa obiektu żądania z komunikatami).
   - `validateResponse` (walidacja JSON Schema).
   - `handleError` (normalizacja błędów).
4. Implementacja publicznych metod setter:
   - `setApiKey(key: string)` – aktualizacja klucza.
   - `setSystemMessage(message: string)` – ustawienie komunikatu systemowego.
   - `setUserMessage(message: string)` – ustawienie komunikatu użytkownika.
   - `setModel(model: string, parameters?: ModelParams)` – ustawienie modelu i parametrów.
   - `setResponseFormat(format: ResponseFormat)` – konfiguracja schematu JSON dla odpowiedzi.
5. Implementacja metody `sendChat`:
   - Przyjmuje pojedynczy parametr `message: string`.
   - Buduje payload wywołując `buildPayload(message)`:
     1. Dodaje komunikat systemowy z `this.systemMessage`.
     2. Dodaje komunikat użytkownika z przekazanego `message`.
     3. Ustawia `model` i `parameters` z `this.defaultModel` i `this.defaultParams`.
     4. Ustawia `response_format` z `this.responseFormat`.
   - Wysyła żądanie przy pomocy globalnej funkcji `fetch`, ustawiając nagłówki:
     - `Authorization: Bearer <this.apiKey>`
     - `Content-Type: application/json`
   - Parsuje odpowiedź i wywołuje `validateResponse` lub `handleError` w razie błędu.
