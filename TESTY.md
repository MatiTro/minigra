# Sprawdzenie edycji pokazowej 1.2

Data: 20.10.2026.

## Testy automatyczne

53 testy w sześciu plikach: zasady scenariuszy i zapis (20), animowane czynności (6), geometria pełnych obrysów i drogi piesze (3), kolejność i obsada scen (4), rzeczywiste manewry pojazdów (12), regresje wydania 1.2 (8).

- Gaz, sterowanie, hamowanie i cofanie działają w testach przez ten sam `physics.js`, który wywołuje gra.
- Fizyczne wycofanie czterech palet z otwartej naczepy przez rampę 4.
- Transport trzech NI na składowanie wraz z powrotami pustego wózka do naczepy.
- Pełny obrys wózka i ładunku na drodze transportowej, ominięcie przeszkody i wjazd do CTP.
- Odbiór zwrotu, przejazd na magazyn, odłożenie pod jedynką i załadunek obu palet na Polimer.
- Wjazd z pełnym ładunkiem do chemii i wycofanie po odłożeniu.
- Wjazd do drobnicy, precyzyjne odłożenie i wyjazd. Przesunięcie palety w strefę gaśnicy wywołuje uwagę i nie zalicza odkładania.
- Każda z pięciu palet do produkcji oraz dodatkowe kartony: podjęcie, rzeczywista jazda do strefy rozpakowania, bezpieczne wyjście z wózka, dojście do stanowiska i odłożenie w buforze.
- Cofanie tira pod rampę, kontrola kolizji i przytrzymanie hamulca do zaliczenia. Porównanie kinematyki przy 30 i 120 krokach na sekundę.
- Przeciwny kierunek reakcji naczepy przy cofaniu i prostowanie zestawu podczas jazdy do przodu.
- BHP biegnie przed rozmową. Wejście/Enter w fazie dobiegu nie przeskakuje do tekstu. Rozmowy w salce zawierają obie siedzące postacie.
- Ruch wózka w pracownika kończy próbę natychmiastową przegraną.
- Zachowana kolejność skanu, Marysi, chemii, etykiet, dodatkowych kartonów, telefonów i dokumentów BDO; kary i finał.
- Migracja poprzednich zapisów zachowuje ukończone misje i rozpoczyna bieżącą na nowej mapie.

Testy tras uruchamiają sterowanie z określonych pozycji początkowych, a później wykonują manewry bez przestawiania pojazdu. W testach przejezdności czas pieszych jest zamrożony na bezpiecznej fazie; oddzielny test sprawdza potrącenie w ruchu. Nie są to testy umiejętności człowieka ani balansu poziomu trudności.

## Regresje 1.2

- Wolny pełny obrys na starcie każdej misji magazynowej i rzeczywiste ruszenie do przodu oraz do tyłu.
- Podjęcie najbliższej palety bez przestawiania wózka ze startu bufora i jazda z ładunkiem.
- Start obu dostaw przy bramie i przejazd w głąb placu.
- Zgodność sworznia naczepy z siodłem w skrętach do przodu i wstecz; oba obrysy obejmują wspólny punkt.
- Silniejsze staczanie Paktechu, utrzymanie na hamulcu, możliwość cofnięcia pod górę oraz brak staczania na płaskim wjeździe.
- Ciągłość położenia pieszych przez trzy cykle; brak teleportowania przy zawracaniu.
- Widoczny początek biegu poza pasami, ostrzeżenie, krótka chwila na reakcję i postój po drugiej stronie.
- Mniejsza powierzchnia mapy i migracja zapisu 1.1.

## Renderowanie i integracja

Natywny Canvas z adapterem DOM sprawdza uruchomienie sześciu misji, interakcje, zapis i wznowienie oraz całą kampanię do finału z 200 zł brutto. Pozycje w tym osobnym teście scenariusza są ustawiane przez adapter; przejezdność weryfikują opisane wyżej testy rzeczywistej jazdy. Obejrzano również obraz rozmowy w biurze, dobieg BHP, plac, skręcony zestaw, start bufora, pusty i obsadzony wózek, portrety Marysi i Jarka oraz przebiegającego pracownika.

Sprawdzone renderowanie 1× i 2×. Adapter wymusza odczyt pikseli po rysowaniu, aby opróżniać odroczone polecenia Skia. Kod przeglądarki nie zawiera tego obejścia. Pamięć teł gry obejmuje najwyżej jeden aktualny magazyn i jeden plac; nie zachowuje osobnego dużego tła dla każdej misji.

Samodzielny HTML zawiera osiem grafik PNG, style i skrypty bez zależności sieciowych. Archiwum ma `index.html` bezpośrednio w katalogu głównym oraz `.nojekyll`.

Nie przeprowadzono pełnego testu w rzeczywistej przeglądarce. Adapter nie sprawdza dźwięku z głośników, pełnego ekranu, układu zewnętrznych przycisków CSS ani prawdziwego dotyku. Dymki i karta rozmówcy są rysowane przez produkcyjny Canvas i pojawiają się w natywnych renderach.

## Polecenia

```sh
python3 build.py
node --test tests/*.test.cjs
node --expose-gc tests/render-smoke.cjs
node --expose-gc tests/render-smoke.cjs --retina
```

Renderowanie wymaga deweloperskiej biblioteki `@napi-rs/canvas`; nie jest potrzebna do grania ani publikacji. Test tworzy PNG w katalogu `qa` obok projektu. Ścieżkę fontu DejaVu Sans w adapterze można dostosować do systemu operacyjnego.
