export const AuthScopes = ['live-inputs', 'talents', 'locations', 'blocks'] as const;
export type AuthScope = (typeof AuthScopes)[number];
