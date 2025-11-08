import { useAuth } from './useAuth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  return { user, isLoading };
}

export function useRequireSubscription() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/login');
      } else if (user.subscriptionStatus !== 'active' && user.role !== 'admin') {
        navigate('/pricing');
      }
    }
  }, [user, isLoading, navigate]);

  return { user, isLoading };
}

export function useRequireAdmin() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'admin') {
        navigate('/dashboard');
      }
    }
  }, [user, isLoading, navigate]);

  return { user, isLoading };
}

export function useRedirectIfAuthenticated() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, isLoading, navigate]);

  return { user, isLoading };
}