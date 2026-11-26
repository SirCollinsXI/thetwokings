# Wilson – gesicherter Arbeitsstand, 26.11.2026

Ziel: **1500 tatsächlich nutzbare, einzeln geprüfte Bildkarten**. Dieser Stand enthält **709 aktive Karten**, davon **25 neue Küchen- und Haushaltswörter**. Bis zum Ziel fehlen **791 Karten**.

## Bestand

| Gruppe | Anzahl | Im Trainer |
| --- | ---: | --- |
| Ursprüngliche Projektillustrationen | 22 | Ja |
| Geprüfte Mulberry-Wortkarten | 596 | Ja |
| Gerettete eigene SVG-Zeichnungen | 66 | Ja |
| Eigene SVG-Zeichnungen · Küche und Haushalt | 25 | Ja |
| Gesperrte Zuordnungen | 49 | Nein |
| Alternative oder doppelte Motive | 10 | Nein |
| Ungeprüfte Kandidaten im gespeicherten Manifest | 0 | Nein |

Die 709 Karten umfassen **633 Nomen**, **25 Tätigkeiten/Infinitive**, **34 Zahl-/Bruchaufgaben**, **12 Eigenschafts-/Lage-/Ordnungsaufgaben** und **5 Wendungen**. Zahlenaufgaben sind ausdrücklich Zahlenaufgaben, keine zusätzlichen Gegenstandsillustrationen. Unbebilderte Wörter im Hauptbestand zählen nicht als fertige Karten. Alternative Motive innerhalb einer bereits vorhandenen Wortzuordnung zählen ebenfalls nicht zusätzlich.

## Küche und Haushalt, Paket 1

25 vorhandene Wort-IDs aus dem PONS-basierten Lexikon wurden aktiviert. Die eigenen SVGs unter `wilson/original-household/` wurden einzeln auf einem gerenderten Kontaktbogen geprüft. Artikel, Wortformen, IPA, Englisch, Mandarin und Pinyin wurden redaktionell abgeglichen. Die Galerie bietet den Filter **Neu · Küche & Haushalt**. Die Pfade zu den Zeichnungen stehen im Manifest.

- `v471` Handrührgerät und `v974` Schuhlöffel ersetzen gesperrte Motive. Die früheren Entscheidungen bleiben in `reviewHistory` auffindbar.
- Mehrsprachige Hinweise präzisieren unter anderem die Motive für Einbauküche, Kissenbezug, Laken, Tischläufer und Wäschetrockner.
- Die deutsche Lautschrift und Mandarin wurden redaktionell geprüft. Eine unabhängige Sprachprüfung steht aus.

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

Keine PONS-Bilder, Buchseiten oder Aufnahmen übernommen. Audio stammt aus Gerätesprachsynthese. Kein kostenpflichtiger Dienst eingesetzt. Kimi wurde für dieses Paket nicht befragt. Der lokale Schlüssel und `MOONSHOT_API_KEY` waren nicht verfügbar. DNS und Hosting unverändert.

## Wiederholbare Prüfungen

```sh
node scripts/check-site.mjs
node scripts/test-wilson-input.cjs
node scripts/test-wilson-vocabulary.cjs
node scripts/test-wilson-cta.cjs
node scripts/build-wilson-offline.cjs
python scripts/render-wilson-review.py /tmp/wilson-review
```

Inhaltstests prüfen alle 709 Karten und 222 historische Bild-Hashes, eindeutige IDs/Lemmata/Bild-Hashes, vollständige DE/EN/ZH/IPA, Quellen, Sperrungen, Aufgaben, Antwortvarianten, Retry, Audio-Ansteuerung/Fallback, Speichern/Neustart, Export/Import-Validierung, IME und Wiederholungen. Der Offline-Download wird aus denselben Daten mit allen aktiven SVGs eingebettet erzeugt; Quellen-/Navigationslinks sowie einige Gerätestimmen benötigen Internet.

`scripts/wilson-browser-preview.html` stellt echte Seiten in 390 und 1280 CSS-Pixeln für die Browserprüfung dar. Das ersetzt keine Tests auf echten iPhone-/Android-Geräten; hörbare Ausgabe und gerätespezifische Tastaturen müssen dort noch geprüft werden.

## Nächste Arbeit

1. Weitere 791 eindeutige Karten beschaffen oder eigenständig erstellen und einzeln prüfen. Zuerst konkrete unbebilderte Gegenstände aus dem vorhandenen Lexikon, danach passende Szenen für Tätigkeiten und abstrakte Begriffe.
2. Die 49 gesperrten Zuordnungen ersetzen oder mit belastbarem Kontext korrigieren; alternative Motive niemals als weitere Wörter zählen.
3. Deutsche Wortformen/IPA und Mandarin unabhängig prüfen lassen; bisherige Sichtung transparent als redaktionellen Erststand behandeln.
4. Den jeweils aktuellen `main` erneut lesen, diese Datei und das Manifest verwenden und kleinere getestete Ausbaustände tatsächlich sichern. Keine ungesicherten lokalen Arbeitsschritte als veröffentlicht ausgeben.
