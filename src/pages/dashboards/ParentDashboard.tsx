import React, { useState, useEffect } from 'react';
import { 
  Home, 
  MapPin, 
  Bell, 
  User, 
  Plus,
  RotateCcw,
  Clock,
  Star,
  ChefHat,
  Truck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AddChildModal from '../../components/modals/AddChildModal';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface DashboardData {
  parent: any;
  children: any[];
  todaysOrders: any[];
  recentOrders: any[];
  stats: {
    childrenCount: number;
    todaysOrdersCount: number;
    totalOrders: number;
    loyaltyPoints: number;
  };
  notifications: any[];
}

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/dashboard/parent', {
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

  const handleChildAdded = () => {
    setShowAddChildModal(false);
    fetchDashboardData(); // Refresh data
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Welcome Panel */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}!</h1>
              <p className="text-indigo-100 mb-6">Manage your children's lunch deliveries with ease</p>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{dashboardData?.stats.childrenCount || 0}</div>
                  <div className="text-sm text-indigo-100">Children</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{dashboardData?.stats.todaysOrdersCount || 0}</div>
                  <div className="text-sm text-indigo-100">Today's Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{dashboardData?.stats.totalOrders || 0}</div>
                  <div className="text-sm text-indigo-100">Total Orders</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 lg:mt-0">
              <Star className="w-5 h-5 text-yellow-300" />
              <span className="font-semibold">Loyalty Points: {dashboardData?.stats.loyaltyPoints || 0}</span>
            </div>
          </div>
        </div>

        {/* Quick Action Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Home Cooking</h3>
                <p className="text-sm text-gray-600">Traditional dabbawala</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Caterer Menu</h3>
                <p className="text-sm text-gray-600">Variety of meals</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Track Orders</h3>
                <p className="text-sm text-gray-600">Live delivery tracking</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Deliveries */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Today's Deliveries</h2>
              </div>
              <div className="p-6">
                {dashboardData?.todaysOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No deliveries scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData?.todaysOrders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {order.child_name?.[0] || 'C'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {order.child_name} • {order.school_name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-4">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {order.estimated_delivery_time ? new Date(order.estimated_delivery_time).toLocaleTimeString() : 'TBD'}
                              </span>
                              <span>₹{order.total_amount}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`
                            inline-flex px-3 py-1 text-xs font-medium rounded-full
                            ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                              order.status === 'in_transit' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'}
                          `}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </div>
                          {order.delivery_person && (
                            <div className="text-xs text-gray-500 mt-1">
                              by {order.delivery_person}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Orders History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                  View All Orders →
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData?.recentOrders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.child_name} • {order.school_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center space-x-4">
                        <div>
                          <div className="font-medium text-gray-900">₹{order.total_amount}</div>
                          <div className={`text-xs ${
                            order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {order.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reorder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* My Children */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">My Children</h2>
                <button 
                  onClick={() => setShowAddChildModal(true)}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Child
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData?.children.map((child: any) => (
                    <div key={child.id} className="p-4 border border-gray-100 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{child.name}</h3>
                          <p className="text-sm text-gray-600">{child.class_name} • {child.school_name}</p>
                          
                          {child.allergies && child.allergies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              <span className="text-xs text-gray-500">Allergies:</span>
                              {child.allergies.map((allergy: string, index: number) => (
                                <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                                  {allergy}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {child.food_preferences && child.food_preferences.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="text-xs text-gray-500">Preferences:</span>
                              {child.food_preferences.map((pref: string, index: number) => (
                                <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                                  {pref}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-purple-600" />
                  Notifications
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {dashboardData?.notifications.length === 0 ? (
                    <p className="text-gray-500 text-sm">No new notifications</p>
                  ) : (
                    dashboardData?.notifications.map((notification: any) => (
                      <div key={notification.id} className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                        <div className="font-medium text-gray-900 text-sm">{notification.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{notification.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Child Modal */}
      {showAddChildModal && (
        <AddChildModal
          onClose={() => setShowAddChildModal(false)}
          onChildAdded={handleChildAdded}
        />
      )}
    </DashboardLayout>
  );
}