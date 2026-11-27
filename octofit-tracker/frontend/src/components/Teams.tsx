import { CapabilityCard } from './CapabilityCard.js';
import { useApiData } from '../hooks/useApiData.js';
import { apiPaths } from '../api/client.js';

type Team = { _id?: string; name: string; mascot?: string; members: string[] };

export default function Teams() {
  const state = useApiData<{ teams: Team[] }>(apiPaths.teams());
  return (
    <CapabilityCard title="Teams" description="Manage teams and members." state={state} isEmpty={(data) => data.teams.length === 0} emptyMessage="No teams created yet.">
      {(data) => (
        <ul className="list-group">
          {data.teams.map((team, index) => <li className="list-group-item" key={team._id ?? index}>{team.name}{team.mascot ? ` (${team.mascot})` : ''} — {team.members.length} members</li>)}
        </ul>
      )}
    </CapabilityCard>
  );
}
