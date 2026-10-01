# BFS fix tesztterv

Kapcsolódó végrehajtási terv: [plan.md](plan.md).
Állapot: tervezet; az alábbi új tesztfájlok és natív case-ID-k még létrehozandók.
A parancsok implementációs célok, nem most lefuttatott ellenőrzések.

## Bizonyíték újrahasználata és futási keret

Kiinduló bizonyíték: 52/52 core/package check, reviewed ZIP-smoke, a
[kontextus/zárás report](../docs/bontaflowstack/CONTEXT-CLOSURE-REPORT.md) és a
[natív report](../docs/bontaflowstack/NATIVE-ACCEPTANCE-REPORT.md).
Ezek nem bizonyítják a most tervezett új funkciókat vagy egy későbbi telepítés állapotát.

- Egy viselkedésváltozás: egy diszkrimináló RED és ugyanazon assertion GREEN.
- Taskzárás: érintett tesztfájl; nincs taskonként teljes csomag/natív A/B.
- Végső integráció: egy teljes `node scripts/check.mjs`.
- `scripts/build-package.ps1` maga is checkel: ha ez fut a végső commiton, az adja
  a teljes checket; előtte nem indítunk külön azonos teljes checket.
- Egy ZIP-smoke az így készült ZIP-en. Bájtegyezés után nincs új teljes natív futás.
- Új futás csak forrás/tesztbázis/képességváltozás, konkrét hiba vagy hiányzó bizonyíték miatt.
- Natív case egyszer, külön rövid célra. Egy korrekció után csak a hibás eset és az
  érintett regresszió ismétlődik. Második sikertelen próbánál a reprodukció/cause
  dönt, nincs vak ismétlési ciklus.
- Natív szakasz maximum 180 másodperc; hosszabb valódi vizsgálat külön mentett
  folytatás. Timeout = UNVERIFIED, nem újabb automatikus 600 másodperces kampány.
- PASS-hoz tényleges művelet, eredmény és semantic assertion kell; exit 0 nem elegendő.
- Ugyanazon fagyasztott plugin/HOST/skill hash, native task ID, before/after és
  elkülönített `BFS_STATE_HOME`. Hookbizonyíték csak valóban trusted hoston.

## V00: régi esetek egyszeri leltára

Források: MANUAL-ACCEPTANCE, NATIVE-ACCEPTANCE-REPORT, CORE-SKILL-METHODOLOGY-REPORT,
CONTEXT-CLOSURE-REPORT és meglévő workflow/history.
Minden nyitott esethez: régi evidence, kiválasztott pluginhash, aktuális proofhiány,
reuse/run/block döntés. A leltárból törölni csak bizonyítékkal lehet egy követelményt;
régi report vagy blocked workflow puszta kora nem jelenti a követelmény hiányát.
Régi question-workflow rendezése előtt a már létező valódi paneles bizonyítékokat használjuk.

## Guard: valódi hook + izolált cél

G01–G06 egy izolált, saját tesztprojektben, valós PreToolUse-markerrel.
Állapot előtte/utána és visszaállítás megőrzött. A terv elfogadása nem önmagában
egy későbbi destruktív parancs célzott engedélye; az exact cél külön tényleges user-kérés.

| ID | Előfeltétel és művelet | Elvárt eredmény / határ |
|---|---|---|
| G01 | Friss native task; saját projekt; guard status, majd boundary saját alkönyvtárra. | Egyező marker, valóban hookból; state read-back. Fixture-hook nem helyettesítő. |
| G02 | Boundary aktív; valódi támogatott Edit/Write/apply_patch engedett fájlon, majd kívül. | Belső cél módosul; külső cél tagadott és byteazonos. Minden hoston ténylegesen elérhető edit-tool külön sor; hiányzó tool BLOCKED. |
| G03 | Warnings aktív; felismerhető törlési parancs saját eldobható markerfájlra. | Első hívás megáll/pending ID; fájl változatlan, nincs végrehajtás. |
| G04 | G03 exact command+cél explicit human engedélye; approve, azonos hívás egyszer. | Egy grant → egy végrehajtás; más parancsra nem használható; lejárt/módosított grant elutasított. TTL negatívhatár core tesztből, nem 5 perc várakozással. |
| G05 | Saját tesztprojekt gyökerének rekurzív törlését célzó hívás. | Hard deny, semmi nem törlődik; sikertelen hookészlelésnél a veszélyes hívást nem küldjük el. |
| G06 | Boundary release, status; másik saját native task állapota; eredeti policy visszaáll. | Release nem kapcsolja ki warnings-t; task/workspace izoláció; shell write-limit tényszerűen jelentett. |

Nem bővítjük a guard ígért határát OS-sandboxra vagy tetszőleges shell-írásra.
Nem módosítunk hook trustot automatikusan, nem használunk useradatot vagy éles repo-t.

## Kontextus és egyéb megmaradt natív esetek

| ID | Előfeltétel → művelet | Kötelező assertion |
|---|---|---|
| C01 | N01 fixture, teljes két memoryrevízió; három rövid szakasz: pause → másik workfolyamat → új-chat load/adopt/export. | Egy pause-snapshot; másik workflow érintetlen; történet teljes; minden szakasz tényleges végső választ ad. N08/N09 érvényes részproof újrahasználható, az új-chat kapcsolat külön ellenőrzött. |
| M01 | Külön szöveges preference-válaszok: egyértelmű, majd kétértelmű. | Első canonical save/read-back; második egy tisztázó kérdés, nincs kitalált választás. |
| M02 | Saját izolált user/project/task preferenciák, majd egy kiválasztott scope reset. | Precedence tényleges effective értéke; reset csak kiválasztott scope, többi hashazonos. |
| M03 | Direct bfs-browse és bfs-scrape belépésen reusable browser-script kérés. | Mindkét belépés dokumentált unsupported eredmény; nincs mentett script vagy invented workflow. |
| M04 | Waiting workflow megválaszolatlan termékdöntéssel → új chat resume. | Várakozás megmarad; függő munka nem indul; ismert döntést nem kérdezi újra. |

M01–M04 azok az esetek, amelyeket a régi natív report kifejezetten nem külön
futtatott. V00 mutatja meg, van-e más konkrét, még hiányzó kötelező eset;
ilyet nem nevezünk teljesítettnek vagy elvetettnek leltár nélkül.

## P: ticketgráf és valódi Git/worktree integráció

Létrehozandó parancsok:

```powershell
node --test tests/task-graph.test.mjs
node --test tests/parallel.integration.test.mjs
```

Mindkettő bekerül a meglévő check runnerbe. Git teszt saját tmp repo és worktree-k,
valódi commitok; nincs GitHub írás vagy főrepo/worktree cleanup.

| ID | Előfeltétel → művelet | Kötelező assertion |
|---|---|---|
| P-A | A→B/C→D gráf, majd duplikált ID/hiányzó él/ciklus/sémahiba. | Valid graph elfogadott; pontos hibás ID/cycle path; teljes state hash változatlan validatenél. |
| P-B | A függőségekkel és fingerprinttel rögzítve; completed vs integrated; input/commit változik. | Csak valid integrated A engedi B/C-t; D mindkettőt várja; stale blocker visszablokkol, régi evidence megmarad. |
| P-C | Két diszjunkt task; ugyanazon task második bind; idegen repo; átfedő writePaths. | Saját worktree/workflow párok; atomikus kettős foglalás elutasított; idegen scope és átfedés nem fut együtt. |
| P-D | Worker completed állítást küld, aztán valódi clean commit/evidence; pause→load. | Állítás önmagában unverified; csak valódi commit+aktuális hash valid; másik owner nem írja át; nincs ismételt merge. |
| P-E | B/C két valódi worktree, egyenként commit+check; soros integráció; külön conflict és failed-check ág. | Mindkét funkció közösen működik; konfliktus/checkhiba blokkol D-t; eredeti ágak és fájlok megmaradnak. |
| P-F | CLI task request és read-only landing report; majd régi egytaskos implement. | CLI stdout/stderr/exit helyes; riport nem ír; ordered workflow és korábbi API változatlan. |
| P-N | Valódi két worker, külön native task/worktree, A→B/C→D journey; koordinátor csak integrációt vezet. | Acceptance és owner minden workerhez kötött; két külön diff; D csak közös check után indul; nincs kéretlen külső merge vagy idegen resource cleanup. |

P-N a párhuzamos eljárás elfogadása és végrehajtási kérése után indítható.
Funkcióhelyességet a determinisztikus Git teszt, eljáráshelyességet a native transcript
bizonyít. Sebességnyereséget e két futásból nem állítunk.

## E: önálló bővítések natív journey-je

Ugyanaz a meglévő natív runner, új kiválasztható fixture-esetekkel;
nem új tesztkeretrendszer. A pontos create/run CLI a fixture elkészülésekor kerül a
MANUAL-ACCEPTANCE-be, végrehajtás előtt ellenőrzött entrypointtal.

| ID | Előfeltétel → művelet | Kötelező assertion |
|---|---|---|
| E-T | Reprodukálható hibajelzés + hasonló korábbi issue helyi másolata; majd hiányos input. | Repro/impact/provenance; duplikátum indokolt; root cause csak bizonyítékkal; hiányzó lényegi input kérdés; nincs fix/GH issue. |
| E-W | Aktív context: kész A, stale B, blocked C, nyitott döntés; csak útmutatás kérése. | Következő lépés indokolt és blockerhez kötött; kontextus/history forrás olvasott; minden projekt/state hash változatlan. |
| E-L1 | Konkrét tanulási cél, új üres célkönyvtár; később már létező userfájl ugyanott. | Futtatható minimális gyakorlat+check; eredeti repo byteazonos; létező fájl nem felülírt; tanulási cél nincs kitalálva. |
| E-L2 | Ugyanazon gyakorlat valódi hibás, majd sikeres megoldása; külön kért lesson-save. | Actual check alapján értékel; provenance és memory read-back/revízió; nincs globális rule; főprojekt completion változatlan. |
| E-R | Új triage/wayfinder/learn kérések és régi implement/bug/retro kérések. | Pontos legszűkebb routing; nincs új kötelező fázis vagy interjú; publikus metadata/catalog/link checks együtt helyesek. |

## Z: lezárás, egyszeri teljes ellenőrzés

Az utolsó integrációs commiton külön Standards és Spec értékelés ugyanazon scope-ra;
külön natív reviewer vagy teljes A/B csak konkrét indokkal, nem kötelező rituálé.
A reviewer típusa a reportban pontosan szerepel.

```powershell
powershell -NoProfile -File scripts/build-package.ps1 -OutputDirectory <új-saját-output>
powershell -NoProfile -File scripts/test-package.ps1 -Archive <az-előző-build-tényleges-ZIP-je>
```

Placeholder-ek végrehajtás előtt konkrét ellenőrzött absolute pathra cserélendők;
verzió/artifactnév nem találgatott. Build és smoke eredmény, SHA, commit, plugin/HOST
hash és scope a reportba kerül. Telepítéskor source↔installed hash és doctor plusz
egy rövid public-entrypoint próba; teljes új natív kampány csak tényleges eltérésre.

Eredménymátrix: ID, source hash, case input, command/tool event, real task ID,
exit, assertion, evidence út, PASS/FAIL/BLOCKED/UNVERIFIED és konkrét next action.
Titok/profile/raw transcript helyi artifact marad; a repóba csak szükséges kivonat.
Régi blocked workflow csak saját adopt és tényleges evidence alapján zárható;
nyitott checkpoint történetét nem töröljük. A terv szerinti új feladatokat lezáráskor
kivesszük az aktív kontextusból, történeti döntések és bizonyítékok megmaradnak.
