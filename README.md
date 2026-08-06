# The Two Kings – Multi-Page Game Hub v1.3

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
