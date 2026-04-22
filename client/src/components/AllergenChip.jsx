const classMap = {
  'milk/dairy': 'dairy',
  'tree nuts': 'nuts',
};

export default function AllergenChip({ allergen }) {
  const value = typeof allergen === 'string' ? allergen : allergen?.name || '';
  const slug = (classMap[value.toLowerCase()] || value.toLowerCase()).replace(/\s+/g, '-');
  const cssClass = [
    'allergen-chip',
    slug === 'tree-nuts' ? 'nuts' : slug,
    allergen?.is_custom ? 'custom' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={cssClass}>{value}</span>;
}
