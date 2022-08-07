import { gql } from 'mercurius-codegen';

export const Mutation = gql`
  type Mutation {
    subscribe(podcastId: BigInt!): Boolean
    unsubscribe(podcastId: BigInt!): Boolean
    updateProgress(episodeId: BigInt!, progress: Int!): Boolean
  }
`;
