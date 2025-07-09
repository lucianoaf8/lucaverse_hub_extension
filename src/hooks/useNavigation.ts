import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { storageAdapter } from '../utils/storageAdapter';

const DEV_CENTER_SOURCE_KEY = 'lucaverse-from-dev-center';

export default function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToDashboard = useCallback(async () => {
    try {
      await storageAdapter.setItem(DEV_CENTER_SOURCE_KEY, 'true');
      navigate('/');
    } catch (error) {
      throw new Error(`Failed to navigate to dashboard: ${error}`);
    }
  }, [navigate]);

  const goToDevCenter = useCallback(async () => {
    try {
      await storageAdapter.removeItem(DEV_CENTER_SOURCE_KEY);
      navigate('/dev-center');
    } catch (error) {
      throw new Error(`Failed to navigate to dev center: ${error}`);
    }
  }, [navigate]);

  const isFromDevCenter = useCallback(async () => {
    try {
      const value = await storageAdapter.getItem(DEV_CENTER_SOURCE_KEY);
      return value === 'true';
    } catch (error) {
      throw new Error(`Failed to check navigation state: ${error}`);
    }
  }, []);

  const clearNavigationState = useCallback(async () => {
    try {
      await storageAdapter.removeItem(DEV_CENTER_SOURCE_KEY);
    } catch (error) {
      throw new Error(`Failed to clear navigation state: ${error}`);
    }
  }, []);

  const validateNavigationState = useCallback(async () => {
    try {
      const currentPath = location.pathname;
      const fromDevCenter = await isFromDevCenter();
      
      if (currentPath === '/' && fromDevCenter === null) {
        throw new Error('Navigation state corrupted: Dashboard accessed without proper navigation state');
      }
      
      if (currentPath !== '/' && currentPath !== '/dev-center' && !currentPath.startsWith('/theme-demo') && !currentPath.startsWith('/animation-demo')) {
        throw new Error(`Invalid route: ${currentPath}`);
      }
      
      return true;
    } catch (error) {
      throw new Error(`Navigation validation failed: ${error}`);
    }
  }, [location.pathname, isFromDevCenter]);

  return {
    goToDashboard,
    goToDevCenter,
    isFromDevCenter,
    clearNavigationState,
    validateNavigationState,
    currentPath: location.pathname
  };
}