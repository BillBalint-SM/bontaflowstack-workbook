# Fő BFS-skillek módszertani bővítése

Állapot: a felhasználó elfogadta; a megvalósítás megkezdődött. Készült: 2026-09-30.
Felhasználói alap: a BFS-flow megtartása Matt módszereivel; a motor konkrét user
journey-t és érdemi haladást vezessen, a hatástalan kötelező lépések csökkenjenek.
Elfogadás: „Ezzel elfogadom a tervet” (2026-09-30, jelen beszélgetés).
A TDD a meglévő bfs-implement eljárásába épül. Ez a változat az elfogadott alap;
a végrehajtási bizonyítékok külön jelentésben és workflow-checkpointokban készülnek.

## 1. Cél és siker

A plugin az adott feladat következő érdemi lépését válassza ki az ismert tények,
érvényes döntések, nyitott kérdések és ellenőrizhető előfeltételek alapján.
Az eredmény: tisztázott felhasználói viselkedés, végrehajtható feladatok, ténylegesen
igazolt megvalósítás és külön értékelhető minőségi/követelményi review.

A kérdés előtt a plugin megállapítja, milyen választól hogyan változna a megoldás
vagy a következő lépés. Kikereshető tényt maga vizsgál meg; érvényes, már elfogadott
döntést újrahasznál; érdemi nyitott termékdöntést a felhasználótól kér.
Azonos érvényes bemenet mellett az ismert válaszra feltett ismételt kérdések száma
nulla. Új kérdéshez konkrét, még fel nem oldott következmény tartozik.

Egy kész, elfogadott specifikáció közvetlenül implementációhoz vezethet.
Egy kis javításnál az azonosítható beszélgetési követelmény és elfogadási eset is
elég alap. A dokumentumok terjedelmét és a bevont skilleket a feladat indokolja.

## 2. Tervezett változtatások

Az érintett útvonalak a `plugins/bontaflowstack/` könyvtárhoz képest értendők.

| Terület | Érintett forrás | Változás és kimenet |
|---|---|---|
| Döntési fa | `skills/bfs-business-builder/SKILL.md` | A következő megoldást befolyásoló döntések feltárása, függőségi sorrend, érvényes válaszok újrahasználata. Kimenet: választott irány, döntési forrás, nyitott döntések és következményük. |
| Domain-tisztázás | business-builder, `skills/bfs-spec/SKILL.md` | A projekt domain-forrásának használata; az entitást, tulajdonost, állapotot vagy interfészt megváltoztató fogalomütközések feloldása. Kimenet: egyértelmű fogalmak és forráspontok. |
| Teszthatárok | bfs-spec, `skills/bfs-plan-eng-review/SKILL.md` | Minden érdemi viselkedéshez megfigyelhető eredmény és megfelelő publikus tesztfelület kijelölése. Kimenet: követelmény → elfogadási eset → teszthatár. |
| Feladatbontás | plan-eng-review, `skills/bfs-autoplan/SKILL.md` | Végigfutó, önállóan igazolható feladatok explicit blokkolókkal; indítható feladatok meghatározása. Kimenet: feladatlista, függőségek, elfogadási esetek, készültségi bizonyítékok. |
| TDD | A meglévő `skills/bfs-implement/SKILL.md` | A TDD eljárás ebbe a skillbe épül: egy érdemi viselkedéshez ténylegesen piros próba, minimális javítás, ugyanannak a próbának zöld futása. Kimenet: eredeti hiba, parancsok, eredmények és érintett regressziók. |
| Standards / Spec | `skills/bfs-review/SKILL.md`, `references/review.md` | Ugyanazon rögzített diff két külön értékelése, külön forrásokkal, státusszal és findingokkal. Kimenet: külön Standards és Spec eredmény, ellenőrzési korlátok és következő javítás. |
| Útválasztás és folytonosság | `skills/bfs-router/SKILL.md`, `HOST.md` | A releváns fázisok kiválasztása az érvényes kontextusból. A közös tény/döntés/kérdés szabály egy helyen szerepeljen; a skillek saját feladatukra alkalmazzák. |

A közösen használt részletes háttéranyag három feltételes referenciába kerül:
`references/discovery.md`, `references/planning.md`, `references/testing.md`.
Betöltésük feltétele rendre: érdemi nyitott döntés/fogalomütközés; több feladat vagy
függőség; viselkedést érintő megvalósítás/javítás vagy teszthatár-választás.
A közös review-szabály a meglévő review referenciában marad.
A TDD lépéssora és befejezési feltételei a bfs-implement törzsében lesznek;
a testing referencia a teszthatár-választás és speciális próbahelyzetek háttéranyaga.

## 3. Működési szabályok

### Döntések és domain

Egy döntési pont minimális tartalma: helyi azonosító, kérdés, blokkoló döntések,
a válasz következménye, állapot, választott eredmény és tényleges forrás.
Ezek a brief/terv és meglévő projektmemória tartalmai; új döntési adatbázis nem kell.

A plugin a jelenleg megválaszolható, következménnyel járó kérdést hozza előre.
Előbb tisztázza például, ki használja a szolgáltatást, majd az ettől függő
jogosultsági modellt. A leválasztott ághoz tartozó kérdés kikerül az aktuális munkából.
A független kérdések együtt is feltehetők, ha ez csökkenti a felhasználói terhet.

A meglévő glossary/CONTEXT/ADR-forrást a projektutasítás választja ki. Az "account"
szó ügyfél-, számlázási és belépési jelentését csak akkor kell szétválasztani, ha
az eltérés az adott viselkedést befolyásolja. Elfogadott új fogalom a projekt
meglévő forrásába kerül; technikai döntés indokolt esetben ADR-be. Az ütközéshez
valódi döntési forrás kell; egy modellfeltevés megmarad feltevésnek.

### Specifikáció és teszthatár

Egy viselkedéshez rögzítjük az előfeltételt, műveletet, várt eredményt és a
követelmény forrását. A felület az eredményhez igazodik: publikus függvény/API,
CLI-bemenet és kimenet, vagy megfigyelhető UI-interakció.
Az állapot és a hibák ott vizsgálandók, ahol a felhasználó vagy hívó látja őket.
A normál, hibás és helyreállítási esetek közül az érintettek kerülnek a tervbe.
A várható eredmény a követelményből származik, nem a jelenlegi kód lemásolásából.
Meglévő, érvényes teszthatárt újrahasználunk; változtatásához konkrét ok tartozik.

### Függőségi feladatbontás

Egy feladat mezői: helyi azonosító, önálló eredmény, érintett terület, blokkolók,
elfogadási esetek és az igazolás módja. A helyi azonosító nem kitalált tracker-ticket.
A publikálás külön felhasználói kéréshez és a projekt tracker-eljárásához kötött.

A feladat akkor indítható, ha valamennyi blokkoló eredménye igazolt és még érvényes.
A listahely, késznek mondás vagy régi zöld eredmény nem helyettesíti ezt.
Hiányzó függőség, körkörös függőség és elfogadási eset nélküli feladat a tervezés
során látható hibát jelent. Egyszerű munkánál egyetlen feladat is megfelelő.

Példa: A után B és C indítható; D mindkettőtől függ. Ha csak B igazolt, D továbbra
is blokkolt. Ebben a csomagban az implementáció megfelelő függőségi sorrendben
halad a meglévő workflow-n belül. A párhuzamos worker/worktree/integrációs mód a
korábbi terv külön, negyedik csomagja marad; a core sorrendi előfeltételeit nem
kerüljük meg hamis completed bejegyzésekkel.

### Piros → zöld megvalósítás

A felhasználó pontosítása: a TDD a meglévő bfs-implement skill része legyen.
Ez az eljárás egyetlen gazdája. A bug-investigate megtartja a reprodukciót és
okfeltárást; javításkor a reprodukciót és igazolt okot átadja a bfs-implement
TDD eljárásának a meglévő workflow-ban. Az eredeti reprodukciót végül újrafuttatja.

Viselkedést érintő változtatásnál előbb lefut a célzott próba a hibás/hiányzó
viselkedésen. Importhiba, elérhetetlen környezet vagy rossz parancs nem igazolja
a kívánt RED állapotot. Meglévő reprodukáló teszt újrahasználható.
Ezután a minimális megvalósítás és ugyanannak a próbának a zöld futása következik.
A kapcsolódó meglévő ellenőrzések igazolják a releváns regressziókat.
Egyszerre a következő viselkedést igazoljuk; a refaktorálási igény reviewban kap
indokot. A teszt akkor hasznos, ha a hibás viselkedést ténylegesen megkülönbözteti.

Ha a szükséges próbát külső szolgáltatás vagy hiányzó képesség blokkolja, az
érintett ellenőrzés blocked marad; a végezhető munka haladhat. Dokumentációs vagy
triviális formai módosítás ellenőrzése a tényleges hatásához igazodik.

### Két review-tengely

- Standards: a projekt alkalmazható szabályai és a változtatás helyességi,
  adatkezelési, biztonsági és karbantarthatósági kockázatai. A szabályok forrása
  azonosítható; stílusízlés önmagában nem finding.
- Spec: az azonosítható felhasználói követelmények és elfogadási esetek teljesülése,
  különösen a kimaradt hibaágak, kizárások és kompatibilitási ígéretek.

Mindkettő ugyanazt a rögzített alapot és változatot vizsgálja, külön eredménnyel.
Módosított munkafán a tartalomlenyomatok azonosítják a vizsgált változatot.
Finding: tengely, súlyosság, hely, kiváltó bemenet, következmény, bizonyíték és javítás.
A státusz tengelyenként pass/fail/blocked/not-applicable, indoklással.
Forráshiány nem pass: a Spec forrása lehet azonosítható beszélgetési követelmény is.
A két eredmény megmarad külön; az összesített készültség minden alkalmazható,
szükséges vizsgálat igazolását követi.

Alapesetben két külön elemzési menet szükséges. Ez két tengely, nem bizonyíték két
független reviewerre. Kért független review külön reviewereknek adja ugyanazt a
diffet és saját tengelyük forrásait; a host és projekt delegálási szabályai szerint.
Forrásváltozás után az érintett eredmény elavul és újraellenőrzendő.

## 4. Elfogadási esetek

Az A-azonosítók helyi tesztesetek, nem tracker-issue-k.

| ID | Kiinduló eset | Kötelezően megfigyelhető eredmény |
|---|---|---|
| A01 | A kérdéses autentikációs tény az adott repo konfigurációjából kiderül. | A plugin elolvassa a forrást, hivatkozza az eredményt; erről nincs felhasználói kérdés. |
| A02 | A felhasználó korábban elfogadott egy döntést; a forrás érvényes. | Az új skill/feladat újrahasználja a döntést és forrását; nincs ismételt megerősítés. |
| A03 | Egy nyitott termékdöntés megváltoztatja a későbbi jogosultsági modellt. | A plugin az előfeltételt kérdezi először, megnevezi a következményt, és az érintett munkával az aktuális válaszig vár. |
| A04 | Az előző válasz kizárja az egyik megoldási ágat. | Az ahhoz tartozó későbbi kérdés/feladat nem jelenik meg kötelező lépésként. |
| A05 | Az account két érintett entitást jelöl. | A konfliktus látható és feloldott; a spec egyértelmű neveket használ, a meglévő domain-forrás marad az irányadó. |
| A06 | Kész, elfogadott spec és teszthatár rendelkezésre áll. | A router közvetlenül a szükséges megvalósítást/ellenőrzést választja, az elfogadott briefet és döntéseket újrahasználja. |
| A07 | Egy CLI-hiba elfogadási esete ismert. | Ugyanaz a publikus próba előbb az elvárt okból hibázik, majd a javítás után átmegy; parancs, exit és diagnosztika megmarad. |
| A08 | A próba hiányzó modul vagy szolgáltatás miatt nem indul. | A plugin ezt környezeti hibának/blockernek jelöli, és nem állítja, hogy bizonyította a viselkedési RED állapotot. |
| A09 | A → B/C → D feladatfüggőségek adottak. | Kezdetben A indítható; A után B/C; D csak mindkettő igazolt teljesülése után. Minden feladatnak saját eredménye és elfogadási esete van. |
| A10 | Körkörös vagy nem létező függőség szerepel a tervben. | A tervezési ellenőrzés konkrét hibát mutat; az érintett feladat nem lesz ready. |
| A11 | A kód megfelel a Standards szabályoknak, de egy kért hibaág hiányzik. | Standards lehet pass; Spec fail a hiányzó esettel. Az összesítés nem állít teljes megfelelést. |
| A12 | A viselkedés teljesül, de elérhető adatvesztési kockázat van. | Spec lehet pass; Standards fail konkrét kiváltó bemenettel és következménnyel. |
| A13 | A Spec forrása hiányzik. | Spec blocked és megnevezett hiányzó forrás; nem pass. Az azonosítható beszélgetési követelményt használható forrásként elfogadja. |
| A14 | A vizsgált diff vagy döntést alátámasztó fájl változik. | Az érintett bizonyíték elavult; a plugin újraértékel, nem örökíti át a régi zöld állapotot. |
| A15 | A felhasználó csak diagnózist vagy tervet kér. | A kimenet megfelel a kérésnek; termékkód, teszt és külső tracker állapota változatlan. A kért helyi terv elkészülhet. |
| A16 | Kért független review történik. | Külön reviewerek eredményei, közös diff-azonosság és tényleges végrehajtási bizonyíték látható; két egyagentű menetet nem címkéz független reviewernek. |

## 5. Megvalósítási sorrend és ellenőrzés

1. Közös döntési/domain-szabály és feltételes discovery referencia; router és
   business-builder alkalmazás. Elfogadás: A01–A06, A15.
2. Spec teszthatárok, planning referencia, eng-review/autoplan feladatfüggőségek.
   Elfogadás: A05–A06, A09–A10.
3. A meglévő bfs-implement TDD lépéssora, testing háttérreferencia és a
   bug-investigate javítási átadása ehhez az egyetlen eljáráshoz.
   Elfogadás: A07–A08, A14–A15.
4. Külön review-tengelyek és eredmények; az átadások és forráspontok összeellenőrzése.
   Elfogadás: A11–A14, A16; A06–A09 végigfutó esetek ismétlése.

Minden szelet után a meglévő `node scripts/check.mjs` ellenőrzi a hivatkozásokat,
metadata-egyezést, invokációkat és core regressziókat. A módszertani működéshez
tényleges agent-végrehajtás is kell a meglévő acceptance-fixture eljárás szerint,
izolált adatokon, a kiválasztott plugin-forrás azonosítható hash-eivel.

A kérdezés/újrahasználat és review legfontosabb esetei (A01, A02, A06, A11, A13)
két friss futásban is igazolandók, azonos modellel/beállítással. Megőrzendő:
tényleges kérdések és válaszok, olvasott források, parancsok/exitkódok, diff,
workflow/memória, tengelyenkénti review és esetenként pass/fail/blocked eredmény.
A puszta instrukciószöveg vagy statikus teszt nem igazolja az agent működését.

A csomag akkor kész, ha minden szükséges eset igazolt, a releváns regressziók
átmentek, a megmaradt korlátok láthatók és a vizsgált forrás azonosítható.
A korábbi 43/43 teszt a kontextusalap bizonyítéka; ezeket az új eseteket még nem
igazolja. A kiadás/telepítés külön delivery művelet.

## 6. Kapcsolódó források

- [Projektfogalmak és döntések](../../CONTEXT.md)
- [Meglévő végrehajtási szerződés](../../plugins/bontaflowstack/HOST.md)
- [Router](../../plugins/bontaflowstack/skills/bfs-router/SKILL.md)
- [Spec](../../plugins/bontaflowstack/skills/bfs-spec/SKILL.md)
- [Implementáció](../../plugins/bontaflowstack/skills/bfs-implement/SKILL.md)
- [Review](../../plugins/bontaflowstack/skills/bfs-review/SKILL.md)
- [Agent-elfogadási eljárás](MANUAL-ACCEPTANCE.md)
