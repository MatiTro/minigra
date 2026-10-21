# Zmiana na magazynie — edycja pokazowa 1.2

Gra 2D w przeglądarce. Wojtek, Lider, palety, telefony i jedna bardzo ważna dodatkowa wiadomość. Trzy rozdziały, sześć misji, prolog i rozmowa końcowa. Za dobry wynik: **200 zł brutto podwyżki**.

## Poprawki 1.2

- Wózek startuje w wolnym miejscu we wszystkich misjach, także przy wydaniu palet do bufora. Można ruszyć w obu kierunkach; najbliższą paletę można od razu podjąć.
- Mapa magazynu ma 1680 × 1560 zamiast 1800 × 1620. Skrócono środkową alejkę i część produkcyjną, zachowując przejazdy z pełną paletą.
- Piesi przechodzą na drugą stronę i wracają tą samą trasą, z postojem na końcach. Nie przeskakują na początek cyklu. Dodatkowy pracownik potrafi nagle przebiec poza pasami: najpierw jest widoczny przy drodze i pojawia się ostrzeżenie.
- Marysia ma ilustrowany portret blondynki, a Jarek bordową koszulkę i szelki. Fotel wózka jest pusty po wyjściu Wojtka i zajęty po wejściu.
- Siodło ciągnika jest wewnątrz przedniej części naczepy. Krótsza odległość sworznia od osi odpowiada rysunkowi kół; wspólny punkt podczepienia pozostaje nieruchomy względem obu części podczas skrętu i cofania.
- Avera i Paktech zaczynają przy otwartej bramie, przodem w stronę placu. Portiernia stoi obok wjazdu. Podjazd pod jedynkę mocniej ściąga busa; poza tym obszarem plac jest płaski. Hamulec zatrzymuje staczanie.
- Uproszczono prolog, a pochwała Lidera jest rozmową bez animacji poklepywania.
- Zapisy z 1.1 zachowują ukończone misje; bieżące zadanie rozpoczyna się na nowym układzie. Zapisy 1.2 zachowują dokładny postęp.

## Mechanika i scenariusze

- Nowy model skrętu i cofania zestawu: ciągnik porusza się względem tylnej osi, siodło prowadzi niezależną naczepę, a cofanie z dużym złożeniem wymaga korekty do przodu. Bieg przeciwny najpierw wyhamowuje pojazd.
- Cztery palety AVERY stoją **wewnątrz otwartej naczepy pod rampą 4**. Wjeżdżasz wózkiem, podejmujesz najbliższą paletę i wycofujesz na halę.
- Przebudowane alejki, przejazd na produkcję, CTP i wjazd do chemii. Kolizje uwzględniają cały obrócony wózek oraz paletę na widłach. Trasy sprawdzane są również rzeczywistym gazem, skrętem, hamowaniem i cofaniem w tym samym silniku, który działa w grze.
- Lider siedzi przy biurku w biurze magazynu. Przy rozmowie widać obie postacie; w salce siedzą naprzeciwko siebie. Dymki mają ogonek skierowany do mówiącej osoby. Rozmówcy przez telefon pojawiają się w małej karcie połączenia.
- BHP-owiec najpierw dobiega do Wojtka. Do zakończenia dobiegu nie ma tekstu ani możliwości przeskoczenia do rozmowy.
- Drobnica wymaga ustawienia palety w zielonym obrysie, z odchyleniem kierunku do około 11°. Tuż obok jest strefa dostępu do gaśnicy. Zastawienie jej wywołuje uwagę; nie kończy odkładania.
- Dialogi magazynowe, żart o premii i ostrzeżenie przechodzącego pracownika.
- Zmieniona mapa wymaga rozpoczęcia bieżącej misji od nowa przy wczytaniu starego zapisu. Ukończone wcześniej misje pozostają zachowane. Nowe zapisy wznawiają dokładny postęp.

## Oprawa i animacje 1.0

- Ilustrowani Wojtek i Lider: portrety, cztery kierunki patrzenia oraz naprzemienne kroki podczas chodzenia.
- Spójne ilustrowane sylwetki pracowników produkcji, BHP-owca i ochroniarza, obracane zgodnie z kierunkiem ruchu.
- Szczegółowe obrazy regałów, maszyn, wózka, busa, ciągnika i niezależnie obracającej się naczepy; cienie, oznaczenia dróg, tekstury podłoża i wyposażone biuro.
- Animacje podnoszenia i odkładania palet, wiązka skanera, zdejmowanie folii, przenoszenie kartonów, odbiór wydruków i przekazywanie dokumentów. Przedmiot zmienia właściciela dopiero po zakończeniu czynności.
- Ruch papieru na maszynach, migające kontrolki, ślady opon, światła, delikatne efekty otoczenia i reakcje na błędy.
- Dźwięk silnika, sygnał cofania, kroki i odgłosy interakcji; włączanie/wyłączanie dźwięku przyciskiem. Dźwięk startuje po pierwszej interakcji gracza.
- Animowane rozmowy i telefon, wejścia do misji, lista etapów zadania, pełny ekran, regulowana kamera i wygładzone renderowanie 1×/2×. Systemowe ograniczenie animacji wyłącza efekty dekoracyjne.
- Zachowany scenariusz sześciu misji, prolog i podsumowanie zmiany.

## Jak uruchomić

Otwórz `index.html` dwuklikiem. Nie wymaga instalacji, internetu, serwera ani konta. Wszystkie grafiki, dźwięki i kod są w tym pliku. Najwygodniej grać na komputerze, z klawiaturą; są też przyciski dotykowe.

Na ekranie startowym wybierz pełną zmianę albo osobną misję do testów. Próby pojedynczych misji mają osobny zapis i nie zastępują postępu pełnej zmiany.

## GitHub Pages

1. Utwórz repozytorium i wgraj **zawartość ZIP-a** do jego katalogu głównego. `index.html` ma leżeć bezpośrednio w katalogu głównym, bez dodatkowego folderu nadrzędnego.
2. Otwórz **Settings → Pages → Build and deployment**. W polu **Source** wybierz **Deploy from a branch**.
3. Wybierz gałąź **main** i katalog **/(root)**, potem **Save**. Jeżeli Twoja gałąź ma inną nazwę, wybierz ją zamiast main.
4. Poczekaj na publikację, a następnie otwórz adres pokazany przez GitHub Pages i przekaż go graczom.

Nie trzeba uruchamiać kompilacji, npm ani backendu. Do samego grania wystarcza `index.html`; plik `.nojekyll` jest dołączony do paczki. Źródła i grafiki służą do dalszego rozwoju.

Instrukcja GitHub: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Sterowanie

| Klawisz | Działanie |
| --- | --- |
| WASD / strzałki | Chodzenie; w pojeździe kierownica oraz jazda |
| W / ↑ | Gaz i jazda do przodu |
| S / ↓ | Hamowanie przed zmianą kierunku, następnie jazda wstecz |
| Spacja | Hamulec |
| R | Przełączenie biegu D/R; przycisk gazu na ekranie używa wybranego biegu |
| Shift / przycisk WOLNO | Precyzyjne, powolne manewry |
| E | Interakcja wskazana przy postaci: podjęcie, skan, odłożenie, rozmowa itd. |
| Q | Wsiadanie do wózka / wysiadanie |
| M / T / G | Poczta / telefon / mapa |
| Enter / E w rozmowie | Następny dymek; przy dzwonieniu odbiera telefon |
| Esc | Pauza |

Zatrzymaj pojazd przed operacją. Podjeżdżaj do palet widłami. Ręczne zadania, komputer i drukarka wymagają wysiadania z wózka. Przy wydaniach do bufora zatrzymaj paletę w strefie rozpakowania, wysiądź, rozpakuj i wróć na wózek. Złoty znacznik i strzałka prowadzą do bieżącego celu. Dodatkowe kartony trzeba odnaleźć na podstawie e-maila.

## Co jest w grze

1. **Avera pod czwórkę:** animowany telefon, cztery skośne rampy, zajęta druga rampa, cofanie zestawem z naczepą i dwie sekundy hamowania w poprawnym położeniu.
2. **Rozładunek i chemia:** cztery palety zdejmowane z naczepy, NI, jednorazowy błąd trzeciego skanu, Lider i Marysia, ponowny skan, ciasny magazynek chemiczny i piesi na produkcji. Na koniec pochwała i rozmowa o premii przy biurku Lidera.
3. **Paktech:** ten sam plac, bus pod rampę 1, staczanie na podjeździe i obowiązkowe przytrzymanie hamulca.
4. **Drobnica:** ręczne przenoszenie kartonów, rozmowa o kodach, transport palety, dostęp do gaśnicy, przyjęcie z e-maila, druk i zaniesienie etykiet na tę samą paletę.
5. **Produkcja:** potwierdzenie planu dla D1-1, D1-2, D2-1, D2-2, D3-1; pobranie, ręczne rozpakowanie i bufor. E-mail o dodatkowych kartonach w trakcie pracy. Pominięcie ich i wejście do biura uruchamia pierwsze ostrzeżenie; trzeba poprawić wydanie i wrócić.
6. **CTP i Polimer:** przejazd przez produkcję z pieszymi i paletą na drodze, dostawa beczek, odbiór zwrotu, powrót pod jedynkę, telefon ochrony, załadunek dwóch palet, telefon do Jarka, e-mail z BDO, wydruk i zaniesienie do busa.

Finał odbywa się w salce. Lider podsumowuje zadania i błędy. Przy dobrym wyniku daje 200 zł brutto podwyżki; przy słabym prosi o większe starania.

## Czas, BHP i ocena — ustawienia testowe

- Każda misja ma własny limit czasu. Czytanie dialogów, menu i wiadomości zatrzymuje zegar. Limity są w `src/core.js`, w tablicy `MISSIONS`.
- Dwie uwagi BHP lub trzy kolizje prowadzą do rozmowy w salce i ostatniej szansy. Kolejne naruszenie po tej rozmowie kończy próbę zwolnieniem Wojtka.
- Potrącenie pieszego natychmiast kończy próbę sceną więzienia. To umowna konsekwencja fabularna gry.
- Skryptowy błąd skanowania nie obciąża wyniku. Ostrzeżenie za pominięte kartony jest osobną uwagą dotyczącą wykonania pracy.
- Wynik: 100 minus 12 za uwagę BHP, 9 za kolizję, 20 za pominięte kartony i 10 za nieudaną próbę. Podwyżka wymaga ukończenia sześciu misji, minimum 80 punktów, braku pominiętych kartonów i braku ostatniej szansy.
- Prędkości, limity i progi są umownymi ustawieniami do testów; oznakowanie i reguły zakładowe można dopasować w kolejnej wersji. Połączenia, poczta, przyjęcia i dokumenty są symulowane wewnątrz gry.

## Robocze decyzje do oceny

- Jeden wspólny magazyn z biurem, salką, drobnicą, buforem, produkcją, chemią i CTP; osobny, wspólny dla obu dostaw plac manewrowy.
- Cztery palety AVERY, w tym chemia; sześć kartonów Paktech; pięć podstawowych palet do produkcji, po jednej na maszynę. Przypisanie folii/papieru jest przykładowe.
- Druga paleta beczek dla Polimeru czeka wcześniej przy rampie 1. Nie ma dodatkowego kursu po nią.
- Kartony dodatkowe są za regałem C; po przeczytaniu e-maila pojawia się znacznik. Trafiają do pola PAKOWANIE obok bufora.
- Oprawa jest płynnym, ilustracyjnym 2D: otoczenie łączy grafiki ilustracyjne z rysowaniem Canvas, osobne portrety Wojtka i Lidera oraz kierunkowe sylwetki i kroki bohaterów. Marysia i Jarek mają własne ilustrowane portrety w kartach telefonu. Kamera ma przybliżanie przyciskami − / +.

## Zapis

Postęp zapisuje się lokalnie w przeglądarce po akcjach i co około 5 sekund. Zapis nie jest wspólny między komputerami. W pauzie wybierz **Pobierz zapis** lub **Wczytaj zapis**, aby przenieść go ręcznie. Zapis z pliku lokalnego i z GitHub Pages jest oddzielny. Przed czyszczeniem danych przeglądarki albo przenoszeniem gry pobierz zapis.

## Kod i sprawdzenie

- `index.html` — gotowa, samodzielna gra.
- `src/core.js` — scenariusze, punktacja, zapis i kinematyka pojazdów.
- `src/world.js` i `src/physics.js` — wspólna geometria mapy, obrysy, kolizje i rzeczywisty ruch używany w grze oraz testach.
- `src/scenes.js` — aktorzy scen, dobieg i kolejność rozmów.
- Pozostałe pliki `src/` — grafika, animacje, interfejs i sterowanie.
- `assets/` — ilustracje postaci, pojazdów i wyposażenia osadzone także w samodzielnym HTML; manifesty opisują kadry atlasów.
- `ASSETY.md` — opis powstania ilustracji i użyte prompty.
- `python3 build.py` — odtwarza `index.html` ze źródeł.
- `node --test tests/*.test.cjs` — testy scenariuszy, fizyki, zapisu i przejezdności.
- `node --expose-gc tests/render-smoke.cjs` — dodatkowe sprawdzenie uruchamiania i renderowania w natywnym Canvas; wymaga deweloperskiej biblioteki `@napi-rs/canvas`. Nie jest potrzebne do grania.

Zaliczono 44 testy automatyczne. Weryfikacja obejmuje animacje czynności i scen, przejazdy z pełnym obrysem ładunku, zasady wszystkich misji, oba warianty z kartonami, wydruki, parking, hamulec, kary, zapis oraz renderowanie Canvas. Pełny test w prawdziwej przeglądarce i strojenie odczuć z jazdy pozostają do wspólnych testów z użytkownikami.
