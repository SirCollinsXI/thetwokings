# thetwokings
# 🏹 Wüsten-Bogen: Wind Physics Edition

Ein physikbasiertes 2D-Bogenschieß-Spiel im Browser. Dieses Projekt legt den Fokus auf eine hochpräzise, deterministische Physik-Engine, die komplexe Aerodynamik und Windströmungen in Echtzeit simuliert.

## ✨ Features

* **Präzise Aerodynamik (RK4):** Die Flugbahn der Pfeile wird über ein Runge-Kutta-Verfahren 4. Ordnung (RK4) berechnet. Dies ermöglicht eine realistische Simulation von Luftwiderstand, Seitenwind und dem Drehmoment des Pfeils.
* **Deterministischer Game-Loop:** Ein fester Zeitschritt (`Fixed Timestep` von 1/240s) entkoppelt die Physik-Berechnungen von der Framerate. Die Physik verhält sich auf einem 60Hz-Smartphone exakt gleich wie auf einem 144Hz-Gaming-Monitor.
* **100% akkurate Trajektorien-Vorschau:** Die Ziel-Vorschau beim Spannen des Bogens nutzt *exakt denselben* RK4-Integrator wie der fliegende Pfeil. Keine Schätzungen, keine Abweichungen.
* **Geräteunabhängige Skalierung:** Durch eine feste virtuelle Auflösung (1600x900) und Matrix-Transformationen (`ctx.setTransform`) bleiben Distanzen, Hitboxen und das Spielgefühl auf allen Bildschirmgrößen (Desktop, Tablet, Mobile) identisch.
* **Dynamisches Windmodell:** Prozedural generierte Luftströmungen mit überlagerten Böen und vertikalen Winden, inspiriert von Klassikern wie *Worms*.
* **Lokale Rangliste & Avatar-Editor:** Nach 10 erfolgreichen Leveln können Spieler über ein eingebautes HTML5-Zeichen-Canvas ihren eigenen Avatar malen. Die Top 5 Läufe werden lokal (`localStorage`) gespeichert.

## 🎮 Spielprinzip

Ziel ist es, in 10 immer schwieriger werdenden Leveln jeweils 3 Treffer auf der Zielscheibe zu landen.

* **Steuerung:** In die linke Bildschirmhälfte klicken (oder tippen), in die entgegengesetzte Schussrichtung ziehen, um den Bogen zu spannen, und loslassen.
* **Wind:** Vor jeder Runde ändert sich die Windstärke (Stufe -10 bis +10). Man muss den Vorhaltewinkel entsprechend anpassen.
* **Munition & Strafen:** Ab Level 5 gibt es nur noch 10 Pfeile pro Runde. Pfeile, die das Spielfeld ungetroffen verlassen, addieren +3 Sekunden Strafzeit auf den Timer.

## 🛠️ Tech Stack

* **Vanilla JavaScript (ES6+):** Komplette Logik, Physik-Engine und Game-Loop von Grund auf selbst geschrieben. **Keine** externen Bibliotheken oder Game-Engines.
* **HTML5 Canvas:** Für das performante Rendering des Spielfelds, der Pfeile und der Partikeleffekte (Tumbleweeds, Feuerwerk).
* **CSS3:** Responsive UI, saubere Overlays und native CSS-Variablen für das HUD.

## 🚀 Installation & Start

Da das Spiel vollständig clientseitig im Browser läuft, ist kein Build-Prozess (wie Webpack oder npm) oder ein lokaler Webserver erforderlich.

1. Repository klonen:
   ```bash
   git clone [https://github.com/dein-username/wuesten-bogen.git](https://github.com/dein-username/wuesten-bogen.git)
