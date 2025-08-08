import { useEffect, useState, useCallback } from "react";

const ENDPOINT = "https://app.seker.live/fm1";

export default function Shooters() {
  const [leagueList, setLeagueList] = useState([]);
  const [chosenId,   setChosenId]   = useState("");
  const [chart,      setChart]      = useState([]);

  /* grab leagues once */
  useEffect(() => {
    fetch(`${ENDPOINT}/leagues`)
      .then(res => res.json())
      .then(setLeagueList);
  }, []);

  /* build scorers table whenever league changes */
  const makeChart = useCallback(id => {
    fetch(`${ENDPOINT}/history/${id}`)
      .then(res => res.json())
      .then(data => {
        const bucket = {};
        data.forEach(match =>
          match.goals.forEach(ev => {
            const tag = `${ev.scorer.firstName} ${ev.scorer.lastName}`;
            bucket[tag] = (bucket[tag] || 0) + 1;
          })
        );
        const topThree = Object.entries(bucket)
          .map(([name, goals]) => ({ name, goals }))
          .sort((a, b) => b.goals - a.goals)
          .slice(0, 3);
        setChart(topThree);
      });
  }, []);

  useEffect(() => {
    if (chosenId) makeChart(chosenId);
  }, [chosenId, makeChart]);

  return (
    <main>
      <h1 style={{marginTop:0}}>🏹 Goal Kings</h1>

      <label>
        Championship:&nbsp;
        <select value={chosenId} onChange={e => setChosenId(e.target.value)}>
          <option value="">-- choose --</option>
          {leagueList.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </label>

      <section style={{marginTop:20}}>
        {chart.length > 0 && chart.map((p, idx) => (
          <p key={p.name} style={{fontSize:18}}>
            <strong>{idx + 1}.</strong> {p.name}
            <span style={{marginLeft:6, color:"#00695c"}}>{p.goals} ⚽</span>
          </p>
        ))}
      </section>
    </main>
  );
}
