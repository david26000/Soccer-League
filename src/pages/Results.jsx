import { useEffect, useState } from "react";
const HOST = "https://app.seker.live/fm1";

export default function FixturesPage() {
  const [lid,     setLid]     = useState("");
  const [board,   setBoard]   = useState([]);
  const [low,     setLow]     = useState("");
  const [high,    setHigh]    = useState("");
  const [menu,    setMenu]    = useState([]);

  useEffect(()=>{ fetch(`${HOST}/leagues`).then(r=>r.json()).then(setMenu); },[]);
  useEffect(()=>{ if(lid) fetch(`${HOST}/history/${lid}`).then(r=>r.json()).then(setBoard); },[lid]);

  const view = board.filter(m =>
    (low==="" || m.round>=+low) &&
    (high===""|| m.round<=+high)
  );

  return (
    <main>
      <h2>Match Log</h2>
      <select value={lid} onChange={e=>setLid(e.target.value)}>
        <option value="">Select Competition</option>
        {menu.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}
      </select>

      {board.length>0 && (
        <>
          <div className="mt-2">
            Round&nbsp;
            <input type="number" value={low}  onChange={e=>setLow(e.target.value)} />
            to&nbsp;
            <input type="number" value={high} onChange={e=>setHigh(e.target.value)} />
          </div>

          <ul className="mt-2">
            {view.map(g=>{
              const h=g.goals.filter(x=>x.home).length, a=g.goals.length-h;
              return <li key={g.id}>{g.homeTeam.name} {h} &ndash; {a} {g.awayTeam.name} <small>(R{g.round})</small></li>;
            })}
          </ul>
        </>
      )}
    </main>
  );
}
