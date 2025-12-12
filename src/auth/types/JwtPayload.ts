export interface JwtPayload {
  // This the user ID of the authenticated User
  sub: number;
  /**
   * This is the secondary identifier for lookup
   */
  email: string;
}