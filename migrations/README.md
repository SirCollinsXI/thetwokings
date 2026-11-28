# Tageszählung der Grußwand aktivieren

Die Pages Functions `/api/spuren` und `/api/gastgruesse` nutzen das D1-Binding `PUBLIC_TRACES_DB`. Die Tageszählung speichert ausschließlich gemeinsame Summen. Die direkte Einreichung von Gastgrüßen verwendet in derselben Datenbank eine eigene Tabelle und eine Moderationswarteschlange. [Gastgrüße prüfen und freigeben](../docs/grusswand-moderation.md).

1. Öffne im [Cloudflare-Konto die D1-Datenbanken](https://dash.cloudflare.com/208ba82aaa519349e8de5d010e62629a/workers/d1). Wähle die bereits für diese Wand eingerichtete Datenbank oder lege eine neue D1-Datenbank an. Ein möglicher Name ist `thetwokings-grusswand`.
2. Öffne das [Pages-Projekt thetwokings](https://dash.cloudflare.com/208ba82aaa519349e8de5d010e62629a/pages/view/thetwokings). Wähle in **Settings → Bindings** die Umgebung **Production** und füge ein D1-Datenbank-Binding hinzu. Verwende als Variablennamen exakt `PUBLIC_TRACES_DB` und wähle die Datenbank aus Schritt 1.
3. Speichere das Binding und deploye den aktuellen Produktionsstand erneut. Der erste gültige Abruf der Wand legt die Tabelle und die Startzeile bei Bedarf an. Eine vorhandene Tageszählung läuft weiter. Das manuell ausführbare Schema steht in [0002_public_trace_day.sql](0002_public_trace_day.sql).
4. Öffne die [Leseansicht der API](https://thetwokings.de/api/spuren). Eine erfolgreiche Antwort liefert HTTP 200, das Berliner Tagesdatum und die gemessenen Summen für `wave`, `star` und `crown`. Dann lädt [die Grußwand](https://thetwokings.de/?lang=de#grusswand) dieselben Zahlen. Der Aufruf der Leseansicht fügt kein Zeichen hinzu. Die [API für Gastgrüße](https://thetwokings.de/api/gastgruesse) liefert HTTP 200 und eine Liste geprüfter Karten. Bei einer neuen Datenbank ist diese Liste leer.

Bei HTTP 503 dieselbe Produktionsumgebung, das Binding, das Deployment und die Erreichbarkeit der Datenbank prüfen. Schema- und Berechtigungsfehler können dieselbe öffentliche Antwort auslösen. Für Browser- und Veröffentlichungstests mit Testzeichen ist eine getrennte Preview-Datenbank vorgesehen.

[Cloudflare-Dokumentation zu D1-Bindings und erneutem Deployment](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases)
