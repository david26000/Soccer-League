import { NavLink, Routes, Route } from "react-router-dom";
import RankingsPage   from "./pages/Table";
import FixturesPage   from "./pages/Results";
import Sharpshooters  from "./pages/Shooters";
import InsightsPage   from "./pages/Summary";

export default function App() {
  return (
    <>
      {/* centred, pill-style nav */}
      <nav className="bar">
        <NavLink end to="/" className="link">Standings</NavLink>
        <NavLink to="/log" className="link">Match Log</NavLink>
        <NavLink to="/goals" className="link">Goal Kings</NavLink>
        <NavLink to="/analysis" className="link">Analytics</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<RankingsPage />} />
        <Route path="/log" element={<FixturesPage />} />
        <Route path="/goals" element={<Sharpshooters />} />
        <Route path="/analysis" element={<InsightsPage />} />
      </Routes>
    </>
  );
}
