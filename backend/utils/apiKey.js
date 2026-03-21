const crypto = require('crypto');

const generateApiKey = () => {
  const randomPart = crypto.randomBytes(32).toString('hex');
  return `mgk_${randomPart}`;
};

const hashApiKey = (apiKey) =>
  crypto.createHash('sha256').update(String(apiKey)).digest('hex');

const getApiKeyPrefix = (apiKey) => String(apiKey).slice(0, 12);

module.exports = {
  generateApiKey,
  hashApiKey,
  getApiKeyPrefix,
};