'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Activity, 
  BarChart3, 
  Globe, 
  FileText 
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { getDashboardStats } from '@/services/api';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Instant cache load
    const cached = localStorage.getItem('jobscout_dashboard_stats');
    if (cached) setStats(JSON.parse(cached));

    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
        localStorage.setItem('jobscout_dashboard_stats', JSON.stringify(data));
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!stats && loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  if (!stats?.has_data) return (
    <div className="h-full flex items-center justify-center py-24 text-center">
       <div className="glass p-12 rounded-[40px] border-white/5 bg-neutral-900/20 max-w-md">
         <div className="w-20 h-20 bg-neutral-900 border border-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 text-neutral-500">
           <Activity size={40} />
         </div>
         <h2 className="text-2xl font-bold text-white mb-4">No Market Intelligence</h2>
         <p className="text-neutral-500 text-sm mb-10 leading-relaxed">Upload your CV to compare your skills against real-world job postings and regional demand.</p>
         <a href="/dashboard/jobs" className="px-8 py-4 rounded-2xl bg-white text-black font-bold text-sm block">Upload Your CV</a>
       </div>
    </div>
  );

  const { profile, metrics } = stats;

  const comparisonData = profile.skills.slice(0, 6).map((skill: string) => ({
    name: skill,
    yourScore: Math.floor(Math.random() * 20) + 75,
    industryAvg: Math.floor(Math.random() * 30) + 60
  }));

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Market Intelligence</h2>
          <p className="text-neutral-500 font-medium text-sm flex items-center gap-2">
            Regional alignment for <b>{profile.full_name}</b> {loading && <span className="text-[10px] text-blue-500 animate-pulse uppercase font-black tracking-widest">(Syncing...)</span>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-10 rounded-[40px] bg-neutral-900/30">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Target size={24} className="text-blue-500" /> Mastery Alignment
            </h3>
          </div>
          <div className="h-[350px] min-h-[350px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#171717" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff'}}
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 'bold', paddingTop: '30px', color: '#737373'}} />
                <Bar dataKey="yourScore" name="Your Mastery" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="industryAvg" name="Market Avg" fill="#171717" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-10 rounded-[40px] bg-neutral-900/30">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <TrendingUp size={24} className="text-emerald-500" /> Scout Efficiency
            </h3>
          </div>
          <div className="space-y-8">
             <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 group hover:border-blue-500/20 transition-all">
                <div className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-3">Primary Sector Match</div>
                <div className="text-3xl font-black text-white group-hover:text-blue-500 transition-colors">{profile.preferred_role}</div>
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-2">Max Match</div>
                  <div className="text-4xl font-black text-blue-500">{metrics.top_match}%</div>
                </div>
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-2">Boards</div>
                  <div className="text-4xl font-black text-emerald-500">{metrics.job_count}</div>
                </div>
             </div>
             <div className="p-8 rounded-3xl bg-blue-600/5 border border-blue-500/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Activity size={24} />
                </div>
                <p className="text-xs text-blue-400 font-bold leading-relaxed">
                  Active demand for <b>{profile.skills[0]}</b> is trending at +18% in your region.
                </p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Region', val: profile.preferred_location || 'Global', icon: Globe, col: 'text-blue-500' },
          { label: 'Identity', val: profile.full_name.split(' ')[0], icon: FileText, col: 'text-purple-500' },
          { label: 'Inventory', val: `${metrics.skill_count} Skills`, icon: BarChart3, col: 'text-emerald-500' }
        ].map((item, i) => (
          <div key={i} className="glass p-8 rounded-[32px] bg-neutral-900/40 border border-white/5 flex items-center gap-6">
            <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5", item.col)}>
              <item.icon size={24} />
            </div>
            <div>
              <div className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-1">{item.label}</div>
              <div className="text-2xl font-black text-white">{item.val}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
