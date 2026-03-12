import { useState, useCallback } from 'react';

/**
 * Wraps an async API call with loading / error state management.
 *
 * Usage:
 *   const { execute, loading, error, data } = useApiCall(employeeApi.getAll);
 *   useEffect(() => { execute(); }, []);
 */
export function useApiCall(apiFunc) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFunc(...args);
        setData(response.data);
        return response.data;
      } catch (err) {
        setError(err.message || 'An error occurred');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { execute, loading, error, data, reset };
}
