import { createClient } from '@supabase/supabase-js';

// Project URL and anon key from your Supabase project.
// Replace them with your actual values or use environment variables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ptwqjjywguqthwuucnas.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const STORAGE_BUCKET = 'call_recordings';

// Types for our database models
export type Company = {
  id: string;
  user_id: string;
  name: string;
  segment: string;
  product_details: string;
  target_audience: string;
  advantages: string;
  differentiation: string;
  created_at: string;
};

export type CallAnalysis = {
  id: string;
  user_id: string;
  company_id: string;
  analysis_type: 'sales' | 'sales_followup' | 'appointment_setting' | 'appointment_followup' | 'service';
  recording_url: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  report_data: {
    analysis?: Array<{parameter: string, text: string, score: number}>;
    summary?: {
      totalScore?: number;
      strengths?: string[];
      improvements?: string[];
      recommendations?: string[];
    };
    error?: string;
  };
  metadata?: {
    processing_stage?: string;
    [key: string]: any;
  };
  transcription: string;
  created_at: string;
  updated_at: string;
  company?: any; // Added for relation with company
};

export type Playbook = {
  id: string;
  company_id: string;
  type: 'sales' | 'service';
  name: string;
  content: any; // This would be a more complex structure based on playbook content
  created_at: string;
}; 