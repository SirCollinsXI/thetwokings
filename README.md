# The Two Kings – Multi-Page Game Hub v1.3.3

## Seiten
- `/` Game Hub
- `/bogen.html` Wüsten-Bogen
- `/trex.html` T. rex Piratenjagd
- `/impressum.html` Impressum
- `/datenschutz.html` Datenschutzerklärung
- `/nutzungsregeln.html` Regeln für öffentliche Einträge

## Datenschutzarchitektur
- kein Werbe- oder Marketing-Tracking im Anwendungscode
- kein allgemeiner Cookie-Banner
- Sessionfortschritt nur im `sessionStorage`
- öffentliche Bestenliste nur nach aktiver Bestätigung
- Nutzung beider Spiele ohne Score-Upload möglich
- lokaler, minimaler Supabase-HTTP-Client statt jsDelivr
- Lösch- und Datenschutzanfragen: `kontakt@thetwokings.de`

## Deployment
1. `kontakt@thetwokings.de` einrichten und testen.
2. Gesamten Inhalt in das Root-Verzeichnis des GitHub-Repositories kopieren.
3. Falls noch nicht erfolgt: `schema.sql`, danach einmalig `migrate-legacy-scores.sql` in Supabase ausführen.
4. Edge Function deployen: `supabase functions deploy submit-score`.
5. Cloudflare-Preview testen und danach nach `main` mergen.

## Vor jedem Release
- Cloudflare Analytics, Zaraz und sonstige Integrationen prüfen.
- Supabase DPA, Projektregion und Aufbewahrung prüfen.
- Browser-Netzwerk prüfen: erwartet werden nur eigene Domain und Supabase.
- Impressum, Datenschutz, Einwilligungscheckbox und Löschkontakt testen.

## v1.3.1 Mobile Fix
- T.-rex-Startdialog im Querformat scrollbar.
- Kompakte Darstellung bei geringer Displayhöhe.
- Startbuttons bleiben beim Scrollen erreichbar.
- Safari-Dynamic-Viewport und Safe Areas berücksichtigt.

## v1.3.2 Datenschutz und Optik
- Rechtliche Seiten mit breiterem, mobil optimiertem Layout.
- T.-rex-Einstellungen und lokaler Score-Fallback vollständig auf `sessionStorage` umgestellt.
- Kein `localStorage` mehr im Anwendungscode.
- Cloudflare-, Supabase-, Speicher- und Löschhinweise präzisiert.
- Nutzungsregeln um Avatar-Nutzungsrechte ergänzt.

## v1.3.3 Mobile Gameplay Fixes
- T.-rex-Drehhinweis erscheint nur während aktivem Spiel im Hochformat.
- Abschlussdialog und Bestenliste dürfen wieder im Hochformat bedient werden.
- T.-rex-Statusanzeige aus der Netzklickzone verschoben und für Touch-Eingaben durchlässig gemacht.
- Bogen-Vorschau simuliert steile Flugbahnen auch oberhalb des sichtbaren Canvas bis zur Rückkehr beziehungsweise Landung.
