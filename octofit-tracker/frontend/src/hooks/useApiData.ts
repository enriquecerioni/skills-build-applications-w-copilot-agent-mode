import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

export type ApiState<T> = { status: 'loading' } | { status: 'error' } | { status: 'success'; data: T };

export function useApiData<T>(path: string): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    getJson<T>(path)
      .then((data) => active && setState({ status: 'success', data }))
      .catch(() => active && setState({ status: 'error' }));
    return () => {
      active = false;
    };
  }, [path]);

  return state;
}
