export type IndiaDeliveryParts = {
  houseNumber: string;
  floor: string;
  tower: string;
  societyName: string;
  landmark: string;
  line1: string;
  area: string;
};

export type IndiaDeliveryInput = {
  formatted?: string;
  name?: string;
  streetNumber?: string;
  subpremise?: string;
  premise?: string;
  building?: string;
  road?: string;
  neighborhood?: string;
  sublocalities?: string[];
  /** Google component with sublocality_level_1 (often the society / township). */
  sublocalityLevel1?: string;
  landmarkName?: string;
  city?: string;
  state?: string;
  types?: string[];
  amenity?: string;
};

const ROADISH =
  /\b(?:road|rd\.?|marg|street|st\.?|lane|ln\.?|highway|nh-?\d*|expressway|bypass)\b/i;
const SOCIETY_HINT =
  /\b(?:society|apartments?|greens?|residency|enclave|homes?|complex|township|heights|villas?|garden|estate|courtyard|towers?|housing|colony|vihar|kunj|residents?)\b/i;
const TOWER_FULL =
  /^(?:building|bldg\.?|tower|block|wing|phase)\s*[-:]?\s*([A-Za-z]?\d{0,4}|[A-Za-z])$/i;
const TOWER_SHORT = /^[A-Z]\d{1,3}$/i;
const FLOOR_PAT =
  /(?:^|\b)(?:floor|flr|level|lvl)\s*[-:]?\s*(\d{1,2})\b|(?:^|\b)(\d{1,2})(?:st|nd|rd|th)\s*(?:floor|flr)\b/i;
const FLAT_PAT =
  /(?:flat|apt\.?|apartment|unit|house|plot|villa|#)\s*[-:]?\s*([A-Z0-9][A-Z0-9/-]{0,11})/i;

function uniqueJoin(parts: Array<string | undefined>): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    const value = String(part || '').trim();
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out.join(', ');
}

export function floorFromUnit(unit: string): string {
  const digits = String(unit || '').replace(/\D/g, '');
  if (digits.length === 3) {
    const floor = Number(digits[0]);
    return floor > 0 ? String(floor) : '';
  }
  if (digits.length === 4) {
    const floor = Number(digits.slice(0, 2));
    return floor >= 1 && floor <= 45 ? String(floor) : '';
  }
  return '';
}

export function parseTowerToken(raw: string): string {
  const value = String(raw || '').trim();
  if (!value) return '';
  const labeled = value.match(TOWER_FULL);
  if (labeled?.[1]) return labeled[1].toUpperCase();
  if (TOWER_SHORT.test(value) && value.length <= 4) return value.toUpperCase();
  return '';
}

function parseCombo(raw: string): { tower: string; house: string; floor: string } | null {
  const value = String(raw || '').trim();
  const match =
    value.match(/^([A-Z]\d{1,3})\s*[-/]\s*(\d{2,4})$/i) ||
    value.match(/^([A-Z]\d{1,3})\s+(\d{2,4})$/i);
  if (!match) return null;
  return {
    tower: match[1].toUpperCase(),
    house: match[2],
    floor: floorFromUnit(match[2]),
  };
}

function parseFloorToken(raw: string): string {
  const match = String(raw || '').match(FLOOR_PAT);
  if (!match) return '';
  return String(Number(match[1] || match[2]));
}

function isSectorOrZone(raw: string): boolean {
  return /^(?:sector|phase|pocket|zone|ward)\b/i.test(String(raw || '').trim());
}

const COMMERCIAL_POI = new Set([
  'restaurant',
  'food',
  'cafe',
  'bar',
  'store',
  'supermarket',
  'shopping_mall',
  'tourist_attraction',
  'transit_station',
  'hospital',
  'bank',
  'atm',
  'gas_station',
  'parking',
]);

function isCommercialPoi(types: string[]): boolean {
  return types.some((type) => COMMERCIAL_POI.has(type));
}

/** Google India often puts the plot/house on `premise` (e.g. "85"), not street_number. */
export function looksLikeHouseOrPlot(raw: string): boolean {
  const value = String(raw || '').trim();
  if (!value || SOCIETY_HINT.test(value) || parseTowerToken(value) || parseCombo(value)) return false;
  if (isSectorOrZone(value)) return false;
  if (/^(?:plot|house|khasra)(?:\s+no\.?)?\s*[-.:]?\s*\S+/i.test(value) && value.length <= 48) return true;
  if (/^\d{1,6}[A-Z]?$/i.test(value)) return true;
  if (/^[A-Z]-?\d{1,4}$/i.test(value)) return true;
  return value.length <= 6 && /\d/.test(value) && !/[a-z]{3,}/i.test(value);
}

function societyFromSearchedPlace(name: string, types: string[], cityLc: string): string {
  const value = name.trim();
  if (!value || value.toLowerCase() === cityLc) return '';
  if (ROADISH.test(value) || parseTowerToken(value) || looksLikeHouseOrPlot(value) || isSectorOrZone(value)) {
    return '';
  }
  if (isCommercialPoi(types)) return '';
  if (types.includes('establishment') || types.includes('premise')) return value;
  return '';
}

function stripNearPrefix(raw: string): string {
  return String(raw || '').replace(/^near\s+/i, '').trim();
}

function isAreaNoise(part: string, cityLc: string, stateLc: string): boolean {
  const value = part.trim();
  const lc = value.toLowerCase();
  if (!value || lc === cityLc || lc === stateLc) return true;
  if (/^\d{6}$/.test(value.replace(/\s/g, ''))) return true;
  if (/^(?:sector|phase|pocket|zone|ward|district|tehsil|division)\b/i.test(value)) return true;
  if (/(?:pradesh|bengal|nadu|rashtra|khand|kashmir|^india$)/i.test(value)) return true;
  if (/^greater\s+/i.test(value) && !SOCIETY_HINT.test(value)) return true;
  if (/\b(?:village|tehsil|district|division)\b/i.test(value) && !SOCIETY_HINT.test(value)) return true;
  if (/\b(?:west|east|north|south|extension)\s*$/i.test(value) && !SOCIETY_HINT.test(value)) return true;
  if (/^(?:near\s+)/i.test(value)) return true;
  if (/\b(?:chauraha|chowk|crossing|circle|metro|market|mandi|bus\s*stand)\b/i.test(value) && !SOCIETY_HINT.test(value)) {
    return true;
  }
  if (ROADISH.test(value)) return true;
  if (looksLikeHouseOrPlot(value) || parseTowerToken(value) || parseCombo(value)) return true;
  return false;
}

function societyScore(part: string, cityLc: string, stateLc: string): number {
  const value = stripNearPrefix(part);
  if (!value || isAreaNoise(value, cityLc, stateLc)) return 0;
  if (parseTowerToken(value) || parseCombo(value) || looksLikeHouseOrPlot(value)) return 0;
  let score = 0;
  if (SOCIETY_HINT.test(value)) score += 80;
  if (/\d/.test(value) && SOCIETY_HINT.test(value)) score += 10;
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && /[a-z]/i.test(value)) score += 8;
  return score;
}

function pickSocietyName(candidates: string[], cityLc: string, stateLc: string): string {
  let best = '';
  let bestScore = 0;
  const seen = new Set<string>();
  for (const raw of candidates) {
    const value = stripNearPrefix(String(raw || '').trim());
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    const score = societyScore(value, cityLc, stateLc);
    if (score > bestScore) {
      bestScore = score;
      best = value;
    }
  }
  return bestScore >= 80 ? best : bestScore >= 16 ? best : '';
}

function applyToken(
  raw: string | undefined,
  out: { houseNumber: string; floor: string; tower: string },
): void {
  const value = String(raw || '').trim();
  if (!value || isSectorOrZone(value) || SOCIETY_HINT.test(value)) return;
  const combo = parseCombo(value);
  if (combo) {
    if (!out.tower) out.tower = combo.tower;
    if (!out.houseNumber) out.houseNumber = combo.house;
    if (!out.floor) out.floor = combo.floor;
    return;
  }
  const tower = parseTowerToken(value);
  if (tower) {
    if (!out.tower) out.tower = tower;
    return;
  }
  if (looksLikeHouseOrPlot(value) && !out.houseNumber) {
    out.houseNumber = value;
    if (!out.floor) out.floor = floorFromUnit(value);
    return;
  }
  const floor = parseFloorToken(value);
  if (floor && !out.floor) out.floor = floor;
  const flat = value.match(FLAT_PAT);
  if (flat?.[1]) {
    if (!out.houseNumber) out.houseNumber = flat[1];
    if (!out.floor) out.floor = floorFromUnit(flat[1]);
  }
}

/** Split Google / OSM strings into house, floor, tower, society, landmark, street line. */
export function extractIndiaDeliveryParts(input: IndiaDeliveryInput): IndiaDeliveryParts {
  const out = { houseNumber: '', floor: '', tower: '' };
  const cityLc = String(input.city || '').trim().toLowerCase();
  const stateLc = String(input.state || '').trim().toLowerCase();
  const road = String(input.road || '').trim();
  const neighborhood = String(input.neighborhood || '').trim();
  const types = input.types || [];
  const name = String(input.name || '').trim();
  const premise = String(input.premise || input.building || '').trim();

  applyToken(input.streetNumber, out);
  applyToken(input.subpremise, out);
  applyToken(premise, out);
  applyToken(input.building, out);

  const street = String(input.streetNumber || '').trim();
  if (
    street &&
    !out.houseNumber &&
    !parseTowerToken(street) &&
    !parseCombo(street) &&
    !isSectorOrZone(street)
  ) {
    out.houseNumber = street;
    if (!out.floor) out.floor = floorFromUnit(street);
  }

  const sub = String(input.subpremise || '').trim();
  if (sub && !out.floor) out.floor = parseFloorToken(sub);
  if (sub && !out.houseNumber && !parseTowerToken(sub) && !parseCombo(sub) && !parseFloorToken(sub)) {
    out.houseNumber = sub.replace(/^#/, '');
    if (!out.floor) out.floor = floorFromUnit(out.houseNumber);
  }

  const formattedParts = String(input.formatted || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  for (const part of formattedParts) {
    applyToken(part, out);
  }

  const societyName =
    societyFromSearchedPlace(name, types, cityLc) ||
    String(input.sublocalityLevel1 || '').trim() ||
    pickSocietyName(
      [
        ...(input.sublocalities || []),
        neighborhood,
        ...formattedParts,
        looksLikeHouseOrPlot(premise) ? '' : premise,
      ],
      cityLc,
      stateLc,
    );

  const amenity = String(input.amenity || '').trim();
  const landmarkComp = stripNearPrefix(String(input.landmarkName || '').trim());
  const nearPart = formattedParts.find((part) => /^near\s+/i.test(part));
  let landmark = landmarkComp || stripNearPrefix(nearPart || '') || amenity;
  if (
    !landmark ||
    landmark.toLowerCase() === societyName.toLowerCase() ||
    parseTowerToken(landmark)
  ) {
    landmark = '';
  }
  if (isCommercialPoi(types) && name && name.toLowerCase() !== societyName.toLowerCase()) {
    landmark = landmark || name;
  }

  const areaParts = [
    road,
    ...(input.sublocalities || []),
    neighborhood,
  ].filter((part) => {
    const value = String(part || '').trim();
    if (!value) return false;
    if (societyName && value.toLowerCase() === societyName.toLowerCase()) return false;
    if (parseTowerToken(value) || looksLikeHouseOrPlot(value)) return false;
    return true;
  });
  const constructed = uniqueJoin(areaParts);
  const formatted = String(input.formatted || '').replace(/\s+/g, ' ').trim();
  const includes = (hay: string, needle: string) =>
    Boolean(needle) && hay.toLowerCase().includes(needle.trim().toLowerCase());

  let area = formatted;
  if (road && area && !includes(area, road)) area = uniqueJoin([road, area]);
  if (
    name &&
    area &&
    !includes(area, name) &&
    !parseTowerToken(name) &&
    !looksLikeHouseOrPlot(name) &&
    name.toLowerCase() !== cityLc
  ) {
    area = uniqueJoin([name, area]);
  }
  if (!area) {
    area =
      uniqueJoin([name, constructed, String(input.city || '').trim(), String(input.state || '').trim()]) ||
      constructed ||
      neighborhood ||
      road ||
      name ||
      '';
  }

  return {
    houseNumber: out.houseNumber,
    floor: out.floor,
    tower: out.tower,
    societyName,
    landmark,
    line1: area,
    area,
  };
}
