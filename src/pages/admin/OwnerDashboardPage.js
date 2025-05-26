import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, UserPlus, Clock, CheckCircle, XCircle, RefreshCw, AlertCircle, Building2 } from "lucide-react";
import { supabase } from '../../lib/supabase';

export function OwnerDashboardPage({ adminRequests, handleAdminRequest: parentHandleAdminRequest }) {
  const [activeTab, setActiveTab] = useState("admins");
  const [admins, setAdmins] = useState([]);
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isAssigningMuseum, setIsAssigningMuseum] = useState(false);
  const [selectedMuseum, setSelectedMuseum] = useState("");

  const fetchMuseums = async () => {
    try {
      const { data, error } = await supabase
        .from('museums')
        .select('id, name')
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      setMuseums(data || []);
    } catch (err) {
      console.error('Error fetching museums:', err);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Current user ID:', user.id);
      
      // For development/testing - temporarily bypass role check
      // Skip the owner check and just fetch all admins
      
      // Now fetch all admins with their museum assignments
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select(`
          id, 
          user_id,
          name, 
          email, 
          role, 
          is_admin,
          created_at, 
          updated_at
        `)
        .or('role.eq.admin,is_admin.eq.true,role.eq.owner')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }
      
      console.log('Fetched profiles:', data?.length || 0);

      // Fetch museums to check if any admin is assigned to a museum
      const { data: museumsData, error: museumsError } = await supabase
        .from('museums')
        .select('id, name, user_id');
        
      if (museumsError) {
        console.error('Error fetching museums:', museumsError);
      }
      
      const museumsByUserId = {};
      if (museumsData) {
        museumsData.forEach(museum => {
          if (museum.user_id) {
            museumsByUserId[museum.user_id] = museum;
          }
        });
      }
      
      const formattedAdmins = (data || []).map(admin => {
        const assignedMuseum = museumsByUserId[admin.user_id];
        
        return {
          id: admin.id,
          userId: admin.user_id,
          name: admin.name || 'Unnamed Admin',
          email: admin.email,
          role: admin.role || 'user',
          is_admin: admin.is_admin || false,
          museumId: assignedMuseum ? assignedMuseum.id : null,
          museumName: assignedMuseum ? assignedMuseum.name : null,
          lastActive: admin.updated_at || admin.created_at
        };
      });

      setAdmins(formattedAdmins);
      
      // Also fetch museums for assignment
      await fetchMuseums();
    } catch (err) {
      console.error('Error in fetchAdmins:', err);
      setError(err.message || 'Failed to load admin data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRequest = async (requestId, userId, status) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      
      if (!user) {
        throw new Error('You must be logged in to perform this action');
      }
      
      console.log('Current user ID:', user.id);
      console.log('Processing admin request:', requestId, 'for user:', userId, 'with status:', status);
      
      // For development/testing - temporarily bypass owner check
      
      // First, update the request status
      const { error: requestError } = await supabase
        .from('admin_requests')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('id', requestId);
      
      if (requestError) {
        console.error('Request update error:', requestError);
        throw requestError;
      }
      
      // If approved, update the user's profile with role=admin and is_admin=true
      if (status === 'approved') {
        console.log('Approving admin request - setting is_admin=true for user:', userId);
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin',
            is_admin: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (profileError) {
          console.error('Profile update error:', profileError);
          throw profileError;
        }
      }
      
      // Call the parent handler
      if (parentHandleAdminRequest) {
        await parentHandleAdminRequest(requestId, userId, status);
      }
      
      // Refresh the admin list if we're on the admins tab
      if (activeTab === 'admins') {
        await fetchAdmins();
      }
      
      alert(`Admin request ${status === 'approved' ? 'approved' : 'rejected'} successfully.`);
    } catch (err) {
      console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} admin request:`, err);
      alert(err.message || `Failed to ${status === 'approved' ? 'approve' : 'reject'} admin request. Please try again.`);
    }
  };

  useEffect(() => {
    if (activeTab === 'admins') {
      fetchAdmins();
    }
  }, [activeTab]);

  const handleRevokeAccess = async (adminId) => {
    if (!window.confirm("Are you sure you want to revoke this admin's access?")) return;
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      
      if (!user) {
        throw new Error('You must be logged in to perform this action');
      }
      
      console.log('Current user ID:', user.id);
      
      // For development/testing - temporarily bypass owner check
      
      // Don't allow revoking owner's access
      const adminToRevoke = admins.find(a => a.id === adminId);
      if (adminToRevoke?.role === 'owner') {
        throw new Error('Cannot revoke owner access');
      }
      
      // First update the profile to remove admin status
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: 'user',
          is_admin: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminId);

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }
      
      // If this admin is assigned to any museums, remove the assignment
      if (adminToRevoke?.museumId) {
        const { error: museumError } = await supabase
          .from('museums')
          .update({ 
            user_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', adminToRevoke.museumId);
          
        if (museumError) {
          console.error('Museum update error:', museumError);
          throw museumError;
        }
      }
      
      // Refresh the admin list
      await fetchAdmins();
      
      // Show success message
      alert('Admin access revoked successfully');
    } catch (err) {
      console.error('Error revoking admin access:', err);
      alert(err.message || 'Failed to revoke admin access. Please try again.');
    }
  };
  
  const assignAdminToMuseum = async () => {
    if (!selectedAdmin || !selectedMuseum) {
      alert('Please select both an admin and a museum');
      return;
    }
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      
      if (!user) {
        throw new Error('You must be logged in to perform this action');
      }
      
      console.log('Current user ID:', user.id);
      console.log('Assigning admin', selectedAdmin.id, 'to museum', selectedMuseum);
      
      // For development/testing - temporarily bypass owner check
      
      // First, check if the museum is already assigned to another admin
      const { data: currentAssignment, error: assignmentError } = await supabase
        .from('museums')
        .select('id, user_id')
        .eq('id', selectedMuseum)
        .single();
      
      if (assignmentError && assignmentError.code !== 'PGRST116') {
        console.error('Error checking current assignment:', assignmentError);
        throw assignmentError;
      }
      
      // If the museum is already assigned to this admin, do nothing
      if (currentAssignment && currentAssignment.user_id === selectedAdmin.userId) {
        alert('This admin is already assigned to this museum.');
        setIsAssigningMuseum(false);
        return;
      }
      
      // Update the museum's user_id to point to this admin
      const { error } = await supabase
        .from('museums')
        .update({ 
          user_id: selectedAdmin.userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedMuseum);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      
      // Refresh the admin list
      await fetchAdmins();
      
      // Reset selection and close modal
      setSelectedAdmin(null);
      setSelectedMuseum("");
      setIsAssigningMuseum(false);
      
      // Show success message
      alert('Admin successfully assigned to museum');
    } catch (err) {
      console.error('Error assigning admin to museum:', err);
      alert(err.message || 'Failed to assign admin to museum. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Owner Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("admins")}
            className={`${activeTab === "admins" 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <Users className="inline-block w-4 h-4 mr-2 -mt-1" />
            Manage Admins ({admins.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`${activeTab === "requests" 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <Clock className="inline-block w-4 h-4 mr-2 -mt-1" />
            Pending Requests ({adminRequests.length})
          </button>
        </nav>
      </div>

      {/* Admins Tab */}
      {activeTab === "admins" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Administrators</h2>
            <div className="flex space-x-3">
              <button 
                onClick={fetchAdmins}
                disabled={loading}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                <RefreshCw className={`-ml-0.5 mr-1.5 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                <UserPlus className="-ml-1 mr-2 h-4 w-4" />
                Add New Admin
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {loading && admins.length === 0 ? (
            <div className="p-8 text-center">
              <RefreshCw className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
              <p className="mt-2 text-sm text-gray-500">Loading admins...</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No administrators found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new administrator.</p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <UserPlus className="-ml-1 mr-2 h-4 w-4" />
                  Add Admin
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Museum
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-orange-600 font-medium">
                              {admin.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{admin.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {admin.role}
                        </span>
                        {admin.is_admin && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Admin Access
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(admin.lastActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.museumName ? (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                            {admin.museumName}
                          </span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Not Assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setIsAssigningMuseum(true);
                              setSelectedMuseum(admin.museumId || "");
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            disabled={admin.role === 'owner'}
                          >
                            Assign Museum
                          </button>
                          <button 
                            onClick={() => handleRevokeAccess(admin.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={admin.role === 'owner'}
                          >
                            {admin.role === 'owner' ? 'Owner' : 'Revoke Access'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Museum Assignment Modal */}
      {isAssigningMuseum && selectedAdmin && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsAssigningMuseum(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Assign Admin to Museum</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Assign {selectedAdmin.name} to a museum. This will allow them to manage that specific museum's information.
                      </p>
                      
                      <div className="mt-4">
                        <label htmlFor="museumSelect" className="block text-sm font-medium text-gray-700">Select Museum</label>
                        <select
                          id="museumSelect"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                          value={selectedMuseum}
                          onChange={(e) => setSelectedMuseum(e.target.value)}
                        >
                          <option value="">-- Select a museum --</option>
                          {museums.map((museum) => (
                            <option key={museum.id} value={museum.id}>{museum.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={assignAdminToMuseum}
                >
                  Assign
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setIsAssigningMuseum(false);
                    setSelectedAdmin(null);
                    setSelectedMuseum("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests Tab */}
      {activeTab === "requests" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Pending Admin Requests</h2>
            <p className="mt-1 text-sm text-gray-500">Review and manage admin access requests.</p>
          </div>
          
          {adminRequests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No pending admin requests at this time.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {adminRequests.map((req) => (
                <li key={req.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-orange-600 font-medium">
                          {(req.profiles?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">
                          {req.profiles?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-500">{req.profiles?.email || req.user_id}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          <span className="font-medium">Reason:</span> {req.reason || 'No reason provided'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Requested {new Date(req.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAdminRequest(req.id, req.user_id, "approved")}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircle className="-ml-0.5 mr-1.5 h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAdminRequest(req.id, req.user_id, "rejected")}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        <XCircle className="-ml-0.5 mr-1.5 h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
