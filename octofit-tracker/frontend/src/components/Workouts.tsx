import { useState } from 'react';
import { CapabilityCard } from './CapabilityCard.js';
import { useApiData } from '../hooks/useApiData.js';
import { apiPaths, getJson } from '../api/client.js';

type Suggestion = { _id?: string; title: string; focus?: string; reason: string };

export default function Workouts() {
  const [draft, setDraft] = useState('mona@example.com');
  const [email, setEmail] = useState('mona@example.com');
  const state = useApiData(() => getJson<{ suggestions: Suggestion[] }>(apiPaths.workoutSuggestions(email)), email);
  return (
    <>
      <form className="mb-3" onSubmit={(event) => { event.preventDefault(); if (draft.trim()) setEmail(draft.trim()); }}>
        <label htmlFor="user-email" className="form-label">Student email</label>
        <div className="input-group">
          <input id="user-email" type="email" className="form-control" value={draft} onChange={(event) => setDraft(event.target.value)} />
          <button type="submit" className="btn btn-primary">Get suggestions</button>
        </div>
      </form>
      <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." state={state} isEmpty={(data) => data.suggestions.length === 0} emptyMessage="No workout suggestions available.">
        {(data) => (
          <ul className="list-group">
            {data.suggestions.map((suggestion, index) => <li className="list-group-item" key={suggestion._id ?? index}><strong>{suggestion.title}</strong>: {suggestion.reason}</li>)}
          </ul>
        )}
      </CapabilityCard>
    </>
  );
}
