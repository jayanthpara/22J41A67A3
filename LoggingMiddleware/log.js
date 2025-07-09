const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'journal.log');
module.exports = function logins(req, res, next) {
  const tick = Date.now();
  res.on('finish', () => {
    const tock = Date.now() - tick;
    const entry = `${req.method} ${req.originalUrl} → ${res.statusCode} in ${tock}ms\n`;
    fs.appendFileSync(filePath, entry);
  });
  next();
};
