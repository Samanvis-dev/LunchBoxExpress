import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Truck, School, ChefHat, ChevronRight } from 'lucide-react';

const roles = [
  {
    id: 'parent',
    title: 'Parent',
    description: 'Book and track lunch deliveries for children.',
    icon: Home,
    color: 'bg-blue-100 text-blue-600',
    borderColor: 'border-blue-200 hover:border-blue-400'
  },
  {
    id: 'delivery_staff',
    title: 'Delivery Partner',
    description: 'Join the delivery network and earn money.',
    icon: Truck,
    color: 'bg-green-100 text-green-600',
    borderColor: 'border-green-200 hover:border-green-400'
  },
  {
    id: 'school_admin',
    title: 'School Admin',
    description: 'Manage lunch deliveries for schools.',
    icon: School,
    color: 'bg-purple-100 text-purple-600',
    borderColor: 'border-purple-200 hover:border-purple-400'
  },
  {
    id: 'caterer',
    title: 'Caterer',
    description: 'Provide healthy meals for school children.',
    icon: ChefHat,
    color: 'bg-orange-100 text-orange-600',
    borderColor: 'border-orange-200 hover:border-orange-400'
  }
];

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedRole) {
      navigate(`/register/${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-red-50">
      <div className="max-w-2xl mx-auto p-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            to="/login" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join LunchBox Express</h1>
          <p className="text-gray-600">Create your account to get started.</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-medium">
              1
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-500 rounded-full text-sm font-medium">
              2
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Role</h2>
            <p className="text-gray-600">Select how you'll be using LunchBox Express.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`
                    p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg
                    ${isSelected 
                      ? 'border-orange-500 bg-orange-50' 
                      : `${role.borderColor} bg-white hover:bg-gray-50`
                    }
                  `}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${role.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{role.title}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex space-x-4">
            <Link
              to="/login"
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Back
            </Link>
            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-3 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}