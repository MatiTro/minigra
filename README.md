# Zmiana na magazynie — Lider, Wojtek i codzienna robota

Rozszerzenie gry RAMPA 04. Trzy rozdziały, rozmowy, jazda tirem i busem, obsługa wózka, skanowanie NI oraz praca pieszo.

## Uruchomienie

Rozpakuj ZIP i otwórz `index.html` w przeglądarce. Gra działa bez instalacji i internetu. W pliku są wszystkie grafiki, style, mechanika i dźwięki.

W menu można rozpocząć całą zmianę, kontynuować zapis lub od razu wybrać dowolny z trzech rozdziałów. Wybór rozdziału rozpoczyna nową próbę od tego miejsca.

## Rozdziały

| Rozdział | Zadania |
| --- | --- |
| 01 — Avera | Podstaw tira pod rampę 4. Wsiądź do wózka, zeskanuj NI czterech palet, podejmij je i odłóż na wskazane lokalizacje. |
| 02 — Paktech | Po telefonie z ochrony podstaw busa pod rampę 1. Następnie pieszo przenieś sześć kartonów z rampy na paletę. |
| 03 — Pierwsza zmiana | Zdejmij pięć palet z regałów na pola R1–R5. Wysiądź, rozpakuj wszystkie palety i przewieź je do pól BUF-1–BUF-5. |

Lider jest łysy i nosi bordową koszulkę. Wojtek jest niższy, ma niebieską czapkę i granatową koszulkę. Gracz steruje Wojtkiem, a podczas podstawiania pojazdów przejmuje kierownicę.

Rozmowy zawierają podane teksty o kontenerze, dostawach Avera i Paktech oraz zaległej pierwszej zmianie. Rozmowy zatrzymują zegar; można przejść dalej spacją, Enterem lub przyciskiem. Jest też przycisk pominięcia rozmowy.

## Sterowanie

| Czynność | Klawiatura | Ekran / tablet |
| --- | --- | --- |
| Gaz | ↑ / W | Przytrzymaj GAZ |
| Hamulec | ↓ / S / spacja | Przytrzymaj HAMULEC |
| Kierownica | ← → / A D | Przeciągnij koło albo przytrzymaj ‹ / › |
| Przód / tył | E po zatrzymaniu | D / R |
| Wykonaj czynność | F | Duży przycisk z prawej |
| Wsiądź / wysiądź z wózka | Q | Przycisk „wózek” |
| Chodzenie | Strzałki / WASD | Krzyżak kierunkowy |
| Kolejna wypowiedź | Spacja / Enter | Dalej |
| Pauza | P / Escape | Ikona pauzy |

Kierownica wraca do środka po puszczeniu. Wózek ma skrętną tylną oś. Zatrzymaj wózek przed podjęciem lub odłożeniem palety i kieruj **widły** w stronę zaznaczonego miejsca. Przycisk F zmienia opis zależnie od dostępnej czynności.

### Rozładunek i skaner

1. Podjedź widłami do palety w naczepie.
2. F otwiera terminal NI. Wybierz „Skanuj etykietę” lub naciśnij Enter.
3. Terminal odczyta NI i wskaże miejsce odłożenia.
4. F podejmuje paletę. Wycofaj z naczepy i jedź do podświetlonej lokalizacji.
5. Ustaw widły przy polu i wybierz F, aby odłożyć. Każda paleta ma przypisaną lokalizację.

### Rozpakowanie i bufor

Najpierw zdejmij wszystkie pięć palet z regałów i odstaw na przypisane pola R1–R5. Gdy ruszy etap rozpakowania, zatrzymaj pusty wózek i wysiądź Q. Podejdź do każdej palety i użyj F. Po zdjęciu folii ze wszystkich palet wróć do wózka, wsiądź Q i przewieź palety do oznaczonych pól w buforze.

## Czas, wyniki i zapis

- Limit rozdziału: Avera — 8 minut, Paktech — 5 minut, Pierwsza zmiana — 10 minut.
- Każdy kontakt pojazdu z przeszkodą dodaje 5 sekund kary. Próba odłożenia na złą lokalizację dodaje 2 sekundy.
- Wynik rozdziału to czas pracy plus kary. Niższy wynik jest lepszy.
- Po upływie limitu można powtórzyć rozdział lub dokończyć go poza rankingiem. Kolejny rozdział ma własny limit.
- Czas zatrzymuje się podczas rozmów, pauzy i czytania ekranu skanera. Odczyt kodu oraz animacje wykonywania pracy wliczają się do czasu.
- Postęp zapisuje się po czynnościach, przy pauzie i okresowo podczas gry. Kontynuacja wznawia ostatni zapis, z zatrzymanym pojazdem. Nowa próba zastępuje bieżący zapis.
- Po zakończeniu rozdziału wynik automatycznie trafia do lokalnej tabeli pod imieniem wpisanym w menu, jeśli próba zmieściła się w limicie.
- Zapis i ranking dotyczą tej samej przeglądarki na tym samym urządzeniu. Nie ma wspólnego rankingu między komputerami.
- Tryb prywatny lub wyczyszczenie danych strony może usunąć postęp. Przy blokadzie pamięci gra zachowuje dane tylko do końca sesji.
- Zmiana karty lub okna w trakcie pracy automatycznie pauzuje grę.

## GitHub Pages — aktualizacja obecnej gry

1. Rozpakuj paczkę. **Nie przesyłaj samego ZIP-a.**
2. W obecnym repozytorium zastąp `index.html` nowym plikiem. Możesz też dodać lub zastąpić `README.md` oraz `.nojekyll`.
3. Zapisz zmianę przyciskiem **Commit changes**.
4. Jeśli GitHub Pages jest już włączone dla tego repozytorium, poczekaj na zakończenie publikacji i odśwież dotychczasowy adres gry. W razie wczytywania starej wersji użyj Ctrl+F5.

Przy nowym repozytorium: umieść pliki bezpośrednio w katalogu głównym, następnie wybierz **Settings → Pages → Deploy from a branch → main → /(root) → Save**. Wybierz faktyczną gałąź z plikami, jeśli ma inną nazwę. W planie GitHub Free użyj repozytorium publicznego.

Źródło ustawień hostingu: [dokumentacja GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Weryfikacja wersji 0.2

Sprawdzono 24 scenariusze logiki gry: pełną kolejność trzech rozdziałów, skanowanie, prawidłowe i błędne odkładanie, kartony, regały, rozpakowanie pieszo, bufor, zapis i kontynuację, pauzy, kary oraz limit czasu. Symulacja potwierdziła możliwość dojazdu busem od startu do rampy 1, a także przejazdu wózkiem od rzeczywistego miejsca startowego po pierwszą paletę i do jej lokalizacji na regale.

Plansze i postacie wygenerowano rzeczywistym silnikiem Canvas/SVG i obejrzano. W tej sesji nie wykonano testu całego interfejsu, dźwięku ani dotyku w uruchomionej przeglądarce. Przed pokazem warto przejść jedną próbę na docelowym komputerze.

To gra zręcznościowa z umownym planem magazynu i uproszczoną fizyką. Nie łączy się z systemami firmowymi.
