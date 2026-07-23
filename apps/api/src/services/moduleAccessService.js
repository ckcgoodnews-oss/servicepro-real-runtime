const MODULES=Object.freeze(['operations','crm','assets','inventory','billing','analytics','knowledge','communications','marketplace','administration']);
function normalizeModules(values){return [...new Set((Array.isArray(values)?values:[]).map(String).filter(x=>MODULES.includes(x)))];}
function moduleForPath(path){
  if(/^\/api\/v1\/(dashboard|jobs|appointments|dispatch|technicians|workflows)/.test(path))return 'operations';
  if(/^\/api\/v1\/(customers|organization)/.test(path))return 'crm';
  if(/^\/api\/v1\/(assets|customer-assets|media)/.test(path))return 'assets';
  if(/^\/api\/v1\/(inventory|materials|warehouses|purchase-orders)/.test(path))return 'inventory';
  if(/^\/api\/v1\/(estimates|invoices|payments|price-book)/.test(path))return 'billing';
  if(/^\/api\/v1\/(reports|exports)/.test(path))return 'analytics';
  if(/^\/api\/v1\/knowledge/.test(path))return 'knowledge';
  if(/^\/api\/v1\/(notifications|communications)/.test(path))return 'communications';
  if(/^\/api\/v1\/(marketplace|app-marketplace)/.test(path))return 'marketplace';
  if(/^\/api\/v1\/(tenant|audit|security|integrity|team)/.test(path))return 'administration';
  return null;
}
module.exports={MODULES,normalizeModules,moduleForPath};
