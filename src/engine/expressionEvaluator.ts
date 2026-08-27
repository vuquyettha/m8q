/**
 * Expression evaluator for N8N-style expressions:
 * {{$json.name}}
 * {{$json.customer.email}}
 * {{$node["Node_1"].json.total}}
 * {{$env.API_KEY}}
 * {{$json.amount > 1000 ? 'high' : 'low'}}
 */

export function getNestedValue(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.').filter(Boolean);
  let curr = obj;
  for (const part of parts) {
    if (curr === null || curr === undefined) return undefined;
    curr = curr[part];
  }
  return curr;
}

export function evaluateExpression(
  expression: string,
  context: {
    $json: any;
    $node?: Record<string, { json: any; binary?: any }>;
    $env?: Record<string, string>;
    $item?: any;
    $index?: number;
  }
): any {
  if (typeof expression !== 'string') return expression;

  // Check if whole string is a single expression e.g. "{{$json.total}}"
  const exactMatch = expression.trim().match(/^\{\{([\s\S]+)\}\}$/);
  if (exactMatch) {
    const code = exactMatch[1].trim();
    return executeJsExpression(code, context);
  }

  // String interpolation e.g. "Hello {{$json.name}}, total is {{$json.price}}"
  return expression.replace(/\{\{([\s\S]+?)\}\}/g, (_, code) => {
    const val = executeJsExpression(code.trim(), context);
    if (val === undefined || val === null) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  });
}

function executeJsExpression(code: string, context: any): any {
  try {
    // Build scope variables
    const $json = context.$json ?? {};
    const $node = context.$node ?? {};
    const $env = context.$env ?? {};
    const $item = context.$item ?? $json;
    const $index = context.$index ?? 0;

    // Evaluate in safe function scope
    const func = new Function('$json', '$node', '$env', '$item', '$index', `
      try {
        return (${code});
      } catch (err) {
        return undefined;
      }
    `);

    return func($json, $node, $env, $item, $index);
  } catch (e) {
    // Fallback: simple dot access
    if (code.startsWith('$json.')) {
      return getNestedValue(context.$json, code.slice(6));
    }
    return undefined;
  }
}

/**
 * Recursively interpolates all string fields inside an object or array with {{$json.xxx}}
 */
export function resolveTemplateVariables(
  value: any,
  context: {
    $json: any;
    $node?: Record<string, { json: any }>;
    $env?: Record<string, string>;
    $item?: any;
    $index?: number;
  }
): any {
  if (typeof value === 'string') {
    return evaluateExpression(value, context);
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveTemplateVariables(item, context));
  }

  if (value !== null && typeof value === 'object') {
    const resolved: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      resolved[k] = resolveTemplateVariables(v, context);
    }
    return resolved;
  }

  return value;
}
