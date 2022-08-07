import { gql } from 'mercurius-codegen';

export const Health = gql`
  type Health {
    version: String!
    uptime: BigInt!
    date: String!
    database_latency: Int!
  }
`;
