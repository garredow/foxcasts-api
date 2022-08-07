const { version: apiVersion } = require('../../package.json');

function getHealth() {
  return {
    version: apiVersion,
    uptime: Math.floor(process.uptime()),
    date: new Date().toISOString(),
  };
}

export const healthService = {
  getHealth,
};
