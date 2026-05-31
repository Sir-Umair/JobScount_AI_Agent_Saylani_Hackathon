import React, { useState } from 'react';
import { User, MapPin, Briefcase, GraduationCap, Code, CheckCircle2, ChevronRight, ArrowRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { CandidateProfile } from '../types';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  profile: CandidateProfile;
  onConfirm: (filter: string, updatedProfile: CandidateProfile) => void;
  isLoading: boolean;
}

export default function ProfileCard({ profile, onConfirm, isLoading }: ProfileCardProps) {
  const [filter, setFilter] = useState('');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [locationValue, setLocationValue] = useState(profile.preferred_location || '');
  const [roleValue, setRoleValue] = useState(profile.preferred_role || '');
  const [skills, setSkills] = useState(profile.skills || []);
  const [newSkill, setNewSkill] = useState('');
  
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      if (!skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
      }
      setNewSkill('');
    }
  };

  return (
    <div className="glass overflow-hidden rounded-3xl border-white/5 bg-neutral-900/30">
      <div className="p-5 md:p-12">
        <div className="flex flex-col md:flex-row md:items-center gap-8 mb-8 md:mb-12">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <User className="w-10 h-10 md:w-12 md:h-12" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white mb-2">
              {profile.full_name || 'Anonymous Talent'}
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              {isEditingRole ? (
                <input 
                  type="text" 
                  value={roleValue}
                  onChange={(e) => setRoleValue(e.target.value)}
                  onBlur={() => setIsEditingRole(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingRole(false)}
                  autoFocus
                  className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-widest border border-blue-500/50 outline-none"
                />
              ) : (
                <span 
                  onClick={() => setIsEditingRole(true)}
                  className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20 cursor-pointer hover:bg-blue-500/20 transition-colors"
                  title="Click to edit"
                >
                  {roleValue || 'Developer'}
                </span>
              )}
              
              {isEditingLocation ? (
                <input 
                  type="text" 
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                  onBlur={() => setIsEditingLocation(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingLocation(false)}
                  autoFocus
                  className="bg-neutral-800 text-white text-sm font-medium border border-neutral-600 rounded px-2 py-0.5 outline-none"
                />
              ) : (
                <span 
                  onClick={() => setIsEditingLocation(true)}
                  className="flex items-center gap-1.5 text-neutral-500 text-sm font-medium cursor-pointer hover:text-white transition-colors"
                  title="Click to edit"
                >
                  <MapPin size={14} /> {locationValue || 'Remote'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-12">
            <section>
              <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Code size={14} className="text-blue-500" /> Core Skills
              </h3>
              <div className="flex flex-wrap gap-2 items-center">
                {skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl bg-white/5 text-neutral-300 text-xs font-semibold border border-white/5 hover:border-red-500/30 hover:text-red-400 cursor-pointer transition-colors group flex items-center gap-1" onClick={() => handleRemoveSkill(skill)} title="Click to remove">
                    {skill}
                    <span className="hidden group-hover:inline text-[10px]">×</span>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="+ Add skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                  className="px-3 py-1.5 rounded-xl bg-transparent border border-white/10 text-neutral-300 text-xs font-semibold outline-none focus:border-blue-500/50 w-24 placeholder:text-neutral-600"
                />
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Briefcase size={14} className="text-blue-500" /> Experience
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed font-medium">
                {profile.experience}
              </p>
            </section>
          </div>

          <div className="space-y-12">
            <section>
              <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <GraduationCap size={14} className="text-blue-500" /> Education
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed font-medium">
                {profile.education}
              </p>
            </section>

            {profile.certifications && profile.certifications.length > 0 && (
              <section>
                <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" /> Certifications
                </h3>
                <div className="space-y-2">
                  {profile.certifications.map((cert, i) => (
                    <div key={i} className="text-neutral-400 text-sm font-medium flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-emerald-500" />
                      {cert}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-5 md:py-6 bg-white/5 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        <div className="flex-1 w-full relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={16} className="text-neutral-500" />
          </div>
          <input
            type="text"
            placeholder="Any specific preferences? (e.g. Remote, Senior)"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-xs md:text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <button 
          onClick={() => {
            const updatedProfile: CandidateProfile = {
              ...profile,
              preferred_location: locationValue,
              preferred_role: roleValue,
              skills: skills
            };
            onConfirm(filter, updatedProfile);
          }} 
          disabled={isLoading}
          className={cn(
            "w-full md:w-auto group flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-black font-bold text-xs md:text-sm transition-all hover:bg-neutral-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
            isLoading && "animate-pulse"
          )}
        >
          {isLoading ? 'Agent Analyzing...' : 'Initialize Search Agent'}
          <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
        </button>
      </div>
    </div>
  );
}


