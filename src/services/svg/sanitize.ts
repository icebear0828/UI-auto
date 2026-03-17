import DOMPurify from 'dompurify';

export function sanitizeSvg(raw: string): string {
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: [
      'animate', 'animateTransform', 'animateMotion', 'use', 'symbol',
      'set', 'mpath', 'filter', 'feGaussianBlur',
      'feComposite', 'feBlend', 'feColorMatrix',
      'feFlood', 'feMerge', 'feMergeNode', 'feTurbulence',
      'feDisplacementMap', 'feSpecularLighting', 'fePointLight',
      'feOffset', 'feDiffuseLighting',
    ],
    ADD_ATTR: [
      'attributeName', 'values', 'dur', 'begin', 'end',
      'repeatCount', 'fill', 'keyTimes', 'keySplines',
      'calcMode', 'additive', 'accumulate', 'from', 'to', 'by',
      'type', 'mode', 'in', 'in2', 'result', 'stdDeviation',
      'baseFrequency', 'numOctaves', 'seed', 'scale',
      'xChannelSelector', 'yChannelSelector',
      'operator', 'k1', 'k2', 'k3', 'k4',
      'flood-color', 'flood-opacity', 'lighting-color',
      'surfaceScale', 'specularConstant', 'specularExponent',
      'dx', 'dy', 'azimuth', 'elevation',
      'viewBox', 'preserveAspectRatio', 'xmlns', 'href',
      'patternUnits', 'patternTransform', 'gradientUnits',
      'gradientTransform', 'spreadMethod',
      'markerWidth', 'markerHeight', 'refX', 'refY', 'orient',
      'dominant-baseline', 'letter-spacing', 'text-anchor',
      'font-weight', 'font-family', 'font-size',
      'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap',
      'stroke-linejoin', 'stroke-width',
      'stop-color', 'stop-opacity', 'pointer-events',
      'textLength', 'lengthAdjust',
      'path', 'rotate', 'keyPoints',
    ],
  });
}
