'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Briefcase, 
  User, 
  MapPin, 
  Laptop,
  CheckCircle2,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');
  const [selectedCountry, setSelectedCountry] = useState('Pakistan');
  const [jobType, setJobType] = useState('Remote');
  const [experienceLevel, setExperienceLevel] = useState('Mid Level');
  const [minSalary, setMinSalary] = useState('');
  const [jobTitles, setJobTitles] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('jobscout_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedCountry(parsed.selectedCountry || 'Pakistan');
      setJobType(parsed.jobType || 'Remote');
      setExperienceLevel(parsed.experienceLevel || 'Mid Level');
      setMinSalary(parsed.minSalary || '');
      setJobTitles(parsed.jobTitles || '');
    }
  }, []);

  const handleSave = () => {
    const config = { selectedCountry, jobType, experienceLevel, minSalary, jobTitles };
    localStorage.setItem('jobscout_settings', JSON.stringify(config));
    toast.success('Agent configuration saved successfully!');
  };

  const tabs = [
    { label: 'General', icon: User },
    { label: 'Search Filters', icon: Globe }
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:py-8 space-y-8 md:space-y-12">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">Agent Configuration</h2>
        <p className="text-neutral-500 font-medium text-xs md:text-sm">Tune your AI scout's behavior and search parameters.</p>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-8">
        {/* Navigation Tabs */}
        <aside className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-3 md:pb-0 md:space-y-1 no-scrollbar border-b border-white/5 md:border-none">
          {tabs.map((item, i) => (
            <button 
              key={i} 
              onClick={() => setActiveTab(item.label)}
              className={`flex-1 md:w-full flex items-center justify-center md:justify-start gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-xs md:text-sm whitespace-nowrap ${
              activeTab === item.label ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-neutral-500 hover:text-white hover:bg-white/[0.02]'
            }`}>
              <item.icon size={16} className="md:w-[18px] md:h-[18px]" /> {item.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="md:col-span-2 space-y-6 md:space-y-8">
          {activeTab === 'General' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 md:space-y-8">
              {/* Job Titles Card */}
              <section className="glass p-6 md:p-8 rounded-3xl bg-neutral-900/30 border border-white/5 shadow-xl">
                <h3 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
                  <User size={18} className="text-blue-500" /> Basic Preferences
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 block">Preferred Job Titles</label>
                    <input 
                      type="text" 
                      value={jobTitles}
                      onChange={(e) => setJobTitles(e.target.value)}
                      placeholder="e.g. Frontend Developer, React Native Engineer"
                      className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
              </section>

              {/* Target Regions Card */}
              <section className="glass p-6 md:p-8 rounded-3xl bg-neutral-900/30 border border-white/5 shadow-xl">
                <h3 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
                  <Globe size={18} className="text-blue-500" /> Target Regions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Pakistan', 'United States', 'United Kingdom', 'United Arab Emirates', 'Germany', 'Remote Global'].map((country) => (
                    <button 
                      key={country}
                      onClick={() => setSelectedCountry(country)}
                      className={`px-4 py-3 rounded-xl border text-xs md:text-sm font-bold transition-all flex items-center justify-between ${
                        selectedCountry === country 
                        ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' 
                        : 'bg-neutral-950 border-white/5 text-neutral-500 hover:border-white/10'
                      }`}
                    >
                      {country}
                      {selectedCountry === country && <CheckCircle2 size={14} />}
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'Search Filters' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 md:space-y-8">
              {/* Salary Filter Card */}
              <section className="glass p-6 md:p-8 rounded-3xl bg-neutral-900/30 border border-white/5 shadow-xl">
                <h3 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
                  <DollarSign size={18} className="text-emerald-500" /> Compensation Threshold
                </h3>
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 block">Minimum Annual/Monthly Salary</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-neutral-500" />
                    </div>
                    <input 
                      type="text" 
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                      placeholder="e.g. $80,000 or Rs. 150,000"
                      className="w-full bg-neutral-950 border border-white/5 rounded-xl px-4 py-3 pl-10 text-xs md:text-sm text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-2">The AI Agent will strictly filter out any positions offering compensation below this threshold.</p>
                </div>
              </section>

              {/* Employment Preference Card */}
              <section className="glass p-6 md:p-8 rounded-3xl bg-neutral-900/30 border border-white/5 shadow-xl">
                <h3 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
                  <Briefcase size={18} className="text-purple-500" /> Employment Preference
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 'Full-time', label: 'Full-time Positions' },
                    { id: 'Remote', label: 'Remote Only' },
                    { id: 'Contract', label: 'Contract / Freelance' }
                  ].map((type) => (
                    <button 
                      key={type.id}
                      onClick={() => setJobType(type.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                        jobType === type.id 
                        ? 'bg-purple-600/10 border-purple-500/50 text-purple-400' 
                        : 'bg-neutral-950 border-white/5 text-neutral-500 hover:border-white/10'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        jobType === type.id ? 'bg-purple-500/20' : 'bg-white/5'
                      }`}>
                        {type.id === 'Remote' ? <Laptop size={18} /> : <Briefcase size={18} />}
                      </div>
                      <div className="flex-1 font-bold text-xs md:text-sm">{type.label}</div>
                      {jobType === type.id && <CheckCircle2 size={16} />}
                    </button>
                  ))}
                </div>
              </section>

              {/* Experience Level Card */}
              <section className="glass p-6 md:p-8 rounded-3xl bg-neutral-900/30 border border-white/5 shadow-xl">
                <h3 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-500" /> Experience Level
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Entry Level', 'Mid Level', 'Senior', 'Lead / Staff'].map((lvl) => (
                    <button 
                      key={lvl}
                      onClick={() => setExperienceLevel(lvl)}
                      className={`px-4 py-3 rounded-xl border text-xs md:text-sm font-bold transition-all flex items-center justify-between ${
                        experienceLevel === lvl 
                        ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-400' 
                        : 'bg-neutral-950 border-white/5 text-neutral-500 hover:border-white/10'
                      }`}
                    >
                      {lvl}
                      {experienceLevel === lvl && <CheckCircle2 size={14} />}
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs md:text-sm shadow-xl shadow-blue-500/20 transition-all active:scale-95" onClick={handleSave}>
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
