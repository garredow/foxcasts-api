import fetch from 'node-fetch';
import Vibrant from 'node-vibrant';
import PodcastIndexClient from 'podcastdx-client';
import sharp from 'sharp';
import { Database } from '../database/db';
import { config } from '../lib/config';
import { Episode, Health, Palette, Podcast, SearchResult, User } from '../models';
import { toEpisode, toPodcast, toSearchResult } from '../utils/mappers';
// import { toSearchResult } from '../utils/mappers';
const { version: apiVersion } = require('../../package.json');

export class Data {
  db: Database;
  podcastIndex: PodcastIndexClient;

  constructor(db?: Database) {
    this.db = db ?? new Database();
    this.podcastIndex = new PodcastIndexClient({
      key: config.podcastIndex.apiKey,
      secret: config.podcastIndex.apiSecret,
      disableAnalytics: true,
    });
  }

  artwork = {
    getUrl: async (podcastId: number): Promise<string | undefined> => {
      const podcast = await this.db.getPodcastById(podcastId);
      return podcast?.artwork_url;
    },
    getImageData: async (
      podcastId: number,
      size: number,
      blur: number
    ): Promise<string | undefined> => {
      const podcast = await this.podcast.getById(podcastId);
      if (!podcast || !podcast.artwork_url) return;

      const image = await fetch(podcast.artwork_url).then((res) => res.buffer());
      const artwork = sharp(image).resize(size);
      if (blur > 0) {
        artwork.blur(blur);
      }
      const result = await artwork.png().toBuffer();
      return `data:image/png;base64,${await result.toString('base64')}`;
    },
    getPalette: async (podcastId: number): Promise<Palette | undefined> => {
      const existing = await this.db.getPaletteByPodcastId(podcastId);
      if (existing) return existing;

      const podcast = await this.podcast.getById(podcastId);
      if (!podcast) return;

      const image = await fetch(podcast.artwork_url).then((res) => res.buffer());
      const palette = await Vibrant.from(image).getPalette();

      const result = await this.db.addPalette(podcastId, {
        dark_muted: palette.DarkMuted?.hex,
        dark_vibrant: palette.DarkVibrant?.hex,
        light_muted: palette.LightMuted?.hex,
        light_vibrant: palette.LightVibrant?.hex,
        muted: palette.Muted?.hex,
        vibrant: palette.Vibrant?.hex,
      });

      return result;
    },
  };

  episode = {
    getById: async (id: number): Promise<Episode | undefined> => {
      const existing = await this.db.getEpisodeById(id);
      if (existing) {
        return existing;
      }

      const res = await this.podcastIndex.episodeById(id, { fulltext: true });
      return this.db.addEpisode(toEpisode(res.episode));
    },
    getEpisodeProgress: (userId: string, episodeId: number): Promise<number> => {
      return this.db.getEpisodeProgress(userId, episodeId);
    },
    setEpisodeProgress: async (
      userId: string,
      episodeId: number,
      progress: number
    ): Promise<null> => {
      await this.db.setEpisodeProgress(userId, episodeId, progress);
      return null;
    },
    getRecent: async (podcastId: number, count = 20): Promise<Episode[]> => {
      let episodes = await this.db.getRecentEpisodes(podcastId, count);

      if (episodes.length === 0) {
        const res = await this.podcastIndex.episodesByFeedId(podcastId, {
          max: 500,
          fulltext: true,
        });
        await this.db.addEpisodes(res.items.map((a) => toEpisode(a)));
        episodes = await this.db.getRecentEpisodes(podcastId, count);
      }

      return episodes;
    },
  };

  podcast = {
    search: (query: string, count = 30): Promise<SearchResult[]> => {
      return this.podcastIndex
        .search(query, { max: count })
        .then((res) => res.feeds.map((a) => toSearchResult(a)));
    },
    getById: async (id: number): Promise<Podcast | undefined> => {
      let podcast = await this.db.getPodcastById(id);

      if (!podcast) {
        const res = await this.podcastIndex.podcastById(id);
        podcast = await this.db.addPodcast(toPodcast(res.feed));
      }

      return podcast;
    },
    getByIds: async (ids: number[]): Promise<Podcast[]> => {
      const dbPodcasts = await this.db.getPodcastsByIds(ids);

      const dbIds = dbPodcasts.map((a) => a.id);
      const otherIds = ids.filter((a) => !dbIds.includes(a));

      if (otherIds.length > 0) {
        for (const id of otherIds) {
          const piRes = await this.podcastIndex.podcastById(id);
          const res = await this.db.addPodcast(toPodcast(piRes.feed));
          dbPodcasts.push(res);
        }
      }

      return dbPodcasts;
    },
    getByUserId: async (userId: string): Promise<Podcast[]> => {
      const podcastIds = await this.db
        .getSubscriptionsByUserId(userId)
        .then((res) => res.map((a) => a.podcast_id));

      return this.podcast.getByIds(podcastIds);
    },
    subscribe: async (userId: string, podcastId: number): Promise<null> => {
      await this.db.addSubscription(userId, podcastId);
      return null;
    },
    unsubscribe: async (userId: string, podcastId: number): Promise<null> => {
      await this.db.deleteSubscription(userId, podcastId);
      return null;
    },
    checkIfSubscribed: async (userId: string, podcastId: number): Promise<boolean> => {
      const sub = await this.db.getSubscription(userId, podcastId);
      return !!sub;
    },
  };

  user = {
    getById: async (id: string): Promise<User> => {
      let user = await this.db.getUserById(id);

      if (!user) {
        user = await this.db.addUser({ id });
      }

      return user;
    },
  };

  meta = {
    health: async (): Promise<Health> => {
      return {
        version: apiVersion,
        uptime: Math.floor(process.uptime() * 1000),
        date: new Date().toUTCString(),
        database_latency: await this.db.testLatency(),
      };
    },
  };
}
