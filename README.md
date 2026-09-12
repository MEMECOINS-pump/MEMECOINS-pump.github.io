# MEMECOINS

Standalone homepage for [MEMECOINS-pump](https://github.com/MEMECOINS-pump).  
Nothing in this repo is connected to other projects.

The desk has two permanent books:

- **The week** — one coin, Monday through Sunday
- **WEEKVAULT** — the name that stays in continuous trade

Further names go on **the board** when they earn a listing.

## Coins later nachtragen

Nur diese Datei ändern:

`data/desk.json`

### Weekvault oder Week-Coin live schalten

```json
"status": "live",
"ticker": "TICKER",
"mint": "CONTRACT_ADDRESS",
"pumpUrl": "https://pump.fun/coin/CONTRACT_ADDRESS",
"xUrl": "https://x.com/..."
```

`status` bleibt `awaiting-mint`, solange der Coin noch nicht steht.

### Weiteren Coin auf das Board

Neuen Eintrag in `board` anhängen:

```json
{
  "ticker": "NAME",
  "cadence": "Listed",
  "status": "live",
  "blurb": "Kurztext",
  "mint": "",
  "pumpUrl": "",
  "xUrl": ""
}
```

## Local

Im Ordner einen statischen Server starten, z.B.:

```bash
python -m http.server 4173
```

Dann `http://127.0.0.1:4173` öffnen.
