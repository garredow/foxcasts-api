import knex, { Knex } from 'knex';
import pg from 'pg';
import { config } from '../lib/config';
import { Category, Episode, Palette, Podcast, Progress, Subscription, User } from '../models';

pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
  return parseInt(value);
});

enum Table {
  User = 'user',
  Podcast = 'podcast',
  Episode = 'episode',
  Category = 'category',
  Subscription = 'subscription',
  Progress = 'progress',
  Chapter = 'chapter',
  Palette = 'palette',
}

export class Database {
  private db: Knex<any, unknown[]>;

  constructor() {
    this.db = knex({
      client: 'pg',
      connection: {
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database,
        application_name: config.meta.appName,
        ssl: config.database.ssl
          ? {
              rejectUnauthorized: false,
            }
          : false,
      },
    });
  }

  // User

  async getUserById(id: string): Promise<User | undefined> {
    const result = await this.db<User>(Table.User).where({ id }).first();
    return result;
  }

  async addUser(user: Omit<User, 'created_at' | 'updated_at'>): Promise<User> {
    return this.db<User>(Table.User)
      .insert({
        ...user,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .onConflict()
      .ignore()
      .returning('*')
      .then((res) => res[0]);
  }

  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    return this.db<User>(Table.User).where({ id: userId }).update(data);
  }

  // Podcasts

  async addPodcast(podcast: Podcast): Promise<Podcast> {
    return this.db<Podcast>(Table.Podcast)
      .insert({
        ...podcast,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .onConflict()
      .ignore()
      .returning('*')
      .then((res) => res[0]);
  }

  async getPodcastById(id: number): Promise<Podcast | undefined> {
    const result = await this.db<Podcast>(Table.Podcast).where({ id }).first();
    return result;
  }

  async getPodcastsByIds(ids: number[]): Promise<Podcast[]> {
    const result = await this.db<Podcast>(Table.Podcast).whereIn('id', ids);
    return result;
  }

  updatePodcast(id: number, data: Partial<Podcast>): Promise<void> {
    return this.db<Podcast>(Table.Podcast).where({ id }).update(data);
  }

  // Episodes

  async getEpisodeById(id: number): Promise<Episode | undefined> {
    const result = await this.db<Episode>(Table.Episode).where({ id }).first();
    return result;
  }

  async getEpisodesByIds(ids: number[]): Promise<Episode[]> {
    const result = await this.db<Episode>(Table.Episode).whereIn('id', ids);
    return result;
  }

  addEpisode(episode: Episode): Promise<Episode> {
    return this.db<Episode>(Table.Episode)
      .insert({
        ...episode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .onConflict()
      .merge()
      .returning('*')
      .then((res) => res[0]);
  }

  async addEpisodes(episodes: Episode[]): Promise<void> {
    await this.db.batchInsert<Episode>(Table.Episode, episodes, 100);
  }

  getEpisodeProgress(userId: string, episodeId: number): Promise<number> {
    return this.db<Progress>(Table.Progress)
      .where({ user_id: userId, episode_id: episodeId })
      .first()
      .then((res) => (res ? res.current_time : 0));
  }

  async setEpisodeProgress(userId: string, episodeId: number, progress: number): Promise<void> {
    await this.db<Progress>(Table.Progress)
      .insert({ user_id: userId, episode_id: episodeId, current_time: progress })
      .onConflict(['user_id', 'episode_id'])
      .merge();
  }

  async getRecentEpisodes(podcastId: number, count = 20): Promise<Episode[]> {
    return this.db<Episode>(Table.Episode)
      .orderBy('date', 'desc')
      .limit(count)
      .where({ podcast_id: podcastId });
  }

  // Categories

  getCategoryById(id: number): Promise<Category | undefined> {
    return this.db<Category>(Table.Category).where({ id }).first();
  }

  getCategoriesByIds(ids: number[]): Promise<Category[]> {
    return this.db(Table.Category).whereIn('id', ids);
  }

  getAllCategories(): Promise<Category[]> {
    return this.db<Category>(Table.Category);
  }

  async addCategories(categories: Pick<Category, 'id' | 'name'>[]): Promise<void> {
    const newCategories = await this.getCategoriesByIds(categories.map((a) => a.id)).then((res) => {
      const existing = res.map((a) => a.id);
      return categories.filter((a) => !existing.includes(a.id));
    });

    if (newCategories.length > 0) {
      await this.db.batchInsert<Category>(Table.Category, newCategories);
    }
  }

  // Subscriptions

  async addSubscription(userId: string, podcastId: number): Promise<Subscription> {
    return this.db<Subscription>(Table.Subscription)
      .insert({
        user_id: userId,
        podcast_id: podcastId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .onConflict()
      .ignore()
      .returning('*')
      .then((res) => res[0]);
  }

  async deleteSubscription(userId: string, podcastId: number): Promise<void> {
    await this.db<Subscription>(Table.Subscription)
      .where({ user_id: userId, podcast_id: podcastId })
      .delete();
  }

  getSubscription(userId: string, podcastId: number): Promise<Subscription | undefined> {
    return this.db<Subscription>(Table.Subscription)
      .where({ user_id: userId, podcast_id: podcastId })
      .first();
  }

  getSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    return this.db<Subscription>(Table.Subscription).where({ user_id: userId });
  }

  // Palette

  async addPalette(podcastId: number, palette: Partial<Palette>): Promise<Palette> {
    return this.db<Palette>(Table.Palette)
      .insert({
        ...palette,
        podcast_id: podcastId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .onConflict('podcast_id')
      .merge()
      .returning('*')
      .then((res) => res[0]);
  }

  async getPaletteByPodcastId(podcastId: number): Promise<Palette | undefined> {
    return this.db<Palette>(Table.Palette).where({ podcast_id: podcastId }).first();
  }

  // Health

  async testLatency() {
    try {
      const before = Date.now();
      await this.db.raw('SELECT 1');
      return Date.now() - before;
    } catch (err: any) {
      console.error('Failed to connect to the database', err?.message);
      return 0;
    }
  }
}
