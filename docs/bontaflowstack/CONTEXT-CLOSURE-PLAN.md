# Kontextus és zárás: következő fejlesztési csomag

Állapot: elfogadott terv. Elfogadás: „elfogadtam a tervet, kezd meg az implementálást” (2026-10-01, jelen chat).
Készült: 2026-09-30. Alap: a kiadott 0.6.0, main
`8eec8281060ccbdb0c947330b64b767c22d541c8`.

Felhasználói sorrend: kész változtatások kiadása → kontextus/zárás →
prototípus-kitérő → párhuzamos implementáció → önálló bővítések.
A kiadás megtörtént: [PR #3](https://github.com/BillBalint-SM/bontaflowstack-workbook/pull/3),
[0.6.0](https://github.com/BillBalint-SM/bontaflowstack-workbook/releases/tag/v0.6.0).
A jelen kérés a következő csomag megtervezését engedélyezi.

## Cél és határ

A felhasználó el tudja menteni a munkát, más feladatra váltani, majd az aktuális
döntések, teljes mentett terv, bizonyítékok és végrehajtható következő lépés
alapján folytatni. A zárásból egyértelmű, hogy mi készült el, mi került ténylegesen
kiadásra, és mely tapasztalat segít a következő munkán.

Az információmegőrzés a ténylegesen elmentett, kiválasztott adatokra vonatkozik.
Nem ígér teljes chat-visszajátszást vagy nem mentett böngészőállapot helyreállítását.
A régi felhatalmazás megőrzött történeti adat; import nem ad új műveleti engedélyt.

Nem része ennek a csomagnak: prototípusfuttató, párhuzamos scheduler/worktree-flow,
triage, wayfinder, tanulási workspace, felhőszinkron, új böngészőmotor vagy új
adatbázis. Az engine marad 0.3.1. A TDD marad a meglévő bfs-implement eljárásában.

## Ami már működik, és amit hozzáadunk

| Terület | 0.6.0 alap | Következő eredmény |
|---|---|---|
| Projektmemória | Verziózott döntés, tény, terv, learning; teljes részlet és forrás | A handoff kiválasztott, teljes mentett tartalma hordozható |
| Alapkontextus | Legfeljebb 10 000 karakteres származtatott nézet, részletmutatókkal | Ugyanebből indul az átadás; nincs második aktív context-store |
| Szünet/folytatás | Teljes workflow-snapshot, ownership és fájldrift ellenőrzése | Új clone/gép is kap ellenőrizhető átadást, új helyi azonosítókkal |
| Delivery | Parancs, exit, stdout/stderr, bemeneti hash; külön merge/deploy/verify lépések | Összekapcsolt, revisionhöz és célhoz kötött kiadási bizonyítéknézet |
| Retro | Workflow-történet és learning tárolás; a retro bejárat eltávolított | Célzott riport és visszakereshető tanulság, konkrét hibanyom alapján |

Források: [workflow](../../plugins/bontaflowstack/core/workflow.mjs),
[context](../../plugins/bontaflowstack/core/context.mjs),
[memory](../../plugins/bontaflowstack/core/memory.mjs),
[delivery](../../plugins/bontaflowstack/core/delivery.mjs),
[catalog](../../plugins/bontaflowstack/catalog.json).

## Képességtérkép és építési sorrend

| Modulazonosító | Felelősség | Függőség |
|---|---|---|
| handoff | Mentett munka hordozható exportja, előnézete és ellenőrzött betöltése | Meglévő workflow/memory/context |
| delivery-proof | A kért kiadási szakaszok tényleges eredményének összekapcsolása | Meglévő delivery evidence és workflow |
| retro | Bizonyítékhoz kötött környezeti tanulság és javítási javaslat | Meglévő workflow/memory; delivery-proof, ha a hiba kiadási szakaszt érint |

Végrehajtás: handoff → delivery-proof → retro → teljes natív elfogadás.
A két első modul nem függ egymástól; a választott sorrend a user journey-t követi.
Ez a térkép és az alábbi elfogadási terv javaslat. A végleges modulonkénti
parancs- és adatszerződés az elfogadott térkép alapján készül, implementáció előtt.

## User journey és tervezett változtatások

### 1. Szünet, más munka, folytatás vagy átadás

„Tedd el ezt, most máson dolgozom”: a meglévő bfs-save-context pause mód teljes
snapshotot ment. Ugyanabban a projektben a folytatás a meglévő resume/adopt út;
nem készül minden szünetnél hordozható másolat.

„Másik környezetben akarom folytatni”: a bfs-save-context exportot készít az
aktuális, kiválasztott checkpointból. Egy UTF-8 Markdown fájl rövid, következő
célra szabott összefoglalót és egy verziózott JSON-adatblokkot tartalmaz. Az
összefoglaló mutatókat használ; a gépi rész megőrzi a kiválasztott teljes mentett
workflow-t, checkpointot és szükséges memóriarevíziókat. A nézet nem új szerkeszthető
terv, az export nem második aktív tároló. Nincs külön parserfüggőség.

Tartalom: cél; aktuális állapot; döntések és valódi forrásuk; teljes kiválasztott
terv; lezárt/elvetett történeti pontok; nyitott kérdések; következő művelet;
javasolt skill; releváns fájlhashek; Git revision/branch és mentett dirty állapot;
bizonyítékazonosítók/URL-ek és korlátaik. Helyi naplók teljes szövege csak
kiválasztva és érzékeny adatellenőrzés után kerülhet bele. Külső artifact tartalmát
nem tölti le automatikusan; a hiányzó forrás látható függőség marad.
A forráskód átvitele külön repository/patch/artifact feladata; pusztán a handoff
nem állítja helyre a nem commitolt fájlokat. Hiányuk esetén a folytatás érintett
része blokkolt, miközben a teljes mentett munkakontextus olvasható marad.

A Markdown a bemutatás, az egyetlen megjelölt JSON-blokk a verziózott adatforrás.
Eltérő összefoglaló nem írhatja át az adatot. Sémát, méretet, link/path-határokat,
forrásváltozást és érzékeny tartalmat ellenőrzünk mentés előtt; nincs néma redakció
vagy csonkolás. A projektfájl-mutatók relatívak. A tartalom adatként kezelendő,
nem végrehajtható prompt, parancslista vagy bizonyított user-felhatalmazás.

A bfs-load-context előnézetet ad; a felhasználó import-/folytatáskérése alapján
mentett handoffból új helyi checkpointot hoz létre. A jelenlegi CWD választja a
célprojektet. A behozott projectId/taskId/abszolút út nem irányíthatja a tárolást.
Ugyanaz az importismétlés ugyanazt a helyi eredményt adja, nem duplikál.

A teljes behozott tartalom az immutable checkpointban marad. Nem merge-ölünk
automatikusan idegen memóriarevíziókat a célprojekt kanonikus memóriájába. A
folytatáskor az agent a releváns pontokat ellenőrzi, és a meglévő memory put
eljárással, importált forrásjelöléssel rögzíti a szükséges adatokat.

Új workspace saját workflow-t indít a snapshotból. A régi sikeres ellenőrzés
történeti bizonyíték, nem automatikus aktuális minősítés. Csak az érintett
függőségeket kell újraellenőrizni. Bizonytalan korábbi merge/deploy esetén először
a tényleges távoli állapotot kérdezi le, nem ismétli meg a műveletet.

### 2. Elkészülés, kiadás és ellenőrizhető zárás

A bfs-finisher/bfs-prod-deploy a meglévő evidence rekordokat egészíti ki a
kiválasztott workflow-val, szakaszával és kiadási tárgyával. Nincs új delivery
adatbázis vagy általános deploy-keretrendszer. A tervezett delivery report nézet
a meglévő, változatlan rekordokat kapcsolja össze.

Kiadási tárgy: repository/change; tényleges source revision; célkörnyezet;
kiadott revision/version; artifact hash, ha van; provider/PR/release azonosító;
a megfigyelés ideje és parancs-/artifactforrása. Egy beküldött URL vagy „PASS”
szöveg önmagában nem igazolja a kiadást.

A nézet külön mutatja a prepare, publish, integrate, deploy és verify eredményét,
a kért műveleti körhöz igazítva. Lokális elkészüléskor a publikáció nincs
elvégezve; deploy nélküli projektnél a deploy nem alkalmazható, indokkal.
A folyamatban levő CI nem PASS. Újabb hibás vagy bizonytalan állapot mellett
nem használható csendben egy régebbi zöld eredmény.

A lokális fájlhashek ellenőrzése és az élő provider/telepített revision megfigyelése
külön érvényességi tengely. Élő kiadási állapothoz friss tényleges lekérdezés kell;
egy tetszőleges TTL önmagában nem tesz egy megfigyelést aktuálissá. Elérhetetlen
provider esetén a delivery ellenőrzése BLOCKED/UNKNOWN, a kész forrásmunka megmarad.

### 3. Tanulság a következő munkához

Visszakerül a külön bfs-retro riportoló skill, cataloggal és agentmetadatával.
Explicit retro-kérésre vagy egy konkrét, jelentős elakadás/recovery feldolgozására
használható. Nem lesz minden feladat végén kötelező interjú vagy plusz workflow-step.
Normális, hibamentes zárás egy rövid eredménnyel lezárható.

A riport a kijelölt workflow/checkpoint/evidence és a rendelkezésre álló sessionnyom
alapján adja: jelenség → bizonyíték → ok vagy jelölt hipotézis → legkisebb javítás
→ ellenőrzés → érintett következő feladat. Ha nincs nyom, nem talál ki okot.

Mechanikus tévedéshez előbb a meglévő determinisztikus ellenőrzést keresi, és
csak a tényleges hiányhoz javasol bővítést. Megítélést igénylő hibához célzott
review-irányelv javasolható. Egy általános „legyél figyelmesebb” szabály nem eredmény.
A riport nem módosít automatikusan AGENTS.md-t, skilleket, CI-t vagy hookokat.

A megfigyelt, releváns tanulság a meglévő learning memóriában rögzíthető, valódi
forrásjelöléssel; a javasolt megoldás következtetés marad, nem elfogadott döntés.
Kulcs szerinti revízió és státusz akadályozza meg ugyanannak a tanulságnak az
ismétlődését. A következő feladatban csak az alkalmazható rövid tanulság jelenik
meg; a részlet forráspointerrel elérhető. Nincs automatikus globális tanulás.

## Elfogadási forgatókönyvek

Minden sor előfeltételt, műveletet és kívülről látható eredményt ír le.

| ID | Előfeltétel és művelet | Elvárt eredmény és nyilvános teszthatár |
|---|---|---|
| H01 | Több terv-/döntésrevízió és paused workflow exportja | A CLI-export/import a teljes kiválasztott részletet és történetet megtartja; nincs néma csonkolás |
| H02 | Szünet után más feladat, majd ugyanazon workspace folytatása | Resume/adopt a tényleges következő művelethez tér vissza, más munka állapotát megőrzi |
| H03 | Export új clone/gép betöltésekor | Saját helyi ID-k, forrásjelölés, látható Git/fájldrift és új workflow; nincs importált műveleti engedély |
| H04 | Megváltozott vagy hiányzó forrásfájl, bizonytalan távoli merge | Az érintett ellenőrzés elavult/hiányzó; a folytatás távoli lekérdezéssel indul, nem merge-ismétléssel |
| H05 | Ugyanaz az import kétszer; közben megtörtént bizonytalan mentés | Egy helyi importeredmény, immutable előzmények; nincs duplikáció vagy adatvesztés |
| H06 | Hibás séma, több adatblokk, oversized payload, credential vagy veszélyes path | CLI nem nulla exit és konkrét hiba; korábbi állapot/fájl változatlan, nincs titok a hibakimenetben |
| H07 | Régi 0.6.0 checkpoint, nem Git projekt, csak előnézet | Kompatibilis olvasás, helyes helyi scope; az előnézet nem hoz létre állapotot |
| H08 | Elvetett/completed pontokat tartalmazó import vagy elveszett külső artifact | A történet megmarad, lezárt munka nem válik aktívvá; az artifact hiánya látható |
| D01 | Lokális forrás kész, publikáció nincs kérve | A riport nem állít release/deploy sikert; a kért prepare eredménye önállóan lezárható |
| D02 | Valódi PR/merge/release/install különböző revisionökkel | A nézet kimutatja az eltérést és a szakaszonkénti tényleges azonosítót |
| D03 | Korábbi PASS után source-drift, új hiba vagy folyamatban levő CI | STALE/FAIL/PENDING látszik; régi zöld nem minősíti az új állapotot |
| D04 | Provider elérhetetlen, új környezetben régi bizonyíték, vagy sima URL | UNKNOWN/BLOCKED vagy történeti eredmény; nincs aktuális kiadási minősítés valós lekérdezés nélkül |
| D05 | Külső művelet sikerült, csak az utána következő mentés hibázott | Tényleges remote állapot ellenőrzése után csak a bizonyítékmentés áll helyre |
| D06 | Sikeres, megfigyelt kiadás és későbbi telepített revision-változás | A zárás az adott megfigyelést igazolja; későbbi verify kimutatja az új eltérést |
| R01 | Megismétlődő mechanikus hiba konkrét sessionnyommal | Natív agent meglévő checket vizsgál, a réshez konkrét ellenőrzést javasol; nem általános szabályt |
| R02 | Kevés adat vagy megítélésfüggő hiba | Elkülönített hipotézis/korlát és célzott review-javaslat; nincs kitalált gyökérok |
| R03 | Retro-javaslat és learning mentése, majd azonos hiba újra | Forrásjelölt learning-revízió; nincs automatikus szabály-, CI- vagy hookmódosítás |
| R04 | Egyszerű sikeres feladat érdemi tanulság nélkül | Natív agent lezárja extra kérdés/retro-lépés nélkül |
| X01 | Friss chatből handoff folytatás, később tényleges kiadás és indokolt retro | A teljes journey működik; kész/elvetett munka kikerül az aktív contextből, részletei olvashatók |

## Implementációs feladatok és függőségek

| Feladat | Eredmény / érintett terület | Blokkolók | Elfogadás / ellenőrzés |
|---|---|---|---|
| C01 | Handoff export, előnézet, ellenőrzött import a workflow/CLI és meglévő állapotsegédek használatával | Elfogadott modulhatár és végleges handoff-szerződés | H01, H03, H05–H08; célzott CLI round-trip és hibateszt |
| C02 | Save/load skill, egy feltételes context referencia és használati dokumentáció | C01 igazolt kimenete | H02, H04, H08; friss natív folytatás és megváltozott forrás esete |
| C03 | Evidence kötése workflow/szakasz/kiadási tárgy szerint és származtatott report | Elfogadott delivery-proof-szerződés | D01–D06; meglévő delivery nyilvános CLI határán |
| C04 | Finisher/deploy/reference eljárások a valós delivery-záráshoz | C03 igazolt kimenete | D01–D06; natív lokális/publikált/bizonytalan állapotú esetek |
| C05 | bfs-retro, catalog/metadata/README és feltételes zárási átadás | Elfogadott retro-határ; C04, ha delivery-retro a példa | R01–R04; konkrét sessionnyomok, meglévő learning műveletek |
| C06 | Integrált natív journey és csomagellenőrzés, Standards/Spec review | C02, C04, C05 igazolt eredménye | X01 és a teljes releváns regresszió; tartalomhoz kötött jelentés |

A gráf ciklusmentes, a blokkolóazonosítók léteznek. Jelenleg nincs megvalósításra
ready feladat: a modulhatár és a végleges szerződések még javaslatok. Az implementáció
vékony, ellenőrzött szeletekben, a meglévő bfs-implement TDD-eljárásával halad.
A párhuzamos agent/worktree-működés itt nincs bevezetve.

## Ellenőrzés, kompatibilitás és zárási bizonyíték

Meglévő parancsok: `node scripts/check.mjs`,
`node --test --test-name-pattern="handoff|delivery|retro" tests/core.test.mjs`
(a később létrehozott viselkedéstesztekre),
`./scripts/build-package.ps1 -Release`,
`./scripts/test-package.ps1 -Archive <elkészült-zip>`.
A javasolt új CLI-műveletek neve és séma még nem kiadott API.

Core-viselkedés: a meglévő Node tesztfuttató és CLI stdin/stdout/exit határa.
Skill-viselkedés: valódi friss agentfutás, kérdések, műveletek, fájl- és
állapotváltozás megfigyelése; a csomagszöveg egyezése önmagában nem elfogadás.
Provider-fake csak a helyi osztályozási hibákat bizonyítja. Élő kiadásállításhoz
a kiválasztott tényleges provider megfigyelése kell. A natív hook friss chatbeli
betöltését külön kell megfigyelni, nem a ZIP-smoke-ból levezetni.

Nincs automatikus régi adatimport, migráció vagy prune. Új mezők additívak;
régi checkpoint és evidence olvasása megmarad. Import előbb ellenőriz, majd egy
új helyi snapshotot ment atomikusan; kanonikus memóriafrissítés külön, meglévő
művelet. Sérült input, ismétlés és Windows lock nem vesztheti el a korábbi adatot.
Visszaállítás előtt a létrejött handoff/állapot megőrzendő; a régi verzió nem
feltétlenül érti az új exportot, de nem szabad átírnia azt.

Matt átvett módszerei a már vizsgált `d81f3a183412e71a5b1e84ca21bc1a35eea03a60`
snapshotból: handoff célra szűkített mutatókkal; PR konkrét előtte–utána
bizonyítékkal és visszaállítási korláttal; retro mechanikus hibához checket,
megítéléshez review-irányelvet választ. A BFS őrzi a saját flow-t és az aktuális
felhasználói kéréshez kötött műveleti határokat.

Tervezési review: a meglévő workflow, memory, context és delivery hívásokhoz
illeszkedik. Az eredeti export/import, élő delivery és retro részletes szerződése
még elkészítendő; a fenti elfogadási sorok ennek ellenőrizhető alapját adják.
Nincs új runtime-függőség, második aktív context-store, külön evidence-adatbázis,
kötelező retro-interjú vagy automatikus külső publikáció.
