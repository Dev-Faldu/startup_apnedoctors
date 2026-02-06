'use client';

/**
 * ApneDoctors Voice AI - Complete Integration Example
 * This shows how to integrate all voice AI components into your Next.js app
 */

import { useState, useEffect } from 'react';
import { 
  VoiceAssistantModal, 
  FloatingVoiceButton, 
  CallHistory,
  LiveTranscript 
} from '@/components/VoiceComponents';
import { Activity, Phone, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function VoiceAIPage() {
  // State management
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const [liveTranscript, setLiveTranscript] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [stats, setStats] = useState({
    totalCalls: 0,
    emergencyCalls: 0,
    avgDuration: '0:00',
    satisfactionRate: 0
  });

  // Fetch call history on mount
  useEffect(() => {
    fetchCallHistory();
    fetchStats();
  }, []);

  const fetchCallHistory = async () => {
    try {
      const response = await fetch('/api/voice/call-history');
      const data = await response.json();
      setCallHistory(data);
    } catch (error) {
      console.error('Error fetching call history:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/voice/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStartCall = () => {
    setIsVoiceModalOpen(true);
    setIsLive(true);
  };

  const handleEndCall = () => {
    setIsVoiceModalOpen(false);
    setIsLive(false);
    fetchCallHistory(); // Refresh history after call
  };

  const handleEmergencyCall = async () => {
    // Track emergency call initiation
    await fetch('/api/voice/emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'current-user-id',
        timestamp: new Date().toISOString(),
        location: 'auto-detected-location'
      })
    });

    // Open voice modal immediately
    setIsVoiceModalOpen(true);
    setIsLive(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Voice AI Dashboard</h1>
                <p className="text-sm text-slate-600">Powered by APNE Intelligence</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleEmergencyCall}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5" />
                Emergency Help
              </button>
              <button
                onClick={handleStartCall}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Talk to APNE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Calls"
            value={stats.totalCalls}
            icon={<Phone className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Emergency Calls"
            value={stats.emergencyCalls}
            icon={<AlertCircle className="w-5 h-5" />}
            color="red"
          />
          <StatCard
            title="Avg Duration"
            value={stats.avgDuration}
            icon={<Clock className="w-5 h-5" />}
            color="indigo"
          />
          <StatCard
            title="Satisfaction"
            value={`${stats.satisfactionRate}%`}
            icon={<CheckCircle className="w-5 h-5" />}
            color="green"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Call History */}
          <div className="lg:col-span-2">
            <CallHistory calls={callHistory} />
          </div>

          {/* Right Column - Live Transcript */}
          <div className="lg:col-span-1">
            <LiveTranscript 
              transcript={liveTranscript} 
              isLive={isLive}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionButton
              title="Schedule Appointment"
              description="Book a doctor consultation"
              onClick={() => {/* Handle appointment */}}
              icon="📅"
            />
            <QuickActionButton
              title="Check Symptoms"
              description="Get AI health assessment"
              onClick={handleStartCall}
              icon="🩺"
            />
            <QuickActionButton
              title="Prescription Refill"
              description="Request medication renewal"
              onClick={() => {/* Handle refill */}}
              icon="💊"
            />
          </div>
        </div>

        {/* AI Features Info */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            🤖 APNE Voice AI Capabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <FeatureItem text="24/7 medical conversation support" />
            <FeatureItem text="Automatic emergency detection" />
            <FeatureItem text="Intelligent symptom collection" />
            <FeatureItem text="Real-time triage assessment" />
            <FeatureItem text="Appointment scheduling" />
            <FeatureItem text="Seamless doctor handoff" />
            <FeatureItem text="Multi-language support (coming)" />
            <FeatureItem text="Call recording & transcripts" />
          </div>
        </div>
      </div>

      {/* Voice Modal */}
      <VoiceAssistantModal 
        isOpen={isVoiceModalOpen}
        onClose={handleEndCall}
      />

      {/* Floating Button (always visible) */}
      <FloatingVoiceButton onClick={handleStartCall} />
    </div>
  );
}

// Helper Components

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600',
    green: 'from-green-500 to-green-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-600 mt-1">{title}</p>
    </div>
  );
}

function QuickActionButton({ title, description, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all duration-200 text-left group"
    >
      <div className="text-3xl">{icon}</div>
      <div className="flex-1">
        <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
          {title}
        </p>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </div>
    </button>
  );
}

function FeatureItem({ text }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
      <span className="text-slate-700">{text}</span>
    </div>
  );
}

// API Route Examples (create these in your Next.js app)
// 
// app/api/voice/call-history/route.ts:
// export async function GET() {
//   const calls = await db.query('SELECT * FROM calls ORDER BY timestamp DESC LIMIT 50');
//   return Response.json(calls);
// }
//
// app/api/voice/stats/route.ts:
// export async function GET() {
//   const stats = await db.query('SELECT COUNT(*) as total, AVG(duration) as avg_duration FROM calls');
//   return Response.json(stats);
// }
//
// app/api/voice/emergency/route.ts:
// export async function POST(request: Request) {
//   const body = await request.json();
//   await triggerEmergencyWorkflow(body);
//   return Response.json({ success: true });
// }
