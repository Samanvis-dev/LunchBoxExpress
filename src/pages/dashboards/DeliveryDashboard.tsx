import React, { useState, useEffect } from 'react';
import { 
  Truck,
  Star,
  Clock,
  DollarSign,
  MapPin,
  Package,
  Trophy,
  Bell,
  Power,
  PowerOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface DashboardData {
  deliveryStaff: any;
  todaysDeliveries: any[];
  leaderboard: any[];
  notifications: any[];
  stats: {
    totalDeliveries: number;
    rating: number;
    totalEarnings: number;
    todaysDeliveries: number;
  };
}

export default function DeliveryDashboard() {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/dashboard/delivery_staff', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        setIsAvailable(data.deliveryStaff.status === 'available');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = isAvailable ? 'offline' : 'available';
      
      const response = await fetch('http://localhost:3001/api/delivery/availability', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setIsAvailable(!isAvailable);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const currentRank = dashboardData?.leaderboard.findIndex(item => 
    item.duplicate_name === dashboardData?.deliveryStaff.duplicate_name
  ) + 1 || 0;

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Greeting & Status */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Hello, {dashboardData?.deliveryStaff.duplicate_name}!
              </h1>
              <p className="text-green-100">Ready for today's deliveries</p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <button
                onClick={toggleAvailability}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  isAvailable 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isAvailable ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
                <span>{isAvailable ? 'Available' : 'Offline'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats.totalDeliveries || 0}</div>
                <div className="text-sm text-gray-600">Total Deliveries</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats.rating || 0}</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">₹{dashboardData?.stats.totalEarnings || 0}</div>
                <div className="text-sm text-gray-600">Total Earnings</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats.todaysDeliveries || 0}</div>
                <div className="text-sm text-gray-600">Today's Orders</div>
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
                {dashboardData?.todaysDeliveries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No deliveries assigned for today</p>
                    <p className="text-sm mt-2">Make sure you're available to receive new orders</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData?.todaysDeliveries.map((delivery: any) => (
                      <div key={delivery.id} className="p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium text-gray-900">
                            Order #{delivery.tracking_id}
                          </div>
                          <div className={`
                            inline-flex px-3 py-1 text-xs font-medium rounded-full
                            ${delivery.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                              delivery.status === 'in_transit' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'}
                          `}>
                            {delivery.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-600 mb-2">Customer Details</div>
                            <div className="text-sm">
                              <div className="font-medium">{delivery.parent_name}</div>
                              <div className="text-gray-600">Child: {delivery.child_name}</div>
                              <div className="text-gray-600">School: {delivery.school_name}</div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-600 mb-2">Delivery Info</div>
                            <div className="text-sm">
                              <div className="flex items-center text-gray-600">
                                <MapPin className="w-4 h-4 mr-1" />
                                Delivery Address
                              </div>
                              <div className="font-medium">₹{delivery.total_amount}</div>
                              <div className="text-gray-600">
                                {delivery.estimated_delivery_time && 
                                  new Date(delivery.estimated_delivery_time).toLocaleTimeString()
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3 mt-4">
                          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                            Update Status
                          </button>
                          <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                            View Route
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Leaderboard */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex items-center">
                <Trophy className="w-6 h-6 text-yellow-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Leaderboard</h2>
              </div>
              <div className="p-6">
                {currentRank > 0 && (
                  <div className="bg-orange-50 p-4 rounded-lg mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">#{currentRank}</div>
                      <div className="text-sm text-orange-700">Your Current Rank</div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {dashboardData?.leaderboard.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                      item.duplicate_name === dashboardData?.deliveryStaff.duplicate_name 
                        ? 'bg-orange-50 border border-orange-200' 
                        : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.duplicate_name}</div>
                          <div className="text-xs text-gray-600">
                            {item.deliveries_completed} deliveries • {item.rating}⭐
                          </div>
                        </div>
                      </div>
                      
                      {index < 3 && (
                        <div className="text-xs font-medium text-orange-600">
                          {index === 0 ? '🎁 ₹10k' : index === 1 ? '⌚ ₹5k' : '🎧 ₹2.5k'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800 mb-2">Monthly Rewards</div>
                  <div className="text-xs text-yellow-700">
                    🥇 1st Place: Smartphone or ₹10,000<br/>
                    🥈 2nd Place: Smartwatch or ₹5,000<br/>
                    🥉 3rd Place: Bluetooth Headphones or ₹2,500
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-blue-600" />
                  Notifications
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {dashboardData?.notifications.length === 0 ? (
                    <p className="text-gray-500 text-sm">No new notifications</p>
                  ) : (
                    dashboardData?.notifications.map((notification: any) => (
                      <div key={notification.id} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <div className="font-medium text-gray-900 text-sm">{notification.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{notification.message}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}