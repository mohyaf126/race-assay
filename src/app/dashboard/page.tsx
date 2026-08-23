'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [badges, setBadges] = useState<any[]>([]);
  const [table, setTable] = useState<any[]>([]);
  const [chart, setChart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const router = useRouter();

  const fetchDashboardData = useCallback(async () => {
    try {
      console.log('Fetching dashboard data...');
      // Fetch all three endpoints concurrently
      // This is the core of the race condition! If token is expired, 3 concurrent 401s happen.
      const [badgesRes, tableRes, chartRes] = await Promise.all([
        api.get('/dashboard/badges'),
        api.get('/dashboard/table'),
        api.get('/dashboard/chart')
      ]);

      setBadges(badgesRes.data);
      setTable(tableRes.data);
      setChart(chartRes.data);
    } catch (error) {
      // The interceptor will handle token refresh failures
      // Silently fail here to prevent Next.js from throwing a full-screen error overlay
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (loading) return; // Don't start countdown until initial load is done

    // The token expires in 60 seconds (1 min)
    // The dashboard refreshes every 90 seconds
    // Therefore, the first refresh will hit an expired token
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchDashboardData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, fetchDashboardData]);

  const getIcon = (title: string) => {
    switch (title) {
      case 'Total Users': return <Users className="w-6 h-6 text-blue-400" />;
      case 'Revenue': return <DollarSign className="w-6 h-6 text-green-400" />;
      case 'Active Sessions': return <Activity className="w-6 h-6 text-purple-400" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400 mt-1">Auto-refreshing in {countdown} seconds</p>
          </div>
          <button 
            onClick={() => router.push('/login')}
            className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Badges Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <div key={badge.id} className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{badge.title}</p>
                <h3 className="text-3xl font-bold">{badge.value}</h3>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                {getIcon(badge.title)}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl lg:col-span-2">
            <h3 className="text-xl font-bold mb-6">User Activity Overview</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#F9FAFB' }}
                  />
                  <Line type="monotone" dataKey="uv" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="pv" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold">Recent Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-800 text-gray-400 text-sm">
                  <tr>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {table.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{row.name}</td>
                      <td className="px-6 py-4 text-gray-400">{row.role}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
