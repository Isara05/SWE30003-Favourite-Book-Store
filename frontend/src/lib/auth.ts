export type AuthUser = {
  id: string;
  role: 'customer' | 'staff' | 'manager';
  name: string;
  email: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

const TOKEN_KEY = 'fb_token';
const USER_KEY = 'fb_user';

// Saves the logged-in user details in the browser.
export function setAuthSession(session: AuthResponse) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

// Reads the saved login details from the browser.
export function getAuthSession() {
  if (typeof window === 'undefined') return null;
  const token = window.localStorage.getItem(TOKEN_KEY);
  const user = window.localStorage.getItem(USER_KEY);
  if (!token || !user) return null;
  return { token, user: JSON.parse(user) as AuthUser };
}

// Clears the saved login details from the browser.
export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
