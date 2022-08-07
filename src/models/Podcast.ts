export type Podcast = {
  id: number;
  itunes_id?: number;
  title: string;
  author: string;
  description?: string;
  artwork_url: string;
  feed_url: string;
  categories?: number[];
  last_fetched_episodes: string;
  created_at: string;
  updated_at: string;
};
