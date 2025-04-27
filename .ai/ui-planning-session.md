<conversation_summary>
<decisions>
Ekran generowania fiszek AI będzie domyślnym ekranem po zalogowaniu, umożliwiającym wprowadzenie tekstu, generowanie propozycji fiszek oraz ich recenzję przy użyciu trzech akcji – zatwierdź, edytuj, usuń – z dodatkowymi przyciskami globalnymi ("Zapisz wszystkie" i "Zapisz zatwierdzone").
Ekran listy fiszek będzie prezentował wszystkie fiszki użytkownika, umożliwiając ich edycję, usunięcie oraz tworzenie manualne poprzez modal; do tego zostanie udostępniony przycisk przekierowujący do ekranu generowania AI.
Ekran profilu użytkownika będzie zawierał podstawowe informacje o koncie i ustawienia, wraz z przyciskiem wylogowania.
Ekrany logowania i rejestracji będą standardowe i dostępne tylko dla niezalogowanych użytkowników.
Ekran sesji powtórek umożliwi realizację sesji nauki według algorytmu powtórek.
Po zalogowaniu, użytkownik trafia bezpośrednio na ekran generowania fiszek AI, przy czym nawigacja między ekranami odbywać się będzie poprzez menu (w postaci pełnego menu na większych ekranach oraz hamburger menu na urządzeniach mobilnych).
Walidacja danych będzie wykonywana po stronie klienta i serwera; komunikaty o błędach krytycznych wyświetlane będą inline, a komunikaty sukcesu oraz mniejsze błędy w formie toastów.
UI będzie zaprojektowany jako prosty, minimalistyczny i estetyczny.
Zarządzanie stanem aplikacji na początek zostanie zrealizowane przy użyciu React hooków i kontekstu, z możliwością późniejszej migracji do Zustand.
Autoryzacja oparta będzie na JWT, co zabezpieczy widoki logowania/rejestracji dla niezalogowanych, a pozostałe ekrany – dla zalogowanych.
</decisions>
<matched_recommendations>
Utworzenie dedykowanych komponentów dla kluczowych ekranów: generowania fiszek AI, listy fiszek, profilu, logowania/rejestracji oraz sesji powtórek.
Zaprojektowanie przejrzystego przepływu nawigacyjnego, rozpoczynającego się od ekranu generowania fiszek po zalogowaniu z łatwym dostępem do pozostałych ekranów przez menu (z hamburger menu na mobile).
Implementacja responsywnego designu z użyciem Tailwind CSS utility variants i komponentów z biblioteki Shadcn/ui.
Wdrożenie systemu walidacji danych po stronie klienta i serwera z prezentacją inline krytycznych błędów i toast notifications dla komunikatów sukcesu.
Utrzymanie spójności autoryzacji za pomocą JWT oraz wykorzystanie React hooków i kontekstu do początkowego zarządzania stanem.
</matched_recommendations>
<ui_architecture_planning_summary>
Główne wymagania dotyczące architektury UI obejmują stworzenie pięciu głównych ekranów:
• Ekranu generowania fiszek AI – domyślny widok po zalogowaniu, gdzie użytkownik wprowadza tekst i generuje propozycje fiszek. Każda fiszka posiada trzy przyciski (zatwierdź, edytuj, usuń) oraz opcje globalne ("Zapisz wszystkie" oraz "Zapisz zatwierdzone").
• Ekranu listy fiszek – zawierającego pełną listę fiszek użytkownika z opcją edycji, usuwania i możliwością tworzenia nowych fiszek manualnie przez modal.
• Ekranu profilu – prezentującego podstawowe informacje o koncie i ustawienia z opcją wylogowania.
• Ekranów logowania i rejestracji – standardowe formy dostępne jedynie dla użytkowników niezalogowanych.
• Ekranu sesji powtórek – umożliwiającego przeprowadzenie sesji nauki zgodnie z algorytmem powtórek.
Po zalogowaniu, użytkownik trafia na ekran generowania fiszek, a nawigacja między ekranami odbywa się przez dedykowane menu, które na urządzeniach mobilnych funkcjonuje jako hamburger menu. Integracja z API obejmuje walidację danych zarówno po stronie klienta, jak i serwera, a zarządzanie stanem realizowane jest poprzez React hooki i kontekst, z możliwością dodania Zustand w przyszłości. Kluczowym aspektem jest również bezpieczeństwo, realizowane poprzez JWT do autoryzacji widoków. UI ma być responsywny, zgodny z WCAG AA oraz minimalistyczny, z możliwością wykorzystania animacji wizualnych tam, gdzie to konieczne.
</ui_architecture_planning_summary>
<unresolved_issues>
Brak istotnych nierozwiązanych kwestii – dalsze szczegóły dotyczące animacji wizualnych oraz ewentualnych rozszerzeń funkcjonalności listy fiszek (np. filtracja) mogą być omówione w kolejnych etapach rozwoju.
</unresolved_issues>
</conversation_summary>
