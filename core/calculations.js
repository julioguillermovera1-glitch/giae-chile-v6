export function currentSinglePhase(powerW, voltage = 220, powerFactor = 1) {
  return safeRound(powerW / (voltage * powerFactor), 2);
}

export function currentThreePhase(powerW, voltage = 380, powerFactor = 1) {
  return safeRound(powerW / (Math.sqrt(3) * voltage * powerFactor), 2);
}

export function totalPower(loads) {
  return loads.reduce((sum, item) => sum + Number(item.powerW || 0), 0);
}

export function applyDiversity(powerW, factor) {
  return safeRound(powerW * Number(factor || 1), 2);
}

export function suggestBreaker(currentA) {
  const ratings = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
  return ratings.find(rating => rating >= currentA) || null;
}

export function safeRound(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}
