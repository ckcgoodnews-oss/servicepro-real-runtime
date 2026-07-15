const servicePacks = [
  ['plumbing', 'Plumbing Operations Pack', 'Pricebook categories, equipment types, checklists, and job templates for residential and commercial plumbing.', ['Drain and sewer', 'Water heaters', 'Fixture service'], '#247d70'],
  ['hvac', 'HVAC Service Pack', 'Maintenance plans, diagnostic checklists, equipment lifecycle fields, and seasonal service templates.', ['Heating and cooling', 'Maintenance agreements', 'Equipment commissioning'], '#3c7ec4'],
  ['carpet_cleaning', 'Carpet & Upholstery Pack', 'Room measurements, treatment notes, material tracking, and repeat-cleaning workflows.', ['Room-based estimates', 'Treatment tracking', 'Recurring service'], '#9b6f4f'],
  ['landscaping', 'Landscaping Operations Pack', 'Property zones, crew visits, seasonal services, and material usage for lawn and landscape teams.', ['Property zones', 'Crew routing', 'Seasonal work'], '#56843f'],
  ['electrical', 'Electrical Contractor Pack', 'Circuit, panel, fixture, permit, and electrical safety workflows for residential and commercial electricians.', ['Panel schedules', 'Electrical inspections', 'Permit tracking'], '#d49328'],
  ['residential_cleaning', 'Residential Cleaning Pack', 'Room-by-room scopes, recurring visits, crew checklists, and customer preference tracking for home cleaning teams.', ['Room checklists', 'Recurring plans', 'Customer preferences'], '#5c91a8'],
  ['commercial_cleaning', 'Commercial Janitorial Pack', 'Facility zones, nightly routes, supply usage, inspections, and service-level tracking for janitorial operations.', ['Facility zones', 'Quality inspections', 'Supply controls'], '#397b89'],
  ['pest_control', 'Pest Control Pack', 'Treatment plans, chemical application logs, device monitoring, and recurring inspection workflows.', ['Treatment records', 'Device monitoring', 'Compliance logs'], '#75613b'],
  ['roofing', 'Roofing Contractor Pack', 'Roof measurements, inspection findings, material takeoffs, storm claims, and installation milestones.', ['Roof diagrams', 'Material takeoffs', 'Claims documentation'], '#8a4f42'],
  ['garage_door', 'Garage Door Service Pack', 'Door and opener asset records, safety inspections, spring-cycle tracking, and installation templates.', ['Door assets', 'Safety checks', 'Spring lifecycle'], '#596879'],
  ['appliance_repair', 'Appliance Repair Pack', 'Model and serial lookup, diagnostic codes, warranty status, parts ordering, and repair histories.', ['Model diagnostics', 'Parts tracking', 'Warranty service'], '#536fa3'],
  ['handyman', 'Handyman Services Pack', 'Flexible task lists, multi-skill estimates, small-project scheduling, and customer punch lists.', ['Multi-task jobs', 'Project punch lists', 'Flexible estimates'], '#9a7041'],
  ['painting', 'Painting Contractor Pack', 'Surface measurements, color and finish schedules, prep checklists, crew production, and material estimates.', ['Color schedules', 'Surface measurements', 'Paint usage'], '#9168a7'],
  ['pressure_washing', 'Pressure Washing Pack', 'Surface-area pricing, chemical mixes, before-and-after documentation, and property protection checklists.', ['Area-based pricing', 'Chemical tracking', 'Photo documentation'], '#287fa1'],
  ['pool_spa', 'Pool & Spa Service Pack', 'Water chemistry readings, equipment assets, recurring routes, repair history, and seasonal opening or closing.', ['Chemistry logs', 'Route service', 'Seasonal care'], '#238aa2'],
  ['locksmith_security', 'Locksmith & Security Pack', 'Lock, key, access-control, and security hardware records with restricted service documentation.', ['Key records', 'Access control', 'Security hardware'], '#47566a'],
  ['tree_care', 'Tree Care & Arborist Pack', 'Tree inventory, risk assessments, treatment plans, crew equipment, and site safety workflows.', ['Tree inventory', 'Risk assessments', 'Treatment plans'], '#3f7749'],
  ['snow_removal', 'Snow & Ice Management Pack', 'Weather-triggered dispatch, site maps, material application, equipment logs, and proof-of-service records.', ['Storm dispatch', 'Salt usage', 'Proof of service'], '#6688a6'],
  ['irrigation', 'Irrigation Service Pack', 'Zone maps, controller settings, seasonal startups, winterization, leak repairs, and water-use notes.', ['Zone maps', 'Controller records', 'Winterization'], '#3d8d73'],
  ['septic', 'Septic & Wastewater Pack', 'Tank and system records, pumping schedules, inspections, disposal manifests, and regulatory documentation.', ['System assets', 'Pumping history', 'Disposal records'], '#75684c'],
  ['chimney_fireplace', 'Chimney & Fireplace Pack', 'Inspection levels, appliance records, sweeping checklists, repair findings, and safety documentation.', ['Inspection levels', 'Sweeping records', 'Safety findings'], '#9b513d'],
  ['solar', 'Solar Service Pack', 'Array, inverter, battery, commissioning, production, inspection, and maintenance workflows.', ['System commissioning', 'Production checks', 'Battery service'], '#c48728'],
  ['home_inspection', 'Home Inspection Pack', 'Property systems, structured findings, severity ratings, photo evidence, and client-ready inspection summaries.', ['Structured findings', 'Photo evidence', 'Client reports'], '#637389'],
  ['restoration', 'Restoration & Remediation Pack', 'Water, fire, mold, and disaster-loss documentation with moisture readings and equipment placement.', ['Moisture mapping', 'Equipment logs', 'Loss documentation'], '#7d5b8f'],
  ['moving', 'Moving Services Pack', 'Inventory surveys, crew and truck assignments, valuation options, signatures, and delivery confirmation.', ['Inventory surveys', 'Truck planning', 'Delivery proof'], '#4f72a3'],
  ['junk_removal', 'Junk Removal Pack', 'Volume-based estimates, disposal categories, donation tracking, truck capacity, and load documentation.', ['Volume pricing', 'Load capacity', 'Disposal tracking'], '#77704b'],
  ['window_gutter', 'Window & Gutter Cleaning Pack', 'Story, pane, linear-foot, and access-based estimating with safety and recurring-service checklists.', ['Measurement pricing', 'Access notes', 'Recurring routes'], '#38859a'],
  ['flooring', 'Flooring Installation Pack', 'Room measurements, material and waste calculations, subfloor findings, installation stages, and care guidance.', ['Room takeoffs', 'Waste factors', 'Install milestones'], '#8a6949'],
  ['property_maintenance', 'Property Maintenance Pack', 'Multi-site preventive maintenance, inspections, vendor coordination, and owner reporting for managed properties.', ['Multi-site assets', 'Preventive plans', 'Owner reporting'], '#56705f'],
  ['fencing', 'Fence & Gate Pack', 'Linear-foot estimates, material layouts, post spacing, gate hardware, permits, and installation milestones.', ['Linear estimates', 'Material layouts', 'Gate hardware'], '#7f674c']
];

function defaultMarketplaceItems(stamp) {
  const legacyKeys = {
    carpet_cleaning: { id: 'market_carpet', code: 'pack-carpet' },
    landscaping: { id: 'market_landscape', code: 'pack-landscape' }
  };
  const packs = servicePacks.map(([industry, name, description, features, accentColor]) => ({
    id: legacyKeys[industry]?.id || `market_${industry}`,
    code: legacyKeys[industry]?.code || `pack-${industry.replace(/_/g, '-')}`,
    name,
    itemType: 'service_pack',
    category: 'industry',
    description,
    provider: 'ServicePro',
    industries: [industry],
    features,
    accentColor,
    status: 'published',
    createdAt: stamp,
    updatedAt: stamp
  }));

  return [...packs,
    {id:'market_accounting',code:'connector-accounting',name:'Accounting Connector',itemType:'connector',category:'finance',description:'Synchronize customers, invoices, payments, and tax-ready summaries with your accounting platform.',provider:'ServicePro',industries:['all'],features:['Invoice sync','Payment matching','Customer sync'],accentColor:'#7256a1',status:'published',createdAt:stamp,updatedAt:stamp},
    {id:'market_payments',code:'connector-payments',name:'Payments Connector',itemType:'connector',category:'payments',description:'Accept cards and bank payments while keeping ServicePro invoice balances current.',provider:'ServicePro',industries:['all'],features:['Card payments','Bank payments','Automatic reconciliation'],accentColor:'#315ea8',status:'published',createdAt:stamp,updatedAt:stamp},
    {id:'market_theme',code:'theme-evergreen',name:'Evergreen Workspace Theme',itemType:'theme',category:'appearance',description:'A calm, high-contrast workspace theme designed for field-service offices and mobile crews.',provider:'ServicePro',industries:['all'],features:['Accessible contrast','Office and field views','Light and dark modes'],accentColor:'#1c7c68',status:'published',createdAt:stamp,updatedAt:stamp},
    {id:'market_comms',code:'extension-communications',name:'Customer Communications',itemType:'extension',category:'customer_experience',description:'Reusable appointment, arrival, estimate, invoice, and follow-up messages for any service business.',provider:'ServicePro',industries:['all'],features:['Appointment reminders','On-my-way alerts','Review requests'],accentColor:'#c77a2e',status:'published',createdAt:stamp,updatedAt:stamp}
  ];
}

module.exports = { defaultMarketplaceItems, servicePacks };
