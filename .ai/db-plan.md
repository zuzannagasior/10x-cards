# Schemat bazy danych 10xCards

## 1. Tabele

### Tabela: users

- **id**: SERIAL PRIMARY KEY
- **email**: VARCHAR(255) NOT NULL UNIQUE
- **password**: VARCHAR(255) NOT NULL
- **created_at**: TIMESTAMP NOT NULL DEFAULT NOW()

### Tabela: flashcards

- **id**: SERIAL PRIMARY KEY
- **user_id**: INTEGER NOT NULL REFERENCES users(id)
- **generation_id**: INTEGER REFERENCES generation_sessions(id)
- **front**: VARCHAR(200) NOT NULL
  - CHECK (char_length(front) <= 200)
- **back**: VARCHAR(500) NOT NULL
  - CHECK (char_length(back) <= 500)
- **source**: VARCHAR(20) NOT NULL
  - CHECK (source IN ('manual', 'ai', 'ai-edited'))
- **created_at**: TIMESTAMP NOT NULL DEFAULT NOW()
- **updated_at**: TIMESTAMP NOT NULL DEFAULT NOW() -- Automatyczna aktualizacja przy modyfikacji (trigger)

### Tabela: generation_sessions

- **id**: SERIAL PRIMARY KEY
- **user_id**: INTEGER NOT NULL REFERENCES users(id)
- **model**: VARCHAR(100) NOT NULL
- **generated_count**: INTEGER NOT NULL
- **rejected_count**: INTEGER NULLABLE
- **source_text_hash**: VARCHAR(64) NOT NULL
- **created_at**: TIMESTAMP NOT NULL DEFAULT NOW()

### Tabela: generation_session_error_logs

- **id**: SERIAL PRIMARY KEY
- **user_id**: INTEGER NOT NULL REFERENCES users(id)
- **source_text_hash**: VARCHAR(64) NOT NULL
- **error_code**: VARCHAR(50) NOT NULL
- **error_message**: TEXT NOT NULL
- **created_at**: TIMESTAMP NOT NULL DEFAULT NOW()

## 2. Relacje między tabelami

- `flashcards.user_id` odnosi się do `users.id`.
- `flashcards.generation_id` odnosi się do `generation_sessions.id`.
- `generation_sessions.user_id` odnosi się do `users.id`.
- `generation_session_error_logs.user_id` odnosi się do `users.id`.

## 3. Indeksy

- Indeks na kolumnie `flashcards.user_id` dla optymalizacji zapytań.
- Indeks na kolumnie `flashcards.generation_id` dla szybkiego wyszukiwania powiązanych sesji.
- Indeks na kolumnie `generation_sessions.user_id` dla optymalizacji zapytań.
- Indeks na kolumnie `generation_session_error_logs.user_id` dla optymalizacji zapytań.

## 4. Zasady RLS (Row Level Security)

- Włącz RLS dla tabel `flashcards`, `generation_sessions` oraz `generation_session_error_logs`.
- Utwórz polityki, które zezwalają na dostęp do danych tylko, gdy `user_id` rekordu jest równy identyfikatorowi użytkownika uwierzytelnionego przez Supabase Auth (np. `current_setting('jwt.claims.user_id')`).
- Polityki powinny obejmować operacje SELECT, INSERT, UPDATE i DELETE zgodnie z wymaganiami bezpieczeństwa.

## 5. Dodatkowe uwagi

- Ograniczenia długości (dla `front` i `back`) są egzekwowane poprzez CHECK constraints na poziomie bazy danych.
- Aktualizacja kolumny `updated_at` w tabeli `flashcards` powinna być zrealizowana przy użyciu triggerów lub mechanizmu aplikacyjnego.
