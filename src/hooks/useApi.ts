import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (promise: Promise<{ data: { data: T } }>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await promise;
      setState({ data: response.data.data, loading: false, error: null });
      return response.data.data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro inesperado.';
      setState({ data: null, loading: false, error: message });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
