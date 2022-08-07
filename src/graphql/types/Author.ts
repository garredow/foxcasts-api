import { gql } from 'mercurius-codegen';

export const Podcast = gql`
  type Author {
    id: ID!
    name: String!
    podcasts: [Podcast!]!
  }
`;
