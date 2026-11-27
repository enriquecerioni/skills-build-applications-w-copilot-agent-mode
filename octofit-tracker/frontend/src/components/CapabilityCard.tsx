import type { ReactNode } from 'react';
import type { ApiState } from '../hooks/useApiData.js';

type Props<T> = {
  title: string;
  description: string;
  state: ApiState<T>;
  isEmpty: (data: T) => boolean;
  emptyMessage: string;
  children: (data: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, state, isEmpty, emptyMessage, children }: Props<T>) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading…</p>}
        {state.status === 'error' && <p role="alert" className="text-danger">Unable to load {title.toLowerCase()}. Please try again.</p>}
        {state.status === 'success' && (isEmpty(state.data) ? <p>{emptyMessage}</p> : children(state.data))}
      </div>
    </section>
  );
}
