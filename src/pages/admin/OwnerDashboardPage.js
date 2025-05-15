import React from "react";
import { Link } from "react-router-dom";

export function OwnerDashboardPage({ adminRequests, handleAdminRequest }) {
  return (
    <div className="p-6 bg-white min-h-screen text-orange-900">
      <h2 className="text-3xl font-bold mb-6 text-orange-600">Owner Dashboard</h2>

      <section>
        <h3 className="text-xl font-semibold mb-4">Pending Admin Requests</h3>
        {adminRequests.length === 0 ? (
          <div className="text-gray-500">No pending admin requests.</div>
        ) : (
          <ul className="space-y-4">
            {adminRequests.map((req) => (
              <li
                key={req.id}
                className="border border-orange-200 bg-orange-50 rounded-lg p-4 shadow-sm"
              >
                <div className="font-semibold text-lg">
                  {req.profiles?.name || req.user_id}{" "}
                  <span className="text-sm text-gray-600">
                    ({req.profiles?.email})
                  </span>
                </div>
                <div className="text-sm mt-1">
                  <span className="font-medium">Reason:</span> {req.reason}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Requested: {new Date(req.created_at).toLocaleString()}
                </div>
                <div className="mt-3 space-x-2">
                  <button
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                    onClick={() => handleAdminRequest(req.id, req.user_id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="border border-orange-500 text-orange-600 px-4 py-2 rounded hover:bg-orange-100"
                    onClick={() => handleAdminRequest(req.id, req.user_id, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h3 className="text-xl font-semibold mb-4">Admin Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link to="/add-museum">
            <button className="border border-orange-500 text-orange-600 px-4 py-2 rounded hover:bg-orange-50">
              Add Museum
            </button>
          </Link>
          <Link to="/create-quiz">
            <button className="border border-orange-500 text-orange-600 px-4 py-2 rounded hover:bg-orange-50">
              Create Quiz
            </button>
          </Link>
          <Link to="/edit-rewards">
            <button className="border border-orange-500 text-orange-600 px-4 py-2 rounded hover:bg-orange-50">
              Edit Rewards
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
