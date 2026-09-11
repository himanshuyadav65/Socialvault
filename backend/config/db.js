/**
 * MySQL Connection & Schema Setup for XAMPP (socialvault_db)
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'instatrack_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(DB_CONFIG);
let isConnected = false;

async function initDatabase() {
  try {
    // 1. Test basic MySQL connection and ensure database exists
    const rootConn = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\`;`);
    await rootConn.end();



    // 3. Create required tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`searched_profiles\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(100) NOT NULL UNIQUE,
        \`display_name\` VARCHAR(255) DEFAULT NULL,
        \`avatar_url\` LONGTEXT DEFAULT NULL,
        \`user_id\` VARCHAR(100) DEFAULT NULL,
        \`followers\` INT DEFAULT 0,
        \`following\` INT DEFAULT 0,
        \`posts\` INT DEFAULT 0,
        \`is_private\` TINYINT(1) DEFAULT 0,
        \`is_verified\` TINYINT(1) DEFAULT 0,
        \`biography\` TEXT DEFAULT NULL,
        \`tracking_id\` VARCHAR(100) DEFAULT NULL,
        \`archive_size\` VARCHAR(50) DEFAULT '2.8 GB',
        \`active_sessions\` INT DEFAULT 5,
        \`linked_devices\` INT DEFAULT 3,
        \`ip_addresses\` INT DEFAULT 7,
        \`cookies_count\` INT DEFAULT 13,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`search_logs\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(100) NOT NULL,
        \`ip_address\` VARCHAR(100) DEFAULT NULL,
        \`user_agent\` VARCHAR(255) DEFAULT NULL,
        \`status\` VARCHAR(50) DEFAULT 'verified',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`unlocked_reports\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(100) NOT NULL,
        \`tracking_id\` VARCHAR(100) DEFAULT NULL,
        \`price\` VARCHAR(20) DEFAULT '₹99',
        \`status\` VARCHAR(50) DEFAULT 'unlocked',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Users Table for Google Sign-In
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`google_id\` VARCHAR(100) UNIQUE,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`full_name\` VARCHAR(255) DEFAULT NULL,
        \`first_name\` VARCHAR(100) DEFAULT NULL,
        \`last_name\` VARCHAR(100) DEFAULT NULL,
        \`avatar_url\` TEXT DEFAULT NULL,
        \`locale\` VARCHAR(20) DEFAULT 'en',
        \`last_login\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    isConnected = true;
    console.log(`✅ [MySQL] Successfully connected to XAMPP database "${DB_CONFIG.database}" on port ${DB_CONFIG.port}`);
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ [MySQL] Could not connect to XAMPP MySQL (${error.message}). Please ensure Apache/MySQL is running in XAMPP.`);
  }
}

// Upsert Google User into MySQL
async function saveGoogleUserToDb(user) {
  if (!pool || !isConnected) return null;
  try {
    const query = `
      INSERT INTO \`users\` (
        google_id, email, full_name, first_name, last_name, avatar_url, locale, last_login
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
        full_name = VALUES(full_name),
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        avatar_url = VALUES(avatar_url),
        last_login = CURRENT_TIMESTAMP;
    `;
    await pool.query(query, [
      user.googleId || '',
      user.email,
      user.name || '',
      user.givenName || '',
      user.familyName || '',
      user.picture || '',
      user.locale || 'en'
    ]);

    const [rows] = await pool.query(`SELECT * FROM \`users\` WHERE email = ? LIMIT 1`, [user.email]);
    return rows && rows[0] ? rows[0] : user;
  } catch (err) {
    console.error(`[MySQL] Error saving Google user ${user.email}:`, err.message);
    return null;
  }
}

// Get User by Email
async function getUserByEmail(email) {
  if (!pool || !isConnected) return null;
  try {
    const [rows] = await pool.query(`SELECT * FROM \`users\` WHERE email = ? LIMIT 1`, [email]);
    return rows && rows[0] ? rows[0] : null;
  } catch (err) {
    console.error(`[MySQL] Error fetching user ${email}:`, err.message);
    return null;
  }
}

// Save or Update Real Profile in MySQL
async function saveProfileToDb(profile) {
  if (!pool || !isConnected) return;
  try {
    const query = `
      INSERT INTO \`searched_profiles\` (
        username, display_name, avatar_url, user_id, followers, following, posts,
        is_private, is_verified, biography, tracking_id, archive_size,
        active_sessions, linked_devices, ip_addresses, cookies_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        display_name = VALUES(display_name),
        avatar_url = VALUES(avatar_url),
        user_id = VALUES(user_id),
        followers = VALUES(followers),
        following = VALUES(following),
        posts = VALUES(posts),
        is_private = VALUES(is_private),
        is_verified = VALUES(is_verified),
        biography = VALUES(biography),
        tracking_id = VALUES(tracking_id),
        archive_size = VALUES(archive_size),
        updated_at = CURRENT_TIMESTAMP;
    `;

    await pool.query(query, [
      profile.username,
      profile.displayName || profile.username,
      profile.avatarUrl || '',
      profile.userId || '',
      parseInt(profile.followers) || 0,
      parseInt(profile.following) || 0,
      parseInt(profile.posts) || 0,
      profile.isPrivate ? 1 : 0,
      profile.isVerified ? 1 : 0,
      profile.biography || '',
      profile.trackingId || '',
      profile.size || '2.8 GB',
      parseInt(profile.activeSessions) || 5,
      parseInt(profile.linkedDevices) || 3,
      parseInt(profile.ipAddresses) || 7,
      parseInt(profile.cookies) || 13
    ]);
  } catch (err) {
    console.error(`[MySQL] Error saving profile @${profile.username}:`, err.message);
  }
}

// Log search attempt in MySQL
async function logSearchToDb(username, ipAddress, userAgent, status = 'verified') {
  if (!pool || !isConnected) return;
  try {
    await pool.query(
      `INSERT INTO \`search_logs\` (username, ip_address, user_agent, status) VALUES (?, ?, ?, ?)`,
      [username, ipAddress || '127.0.0.1', userAgent || 'Browser', status]
    );
  } catch (err) {
    console.error(`[MySQL] Error logging search:`, err.message);
  }
}

// Fetch Profile from MySQL Cache
async function getProfileFromDb(username) {
  if (!pool || !isConnected) return null;
  const clean = username.toLowerCase().trim();
  try {
    let [rows] = await pool.query(
      `SELECT * FROM \`searched_profiles\` WHERE username = ? LIMIT 1`,
      [clean]
    );

    // If not found directly, check for alias or partial username match
    if (!rows || rows.length === 0) {
      const simplified = clean.replace(/[^a-z0-9]/g, '');
      if (simplified.length >= 3) {
        [rows] = await pool.query(
          `SELECT * FROM \`searched_profiles\` WHERE REPLACE(REPLACE(username, '_', ''), '.', '') LIKE ? OR username LIKE ? LIMIT 1`,
          [`%${simplified}%`, `%${clean}%`]
        );
      }
    }

    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        username: r.username,
        displayName: r.display_name || clean,
        avatarUrl: r.avatar_url || '',
        userId: r.user_id || '7516578921',
        followers: r.followers || 10500,
        following: r.following || 380,
        posts: r.posts || 85,
        isPrivate: Boolean(r.is_private),
        isVerified: Boolean(r.is_verified),
        biography: r.biography || '',
        trackingId: r.tracking_id || `TRK-HY${Math.floor(Math.random()*9000+1000)}-NODE`,
        size: r.archive_size || '2.8 GB',
        sessions: `${r.active_sessions || 5} sessions`,
        activeSessions: r.active_sessions || 5,
        linkedDevices: r.linked_devices || 3,
        ipAddresses: r.ip_addresses || 7,
        cookies: r.cookies_count || 13,
        initials: (r.display_name || r.username).slice(0, 2).toUpperCase(),
        isReal: true,
        fromDatabase: true
      };
    }
  } catch (err) {
    console.error(`[MySQL] Error fetching @${username}:`, err.message);
  }
  return null;
}

// Initialize on require
initDatabase();

module.exports = {
  pool,
  initDatabase,
  saveProfileToDb,
  logSearchToDb,
  getProfileFromDb,
  saveGoogleUserToDb,
  getUserByEmail,
  isDbConnected: () => isConnected
};
