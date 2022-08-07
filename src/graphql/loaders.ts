import { MercuriusLoaders } from 'mercurius';
import { Podcast } from '../models';

export const loaders: MercuriusLoaders = {
  Episode: {
    async podcast(queries, { reply, dataClient }) {
      const podcastIds = queries.map((a) => a.obj.podcast_id);
      const podcasts = await dataClient.podcast.getByIds(podcastIds).then((res) =>
        res.reduce((acc, val) => {
          acc[val.id] = val;
          return acc;
        }, {} as { [key: number]: Podcast })
      );
      return queries.map(({ obj }) => podcasts[obj.podcast_id]);
    },
  },
};
