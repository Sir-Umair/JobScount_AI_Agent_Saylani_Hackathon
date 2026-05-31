import axios from 'axios';
import { UploadResponse, AgentResponse, CandidateProfile } from '../types';

// Always use localhost for local dev; hostname-based only needed for LAN/hackathon sharing
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:8000';
  const hostname = window.location.hostname;
  // Use localhost explicitly to avoid IPv6/DNS resolution issues on Windows
  return `http://${hostname === 'localhost' || hostname === '127.0.0.1' ? 'localhost' : hostname}:8000`;
};

const API_BASE_URL = getApiBaseUrl();

// Shared axios instance with timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const uploadCV = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post<UploadResponse>('/upload-cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // CV upload can take longer
    });
    return response.data;
  } catch (error: any) {
    const detail = error?.response?.data?.detail;
    const msg = (typeof detail === 'object' && detail !== null) ? detail.message : detail || error.message || 'Error uploading CV';
    throw new Error(msg);
  }
};

export const runAgent = async (cvText: string, profile: CandidateProfile, filter: string = ""): Promise<AgentResponse> => {
  try {
    const response = await api.post<AgentResponse>('/run-agent', {
      cv_text: cvText,
      candidate_profile: profile,
      output_format: 'json',
      filter: filter,
    }, { timeout: 180000 }); // Agent can take up to 3 minutes (concurrent searches + evaluations)
    return response.data;
  } catch (error: any) {
    const msg = error?.response?.data?.detail || error.message || 'Error running agent';
    throw new Error(msg);
  }
};

export const sendChatMessage = async (message: string): Promise<{ role: string; content: string }> => {
  try {
    const response = await api.post('/chat', { message });
    return response.data;
  } catch (error) {
    const err = error as any;
    const msg = err?.response?.data?.detail || err.message || 'Network error while contacting chat endpoint';
    throw new Error(msg);
  }
};

export const getDashboardStats = async (): Promise<any> => {
  try {
    const response = await api.get('/dashboard-stats', { timeout: 10000 });
    return response.data;
  } catch (error: any) {
    // Network error = backend is down, return graceful empty state (don't throw)
    if (!error?.response) {
      console.warn("Dashboard Stats: Backend unreachable — showing empty state.");
      return { has_data: false, message: "Backend server is not reachable. Please ensure it is running on port 8000." };
    }
    // Server returned an error response — still return empty state gracefully
    console.error("Dashboard Stats Error:", error?.response?.data || error.message);
    return { has_data: false, message: error?.response?.data?.detail || error.message };
  }
};

export const saveJob = async (cvId: string, job: any): Promise<any> => {
  try {
    const response = await api.post('/save-job', { cv_id: cvId, job });
    return response.data;
  } catch (error) {
    console.error("Save Job Error:", error);
    throw error;
  }
};

export const getSavedJobs = async (cvId: string): Promise<any> => {
  if (!cvId) {
    console.warn('getSavedJobs called without cvId – returning empty list');
    return { saved_jobs: [] };
  }
  try {
    const response = await api.get(`/saved-jobs/${cvId}`);
    return response.data;
  } catch (error) {
    console.warn('Saved Jobs unreachable, returning empty list.', error);
    return { saved_jobs: [] };
  }
};

export const deleteJob = async (cvId: string, jobUrl: string): Promise<any> => {
  try {
    const response = await api.delete('/delete-job', {
      data: { cv_id: cvId, job_url: jobUrl }
    });
    return response.data;
  } catch (error) {
    console.error("Delete Job Error:", error);
    throw error;
  }
};

