import { useState } from "react";
import { Trophy, Users, Upload, MessageSquare } from "lucide-react";
import logo from "./assets/logo.png";

export default function EducatorDashboard() {
  const [activeTab, setActiveTab] = useState("leaderboard");

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-navy-950 text-white p-6">
        <div className="flex items-center gap-3 mb-8">
          <img src={logo} alt="logo" className="w-8 h-8" />

          <div>
            <h1 className="text-lg font-bold text-emerald-400">
              StudyBuddy
            </h1>

            <p className="text-sm text-gray-300">
              Educator Dashboard
            </p>
          </div>
        </div>

        <ul className="space-y-4">

          <li
            className="cursor-pointer hover:text-emerald-400"
            onClick={() => setActiveTab("leaderboard")}
          >
            <div className="flex items-center gap-2">
              <Trophy size={18} /> Leaderboard
            </div>
          </li>

          <li
            className="cursor-pointer hover:text-emerald-400"
            onClick={() => setActiveTab("students")}
          >
            <div className="flex items-center gap-2">
              <Users size={18} /> Connect Students
            </div>
          </li>

          <li
            className="cursor-pointer hover:text-emerald-400"
            onClick={() => setActiveTab("resources")}
          >
            <div className="flex items-center gap-2">
              <Upload size={18} /> Upload Resources
            </div>
          </li>

          <li
            className="cursor-pointer hover:text-emerald-400"
            onClick={() => setActiveTab("messages")}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={18} /> Announcements
            </div>
          </li>

        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">

        {activeTab === "leaderboard" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Student Leaderboard</h2>

            <table className="w-full bg-white rounded shadow">
              <thead>
                <tr className="bg-emerald-500 text-white">
                  <th className="p-3">Rank</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Points</th>
                </tr>
              </thead>

              <tbody>
                <tr className="text-center border-b">
                  <td>1</td>
                  <td>Rahul</td>
                  <td>11</td>
                  <td>240</td>
                </tr>

                <tr className="text-center border-b">
                  <td>2</td>
                  <td>Khyati</td>
                  <td>11</td>
                  <td>220</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "students" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Connect with Students</h2>

            <textarea
              className="w-full p-3 border rounded mb-4"
              placeholder="Write message to students..."
            />

            <button className="bg-emerald-500 text-white px-4 py-2 rounded">
              Send Message
            </button>
          </div>
        )}

        {activeTab === "resources" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Upload Resources</h2>

            <input
              type="text"
              placeholder="Resource Title"
              className="border p-2 w-full mb-3 rounded"
            />

            <textarea
              placeholder="Description"
              className="border p-2 w-full mb-3 rounded"
            />

            <input
              type="file"
              className="mb-4"
            />

            <button className="bg-emerald-500 text-white px-4 py-2 rounded">
              Upload
            </button>
          </div>
        )}

        {activeTab === "messages" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Announcements</h2>

            <textarea
              className="w-full p-3 border rounded mb-4"
              placeholder="Write announcement..."
            />

            <button className="bg-emerald-500 text-white px-4 py-2 rounded">
              Publish
            </button>
          </div>
        )}

      </div>
    </div>
  );
}