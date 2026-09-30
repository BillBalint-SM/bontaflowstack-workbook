# Főskill-módszertan: megvalósítás és ellenőrzés

Dátum: 2026-09-30. Az [elfogadott terv](CORE-SKILL-METHODOLOGY-PLAN.md)
négy szelete elkészült a helyi forrásban. A 16 elfogadási eset végső megfigyelt
eredménye PASS. Összesen 32 friss natív futás készült: 23 az első körben, majd
hét célzott ellenőrzés és két beszélgetési Spec-változat. A PASS az elvárt
agentviselkedést jelenti; például a
hiányzó szolgáltatás helyes BLOCKED kezelése sikeres elfogadási eset.

## Változtatások

| Terület | Megvalósítás |
|---|---|
| Döntések, útválasztás | HOST közös tény/elfogadott döntés/érdemi kérdés szabály; router közvetlen accepted-spec útvonala; business-builder döntési frontier. |
| Domain | Feltételes discovery referencia és spec: meglévő domain-forrás, viselkedést érintő fogalomütközés, tényleges döntési forrás, elvetett ágak eltávolítása. |
| Teszthatárok | Spec és engineering review: követelményforrás, előfeltétel, művelet, várt eredmény és publikus próba; testing referencia kezeli a környezeti és natív ellenőrzési határokat. |
| Függőségi feladatbontás | Engineering review/autoplan és planning referencia: vertikális feladatok, helyi ID-k, blokkolók, elfogadási esetek, érvényes bizonyíték, hiányzó ID és ciklus. |
| TDD | A meglévő bfs-implement törzsében egyetlen eljárás; bug-investigate reprodukciója ugyanazon aktív fix lépésen belül használja. A katalógus tartalmazza a handoffot. |
| Review | A meglévő bfs-review és review referencia két tengelyt értékel ugyanazon rögzített alapon, külön státusszal és bizonyítékkal. Kért független review külön reviewerekkel végezhető. |

Nincs új skill, dependency, döntési adatbázis, workflow-scheduler vagy engine-változás.
A korábbi kontextusfejlesztés munkafája megmaradt. A három kért módszer a meglévő
tervet használta elfogadott alapként, feltételes kontextusbetöltéssel, négy
ellenőrizhető szelettel és mentett checkpointokkal.

## Natív bizonyíték

Codex CLI 0.159.0; gpt-6-sol, medium; Windows, Node 26.7.0. Minden futás külön
valós threadet, projektet és BFS_STATE_HOME állapotot használt. A source-kiválasztás
explicit volt. A runner megőrzi a promptot, JSONL eseményeket, parancsokat és
diagnosztikát, végső választ, fájllenyomatokat és tényleges BFS-állapotot.
Az esetek értékelése ezek vizsgálatából készült, nem a CLI 0-s exitjéből.

Privát bizonyítékgyökerek:

- I: `%LOCALAPPDATA%/Temp/bfs-core-methodology-20260930`
- II: `%LOCALAPPDATA%/Temp/bfs-core-methodology-correction-20260930`
- III: `%LOCALAPPDATA%/Temp/bfs-core-methodology-conversation-20260930`

Esetenként: `evidence/<eset>-<ismétlés>/result.json`, `events.jsonl`, `final.txt`;
állapot: `projects/<eset>-<ismétlés>/.bfs-state`; forráslenyomatok: `manifest.json`.
A [runner](../../tests/methodology-acceptance.mjs) és a
[futtatási eljárás](MANUAL-ACCEPTANCE.md#core-skill-methodology-cases) újrahasználható.

| Eset | Végső eredmény | Megfigyelés és bizonyíték |
|---|---|---|
| A01 | PASS, 2 futás | I/A01-1,2: auth=local-password kiolvasása, erre nincs ismételt kérdés; fájlok változatlanok. A második futás a meg nem adott új viselkedést tisztázta. |
| A02 | PASS, 2 futás | I/A02-1,2: freelancers és monthly döntés újrahasználata, újrakérdezés nélkül; csak brief készült. |
| A03 | PASS | I/A03-1: előbb célcsoport-választás, konkrét szerepkör/journey következményekkel; további munka a válaszig megállt. |
| A04 | PASS | I/A04-1: enterprise/SSO kizárások megmaradtak; ezekből nem lett kérdés vagy feladat. |
| A05 | PASS | I/A05-1: login account és billing account elkülönül a CONTEXT.md alapján; számlázási kontakt változatlan. |
| A06 | PASS, 2 végső futás | II/A06-1,2: elfogadott spec közvetlen implementációja, RED/GREEN, CLI és külön review; nincs új brief vagy ismételt jóváhagyás. |
| A07 | PASS javítás után | II/A07-1: node test.mjs exit 1, Hi/Hello AssertionError; minimális app.mjs javítás; ugyanaz a próba exit 0; eredeti CLI retest. Egyetlen fix step csak ezután completed. |
| A08 | PASS | II/A08-1: ERR_MODULE_NOT_FOUND környezeti akadály, nem viselkedési RED; workflow BLOCKED, termékfájl változatlan. |
| A09 | PASS pontosított fixture-rel | II/A09-1: A és B tényleges ellenőrzése; C ready, D C-től blocked. A hiányzó hibaágat nem implementálta planning kérésre. |
| A10 | PASS | I/A10-1: A -> B -> A ciklus és C -> MISSING hivatkozás konkrétan jelentve; nincs indítható feladat. |
| A11 | PASS, 2 futás | I/A11-1,2: Standards PASS, Spec FAIL; üres név nem dobja az előírt Name required hibát. |
| A12 | PASS végső futás | II/A12-1: Standards FAIL az elérhető naplóürítés miatt, Spec PASS statikus forrásvizsgálattal; a destruktív formatter és teszt nem futott, journal megmaradt. |
| A13 | PASS, 2+2 futás | I/A13-1,2: Standards PASS, Spec BLOCKED; a meglévő tesztet nem nevezte követelményforrásnak. III/A13-conversation-1,2: a tényleges felhasználói követelményt Spec-forrásnak elfogadta, a hiányzó üresnév-hibát FAIL-ként jelentette. |
| A14 | PASS | I/A14-1: régi zöld eredmény hash-e elavult; valódi újrafuttatás exit 1; review FAIL, termékmódosítás nélkül. |
| A15 | PASS, 2 változat | I/A15-plan-1 és II/A15-diagnose-1: tervezés/diagnózis, tényleges hibapróba; termékfájlok változatlanok. A diagnózis-mód az instrukciójavítás után is újra lefutott. |
| A16 | PASS | I/A16-Standards-1 és A16-Spec-1: külön valós reviewerek, közös commit és teljes egyező inputlenyomatok; Standards PASS és Spec FAIL. |

A16 reviewerazonosítók: `01a0f39a-a209-7980-ad86-c39d6f90878d` (Standards),
`01a0f39a-edcb-7593-a80f-8fb0883aad65` (Spec). Közös bázis:
`10985f73cbc6d65c2289ede16fab0ac7216ce330`. Eredményeik összeegyeztethetők:
az üres név hiányzó hibája követelményi finding, önálló Standards hiba nem igazolt.

## Felfedezett pontok és korrekciók

Az első A07 a javítást elvégezte, de a fix-mode investigation stepet már a
diagnózis után completedre állította, majd külön implement stepet indított.
A hiba az instrukcióban nem eléggé kötött befejezési határ volt. A bug-investigate
és implement most az aktív hívó lépésen belül alkalmazza a TDD-t. A célzott új
A07 egyetlen fix stepben, RED/GREEN és eredeti reprodukció után zárt. A06 két
friss ismétlése és A08 is újra lefutott az érintett implement-szöveggel.

Az első A09 fixture C és D elfogadási kimenetét nem határozta meg elég pontosan;
az agent helyesen hiányzó követelményt jelzett. A fixture a konkrét exportált
hibával és CLI-hibakimenettel bővült, a skillt emiatt nem változtattuk.

Az első A12 válasz egy pontot tévesen az idézett Hello, Ada eredménybe tett.
A tengelyek és adatvesztési finding helyesek voltak, de a szöveges bizonyíték
pontatlan. Az új A12 pontos eredményt és explicit statikus korlátot közölt;
a korábbi válasz a nyers bizonyítékban megmaradt. Ez megfigyelt válaszvariancia,
nem bizonyíték arra, hogy minden későbbi megfogalmazás hibamentes lesz.

A végső source-review a fixture-készítőben ismételhetőségi rést talált:
a Git commit időbélyege miatt azonos reviewer-bemenetből eltérő base ID is
keletkezhetett volna. A fixture commitok most rögzített teszt-időbélyeget kapnak;
egy új fixture-készítés igazolta az azonos A16 bázist és fájllenyomatokat.
Ez fixture-metadata korrekció, a vizsgált plugin bájtjait nem módosította.

A második szelet packaging-ellenőrzése túl korán felvett TDD-anchorra bukott;
a link javítása után a teljes ellenőrzés átment. Ez nem viselkedési RED teszt.

## Ellenőrzés és határok

Mind a négy szelet végső `node scripts/check.mjs` futása 43/43 PASS; a handoff
korrekció utáni futás is 43/43 PASS. A runner szintaktikai ellenőrzése,
a módszertani dokumentumok helyi linkjei és `git diff --check` sikeresek.
PowerShell összetett parancsnál a shell exit mellett a kiírt tényleges Node
exitkódot és diagnosztikát is értékeltük; wrapper exit 0 nem jelent zöld tesztet.

A II és III forrás a jelenlegi plugin 87 fájljával teljesen egyezik. I és II között
csak a két javított SKILL.md változott; az I-ből újrahasznált esetek betöltött
instrukciói és vizsgált bemenetei változatlanok. Mindhárom fagyasztott másolat
lenyomatai változatlanok maradtak az agentfuttatások alatt. HOST SHA-256:
`5f80fdb29599a69d629fffbf7c2d3482726a86603cef46b96ced40a4e2471d60`.

Ez célzott natív elfogadási bizonyíték, nem statisztikai minőség- vagy sebességmérés.
Nem bizonyít automatikus installed-plugin kiválasztást, minden domainhelyzetet,
új browser/engine működést vagy teljes deploymentet. Az A12 Spec eredménye statikus;
a kód futtatása felhasználói adatot törölt volna. A telepített 0.5.1 cache nem
frissült; a változtatások helyi, nem commitolt forrásban vannak.

Végső forrás-review: Standards PASS a módszertani diff körében, Spec PASS a terv
A01-A16 eseteinek fenti végső bizonyítékai alapján. A review nem minősíti újra
a korábbi, külön kontextusfejlesztés teljes diffjét.
