import React, { useState } from 'react';

interface SchoolRegistrationProps {
  onSubmit: (userData: any, roleData: any) => void;
  loading: boolean;
}

export default function SchoolRegistration({ onSubmit, loading }: SchoolRegistrationProps) {
  const [formData, setFormData] = useState({
    // Basic Information
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // School-specific Information
    schoolName: '',
    schoolId: '',
    contactPerson: '',
    establishedYear: '',
    classesOffered: '',
    schoolAddress: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const userData = {
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    };

    const roleData = {
      schoolName: formData.schoolName,
      schoolId: formData.schoolId,
      contactPerson: formData.contactPerson,
      establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : null,
      classesOffered: formData.classesOffered.split(',').map(cls => cls.trim()),
      schoolAddress: formData.schoolAddress
    };

    onSubmit(userData, roleData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
            <input
              type="text"
              name="contactPerson"
              placeholder="Mrs. Sunita Rao"
              value={formData.contactPerson}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
          <input
            type="tel"
            name="phone"
            placeholder="+91-9876543210"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* School Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">School Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
            <input
              type="text"
              name="schoolName"
              placeholder="Delhi Public School"
              value={formData.schoolName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School ID *</label>
            <input
              type="text"
              name="schoolId"
              placeholder="DPS001"
              value={formData.schoolId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
          <input
            type="number"
            name="establishedYear"
            placeholder="1995"
            value={formData.establishedYear}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Classes Offered *</label>
          <input
            type="text"
            name="classesOffered"
            placeholder="1st Grade, 2nd Grade, 3rd Grade"
            value={formData.classesOffered}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Enter comma-separated class names</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">School Address *</label>
          <textarea
            name="schoolAddress"
            value={formData.schoolAddress}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Complete school address with pincode"
            required
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-4 pt-6">
        <button
          type="button"
          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-3 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
    </form>
  );
}