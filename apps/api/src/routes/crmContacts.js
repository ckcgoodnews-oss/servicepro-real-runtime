const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.crmContacts; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = {
    company_id: url.searchParams.get('company_id') || '',
    lifecycle_stage: url.searchParams.get('lifecycle_stage') || '',
    owner_id: url.searchParams.get('owner_id') || '',
    search: url.searchParams.get('search') || ''
  };
  for (const key of Object.keys(filters)) if (!filters[key]) delete filters[key];
  Promise.resolve(repo(req).list(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Contact not found' } }));
}

function create(req, res) {
  const { first_name, last_name, email } = req.body || {};
  if (!first_name && !last_name && !email) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'At least one of first_name, last_name, or email is required' } });
  }
  // Duplicate detection
  Promise.resolve(
    email ? repo(req).findDuplicates(tenant(req), email, req.body.phone) : []
  ).then(duplicates => {
    if (duplicates.length > 0 && !req.body.force_create) {
      return sendJson(res, 409, {
        error: { code: 'duplicate_found', message: 'Possible duplicate contact found' },
        duplicates: duplicates.map(d => ({ id: d.id, email: d.email, firstName: d.firstName, lastName: d.lastName }))
      });
    }
    return Promise.resolve(repo(req).create(tenant(req), req.body))
      .then(data => sendJson(res, 201, { data }));
  });
}

function update(req, res, id) {
  Promise.resolve(repo(req).update(tenant(req), id, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Contact not found' } }));
}

function remove(req, res, id) {
  Promise.resolve(repo(req).delete(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Contact not found' } }));
}

function count(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = {
    lifecycle_stage: url.searchParams.get('lifecycle_stage') || '',
    owner_id: url.searchParams.get('owner_id') || ''
  };
  for (const key of Object.keys(filters)) if (!filters[key]) delete filters[key];
  Promise.resolve(repo(req).count(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

function merge(req, res) {
  const { primary_id, duplicate_id } = req.body || {};
  if (!primary_id || !duplicate_id) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'primary_id and duplicate_id are required' } });
  }
  if (primary_id === duplicate_id) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'Cannot merge a contact with itself' } });
  }

  const t = tenant(req);
  const primary = repo(req).findById(t, primary_id);
  const duplicate = repo(req).findById(t, duplicate_id);

  if (!primary) return sendJson(res, 404, { error: { code: 'not_found', message: 'Primary contact not found' } });
  if (!duplicate) return sendJson(res, 404, { error: { code: 'not_found', message: 'Duplicate contact not found' } });

  // Merge strategy: fill empty fields on primary from duplicate
  const mergeFields = ['email', 'phone', 'mobile', 'job_title', 'company_id', 'source'];
  const updates = {};
  for (const field of mergeFields) {
    const camelField = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    if (!primary[camelField] && duplicate[camelField]) {
      updates[field] = duplicate[camelField];
    }
  }

  // Merge tags
  const mergedTags = [...new Set([...(primary.tags || []), ...(duplicate.tags || [])])];
  if (mergedTags.length > (primary.tags || []).length) updates.tags = mergedTags;

  // Merge custom properties
  if (duplicate.properties && Object.keys(duplicate.properties).length) {
    const mergedProps = { ...duplicate.properties, ...primary.properties };
    updates.properties = mergedProps;
  }

  // Apply merge to primary
  if (Object.keys(updates).length > 0) {
    repo(req).update(t, primary_id, updates);
  }

  // Re-associate records from duplicate to primary
  const assocRepo = req.context.repositories.recordAssociations;
  if (assocRepo) {
    const dupAssocs = assocRepo.listForEntity(t, 'contact', duplicate_id);
    for (const assoc of dupAssocs) {
      if (assoc.sourceType === 'contact' && assoc.sourceId === duplicate_id) {
        assocRepo.create(t, { source_type: 'contact', source_id: primary_id, target_type: assoc.targetType, target_id: assoc.targetId, association_type: assoc.associationType });
      } else {
        assocRepo.create(t, { source_type: assoc.sourceType, source_id: assoc.sourceId, target_type: 'contact', target_id: primary_id, association_type: assoc.associationType });
      }
    }
  }

  // Log the merge in activity timeline
  const actRepo = req.context.repositories.activityTimeline;
  if (actRepo) {
    actRepo.create(t, {
      entity_type: 'contact', entity_id: primary_id, activity_type: 'merge',
      title: `Merged with ${duplicate.firstName || ''} ${duplicate.lastName || ''} (${duplicate.email || duplicate.id})`.trim(),
      metadata: { merged_contact_id: duplicate_id, merged_fields: Object.keys(updates) },
      performed_by: req.user?.email || null
    });
  }

  // Delete the duplicate
  repo(req).delete(t, duplicate_id);

  // Return the updated primary
  const result = repo(req).findById(t, primary_id);
  sendJson(res, 200, { data: result, merged: { primary_id, duplicate_id, fields_merged: Object.keys(updates) } });
}

module.exports = { list, get, create, update, remove, count, merge };
