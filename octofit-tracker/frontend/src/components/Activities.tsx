import { CapabilityCard } from './CapabilityCard.js';
import { useApiData } from '../hooks/useApiData.js';

type Activity = { _id?: string; type: string; minutes: number; points: number; occurredAt?: string };

export default function Activities() {
  const state = useApiData<{ activities: Activity[] }>('/api/activities');
  return (
    <CapabilityCard title="Activities" description="Track student activity minutes and points." state={state} isEmpty={(data) => data.activities.length === 0} emptyMessage="No activities recorded yet.">
      {(data) => (
        <table className="table">
          <thead><tr><th scope="col">Type</th><th scope="col">Minutes</th><th scope="col">Points</th></tr></thead>
          <tbody>{data.activities.map((activity, index) => <tr key={activity._id ?? index}><td>{activity.type}</td><td>{activity.minutes}</td><td>{activity.points}</td></tr>)}</tbody>
        </table>
      )}
    </CapabilityCard>
  );
}
