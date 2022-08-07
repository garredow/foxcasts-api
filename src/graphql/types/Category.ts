import { gql } from 'mercurius-codegen';

export const Category = gql`
  type Category {
    id: BigInt!
    title: String!
  }
`;
