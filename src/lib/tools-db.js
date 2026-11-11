import prisma from "./prisma";

let cachedTools = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15 * 1000; // 15 seconds cache

let isDbHealthy = true;
let lastDbCheck = 0;
const DB_HEALTH_TTL_MS = 3 * 1000; // Recheck at most every 3s when offline

/**
 * Check if the PostgreSQL database is reachable.
 */
export async function getDatabaseHealth(force = false) {
  const now = Date.now();
  if (!force && now - lastDbCheck < DB_HEALTH_TTL_MS) {
    return isDbHealthy;
  }

  lastDbCheck = now;

  if (!process.env.DATABASE_URL) {
    isDbHealthy = false;
    return false;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    isDbHealthy = true;
    return true;
  } catch (err) {
    isDbHealthy = false;
    return false;
  }
}

/**
 * Fetch all tools directly from PostgreSQL database with 15s in-memory caching.
 */
export async function getToolsFromDb() {
  const now = Date.now();
  if (cachedTools && now - lastFetchTime < CACHE_TTL_MS && isDbHealthy) {
    return cachedTools;
  }

  if (!process.env.DATABASE_URL) {
    isDbHealthy = false;
    lastDbCheck = now;
    return [];
  }

  try {
    const tools = await prisma.tool.findMany({
      orderBy: { sortOrder: "asc" },
    });

    if (tools) {
      cachedTools = tools;
      lastFetchTime = now;
      isDbHealthy = true;
      lastDbCheck = now;
      return tools;
    }
  } catch (err) {
    isDbHealthy = false;
    lastDbCheck = now;
    cachedTools = null;
    console.warn(`[Nova-X] Database is unreachable: ${err.message}`);
  }

  return [];
}

/**
 * Find tool status by matching pathname against database records.
 */
export async function getToolStatusByPath(pathname) {
  if (!pathname) return null;
  const tools = await getToolsFromDb();

  if (pathname.startsWith("/tools/")) {
    const slug = pathname.replace(/^\/tools\//, "").split("/")[0];
    return tools.find((t) => t.id === slug) || null;
  }

  if (pathname.startsWith("/api/")) {
    const endpoint = pathname.split("?")[0];
    return tools.find((t) => t.apiEndpoints?.includes(endpoint)) || null;
  }

  return null;
}
