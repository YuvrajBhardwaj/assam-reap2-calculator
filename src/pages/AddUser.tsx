import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const AddUser: React.FC = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/'); // Redirect to home or a forbidden page if not admin
    }
  }, [userRole, navigate]);

  if (userRole !== 'admin') {
    return null; // Or a loading spinner, or a message
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New User</h1>
      <p>This is where the form for adding a new user will go.</p>
      {/* You can add your form elements here */}
    </div>
  );
};

export default AddUser;