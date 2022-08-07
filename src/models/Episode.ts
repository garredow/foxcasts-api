export type Episode = {
  id: number;
  podcast_id: number;
  date: string;
  title: string;
  description?: string;
  duration: number;
  file_size: number;
  file_type: string;
  file_url: string;
  chapters_url?: string;
  transcript_url?: string;
  season?: number;
  episode?: number;
  episode_type?: string;
  created_at: string;
  updated_at: string;
};
