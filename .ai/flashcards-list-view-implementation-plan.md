# Plan implementacji widoku listy fiszek

## 1. Przegląd

Ekran listy fiszek (`/flashcards`) umożliwia zalogowanemu użytkownikowi przeglądanie wszystkich swoich fiszek, filtrowanie według źródła, a także wykonywanie operacji tworzenia nowych fiszek manualnie, edycji istniejących oraz usuwania. Widok powinien być responsywny, dostępny (aria, czytniki) i zapewniać szybkie powiadomienia o wynikach operacji.

## 2. Routing widoku

Ścieżka: `/flashcards`
Zawartość strony dostarczana przez `src/pages/flashcards/index.astro`, która ładuje komponent React `FlashcardsView` z dyrektywą `client:load`.

## 3. Struktura komponentów

- **FlashcardsView** (kontener strony)
  - FlashcardsToolbar
  - FlashcardsTable
    - FlashcardRow
  - FlashcardModal
  - PaginationControls

## 4. Szczegóły komponentów

### FlashcardsView

- Opis: Zarządza stanem listy, paginacją, filtrem, modalem oraz wywołaniami API.
- Elementy: kontener główny, podkomponenty Toolbar, Table, Modal, paginacja.
- Zdarzenia: zmiana strony, zmiana filtra, otwarcie/zamknięcie modalu, wywołanie akcji CRUD.
- Walidacja: parametry paginacji i filtra przekazywane do hooka; formularz waliduje długości pól.
- Typy: `FlashcardsListResponseDto`, `FlashcardDto`, `Source`.
- Powiadomienia: korzystanie z funkcji `toast` z biblioteki sonner (globalnie przez Layout.astro).

### FlashcardsToolbar

- Opis: Pasek akcji (Nowa fiszka, Generuj AI, filtr źródła).
- Elementy: Button "Nowa fiszka", Button "Generuj AI", Select wyboru źródła.
- Zdarzenia:
  - `onCreateClick()` otwiera modal tworzenia.
  - `onGenerateAI()` przekierowuje do `/generate`.
  - `onFilterChange(source: Source)` odświeża listę.
- Walidacja: wartość filtra w zbiorze `manual` | `ai` | `ai-edited`.
- Typy: `Source`.
- Propsy: `currentFilter: Source`, `onCreateClick`, `onGenerateAI`, `onFilterChange`.

### FlashcardsTable

- Opis: Rysuje tabelę z danymi fiszek.
- Elementy: `<table>` z nagłówkami: Front, Back, Źródło, Akcje.
- Zdarzenia: brak.
- Walidacja: brak.
- Typy: `FlashcardViewModel` (lub `FlashcardDto`).
- Propsy: `data: FlashcardViewModel[]`, `onEdit(id)`, `onDelete(id)`.

### FlashcardRow

- Opis: Jeden wiersz z informacjami o fiszce i przyciskami akcji.
- Elementy: komórki z przyciętym frontem/backiem, Badge ze źródłem, przyciski Edit/Delete.
- Zdarzenia:
  - `onEdit(id)`
  - `onDelete(id)`
- Walidacja: brak.
- Typy: `FlashcardViewModel`.
- Propsy: `flashcard`, `onEdit`, `onDelete`.

### FlashcardModal

- Opis: Modal do tworzenia lub edycji fiszki.
- Elementy: Input front, Textarea back, Button Zapamiętaj, Button Anuluj.
- Zdarzenia:
  - `onSubmit(data: {front:string;back:string})`
  - `onClose()`
- Walidacja:
  - `front` required, max 200 znaków
  - `back` required, max 500 znaków
- Typy: `CreateFlashcardsRequestDto`, `UpdateFlashcardCommand`.
- Propsy: `isOpen: boolean`, `mode: 'create'|'edit'`, `initialData?: FlashcardDto`, `onSubmit`, `onClose`.

### PaginationControls

- Opis: Nawigacja stronami.
- Elementy: przycisk Poprzednia, Numer strony, przycisk Następna.
- Zdarzenia: `onPageChange(page: number)`
- Walidacja: `1 <= page <= totalPages`.
- Typy: `PaginationDto`.
- Propsy: `pagination: PaginationDto`, `onPageChange`.

## 5. Typy

- **FlashcardDto**: `id`, `front`, `back`, `source`, `generation_id`, `created_at`, `updated_at`
- **FlashcardsListResponseDto**: `data: FlashcardDto[]`, `pagination: PaginationDto`
- **CreateFlashcardsRequestDto**: `flashcards: CreateFlashcardCommand[]`
- **UpdateFlashcardCommand**: `front`, `back`
- **PaginationDto**: `page`, `totalPages`, `totalItems`
- **FlashcardViewModel**: rozszerza `FlashcardDto`, ewentualnie dodatkowe pola pomocnicze (np. `previewFront`, `previewBack`).
- **Source**: `'manual' | 'ai' | 'ai-edited'`

## 6. Zarządzanie stanem

- `const [flashcards, setFlashcards] = useState<FlashcardViewModel[]>([])`
- `const [pagination, setPagination] = useState<PaginationDto>({page:1,totalPages:1,totalItems:0})`
- `const [filter, setFilter] = useState<Source>('manual')`
- `const [isLoading, setIsLoading] = useState<boolean>(false)`
- `const [modalOpen, setModalOpen] = useState<boolean>(false)`
- `const [modalMode, setModalMode] = useState<'create'|'edit'>('create')`
- `const [selectedCard, setSelectedCard] = useState<FlashcardDto|undefined>()`
- **Hook**: `useFlashcards({page,limit,filter})` do GET i odświeżania
- **Hook**: `useFlashcardsActions()` z metodami `create`, `update`, `delete`, każda wywołuje API i odświeża.

## 7. Integracja API

1. **GET** `/api/flashcards?page={}&limit={}&source={}` → `FlashcardsListResponseDto`
2. **POST** `/api/flashcards` z payload `{ flashcards: [{ front, back, source:'manual' }] }` → `201 Created`
3. **PUT** `/api/flashcards/:id` z payload `{ front, back }` → `200 OK`
4. **DELETE** `/api/flashcards/:id` → `204 No Content`

Implementacja przez `fetch` lub `axios` w hookach.

## 8. Interakcje użytkownika

1. Klik "Nowa fiszka" → otwarcie `FlashcardModal` (tryb create).
2. Wypełnienie formularza → walidacja → wywołanie POST → sukces: toast, zamknięcie modalu, odświeżenie listy.
3. Klik "Edytuj" obok wiersza → otwarcie modalu (tryb edit, wstępne dane).
4. Modyfikacja → PUT → toast, zamknięcie, refresh.
5. Klik "Usuń" → potwierdzenie (`confirm`) → DELETE → toast, refresh.
6. Zmiana filtra → GET z parametrem source.
7. Nawigacja paginacją → GET z nową stroną.
8. Klik "Generuj AI" → przekierowanie.

## 9. Warunki i walidacja

- `front`: niepuste, max 200 znaków
- `back`: niepuste, max 500 znaków
- parametr `page`: >=1
- parametr `limit`: >=1
- `filter` musi być jedną z dozwolonych wartości

## 10. Obsługa błędów

- Formularz: wyświetlanie komunikatów inline przy niepoprawnej długości
- API 400: parsowanie `details` i pokazanie w formie toast lub pola
- API 401: przekierowanie do logowania
- API 403: toast "Brak dostępu"
- API 500+: toast "Wystąpił błąd, spróbuj ponownie później"

## 11. Kroki implementacji

1. Utworzyć `src/pages/flashcards/index.astro` z importem `FlashcardsView` (`client:load`).
2. W `src/components/Flashcards/FlashcardsView.tsx` zaimplementować logikę hooków i stan.
3. Stworzyć `FlashcardsToolbar.tsx` w `src/components/Flashcards/`.
4. Stworzyć `FlashcardsTable.tsx` i `FlashcardRow.tsx`.
5. Stworzyć `FlashcardModal.tsx` i formularz z walidacją.
6. Stworzyć `PaginationControls.tsx`.
7. Napisać hooki `useFlashcards` oraz `useFlashcardsActions` w `src/hooks/`.
8. Użyć interfejsu `toast` z biblioteki sonner w `FlashcardsView` do wyświetlania powiadomień.
9. Dodać style Tailwind i komponenty Shadcn/ui dla spójnego wyglądu.
10. Przetestować scenariusze: tworzenie, edycja, usuwanie, paginacja, filtry.
11. Dodać testy jednostkowe dla każdego komponentu oraz integracyjne dla hooków.
12. (Opcjonalnie) Dodać testy E2E w Playwright dla pełnego przepływu użytkownika.
