const AUTH_KEY = 'tradeflow_auth';

export function isLoggedIn(): boolean {
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function login(email: string, password: string): boolean {
  if (email === 'admin@tradeflow.demo' && password === 'demo1234') {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}
