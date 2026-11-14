import { supabaseRootCertificate } from './supabase-certificate';

export const databaseTls = { ca: supabaseRootCertificate, rejectUnauthorized: true } as const;

// Pure formatter. Callers supply secrets at runtime; never print its result.
export function formatDatabaseUrl(rawUrl: string, password?: string) {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error('The database connection string must be a PostgreSQL URI.');
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || !url.username) {
    throw new Error('The database connection string must be a PostgreSQL URI.');
  }
  if (password) url.password = encodeURIComponent(password);
  let decodedPassword: string;
  try { decodedPassword = decodeURIComponent(url.password); }
  catch { throw new Error('The database password could not be decoded safely.'); }
  if (!decodedPassword || /\[(?:YOUR[-_ ]?)?PASSWORD\]/i.test(decodedPassword)) {
    throw new Error('The separate database password is required for this connection string.');
  }
  // pg connection-string SSL options override explicit TLS settings. Remove
  // them so every caller uses databaseTls with the trusted CA and verification.
  for (const name of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'uselibpqcompat', 'ssl']) {
    url.searchParams.delete(name);
  }
  return url.toString();
}
