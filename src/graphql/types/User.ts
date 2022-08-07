import { gql } from 'mercurius-codegen';

export const User = gql`
  type User {
    id: String!
    first_name: String
    last_name: String
    email: String
    avatar_url: String
    created_at: DateTime!
    updated_at: DateTime!
  }
`;
