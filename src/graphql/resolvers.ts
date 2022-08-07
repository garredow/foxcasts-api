import _ from 'lodash';
import { IResolvers } from 'mercurius';
import { Podcast } from '../models';

export const resolvers: IResolvers = {
  Query: {
    user(root, args, { userId, dataClient }, info) {
      return dataClient.user.getById(userId);
    },
    search(root, { query, count }, { dataClient }, info) {
      return dataClient.podcast.search(query, count ?? undefined);
    },
    async podcast(root, { id }, { dataClient }, info) {
      const res = await dataClient.podcast.getById(id);
      return res;
    },
    async episode(root, { id }, { dataClient }, info) {
      const res = await dataClient.episode.getById(id);
      return res;
    },
    subscriptions(root, args, { dataClient, userId }, info) {
      return dataClient.podcast.getByUserId(userId);
    },
    async health(root, args, { dataClient }, info) {
      return dataClient.meta.health();
    },
  },
  Mutation: {
    async subscribe(root, { podcastId }, { dataClient, userId }, info) {
      return dataClient.podcast.subscribe(userId, podcastId);
    },
    async unsubscribe(root, { podcastId }, { dataClient, userId }, info) {
      return dataClient.podcast.unsubscribe(userId, podcastId);
    },
    async updateProgress(root, { episodeId, progress }, { dataClient, userId }, info) {
      return dataClient.episode.setEpisodeProgress(userId, episodeId, progress);
    },
  },
  Podcast: {
    episodes(podcast, { count }, { dataClient }, info) {
      return count > 0 ? dataClient.episode.getRecent(podcast.id, count) : [];
    },
    is_subscribed(podcast, args, { dataClient, userId }, info) {
      return dataClient.podcast.checkIfSubscribed(userId, podcast.id);
    },
    artwork(podcast, args, context, info) {
      return { podcast_id: podcast.id, url: podcast.artwork_url };
    },
  },
  Episode: {
    async podcast(episode, args, { dataClient }) {
      const res = await dataClient.podcast.getById(episode.podcast_id);
      return res as Podcast;
    },
    progress(episode, args, { dataClient, userId }) {
      return dataClient.episode.getEpisodeProgress(userId, episode.id);
    },
    artwork(episode, args, context, info) {
      return { podcast_id: episode.podcast_id };
    },
  },
  Artwork: {
    url(obj, args, { dataClient }, info) {
      return obj.url ? obj.url : dataClient.artwork.getUrl(obj.podcast_id);
    },
    data(obj, { size, blur }, { dataClient }, info) {
      return dataClient.artwork.getImageData(
        obj.podcast_id,
        _.clamp(size ?? 256, 32, 1024),
        _.clamp(blur ?? 0, 0, 50)
      );
    },
    palette(obj, args, { dataClient }, info) {
      return dataClient.artwork.getPalette(obj.podcast_id);
    },
  },
};
