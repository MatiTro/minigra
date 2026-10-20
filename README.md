# RAMPA 04 — pod czwórkę!

Mini gra parkingowa z widokiem z góry. Ochroniarz zgłasza dostawę, magazynier wskazuje rampę 4, a kierowca ma 180 sekund, aby podstawić naczepę tyłem do rozładunku.

## Zagraj od razu

Otwórz plik **index.html** w aktualnej przeglądarce, np. Edge, Chrome lub Firefox. Nie potrzeba instalacji, serwera, Node.js ani internetu. Wszystkie grafiki i dźwięki są częścią gry.

## Wrzuć na GitHub Pages

1. Rozpakuj paczkę ZIP.
2. Utwórz nowe repozytorium na GitHubie, np. `rampa-04`. W planie GitHub Free wybierz repozytorium publiczne.
3. Prześlij **zawartość** rozpakowanego folderu do głównego katalogu repozytorium. Najważniejsze: plik `index.html` ma być bezpośrednio w repozytorium, a nie w dodatkowym podfolderze. Nie wrzucaj samego ZIP-a.
4. Zapisz pliki przyciskiem **Commit changes**.
5. Otwórz **Settings → Pages**.
6. W **Build and deployment → Source** wybierz **Deploy from a branch**.
7. Wybierz gałąź **main**, folder **/(root)** i kliknij **Save**. Jeśli gałąź nazywa się inaczej, wybierz tę, na którą wgrałeś pliki.
8. Po zakończeniu publikacji w tym miejscu pojawi się adres gry. Zwykle ma postać `https://TWOJ-LOGIN.github.io/rampa-04/`.
9. Prześlij adres współpracownikom — każdy gra we własnej przeglądarce.

Podstawa instrukcji: [dokumentacja GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Sterowanie

| Czynność | Klawiatura | Ekran / dotyk |
| --- | --- | --- |
| Kierownica | ← → lub A / D | Przeciągnij kierownicę w lewo lub prawo; można też przytrzymać ‹ / › |
| Gaz | ↑ lub W | Przytrzymaj GAZ |
| Hamulec | ↓, S lub spacja | Przytrzymaj HAMULEC |
| Zmiana przód / tył | E, po zatrzymaniu | D — przód; R — wsteczny |
| Pauza / powrót | P lub Escape | Przycisk pauzy w prawym górnym rogu |
| Nowa próba | — | Pauza → Od początku |

Ikona drogi w nagłówku włącza i wyłącza linię przewidywanego toru cofania. Ikona głośnika włącza dźwięki. Puchar otwiera wyniki. Znak zapytania otwiera instrukcję. Przycisk pełnego ekranu działa, jeśli przeglądarka go udostępnia.

Na tablecie możesz jednocześnie trzymać gaz i kierować drugą dłonią. Po puszczeniu kierownica wraca do środka.

## Cel i punktacja

- Podjedź na plac i ustaw zestaw tak, aby **tył naczepy** znalazł się przy zielonej rampie **04**.
- Zatrzymaj naczepę w zielonym obrysie. Asystent rampy pomaga wyrównać oś, kąt i odległość.
- Zaliczona pozycja wymaga odchylenia osi poniżej 0,75 m, kąta poniżej 2,8°, odległości tyłu od punktu celu poniżej 1,05 m oraz prawie prostego ciągnika. To tolerancje gry, a nie zalecenia dla rzeczywistego manewru.
- Utrzymaj poprawne ustawienie przez około 1,4 sekundy. Naczepa musi stać.
- Wynik to czas manewru **plus 5 sekund za każde uderzenie**. Kara zmniejsza też pozostały limit 180 sekund. Niższy wynik jest lepszy.
- Po udanym manewrze wpisz imię i wybierz **Zapisz wynik**.

Wskazówka: zostaw sobie dużo miejsca. Przy cofaniu naczepa reaguje z opóźnieniem, dlatego małe ruchy kierownicą są skuteczniejsze. Jeśli zestaw mocno się złamie, zatrzymaj go, wybierz D i podjedź do przodu, aby się wyprostował.

## Jak rywalizować w biurze

Ranking zapisuje do ośmiu najlepszych wyników **w tej samej przeglądarce na tym samym urządzeniu**. Możecie podawać sobie komputer i zapisywać wyniki pod imionami.

Nie ma wspólnego rankingu między komputerami, kont użytkowników ani połączenia z serwerem. Tryb prywatny, wyczyszczenie danych strony lub blokowanie pamięci przeglądarki może usunąć wyniki. Przy zablokowanym zapisie gra nadal działa, a wyniki pozostają dostępne do zamknięcia sesji.

Przełączenie na inne okno lub kartę automatycznie zatrzymuje grę i zegar.

## Zawartość i zmiany

- `index.html` — cała gra, style, grafika, fizyka i dźwięki; można przenosić ten plik samodzielnie.
- `README.md` — ta instrukcja.
- `.nojekyll` — plik pomocniczy dla hostingu statycznego GitHub Pages.

W pliku `index.html`, w obiekcie `C`, można zmienić m.in. `timeLimit` (czas w sekundach), `penalty` (kara), `maxSpeed` i `maxReverse` (prędkości w jednostkach gry).

Gra wykorzystuje uproszczony model ciągnika i skrętnej naczepy. Jest rozrywką zręcznościową.

## Weryfikacja tej wersji

Sprawdzono 16 scenariuszy logiki gry: uruchomienie, odliczanie, gaz i hamulec, blokadę zmiany biegu podczas jazdy, skręt naczepy, kolizje, kary, pauzę, zaliczenie właściwej rampy, zapis wyniku, limit czasu, zwalnianie pedału po przerwaniu dotyku i ponowny start. Symulacja pełnej trasy od rzeczywistej pozycji startowej do rampy zakończyła się parkowaniem bez kolizji w limicie czasu.

Testy wykonano poza silnikiem przeglądarki. Wygląd, obsługa dotykowa i dźwięk nie zostały w tej sesji sprawdzone w uruchomionej przeglądarce; przed pokazem warto przejechać jedną próbę na docelowym komputerze lub tablecie.
