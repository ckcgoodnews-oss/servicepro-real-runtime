const { makeId, now } = require('../services/id');

function createCrmPropertyDefinitionRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    list(tenantId, objectType) {
      const d = data();
      d.crmPropertyDefinitions ||= [];
      let results = d.crmPropertyDefinitions.filter(p => p.tenantId === tenantId);
      if (objectType) results = results.filter(p => p.objectType === objectType);
      return results.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
    },

    findById(tenantId, id) {
      const d = data();
      d.crmPropertyDefinitions ||= [];
      return d.crmPropertyDefinitions.find(p => p.tenantId === tenantId && p.id === id) || null;
    },

    findByName(tenantId, objectType, name) {
      const d = data();
      d.crmPropertyDefinitions ||= [];
      return d.crmPropertyDefinitions.find(p => p.tenantId === tenantId && p.objectType === objectType && p.name === name) || null;
    },

    create(tenantId, input) {
      const d = data();
      d.crmPropertyDefinitions ||= [];
      // Upsert by objectType + name
      const existingIdx = d.crmPropertyDefinitions.findIndex(p =>
        p.tenantId === tenantId && p.objectType === input.object_type && p.name === input.name
      );
      const prop = {
        id: existingIdx >= 0 ? d.crmPropertyDefinitions[existingIdx].id : makeId('prop'),
        tenantId,
        objectType: input.object_type,
        name: input.name,
        label: input.label,
        fieldType: input.field_type,
        propertyGroup: input.property_group || 'custom',
        description: input.description || null,
        options: input.options || null,
        formula: input.formula || null,
        required: !!input.required,
        readOnly: !!input.read_only,
        hidden: !!input.hidden,
        displayOrder: input.display_order || 0,
        validation: input.validation || null,
        createdAt: existingIdx >= 0 ? d.crmPropertyDefinitions[existingIdx].createdAt : now(),
        updatedAt: now()
      };
      if (existingIdx >= 0) {
        d.crmPropertyDefinitions[existingIdx] = prop;
      } else {
        d.crmPropertyDefinitions.push(prop);
      }
      save(d);
      return prop;
    },

    update(tenantId, id, input) {
      const d = data();
      d.crmPropertyDefinitions ||= [];
      const idx = d.crmPropertyDefinitions.findIndex(p => p.tenantId === tenantId && p.id === id);
      if (idx === -1) return null;
      const prop = d.crmPropertyDefinitions[idx];
      if (input.label !== undefined) prop.label = input.label;
      if (input.field_type !== undefined) prop.fieldType = input.field_type;
      if (input.property_group !== undefined) prop.propertyGroup = input.property_group;
      if (input.description !== undefined) prop.description = input.description;
      if (input.options !== undefined) prop.options = input.options;
      if (input.formula !== undefined) prop.formula = input.formula;
      if (input.required !== undefined) prop.required = !!input.required;
      if (input.read_only !== undefined) prop.readOnly = !!input.read_only;
      if (input.hidden !== undefined) prop.hidden = !!input.hidden;
      if (input.display_order !== undefined) prop.displayOrder = input.display_order;
      if (input.validation !== undefined) prop.validation = input.validation;
      prop.updatedAt = now();
      save(d);
      return prop;
    },

    delete(tenantId, id) {
      const d = data();
      d.crmPropertyDefinitions ||= [];
      const idx = d.crmPropertyDefinitions.findIndex(p => p.tenantId === tenantId && p.id === id);
      if (idx === -1) return null;
      d.crmPropertyDefinitions.splice(idx, 1);
      save(d);
      return { deleted: true };
    }
  };
}

function createPostgresImpl(store) {
  return createJsonImpl(store);
}

module.exports = { createCrmPropertyDefinitionRepository };
