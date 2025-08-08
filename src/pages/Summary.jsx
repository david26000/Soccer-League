import { useEffect, useState, useCallback } from "react";

const API_URL = "https://app.seker.live/fm1";

export default function Summary() {
  const [catalog, setCatalog] = useState([]);
  const [leagueKey, setLeagueKey] = useState("");
  const [figures, setFigures] = useState(null);

  /* load league dropdown */
  useEffect(() => {
    fetch(`${API_URL}/leagues`)
      .then(r => r.json())
      .then(setCatalog);
  }, []);

  const crunch = useCallback(code => {
    fetch(`${API_URL}/history/${code}`)
      .then(r => r.json())
      .then(rows => {
        let first=0, second=0, early=120, late=0;
        const perRound = {};

        rows.forEach(rec => {
          perRound[rec.round] = (perRound[rec.round] || 0) + rec.goals.length;
          rec.goals.forEach(g => {
            const m = g.minute;
            if (m <= 45) first++; else second++;
            if (m < early) early = m;
            if (m > late)  late  = m;
          });
        });

        const [hiRound] = Object.entries(perRound).reduce((a,b)=>b[1]>a[1]?b:a);
        const [loRound] = Object.entries(perRound).reduce((a,b)=>b[1]<a[1]?b:a);

        setFigures({ first, second, early, late, hiRound, loRound });
      });
  }, []);

  useEffect(() => {
    if (leagueKey) crunch(leagueKey);
  }, [leagueKey, crunch]);

  return (
    <main>
      <h1 style={{marginTop:0}}>📊 Stat Digest</h1>

      <label>
        Pick league:&nbsp;
        <select value={leagueKey} onChange={e => setLeagueKey(e.target.value)}>
          <option value="">-- choose --</option>
          {catalog.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </label>

      {figures && (
        <ul style={{marginTop:20, lineHeight:1.8}}>
          <li>Goals before break: <strong>{figures.first}</strong></li>
          <li>Goals after break: <strong>{figures.second}</strong></li>
          <li>Fastest strike: <strong>{figures.early}&rsquo;</strong></li>
          <li>Latest strike: <strong>{figures.late}&rsquo;</strong></li>
          <li>Round with most goals: <strong>{figures.hiRound}</strong></li>
          <li>Round with least goals: <strong>{figures.loRound}</strong></li>
        </ul>
      )}
    </main>
  );
}
