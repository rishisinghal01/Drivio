"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Partner {
  _id: string;
  name: string;
  email: string;
  partnerOnboardingStep: number;
  createdAt: string;
}

export default function AdminPartnersDashboard() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/partners");
      if (res.data.success) {
        setPartners(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch partners", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (step: number) => {
    if (step < 3) return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Incomplete Forms</span>;
    if (step === 3) return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Docs Pending</span>;
    if (step === 4) return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Ready for Video KYC</span>;
    if (step === 5) return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Video KYC Pending</span>;
    if (step === 6) return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Waiting for Pricing</span>;
    if (step === 7) return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">Final Verification Pending</span>;
    if (step >= 8) return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Active Partner</span>;
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Unknown</span>;
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Unified Partner Dashboard</h1>
      
      {loading ? (
        <p>Loading partners...</p>
      ) : partners.length === 0 ? (
        <p className="text-gray-500">No partners found.</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {partners.map((partner) => (
                <tr key={partner._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{partner.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{partner.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getStatusLabel(partner.partnerOnboardingStep)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/admin/partners/${partner._id}`)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-4 py-2 rounded-md font-semibold"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
