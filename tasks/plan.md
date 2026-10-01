# BFS következő fejlesztései: végrehajtási terv

Állapot: felülvizsgálható tervezet, nem implementációs engedély.
Forrás: a felhasználó 2026-10-01-i kérése ebben a chatben: párhuzamos implementáció,
önálló bővítések és korábbi ellenőrzési maradékok fix végrehajtási/tesztterve.
Bázis: main `25659ce895577a3ace6fa2cdb3f99c7e3f73292e`.
Tesztterv: [test-plan.md](test-plan.md).

## Cél és határ

A motor a ténylegesen következő, végrehajtható munkát válassza ki, tartsa meg az
elfogadott döntéseket és megkülönböztethető bizonyítékokkal zárja a munkát.
A felhasználót csak az eredményt vagy jogosultságot megváltoztató döntésnél kérdezze.

Három eredmény készül:

1. Ellenőrizhető függőségi ticketgráf, elkülönített implementációs worktree-k,
   soros integráció a ténylegesen ellenőrzött commitokra.
2. Triage, wayfinder és tanulási workspace önálló belépési pontokkal.
3. A korábban konkrétan nyitva maradt natív esetek lezárása vagy pontos blockerük.

A korábbi roadmap sorrendje marad: kész csomag kiadása/telepítése →
prototípus-kitérő → párhuzamos implementáció → önálló bővítések.
A kiadás és a prototípus-kitérő külön munkacsomag; itt függőségként szerepelnek,
nem tervezzük meg vagy implementáljuk őket újra. A meglévő ellenőrzési maradékok
leltára azonnal készülhet; a telepített csomagot érintő natív futások a frissítés után.
Ha a prototípus később módosítja ezt a szerződést, csak az érintett feladatot tervezzük újra.

## Meglévő elemek, amelyeket használunk

- `references/planning.md`: ID-k, blocker-ek, ciklusok, aktuális bizonyíték és readiness.
- `core/workflow.mjs`: saját chat/workspace végrehajtás, pause/adopt, lépéseredmény.
- `core/state.mjs`: kanonikus utak, worktree projektazonosság, lock és atomikus írás.
- `core/handoff.mjs`: hordozható folytatás; importált adat nem jogosultság.
- `core/delivery.mjs`: tartalomhoz kötött ellenőrzés, aktuális remote és delivery-státusz.
- `core/memory.mjs`, `core/context.mjs`: közös projektmemória, revíziók, lényegi nézet.
- `bfs-implement`: TDD; `bfs-review`: Standards és Spec; `bfs-retro`: tapasztalati bizonyíték.
- `tests/methodology-acceptance.mjs`: izolált natív futás és elsődleges transcript.

Nem készül általános job scheduler, új adatbázis, automatikus merge/push,
automatikus külső issue vagy globális szabálymódosítás. A Node stdlib és Git elegendő.
Az alábbi új CLI-k és skillnevek javasolt szerződések, még nem léteznek.

## Fogalmak és javasolt szerződés

### Párhuzamos implementáció

Új, kicsi `core/tasks.mjs` modul; CLI: `tasks validate`, `tasks status`, `tasks bind`,
`tasks record`. JSON stdin/fájl a meglévő CLI-szokás szerint, nem shellbe interpolált adat.
`validate` és `status` olvasás; `bind` és `record` explicit helyi végrehajtási művelet.

A terv `schema: 1`, `planId`, repoazonosság, rögzített `baseRevision`, acceptance-forrás
és `tasks` lista. Egy task: `id`, cél, `dependsOn`, írási terület (`writePaths`), stabil
`inputs`, acceptance-esetek és ellenőrzési határ. Az eredmények külön atomikus
állapotrekordok: task/workflow/workspace/native-chat azonosító, branch/worktree,
ellenőrzött commit, inputhash-ek, bizonyítékhivatkozások, állapot.
Tervváltozás nem írja át az eredeti elfogadási alapot vagy a történeti bizonyítékot.

- Readiness: minden blocker érvényes, beintegrált eredménnyel rendelkezik;
  csak lokálisan zöld, még nem integrált task nem engedi el a függő feladatot.
- Független, diszjunkt írási területű taskok együtt indulhatnak. Átfedés soros végrehajtás,
  nem automatikus tervél-módosítás. `catalog.json`, CLI és közös tesztregiszter egy tulajdonosé.
- Egy task/worktree/saját workflow. A koordinátor nem adoptálja vagy módosítja a worker
  saját workflow-ját; a taskeredményt hitelesített workflow- és Git-adatokhoz köti.
- A tervezett commitot ellenőrizzük; nem mozgó branchnevet. Dirty worktree, idegen repo,
  változott elfogadási alap vagy ellenőrizetlen eredmény nem integrálható.
- Soros integráció egy kijelölt integrációs branchre. Az aktuális integrációs HEAD a
  következő task bázisa; közös ancestorból induló független taskok külön integrációs
  ellenőrzést kapnak. Sikertelen integráció megállítja a függő ágat, az eredeti task megmarad.
- Worktree/branch készítése a meglévő Git vagy elérhető host API-val, mindig explicit
  ownership mellett. Workerindítás csak az elfogadott párhuzamos végrehajtási kérés részeként.
  Nincs kötelező párhuzamosság: egy kész task normál bfs-implementtel végrehajtható.
- Pause/load után status újraszámolás a valódi Git, workflow és hash-ek alapján;
  már sikerült külső műveletet előbb lekérdezünk, nem újrafuttatjuk.
- Merge mainre és külső publikálás a bfs-prod-deploy kért delivery lépése marad.
  Worktree törlés csak explicit cleanup-scope és ellenőrzött, tiszta saját cél esetén.

### Önálló bővítések

**Triage (`bfs-triage`, report mód):** nyers hibajelzésből reprodukálható és priorizált
munkatétel. Várt/tényleges viselkedés, hatás, környezet, minimális reprodukció,
duplikátum/összefüggés, tény és hipotézis, hiányzó input, javasolt következő skill.
P0: adatvesztés/biztonság/szolgáltatás kiesése; P1: fő journey blokkolt; P2: kerülőúttal
kezelhető hiba; P3: kis hatás. Ismeretlen hatás nem kap kitalált prioritást.
Nem második debugger: a mély okfeltárás bfs-bug-issue-investigate; javítás bfs-implement.
GH issue létrehozása külön kért publikáció; itt helyi triage-eredmény készül.

**Wayfinder (`bfs-wayfinder`, guide mód):** a jelenlegi repo, context, workflow és
catalog alapján megmondja: hol tartunk, mi kész, mi blokkolt, mi a következő hasznos
lépés és miért. Navigáció és helyzetértékelés, nem második workflow-motor.
Ad hoc feladatválasztás bfs-router; meglévő folyamat folytatási pontja wayfinder.
Alapból olvasás, workflow/worker/memória írás és implementáció nélkül.

**Tanulási workspace (`bfs-learn`, practice/review mód):** célhoz kötött, izolált
gyakorlóprojekt konkrét feladattal, futtatható ellenőrzéssel és eredményértékeléssel.
Nem teljes oktatási platform és nem a meglévő projektmemória újraírása.
Practice: kiválasztott cél és önálló új könyvtár, feladat+check+README, titkok/éles
adatok másolása nélkül. Review: actual eredményből teljesült/hiányzó tanulási cél,
következő gyakorlat javaslata. Általános tanulság mentése csak kért scope-ban,
meglévő memory learning/revízió/retire eljárással. A gyakorlóprojekt eredménye nem
minősíti a termék vagy a fő projekt követelményét teljesítettnek.

E fogalmi határok a terv ajánlott termékdöntései; elfogadás előtt nem tekintjük őket
korábban elfogadott ténynek. A tanulási workspace itt gyakorlóprojektekre vonatkozik.

## Végrehajtási feladatok és függőségek

Helyi ID-k, nem létező GitHub issue-számok. A projekt GitHub Issues-t használ;
publikáció nincs kérve, ezért ez a helyi index a publikálható feladatvázlat.
Nem készül párhuzamos második todo-nyilvántartás.

| ID | Függőség | Eredmény és elfogadási pontok | Várható érintett terület | Teszt |
|---|---|---|---|---|
| V01 | nincs | Meglévő bizonyítékok tételes leltára; minden korábbi nyitott eset kap reuse/run/block döntést indokkal; korábbi sikeres eset nem nyílik újra ok nélkül. | MANUAL-ACCEPTANCE, NATIVE-ACCEPTANCE-REPORT, új záró report | V00 |
| V02 | V01 + frissített telepítés | Valódi natív guardmarker; támogatott szerkesztési határ és command warning működés; saját izolált állapot visszaáll és más projekt változatlan. | guard elfogadási fixture és report; hiba esetén külön szűk javítás | G01–G06 |
| V03 | V01 | N01 három rövid szakasza lezárható; unresolved waiting nem oldódik fel loadkor; memória/checkpoint teljes története olvasható. | context-closure-acceptance, natív fixture, záró report | C01, M04 |
| V04 | V01 + frissített telepítés | Kimaradt kérdés/scope/reset/removed-script esetek ténylegesen megfigyeltek; csak érintett állapot változik; régi workflow-státuszok meglévő bizonyítékkal egyeztetettek. | natív fixture, MANUAL-ACCEPTANCE, záró report | M01–M03 |
| P01 | terv elfogadása + prototípus szerződése | Taskplan elfogadási forrás rögzített; unique ID/missing blocker/cycle hibák pontosak; validate nem ír állapotot. | új tasks.mjs és taskgráf teszt | P-A |
| P02 | P01 | Status determinisztikus; aktuális integrált blocker nélkül nincs ready; megváltozott input/commit visszavonja az érvényességet történetvesztés nélkül. | tasks.mjs, taskgráf teszt | P-B |
| P03 | P02 | Bind saját tiszta worktree-re/saját workflow-ra; idegen repo vagy ismételt aktív taskfoglalás elutasított; összeütköző írási terület nem indul együtt. | tasks.mjs, workflow kapcsolódási pont, integrációs teszt | P-C |
| P04 | P03 | Workereredmény tényleges commit/hash/workflow alapján rögzített; más task nevében nem írható; pause/load nem duplikál sikeres eredményt. | tasks.mjs, taskgráf teszt, handoff referencia | P-D |
| P05 | P04 | Két független task külön worktree-ben elkészül; soros integráció tényleges HEAD-en ellenőrzött; konfliktus/hibás check blokkol, forráságak megmaradnak. | implement és delivery referencia, új Git integrációs teszt | P-E, P-N |
| P06 | P05 | Meglévő bfs-implement kezeli a kért parallel scope-ot; CLI és landing-report mutatja a gráf státuszát; szokásos egytaskos flow változatlan. | cli.mjs, commands, bfs-implement, bfs-landing-report, check.mjs | P-F |
| E01 | P06 | Triage report várt/tényleges/repro/hatás/hypothesis adatot tartalmaz; duplikátumot bizonyítékkal jelöl; nincs javítás vagy külső issue. | bfs-triage skill+agent, triage referencia, natív fixture | E-T |
| E02 | P06 | Wayfinder pontos következő lépést mutat; blocked és stale eredményt nem tekint késznek; teljes fixture és state változatlan. | bfs-wayfinder skill+agent, wayfinder referencia, natív fixture | E-W |
| E03 | P06 | Practice csak új izolált célba ír; cél+feladat+futtatható check adott; nem másol titkot vagy szerkeszti az eredeti projektet. | bfs-learn skill+agent, learning referencia, natív fixture | E-L1 |
| E04 | E03 | Review valódi check alapján értékel; kért learning mentés provenance/revízióval; sikertelen gyakorlat nem válik termék-completionné. | bfs-learn, learning referencia, natív fixture | E-L2 |
| E05 | E01, E02, E04 | Új skillek catalog/README/alias/metadata/link következetes; router indokolhatóan választ; hiányzó inputnál egy lényegi kérdés. | catalog.json, README, bfs-router, check.mjs, natív fixture | E-R |
| Z01 | V02–V04, P06, E05 | Standards és Spec külön eredmény; egyszeri végső check+ZIP-smoke; teljesült vagy konkrét blockerrel lezárt elfogadási mátrix. | eredményreport, release meglévő eljárása | Z |

P01–P06 soros motorfejlesztés: nincs értelme a közös új state/CLI szerződést
párhuzamosan átírni. P06 után E01, E02 és E03 valóban független skillcsomagok;
E05 közös catalog/README integrációja egy tulajdonosé. A V ág a P/E ágtól független,
de az összesített natív eredmény az adott fagyasztott csomagra érvényes.

## Fix munkamenet és ellenőrzési kapuk

1. Elfogadáskor rögzítjük a terv/test-plan hashét és tényleges user-forrást.
2. V01: egyetlen leltár, majd az egyedi nyitott natív esetek; nincs teljes A/B ismétlés.
3. Kiadás/telepítés és prototípus külön csomagját a meglévő roadmap szerint zárjuk.
4. P01 → P02 → P03 → P04 → P05 → P06, taskonként célzott RED→GREEN.
   Kapuk P02 és P06 után: a lefedett acceptance és két review-tengely.
5. E01/E02/E03, majd E04 és soros E05. Kapu: a három nyilvános journey tényleges
   natív transcriptje, helyes routing és az eredeti projekt megőrzése.
6. Z01: ugyanazon integrációs commiton egy teljes ellenőrzés és egy ZIP-smoke;
   ezután a kért delivery. Már ellenőrzött bájtokért nem indul új natív kampány.

Nincs taskonként kötelező felhasználói interjú vagy új jóváhagyási kör.
Tényleges szerződésváltozás, cél/titok/éles jogosultság hiánya vagy anyagi következmény
állítja meg az érintett ágat. Környezeti blocker nem forráshiba és nem acceptance-PASS.

## Helyreállítás és készenlét

- Állapot/schema hiba: jól látható hiba, eredeti fájl megőrzése; nincs silent reset.
- Worker kiesés: csak saját eredménye unverified; függő feladat blokkolt, más ág mehet.
- Bázisváltozás: érintett integrációs check újra, nem minden korábbi teszt.
- Mergekonfliktus: saját integrációs branch, szűk javítás új evidence-szel;
  eredeti ág és nem commitolt useradat megőrzése, nincs reset/force-push.
- Guard native bizonyíték hiánya: pontos capability blocker, nincs trustfájl-szerkesztés.
- Kész: minden kért acceptance teljesült; blokkolt kötelező check mellett a csomag
  részben kész, nem teljesen verifikált. Ezt a kiadási döntésben tételesen jelezzük.

## Tervezési ellenőrzés

ID-k és függőségek a fenti sorrendben ciklusmentesek; minden taskhoz acceptance és
tesztazonosító tartozik. Új npm dependency vagy általános scheduler nem szükséges.
A kiadás/telepítés és a prototípus külső kapuk, ezért jelen terv nem állítja, hogy
a P ág már most indítható. A korábbi roadmapet csak új felhasználói döntés változtatja.
