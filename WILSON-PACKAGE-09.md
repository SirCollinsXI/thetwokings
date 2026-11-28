# Wilsons Corner · Paket 09

Arbeitsstand: 28.11.2026

- Ausgangsstand: 879 aktive Bildkarten.
- Zwischenziel: 924 aktive Bildkarten.
- Reproduzierbares Audit: 434 Nomen aus dem vorhandenen Wortbestand besitzen noch keine aktive Bildkarte (vor Gruppe 1: 439).
- Paketstatus: [Draft-PR #34](https://github.com/SirCollinsXI/thetwokings/pull/34); Gruppe 1 im Entwurf integriert, 884 aktive Karten. Nicht auf der Hauptdomain veröffentlicht.
- Basis: `main` einschließlich `0018ec6` (Trainerstart abwarten und Lernfarben) übernommen.

## Gruppe 1 · Auto & Fahrrad

Sprachstatus: redaktionell geprüft. Bildstatus: fünf eigene SVGs mit Inkscape gerendert und jedes bei 212 × 150 sowie 120 × 85 Pixeln gesichtet. Beim Reifen wurden überstehende Profillinien entfernt und die offene Mitte deutlicher dargestellt; diese Fassung wurde erneut gesichtet. Aktivierung im Entwurf nach dieser Einzelprüfung. KI-gestützte Erstprüfung, keine unabhängige Muttersprachlerprüfung.

[Kontaktbogen der fünf Motive](docs/wilson/paket09-gruppe01.png). Galerie-Filter: **Neu · Paket 09 → Auto & Fahrrad**. Bildpfade: `wilson/original-paket-09/`.

| Wort-ID | Artikel | Singular | Plural | N-Deklination | Englisch | 简体中文 | Konkrete Bildidee und Abgrenzung |
|---|---|---|---|---|---|---|---|
| `v319` | das | Fahrradschloss | die Fahrradschlösser | nein | bicycle lock | 自行车锁 | Seitenansicht eines Fahrrads: ein deutlich sichtbares Bügelschloss verbindet Rahmen und Hinterrad mit einem Fahrradständer. Kein einzelnes Vorhängeschloss, damit die Bedeutung eindeutig bleibt. |
| `v467` | die | Handbremse | die Handbremsen | nein | handbrake | 手刹 | Nahansicht der Mittelkonsole eines Autos mit angezogenem mechanischem Handbremshebel und kleinem Bremssymbol. Kein elektronischer Schalter und kein Fahrradbremshebel. |
| `v516` | die | Hupe | die Hupen | nein | horn | 喇叭 | Lenkradmitte mit Hupensymbol; eine Hand drückt darauf, kurze Schalllinien zeigen das Hupen. Dadurch Fahrzeughupe statt Lautsprecher oder Musikinstrument. |
| `v876` | der | Reifen | die Reifen | nein | tyre | 轮胎 | Einzelner schwarzer Autoreifen ohne Felge, schräg dargestellt, Profil deutlich sichtbar. Ohne Felge, Radkappe oder Fahrzeug, damit er nicht mit „Rad“ verwechselt wird. |
| `v913` | der | Rückspiegel | die Rückspiegel | nein | rear-view mirror | 后视镜 | Der mittlere Spiegel oben an der Windschutzscheibe zeigt ein nachfolgendes Fahrzeug. Das Motiv zeigt einen Innenspiegel als Beispiel für den Oberbegriff Rückspiegel und unterscheidet sich so von der bereits vorhandenen Seitenspiegel-Karte. |

### Sprachliche Entscheidungen

- Alle fünf Wörter sind reguläre Nomen und unterliegen nicht der N-Deklination.
- `Fahrradschloss` bildet den Plural mit Umlaut: `Fahrradschlösser`.
- `Reifen` und `Rückspiegel` haben im Plural dieselbe Wortform wie im Singular; nur der Artikel wechselt.
- `Hupe` wird durch das Bild ausdrücklich als Fahrzeughupe festgelegt, weil das chinesische `喇叭` auch allgemein „Horn/Lautsprecher“ bedeuten kann.
- Beim `Reifen` bleibt die Felge bewusst unsichtbar; ein komplettes Bauteil aus Reifen und Felge wäre eher `das Rad`.
- `Rückspiegel` umfasst Innen- und Außenspiegel. Die Karte legt das konkrete Innenmotiv fest, ohne den Oberbegriff auf Innenspiegel zu beschränken. [Duden](https://www.duden.de/rechtschreibung/Rueckspiegel).
- `Handbremse` zeigt hier die mechanische Feststellbremse im Auto. Der allgemeine Begriff bedeutet eine mit der Hand betätigte Bremse. [Duden](https://www.duden.de/rechtschreibung/Handbremse).
- Bildpassende Antwortvarianten: `Bügelschloss/Bügelschlösser`, `Feststellbremse/Feststellbremsen`, `Autohupe/Autohupen`, `Autoreifen/Autoreifen`, `Innenspiegel/Innenspiegel` und `Innenrückspiegel/Innenrückspiegel`, jeweils mit dem passenden Artikel. Die fünf vorhandenen Lexikonwörter bleiben die angezeigten Hauptlösungen.
- Der bisherige gesperrte Kandidat `v319` mit dem losen Vorhängeschloss wurde ersetzt. Pfad, Sperrgrund und Prüfdatum bleiben in `reviewHistory` erhalten; das alte Motiv wird nicht aktiviert.

## Prüfstand und Übergabe

- Lokal bestanden: Website, Eingabe und Lernfortschritt, gezielte Verwechslungen und sechs Antwortvarianten, gemeinsamer Wortschatz, 222 historische Bild-Hashes sowie mehrsprachige CTA-Prüfung.
- Alle 879 zuvor aktiven Karten-Datensätze wurden vollständig mit dem Ausgangsstand verglichen und sind unverändert.
- Offline-Datei neu aus den gemeinsamen Daten gebaut: 884 eingebettete Bilder, einschließlich aktueller Lernfarben aus `main`.
- Die gezielte Browserprüfung ist in den bestehenden GitHub-Workflow eingebunden: fünf Galerie-Links, 30 Eingaben in DE/EN/ZH bei 390 und 1.280 Pixeln mit nativen Web Locks sowie Dekodierung und Bytevergleich aller fünf neuen Offline-Bilder. Ergebnisse und Screenshots stehen beim CI-Lauf in PR #34. Die lokale Chromium-Installation dieser Sitzung enthält keine ausführbare Browserdatei.
- Hauptdomain in dieser Sitzung nicht neu bestätigt: Abruf nicht verfügbar (HTTP 403). Letzter belegter Live-Stand ist 879 aus [PR #21](https://github.com/SirCollinsXI/thetwokings/pull/21). Der Paket-09-Entwurf wurde nicht in `main` übernommen.
- Offen für Paket 09: Gruppen 2–9 (40 Karten) nach derselben Fünferlogik auswählen, bebildern und prüfen. Danach Gesamtprüfung, Freigabe und Abgleich auf der Hauptdomain.

## Zwischenstand

- Gruppe 1 abgeschlossen und im Entwurf integriert: 5 von höchstens 45 Karten.
- Neue aktive Karten im Entwurf: 5. Neu auf der Hauptdomain veröffentlicht: 0.
- Entwurfsstand: 884; noch 40 bis 924 und 616 bis 1.500.
- Nächster Einstieg: `codex/wilson-paket-09`, PR #34, anschließend Gruppe 2 aus dem neu ermittelten Fehlbestand auswählen.
