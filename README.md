# Tech

Web: React + TypeScript (Vite)

Server: Express + TypeScript

Libaries: compromise,

Used APIs: Good Tape, icanhazdadjoke

App flow:

- Record audio

- transcribe -> Good Tape -> {text}

- Extract 2–6 terms (with compromise library)

- get joke, GET https://icanhazdadjoke.com/search

- UI: show results

# Sidequests

- Styling

- Dynamic length filter

- DB history (Postgres)

- maybe sth. fun

# Run app

# Assumptions

# Limitations/ TODO next

- No auth

## Checklist

- [ ] Setup server
- [ ] Setup web
- [ ] Basic app design
- [ ] Record flow
- [ ] Transcribe works
- [ ] Get meaningful words
- [ ] Keyword search returns jokes
- [ ] Show joke
- [ ] Filter in API
- [ ] Filter in app
- [ ] setup DB
- [ ] add API functions for DB history
- [ ]
