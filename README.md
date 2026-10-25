# Host Medal Bump

**Question:** Does hosting the Summer Olympics raise a country's share of the medals, and does the gain last after the Games?
**Reader:** The high-performance director of a national Olympic committee whose country is bidding to host a Summer Games.
**Rows counted:** Medals as the official medal table counts them: one per event, country and medal colour, so a team's medal counts once. They are built from the file's 9,619 medalist rows.
**Period:** The five Summer Games from Barcelona 1992 to Beijing 2008. Each one had a different host: Spain, the United States, Australia, Greece and China.

Author: Alec Pluchinsky

Tableau Public dashboard (same data file, same definitions): https://public.tableau.com/app/profile/thomas.pluchinsky7929/viz/HostMedalBump/Dashboard_1

## Files

| File | What it is |
|---|---|
| `index.html` | Report page: the answer, the four summary numbers, four findings with charts, and the data notes. When the Tableau numbers are entered in `app.js`, it also shows the agreement table. |
| `dashboard.html` | Dashboard page with Games, Country and Sport filters, the four summary numbers, three charts and a table. All of them change with the filters. |
| `app.js` | Shared code: it loads and parses the CSV, builds the medal key, and computes the summary numbers and shares. The `TABLEAU` block at the top holds the Tableau link and numbers. |
| `style.css` | Shared fonts, colours (light and dark) and layout. |
| `summer_medals_1992_2008.csv` | The data file. |
| `README.md` | This file. |
| `.gitattributes` | Git setting added by GitHub Desktop that normalizes line endings; not used by the pages. |

## Where the data came from

The source is the Guardian's list of Summer Olympic medallists, 1896–2008. Tableau Public publishes it as the sample data set "Summer Olympics Medalist Dataset", file `Summer_Olympic_medallists_1896-2008.xlsx`, sheet ALL MEDALISTS (https://public.tableau.com/app/learn/sample-data).

`summer_medals_1992_2008.csv` keeps only the 1992–2008 rows of that sheet (9,619 of 29,216) and drops the Athlete column. Its columns are:

| Column | Meaning |
|---|---|
| City | Host city |
| Edition | Year of the Games (the time column) |
| Sport | Sport, e.g. Aquatics |
| Discipline | Discipline within the sport, e.g. Swimming |
| NOC | Three-letter country code (the group column) |
| Gender | Athlete's gender (Men / Women) |
| Event | Event name |
| Event_gender | Event's gender: M, W or X (mixed) |
| Medal | Gold, Silver or Bronze |

## Definitions

- **Medal key** = Edition | Discipline | Event | Event_gender | NOC | Medal. Each distinct key is one medal.
- **Medals awarded** = the number of distinct medal keys.
- **Gold medals** = the number of distinct medal keys with Medal = Gold.
- **Countries winning a medal** = the number of distinct NOC codes.
- **Average medals per Games** = Medals awarded ÷ the number of distinct Editions.
- **Medal share** = a country's medals at a Games ÷ all medals at that Games (in the selected sports) × 100.

With all filters at their defaults, the four summary numbers are 4,463 / 1,432 / 116 / 892.6.

## Running it locally

The pages load the CSV with `fetch`, so opening the files by double-clicking them does not work. Serve the folder instead, for example with `python -m http.server`, then open http://localhost:8000. GitHub Pages serves the files the same way.
