import { useDispatch } from 'react-redux';
import { setLoading } from '@/store/appSlice';

/**
 * useLoading - Custom React hook for handling global loading state.
 *
 * HOW TO USE:
 * 1. Import and call useLoading in your component.
 * 2. Wrap any async operation with the withLoading function to automatically show/hide the global loading indicator.
 *
 * Example:
 *   const { withLoading } = useLoading();
 *   const handleFetch = async () => {
 *     await withLoading(fetchData());
 *   };
 *
 * This hook will dispatch setLoading(true) before the promise starts,
 * and setLoading(false) after it finishes (success or error).
 * You should have a global loading component that listens to this state.
 */

export const useLoading = () => {
  const dispatch = useDispatch();

  const withLoading = async <T>(promise: Promise<T>): Promise<T> => {
    try {
      dispatch(setLoading(true));
      return await promise;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { withLoading };
};