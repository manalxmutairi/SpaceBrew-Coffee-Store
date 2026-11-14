// Server-owned prices: never accept an amount or currency from the browser.
export const catalog = [
  { id: 'moonbeam', name: 'Moonbeam Blend', amount: 5500 },
  { id: 'sunspell', name: 'Sunspell Roast', amount: 5750 },
  { id: 'stardust', name: 'Stardust Decaf', amount: 5250 },
  { id: 'comet', name: 'Comet Chaser', amount: 6000 },
  { id: 'cloudberry', name: 'Cloudberry Daybreak', amount: 5750 },
  { id: 'cinder', name: 'Cinder & Cinnamon', amount: 5500 },
  { id: 'blue-hour', name: 'Blue Hour Espresso', amount: 6500 },
  { id: 'honey-orbit', name: 'Honey Orbit', amount: 6000 },
  { id: 'moon-phase-mug', name: 'Moon Phase Mug', amount: 5500 },
  { id: 'orbit-travel-cup', name: 'Orbit Travel Cup', amount: 8000 },
  { id: 'comet-hand-grinder', name: 'Comet Hand Grinder', amount: 13500 },
  { id: 'stardust-pour-over', name: 'Stardust Pour-Over Set', amount: 10000 },
] as const;

export const priceLookupKey = (id: string) => `cosmic_${id}_kwd_test_v1`;

export function validateCart(input: unknown) {
  if (!Array.isArray(input) || input.length < 1 || input.length > catalog.length) {
    throw new Error('Choose between 1 and 12 different products.');
  }
  const seen = new Set<string>();
  const items = input.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw new Error('Invalid bag item.');
    const { id, quantity } = item as Record<string, unknown>;
    const product = catalog.find((product) => product.id === id);
    if (!product || typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > 10 || seen.has(product.id)) {
      throw new Error('Each product needs a quantity between 1 and 10.');
    }
    seen.add(product.id);
    return { ...product, quantity };
  });
  if (items.reduce((total, item) => total + item.quantity, 0) > 25) {
    throw new Error('Please limit each order to 25 items.');
  }
  return items;
}
