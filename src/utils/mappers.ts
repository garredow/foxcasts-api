import { PIApiEpisodeInfo, PIApiFeed, PIApiPodcast } from 'podcastdx-client/dist/src/types';
import { Category, Episode, Podcast, SearchResult } from '../models';

export function toSearchResult(source: PIApiFeed): SearchResult {
  return {
    id: source.id,
    title: source.title,
    author: source.author,
    feed_url: source.url,
    artwork_url: source.artwork || source.image,
    image_url_hash: source.imageUrlHash,
  };
}

export function toPodcast(source: PIApiPodcast): Podcast {
  const result: Podcast = {
    id: source.id,
    itunes_id: source.itunesId || undefined,
    title: source.title,
    author: source.author,
    description: source.description,
    artwork_url: source.artwork,
    feed_url: source.url,
    categories: source.categories ? Object.keys(source.categories).map((a) => Number(a)) : [],
    last_fetched_episodes: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return result;
}

export function toEpisode(source: PIApiEpisodeInfo): Episode {
  const result: Episode = {
    id: source.id,
    podcast_id: source.feedId,
    date: new Date(source.datePublished * 1000).toISOString(),
    title: source.title,
    description: source.description,
    duration: source.duration,
    file_size: source.enclosureLength,
    file_type: source.enclosureType,
    file_url: source.enclosureUrl,
    chapters_url: source.chaptersUrl ?? undefined,
    transcript_url: source.transcriptUrl ?? undefined,
    season: source.season ?? undefined,
    episode: source.episode ?? undefined,
    episode_type: source.episodeType ?? undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return result;
}

export function toCategory(source: Pick<Category, 'id' | 'name'>): Category {
  const result: Category = {
    id: source.id,
    name: source.name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return result;
}
