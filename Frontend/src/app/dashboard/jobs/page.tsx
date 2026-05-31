'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, SlidersHorizontal, Rocket, AlertCircle, Terminal } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import ProfileCard from '@/components/ProfileCard';
import JobCard from '@/components/JobCard';
import { uploadCV, runAgent } from '@/services/api';
import { CandidateProfile, JobRecommendation } from '@/types';
import { toast } from 'sonner';

export default function JobsPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [cvText, setCvText] = useState('');
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [jobs, setJobs] = useState<JobRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [cvId, setCvId] = useState<string | null>(null);

  useEffect(() => {
    const savedCvText = localStorage.getItem('jobscout_cvText');
    const savedProfile = localStorage.getItem('jobscout_profile');
    const savedCvId = localStorage.getItem('jobscout_cvId');
    const savedStep = localStorage.getItem('jobscout_step');
    
    if (savedCvText && savedProfile) {
      setCvText(savedCvText);
      setProfile(JSON.parse(savedProfile));
      if (savedCvId) setCvId(savedCvId);
      // We only restore up to step 2 automatically so they can run agent again
      if (savedStep && parseInt(savedStep) >= 2) {
        setStep(2);
      }
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await uploadCV(file);
      setCvText(data.cv_text);
      setProfile(data.candidate_profile);
      setCvId(data.cv_id);
      
      localStorage.setItem('jobscout_cvText', data.cv_text);
      localStorage.setItem('jobscout_profile', JSON.stringify(data.candidate_profile));
      if (data.cv_id) localStorage.setItem('jobscout_cvId', data.cv_id);
      localStorage.setItem('jobscout_step', '2');
      
      if (!data.candidate_profile.full_name) {
        throw new Error("AI failed to extract profile data. Please try another file or ensure the text is clear.");
      }
      
      setStep(2);
    } catch (error: any) {
      console.error('Upload failed:', error);
      setError(error.message || "Failed to analyze CV. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmProfile = async (filter: string, updatedProfile?: CandidateProfile) => {
    const activeProfile = updatedProfile || profile;
    if (!activeProfile) return;
    setIsLoading(true);
    setError(null);
    
    // Neatly combine any custom filter with the global settings
    let finalFilter = filter ? filter.trim() : "";
    const savedSettings = localStorage.getItem('jobscout_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      const parts = [];
      if (parsed.jobType && parsed.jobType !== 'Remote Global') parts.push(parsed.jobType);
      if (parsed.experienceLevel) parts.push(parsed.experienceLevel);
      if (parsed.selectedCountry) parts.push(parsed.selectedCountry);
      if (parsed.jobTitles) parts.push(parsed.jobTitles);
      if (parsed.minSalary) parts.push("Salary: " + parsed.minSalary);
      
      const settingsStr = parts.join(", ");
      if (settingsStr) {
         finalFilter = finalFilter ? `${finalFilter}, ${settingsStr}` : settingsStr;
      }
    }

    try {
      const data = await runAgent(cvText, activeProfile, finalFilter);
      console.log("AGENT RESULTS:", data);
      setJobs(data.results || []);
      setProfile(activeProfile);
      localStorage.setItem('jobscout_profile', JSON.stringify(activeProfile));
      setStep(3);
      localStorage.setItem('jobscout_step', '3');
    } catch (error: any) {
      console.error('Agent run failed:', error);
      setError(error.message || "The AI Agent hit a snag while scouting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-12"
            >
              <div className="mb-12">
                <h2 className="text-3xl font-black text-white mb-2">Scout Jobs</h2>
                <p className="text-neutral-500 font-medium">Upload your latest CV to begin the autonomous search.</p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-8 p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-4"
                >
                  <AlertCircle size={24} />
                  {error}
                </motion.div>
              )}

              <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
            </motion.div>
          )}

          {step === 2 && profile && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="py-12"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">AI Profile Insights</h2>
                <button onClick={() => setStep(1)} className="text-sm font-bold text-neutral-500 hover:text-white">Back to Upload</button>
              </div>
              <ProfileCard 
                profile={profile} 
                onConfirm={handleConfirmProfile} 
                isLoading={isLoading} 
              />
              
              <div className="mt-8 p-6 rounded-3xl bg-neutral-900/30 border border-white/5">
                <h3 className="text-sm font-bold text-neutral-400 mb-4 flex items-center gap-2">
                  <Terminal size={16} />
                  Raw Extracted CV Text
                </h3>
                <div className="bg-black/50 rounded-2xl p-4 h-48 overflow-y-auto border border-white/5 text-xs text-neutral-500 font-mono whitespace-pre-wrap">
                  {cvText || "No raw text available."}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-12">
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">Recommended Roles</h2>
                  <p className="text-neutral-500 font-medium">Found {jobs.length} perfect matches based on your scout.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                   <button 
                    onClick={() => {
                      setStep(1);
                      localStorage.removeItem('jobscout_cvText');
                      localStorage.removeItem('jobscout_profile');
                      localStorage.removeItem('jobscout_cvId');
                      localStorage.removeItem('jobscout_step');
                      toast.info("Search reset. You can upload a new CV or change settings.");
                    }} 
                    className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-blue-500 transition-colors whitespace-nowrap shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    New Search
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {jobs.length > 0 ? (
                  jobs.map((job, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <JobCard job={job} cvId={cvId} />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-900 border border-white/5 mb-6 text-neutral-500">
                      <Search size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Jobs Found As Per Your Criteria</h3>
                    <p className="text-neutral-500 max-w-md mx-auto mb-8">
                      We couldn't find any positions that strictly match your filter. Please try adjusting your criteria or try a new search.
                    </p>
                    <button 
                      onClick={() => {
                        setStep(2);
                        localStorage.setItem('jobscout_step', '2');
                      }} 
                      className="px-6 py-3 rounded-xl bg-neutral-900 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-lg active:scale-95"
                    >
                      Change Filter & Try Again
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
