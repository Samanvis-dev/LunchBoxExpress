import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ParentRegistration from '../components/registration/ParentRegistration';
import DeliveryRegistration from '../components/registration/DeliveryRegistration';
import SchoolRegistration from '../components/registration/SchoolRegistration';
import CatererRegistration from '../components/registration/CatererRegistration';

const roleNames = {
  parent: 'Parent',
  delivery_staff: 'Delivery Partner',
  school_admin: 'School Admin',
  caterer: 'Caterer'
};

export default function RegistrationPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!role || !roleNames[role as keyof typeof roleNames]) {
    return <div>Invalid role</div>;
  }

  const handleRegister = async (userData: any, roleData: any) => {
    setLoading(true);
    const success = await register(userData, roleData, role);
    if (success) {
      navigate('/login');
    }
    setLoading(false);
  };

  const renderRegistrationForm = () => {
    const props = { onSubmit: handleRegister, loading };
    
    switch (role) {
      case 'parent':
        return <ParentRegistration {...props} />;
      case 'delivery_staff':
        return <DeliveryRegistration {...props} />;
      case 'school_admin':
        return <SchoolRegistration {...props} />;
      case 'caterer':
        return <CatererRegistration {...props} />;
      default:
        return <div>Invalid role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-red-50">
      <div className="max-w-2xl mx-auto p-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            to="/register" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Role Selection
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join LunchBox Express</h1>
          <p className="text-gray-600">Create your account to get started.</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-medium">
              1
            </div>
            <div className="w-12 h-0.5 bg-orange-500"></div>
            <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-medium">
              2
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create {roleNames[role as keyof typeof roleNames]} Account
            </h2>
            <p className="text-gray-600">Fill in your details to get started.</p>
          </div>

          {renderRegistrationForm()}
        </div>
      </div>
    </div>
  );
}