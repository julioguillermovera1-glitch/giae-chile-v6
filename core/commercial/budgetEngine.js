const DEFAULT_SETTINGS = {
  ivaPercent: 19,
  marginPercent: 18,
  discountPercent: 0,
  validityDays: 15,
  otherExpensesLabel: "Gastos varios (transporte, permisos, certificación)",
  otherExpensesAmount: 0,
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
  },
  // Precios por defecto de las partidas que vienen del Plano CAD (simbolos
  // de instalacion dibujados). Igual que el resto de defaultPrices, son un
  // punto de partida editable por cada empresa/instalador, no un precio fijo.
  cadFixturePrices: {
    light: 6500,
    switch: 5500,
    outlet: 4500,
    "outlet-double": 6500,
    "outlet-triple": 8500,
    motor: 45000,
    junction: 3500,
    ground: 14500
  }
};

// Simbolos del Plano CAD que representan una instalacion fisica real y por
// lo tanto se convierten en materiales. "panel" y "breaker" quedan afuera a
// proposito: esos ya los calcula el motor de Tableros (panelEngine) con las
// cargas reales del proyecto, y contarlos tambien aqui los duplicaria.
const CAD_FIXTURE_LABELS = {
  light: "Punto de luz",
  switch: "Interruptor de alumbrado",
  outlet: "Enchufe simple",
  "outlet-double": "Enchufe doble",
  "outlet-triple": "Enchufe triple",
  motor: "Punto de fuerza",
  junction: "Caja de derivación",
  ground: "Electrodo de puesta a tierra"
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

// Convierte cada simbolo de instalacion dibujado en el Plano CAD
// (project.cad2d) en una partida real de materiales, contando cuantos hay
// de cada tipo. Se agrega SIEMPRE (aparte de collectMaterials), ya que
// enchufes/luces/interruptores dibujados en el plano no estan representados
// en ningun otro lado del presupuesto hoy.
function collectCadMaterials(project, settings){
  const entities = Array.isArray(project.cad2d?.entities) ? project.cad2d.entities : [];
  const prices = { ...DEFAULT_SETTINGS.cadFixturePrices, ...(settings.cadFixturePrices || {}) };
  const counts = new Map();
  entities.forEach(entity => {
    const symbolId = entity.symbolId;
    if(!(symbolId in CAD_FIXTURE_LABELS)) return;
    const current = counts.get(symbolId) || { qty: 0, circuits: new Set() };
    current.qty += 1;
    if(entity.circuitId) current.circuits.add(entity.circuitId);
    counts.set(symbolId, current);
  });
  return Array.from(counts.entries()).map(([symbolId, data]) => {
    const unitPrice = money(prices[symbolId] ?? 0);
    return {
      id: `cad-${symbolId}`,
      source: 'Plano CAD',
      family: 'Instalación',
      item: CAD_FIXTURE_LABELS[symbolId],
      qty: data.qty,
      unit: 'un',
      unitPrice,
      total: money(unitPrice * data.qty),
      circuits: Array.from(data.circuits)
    };
  });
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
  const cadMaterials = collectCadMaterials(project, settings);
  const materials = [...collectMaterials(project, settings), ...cadMaterials];
  const labor = calculateLabor(project, settings);
  const materialsSubtotal = materials.reduce((sum, item)=> sum + item.total, 0);
  const laborSubtotal = labor.reduce((sum, item)=> sum + item.total, 0);
  const otherExpenses = money(settings.otherExpensesAmount || 0);
  const directCost = materialsSubtotal + laborSubtotal + otherExpenses;
  const margin = money(directCost * (Number(settings.marginPercent || 0) / 100));
  const discount = money((directCost + margin) * (Number(settings.discountPercent || 0) / 100));
  const net = Math.max(0, directCost + margin - discount);
  const iva = money(net * (Number(settings.ivaPercent || 0) / 100));
  const total = net + iva;
  const status = materials.length || labor.length ? 'Presupuesto preliminar generado' : 'Sin datos técnicos suficientes';
  const observations = [];
  if(!materials.length) observations.push('No hay materiales técnicos generados por los motores.');
  if(!cadMaterials.length) observations.push('El Plano CAD no tiene símbolos de instalación dibujados (enchufes, luces, interruptores, etc.) - no se generaron materiales desde el plano.');
  if(project.gpe?.pending?.length) observations.push('Existen partidas técnicas pendientes en el GPE.');
  const generatedAtMs = Date.now();
  const validityDays = Number(settings.validityDays || 0);
  const validUntil = validityDays > 0 ? new Date(generatedAtMs + validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('es-CL') : null;
  return {
    version:'9.0.1',
    status,
    generatedAt:new Date(generatedAtMs).toLocaleString('es-CL'),
    validityDays,
    validUntil,
    settings:{ ivaPercent:settings.ivaPercent, marginPercent:settings.marginPercent, discountPercent:settings.discountPercent, validityDays:settings.validityDays, otherExpensesLabel:settings.otherExpensesLabel, otherExpensesAmount:settings.otherExpensesAmount },
    materials,
    labor,
    otherExpensesLabel: settings.otherExpensesLabel,
    totals:{ materialsSubtotal, laborSubtotal, otherExpenses, directCost, margin, discount, net, iva, total },
    observations,
    trace:['Proyecto Activo','BUCE','Motor de Ingeniería','Motor de Tableros','Motor de Empalmes','Motor Documental', ...(cadMaterials.length ? ['Plano CAD'] : [])]
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
