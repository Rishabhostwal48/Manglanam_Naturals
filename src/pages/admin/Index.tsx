
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function AdminIndex() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the dashboard page
    navigate('/admin/dashboard');
  }, [navigate]);
  
  return null;
}
