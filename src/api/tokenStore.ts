let accessToken: string | null = null

// Access tokens stay in memory so they cannot be read from persistent browser storage after an XSS.
export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}
