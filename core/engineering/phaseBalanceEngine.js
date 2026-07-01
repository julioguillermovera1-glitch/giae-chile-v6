// GIAE Chile v1.0 · Etapa 4.0.3
// Motor de Balance de Fases y Demanda.
// Analiza R/S/T desde el Proyecto Activo y propone redistribución preliminar.

function n(value, fallback = 0){
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value, digits = 2){
  return Number(n(value).toFixed(digits));
}

function phaseCurrent(watts, voltage = 220, fp = 0.95){
  return watts / (voltage * fp);
}

function initPhases(){
  return {
    R: { powerW: 0, currentA: 0, circuits: [] },
    S: { powerW: 0, currentA: 0, circuits: [] },
    T: { powerW: 0, currentA: 0, circuits: [] }
  };
}

function addToPhase(phases, phase, circuit, powerW){
  if(!phases[phase]) return;
  phases[phase].powerW += powerW;
  phases[phase].circuits.push({
    id: circuit.id,
    number: circuit.circuitNumber,
    name: circuit.name,
    type: circuit.type,
    demandW: round(powerW, 2),
    currentA: round(phaseCurrent(powerW, 220, circuit.fp || 0.95), 2)
  });
}

function dominantAndLightPhase(phases){
  const ordered = Object.entries(phases).sort((a,b) => b[1].powerW - a[1].powerW);
  return { high: ordered[0], middle: ordered[1], low: ordered[2] };
}

function buildSuggestions(phases, imbalancePercent, threshold){
  if(imbalancePercent <= threshold) return [];
  const { high, low } = dominantAndLightPhase(phases);
  const highName = high[0];
  const lowName = low[0];
  const highData = high[1];
  const gapW = highData.powerW - low[1].powerW;
  const targetMoveW = gapW / 2;
  const candidates = [...highData.circuits]
    .filter(c => c.name && c.demandW > 0)
    .sort((a,b) => Math.abs(a.demandW - targetMoveW) - Math.abs(b.demandW - targetMoveW));
  const selected = candidates.slice(0, 3);
  if(!selected.length){
    return [{
      level: "advertencia",
      message: `Existe desbalance entre fases. Revisar distribución desde fase ${highName} hacia fase ${lowName}.`,
      action: "Ingresar fases manualmente o dividir cargas monofásicas por circuito."
    }];
  }
  return selected.map(circuit => {
    const simulatedHigh = highData.powerW - circuit.demandW;
    const simulatedLow = low[1].powerW + circuit.demandW;
    const other = Object.entries(phases).find(([p]) => p !== highName && p !== lowName)?.[1]?.powerW || 0;
    const values = [simulatedHigh, simulatedLow, other];
    const avg = values.reduce((a,b) => a + b, 0) / 3 || 1;
    const simulatedImbalance = ((Math.max(...values) - Math.min(...values)) / avg) * 100;
    return {
      level: "recomendacion",
      circuitId: circuit.id,
      circuitNumber: circuit.number,
      circuitName: circuit.name,
      from: highName,
      to: lowName,
      demandW: round(circuit.demandW, 2),
      estimatedImbalancePercent: round(simulatedImbalance, 1),
      message: `Mover circuito ${circuit.number || circuit.id} (${circuit.name}) desde fase ${highName} hacia fase ${lowName}.`,
      action: `Desbalance estimado después del cambio: ${round(simulatedImbalance, 1)}%. Validar en terreno y revisar cargas críticas.`
    };
  });
}

export function calculatePhaseBalance(circuits = [], project = {}){
  const isThreePhase = project?.supplyType === "trifasico";
  const threshold = n(project?.phaseBalanceThresholdPercent, 15);
  const phases = initPhases();

  if(!isThreePhase){
    const totalW = circuits.reduce((sum, circuit) => sum + n(circuit.demandW), 0);
    phases.R.powerW = totalW;
    phases.R.currentA = round(phaseCurrent(totalW), 2);
    phases.R.circuits = circuits.map(c => ({
      id: c.id,
      number: c.circuitNumber,
      name: c.name,
      type: c.type,
      demandW: n(c.demandW),
      currentA: n(c.currentA)
    }));
    return {
      version: "4.0.3",
      applies: false,
      status: "No aplica",
      thresholdPercent: threshold,
      phases,
      summary: {
        totalDemandW: round(totalW, 2),
        maxPhaseW: round(totalW, 2),
        minPhaseW: round(totalW, 2),
        averageW: round(totalW, 2),
        imbalancePercent: 0,
        recommendation: "Proyecto monofásico: no aplica balance trifásico."
      },
      suggestions: [],
      trace: [{ source: "GIAE 4.0.3", rule: "BAL-MONO-001", result: "Balance trifásico no aplicable para suministro monofásico." }]
    };
  }

  circuits.forEach(circuit => {
    const demandW = n(circuit.demandW);
    if(circuit.phase === "R-S-T"){
      const each = demandW / 3;
      addToPhase(phases, "R", circuit, each);
      addToPhase(phases, "S", circuit, each);
      addToPhase(phases, "T", circuit, each);
      return;
    }
    const phase = ["R","S","T"].includes(circuit.phase) ? circuit.phase : "R";
    addToPhase(phases, phase, circuit, demandW);
  });

  Object.values(phases).forEach(phase => {
    phase.powerW = round(phase.powerW, 2);
    phase.currentA = round(phaseCurrent(phase.powerW), 2);
  });

  const values = Object.values(phases).map(p => p.powerW);
  const maxPhaseW = Math.max(...values);
  const minPhaseW = Math.min(...values);
  const averageW = values.reduce((a,b) => a + b, 0) / 3 || 1;
  const imbalancePercent = round(((maxPhaseW - minPhaseW) / averageW) * 100, 1);
  const suggestions = buildSuggestions(phases, imbalancePercent, threshold);
  const status = imbalancePercent <= threshold ? "Balance preliminar aceptable" : "Requiere redistribución";
  const { high, low } = dominantAndLightPhase(phases);

  return {
    version: "4.0.3",
    applies: true,
    status,
    thresholdPercent: threshold,
    phases,
    summary: {
      totalDemandW: round(values.reduce((a,b) => a + b, 0), 2),
      maxPhase: high[0],
      minPhase: low[0],
      maxPhaseW: round(maxPhaseW, 2),
      minPhaseW: round(minPhaseW, 2),
      averageW: round(averageW, 2),
      imbalancePercent,
      recommendation: imbalancePercent <= threshold
        ? "Distribución preliminar de fases dentro del umbral configurado."
        : `Desbalance sobre ${threshold}%. Revisar traslado de cargas desde fase ${high[0]} hacia fase ${low[0]}.`
    },
    suggestions,
    trace: [
      { source: "GIAE 4.0.3", rule: "BAL-TRI-001", result: `Desbalance calculado: ${imbalancePercent}%. Umbral preliminar: ${threshold}%.` },
      { source: "RIC 3", rule: "RIC3-DEM-001", result: "Balance calculado sobre demanda del Proyecto Activo." },
      { source: "Motor Normativo", rule: "NO-INVENTAR", result: "La redistribución es recomendación preliminar; debe validarse según proyecto, tablero y ejecución real." }
    ]
  };
}
