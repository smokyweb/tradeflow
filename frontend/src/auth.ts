const AUTH_KEY = 'tradeflow_auth';

export function isLoggedIn(): boolean {
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function login(email: string, password: string): boolean {
  const validUsers = [
    { email: 'admin@tradeflow.demo', password: 'demo1234' },
    { email: 'demo@tradeflow.demo', password: 'demo1234' },
  ];
  if (validUsers.some(u => u.email === email && u.password === password)) {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}
