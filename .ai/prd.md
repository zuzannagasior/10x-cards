# Dokument wymagań produktu (PRD) - 10xCards

## 1. Przegląd produktu

Przedmiotem projektu 10xCards jest aplikacja webowa umożliwiająca szybkie tworzenie fiszek edukacyjnych, przeznaczonych do nauki metodą spaced repetition. Aplikacja oferuje dwie ścieżki tworzenia fiszek: generowanie przez AI oraz manualne tworzenie. Użytkownik ma możliwość przeglądania, edycji oraz usuwania fiszek, a także zarządzania swoim kontem (rejestracja, logowanie, edycja hasła, usunięcie konta).

## 2. Problem użytkownika

Manualne tworzenie wysokiej jakości fiszek jest czasochłonne, co zniechęca do korzystania z efektywnej metody nauki spaced repetition. Użytkownicy potrzebują szybkiego i intuicyjnego sposobu na generowanie fiszek, aby skupić się na nauce, a nie na długotrwałym tworzeniu materiałów edukacyjnych.

## 3. Wymagania funkcjonalne

1. Generowanie fiszek przez AI: Użytkownik wprowadza tekst (1000–10000 znaków) i generuje automatycznie fiszki w formacie "przód" i "tył". System waliduje długość tekstu i wyświetla komunikat błędu, jeśli warunki nie są spełnione.
2. Manualne tworzenie fiszek: Użytkownik może ręcznie tworzyć fiszki, wypełniając pola "przód" i "tył".
3. Recenzja fiszek wygenerowanych przez AI: Użytkownik przegląda listę wygenerowanych fiszek, z możliwością edycji (w oknie modalnym), zatwierdzenia lub odrzucenia każdej fiszki. Zaakceptowane fiszki są zapisywane do bazy danych. Oprócz tego zapisywana jest liczba wygenerowanych fiszek oraz liczba odrzuconych fiszek przez użytkownika.
4. Edycja fiszek: Edycja odbywa się w oknie modalnym, umożliwiając zmianę treści "przodu" i "tyłu".
5. Usuwanie fiszek: Użytkownik ma możliwość usuwania fiszek.
6. Integracja z algorytmem powtórek: Zapewnienie mechanizmu przypisywania fiszek do harmonogramu powtórek (korzystanie z gotowego algorytmu).
7. System zarządzania kontem użytkownika: Aplikacja umożliwia rejestrację, logowanie, edycję hasła oraz usunięcie konta.
8. Podstawowa obsługa błędów: W przypadku problemów z generowaniem fiszek przez AI lub niepoprawnej długości tekstu, system wyświetla odpowiednie komunikaty.
9. Monitorowanie: W bazie danych zapisywane są tylko zatwierdzone fiszki, wraz z calkowitą liczbą wygenerowanych fiszek oraz liczbą odrzuconych fiszek, przypisanych do użytkownika.

## 4. Granice produktu

- Brak własnego, zaawansowanego algorytmu powtórek (np. SuperMemo, Anki) – wykorzystywany jest gotowy algorytm.
- Brak importu wielu formatów (np. PDF, DOCX).
- Brak możliwości współdzielenia zestawów fiszek między użytkownikami.
- Brak integracji z innymi platformami edukacyjnymi.
- Brak aplikacji mobilnych – na początek dostępna jest tylko wersja webowa.

## 5. Historyjki użytkowników

US-001
Tytuł: Generowanie fiszek przez AI
Opis: Jako użytkownik chcę wygenerować fiszki na podstawie wprowadzonego tekstu, aby szybko uzyskać materiały do nauki.
Kryteria akceptacji:

- W widoku generowania fiszek znajduje się pole tekstowe, w którym użytkownik może wkleić swój tekst.
- Użytkownik wprowadza tekst o długości 1000–10000 znaków.
- System weryfikuje długość tekstu i wyświetla błąd, jeśli warunki nie są spełnione.
- System generuje listę fiszek zawierającą pola "przód" i "tył".
- Użytkownik ma możliwość zatwierdzenia lub odrzucenia każdej fiszki.

US-002
Tytuł: Manualne tworzenie fiszek
Opis: Jako użytkownik chcę mieć możliwość tworzenia fiszek ręcznie, aby samodzielnie kształtować treść fiszek.
Kryteria akceptacji:

- Na profilu uzytkownika, obok listy fiszek znajduje się przycik dodania nowej fiszki.
- Naciścięcie przyciksu otwiera formularz z polami "przód" i "tył".
- Fiszki są zapisywane i wyświetlane w liście.

US-003
Tytuł: Recenzja i edycja fiszek generowanych przez AI
Opis: Jako użytkownik chcę przeglądać wygenerowane fiszki, aby móc je edytować, zatwierdzać lub odrzucać.
Kryteria akceptacji:

- System wyświetla listę fiszek wygenerowanych przez AI pod formularzem generowania.
- Każda fiszka zawiera przyciski do edycji (w oknie modalnym), zatwierdzenia oraz odrzucenia.
- Zaakceptowane fiszki są zapisywane w bazie danych, a odrzucone zwiększają licznik odrzuconych fiszek.

US-004
Tytuł: Usuwanie fiszek
Opis: Jako użytkownik chcę usunąć fiszki z mojego profilu, aby zachować porządek na liście.
Kryteria akceptacji:

- Każda fiszka posiada przycisk umożliwiający jej usunięcie.
- Po zatwierdzeniu usunięcia, fiszka zostaje usunięta z bazy danych.

US-005
Tytuł: Edycja fiszek utworzonych ręcznie i generowanych przez AI
Opis: Jako zalogowany użytkownik chcę edytować stworzone lub wygenerowane fiszki, aby poprawić ewentualne błędy lub dostosować pytania i odpowiedzi do własnych potrzeb.
Kryteria akceptacji:

- Istnieje lista zapisanych fiszek (zarówno ręcznie tworzonych, jak i zatwierdzonych wygenerowanych).
- Każdą fiszkę można kliknąć i wejść w tryb edycji w oknie modalnych.
- Zmiany są zapisywane w bazie danych po zatwierdzeniu.

US-006
Tytuł: Sesja nauki z algorytmem powtórek
Opis: Jako zalogowany użytkownik chcę, aby dodane fiszki były dostępne w widoku "Sesja nauki" opartym na zewnętrznym algorytmie, aby móc efektywnie się uczyć (spaced repetition).
Kryteria akceptacji:

- W widoku "Sesja nauki" algorytm przygotowuje dla mnie sesję nauki fiszek
- Na start wyświetlany jest przód fiszki, poprzez interakcję użytkownik wyświetla jej tył
- Użytkownik ocenia zgodnie z oczekiwaniami algorytmu na ile przyswoił fiszkę
- Następnie algorytm pokazuje kolejną fiszkę w ramach sesji nauki

US-007
Tytuł: Zarządzanie kontem użytkownika
Opis: Jako użytkownik chcę mieć możliwość rejestracji, logowania, edycji hasła oraz usunięcia konta, aby zarządzać swoim profilem w aplikacji.
Kryteria akceptacji:

- System umożliwia rejestrację nowego użytkownika.
- System umożliwia logowanie istniejącego użytkownika.
- Użytkownik może zmieniać swoje hasło.
- Użytkownik może usunąć swoje konto.
- Dostęp do funkcji konta jest zabezpieczony autoryzacją.

US-008
Tytuł: Podstawowa obsługa błędów
Opis: Jako użytkownik chcę otrzymać stosowne komunikaty w przypadku problemów z generowaniem fiszek lub niepoprawnego formatu wejściowego tekstu.
Kryteria akceptacji:

- System wyświetla komunikat błędu, gdy wprowadzony tekst nie spełnia kryterium długości.
- W przypadku problemów z generowaniem fiszek przez AI, użytkownik otrzymuje informację o wystąpieniu błędu.

## 6. Metryki sukcesu

- 75% fiszek wygenerowanych przez AI jest akceptowane przez użytkownika.
- Użytkownicy generują 75% wszystkich fiszek przy użyciu funkcji AI.
