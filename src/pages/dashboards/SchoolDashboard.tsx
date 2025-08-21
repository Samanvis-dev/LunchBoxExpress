import React, { useState, useEffect } from 'react';
import { 
  School,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface DashboardData {
  school: any;
  todaysDeliveries: any[];
  classWiseSummary: any[];
  stats: {
    totalExpected: number;
    totalReceived: number;
    totalMissing: number;
  };
}

export default function SchoolDashboard() {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/dashboard/school_admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const todayDate = new Date().toLocaleDateString('en-GB');

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* School Info Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <School className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{dashboardData?.school.school_name}</h1>
              <p className="text-purple-100">Lunch Delivery Management</p>
            </div>
          </div>
          
          {/* Today's Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{dashboardData?.stats.totalExpected || 0}</div>
              <div className="text-sm text-purple-100">Total Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{dashboardData?.stats.totalExpected || 0}</div>
              <div className="text-sm text-purple-100">Expected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{dashboardData?.stats.totalReceived || 0}</div>
              <div className="text-sm text-purple-100">Received</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{dashboardData?.stats.totalMissing || 0}</div>
              <div className="text-sm text-purple-100">Missing</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats.totalExpected || 0}</div>
                <div className="text-sm text-gray-600">Expected Deliveries</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats.totalReceived || 0}</div>
                <div className="text-sm text-gray-600">Successfully Received</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats.totalMissing || 0}</div>
                <div className="text-sm text-gray-600">Missing Deliveries</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Today's Expected Deliveries */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  Today's Expected Deliveries ({todayDate})
                </h2>
              </div>
              <div className="p-6">
                {dashboardData?.todaysDeliveries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No deliveries expected for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData?.todaysDeliveries.map((delivery: any) => (
                      <div key={delivery.id} className="p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-gray-900">
                                Tracking ID: {delivery.tracking_id}
                              </div>
                              <div className={`
                                inline-flex px-3 py-1 text-xs font-medium rounded-full
                                ${delivery.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                  delivery.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                  delivery.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'}
                              `}>
                                {delivery.status === 'delivered' ? '✅ Delivered' :
                                 delivery.status === 'in_transit' ? '🚛 In Transit' :
                                 delivery.status === 'confirmed' ? '⏳ Pending' : 
                                 delivery.status}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600">Student</div>
                                <div className="font-medium">{delivery.child_name}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Parent</div>
                                <div className="font-medium">{delivery.parent_name}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Delivery Partner</div>
                                <div className="font-medium">
                                  {delivery.delivery_person || 'Not Assigned'}
                                </div>
                              </div>
                            </div>
                            
                            {delivery.estimated_delivery_time && (
                              <div className="mt-3 flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-1" />
                                Expected: {new Date(delivery.estimated_delivery_time).toLocaleTimeString()}
                              </div>
                            )}
                            
                            {delivery.actual_delivery_time && (
                              <div className="mt-1 flex items-center text-sm text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Received: {new Date(delivery.actual_delivery_time).toLocaleTimeString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Class-wise Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Class-wise Summary
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData?.classWiseSummary.length === 0 ? (
                    <p className="text-gray-500 text-sm">No data available</p>
                  ) : (
                    dashboardData?.classWiseSummary.map((classData: any) => {
                      const completionRate = classData.expected_today > 0 
                        ? Math.round((classData.received_today / classData.expected_today) * 100)
                        : 0;
                      
                      return (
                        <div key={classData.class_name} className="border border-gray-100 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium text-gray-900">{classData.class_name}</div>
                            <div className={`
                              text-sm font-medium px-2 py-1 rounded-full
                              ${completionRate === 100 ? 'bg-green-100 text-green-800' :
                                completionRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'}
                            `}>
                              {completionRate}%
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">
                                {classData.expected_today}
                              </div>
                              <div className="text-gray-600">Expected</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-green-600">
                                {classData.received_today}
                              </div>
                              <div className="text-gray-600">Received</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-red-600">
                                {classData.pending_today}
                              </div>
                              <div className="text-gray-600">Missing</div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  completionRate === 100 ? 'bg-green-500' :
                                  completionRate >= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${completionRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Alert Section */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-800 mb-2">Important Notice</h3>
                  <p className="text-sm text-orange-700">
                    Please ensure all delivery confirmations are recorded accurately. 
                    Missing deliveries should be reported immediately to maintain service quality.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}