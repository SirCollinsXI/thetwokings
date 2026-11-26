# Wilson – gesicherter Arbeitsstand, 26.11.2026

Ziel: **1500 tatsächlich nutzbare, einzeln geprüfte Bildkarten**. Dieser Stand enthält **684 aktive Karten**, zuvor waren **222** auf `main` und live bestätigt. **462 zusätzliche Karten**, **816 fehlen weiterhin**. Die 1500 sind nicht fertig.

## Bestand

| Gruppe | Anzahl | Im Trainer |
| --- | ---: | --- |
| Ursprüngliche Projektillustrationen | 22 | Ja |
| Geprüfte Mulberry-Wortkarten | 596 | Ja |
| Gerettete eigene SVG-Zeichnungen | 66 | Ja |
| Gesperrte Zuordnungen | 51 | Nein |
| Alternative oder doppelte Motive | 10 | Nein |
| Ungeprüfte Kandidaten im gespeicherten Manifest | 0 | Nein |

Die 684 Karten umfassen **608 Nomen**, **25 Tätigkeiten/Infinitive**, **34 Zahl-/Bruchaufgaben**, **12 Eigenschafts-/Lage-/Ordnungsaufgaben** und **5 Wendungen**. Zahlenaufgaben sind ausdrücklich Zahlenaufgaben, keine zusätzlichen Gegenstandsillustrationen. Unbebilderte Wörter im Hauptbestand zählen nicht als fertige Karten. Alternative Motive innerhalb einer bereits vorhandenen Wortzuordnung zählen ebenfalls nicht zusätzlich.

## Was gerettet und zusammengeführt wurde

GitHub-Basis: `1634346e04916ad68d2dcd92400fe420dcad8f9d`. Die ältere Übergabe mit 22 Karten war überholt. Drei noch vorhandene, unveröffentlichte Arbeitsstände wurden in einem frischen Checkout dieser Basis zusammengeführt. Das ist kein Beleg, dass ihre lokale Arbeit schon veröffentlicht war.

`wilson-image-candidates.js` ist nun das gemeinsame Prüf- und Bildmanifest; `wilson-vocabulary.js` projiziert es für Eingabetrainer, Einfach, Pro und Kinderwelt. Die 1514 Originaleinträge in `wilson-lexicon.js` und ihre IDs bleiben unverändert. Die Haupt-App enthält zusätzlich eigenständig ergänzte Natur-/Lebensmittelwörter; nicht alle unbebilderten Einträge sind sprachlich geprüft.

Alle 222 bisher aktiven Eingabe-IDs, ihre deutschen Lemmata, Bildpfade und Bild-Hashes bleiben erhalten. Eingabe-, Pro- und Kinderfortschritt werden nicht zusammengelegt; Speicherformat und bestehende Schlüssel bleiben erhalten. Kein automatischer Geräteabgleich. Export/Import bleiben verfügbar.

## Redaktionelle Prüfung

Alle 443 zunächst zusammengeführten neuen aktiven Motive sowie 28 weitere Motive wurden mit Inkscape gerendert und einzeln auf beschrifteten Kontaktbögen angesehen. DE/EN/ZH und Wortformen wurden daneben redaktionell abgeglichen. Die endgültige Auswahl berücksichtigt Doppelungen und Sperrungen. Das ist eine KI-gestützte erste Sichtung, keine unabhängige muttersprachliche, phonetische oder pädagogische Validierung.

Beispiele für Korrekturen: Reitsattel → 马鞍; Pak-Choi-Motiv nicht als Chinakohl ausgeben; Frühstücksflocken und Chips jeweils einem vorhandenen Lexikoneintrag zuordnen; Tabletten gezielt vor dem Fläschchen abfragen; links stehenden Becher bei „klein“ nennen; Bildaufgaben für Rechenzeichen als Infinitive stellen. Eine unklare Zuckerschale, wenig charakteristische Paranuss-/Frettchenmotive sowie zwei Werkzeugzeichnungen sind gesperrt. Doppelte Kohl-, Nugget-, Melonen-, Shorts- oder Lebensmittelmotive erhöhen die aktive Anzahl nicht.

Nomen verlangen passende Singular-/Pluralformen; Tätigkeiten, Zahlen und Wendungen eigene Aufgaben. Geprüfte Synonyme werden angenommen. Galerie-Links öffnen eine gezielte Karte, anschließend läuft die fällige Wiederholung weiter. Vorgezogenes richtiges Wiederholen erhöht weder Serie noch geplanten Abstand. Chinesisches Komma, Groß-/Kleinschreibungshinweis und IME-Schutz bleiben vorhanden. Mehrere Tabs lesen vor einer Wertung den aktuellen Lernstand und serialisieren mit Web Locks, soweit der Browser diese anbietet.

## Bildnachweise

Mulberry Symbols, Steve Lee, CC BY-SA 4.0; Quellrevision `fa94a93ca1b5357c0b6e0d9f8a81c426a1dfefdf`. Alle **596 aktiven Mulberry-Dateien** wurden bytegenau anhand der Git-Blob-Hashes dieser Revision geprüft. Individuelle feste Quellenlinks, SHA-256 und Upstream-Blob-Hashes stehen im Manifest; Original-Lizenzhinweis unverändert unter `wilson/mulberry/LICENSE.txt`. Trainer und Galerie unterscheiden Mulberry von eigenen, KI-gestützt erstellten SVG-Zeichnungen. Keine pauschale rechtliche Freigabe behauptet.

Keine PONS-Bilder, Buchseiten oder Aufnahmen übernommen. Audio stammt aus Gerätesprachsynthese. Kein kostenpflichtiger Dienst eingesetzt. Kimi wurde nicht befragt: Linux statt derselben Windows-Umgebung, kein `MOONSHOT_API_KEY`; Moonshot ist erreichbar, aber ohne Schlüssel nicht authentifiziert. DNS und Hosting unverändert.

## Wiederholbare Prüfungen

```sh
node scripts/check-site.mjs
node scripts/test-wilson-input.cjs
node scripts/test-wilson-vocabulary.cjs
node scripts/test-wilson-cta.cjs
node scripts/build-wilson-offline.cjs
python scripts/render-wilson-review.py /tmp/wilson-review
```

Inhaltstests prüfen alle 684 Karten und 222 historische Bild-Hashes, eindeutige IDs/Lemmata/Bild-Hashes, vollständige DE/EN/ZH/IPA, Quellen, Sperrungen, Aufgaben, Antwortvarianten, Retry, Audio-Ansteuerung/Fallback, Speichern/Neustart, Export/Import-Validierung, IME und Wiederholungen. Der Offline-Download wird aus denselben Daten mit allen aktiven SVGs eingebettet erzeugt; Quellen-/Navigationslinks sowie einige Gerätestimmen benötigen Internet.

`scripts/wilson-browser-preview.html` stellt echte Seiten in 390 und 1280 CSS-Pixeln für die Browserprüfung dar. Das ersetzt keine Tests auf echten iPhone-/Android-Geräten; hörbare Ausgabe und gerätespezifische Tastaturen müssen dort noch geprüft werden.

## Nächste Arbeit

1. Weitere 816 eindeutige Karten beschaffen oder eigenständig erstellen und einzeln prüfen. Zuerst konkrete unbebilderte Gegenstände aus dem vorhandenen Lexikon, danach passende Szenen für Tätigkeiten und abstrakte Begriffe.
2. Die 51 gesperrten Zuordnungen ersetzen oder mit belastbarem Kontext korrigieren; alternative Motive niemals als weitere Wörter zählen.
3. Deutsche Wortformen/IPA und Mandarin unabhängig prüfen lassen; bisherige Sichtung transparent als redaktionellen Erststand behandeln.
4. Den jeweils aktuellen `main` erneut lesen, diese Datei und das Manifest verwenden und kleinere getestete Ausbaustände tatsächlich sichern. Keine ungesicherten lokalen Arbeitsschritte als veröffentlicht ausgeben.
