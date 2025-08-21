import React, { useState, useEffect } from 'react';
import { 
  ChefHat,
  Package,
  Star,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface DashboardData {
  caterer: any;
  menuItems: any[];
  orders: any[];
  stats: {
    totalMenuItems: number;
    activeMenuItems: number;
    totalOrders: number;
    rating: number;
  };
}

export default function CatererDashboard() {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/dashboard/caterer', {
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

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Caterer Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{dashboardData?.caterer.business_name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-300 mr-1" />
                  <span className="font-semibold">{dashboardData?.caterer.rating || 0}/5</span>
                </div>
                <span className="text-orange-100">Contact: {dashboardData?.caterer.contact_person}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats.totalMenuItems || 0}</div>
                <div className="text-sm text-gray-600">Menu Items</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats.activeMenuItems || 0}</div>
                <div className="text-sm text-gray-600">Active Items</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats.totalOrders || 0}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Menu Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
                <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dashboardData?.menuItems.map((item: any) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                        {item.image_url && (
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover ml-4"
                          />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`
                          inline-flex px-2 py-1 text-xs font-medium rounded-full
                          ${item.category === 'lunchbox' ? 'bg-blue-100 text-blue-800' :
                            item.category === 'fruit_bowl' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'}
                        `}>
                          {item.category.replace('_', ' ')}
                        </span>
                        
                        {item.calories && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                            {item.calories} cal
                          </span>
                        )}
                        
                        {item.protein && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                            {item.protein}g protein
                          </span>
                        )}
                      </div>

                      {item.allergens && item.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          <span className="text-xs text-gray-500">Allergens:</span>
                          {item.allergens.map((allergen: string, index: number) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                              {allergen}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-green-600">₹{item.price}</div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <div className={`
                            text-xs px-2 py-1 rounded-full
                            ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                          `}>
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              </div>
              <div className="p-6">
                {dashboardData?.orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No orders received yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData?.orders.slice(0, 10).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              Order #{order.tracking_id}
                            </div>
                            <div className="text-sm text-gray-600">
                              {order.child_name} • {order.school_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Parent: {order.parent_name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">₹{order.total_amount}</div>
                          <div className={`
                            text-xs px-2 py-1 rounded-full
                            ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'}
                          `}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(order.created_at).toLocaleDateString()}
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
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Menu Item
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    View Order Calendar
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Analytics Report
                  </button>
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="text-gray-600">Business Name</div>
                    <div className="font-medium text-gray-900">{dashboardData?.caterer.business_name}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Contact Person</div>
                    <div className="font-medium text-gray-900">{dashboardData?.caterer.contact_person}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Address</div>
                    <div className="font-medium text-gray-900">{dashboardData?.caterer.business_address}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Status</div>
                    <div className={`
                      inline-flex px-2 py-1 text-xs font-medium rounded-full
                      ${dashboardData?.caterer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    `}>
                      {dashboardData?.caterer.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}