# Wilson – gesicherter Arbeitsstand, 27.11.2026

Ziel sind **1500 tatsächlich nutzbare, einzeln geprüfte Bildkarten**. Dieser Arbeitsstand enthält **724 aktive Karten**. Paket 04 ergänzt fünf Begriffe zu Bus und Bahn. Bis zum Ziel fehlen **776 Karten**. Auf der Hauptdomain wurden nach dem Deploy von [Paket 03](https://github.com/SirCollinsXI/thetwokings/pull/12) **719 aktive Karten** bestätigt.

| Paket | Commit | Karten | Tests | Offen |
| --- | --- | --- | --- | --- |
| 2 · Küche und Haushalt | `3c0ecc04a4aa33bafa225591bb82d75fbd546b99` | +5 → 714 | Website, Eingabe, Vokabular, CTA, 222 historische Bild-Hashes, bytegleicher Offline-Build, Live-Galerie und Kartenaufruf | Hörbare Geräteausgabe |
| 03 · Unterwegs | [PR #12](https://github.com/SirCollinsXI/thetwokings/pull/12) | +5 → 719 | Wortformen, SVG, Galerie, Eingabe, Lernstand, CTA, Offline-Build und Live-Abgleich | Hörbare Geräteausgabe |
| 04 · Bus & Bahn | [Änderungen](https://github.com/SirCollinsXI/thetwokings/compare/main...codex/wilson-paket-04) | +5 → 724 | Wortformen, SVG, Galerie, Eingabe, Lernstand, CTA und Offline-Build | Live-Abgleich nach Veröffentlichung und hörbare Geräteausgabe |

## Bestand

| Gruppe | Anzahl | Im Trainer |
| --- | ---: | --- |
| Ursprüngliche Projektillustrationen | 22 | Ja |
| Geprüfte Mulberry-Wortkarten | 596 | Ja |
| Gerettete eigene SVG-Zeichnungen | 66 | Ja |
| Eigene SVG-Zeichnungen · Küche und Haushalt, Paket 1 | 25 | Ja |
| Eigene SVG-Zeichnungen · Küche und Haushalt, Paket 2 | 5 | Ja |
| Eigene SVG-Zeichnungen · Unterwegs, Paket 3 | 5 | Ja |
| Eigene SVG-Zeichnungen · Bus & Bahn, Paket 04 | 5 | Ja |
| Gesperrte Zuordnungen | 47 | Nein |
| Alternative oder doppelte Motive | 10 | Nein |
| Ungeprüfte Kandidaten im gespeicherten Manifest | 0 | Nein |

Die 724 Karten umfassen **648 Nomen**, **25 Tätigkeiten/Infinitive**, **34 Zahl-/Bruchaufgaben**, **12 Eigenschafts-/Lage-/Ordnungsaufgaben** und **5 Wendungen**. Zahlenaufgaben sind ausdrücklich Zahlenaufgaben, keine zusätzlichen Gegenstandsillustrationen. Unbebilderte Wörter im Hauptbestand zählen nicht als fertige Karten. Alternative Motive innerhalb einer bereits vorhandenen Wortzuordnung zählen ebenfalls nicht zusätzlich.

## Küche und Haushalt, Paket 1

25 vorhandene Wort-IDs aus dem PONS-basierten Lexikon wurden aktiviert. Die eigenen SVGs unter `wilson/original-household/` wurden einzeln auf einem gerenderten Kontaktbogen geprüft. Artikel, Wortformen, IPA, Englisch, Mandarin und Pinyin wurden redaktionell abgeglichen. Die Pfade zu den Zeichnungen stehen im Manifest.

- `v471` Handrührgerät und `v974` Schuhlöffel ersetzen gesperrte Motive. Die früheren Entscheidungen bleiben in `reviewHistory` auffindbar.
- Mehrsprachige Hinweise präzisieren unter anderem die Motive für Einbauküche, Kissenbezug, Laken, Tischläufer und Wäschetrockner.
- Die deutsche Lautschrift und Mandarin wurden redaktionell geprüft. Eine unabhängige Sprachprüfung steht aus.

## Küche und Haushalt, Paket 2

Die fünf vorhandenen IDs `v531` (Inbusschlüssel), `v810` (Papierkorb), `v1079` (Starthilfekabel), `v1101` (Stromkabel) und `v1102` (Stromzähler) sind mit eigenen SVGs im Trainer und in der Galerie aktiviert. Die zwei ersetzten Sperrentscheidungen bleiben in `reviewHistory`. Der Filter **Neu · Küche & Haushalt** zeigt die fünf Karten aus Paket 2. [Prüfung und Arbeitsstand](WILSON-HOUSEHOLD-02.md)

## Unterwegs, Paket 3

Die Galerie zeigt unter **Neu · Unterwegs** fünf eigene SVGs für bestehende Lexikon-IDs. Alle fünf Motive wurden bei 120 × 85 und 220 × 156 Pixeln geprüft. Dreisprachige Bildhinweise grenzen ähnliche Begriffe ab.

| ID | Karte | Englisch | Mandarin |
| --- | --- | --- | --- |
| `v74` | der Bahnsteig, die Bahnsteige | railway platform | 站台 |
| `v164` | der Bürgersteig, die Bürgersteige | pavement | 人行道 |
| `v314` | der Fahrkartenautomat, die Fahrkartenautomaten | ticket machine | 自动售票机 |
| `v473` | das Handschuhfach, die Handschuhfächer | glove compartment | 手套箱 |
| `v633` | der Kreisverkehr, die Kreisverkehre | roundabout | 环形交叉路口 |

Beim Fahrkartenautomaten zeigt der Trainer den Hinweis zur N-Deklination. Der Plural *Kreisverkehre* bezieht sich auf die Straßenbauform. *环岛* ist eine weitere gebräuchliche Bezeichnung für diesen Begriff. [Duden · Fahrkartenautomat](https://www.duden.de/deklination/substantive/Fahrkartenautomat) · [Cambridge · Kreisverkehr](https://dictionary.cambridge.org/de/worterbuch/deutsch-englisch/kreisverkehr) · [Cambridge · roundabout](https://dictionary.cambridge.org/dictionary/english-chinese-simplified/roundabout)

## Bus & Bahn, Paket 04

Der Galeriefilter **Neu · Bus & Bahn** zeigt fünf vorhandene Lexikon-IDs mit eigenen SVGs. Die Hinweise in Deutsch, Englisch und Mandarin beschreiben den jeweiligen Gegenstand im Verkehrskontext.

| ID | Karte | Englisch | Mandarin |
| --- | --- | --- | --- |
| `v168` | die Bushaltestelle, die Bushaltestellen | bus stop | 公交车站 |
| `v313` | die Fahrkarte, die Fahrkarten | travel ticket | 车票 |
| `v315` | der Fahrplan, die Fahrpläne | timetable | 时刻表 |
| `v461` | der Halteknopf, die Halteknöpfe | stop request button | 下车铃按钮 |
| `v462` | die Halteschlaufe, die Halteschlaufen | grab strap | 扶手吊环 |

Bei `v461` bezeichnet **下车铃按钮** den Knopf im Bus, mit dem Fahrgäste den Ausstiegswunsch melden. Die freigegebene Karte übernimmt diese Form mit Pinyin **xiàchēlíng ànniǔ**. [Shangqiu Busbetrieb · Haltewunsch](https://www.sqjtcy.com/a/gsxw/2023-03-24/5852.html) · [Verkehrsverbund Rhein-Neckar · Tipps zum Busfahren](https://www.vrn.de/service/downloads/mobilitaetstraining/dokumente/tipps_zum_busfahren.pdf) · [Hubei Daily · Halteschlaufen](https://news.cnhubei.com/content/2024/08/17/content_18297471.html)

Die Wortformen für Bushaltestelle, Fahrkarte und Fahrplan wurden im Duden abgeglichen. Die Lautschrift für Halteknopf wurde aus den Wortbestandteilen abgeleitet. [Duden · Bushaltestelle](https://www.duden.de/rechtschreibung/Bushaltestelle) · [Duden · Fahrkarte](https://www.duden.de/rechtschreibung/Fahrkarte) · [Duden · Fahrplan](https://www.duden.de/deklination/substantive/Fahrplan)

## Was gerettet und zusammengeführt wurde

GitHub-Basis der vorherigen Wiederherstellung: `1634346e04916ad68d2dcd92400fe420dcad8f9d`. Die ältere Übergabe mit 22 Karten war überholt. Drei noch vorhandene, unveröffentlichte Arbeitsstände wurden in einem frischen Checkout dieser Basis zusammengeführt. Das ist kein Beleg, dass ihre lokale Arbeit schon veröffentlicht war.

`wilson-image-candidates.js` ist nun das gemeinsame Prüf- und Bildmanifest; `wilson-vocabulary.js` projiziert es für Eingabetrainer, Einfach, Pro und Kinderwelt. Die 1514 Originaleinträge in `wilson-lexicon.js` und ihre IDs bleiben unverändert. Die Haupt-App enthält zusätzlich eigenständig ergänzte Natur-/Lebensmittelwörter; nicht alle unbebilderten Einträge sind sprachlich geprüft.

Alle 684 vor Paket 1 aktiven Karten behalten ihre IDs, Lemmata und Bilddateien. Für die ältesten 222 Karten prüft die vorhandene Referenz zusätzlich die historischen Bild-Hashes. Eingabe-, Pro- und Kinderfortschritt werden nicht zusammengelegt; Speicherformat und bestehende Schlüssel bleiben erhalten. Kein automatischer Geräteabgleich. Export/Import bleiben verfügbar.

## Redaktionelle Prüfung

Alle 443 zunächst zusammengeführten neuen aktiven Motive sowie 28 weitere Motive wurden mit Inkscape gerendert und einzeln auf beschrifteten Kontaktbögen angesehen. DE/EN/ZH und Wortformen wurden daneben redaktionell abgeglichen. Die endgültige Auswahl berücksichtigt Doppelungen und Sperrungen. Das ist eine KI-gestützte erste Sichtung, keine unabhängige muttersprachliche, phonetische oder pädagogische Validierung.

Beispiele für Korrekturen: Reitsattel → 马鞍; Pak-Choi-Motiv nicht als Chinakohl ausgeben; Frühstücksflocken und Chips jeweils einem vorhandenen Lexikoneintrag zuordnen; Tabletten gezielt vor dem Fläschchen abfragen; links stehenden Becher bei „klein“ nennen; Bildaufgaben für Rechenzeichen als Infinitive stellen. Eine unklare Zuckerschale, wenig charakteristische Paranuss-/Frettchenmotive sowie zwei Werkzeugzeichnungen sind gesperrt. Doppelte Kohl-, Nugget-, Melonen-, Shorts- oder Lebensmittelmotive erhöhen die aktive Anzahl nicht.

Nomen verlangen passende Singular-/Pluralformen; Tätigkeiten, Zahlen und Wendungen eigene Aufgaben. Geprüfte Synonyme werden angenommen. Galerie-Links öffnen eine gezielte Karte, anschließend läuft die fällige Wiederholung weiter. Vorgezogenes richtiges Wiederholen erhöht weder Serie noch geplanten Abstand. Chinesisches Komma, Groß-/Kleinschreibungshinweis und IME-Schutz bleiben vorhanden. Mehrere Tabs lesen vor einer Wertung den aktuellen Lernstand und serialisieren mit Web Locks, soweit der Browser diese anbietet.

## Bildnachweise

Mulberry Symbols, Steve Lee, CC BY-SA 4.0; Quellrevision `fa94a93ca1b5357c0b6e0d9f8a81c426a1dfefdf`. Alle **596 aktiven Mulberry-Dateien** wurden bytegenau anhand der Git-Blob-Hashes dieser Revision geprüft. Individuelle feste Quellenlinks, SHA-256 und Upstream-Blob-Hashes stehen im Manifest; Original-Lizenzhinweis unverändert unter `wilson/mulberry/LICENSE.txt`. Trainer und Galerie unterscheiden Mulberry von eigenen, KI-gestützt erstellten SVG-Zeichnungen. Keine pauschale rechtliche Freigabe behauptet.

Keine PONS-Bilder, Buchseiten oder Aufnahmen übernommen. Audio stammt aus Gerätesprachsynthese. Kimi K3.1 Pro wurde nachgelagert für eine sprachliche Zweitprüfung zu 23 Karten aus Paket 1 eingesetzt. Die Anmerkung zur Aussprache von 妈咪包 bleibt zur Nachprüfung vermerkt. DNS und Hosting unverändert.

## Wiederholbare Prüfungen

```sh
node scripts/check-site.mjs
node scripts/test-wilson-input.cjs
node scripts/test-wilson-vocabulary.cjs
node scripts/test-wilson-cta.cjs
node scripts/build-wilson-offline.cjs
python scripts/render-wilson-review.py /tmp/wilson-review
```

Inhaltstests prüfen alle 719 Karten und 222 historische Bild-Hashes, eindeutige IDs/Lemmata/Bild-Hashes, vollständige DE/EN/ZH/IPA, Quellen, Sperrungen, Aufgaben, Antwortvarianten, Retry, Audio-Ansteuerung/Fallback, Speichern/Neustart, Export/Import-Validierung, IME und Wiederholungen. Der Offline-Download wird aus denselben Daten mit allen aktiven SVGs eingebettet erzeugt; Quellen-/Navigationslinks sowie einige Gerätestimmen benötigen Internet.

`scripts/wilson-browser-preview.html` stellt echte Seiten in 390 und 1280 CSS-Pixeln für die Browserprüfung dar. Das ersetzt keine Tests auf echten iPhone-/Android-Geräten; hörbare Ausgabe und gerätespezifische Tastaturen müssen dort noch geprüft werden.

## Nächste Arbeit

1. Weitere 781 eindeutige Karten beschaffen oder eigenständig erstellen und einzeln prüfen. Zuerst konkrete unbebilderte Gegenstände aus dem vorhandenen Lexikon, danach passende Szenen für Tätigkeiten und abstrakte Begriffe.
2. Die 47 gesperrten Zuordnungen ersetzen oder mit belastbarem Kontext korrigieren; alternative Motive niemals als weitere Wörter zählen.
3. Deutsche Wortformen/IPA und Mandarin unabhängig prüfen lassen; bisherige Sichtung transparent als redaktionellen Erststand behandeln.
4. Den jeweils aktuellen `main` erneut lesen, diese Datei und das Manifest verwenden und kleinere getestete Ausbaustände tatsächlich sichern. Keine ungesicherten lokalen Arbeitsschritte als veröffentlicht ausgeben.
