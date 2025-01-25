require('dotenv').config();
const fs = require('fs');

const config = {
    CORE_API_URL: process.env.CORE_API_URL,
};
console.log(config);
fs.writeFileSync('public/config.js', `self.config = ${JSON.stringify(config)};`);