const { STORE_TYPES } = require('./storeTypes');
const jsonStore = require('./jsonStoreAdapter');
const postgresStore = require('./postgresStoreAdapter');

function createStoreProvider() {
  const mode = process.env.DATA_STORE || STORE_TYPES.JSON;

  if (mode === STORE_TYPES.JSON) {
    return jsonStore.createJsonStore();
  }

  if (mode === STORE_TYPES.POSTGRES) {
    return postgresStore.createPostgresStore();
  }

  throw new Error(`Unsupported DATA_STORE value: ${mode}`);
}

module.exports = { createStoreProvider };
