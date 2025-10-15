# Dokument wymagań produktu (PRD) - AI Product Description Generator

## 1. Przegląd produktu

AI Product Description Generator to aplikacja webowa dedykowana właścicielom sklepów e-commerce na platformie Shopify, która wykorzystuje modele LLM (Large Language Models) do automatycznego generowania profesjonalnych opisów produktów oraz meta tagów SEO.

### 1.1 Cel produktu

Głównym celem aplikacji jest drastyczne skrócenie czasu potrzebnego na tworzenie i aktualizację opisów produktów – z około 4-5 godzin (dla 50 produktów) do mniej niż 10 minut, przy zachowaniu wysokiej jakości i profesjonalizmu treści.

### 1.2 Grupa docelowa

Właściciele i zarządcy sklepów e-commerce na platformie Shopify, szczególnie w fazie wczesnego rozwoju sklepu, którzy edytują ręcznie 20-50 produktów dziennie i potrzebują szybkiego, ekonomicznego rozwiązania do skalowania katalogu produktowego.

### 1.3 Kluczowa wartość

- Oszczędność czasu: redukcja z 4-5 godzin do <10 minut dla 50 produktów
- Spójność komunikacji: utrzymanie jednolitego tonu w całym katalogu
- Optymalizacja SEO: automatyczne generowanie meta tagów
- Przejrzystość kosztów: real-time tracking wykorzystania tokenów i kosztów LLM
- Kontrola użytkownika: pełny podgląd i edycja przed publikacją

### 1.4 Stack technologiczny

- Frontend: Astro 5 + React 19 + Tailwind 4 + Shadcn/ui
- Backend: Supabase (autentykacja, baza danych PostgreSQL, Edge Functions)
- AI: OpenRouter (OpenAI + Anthropic)
- Integracja: Shopify REST API (plan Basic)
- Deployment: Docker na DigitalOcean z CI/CD przez GitHub Actions

### 1.5 Zakres MVP (Prototype)

Prototyp skupia się wyłącznie na generowaniu opisów dla istniejących produktów w sklepach Shopify, z batch processingiem do 50 produktów, podstawową autoryzacją przez klucz API oraz monitoringiem operacji.

Timeframe: 3-4 tygodnie, zespół 2-3 osób.

## 2. Problem użytkownika

### 2.1 Opis problemu

Właściciele sklepów e-commerce spędzają nadmierne ilości czasu na ręcznym tworzeniu i aktualizacji opisów produktów. W fazie wczesnego rozwoju sklepu, gdy katalog rozrasta się o 20-50 produktów dziennie, proces ten staje się głównym bottleneckiem operacyjnym.

### 2.2 Obecny workflow i pain points

Aktualny proces:

1. Właściciel loguje się do panelu Shopify
2. Ręcznie wpisuje opisy produktów, jeden po drugim
3. Tworzy meta tagi SEO dla każdego produktu
4. Próbuje utrzymać spójny ton komunikacji
5. Proces zajmuje 4-5 godzin dla 50 produktów

Pain points:

- Czasochłonność: 4-5 godzin dziennie na opisywanie produktów
- Brak skalowania: niemożliwe do utrzymania przy większych katalogach
- Niespójność: trudność w utrzymaniu jednolitego tonu
- Brak optymalizacji SEO: manualne tworzenie meta tagów jest żmudne
- Zmęczenie: powtarzalność zadania prowadzi do spadku jakości

### 2.3 Wpływ problemu

- Opóźnienia w rozwoju sklepu i wprowadzaniu nowych produktów
- Utracone możliwości sprzedaży (produkty bez opisów lub z niskiej jakości treściami)
- Frustracja i wypalenie właściciela
- Słaba pozycja w wynikach wyszukiwania (niedostateczne SEO)
- Niższa konwersja z powodu nieprofesjonalnych opisów

### 2.4 Oczekiwane rozwiązanie

Użytkownicy potrzebują narzędzia, które:

- Automatycznie generuje profesjonalne opisy w kilka minut
- Utrzymuje spójny ton komunikacji (wybór stylu)
- Optymalizuje treści pod SEO
- Pozwala na batch processing (masowe przetwarzanie)
- Daje pełną kontrolę i możliwość edycji przed publikacją
- Transparentnie pokazuje koszty wykorzystania AI
- Integruje się bezproblemowo z istniejącym sklepem Shopify

## 3. Wymagania funkcjonalne

### 3.1 Autoryzacja i zarządzanie połączeniem

FR-001: Aplikacja umożliwia użytkownikowi wprowadzenie i zapisanie statycznego klucza API Shopify (Private App credentials).

FR-002: Klucz API jest przechowywany w zaszyfrowanej formie w bazie Supabase.

FR-003: System waliduje połączenie ze sklepem Shopify po wprowadzeniu klucza.

FR-004: Użytkownik może zaktualizować lub usunąć zapisany klucz API.

FR-005: W przypadku błędu połączenia, użytkownik otrzymuje czytelny komunikat z instrukcjami naprawy.

### 3.2 Pobieranie i przeglądanie produktów

FR-006: Aplikacja pobiera pełną listę produktów z połączonego sklepu Shopify.

FR-007: Lista produktów zawiera: nazwę, SKU, krótki opis, długi opis, kategorie, kolekcje, grupy i status (published/draft).

FR-008: Użytkownik może filtrować produkty według statusu (published/draft).

FR-009: Użytkownik może wyszukiwać produkty po nazwie lub SKU.

FR-010: System umożliwia paginację listy produktów.

FR-011: Użytkownik może zaznaczyć do 50 produktów za pomocą bulk select.

FR-012: System wyświetla licznik zaznaczonych produktów i limit (X/50).

### 3.3 Generowanie opisów przez LLM

FR-013: Użytkownik wybiera jeden z 3 predefiniowanych stylów komunikacji: Professional, Casual, Sales-focused.

FR-014: Użytkownik może stworzyć i zapisać własny szablon promptu.

FR-015: System generuje przez LLM (OpenRouter - OpenAI/Anthropic):

- Opis produktu w formacie HTML
- Meta description (155-160 znaków, optymalizacja SEO)

FR-016: Generowanie odbywa się w dwóch językach: polski i angielski (wybór użytkownika).

FR-017: Dla każdego produktu system oblicza szacowaną liczbę tokenów i koszt generowania.

FR-018: Użytkownik widzi łączny koszt przed rozpoczęciem batch processingu.

FR-019: System wyświetla breakdown kosztów per produkt.

FR-020: Real-time progress bar aktualizuje się po przetworzeniu każdego produktu.

FR-021: System szacuje pozostały czas do zakończenia batch processingu.

FR-022: W przypadku błędu LLM, system wykonuje do 3 prób ponowienia (retry/backoff).

FR-023: Nieudane generowanie produktu jest logowane i komunikowane użytkownikowi.

### 3.4 Podgląd i edycja

FR-024: Po wygenerowaniu, użytkownik widzi preview wszystkich opisów w formie listy.

FR-025: Każdy opis można rozwinąć do pełnego widoku.

FR-026: Rich-text editor umożliwia edycję wygenerowanych treści.

FR-027: Editor wspiera formatowanie HTML (nagłówki, listy, pogrubienia, kursywa).

FR-028: Funkcja undo/redo jest dostępna w edytorze (limit 48h dla operacji cofania).

FR-029: System przechowuje bezterminową historię wszystkich wersji opisu produktu.

FR-030: Historia zmian jest wykorzystywana jako kontekst dla LLM przy kolejnych generacjach.

FR-031: Użytkownik może wybrać, które produkty zaakceptować, a które odrzucić.

FR-032: Odrzucone produkty nie są aktualizowane w Shopify.

FR-033: System wyświetla liczbę zaakceptowanych i odrzuconych produktów przed zapisem.

### 3.5 Aktualizacja w Shopify

FR-034: Użytkownik wybiera, czy zapisy mają być jako "draft" czy "published".

FR-035: System aktualizuje zaakceptowane produkty w Shopify przez REST API.

FR-036: Batch update obsługuje do 50 produktów jednocześnie.

FR-037: System respektuje rate limiting Shopify API (2 requests/second dla planu Basic).

FR-038: W przypadku błędu API, system wykonuje do 3 prób ponowienia z exponential backoff.

FR-039: Po zakończeniu aktualizacji, użytkownik otrzymuje potwierdzenie z podsumowaniem.

FR-040: Podsumowanie zawiera: liczbę zaktualizowanych produktów, liczbę błędów, czas wykonania.

### 3.6 Job Queue i Background Processing

FR-041: Batch processing odbywa się asynchronicznie w tle (job queue).

FR-042: Użytkownik może opuścić stronę, a job będzie kontynuowany.

FR-043: Po powrocie, użytkownik widzi aktualny status wszystkich jobów.

FR-044: System przechowuje historię wszystkich batch jobs.

FR-045: Dla każdego joba zapisywane są: timestamp, status (pending/processing/completed/failed), liczba produktów, wykorzystane tokeny, koszt.

FR-046: Użytkownik może wyświetlić szczegóły każdego historycznego joba.

FR-047: Użytkownik może podejrzeć wygenerowane opisy z historycznych jobów.

### 3.7 Monitoring i Metryki

FR-048: System loguje wszystkie operacje (generowanie, edycja, aktualizacja) w bazie danych.

FR-049: Supabase Metrics monitoruje:

- Czas odpowiedzi edge functions
- Error rate
- Token usage
- Job queue depth

FR-050: Administrator (właściciel aplikacji) ma dostęp do dashboardu metryk.

FR-051: System alarmuje przy przekroczeniu progów: error rate >5%, czas odpowiedzi >2s/produkt.

### 3.8 Zarządzanie danymi i retencja

FR-052: Historia zmian produktów jest przechowywana bezterminowo.

FR-053: Tabele historii są partycjonowane według sklepu i daty.

FR-054: System automatycznie indeksuje historię dla szybkiego wyszukiwania.

FR-055: Użytkownik może usunąć wszystkie swoje dane na żądanie (GDPR/RODO compliance).

## 4. Granice produktu

### 4.1 Co NIE wchodzi w zakres MVP

Funkcjonalności produktowe:

- Integracja z platformami innymi niż Shopify (np. Shoper, WooCommerce)
- Generowanie obrazów produktowych przez AI
- Pamięć długoterminowa / kontekst uczenia się AI
- Operacje na kolekcjach/kategoriach (tworzenie, edycja)
- Tworzenie nowych produktów (tylko aktualizacja istniejących)
- Automatyczne generowanie atrybutów i tagów produktowych
- Masowe grupowanie produktów według kategorii
- Tłumaczenia wielojęzyczne (poza PL/EN)
- A/B testing różnych wersji opisów
- Analytics wydajności opisów (CTR, conversion rate)
- Widok diff między wersjami opisów
- Zaawansowane szablony (nagłówki, bullet points dla wariantów)
- Wsparcie niestandardowych metafields Shopify

Funkcjonalności techniczne:

- Webhooks Shopify (real-time synchronizacja)
- Multi-user collaboration (współpraca zespołowa)
- Role-based access control (zarządzanie uprawnieniami)
- Publiczne API dla zewnętrznych integracji
- White-label solution
- Aplikacja mobilna (iOS/Android)
- OAuth flow (w MVP tylko statyczny klucz API)
- Integracja MCP (Model Context Protocol)
- Zaawansowane zarządzanie sesjami użytkownika
- Historia wersji szablonów promptów
- Zarządzanie wieloma sklepami na jedno konto
- Role i poziomy dostępu użytkowników
- Logi aktywności użytkownika
- Zaawansowane opcje bezpieczeństwa (2FA, limity logowań)

Zaawansowane funkcje AI:

- Fine-tuned modele pod konkretny sklep
- RAG (Retrieval Augmented Generation)
- Analiza konkurencji i benchmarking
- Automatyczne sugestie optymalizacji opisów
- SEO scoring i rekomendacje

### 4.2 Założenia i ograniczenia

Techniczne:

- Shopify plan Basic: limit 2 requests/second
- Batch processing: maksymalnie 50 produktów na raz
- Edge Functions: limit execution time wymagający podziału na chunki
- Token limit LLM: ~8000 tokenów, wymagający przycinania historii
- Język: interfejs w języku polskim i angielskim
- Generowanie treści: tylko polski i angielski

Biznesowe:

- Koszt generowania 1 opisu: cel <$0.10
- Timeframe MVP: 3-4 tygodnie
- Zespół: 2-3 osoby
- Zakres testowy: 2-3 beta testerów
- Feedback: zbierany manualnie (bez automatycznego formularza w MVP)

Użytkowe:

- Jeden użytkownik = jedno konto = jeden sklep Shopify
- Brak współdzielenia kont i uprawnień
- Brak eksportu danych (CSV/JSON) w MVP
- Historia zmian dostępna tylko w interfejsie aplikacji
- Podstawowa autoryzacja (email + hasło) bez zaawansowanych opcji bezpieczeństwa
- Maksymalnie 3 własne szablony promptów na użytkownika
- Brak możliwości współdzielenia szablonów między użytkownikami

### 4.3 Planowane rozszerzenia (wersja 2.0)

- OAuth flow dla bezpieczniejszej autoryzacji
- Integracja MCP dla rozszerzonych możliwości AI
- Widok diff między wersjami opisów
- Zaawansowane szablony dla wariantów produktów i kolekcji
- Wsparcie niestandardowych metafields
- Formularz feedbacku w aplikacji
- Eksport danych i raportów
- Integracja z platformą Shoper
- Multi-user support i role-based access

## 5. Historyjki użytkowników

### 5.1 Autoryzacja i konfiguracja

US-001: Pierwsza konfiguracja połączenia ze sklepem

Jako właściciel sklepu Shopify
Chcę połączyć moją aplikację ze sklepem poprzez klucz API
Aby móc zarządzać opisami produktów

Kryteria akceptacji:

- Użytkownik widzi instrukcję jak wygenerować Private App credentials w Shopify
- Pole do wprowadzenia klucza API jest dostępne i walidowane
- Po wprowadzeniu klucza, system testuje połączenie
- W przypadku sukcesu, użytkownik widzi potwierdzenie i nazwę sklepu
- W przypadku błędu, wyświetlany jest czytelny komunikat z pomocą
- Klucz jest zapisywany w zaszyfrowanej formie

US-002: Zarządzanie kluczem API

Jako użytkownik aplikacji
Chcę móc zaktualizować lub usunąć mój klucz API
Aby utrzymać bezpieczeństwo lub zmienić połączenie

Kryteria akceptacji:

- Użytkownik widzi status obecnego połączenia (aktywne/nieaktywne)
- Opcja "Zmień klucz API" jest dostępna w ustawieniach
- Opcja "Usuń klucz API" jest dostępna z potwierdzeniem
- Po usunięciu klucza, użytkownik traci dostęp do produktów do czasu ponownej konfiguracji
- System loguje zmiany klucza API

US-003: Walidacja połączenia przy każdym logowaniu

Jako użytkownik aplikacji
Chcę wiedzieć, czy moje połączenie ze Shopify jest aktywne
Aby móc szybko zareagować na problemy

Kryteria akceptacji:

- Po zalogowaniu, system automatycznie testuje połączenie
- Status połączenia jest wyświetlany na dashboardzie
- W przypadku błędu, użytkownik otrzymuje alert z instrukcją naprawy
- System pokazuje timestamp ostatniej udanej synchronizacji

### 5.2 Przeglądanie i zarządzanie produktami

US-004: Przeglądanie listy produktów

Jako właściciel sklepu
Chcę widzieć listę wszystkich moich produktów z Shopify
Aby móc wybrać te, które wymagają aktualizacji opisów

Kryteria akceptacji:

- Lista produktów ładuje się w ciągu 3 sekund
- Każdy produkt pokazuje: nazwę, SKU, obecny opis (skrócony), status
- Lista jest paginowana (domyślnie 20 produktów na stronę)
- System pokazuje łączną liczbę produktów
- W przypadku braku produktów, wyświetlany jest komunikat pomocniczy

US-005: Wyszukiwanie produktów

Jako użytkownik
Chcę szybko znaleźć konkretny produkt po nazwie lub SKU
Aby nie przeglądać całej listy

Kryteria akceptacji:

- Pole wyszukiwania jest widoczne nad listą produktów
- Wyszukiwanie działa real-time (z debounce 300ms)
- Wyniki filtrują listę według nazwy lub SKU
- Wyświetlana jest liczba znalezionych produktów
- Użytkownik może wyczyścić wyszukiwanie jednym kliknięciem

US-006: Filtrowanie produktów według statusu

Jako użytkownik
Chcę filtrować produkty według statusu (published/draft)
Aby łatwo zarządzać różnymi etapami publikacji

Kryteria akceptacji:

- Dostępne są filtry: "Wszystkie", "Opublikowane", "Wersje robocze"
- Filtr działa natychmiastowo bez przeładowania strony
- Aktywny filtr jest wizualnie zaznaczony
- System zapamiętuje ostatni wybrany filtr w sesji
- Liczba produktów w każdej kategorii jest widoczna

US-007: Bulk select produktów

Jako użytkownik
Chcę zaznaczyć wiele produktów jednocześnie
Aby wygenerować opisy dla całej grupy w jednym batch'u

Kryteria akceptacji:

- Checkbox przy każdym produkcie umożliwia zaznaczenie
- Opcja "Zaznacz wszystkie" zaznacza produkty na aktualnej stronie
- Licznik pokazuje liczbę zaznaczonych produktów (X/50)
- Po osiągnięciu limitu 50, dalsze zaznaczanie jest blokowane z komunikatem
- Użytkownik może odznaczyć produkty indywidualnie lub wszystkie naraz
- Przycisk "Generuj opisy" jest aktywny tylko gdy zaznaczono ≥1 produkt

US-008: Podgląd szczegółów produktu

Jako użytkownik
Chcę zobaczyć pełne informacje o produkcie przed generowaniem opisu
Aby upewnić się, że wybrałem właściwy produkt

Kryteria akceptacji:

- Kliknięcie na produkt rozszerza jego widok
- Widoczne są wszystkie pola: nazwa, SKU, krótki i długi opis, kategorie, kolekcje, grupy
- Obecny opis jest wyświetlany w formacie HTML (z zachowaniem formatowania)
- Użytkownik może zamknąć rozszerzony widok
- Rozszerzenie nie wpływa na stan zaznaczenia produktu

### 5.3 Konfiguracja generowania

US-009: Wybór stylu komunikacji

Jako właściciel sklepu
Chcę wybrać styl komunikacji dla generowanych opisów
Aby dopasować ton do mojej marki

Kryteria akceptacji:

- Dostępne są 3 predefiniowane style: Professional, Casual, Sales-focused
- Każdy styl ma krótki opis i przykład zastosowania
- Wybrany styl jest wizualnie zaznaczony
- Styl można zmienić przed rozpoczęciem generowania
- System zapamiętuje ostatnio wybrany styl jako domyślny

US-010: Tworzenie własnego szablonu promptu

Jako zaawansowany użytkownik
Chcę stworzyć własny szablon promptu
Aby mieć pełną kontrolę nad tonem i strukturą opisów

Kryteria akceptacji:

- Opcja "Własny prompt" jest dostępna obok predefiniowanych stylów
- Edytor promptu umożliwia wprowadzenie własnego tekstu (max 500 znaków)
- System pokazuje dostępne zmienne do wstawienia (np. {product_name}, {category})
- Użytkownik może zapisać własny szablon z nazwą
- Zapisane szablony są dostępne do późniejszego użycia
- Użytkownik może edytować i usuwać własne szablony

US-011: Wybór języka generowania

Jako właściciel sklepu sprzedającego na rynku polskim i międzynarodowym
Chcę wybrać język generowanych opisów
Aby obsłużyć różne grupy klientów

Kryteria akceptacji:

- Dostępne są opcje: Polski, English
- Wybór języka jest wyraźnie widoczny przed generowaniem
- Wybrany język dotyczy zarówno opisu produktu jak i meta description
- System zapamiętuje ostatnio wybrany język
- Użytkownik może zmienić język przed każdym batch processingiem

### 5.4 Generowanie opisów

US-012: Rozpoczęcie batch processingu

Jako użytkownik
Chcę wygenerować opisy dla zaznaczonych produktów
Aby zaoszczędzić czas na ręcznym tworzeniu treści

Kryteria akceptacji:

- Przycisk "Generuj opisy" jest dostępny po zaznaczeniu ≥1 produktu
- Przed rozpoczęciem, użytkownik widzi podsumowanie: liczbę produktów, wybrany styl, język
- System pokazuje szacowany łączny koszt tokenów
- Użytkownik musi potwierdzić rozpoczęcie generowania
- Po potwierdzeniu, batch job startuje w tle
- Użytkownik przechodzi do widoku progress trackingu

US-013: Monitoring progress baru

Jako użytkownik
Chcę widzieć postęp generowania w czasie rzeczywistym
Aby wiedzieć, ile czasu pozostało do zakończenia

Kryteria akceptacji:

- Progress bar pokazuje procent ukończenia (0-100%)
- Licznik pokazuje: "X z Y produktów przetworzonych"
- Czas szacowany do zakończenia jest wyświetlany i aktualizowany
- Progress bar aktualizuje się po przetworzeniu każdego produktu
- Użytkownik widzi nazwę aktualnie przetwarzanego produktu
- W przypadku błędu dla produktu, jest to zaznaczone wizualnie

US-014: Podgląd kosztów podczas generowania

Jako użytkownik świadomy kosztów
Chcę widzieć aktualne koszty tokenów podczas generowania
Aby kontrolować wydatki

Kryteria akceptacji:

- Widoczny jest licznik zużytych tokenów (real-time)
- Koszt w USD jest kalkulowany i wyświetlany
- Breakdown per produkt jest dostępny po rozwinięciu
- System pokazuje średni koszt per produkt
- Po zakończeniu, wyświetlany jest łączny koszt całego batcha

US-015: Obsługa błędów podczas generowania

Jako użytkownik
Chcę wiedzieć, jeśli generowanie dla niektórych produktów się nie powiodło
Aby móc podjąć odpowiednie działania

Kryteria akceptacji:

- Produkty z błędami są wyraźnie zaznaczone w progress barze
- System wykonuje 3 próby ponowienia dla każdego błędu (retry/backoff)
- Po wyczerpaniu prób, produkt jest oznaczony jako "failed"
- Użytkownik widzi czytelny komunikat błędu dla każdego nieudanego produktu
- Na końcu jest podsumowanie: sukces/błędy
- Użytkownik może ponowić generowanie tylko dla produktów z błędami

US-016: Anulowanie batch processingu

Jako użytkownik
Chcę móc anulować trwający batch processing
Aby przerwać operację w razie pomyłki

Kryteria akceptacji:

- Przycisk "Anuluj" jest dostępny podczas trwania batch processingu
- Po kliknięciu, użytkownik musi potwierdzić anulowanie
- System zatrzymuje przetwarzanie nowych produktów
- Produkty już przetworzone są zachowane
- Użytkownik widzi podsumowanie: ile produktów zostało przetworzonych przed anulowaniem
- Job jest oznaczony jako "cancelled" w historii

### 5.5 Podgląd i edycja

US-017: Podgląd wygenerowanych opisów

Jako użytkownik
Chcę zobaczyć wszystkie wygenerowane opisy przed zapisaniem w Shopify
Aby upewnić się, że spełniają moje oczekiwania

Kryteria akceptacji:

- Po zakończeniu generowania, użytkownik automatycznie przechodzi do widoku preview
- Lista pokazuje wszystkie produkty z wygenerowanymi opisami
- Dla każdego produktu widoczny jest: nazwa, nowy opis, nowa meta description
- Użytkownik może rozwinąć pełny widok każdego opisu
- Produkty z błędami są wyraźnie oddzielone
- Licznik pokazuje: produkty gotowe do zapisu / błędy

US-018: Edycja wygenerowanego opisu

Jako użytkownik
Chcę móc edytować wygenerowane opisy przed zapisem
Aby dostosować detale do moich preferencji

Kryteria akceptacji:

- Przycisk "Edytuj" jest dostępny przy każdym opisie
- Rich-text editor otwiera się w modal/overlay
- Editor wspiera: nagłówki, pogrubienie, kursywę, listy, linki
- Zmiany są zapisywane automatycznie (auto-save co 2 sekundy)
- Użytkownik może zamknąć edytor i wrócić do listy
- Edytowany opis jest oznaczony wizualnie (np. ikona ołówka)

US-019: Funkcja undo/redo w edytorze

Jako użytkownik edytujący opis
Chcę móc cofnąć lub ponowić zmiany
Aby łatwo eksperymentować z różnymi wariantami tekstu

Kryteria akceptacji:

- Przyciski "Cofnij" i "Ponów" są dostępne w edytorze
- Skróty klawiszowe Ctrl+Z i Ctrl+Y działają
- Undo/redo działa dla zmian w ciągu ostatnich 48 godzin
- Liczba dostępnych kroków wstecz jest ograniczona czasem, nie liczbą
- Stan undo/redo jest zapisywany między sesjami

US-020: Historia wersji opisu

Jako użytkownik
Chcę widzieć historię wszystkich wersji opisu produktu
Aby móc przywrócić starszą wersję lub użyć jej jako kontekstu

Kryteria akceptacji:

- Opcja "Historia wersji" jest dostępna w edytorze
- Lista pokazuje wszystkie wersje z timestampem i autorem (system/użytkownik)
- Użytkownik może podejrzeć każdą wersję
- Opcja "Przywróć tę wersję" kopiuje treść do edytora
- Historia jest przechowywana bezterminowo
- System wykorzystuje historię jako kontekst dla LLM przy kolejnych generacjach

US-021: Akceptacja i odrzucanie opisów

Jako użytkownik
Chcę wybrać, które opisy zapisać w Shopify, a które odrzucić
Aby aktualizować tylko te produkty, które spełniają moje standardy

Kryteria akceptacji:

- Przy każdym opisie jest checkbox "Zaakceptuj"
- Domyślnie wszystkie opisy są zaakceptowane (można odznaczyć)
- Opcje "Zaznacz wszystkie" / "Odznacz wszystkie" są dostępne
- Licznik pokazuje: X zaakceptowanych z Y
- Odrzucone opisy nie są wysyłane do Shopify
- Użytkownik widzi potwierdzenie przed finalnym zapisem

### 5.6 Aktualizacja w Shopify

US-022: Wybór trybu publikacji

Jako użytkownik
Chcę wybrać, czy produkty mają być zapisane jako draft czy published
Aby kontrolować, kiedy zmiany będą widoczne dla klientów

Kryteria akceptacji:

- Opcje "Zapisz jako draft" i "Opublikuj od razu" są dostępne przed zapisem
- Domyślnie wybrane jest "Zapisz jako draft" (bezpieczniejsza opcja)
- Wybrany tryb dotyczy wszystkich zaakceptowanych produktów
- Użytkownik widzi ostrzeżenie przy wyborze "Opublikuj od razu"
- Potwierdzenie pokazuje wybrany tryb przed finalnym zapisem

US-023: Zapis w Shopify

Jako użytkownik
Chcę zapisać zaakceptowane opisy w moim sklepie Shopify
Aby zaktualizować produkty

Kryteria akceptacji:

- Przycisk "Zapisz w Shopify" jest dostępny po zaakceptowaniu ≥1 opisu
- Przed zapisem, użytkownik widzi podsumowanie: liczba produktów, tryb publikacji
- Użytkownik musi potwierdzić operację
- Zapis odbywa się asynchronicznie w tle (job queue)
- Użytkownik widzi progress bar aktualizacji
- System respektuje rate limiting Shopify (2 req/s)

US-024: Monitoring aktualizacji w Shopify

Jako użytkownik
Chcę widzieć postęp aktualizacji produktów w Shopify
Aby wiedzieć, kiedy operacja zostanie zakończona

Kryteria akceptacji:

- Progress bar pokazuje liczbę zaktualizowanych produktów
- Czas szacowany do zakończenia jest wyświetlany
- Każdy zapisany produkt jest wizualnie zaznaczony (checkmark)
- W przypadku błędu API, system wykonuje retry (3 próby z backoff)
- Produkty z błędami są wyraźnie oznaczone
- Użytkownik może anulować trwającą aktualizację

US-025: Potwierdzenie i podsumowanie aktualizacji

Jako użytkownik
Chcę otrzymać potwierdzenie po zakończeniu aktualizacji
Aby wiedzieć, że operacja się powiodła

Kryteria akceptacji:

- Po zakończeniu, wyświetlany jest ekran podsumowania
- Podsumowanie zawiera: liczbę zaktualizowanych produktów, liczbę błędów, czas wykonania, łączny koszt tokenów
- Lista produktów zaktualizowanych pomyślnie jest dostępna
- Lista produktów z błędami wraz z komunikatami jest dostępna
- Użytkownik może ponowić aktualizację dla produktów z błędami
- Link do historii operacji jest dostępny

US-026: Obsługa błędów Shopify API

Jako użytkownik
Chcę być informowany o błędach podczas aktualizacji w Shopify
Aby móc je naprawić

Kryteria akceptacji:

- Każdy błąd ma czytelny komunikat dla użytkownika
- System rozróżnia typy błędów: rate limiting, brak uprawnień, błąd walidacji, timeout
- Dla błędów tymczasowych (rate limiting), system automatycznie ponawia próbę
- Dla błędów stałych, użytkownik otrzymuje instrukcję naprawy
- Błędy są logowane w historii operacji
- Użytkownik może pobrać log błędów

### 5.7 Historia operacji i monitoring

US-027: Przeglądanie historii batch jobs

Jako użytkownik
Chcę widzieć historię wszystkich moich batch operations
Aby monitorować aktywność i sprawdzać przeszłe generowania

Kryteria akceptacji:

- Sekcja "Historia" jest dostępna w menu głównym
- Lista pokazuje wszystkie batch jobs z: datą, liczbą produktów, statusem, kosztem
- Statusy: pending, processing, completed, failed, cancelled
- Lista jest sortowana od najnowszych
- Użytkownik może filtrować według statusu i zakresu dat
- Paginacja dla dużej liczby jobów

US-028: Szczegóły batch joba

Jako użytkownik
Chcę zobaczyć szczegóły konkretnego batch joba
Aby sprawdzić, co zostało wygenerowane i jakie były koszty

Kryteria akceptacji:

- Kliknięcie na job w historii otwiera widok szczegółów
- Widoczne są: timestamp rozpoczęcia i zakończenia, liczba produktów, wykorzystane tokeny, koszt, status
- Lista przetworzonych produktów z linkami do podglądu opisów
- Lista błędów (jeśli wystąpiły)
- Wybrany styl/prompt i język
- Opcja "Powtórz z tymi samymi ustawieniami"

US-029: Podgląd wygenerowanych opisów z historii

Jako użytkownik
Chcę móc zobaczyć opisy wygenerowane w przeszłych jobách
Aby sprawdzić jakość lub użyć ich ponownie

Kryteria akceptacji:

- W szczegółach joba, przy każdym produkcie jest link "Pokaż opis"
- Opis jest wyświetlany w modal z zachowaniem formatowania HTML
- Meta description jest również widoczna
- Użytkownik może skopiować tekst do schowka
- Informacja czy opis został zapisany w Shopify (tak/nie)

US-030: Monitoring metryk systemowych (admin)

Jako administrator aplikacji
Chcę monitorować kluczowe metryki systemu
Aby zapewnić wysoką jakość usługi

Kryteria akceptacji:

- Dashboard metryk jest dostępny dla administratora
- Widoczne są: średni czas odpowiedzi edge functions, error rate, token usage, job queue depth
- Wykresy pokazują trendy w czasie (ostatnie 24h, 7 dni, 30 dni)
- Alerty są wyświetlane przy przekroczeniu progów (error rate >5%, czas >2s)
- Możliwość eksportu danych metryk do CSV
- Integracja z Supabase Metrics

### 5.8 Zarządzanie danymi użytkownika

US-031: Usuwanie danych użytkownika (GDPR)

Jako użytkownik
Chcę móc usunąć wszystkie moje dane z aplikacji
Aby skorzystać z prawa do bycia zapomnianym (GDPR/RODO)

Kryteria akceptacji:

- Opcja "Usuń moje dane" jest dostępna w ustawieniach
- Użytkownik widzi ostrzeżenie o nieodwracalności operacji
- Wymagane jest potwierdzenie przez wpisanie nazwy sklepu
- System usuwa: klucz API, historię jobów, wygenerowane opisy, logi operacji
- Użytkownik otrzymuje email potwierdzający usunięcie
- Operacja jest logowana (anonimowo) dla compliance

### 5.9 Szablony i autoryzacja (MVP)

US-039: Podstawowe szablony promptów

Jako użytkownik
Chcę mieć dostęp do predefiniowanych szablonów promptów i możliwość tworzenia własnych
Aby utrzymać spójny styl komunikacji dla moich produktów

Kryteria akceptacji:

- System oferuje 3 predefiniowane szablony (Professional, Casual, Sales-focused)
- Użytkownik może stworzyć i zapisać własny szablon (nazwa + treść)
- Szablon może zawierać podstawowe zmienne ({product_name}, {category})
- Użytkownik może edytować własne szablony
- Maksymalna długość promptu: 500 znaków

US-040: Podstawowa autoryzacja sklepu

Jako właściciel sklepu Shopify
Chcę połączyć mój sklep z aplikacją
Aby móc automatycznie aktualizować opisy produktów

Kryteria akceptacji:

- Użytkownik może dodać sklep przez Private App credentials
- System szyfruje klucz API w bazie Supabase
- System waliduje poprawność klucza przy dodawaniu
- Użytkownik może zaktualizować lub usunąć klucz API
- System wyświetla podstawowe informacje o połączonym sklepie

US-042: Podstawowe logowanie

Jako użytkownik
Chcę mieć prosty i bezpieczny dostęp do systemu
Aby chronić moje dane i ustawienia

Kryteria akceptacji:

- Logowanie przez email i hasło (Supabase Auth)
- Rejestracja wymaga:
  - Adresu email
  - Hasła (min. 8 znaków)
  - Akceptacji regulaminu
- Podstawowe funkcje:
  - Weryfikacja email
  - Reset hasła
  - Wylogowanie
- Interfejs:
  - Przycisk logowania w prawym górnym rogu
  - Prosty panel użytkownika
- Dostęp:
  - Dashboard wymaga logowania
  - Historia generowania wymaga logowania

US-032: Eksport historii operacji

Jako użytkownik
Chcę wyeksportować historię moich operacji
Aby mieć własną kopię danych

Kryteria akceptacji:

- Opcja "Eksportuj historię" jest dostępna w sekcji Historia
- Użytkownik wybiera zakres dat do eksportu
- Format eksportu: CSV lub JSON (do wyboru)
- Plik zawiera: daty, liczby produktów, statusy, koszty
- Link do pobrania jest wysyłany na email
- Link wygasa po 7 dniach

### 5.9 Edge cases i scenariusze awaryjne

US-033: Utrata połączenia podczas generowania

Jako użytkownik
Chcę, aby batch processing kontynuował się po utracie połączenia
Aby nie stracić postępu

Kryteria akceptacji:

- Batch job działa w tle niezależnie od połączenia użytkownika
- Po ponownym zalogowaniu, użytkownik widzi aktualny status joba
- Możliwość powrotu do widoku progress trackingu
- W przypadku błędu połączenia, użytkownik otrzymuje powiadomienie
- Job nie jest anulowany automatycznie

US-034: Przekroczenie limitu 50 produktów

Jako użytkownik próbujący zaznaczyć >50 produktów
Chcę otrzymać czytelny komunikat
Aby zrozumieć ograniczenie

Kryteria akceptacji:

- Po zaznaczeniu 50 produktu, dalsze checkboxy są disabled
- Tooltip wyjaśnia ograniczenie batch processingu
- Komunikat sugeruje utworzenie kilku batch jobów
- Użytkownik może łatwo odznaczyć produkty i wybrać inne

US-035: Brak produktów w sklepie

Jako nowy użytkownik bez produktów w Shopify
Chcę otrzymać pomocne wskazówki
Aby wiedzieć, co robić dalej

Kryteria akceptacji:

- Zamiast pustej listy, wyświetlany jest pomocny komunikat
- Komunikat wyjaśnia, że aplikacja aktualizuje istniejące produkty
- Link do dokumentacji Shopify o dodawaniu produktów
- Opcja "Odśwież listę" do ponownego pobrania po dodaniu produktów

US-036: Nieważny lub wygasły klucz API

Jako użytkownik z nieważnym kluczem
Chcę być natychmiast poinformowany o problemie
Aby móc go naprawić

Kryteria akceptacji:

- System wykrywa nieważny klucz przy próbie pobrania produktów
- Alert wyświetla się na górze ekranu
- Komunikat wyjaśnia możliwe przyczyny (wygasły, odwołany, błędne uprawnienia)
- Link do ustawień z możliwością aktualizacji klucza
- Operacje są blokowane do czasu naprawy

US-037: Timeout LLM API

Jako użytkownik
Chcę, aby system radził sobie z timeoutem API
Aby nie tracić postępu batch processingu

Kryteria akceptacji:

- System wykrywa timeout po 30 sekundach
- Automatyczny retry z exponential backoff (3 próby)
- Jeśli wszystkie próby zawiodą, produkt jest oznaczony jako failed
- Użytkownik widzi komunikat o problemie z API
- Pozostałe produkty w batchu są kontynuowane
- Możliwość ponowienia tylko dla produktów z timeoutem

US-038: Przekroczenie limitu tokenów LLM

Jako użytkownik z bardzo długą historią zmian
Chcę, aby system automatycznie przyciął kontekst
Aby generowanie się powiodło

Kryteria akceptacji:

- System oblicza liczbę tokenów przed wysłaniem do LLM
- Jeśli przekracza limit (~8000), historia jest przycinana
- Przycinanie zachowuje najnowsze wpisy
- Użytkownik otrzymuje informację o przycięciu kontekstu
- Generowanie kontynuuje się pomyślnie

## 6. Metryki sukcesu

### 6.1 Metryki adopcji i użyteczności

Cel: Użytkownicy regularnie korzystają z aplikacji i akceptują wygenerowane treści

M-001: Acceptance Rate wygenerowanych opisów

- Definicja: Procent wygenerowanych opisów zaakceptowanych przez użytkowników (bez edycji lub z minimalnymi zmianami <10% tekstu)
- Cel MVP: ≥80%
- Pomiar: Tracking w bazie danych - porównanie wersji wygenerowanej vs. zapisanej
- Częstotliwość: Tygodniowa

M-002: Time to Complete (batch 50 produktów)

- Definicja: Średni czas od rozpoczęcia batch joba do zapisania w Shopify dla 50 produktów
- Cel MVP: <10 minut
- Pomiar: Timestamp rozpoczęcia i zakończenia joba w bazie
- Częstotliwość: Per job, agregacja tygodniowa

M-003: Bulk vs. Single Update Ratio

- Definicja: Procent użytkowników preferujących bulk update (≥10 produktów) zamiast single update
- Cel MVP: ≥70%
- Pomiar: Tracking liczby produktów per job w historii
- Częstotliwość: Miesięczna

M-004: User Retention (Weekly Active Users)

- Definicja: Procent beta testerów używających aplikacji minimum 2 razy w tygodniu
- Cel MVP: ≥60%
- Pomiar: Supabase analytics - liczba sesji per użytkownik per tydzień
- Częstotliwość: Tygodniowa

M-005: Feature Usage - Custom Prompts

- Definicja: Procent użytkowników tworzących własne szablony promptów
- Cel MVP: ≥30% (early adopters)
- Pomiar: Liczba zapisanych custom promptów w bazie
- Częstotliwość: Miesięczna

### 6.2 Metryki techniczne i wydajnościowe

Cel: System działa szybko, niezawodnie i efektywnie kosztowo

M-006: Average Response Time (Edge Functions)

- Definicja: Średni czas odpowiedzi edge function dla generowania 1 opisu produktu
- Cel MVP: <2 sekundy/produkt
- Pomiar: Supabase Metrics - czas wykonania funkcji
- Częstotliwość: Real-time monitoring, raport dzienny

M-007: Batch Processing Time (50 produktów)

- Definicja: Średni czas wykonania batch joba dla 50 produktów (generowanie + zapis w Shopify)
- Cel MVP: <5 minut
- Pomiar: Timestamp start/end joba w bazie
- Częstotliwość: Per job, agregacja tygodniowa

M-008: API Success Rate

- Definicja: Procent udanych wywołań API (LLM + Shopify) bez błędów po retry
- Cel MVP: ≥95%
- Pomiar: Logi błędów vs. logi sukcesu w bazie
- Częstotliwość: Real-time monitoring, raport dzienny

M-009: Error Rate

- Definicja: Procent produktów, dla których generowanie lub zapis się nie powiodło (nawet po retry)
- Cel MVP: <5%
- Pomiar: Liczba failed products / total products in jobs
- Częstotliwość: Dzienna, agregacja tygodniowa

M-010: System Uptime

- Definicja: Procent czasu, w którym aplikacja jest dostępna i funkcjonalna
- Cel MVP: ≥99.5%
- Pomiar: Monitoring DigitalOcean + Supabase status
- Częstotliwość: Real-time monitoring, raport miesięczny

M-011: Job Queue Depth

- Definicja: Średnia liczba oczekujących jobów w kolejce
- Cel MVP: <3 jobów
- Pomiar: Supabase Metrics - liczba jobów ze statusem "pending"
- Częstotliwość: Real-time monitoring, raport dzienny

### 6.3 Metryki biznesowe i kosztowe

Cel: Aplikacja jest ekonomicznie efektywna dla użytkownika i zrównoważona biznesowo

M-012: Cost per Generated Description

- Definicja: Średni koszt tokenów LLM dla wygenerowania 1 opisu produktu
- Cel MVP: <$0.10
- Pomiar: Token usage tracking w OpenRouter + kalkulacja kosztu
- Częstotliwość: Per produkt, agregacja tygodniowa

M-013: Time Saved per User (monthly)

- Definicja: Szacowana oszczędność czasu użytkownika w godzinach miesięcznie (vs. manualne tworzenie)
- Cel MVP: ≥4 godziny/miesiąc
- Pomiar: (Liczba wygenerowanych opisów \* 5 minut) - czas spędzony w aplikacji
- Częstotliwość: Miesięczna

M-014: Average Batch Size

- Definicja: Średnia liczba produktów w batch jobie
- Cel MVP: ≥20 produktów
- Pomiar: Suma produktów we wszystkich jobach / liczba jobów
- Częstotliwość: Tygodniowa, agregacja miesięczna

M-015: Token Usage Efficiency

- Definicja: Średnia liczba tokenów wykorzystanych per produkt (input + output)
- Cel MVP: <3000 tokenów (optymalizacja kosztów)
- Pomiar: OpenRouter analytics - token usage per request
- Częstotliwość: Per request, agregacja tygodniowa

M-016: Infrastructure Cost per User (monthly)

- Definicja: Średni koszt infrastruktury (Supabase + DigitalOcean + OpenRouter) per aktywny użytkownik
- Cel MVP: <$5/użytkownik/miesiąc
- Pomiar: Faktury providerów / liczba aktywnych użytkowników
- Częstotliwość: Miesięczna

### 6.4 Metryki jakości i satysfakcji użytkownika

Cel: Użytkownicy są zadowoleni z jakości generowanych treści i doświadczenia aplikacji

M-017: Edit Rate (minor edits)

- Definicja: Procent opisów edytowanych przez użytkownika przed zapisem (zmiany <10% tekstu)
- Cel MVP: <40%
- Pomiar: Porównanie wygenerowanej wersji vs. zapisanej (Levenshtein distance)
- Częstotliwość: Per produkt, agregacja tygodniowa

M-018: Rejection Rate

- Definicja: Procent wygenerowanych opisów całkowicie odrzuconych przez użytkownika
- Cel MVP: <20%
- Pomiar: Liczba odrzuconych opisów / liczba wygenerowanych
- Częstotliwość: Per batch job, agregacja tygodniowa

M-019: Retry Rate (failed products)

- Definicja: Procent użytkowników ponownie generujących opisy dla produktów z błędami
- Cel MVP: ≥70%
- Pomiar: Tracking "retry" action w UI dla failed products
- Częstotliwość: Per job, agregacja tygodniowa

M-020: User Satisfaction Score (qualitative)

- Definicja: Średnia ocena satysfakcji użytkowników (skala 1-5) z jakości opisów i doświadczenia
- Cel MVP: ≥4.0/5.0
- Pomiar: Ankieta po zakończeniu beta testów (wersja 2.0)
- Częstotliwość: Koniec fazy prototypu

### 6.5 Alerty i progi interwencji

System generuje automatyczne alerty dla administratora przy przekroczeniu następujących progów:

CRITICAL (natychmiastowa interwencja):

- Error rate >10%
- System uptime <95%
- Average response time >5s/produkt

WARNING (monitoring i analiza):

- Error rate >5%
- System uptime <99%
- Average response time >2s/produkt
- Job queue depth >5
- Cost per description >$0.15

INFO (tracking trendu):

- Acceptance rate <80%
- Rejection rate >20%
- Bulk update ratio <70%

### 6.6 Dashboard metryk

Dla administratora dostępny jest dashboard w Supabase Metrics pokazujący:

- Real-time: response time, error rate, queue depth, uptime
- Dzienny: liczba jobów, produktów, koszty, success rate
- Tygodniowy: trendy wydajności, user retention, feature usage
- Miesięczny: koszty infrastruktury, user satisfaction, ROI analysis

Dla użytkownika dostępny jest uproszczony dashboard pokazujący:

- Liczba wygenerowanych opisów (dziś/tydzień/miesiąc)
- Zaoszczędzony czas
- Koszty tokenów (dziś/tydzień/miesiąc)
- Historia ostatnich 10 jobów
