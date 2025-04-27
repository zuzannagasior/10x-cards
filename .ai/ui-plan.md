# Architektura UI dla 10xCards

## 1. Przegląd struktury UI

Aplikacja 10xCards opiera się na minimalistycznym, responsywnym interfejsie użytkownika. Interfejs skupia się na efektywnym procesie tworzenia i zarządzania fiszkami, zarówno generowanymi przez AI, jak i tworzonymi manualnie. Kluczowe aspekty to dostępność, bezpieczeństwo (autoryzacja z użyciem JWT) oraz responsywność, wspierana przez Tailwind CSS i komponenty Shadcn/ui.

## 2. Lista widoków

### Ekran generowania fiszek AI

- **Ścieżka widoku:** /generate
- **Główny cel:** Umożliwienie użytkownikowi wprowadzenia tekstu (1000-10000 znaków), generowania propozycji fiszek przez AI oraz przeglądu i recenzji wygenerowanych fiszek.
- **Kluczowe informacje:** Instrukcje dotyczące generowania, pole tekstowe do wprowadzenia danych, lista propozycji fiszek wraz z polami "przód" i "tył", komunikaty walidacyjne i błędy.
- **Kluczowe komponenty widoku:** Pole tekstowe, lista fiszek (komponent karty fiszki), przyciski akcji (zatwierdź, edytuj, usuń), przyciski globalne ("Zapisz wszystkie", "Zapisz zatwierdzone"), system powiadomień (toast).
- **UX, dostępność i bezpieczeństwo:** Walidacja po stronie klienta, obsługa inline błędów, responsywność, wsparcie dla klawiatury oraz czytelne komunikaty dla błędów API.

### Ekran listy fiszek

- **Ścieżka widoku:** /flashcards
- **Główny cel:** Prezentacja wszystkich fiszek użytkownika z możliwością edycji, usuwania oraz tworzenia nowych fiszek manualnie.
- **Kluczowe informacje:** Lista zapisanych fiszek z oznaczeniem źródła (manual, ai, ai-edited), przyciski edycji i usuwania, przycisk inicjujący modal do manualnego dodawania fiszek, przycisk przekierowujący do ekranu generowania AI.
- **Kluczowe komponenty widoku:** Tabela/lista fiszek, komponent modal (dla tworzenia/edycji), przyciski akcji, system powiadomień (toast).
- **UX, dostępność i bezpieczeństwo:** Responsywna lista, przejrzyste etykiety, wsparcie dla czytników ekranu i kontekstowe komunikaty błędów.

### Ekran profilu użytkownika

- **Ścieżka widoku:** /profile
- **Główny cel:** Wyświetlenie informacji o koncie użytkownika oraz umożliwienie zarządzania kontem (edytowanie danych, wylogowanie).
- **Kluczowe informacje:** Dane konta (nazwa, email), przyciski zarządzania kontem (edytuj, wyloguj).
- **Kluczowe komponenty widoku:** Karta profilu, formularz edycji, przyciski akcji, menu nawigacji w obrębie profilu.
- **UX, dostępność i bezpieczeństwo:** Autoryzacja oparte na JWT, ochrona danych, intuicyjny i przejrzysty układ, zgodność z WCAG AA.

### Ekrany logowania i rejestracji

- **Ścieżka widoku:** /login oraz /sign-up
- **Główny cel:** Umożliwienie użytkownikom logowania się do systemu oraz zakładania nowego konta.
- **Kluczowe informacje:** Formularze z polami (email, hasło), komunikaty walidacyjne, linki do odzyskiwania hasła oraz rejestracji.
- **Kluczowe komponenty widoku:** Formularz logowania/rejestracji, przyciski akcji, system powiadomień (toast) dla komunikatów sukcesu/błędu.
- **UX, dostępność i bezpieczeństwo:** Silna walidacja, łatwość nawigacji, czytelne etykiety i pomoc kontekstowa, zabezpieczenia przed atakami (np. brute force) oraz stosowanie autoryzacji opartej na JWT.

### Ekran sesji powtórek

- **Ścieżka widoku:** /learning
- **Główny cel:** Umożliwienie użytkownikowi nauki poprzez sesję powtórek według ustalonego algorytmu (spaced repetition).
- **Kluczowe informacje:** Prezentacja fiszek (przód i tył), przyciski do odkrywania odpowiedzi, oceny przyswojenia fiszki oraz interfejs do przechodzenia między fiszkami.
- **Kluczowe komponenty widoku:** Komponent prezentacji fiszki, przyciski interakcji (np. "Pokaż odpowiedź", przyciski oceny), pasek postępu, system powiadomień (toast) dla komunikatów o błędach.
- **UX, dostępność i bezpieczeństwo:** Intuicyjne sterowanie, minimalistyczny design, responsywność, zgodność z WCAG AA oraz zabezpieczenia przed przypadkowymi kliknięciami.

## 3. Mapa podróży użytkownika

1. Użytkownik loguje się lub rejestruje na platformie (widoki logowania/rejestracji).
2. Po autoryzacji, użytkownik trafia na ekran generowania fiszek AI, który jest widokiem domyślnym po zalogowaniu.
3. Użytkownik wprowadza tekst do pola generowania, gdzie po zatwierdzeniu system przeprowadza walidację i wywołuje API do utworzenia sesji generowania fiszek.
4. Użytkownik przegląda wygenerowane fiszki, korzysta z przycisków zatwierdź, edytuj lub usuń, a także używa przycisków globalnych do zapisania wszystkich lub zatwierdzonych fiszek.
5. Z menu nawigacyjnego użytkownik przechodzi do ekranu listy fiszek, gdzie może zobaczyć zapisane fiszki, edytować lub usuwać je oraz dodać nowe fiszki manualnie.
6. Użytkownik może w każdej chwili przejść do ekranu profilu, aby sprawdzić informacje o koncie lub się wylogować.
7. Dodatkowo, użytkownik może rozpocząć sesję powtórek, gdzie przeprowadza naukę fiszek według algorytmu spaced repetition.

## 4. Układ i struktura nawigacji

- Główne menu będzie widoczne na wszystkich ekranach (z wyjątkiem ekranów logowania/rejestracji) i będzie zawierało linki do:
  - Generowanie fiszek AI
  - Lista fiszek
  - Sesja powtórek
  - Profil
- Na urządzeniach mobilnych menu przejdzie w formę hamburger menu, aby zapewnić kompaktowy dostęp do poszczególnych widoków.
- Na ekranach logowania i rejestracji wyświetlane będą tylko formularze logowania/rejestracji bez dodatkowego menu.
- Nawigacja będzie wdrażana przy użyciu mechanizmu React Router lub podobnego rozwiązania, z ochroną tras (route guard) dla widoków dostępnych tylko dla zalogowanych użytkowników (sprawdzanie JWT).

## 5. Kluczowe komponenty

- **Przycisk (Button):** Standardowy przycisk dla wszystkich akcji interfejsu, wspierający różne warianty (primary, secondary, danger).
- **Pole tekstowe (Input):** Komponenty formularzy, używane w polach wprowadzania na ekranach generowania, logowania/rejestracji oraz edycji fiszek.
- **Modal:** Komponent wykorzystywany do edycji i tworzenia nowych fiszek, zapewniający łatwy dostęp do formularzy bez opuszczania widoku listy fiszek.
- **Toast Notifications:** System powiadomień wykorzystywany do informowania o sukcesach, błędach oraz komunikatach walidacyjnych.
- **Nawigacja (Navigation Bar):** Komponent odpowiedzialny za wyświetlanie głównego menu, zarówno w wersji desktopowej, jak i mobilnej (hamburger menu).
- **Flashcard Card:** Komponent reprezentujący pojedynczą fiszkę w liście, zawierający akcje takie jak edycja, zatwierdzenie i usunięcie.
