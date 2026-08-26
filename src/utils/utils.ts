import { EventEmitter } from '@stencil/core';

export const inheritAttributes = (
  el: HTMLElement,
  shadowElement: HTMLElement,
  attributes: string[] = [],
) => {
  const attributeObject = {};
  const attributesToRemove = [];

  // Check for any aria attributes
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    if (attr.name.includes('aria-')) {
      attributeObject[attr.name] = attr.value;
      attributesToRemove.push(attr.name);
    }
  }

  // Check for attributes defined by component
  attributes.forEach(attr => {
    if (
      el.hasAttribute(attr) ||
      (shadowElement && shadowElement.hasAttribute(attr))
    ) {
      const value = el.getAttribute(attr) || shadowElement.getAttribute(attr);
      if (value !== null) {
        attributeObject[attr] =
          el.getAttribute(attr) || shadowElement.getAttribute(attr);
      }
      el.removeAttribute(attr);
    }
  });

  return attributeObject;
};

/*
 * Get language to use for component based on the following priority:
 * 1. lang attribute on component
 * 2. lang attribute on closest parent with a lang attribute
 * 3. default to English
 */
export const assignLanguage = (el: HTMLElement): string => {
  const rawLang =
    el.lang ||
    el.getAttribute('lang') ||
    closestElement('[lang]', el)?.getAttribute('lang') ||
    'en';

  return rawLang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
};

// Allows use of closest() function across shadow boundaries
export const closestElement = (selector, el) => {
  if (el) {
    return (
      (el &&
        el != document &&
        typeof window != 'undefined' &&
        el != window &&
        el.closest(selector)) ||
      closestElement(selector, el.getRootNode().host)
    );
  }

  return null;
};

export const observerConfig = {
  attributes: true,
  attributeOldValue: true,
  attributeFilter: ['lang'],
};

// Emit event with logic to cancel HTML events
// Returns false if event has been prevented
export const emitEvent = (
  e: Event,
  customEvent: EventEmitter,
  value?: unknown,
) => {
  const event = customEvent.emit(value);

  // Was the custom or native event interrupted
  if (event.defaultPrevented || e.defaultPrevented) {
    // Stop native HTML event in shadow-dom
    e.preventDefault();
    return false;
  }

  return true;
};

/* Log validation error for required properties in components
 * @param name - name of the component i.e. <gcds-*>
 * @param errorArr - array of attributes with errors
 * @param optionalAttrsArrToRemove - array of optional attributes with errors to be removed from this error message
 */
export const logError = (
  name: string,
  errorArr: string[],
  optionalAttrsArrToRemove?: string[],
) => {
  const engMsg = 'Render error, please check required properties.';
  const frMsg = 'Erreur de rendu, veuillez vérifier les propriétés requises.';
  const errors = [...errorArr];

  // remove any potential optional attributes from errors array
  if (optionalAttrsArrToRemove && optionalAttrsArrToRemove.length > 0) {
    for (const optionalAttr of optionalAttrsArrToRemove) {
      if (errors.includes(optionalAttr)) {
        errors.splice(errors.indexOf(optionalAttr), 1);
      }
    }
  }

  console.error(
    `${name}: ${engMsg} (${errors}) | ${name}: ${frMsg} (${errors})`,
  );
};

/* Log validation error for required properties in components
 * @param errors - array of attributes with errors
 * @param propertyName - name of the property being checked
 * @param property - value of the property being checked
 * @param external - boolean value for an external check on property value
 * @returns modified array of errors
 */
export const handleErrors = (
  errors: string[],
  propertyName: string,
  property: string | boolean | object,
  external: boolean = false,
) => {
  if (
    (property && typeof property === 'string' && property.trim() === '') ||
    !property ||
    property === '' ||
    external
  ) {
    if (!errors.includes(propertyName)) {
      errors.push(propertyName);
    }
  } else if (errors.includes(propertyName)) {
    errors.splice(errors.indexOf(propertyName), 1);
  }

  return errors;
};

/* Compare errors array to required props array
 * @param errors - array of attributes with errors
 * @param requiredProps - array of required properties to check against
 * @returns boolean if no matching errors
 */
export const isValid = (errors: string[], requiredProps: string[]) => {
  const intersection = errors.filter(x => requiredProps.includes(x));

  return intersection.length > 0 ? false : true;
};

/*
 * Personal information patterns
*/
const STREET_TYPES =
  "(?:street|avenue|road|drive|boulevard|lane|place|terrace|parkway|" +
  "circle|highway|pike|row|crescent|close|green|grove|" +
  "gate|heights|manor|ridge|rise|square|" +
  "hill|hills|acres|valley|rue|chemin|route|terrasse|rang|promenade|" +
  "all[ée]e?|st|ave|av|av\\.|rd|dr|blvd|boul|boul\\.|ln|ct|pl|" +
  "ter|terr|pkwy|cir|ci|hwy|wy|trl|cres|cr|cl|pt|gr|gv|ga|ht|hts|ld|lk|pa|" +
  "pk|rg|ri|rw|sq|tc|vi|vw|wk|co|ba|bv|hl|tr|cv|gd|mt|gw|sm|" +
  "rp|al|ch|ch\\.|chem|chem\\.|rte|all\\.|allee|prom|prom\\.)";
const NAME_PART = "(?:\\d{1,2}(?:st|nd|rd|th)|[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ''\\-]*)";
const DIRECTIONS = "(?:n|s|e|w|ne|nw|se|sw|o|no|so|north|south|east|west)";
const FR_ARTICLES =
  "(?:de\\s+la\\s+|du\\s+|des\\s+|de\\s+|le\\s+|la\\s+|les\\s+|d'|l')?";
const HOUSE_NUMBER = "(\\d{1,6}[A-Za-zÀ-ÿ]?)";

export const piiPatterns: Record<string, RegExp> = {
  digits: /\d(?:[\s\-\.\/]?\d){8,}(?!\d)/gi,
  phone: /\+?(\d{1,3})?[-._\s]?(\(?\d{3}\)?)[-._\s]?(\d{3})[-._\s]?(\d{4})/gi,
  passport: /\b[A-Za-z]{2}[\s\.-]*?\d{6}\b/gi,
  email: /\b(?:[a-zA-Z0-9_\-\.]+)(?:@|%40|%2540)(?:[a-zA-Z0-9_\-\.]+)\.(?:[a-zA-Z]{2,5})\b/gi,
  looseEmail: /([a-zA-Z0-9_\-.]+)\s*@([\sa-zA-Z0-9_\-.]+)[.,]([a-zA-Z]{1,5})/g,
  looseEmail2: /([a-zA-Z0-9._%+-]+)\s?@\s?(gmail|outlook|icloud|hotmail|yahoo)(\s?\.?\s?(com|ca))?/gi,
  looseEmail3: /([a-zA-Z0-9_+\-\.]+)\s*@\s*([a-zA-Z0-9_\-\.]+)(?:\s*[\.,]\s*([a-zA-Z]{0,10}))?/gi,
  postalCode: /\b[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d\b/gi,
  addressPattern1: new RegExp(
    "\\b" + HOUSE_NUMBER + "\\s+" +
      `(?:${DIRECTIONS}\\s+)?` +
      `(?:${NAME_PART}(?:\\s+${NAME_PART}){0,3})\\s+` +
      STREET_TYPES +
      `(?:\\s+${DIRECTIONS})?\\b`,
    "ig",
  ),
  addressPattern2: new RegExp(
    "\\b" + HOUSE_NUMBER + ",?\\s+" + STREET_TYPES + "\\s+" + FR_ARTICLES +
      `(?:${NAME_PART}(?:\\s+${NAME_PART}){0,3})\\b`,
    "ig",
  ),
  addressPattern3: new RegExp("\\b" + HOUSE_NUMBER + "\\s+" + STREET_TYPES + "\\b", "ig"),
  addressPattern4: new RegExp(`\\b${STREET_TYPES}\\s+${HOUSE_NUMBER}\\b`, "ig"),
  addressPattern5: /\b(?:(?:p\.?\s*o\.?\s*box)|(?:post\s+office\s+box)|(?:c\.?\s*p\.?)|(?:b\.?\s*p\.?)|(?:case\s+postale)|(?:bo[iî]te\s+postale)|(?:casier\s+postal))(?:\.+)?[ \t]*(?:#|no\.?|n[º°]|n°|num(?:[ée]ro)?\.?)?[ \t]*(?<box_number>[A-Za-z0-9][A-Za-z0-9\-]*)\b/giu,
  username: /(?:(username|user)[%20]?([:=]|(%EF%BC%9A))[^\s&]*)/gi,
  password: /(?:(password|pass)[%20]?([:=]|(%EF%BC%9A))[^\s&]*)/gi,
};
