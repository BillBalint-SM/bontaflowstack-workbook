# Prototípus-kitérő — eljárás és elfogadás

Állapot: az eljárás regisztrálva és natív Codex-futtatásban kipróbálva. A fixture-ben szimulált útvonalakra vonatkozó próba sikerült; ez önmagában nem döntés egy tényleges BFS-termékváltoztatásról.

## Cél

Egy bizonytalan termék- vagy műszaki döntést a legkisebb futtatható kísérlettel vizsgáljon meg. A prototípus maradjon elkülönített és eldobható; az eredmény, a tényleges felhasználói választás és a következő munkalépés külön eredetjelölést kapjon.

## Elfogadási pontok

- Egy kérdés, cáfolható feltevés és megkülönböztető megfigyelés vezeti a próbát.
- Egy kis, helyben futtatható vizsgálat láthatóvá teszi a vitatott viselkedést.
- Az elkülönítésből és a `PROTOTYPE — disposable` jelölésből egyértelmű, hogy az artifact nem produkciós kód.
- A futás parancsa, kilépési kódja, megfigyelése és bemeneti azonosítója rögzül.
- Blokkolt vagy nem megkülönböztető próba eredménye „nem eldöntött”.
- A mért eredmény nem válik automatikusan user-döntéssé; a választás tényleges forrása megmarad.
- Produkciós implementáció csak kiválasztott irányból, specifikáción/designon át indul.

## Natív próba és eredmény

A regisztrált, bemenetekkel befagyasztott skillt két izolált fixture-projektben futtattam a meglévő methodology runnerrel (180 másodperces esetlimit):

- **P01 — megkülönböztető próba:** natív feladat `01a0f75a-5f66-7613-8064-9cfa2d4d8639`, Codex-folyamat kilépése `0`, 145 955 ms. A skill egyetlen `PROTOTYPE/compare.mjs` fájlt készített. `node PROTOTYPE/compare.mjs` kilépése `0`; a fix intake 3 irreleváns kérdést tett fel és válasz nélkül nem jutott el a checkhez; a célvezérelt út 0 ilyen kérdéssel elindította `node test.mjs`, amely szintén `0`-val végzett. Az eredeti 7 fixture fájl hash-e egyezett, változás csak a PROTOTYPE mappában történt. A modell elvárt kimenete és inputhash-ei a futás `PROTOTYPE/REPORT.md` jelentésében vannak.
- **P02 — nem eldönthető eset:** natív feladat `01a0f75a-5ecb-7460-aeff-361a2c2bdfc8`, Codex-folyamat kilépése `0`, 72 126 ms. A „make the workflow feel better” kérésből hiányzott a felhasználói csoport, érintett lépés, konkrét súrlódás, alternatíva és sikerfeltétel. A skill ezeket nevezte meg, nem készített prototípust; a projektfájlok változatlanok maradtak.

A P01 eredménye csak az előre rögzített modell és kérelem összehasonlítását támasztja alá. Nem mér valós felhasználói elégedettséget, és nem bizonyítja, hogy minden tisztázó kérdés fölösleges. A próba nem választott BFS-szabályt; termékdöntéshez külön felhasználói választás és elfogadott implementációs alap szükséges.
