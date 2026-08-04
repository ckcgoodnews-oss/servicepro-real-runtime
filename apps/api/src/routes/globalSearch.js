const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');
const { globalSearch } = require('../services/globalSearchService');

function search(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const query = url.searchParams.get('q') || '';
  const entityTypes = url.searchParams.get('entity_types') || '';
  const limit = parseInt(url.searchParams.get('limit') || '25', 10);

  if (!query || query.length < 2) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'q parameter must be at least 2 characters' } });
  }

  const options = { limit };
  if (entityTypes) options.entity_types = entityTypes.split(',');

  const results = globalSearch(operationalTenant(req), query, req.context.repositories, options);
  sendJson(res, 200, { data: results, total: results.length, query });
}

module.exports = { search };
