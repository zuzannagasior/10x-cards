# Plan implementacji widoku Generowanie Fiszek AI

## 1. Przegląd

Widok umożliwia użytkownikowi wygenerowanie fiszek przy użyciu sztucznej inteligencji na podstawie wprowadzonego tekstu. Użytkownik wkleja tekst (1000-10000 znaków), inicjuje proces generowania, a system zwraca propozycje fiszek do recenzji: edycji, zatwierdzenia lub odrzucenia. Widok zapewnia również walidację wejścia, obsługę błędów i informowanie użytkownika o statusie operacji.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką: `/generate`.

## 3. Struktura komponentów

Hierarchia głównych komponentów:

- **GenerateView** (strona główna widoku)
  - **TextInput** (pole tekstowe do wprowadzania tekstu i walidacji długości)
  - **GenerateButton** (przycisk inicjujący proces generowania fiszek)
  - **ValidationMessage** (komunikaty walidacyjne dla pola tekstowego)
  - **FlashcardsList** (lista wyświetlająca wygenerowane propozycje fiszek)
    - **FlashcardListItem** (pojedyncza karta fiszki z przyciskami akcji)
  - **SkeletonLoader** (komponent wskaźnika ładowania, wyświetlany podczas oczekiwania na odpowiedź z API)
  - **GlobalActions** (przyciski "Zapisz wszystkie" oraz "Zapisz zatwierdzone")
  - **EditModal** (modal do edycji wybranej fiszki)
  - **ToastNotifications** (system powiadomień informujących o sukcesach lub błędach)

## 4. Szczegóły komponentów

### GenerateView

- **Opis:** Główny komponent strony zarządzający stanem widoku oraz integrujący wszystkie podkomponenty.
- **Elementy:** Formularz z polem tekstowym, przycisk do generowania fiszek, komponent listy fiszek.
- **Obsługiwane interakcje:** Przesłanie formularza, wywołanie API, aktualizacja stanu listy fiszek.
- **Warunki walidacji:** Tekst musi zawierać 1000-10000 znaków.
- **Typy:** Użycie `CreateGenerationSessionCommand` przy wywołaniu API oraz `CreateGenerationSessionResponseDto` przy odbiorze wyników.
- **Propsy:** Brak – komponent zarządza stanem lokalnym strony.

### TextInput

- **Opis:** Komponent wejściowy dla tekstu, w którym użytkownik wkleja dane do generowania fiszek.
- **Elementy:** Element `<textarea>`, etykieta, komunikaty błędów walidacji.
- **Obsługiwane interakcje:** onChange, onBlur (walidacja poprawności tekstu).
- **Warunki walidacji:** Minimalna długość 1000 znaków, maksymalna 10000 znaków.
- **Typy:** Przechowuje wartość jako string.
- **Propsy:** `value`, `onChange`, `errorMessage`.

### FlashcardsList

- **Opis:** Komponent wyświetlający listę propozycji fiszek wygenerowanych przez AI.
- **Elementy:** Dynamiczna lista elementów typu **FlashcardListItem**.
- **Obsługiwane interakcje:** Kliknięcia przycisków akcji w poszczególnych kartach (zatwierdź, edytuj, odrzuć).
- **Warunki walidacji:** Aktualizacja stanu fiszek, brak dodatkowej walidacji na poziomie listy.
- **Typy:** Tablica obiektów typu `FlashcardViewModel` z dodatkowymi flagami accepted oraz edited
- **Propsy:** `flashcards` (lista fiszek), `onEdit`, `onReject`, `onAccept`.

### FlashcardListItem

- **Opis:** Pojedyncza karta fiszki prezentująca treść "przód" i "tył" oraz akcje do jej obsługi.
- **Elementy:** Wyświetlanie tekstu, przyciski do zatwierdzania, edycji (otwieranie modala), odrzucania.
- **Obsługiwane interakcje:** Kliknięcie przycisków wywołujących odpowiednie akcje (approve, edit, reject).
- **Warunki walidacji:** Długość tekstu: front max 200 znaków, back max 500 znaków (szczególnie podczas edycji).
- **Typy:** `FlashcardViewModel` (rozszerzony model zawierający pola: front, back, source, generation_id oraz flagi accepted i edited).
- **Propsy:** `flashcard`, `onAccept`, `onEdit`, `onReject`.

### SkeletonLoader

- **Opis:** Komponent wskaźnika ładowania, wyświetlany podczas oczekiwania na odpowiedź z API. Zapewnia graficzny placeholder dla dynamicznie ładowanej zawartości.
- **Elementy:** Szkieletowy kontener z animacją (np. gradient lub pulsacja) zastępujący miejsce docelowej zawartości.
- **Obsługiwane interakcje:** Brak interakcji; komponent pełni wyłącznie rolę wizualną, informując użytkownika o stanie ładowania.
- **Warunki walidacji:** Komponent pojawia się, gdy trwa operacja API (np. pobieranie danych) i automatycznie znika po zakończeniu operacji lub pojawieniu się błędu.
- **Typy:** Nie dotyczy.
- **Propsy:** Brak.

### GlobalActions

- **Opis:** Komponent zawierający przyciski globalne umożliwiające zapis zatwierdzonych fiszek lub zapis wszystkich fiszek przy użyciu endpointu `/flashcards`.
- **Elementy:** Dwa przyciski: "Zapisz wszystkie" oraz "Zapisz zatwierdzone".
- **Obsługiwane interakcje:** onClick, wywołania API dla zapisu fiszek.
- **Warunki walidacji:** Fiszki muszą spełniać warunki walidacji (max długość pól, obecność wymaganych danych dla fiszek AI).
- **Typy:** Brak specyficznych typów, typy przekazywane z listy fiszek.
- **Propsy:** Callbacki do obsługi akcji zapisu.

### EditModal

- **Opis:** Modal służący do edycji wybranej fiszki.
- **Elementy:** Pola edycyjne dla "przód" i "tył", przyciski zatwierdzające zmiany, przycisk zamknięcia modala.
- **Obsługiwane interakcje:** onChange, onSubmit, onClose.
- **Warunki walidacji:** Front do 200 znaków, back do 500 znaków; weryfikacja poprawności po edycji.
- **Typy:** Edytowany model typu `FlashcardViewModel`.
- **Propsy:** `isOpen`, `flashcard`, `onSubmit`, `onClose`.

### ToastNotifications

- **Opis:** System powiadomień informujący użytkownika o sukcesach oraz błędach podczas interakcji z widokiem.
- **Elementy:** Dynamiczna lista komunikatów typu toast.
- **Obsługiwane interakcje:** Automatyczne pojawianie się oraz zamykanie komunikatów.
- **Typy:** Model powiadomienia (np. `ToastModel` z polami: id, type, message).

### GenerateButton

- **Opis:** Komponent przycisku inicjującego proces generowania fiszek.
- **Elementy:** Standardowy element HTML `<button>`, wyświetlający tekst (np. "Generuj fiszki") oraz wskaźnik ładowania (spinner) podczas oczekiwania na wynik API.
- **Obsługiwane interakcje:** Obsługuje event onClick, który wywołuje funkcję inicjującą wywołanie API do generacji fiszek.
- **Warunki walidacji:** Przycisk jest aktywny tylko wtedy, gdy tekst wejściowy jest poprawny (długość między 1000 a 10000 znaków) oraz gdy nie trwa operacja API.
- **Typy:** Propsy: `disabled: boolean`, `onClick: () => void`, `isLoading?: boolean`.
- **Propsy:** disabled, onClick, isLoading .

### ValidationMessage

- **Opis:** Komponent wyświetlający komunikaty walidacyjne związane z polem tekstowym.
- **Elementy:** Element tekstowy (np. `<div>` lub `<span>`) z odpowiednimi stylami (np. czerwona czcionka) prezentujący komunikat błędu.
- **Obsługiwane interakcje:** Brak interakcji, wyłącznie prezentacja komunikatów.
- **Warunki walidacji:** Wyświetla komunikaty, gdy pole tekstowe nie spełnia wymagań (np. tekst jest za krótki lub za długi).
- **Typy:** Oczekuje wartość typu string reprezentującą komunikat błędu.
- **Propsy:** { message: string }.

## 5. Typy

- **CreateGenerationSessionCommand**: { text: string }.
- **CreateGenerationSessionResponseDto**: { generation_session: { id, user_id, model, source_text_length, created_at }, flashcards_proposals: FlashcardProposalDto[] }.
- **FlashcardProposalDto**: { id, front, back, source, generation_id, created_at, updated_at }.
- **FlashcardViewModel**: Rozszerzony model fiszki zawierający:
  - front: string
  - back: string
  - source: string
  - generation_id: number
  - accepted: boolean
  - edited: boolean

## 6. Zarządzanie stanem

- Użycie hooków React (useState, useEffect) do zarządzania stanem:
  - Stan tekstu wejściowego i komunikatów walidacyjnych.
  - Stan listy propozycji fiszek (tablica obiektów FlashcardViewModel).
  - Stan modala edycji (czy otwarty, aktualnie edytowana fiszka).
  - Ewentualne użycie customowych hooków do walidacji tekstu i zarządzania powiadomieniami.

## 7. Integracja API

- **Endpoint `/generations` (POST):**
  - Żądanie: Payload typu { text: string }.
  - Odpowiedź: JSON zawierający generation_session oraz listę flashcards_proposals.
  - Wykorzystanie przy kliknięciu przycisku "Generuj".
- **Endpoint `/flashcards` (POST):**
  - Żądanie: Payload zawierający tablicę fiszek typu CreateFlashcardCommand.
  - Warunki: Front max 200 znaków, back max 500 znaków; generation_id wymagany dla fiszek AI.
  - Wykorzystanie przy zatwierdzaniu lub zbiorowym zapisie fiszek.

## 8. Interakcje użytkownika

- Wprowadzenie tekstu w polu TextInput z walidacją w czasie rzeczywistym.
- Kliknięcie przycisku "Generuj" powodujące wywołanie API i wyświetlenie listy fiszek.
- Przegląd fiszek w FlashcardsList z możliwością zatwierdzania, odrzucania i edycji (przez EditModal).
- Kliknięcie przycisków GlobalActions ("Zapisz wszystkie"/"Zapisz zatwierdzone") wysyłające zbiorcze dane do API.
- Powiadomienia (ToastNotifications) informujące o sukcesie operacji lub wystąpieniu błędu.

## 9. Warunki i walidacja

- Tekst wejściowy musi mieć długość między 1000 a 10000 znaków.
- Podczas edycji fiszki, pole front nie powinno przekraczać 200 znaków, a pole back 500 znaków.
- Przed wysłaniem danych do API należy upewnić się, że wszystkie wymagane pola są poprawnie wypełnione (np. generation_id musi być obecny dla fiszek generowanych przez AI).
- Walidacja odbywa się zarówno na poziomie komponentu (inline) jak i przed wysłaniem żądania do API.

## 10. Obsługa błędów

- Błędy walidacyjne wprowadzane w polu tekstowym wyświetlane inline oraz przez ToastNotifications.
- Błędy odpowiedzi API (400, 500) obsługiwane przez wyświetlenie komunikatów toast i ewentualne dezaktywowanie przycisków podczas przetwarzania.
- Obsługa błędów sieciowych (timeout, brak internetu) z odpowiednim informowaniem użytkownika.
- Blokowanie wielokrotnych żądań podczas oczekiwania na odpowiedź z API.

## 11. Kroki implementacji

1. Utworzenie nowej strony w `/generate` w ramach projektu Astro.
2. Stworzenie głównego komponentu `GenerateView` oraz umieszczenie go w odpowiedniej lokalizacji (np. `src/pages/generate.astro` lub komponent React w `src/components`).
3. Implementacja komponentu `TextInput` z walidacją długości tekstu oraz wyświetlaniem komunikatów walidacyjnych.
4. Integracja wywołania API do endpointu `/generations` przy kliknięciu przycisku generowania, obsługa odpowiedzi i aktualizacja stanu listy fiszek.
5. Stworzenie komponentu `FlashcardsList` oraz `FlashcardListItem` umożliwiających przegląd i zarządzanie poszczególnymi fiszkami.
6. Implementacja komponentu `GlobalActions` umożliwiającego zapis zatwierdzonych fiszek lub zapis wszystkich fiszek przy użyciu endpointu `/flashcards`.
7. Dodanie komponentu `EditModal` do edycji wybranej fiszki oraz walidacji edycji.
8. Implementacja systemu powiadomień (`ToastNotifications`) dla informowania użytkownika o sukcesach i błędach.
9. Testowanie wszystkich interakcji, walidacji oraz obsługi błędów.
10. Refaktoryzacja kodu, optymalizacja doświadczenia użytkownika oraz implementacja poprawek zgodnie z feedbackiem.
