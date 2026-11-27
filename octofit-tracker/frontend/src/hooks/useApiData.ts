import { useEffect, useState } from 'react';

export type ApiState<T> = { status: 'loading' } | { status: 'error' } | { status: 'success'; data: T };

export function useApiData<T>(load: () => Promise<T>, key: string): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    load()
      .then((data) => active && setState({ status: 'success', data }))
      .catch(() => active && setState({ status: 'error' }));
    return () => {
      active = false;
    };
    // `key` identifies the request; `load` is recreated on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
