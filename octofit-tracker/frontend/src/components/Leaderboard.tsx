import { CapabilityCard } from './CapabilityCard.js';
import { useApiData } from '../hooks/useApiData.js';
import { apiPaths, getJson } from '../api/client.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const state = useApiData(() => getJson<{ leaderboard: Entry[] }>(apiPaths.leaderboard()), apiPaths.leaderboard());
  return (
    <CapabilityCard title="Leaderboard" description="Compare team point totals." state={state} isEmpty={(data) => data.leaderboard.length === 0} emptyMessage="No leaderboard scores yet.">
      {(data) => (
        <ol className="list-group list-group-numbered">
          {data.leaderboard.map((entry) => <li className="list-group-item" key={entry.teamName}>{entry.teamName} — {entry.totalPoints} points (rank {entry.rank})</li>)}
        </ol>
      )}
    </CapabilityCard>
  );
}
