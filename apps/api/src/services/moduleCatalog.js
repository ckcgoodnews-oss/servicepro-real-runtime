const MODULES=Object.freeze(['operations','crm','assets','inventory','billing','analytics','knowledge','communications','marketplace','administration']);
const ROUTES=[
['operations',/^\/api\/v1\/(dashboard|jobs|appointments|technicians|dispatch|workflows|workflow-events)/],
['crm',/^\/api\/v1\/(customers|organization)/],['assets',/^\/api\/v1\/(assets|customer-assets)/],
['inventory',/^\/api\/v1\/(inventory|materials|warehouses|transfers|purchase-orders)/],
['billing',/^\/api\/v1\/(estimates|invoices|payments|price-book)/],['analytics',/^\/api\/v1\/(reports|exports)/],
['knowledge',/^\/api\/v1\/knowledge/],['communications',/^\/api\/v1\/(notifications|communications|message-templates)/],
['marketplace',/^\/api\/v1\/marketplace/],['administration',/^\/api\/v1\/(tenant|audit|security|integrity|team)/]
];
function moduleForPath(path){return ROUTES.find(([,pattern])=>pattern.test(path))?.[0]||null;}
module.exports={MODULES,moduleForPath};
