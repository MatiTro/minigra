# Ilustracje edycji 1.2

Wygenerowano wbudowanym narzędziem image_gen (bez CLI). Obrazy zachowują przezroczystość. Są częścią paczki oraz są osadzone jako dane w gotowym HTML, aby gra działała offline. Kadry atlasów są wybierane podczas renderowania przez Canvas.

Pliki:

- `assets/wojtek-lider-portraits.png` — dwa portrety do dialogów i ekranu startowego.
- `assets/wojtek-lider-directions.png` — osiem sylwetek, cztery kierunki dla każdej postaci.

## Prompt portretów

Use case: illustration-story. Asset type: two-character dialogue portrait atlas for a polished humorous 2D warehouse browser game. Create one WIDE landscape 2:1 image, exactly two equally sized portrait regions arranged left and right on a genuinely transparent background. LEFT HALF: Wojtek, a short young adult Polish warehouse worker, expressive friendly face, blue baseball cap, navy blue plain t-shirt, upper body including shoulders and forearms, holding a small barcode scanner, slightly bemused optimistic smile. RIGHT HALF: Lider, a bald middle-aged Polish warehouse team leader, plain burgundy/maroon polo shirt, friendly but tired and slightly stern knowing expression, upper body including shoulders and forearms, one hand with clipboard. Style: premium hand-painted modern 2D game character illustrations, charming grounded cartoon proportions, finely drawn expressive eyebrows and eyes, natural fabric folds, dimensional soft shading, warm rim light, delicate outlines, clean and professional, high detail, not pixel art, not blocky, not voxel, not photorealistic, not 3D. Same scale and same medium shot framing for both, heads and shoulders safely within their separate exact halves, generous transparent margin around each figure, no overlap across the center. Background fully transparent. No writing, no letters, no logos, no borders, no frames, no extra people. They are fictional characters.

## Prompt sylwetek

Use case: stylized-concept. Asset type: production sprite atlas for an illustrated 2D top-down warehouse RPG browser game. Create one wide 2:1 transparent PNG with a PRECISE regular 4 COLUMN by 2 ROW grid of EIGHT FULL BODY character sprites, equally spaced in exact equal square cells, every full body completely inside its own cell, generous clear transparent gutters, same foot baseline and scale in each row. NO grid lines or text. TOP ROW four views of one SAME character Wojtek: short young adult man, friendly face, blue baseball cap, navy blue plain t-shirt, dark work trousers, brown safety shoes. BOTTOM ROW four views of one SAME character Lider: slightly taller stockier bald middle-aged man with short light stubble, burgundy/maroon plain polo shirt, dark gray work trousers, dark safety shoes. EACH ROW view order strictly: COLUMN 1 facing DOWN toward the viewer, COLUMN 2 profile facing RIGHT, COLUMN 3 back view facing UP away from the viewer, COLUMN 4 profile facing LEFT. Camera consistent moderately elevated 35-degree overhead view, recognizable top of cap/head and shoulders, standing natural idle pose with hands at sides, full body including both feet. High-quality modern 2D painted game sprites, finely shaded shapes, soft realistic fabric folds, expressive cartoon RPG proportions around 4 heads tall, clean delicate outlines, professional indie game polish, high detail. Not blocky, not pixelated, not voxel, not photorealistic, no floor, no environment, no cast shadow extending outside the cell, no weapons, no objects, no extra figures. Genuinely transparent background. Keep every view aligned and fully separate for programmatic cropping in the game.

## Dodatkowe atlasy edycji 1.0

- `assets/wojtek-lider-walk.png` — 4 kolumny × 4 wiersze, naprzemienne kroki. Wiersze: Wojtek A, Wojtek B, Lider A, Lider B. Kolumny: dół, prawo, góra, lewo. Animacja wybiera klatki podczas rzeczywistego ruchu; Canvas normalizuje kadry przezroczyste do zgodnej wysokości.
- `assets/warehouse-props.png` i `.json` — regał, maszyna drukarska, wózek i bus. Prompt i uwagi dotyczące kadrów: `assets/warehouse-props-source.md`.
- `assets/truck-atlas.png` i `.json` — osobne ciągnik i naczepa. Prompt i punkty obrotu: `assets/truck-atlas-source.md`.

### Prompt chodu

Edit the supplied direction atlas into a walking animation atlas. Preserve the exact identities, clothing colors and modern painted 2D RPG sprite style: short Wojtek in blue cap and navy shirt, taller bald Lider in burgundy shirt. Precise regular FOUR COLUMN by FOUR ROW grid, every full body fully inside its own equal square cell, generous transparent gutters, consistent scale and foot baseline, no overlap. Row 1 Wojtek walking step A; row 2 Wojtek walking step B with the opposite leg forward and opposite arm swing. Row 3 Lider walking step A; row 4 Lider walking step B with opposing limbs. Column order in every row: facing down, right, up, left. Moderate 35-degree overhead view. Real alternating walking poses with clear leg and arm movement, not duplicated idle frames. Entire head and both feet visible. No text, no grid, no floor, no background; genuinely transparent PNG.

Atlasy PNG zachowano bez zmian po generacji; osobny pusty wózek przygotowano przez wybór prostokątnego kadru z edytowanego atlasu. Manifesty opisują granice źródłowych kadrów; dopasowanie skali i wybór klatek odbywa się w Canvas podczas gry.

## Pracownicy, BHP i ochrona

`assets/warehouse-people.png` — 4 kolumny × 3 wiersze. Wiersze: pracownik produkcji w szaroniebieskiej koszulce i ciemnej czapce, specjalista BHP w żółtym kasku i kamizelce, ochroniarz w oliwkowym mundurze. Kolumny: dół, prawo, góra, lewo. Kadry Canvas normalizuje do wspólnej wysokości; w ruchu mają delikatne kołysanie. To kierunkowe sylwetki, nie atlas naprzemiennych kroków bohaterów.

Prompt: Create a production sprite atlas for a polished humorous Polish warehouse browser game. Transparent PNG, landscape 4:3. EXACT regular 4 COLUMNS by 3 ROWS, TWELVE isolated full-body sprites in equal square cells with generous transparent gutters. No grid, text or floor. Each row is the same character in four views: down, right, up, left. Moderately elevated 35-degree overhead camera, four-head-tall grounded cartoon proportions, consistent size and foot baseline, entire head and both shoes inside each cell. Row one: adult male production worker, slate-blue polo, dark grey baseball cap, navy work trousers, black safety shoes, white ID lanyard. Row two: middle-aged male safety officer, yellow hardhat, yellow reflective vest with silver strips over grey polo, navy trousers and safety shoes. Row three: male security guard, dark green peaked cap, olive uniform shirt with epaulettes, dark green trousers and black shoes. Modern hand-painted indie RPG style, delicate contours, shaded natural fabric folds, expressive faces, soft dimensional light and crisp silhouettes. Not pixel art, blocky, voxel, icon, photo or 3D. Fictional characters. No cast shadow beyond sprites, weapons, props or extra people. Genuinely transparent background.

## Wykorzystanie w 1.1

Użyto tych samych ilustracji. Nowa otwarta naczepa, podest rampy i wyposażenie biurka są rysowane w Canvas. Skala i położenie ciągnika odpowiadają teraz pivotowi tylnej osi w fizyce, a naczepa łączy się w punkcie siodła. Dymki z ogonkiem, karta rozmówcy telefonicznego i etykiety scen są renderowane przez ten sam Canvas co gra. Animacja pracowników dodaje fazę kroków przez wybór i przesunięcie dolnych fragmentów sylwetki w czasie rysowania; źródłowe PNG pozostają niezmienione.


## Dodatki 1.2

- `assets/contacts-portraits.png`: dwa portrety na przezroczystym tle. Lewa połowa: blondynka Marysia ze słuchawką i tabletem. Prawa połowa: Jarek w bordowej koszulce i szelkach, z dokumentami. Nowa ilustracja image_gen, styl dopasowany do portretów Wojtka i Lidera.
- `assets/forklift-empty.png`: pusty fotel i kierownica. Narzędzie image_gen usunęło operatora z oryginalnego atlasu przy zachowaniu położenia pojazdu. Canvas wybrał kadr x=338, y=405, 248 × 466; plik jest osadzony w grze. Pusty i obsadzony wariant mają wspólne rozmiary oraz punkt obrotu.
- Stan obsady jest wybierany przy każdym rysowaniu: tryb wózka = Wojtek siedzi, tryb pieszy = pusty fotel. Wczytywanie wariantu pustego jest niezależne od kolejności dekodowania pozostałych atlasów.
