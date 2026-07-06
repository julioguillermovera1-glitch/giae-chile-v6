const DEFAULT_SETTINGS = {
  ivaPercent: 19,
  marginPercent: 18,
  discountPercent: 0,
  laborRates: {
    circuitBase: 18000,
    tableroBase: 85000,
    empalmeBase: 45000,
    tierraBase: 38000,
    documentacionBase: 25000,
    metroCanalizacion: 2200,
    metroConductor: 850
  },
  defaultPrices: {
    conductor_1_5: 420,
    conductor_2_5: 650,
    conductor_4: 980,
    conductor_6: 1350,
    automatico: 8500,
    diferencial: 28000,
    gabinete: 42000,
    barra: 9500,
    emt: 3200,
    electrodo: 14500,
    camara_tierra: 18000,
    empalme: 35000,
    varios: 12000
  }
};

function money(value){ return Math.round(Number(value || 0)); }
function slug(value){ return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,''); }
function unitPriceFor(item, settings){
  const key = slug(item.item || item.name || item.family || 'varios');
  const prices = settings.defaultPrices || DEFAULT_SETTINGS.defaultPrices;
  if(key.includes('1_5')) return prices.conductor_1_5;
  if(key.includes('2_5')) return prices.conductor_2_5;
  if(key.includes('4')) return prices.conductor_4;
  if(key.includes('6')) return prices.conductor_6;
  if(key.includes('diferencial')) return prices.diferencial;
  if(key.includes('automatico') || key.includes('interruptor')) return prices.automatico;
  if(key.includes('gabinete') || key.includes('tablero')) return prices.gabinete;
  if(key.includes('barra')) return prices.barra;
  if(key.includes('emt') || key.includes('canalizacion')) return prices.emt;
  if(key.includes('electrodo')) return prices.electrodo;
  if(key.includes('camara')) return prices.camara_tierra;
  if(key.includes('empalme')) return prices.empalme;
  return prices.varios;
}

function normalizeMaterial(item, settings, source){
  const qty = Number(item.qty || item.quantity || item.cantidad || 1) || 1;
  const unit = item.unit || item.unidad || 'un';
  const price = Number(item.unitPrice || item.precioUnitario || unitPriceFor(item, settings));
  return {
    id: item.id || `${source}-${slug(item.item || item.name || item.family)}-${Math.random().toString(36).slice(2,6)}`,
    source,
    family: item.family || item.familia || source,
    item: item.item || item.name || item.descripcion || 'Material sin nombre',
    qty,
    unit,
    unitPrice: money(price),
    total: money(price * qty),
    circuits: item.circuits || item.circuitos || []
  };
}

function collectMaterials(project, settings){
  const list = [];
  (project.engineeringMaterials || []).forEach(item => list.push(normalizeMaterial(item, settings, 'Ingeniería')));
  (project.panelMaterials || []).forEach(item => list.push(normalizeMaterial(item, settings, 'Tablero')));
  if(project.connection){
    list.push(normalizeMaterial({ family:'Empalme', item: project.connection.connectionType || 'Empalme normalizado', qty:1, unit:'gl' }, settings, 'Empalme'));
  }
  if(project.grounding){
    const groundingMaterials = Array.isArray(project.grounding.materials) ? project.grounding.materials : [];
    if(groundingMaterials.length){
      groundingMaterials.forEach(item => list.push(normalizeMaterial(item, settings, 'Puesta a tierra')));
    } else {
      list.push(normalizeMaterial({ family:'Tierra', item:'Sistema de puesta a tierra preliminar', qty:1, unit:'gl' }, settings, 'Puesta a tierra'));
    }
  }
  if(!list.length && Array.isArray(project.loads) && project.loads.length){
    project.loads.forEach((load, index) => {
      list.push(normalizeMaterial({ family:'Circuitos', item:`Materiales circuito ${index + 1} · ${load.name || load.type}`, qty:1, unit:'gl' }, settings, 'Cargas'));
    });
  }
  return groupMaterials(list);
}

function groupMaterials(items){
  const map = new Map();
  items.forEach(item => {
    const key = `${item.family}|${item.item}|${item.unit}|${item.unitPrice}`;
    if(!map.has(key)) map.set(key, { ...item, ids:[item.id], circuits:[...(item.circuits || [])] });
    else {
      const current = map.get(key);
      current.qty += item.qty;
      current.total = money(current.qty * current.unitPrice);
      current.ids.push(item.id);
      current.circuits = Array.from(new Set([...(current.circuits || []), ...(item.circuits || [])]));
    }
  });
  return Array.from(map.values()).sort((a,b)=> String(a.family).localeCompare(String(b.family), 'es'));
}

function calculateLabor(project, settings){
  const rates = { ...DEFAULT_SETTINGS.laborRates, ...(settings.laborRates || {}) };
  const circuitCount = (project.loadBoard || project.loads || []).length;
  const conductorMeters = (project.engineeringMaterials || []).filter(m => String(m.unit).toLowerCase()==='m').reduce((s,m)=>s + Number(m.qty || 0),0);
  const items = [
    { id:'labor-circuitos', concept:'Montaje y cableado de circuitos', qty:circuitCount, unit:'circuito', unitPrice:rates.circuitBase },
    { id:'labor-conductores', concept:'Tendido de conductores/canalizaciones', qty:Math.max(0, conductorMeters), unit:'m', unitPrice:rates.metroConductor },
    { id:'labor-tablero', concept:'Montaje de tablero y protecciones', qty: project.panel ? 1 : 0, unit:'gl', unitPrice:rates.tableroBase },
    { id:'labor-empalme', concept:'Gestión y preparación de empalme', qty: project.connection ? 1 : 0, unit:'gl', unitPrice:rates.empalmeBase },
    { id:'labor-tierra', concept:'Puesta a tierra y medición', qty: project.grounding ? 1 : 0, unit:'gl', unitPrice:rates.tierraBase },
    { id:'labor-documentacion', concept:'Documentación técnica', qty: project.documentationEngine ? 1 : 0, unit:'gl', unitPrice:rates.documentacionBase }
  ].filter(item => Number(item.qty) > 0);
  return items.map(item => ({ ...item, total: money(item.qty * item.unitPrice) }));
}

export function calculateCommercialProject(project, options = {}){
  const settings = { ...DEFAULT_SETTINGS, ...(options || {}), ...(project.commercialSettings || {}) };
  const materials = collectMaterials(project, settings);
  const labor = calculateLabor(project, settings);
  const materialsSubtotal = materials.reduce((sum, item)=> sum + item.total, 0);
  const laborSubtotal = labor.reduce((sum, item)=> sum + item.total, 0);
  const directCost = materialsSubtotal + laborSubtotal;
  const margin = money(directCost * (Number(settings.marginPercent || 0) / 100));
  const discount = money((directCost + margin) * (Number(settings.discountPercent || 0) / 100));
  const net = Math.max(0, directCost + margin - discount);
  const iva = money(net * (Number(settings.ivaPercent || 0) / 100));
  const total = net + iva;
  const status = materials.length || labor.length ? 'Presupuesto preliminar generado' : 'Sin datos técnicos suficientes';
  const observations = [];
  if(!materials.length) observations.push('No hay materiales técnicos generados por los motores.');
  if(project.gpe?.pending?.length) observations.push('Existen partidas técnicas pendientes en el GPE.');
  return {
    version:'9.0.1',
    status,
    generatedAt:new Date().toLocaleString('es-CL'),
    settings:{ ivaPercent:settings.ivaPercent, marginPercent:settings.marginPercent, discountPercent:settings.discountPercent },
    materials,
    labor,
    totals:{ materialsSubtotal, laborSubtotal, directCost, margin, discount, net, iva, total },
    observations,
    trace:['Proyecto Activo','BUCE','Motor de Ingeniería','Motor de Tableros','Motor de Empalmes','Motor Documental']
  };
}

export function exportCommercialReport(project){
  const result = project.commercialEngine || calculateCommercialProject(project);
  return {
    type:'giae-commercial-report',
    project:{ id:project.id, name:project.name, client:project.client, company:project.company, installer:project.installer },
    commercial:result,
    copyright:'Diseñado y desarrollado por Julio Guillermo Vera · © 2026 GIAE Chile. Todos los derechos reservados.'
  };
}
