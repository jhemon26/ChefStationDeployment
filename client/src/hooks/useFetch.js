import { useEffect, useState } from 'react';

export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    fetcher()
      .then((result) => {
        if (mounted) setData(result.data);
      })
      .catch((err) => {
        if (mounted) setError(err.response?.data?.error || 'Request failed');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, deps);

  return { data, setData, loading, error };
}
