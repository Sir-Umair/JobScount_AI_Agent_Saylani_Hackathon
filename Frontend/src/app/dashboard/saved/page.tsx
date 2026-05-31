'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Briefcase, MapPin, ExternalLink, Search, Trash2 } from 'lucide-react';
import { getSavedJobs, deleteJob } from '@/services/api';
import { toast } from 'sonner';
import { formatApplyUrl, getWebSearchUrl } from '@/lib/utils';

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cvId, setCvId] = useState<string | null>(null);

  useEffect(() => {
    const savedCvId = localStorage.getItem('jobscout_cvId');
    if (savedCvId) {
      setCvId(savedCvId);
      fetchSavedJobs(savedCvId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSavedJobs = async (id: string) => {
    try {
      const res = await getSavedJobs(id);
      if (res && res.saved_jobs) {
        setJobs(res.saved_jobs);
      }
    } catch (err) {
      console.error('Failed to fetch saved jobs:', err);
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobUrl: string) => {
    if (!cvId) return;
    try {
      await deleteJob(cvId, jobUrl);
      setJobs(jobs.filter(j => j.job_url !== jobUrl));
      toast.success('Job removed from saved list');
    } catch (err) {
      toast.error('Failed to remove job');
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Retrieving Saved Records...</span>
      </div>
    </div>
  );

  if (!cvId) return (
    <div className="h-full flex items-center justify-center py-24 text-center">
       <div className="glass p-12 rounded-[40px] border-white/5 bg-neutral-900/20 max-w-md">
         <div className="w-20 h-20 bg-neutral-900 border border-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 text-neutral-500">
           <Star size={40} />
         </div>
         <h2 className="text-2xl font-black text-white mb-4 tracking-tight">No Active Session</h2>
         <p className="text-neutral-500 text-sm mb-10 leading-relaxed font-medium">Please upload your CV first to begin saving your favorite job matches.</p>
         <a href="/dashboard/jobs" className="px-10 py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-white/5 hover:scale-105 transition-all">
           Go to Scout
         </a>
       </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Saved Job Matches</h2>
        <p className="text-neutral-500 font-medium text-sm">You have {jobs.length} roles waiting for your application.</p>
      </div>

      {jobs.length === 0 ? (
        <div className="py-24 text-center glass rounded-[40px] border-white/5 bg-neutral-900/20">
          <div className="w-16 h-16 bg-neutral-900 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-neutral-600">
            <Search size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Your saved list is empty</h3>
          <p className="text-neutral-500 text-sm max-w-xs mx-auto mb-8">Start scouting for jobs and click the star icon to save roles you're interested in.</p>
          <a href="/dashboard/jobs" className="px-8 py-3 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all">
            Find Jobs Now
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job, idx) => {
            const formattedUrl = formatApplyUrl(job.job_url);
            const searchUrl = getWebSearchUrl(job.title, job.company, job.location);
            const applyUrl = formattedUrl || searchUrl;

            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass p-8 rounded-[32px] bg-neutral-900/40 border-white/5 group hover:bg-neutral-900/60 transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{job.title}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium">
                        <Briefcase size={14} className="text-neutral-600" /> {job.company}
                      </div>
                      <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium">
                        <MapPin size={14} className="text-neutral-600" /> {job.location}
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest">
                    {job.match_percentage}% MATCH
                  </div>
                </div>

                <div className="flex gap-3 pt-6 mt-6 border-t border-white/5 items-center">
                  <a 
                    href={applyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-[2] px-4 py-3 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-neutral-200 transition-all active:scale-95"
                  >
                    Apply Now <ExternalLink size={14} />
                  </a>
                  <a 
                    href={searchUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title="Search on Google"
                    className="flex-1 px-3 py-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Search size={14} /> Search
                  </a>
                  <button 
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0 active:scale-95"
                    onClick={() => handleDelete(job.job_url)}
                    title="Remove Job"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
