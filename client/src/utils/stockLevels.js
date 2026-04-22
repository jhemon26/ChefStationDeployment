const toNumber = (value) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
};

export const getStockPresentation = (item) => {
  const quantity = Math.max(0, toNumber(item?.quantity) ?? 0);
  const min = toNumber(item?.par_level);
  const max = toNumber(item?.max_level);

  if (max !== null && max > 0) {
    const range = Math.max(max - (min ?? 0), 1);
    const criticalThreshold = min !== null ? min + range * 0.375 : max * 0.5;
    const warningThreshold = min !== null ? min + range * 0.625 : max * 0.75;

    if (quantity > max) {
      return { tone: 'over', width: 100, quantity };
    }

    const width = Math.max(quantity > 0 ? 6 : 0, Math.min(100, (quantity / max) * 100));

    if (quantity <= criticalThreshold) {
      return { tone: 'low', width, quantity };
    }
    if (quantity <= warningThreshold) {
      return { tone: 'med', width, quantity };
    }
    return { tone: 'ok', width, quantity };
  }

  if (min !== null && min > 0) {
    const fallbackMax = min * 4;
    const width = Math.max(quantity > 0 ? 6 : 0, Math.min(100, (quantity / fallbackMax) * 100));

    if (quantity <= min) return { tone: 'low', width, quantity };
    if (quantity <= min * 2) return { tone: 'med', width, quantity };
    return { tone: 'ok', width, quantity };
  }

  return {
    tone: quantity === 0 ? 'low' : 'ok',
    width: quantity === 0 ? 0 : 85,
    quantity,
  };
};
