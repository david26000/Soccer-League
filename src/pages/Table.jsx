import { useEffect, useState } from "react";

const ENDPOINT = "https://app.seker.live/fm1";

export default function RankingsPage() {
  const [league, setLeague] = useState("");
  const [grid, setGrid] = useState([]);
  const [popup, setPopup] = useState(null);
  const [catalogue, setCatalogue] = useState([]);

  /* load leagues once */
  useEffect(() => {
    fetch(`${ENDPOINT}/leagues`).then(r => r.json()).then(setCatalogue);
  }, []);

  /* rebuild table when league changes */
  useEffect(() => {
    if (!league) return;
    Promise.all([
      fetch(`${ENDPOINT}/teams/${league}`).then(r => r.json()),
      fetch(`${ENDPOINT}/history/${league}`).then(r => r.json())
    ]).then(([clubs, games]) => assemble(clubs, games));
  }, [league]);

  function assemble(clubs, games) {
    const stats = {};
    clubs.forEach(c =>
      stats[c.id] = { id:c.id, name:c.name, pts:0, gf:0, ga:0 }
    );

    games.forEach(g => {
      const home = g.homeTeam.id, away = g.awayTeam.id;
      const hGoals = g.goals.filter(ev => ev.home).length;
      const aGoals = g.goals.length - hGoals;

      /* lazy init in case /teams missed a club */
      if (!stats[home]) stats[home] = { id:home, name:g.homeTeam.name, pts:0, gf:0, ga:0 };
      if (!stats[away]) stats[away] = { id:away, name:g.awayTeam.name, pts:0, gf:0, ga:0 };

      stats[home].gf += hGoals; stats[home].ga += aGoals;
      stats[away].gf += aGoals; stats[away].ga += hGoals;

      if (hGoals > aGoals)      stats[home].pts += 3;
      else if (hGoals < aGoals) stats[away].pts += 3;
      else { stats[home].pts++; stats[away].pts++; }
    });

    const sorted = Object.values(stats).map(t => ({
      ...t, gd:t.gf - t.ga
    })).sort((a,b)=>
      b.pts - a.pts ||
      b.gd  - a.gd  ||
      a.name.localeCompare(b.name)
    );

    setGrid(sorted);
    setPopup(null);
  }

  /* row click → fetch squad + club history */
  function openClub(club) {
    Promise.all([
      fetch(`${ENDPOINT}/squad/${league}/${club.id}`).then(r=>r.json()),
      fetch(`${ENDPOINT}/history/${league}/${club.id}`).then(r=>r.json())
    ]).then(([crew, fixtures]) =>
      setPopup({ club, crew, fixtures })
    );
  }

  return (
    <main>
      <h2>Live Standings</h2>

      <select value={league} onChange={e=>setLeague(e.target.value)}>
        <option value="">Pick League…</option>
        {catalogue.map(l=>(
          <option key={l.id} value={l.id}>{l.name}</option>
        ))}
      </select>

      {grid.length>0 && (
        <table>
          <thead>
            <tr>
              <th>Rank</th><th>Club Name</th><th>Points</th><th>Diff ±</th>
            </tr>
          </thead>
          <tbody>
            {grid.map((t,idx)=>{
              const rowClass =
                idx===0 ? "leader-row" :
                idx>=grid.length-3 ? "bottom-row" : "";
              return (
                <tr key={t.id} className={rowClass} onClick={()=>openClub(t)}>
                  <td>{idx+1}</td><td>{t.name}</td><td>{t.pts}</td><td>{t.gd}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* roster & fixtures */}
      {popup && (
        <>
          <section className="subcard roster-card">
            <h3>{popup.club.name} – Squad</h3>
            <ul>
              {popup.crew.map(p=>(
                <li key={p.id}>{p.firstName} {p.lastName}{p.captain&&" (C)"}</li>
              ))}
            </ul>
          </section>

          <section className="subcard fixture-card">
            <h3>Recent Fixtures</h3>
            <ul>
              {popup.fixtures.map(f=>{
                const h=f.goals.filter(x=>x.home).length;
                const a=f.goals.length-h;
                return (
                  <li key={f.id}>
                    {f.homeTeam.name} {h} &ndash; {a} {f.awayTeam.name}
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
