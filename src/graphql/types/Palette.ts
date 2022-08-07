import { gql } from 'mercurius-codegen';

export const Palette = gql`
  type Palette {
    dark_muted: String
    dark_vibrant: String
    light_muted: String
    light_vibrant: String
    muted: String
    vibrant: String
    created_at: DateTime!
    updated_at: DateTime!
  }
`;
