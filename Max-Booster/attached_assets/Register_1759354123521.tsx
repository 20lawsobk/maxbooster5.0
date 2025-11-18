import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Register() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Redirect to pricing for payment-before-account-creation workflow
    navigate('/pricing');
  }, [navigate]);

  // Return null since we're immediately redirecting
  return null;
}
