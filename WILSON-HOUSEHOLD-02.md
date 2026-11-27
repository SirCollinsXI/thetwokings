# Wilson – Prüfung Paket 1 und Entwurf Paket 2

Stand 27.11.2026. Geprüfte Basis: `2dbbad0ee2aa97200620b770b58b28451422782e` auf `main`.

## Produktion

GitHub-Status und Projektion aus dem Lexikon, Bildmanifest und gemeinsamen Wortmodul ergeben 709 aktive Karten. Zuletzt bestätigte Live-Zahl laut Übergabe: 684. Die sichtbare Browserverbindung konnte nicht aufgebaut werden. Produktion, Deployment-Commit und manueller Eingabetest sind offen. Prüffall nach Wiederherstellung: Handrührgerät in der Galerie öffnen, Bild kontrollieren, „das Handrührgerät, Handrührgeräte“ eingeben, mit Enter prüfen, Mandarin ablesen und mit Enter zur nächsten Karte gehen.

## Redaktionelle Prüfung und Tests

Die 25 Einträge mit der Manifest-Kennung `kueche-haushalt-01` wurden anhand von Lemma mit Artikel, Plural, deutscher IPA, Mandarin und Pinyin gesichtet. Die Formen sind durchgängig vorhanden. Bei Handrührgerät präzisiert „手持电动打蛋器“ das elektrische Motiv gegenüber „手持打蛋器“. Bei Babyfon kann die konkrete Bauform ein engeres Mandarin-Wort als „婴儿监护器“ rechtfertigen. Bei Schlafcouch führt Duden das Femininum und IPA ohne markierten Nebenakzent. Der Basisartikel Couch führt Couchs/Couches und auch Couchen. Welche Varianten der Trainer für das Kompositum akzeptieren soll, bleibt gesondert zu prüfen.

- https://www.duden.de/rechtschreibung/Schlafcouch
- https://www.duden.de/deklination/substantive/Couch

CTA-Regressionsprüfung bestanden. Die lokale Eingaberegression mit simuliertem DOM bestand mit allen 709 Karten für Antwort- und Wechselablauf, Wiederholungen und Fortschritt. Bei dieser Ausführung waren die Dateiexistenz-Assertions für die vollständige Bildsammlung ausgenommen. Die 25 neuen SVGs wurden bereits einzeln aus dem Commit abgerufen. Live-Enter und hörbare Geräteausgabe bleiben offen. Windows-Protokoll: Kimi-Authentifizierung und Modellliste bestätigt. Kein kostenpflichtiger Aufruf.

## Paket 2 – Gegenstände für Haushalt und Strom

Drei vorhandene IDs wurden gegen den aktiven Kartenbestand geprüft. Alle sind auf der Basis inaktiv. Wortgrundlage ist das vorhandene PONS-basierte Projektlexikon. Die folgenden Formulierungen und Bildbeschreibungen sind Arbeitsstände für eigene Zeichnungen.

| ID | Deutsch | IPA (Entwurf) | Englisch | Mandarin | Motiv und Abgrenzung |
| --- | --- | --- | --- | --- | --- |
| v810 | der Papierkorb, die Papierkörbe | /paˈpiːɐ̯ˌkɔʁp/ | wastepaper basket | 废纸篓 (fèizhǐlǒu) | Offener Drahtkorb neben dem Schreibtisch, sichtbar mit Papierknäueln. Kein Symbol für den digitalen Papierkorb. Die gesperrte Zuordnung bei Ersatz in reviewHistory übernehmen. |
| v1101 | das Stromkabel, die Stromkabel | /ˈʃtʁoːmˌkaːbl̩/ | power cable | 电源线 (diànyuánxiàn) | Netzanschlussleitung mit Netzstecker und Gerätestecker. Ohne Mehrfachsteckdose, USB-Stecker oder Verlängerungskupplung. |
| v1079 | das Starthilfekabel, die Starthilfekabel | /ˈʃtaʁtˌhɪlfəˌkaːbl̩/ | jumper cables | 搭电线 (dādiànxiàn) | Rotes und schwarzes Kabel mit klar erkennbaren Polzangen. Autobatterie nur als Kontext und keine Anschlussfolge zeigen. |

Vor Aktivierung Bilddateien zeichnen, bei Trainergröße prüfen, Übersetzung und IPA abgleichen sowie Quelle im Manifest eintragen. Danach die vollständige Bild- und Eingaberegression ausführen. Dieser Entwurf erhöht die Kartenzahl um null.
