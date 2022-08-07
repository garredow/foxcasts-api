import { gql } from 'mercurius-codegen';

export const Episode = gql`
  type Episode {
    id: BigInt!
    podcast_id: BigInt!
    date: DateTime!
    title: String!
    description: String
    progress: Int
    duration: Int
    file_size: Int
    file_type: String
    file_url: String
    chapters_url: String
    transcript_url: String
    season: Int
    episode: Int
    episode_type: String
    podcast: Podcast!
    artwork: Artwork!
    created_at: DateTime!
    updated_at: DateTime!
  }
`;
