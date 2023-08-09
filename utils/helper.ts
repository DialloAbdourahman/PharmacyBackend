const fs = require('fs').promises;
const path = require('path');

const generateRandomImageName = () => {
  return Date.now() + '-' + Math.round(Math.random() * 1e9) + '.jpg';
};

const deleteFile = async (dir: string, file: string) => {
  await fs.unlink(path.join(dir, file));
};

module.exports = { generateRandomImageName, deleteFile };
