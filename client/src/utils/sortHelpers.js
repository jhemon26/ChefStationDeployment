export const sortAlpha = (items, selector) =>
  [...(items || [])].sort((a, b) =>
    String(selector(a)).localeCompare(String(selector(b)), undefined, { sensitivity: 'base' })
  );
