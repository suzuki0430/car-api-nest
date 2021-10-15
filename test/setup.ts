import { join } from 'path';
// import { rm } from 'fs/promises';
// const rm = require('fs').promises;
import { promises } from 'fs';
import { getConnection } from 'typeorm';

const { rm } = promises;

global.beforeEach(async () => {
  try {
    // await rm(join(__dirname, '..', 'test.sqlite'));
    await promises.unlink(join(__dirname, '..', 'test.sqlite'));
  } catch (err) {}
});

global.afterEach(async () => {
  const conn = getConnection();
  await conn.close();
});
