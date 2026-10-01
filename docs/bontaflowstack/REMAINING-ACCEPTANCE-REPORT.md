# Korábbi natív elfogadási maradékok

Dátum: 2026-10-01. Scope: V01–V04 a [végrehajtási terv](../../tasks/plan.md)
és a [tesztterv](../../tasks/test-plan.md) szerint. Ez natív viselkedési leltár,
nem új teljes csomagellenőrzés.

## V01 — meglévő bizonyítékok és futási döntés

| Nyitott eset | Döntés | Bizonyíték és határ |
|---|---|---|
| Aktív guard natív észlelése, boundary, warning/approve, release | **Újrahasználás** | A [GUARD-NATIVE-REPORT](GUARD-NATIVE-REPORT.md) az elsődleges chat valódi PreToolUse- és eszközeseményeit rögzíti. G01–G06 állapotai alább. Nem fixture-markerből következtet. |
| N01 összetett pause → másik munka → új chat → export | **Újrafuttatás, rövid szakaszokban** | C01-1–3 külön natív taskokkal befejeződött; részletek lent. A korábbi N01 időkorlátos sessionjei nem válnak utólag sikeressé. |
| N08 külön export és N09 külön pause | **Újrahasználás** | A [kontextuszárási report](CONTEXT-CLOSURE-REPORT.md) és evidence: N08/N09 külön task, tényleges export/read-back illetve pontosan egy pause-snapshot. |
| M01 egyértelmű szöveges választás | **Újrafuttatás** | `M01-clear`: chat-központú szöveges választ `chat` értékre képezte, felhasználói szintre mentette és visszaolvasta. |
| M01 kétértelmű válasz | **Újrafuttatás; PASS** | Az első natív menet 180 s után a launcher/core/context felfedezésénél timeoutolt, preference-művelet nélkül. A launcher megadását javító célzott harnesssel az új natív task hat konkrét olvasási/parancshívással ténylegesen megjelentette a panel/chat tisztázó kérdést; preference nem mentődött, a task előtte/utána állapota változatlan. A forrás nem változott. |
| M02 hatókör-elsőbbség és kiválasztott reset | **Újrafuttatás** | Natív preference írás/read-back: feladat `chat` nyert; task reset után projekt `prefer-panel` nyert; user `chat` és projektválasztás megmaradt. A termékfájlok hash-ei változatlanok. |
| M03 közvetlen browse és scrape belépés, mentett script-kérés | **Újrafuttatás** | Mindkét közvetlen skill jelzett unsupported script-tárolást; nem mentett scriptet/workflow-t, nem módosított fájlt. URL és böngészőmotor hiányában élő oldal viselkedése nem volt cél. |
| M04 megválaszolatlan user-döntéssel resume | **Újrafuttatás** | Új native task felolvasta a valódi várakozó workflow-t; a `waiting` státusz és függő implementáció megmaradt, az agent a hiányzó döntést kérte. Product fájlok nem változtak. |
| Korábbi irányítási, setup, review, QA/design, memória- és delivery-esetek | **Újrahasználás** | A [native acceptance report](NATIVE-ACCEPTANCE-REPORT.md) 19 összevetett esetet, a célzott javító kör öt natív menetét és a tényleges desktop panelválaszokat rögzíti. A végső elfogadási jelentésekben ezek PASS-ként szerepelnek. Nincs új ok ugyanazon bájtokon teljes A/B futtatására. |
| Core/package check és ZIP smoke a kontextuszáráshoz | **Újrahasználás** | A [kontextuszárási report](CONTEXT-CLOSURE-REPORT.md) és `CONTEXT-CLOSURE-EVIDENCE.json`: 52/52 check, ZIP build és smoke. Nem futtattuk újra ebben a natív leltárban. |

## G — guard natív eredmények

Az elsődleges desktop chat valódi, 0.6.1 telepített plugint használt. A core
guard SHA-256 a forrásban és a telepített csomagban egyezett:
`6f8bc64576b632f249ddb8ce26c870ee19d8f328795d24ca342742555049067f`.
G06 parancsai normál konfigurációval futottak (nem használtak
`--ignore-user-config` vagy hook-trust bypass kapcsolót):
`codex exec -C <repo-root> --json -o <same-workspace-final.txt> -`, majd
`codex exec -C <disposable-git-repo> --json -o <isolated-workspace-final.txt> -`;
mindkettő stdinje kizárólag `bfs-guard status`-t kért. A child CLI indításakor
csak az örökölt `CODEX_THREAD_ID` környezeti értéket ürítettük az indító
PowerShell-folyamatban, hogy a CLI valódi új taskazonosítót állítson elő; az
indító folyamat eredeti értékét azonnal visszaállítottuk. Az első próbálkozás
örökölt task ID-val a hook által elutasítva zárult, sem status-parancs, sem
állapotváltozás nem történt. Sikeres futások nyers JSONL/final/stderr fájljai:
`%TEMP%\bfs-g06-native-20261001`.

| Eset | Eredmény |
|---|---|
| G01 | PASS: friss natív marker, `hookObservedRecently=true`, boundary saját `.tmp` tesztkönyvtárra beállítva és visszaolvasva. |
| G02 | PASS az elérhető eszközre: tényleges `apply_patch` az engedélyezett probe-on sikerült; külső probe-ot PreToolUse elutasított, a fájl nem jött létre. Külön `Edit`/`Write` eszköz nem volt elérhető, ezért azokra nincs natív eredmény. |
| G03 | PASS: `warnings=true` mellett az izolált markerfájl törlése pending állapotban megállt; az első hívás nem futott le. |
| G04 | PASS: a tényleges felhasználói jóváhagyás csak az azonos parancsra/célra adott egyszeri grantet; a változatlan hívás egyszer futott. Az azonos ismétlés új pending ID-t kapott. |
| G05 | PASS a biztonságos próbára: projektgyökér rekurzív törlésének `-WhatIf` előnézetét a natív hook hard-deny blokkolta. Végrehajtható projekt-törlést nem küldtünk. |
| G06 | PASS a natív izolációs összehasonlításra: miközben az eredeti task `warnings=true`, `boundary=null` állapotú volt, két friss normál `codex exec` task tényleges installed PreToolUse markert adott. Ugyanabban a workspace-ben: task `01a0f783-dfd9-7410-80e9-3ab90adf5421`, workspace `a48356aacb43dd12f43849f554e4deb93487abaf014df7fd5b278168fcab172c`; `warnings=false`, `boundary=null`. Külön ideiglenes Git workspace-ben: task `01a0f785-d029-73e2-87f5-c5c0838ecd21`, workspace `43d8749282ff329d6bb267ea893220a60d4d60ffb6c7712edd7cc570eb6a1417`; ugyancsak `warnings=false`, `boundary=null`. Ez bizonyítja, hogy az eredeti task engedélyezése nem öröklődött át más taskra sem azonos, sem eltérő workspace-ben. A futások kizárólag status/read műveleteket végeztek; a root policyt a native ellenőrzés után 2026-10-01 12:55:24 UTC-kor warnings=false/boundary=null értékre állították vissza. |

A natív eredmény a host `apply_patch` és `exec_command` útját fedi le. Tetszőleges
shell-írás nem része az edit boundary garanciájának. A részletek, task/workspace
azonosítók és konkrét pending ID-k a guard reportban vannak.

## Korábbi blokkolt workflow-k — egyeztetési javaslat

Nem módosítottam workflow-állapotot. A későbbi folytatás saját adoptot és csak az
adott, bizonyított lépés frissítését használja; a régi workflow-k és history
megmaradnak.

| Workflow | Bizonyítékhoz kötött egyeztetés | Ami még nem támasztható alá |
|---|---|---|
| `c2cf4074-c3b4-4501-bee7-51b4b56d0307` — nyelvi optimalizálás | A két eredeti instrukciójavítás és dokumentált native menetek már rendelkeznek reporttal. A guard saját G01–G06 native eseményekkel bővült; a korábbi teljes native kampány újrafuttatása nem indokolt. | E leltár nem módosít workflow-állapotot; a bizonyítékok tulajdonosi egyeztetés után külön lépésekre rögzíthetők. |
| `e340a007-7cec-4ce0-a8ba-febd74bc1106` — kérdésmegjelenítés | A desktop report valós panelválasztást és chat-fallbackot, a jelen riport pedig M01 egyértelmű mentést, kétértelmű válasz tisztázását, M02 hatókör-resetet és M04 waiting folytatást bizonyít. Ezek az elfogadási alapjuk szerinti lépések bizonyítékhoz kötötten frissíthetők. | E leltár nem módosít workflow-állapotot; tulajdonosi egyeztetés után az igazolt lépések zárhatók, a workflow egészét külön kell értékelni. |

Ez egyeztetési input a workflow gazdájának. Nincs automatikus régi task-adat
prune, adopt vagy státuszváltás; a jelen task nem azonos ezeknek a tulajdonosával.

## C01 és M01–M04 új natív futásai

Runner: `tests/remaining-native-acceptance.mjs`, a meglévő
`tests/methodology-acceptance.mjs` eseményrögzítő határával. Minden native task
saját projektet és `.bfs-state` könyvtárat kapott; a C01 három szakasza ugyanazt
a kizárólag e próbához létrehozott Git-fixture-t használta. A runner 180 s-os
futáslimitet rögzített. Nyers promptok, JSONL tool események, stderr, végső
válaszok, task ID-k és előtte/utána fájllenyomatok helyben maradtak:
`C:\Users\littl\AppData\Local\Temp\bfs-remaining-native-20261001-final`.

| Eset | Native task ID | Kilépés / idő | Megfigyelt elfogadás |
|---|---|---:|---|
| C01-1 | `01a0f75e-8e1f-7380-81f2-fcf7a86b1a78` | 0 / 167.8 s | Egyetlen pause-snapshot; checkpoint és két memóriarevízió visszaolvasva. |
| C01-2 | `01a0f766-dede-7793-b40e-139610f55d52` | 0 / 135.9 s | Másik workflow külön elkészült; az első checkpoint/memória megmaradt. A workflow ID `other-work.json`-ba került. |
| C01-3 | `01a0f769-1b05-7361-aec5-ac8eabc2b0e0` | 0 / 152.6 s | Új taskban adopt és export; mindkét teljes memóriarevízió és a másik kész workflow ellenőrizve. `handoff.md` elkészült; termékfájl nem változott. |
| M01 egyértelmű | `01a0f763-a5d9-7cb0-9e4b-ebbe5d3f1a80` | 0 / 96.2 s | Természetes nyelvű chatválasz → kanonikus `chat`, user-scope mentés/read-back. |
| M01 kétértelmű — első futás | `01a0f763-a61a-7723-adc5-695efda6b34f` | null / 180.0 s | **Timeout retained as historical attempt**; kezdeti launcher/core/context felfedezése alatt állt meg, preference-művelet nélkül. |
| M01 kétértelmű — javított harness | `01a0f786-c7e5-7890-9182-3668c994f25f` | 0 / 56.421 s | PASS: panel vagy chat tisztázó kérdés jelent meg; nem mentett preference-et, előtte/utána tárolt task-állapot azonos. Bizonyíték: `%TEMP%\bfs-m01-entry-correction-20261001\evidence\M01-ambiguous-1\result.json`. |
| M02 | `01a0f763-a60e-7e80-b675-6d468b834463` | 0 / 113.9 s | Task > project > user precedencia, majd csak task override reset. |
| M03 browse | `01a0f761-a8e8-7f82-919c-ca2f58f6e156` | 0 / 58.3 s | Script-tárolás unsupported; nincs böngészés vagy mentés. |
| M03 scrape | `01a0f761-a8ed-78b1-b341-cff3ff6c4880` | 0 / 70.9 s | Script-tárolás unsupported; hiányzó URL/motor jelzett; nincs mentés. |
| M04 | `01a0f761-a931-7ba2-8508-051846446abc` | 0 / 108.9 s | Workflow ténylegesen `waiting` maradt, a függő munka nem indult el; a hiányzó userdöntést kérte. |

Parancsok:

```powershell
node --check tests/remaining-native-acceptance.mjs
node tests/remaining-native-acceptance.mjs create C:/Users/littl/AppData/Local/Temp/bfs-remaining-native-20261001-final plugins/bontaflowstack
node tests/remaining-native-acceptance.mjs run C:/Users/littl/AppData/Local/Temp/bfs-remaining-native-20261001-final C:/Users/littl/AppData/Roaming/npm/node_modules/@openai/codex/bin/codex.js C01-1
node tests/remaining-native-acceptance.mjs run C:/Users/littl/AppData/Local/Temp/bfs-remaining-native-20261001-final C:/Users/littl/AppData/Roaming/npm/node_modules/@openai/codex/bin/codex.js C01-2
node tests/remaining-native-acceptance.mjs run C:/Users/littl/AppData/Local/Temp/bfs-remaining-native-20261001-final C:/Users/littl/AppData/Roaming/npm/node_modules/@openai/codex/bin/codex.js C01-3
node tests/remaining-native-acceptance.mjs run C:/Users/littl/AppData/Local/Temp/bfs-remaining-native-20261001-final C:/Users/littl/AppData/Roaming/npm/node_modules/@openai/codex/bin/codex.js M03-browse M03-scrape M04
node tests/remaining-native-acceptance.mjs run C:/Users/littl/AppData/Local/Temp/bfs-remaining-native-20261001-final C:/Users/littl/AppData/Roaming/npm/node_modules/@openai/codex/bin/codex.js M01-clear M01-ambiguous M02
```

## Hash és bizonyítási határ

A native fixture a `bc311b8` körüli 0.6.0 forrásállapotból fagyasztott 95 fájlt;
az összesített manifest-hash `c59fb01b372cd70b9df5fb389a9763c822c23fcababf8213d9a9233344b96537`.
Ez nem azonos teljes csomagként a később telepített 0.6.1-gyel. A C01/M01–M04
viselkedés szempontjából használt 16 releváns fájl — HOST, CLI/state/workflow/memory/context/handoff,
commands/context/browser references és az érintett skilltörzsek — bájtról bájtra
egyezett a 0.6.1 cache példányával; ezt a `C01`/`M` eredmények értelmezéséhez
használtuk. A katalógus és pluginverzió eltér, a fixture-ben négy 0.6.1-ben még
nem létező fájl volt. Ezért a natív esetek nem tanúsítják a teljes pluginverziót,
a változó catalog routingot vagy a későbbi 0.7.0 munkafát.

Az első C01-1 futtatási próbája megszakadt, mielőtt eredményt mentett volna; az
új, szabályozott 180 s-os futás a fenti task ID-val zárult. M01 kétértelmű
esetén az első launcher-felfedező futás timeoutolt, de a konkrét entry pointtal
indított javító natív futás bizonyította a tisztázó kérdés megjelenítését,
mentés nélkül. Nincs forrás-/csomaghiba megállapítva az első timeoutból. A
testterv teljes végső check/ZIP-smoke és az új P/E funkciók native elfogadása
külön, azok integrációja után marad.
