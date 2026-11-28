# Öffentliche Gastgrüße moderieren

Die Grußwand zeigt die 100 zuletzt freigegebenen direkten Einsendungen. Das Datum richtet sich nach der Freigabe in der Zeitzone Europe/Berlin. Besucher wählen freiwillig Nickname, Land und Selbstbezeichnung. Das Absenden setzt die ausdrückliche Einwilligung zur Veröffentlichung der gewählten Daten voraus.

## Verbindung prüfen

Die Pages-Function für `/api/gastgruesse` verwendet die Production-Bindung `PUBLIC_TRACES_DB` im Cloudflare-Pages-Projekt `thetwokings`. Der Tageszähler verwendet dieselbe Datenbank und eine eigene Tabelle. Nach Anlegen der D1-Datenbank und Verknüpfen der Bindung erneut deployen. Der erste Zugriff auf die Grußkarten legt die nötige Tabelle an. Ein GET mit HTTP 200 und `{"cards":[]}` zeigt eine erreichbare Wand ohne freigegebene direkte Einsendungen. HTTP 503 zeigt an, dass der Dienst die Datenbank noch nicht verwenden kann.

## Im D1-Dashboard prüfen

Öffne die mit `PUBLIC_TRACES_DB` verknüpfte Datenbank im geschützten Bereich des Cloudflare-Dashboards. Diese Abfrage zeigt die noch gültigen Einsendungen:

```sql
SELECT request_key, datetime(submitted_at, 'unixepoch') AS eingang_utc,
       mark, nick, region, kind
FROM guest_greetings
WHERE published_at IS NULL AND submitted_at > unixepoch() - 2592000
ORDER BY submitted_at ASC;
```

Prüfe Nickname, Symbol und die freiwilligen Angaben. Lehne Einträge mit Kontaktdaten, persönlichen Angaben anderer Menschen, Beleidigungen oder irreführender Identitätsbehauptung ab. Land und Selbstbezeichnung sind Angaben des Gastes. Eine leere Angabe ist zulässig.

Für eine Freigabe kopiere die Vorgangsnummer aus genau der geprüften Zeile anstelle von `VORGANGSNUMMER`:

```sql
UPDATE guest_greetings
SET published_at = unixepoch()
WHERE request_key = 'VORGANGSNUMMER' AND published_at IS NULL
  AND submitted_at > unixepoch() - 2592000;
```

Prüfe, dass genau eine Zeile geändert wurde. Die Website ermittelt den öffentlichen Kalendertag aus diesem Freigabezeitpunkt. Ein neuer Aufruf der Grußwand zeigt die Karte.

## Melden, ablehnen oder entfernen

Meldungen und Widerrufe laufen über **kontakt@thetwokings.de**. Gleiche die genannte Karte anhand von Nickname, Symbol und Veröffentlichungsdatum mit dem Eintrag im Dashboard ab. Die öffentliche API gibt keine Vorgangsnummern aus. Diese Abfrage zeigt veröffentlichte Einträge mit dem genauen Zeitpunkt in UTC:

```sql
SELECT request_key, datetime(published_at, 'unixepoch') AS freigabe_utc,
       mark, nick, region, kind
FROM guest_greetings
WHERE published_at IS NOT NULL ORDER BY published_at DESC;
```

Entferne einen eindeutig bestimmten Gruß mit der Vorgangsnummer. Dieselbe Abfrage dient zum Ablehnen eines wartenden Grußes.

```sql
DELETE FROM guest_greetings WHERE request_key = 'VORGANGSNUMMER';
```

Bei Karten aus der separaten E-Mail-Freigabeliste entferne den entsprechenden Eintrag aus `guest-freigaben.js` und veröffentliche die Änderung. Personenbezogene Postfachinhalte bleiben außerhalb dieser Datei. Wartende direkte Einsendungen verfallen nach 30 Tagen. Beim nächsten Datenbankzugriff werden abgelaufene, weiterhin ungeprüfte Zeilen entfernt. Der Dienst nimmt insgesamt höchstens 10 neue Einsendungen pro rollender Minute und 100 pro 24 Stunden an. Er hält höchstens 150 wartende Einträge. Die Vorgangsnummer gilt für genau einen Entwurf und dient der Zuordnung von Übertragungswiederholungen.
