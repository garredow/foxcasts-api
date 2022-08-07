import { gql } from 'mercurius-codegen';

export const Podcast = gql`
  type Podcast {
    id: BigInt!
    itunes_id: BigInt
    title: String!
    author: String!
    description: String
    feed_url: String!
    artwork_url: String!
    artwork: Artwork!
    episodes(count: Int!): [Episode!]!
    # categories: [Category!]!
    is_subscribed: Boolean!
    created_at: DateTime!
    updated_at: DateTime!
  }
`;
