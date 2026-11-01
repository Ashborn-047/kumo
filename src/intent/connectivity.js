// ============================================================
// src/intent/connectivity.js — Internet Reachability Checker
// ============================================================

async function isOnline() {
  try {
    const dns = require('dns');
    return new Promise((resolve) => {
      dns.lookup('openrouter.ai', (err) => {
        if (!err) return resolve(true);
        const { exec } = require('child_process');
        exec('ping -n 1 -w 1500 8.8.8.8', { timeout: 3000 }, (pErr, stdout) => {
          resolve(!pErr && stdout.includes('TTL='));
        });
      });
    });
  } catch {
    return false;
  }
}

module.exports = {
  isOnline,
};

