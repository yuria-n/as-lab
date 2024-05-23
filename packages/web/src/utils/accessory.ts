import { entities } from '@as-lab/core';

export function getAccessoryTitle(
  { title, skillFields, attribute }: entities.Accessory,
  textMap?: Record<entities.Card.Attribute, string>,
) {
  // TODO: Fix the logic below
  const num = skillFields[skillFields.length - 1];
  const effect = `${num}${num > 100 ? '' : '%'}`;
  const attr = textMap && attribute ? `[${textMap[attribute]}] ` : '';
  return `${attr}${title} (${effect})`;
}

export function getAccessoryImageUrl(type: entities.Accessory['type'], attribute: entities.Accessory['attribute']) {
  return `${process.env.PUBLIC_URL}/assets/accessories/${type}_${attribute}_UR.jpg`;
}
