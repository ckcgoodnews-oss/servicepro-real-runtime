const express = require('express');
const { byTenant, insert, update } = require('../db/store');
const { requireApiScope } = require('../middleware/apiAuth');
const { enqueueEvent } = require('../services/webhooks');

const router = express.Router();

router.get('/v1/customers', requireApiScope('customers.read'), (req, res) => {
  res.json({ data: byTenant('customers', req.tenant.id) });
});

router.post('/v1/customers', requireApiScope('customers.write'), (req, res) => {
  const customer = insert('customers', {
    tenantId: req.tenant.id,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    email: req.body.email
  });
  enqueueEvent(req.tenant.id, 'customer.created', customer);
  res.status(201).json({ data: customer });
});

router.get('/v1/jobs', requireApiScope('jobs.read'), (req, res) => {
  res.json({ data: byTenant('jobs', req.tenant.id) });
});

router.post('/v1/jobs', requireApiScope('jobs.write'), (req, res) => {
  const job = insert('jobs', {
    tenantId: req.tenant.id,
    customerId: req.body.customerId,
    title: req.body.title,
    status: req.body.status || 'open',
    serviceName: req.body.serviceName,
    estimatedPrice: Number(req.body.estimatedPrice || 0)
  });
  enqueueEvent(req.tenant.id, 'job.created', job);
  res.status(201).json({ data: job });
});

router.patch('/v1/jobs/:id', requireApiScope('jobs.write'), (req, res) => {
  const existing = byTenant('jobs', req.tenant.id).find(j => j.id === req.params.id);
  if (!existing) return res.status(404).json({ error: 'not_found' });
  const job = update('jobs', existing.id, {
    status: req.body.status || existing.status,
    finalPrice: req.body.finalPrice !== undefined ? Number(req.body.finalPrice) : existing.finalPrice
  });
  enqueueEvent(req.tenant.id, 'job.updated', job);
  res.json({ data: job });
});

router.get('/v1/services', requireApiScope('services.read'), (req, res) => {
  res.json({ data: byTenant('services', req.tenant.id) });
});

module.exports = router;
