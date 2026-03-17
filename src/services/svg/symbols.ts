// Pre-built SVG symbol definitions injected into every raw SVG
// Models reference these via <use href="#symbol-id" x="..." y="..."/>

export const SVG_SYMBOLS = `
<symbol id="stickman" viewBox="0 0 60 100">
  <circle cx="30" cy="14" r="14" fill="none" stroke="currentColor" stroke-width="2.5"/>
  <line x1="30" y1="28" x2="30" y2="62" stroke="currentColor" stroke-width="2.5"/>
  <line x1="30" y1="38" x2="10" y2="56" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="38" x2="50" y2="56" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="62" x2="14" y2="90" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="62" x2="46" y2="90" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
</symbol>

<symbol id="stickman-wave" viewBox="0 0 60 100">
  <circle cx="30" cy="14" r="14" fill="none" stroke="currentColor" stroke-width="2.5"/>
  <line x1="30" y1="28" x2="30" y2="62" stroke="currentColor" stroke-width="2.5"/>
  <line x1="30" y1="38" x2="10" y2="56" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="38" x2="52" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="62" x2="14" y2="90" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="62" x2="46" y2="90" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
</symbol>

<symbol id="stickman-point" viewBox="0 0 60 100">
  <circle cx="30" cy="14" r="14" fill="none" stroke="currentColor" stroke-width="2.5"/>
  <line x1="30" y1="28" x2="30" y2="62" stroke="currentColor" stroke-width="2.5"/>
  <line x1="30" y1="38" x2="10" y2="56" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="38" x2="56" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="62" x2="14" y2="90" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="30" y1="62" x2="46" y2="90" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
</symbol>

<symbol id="gear-icon" viewBox="0 0 40 40">
  <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="6,4"/>
  <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
</symbol>

<symbol id="speech-bubble" viewBox="0 0 200 60">
  <path d="M 10,0 h 180 a 10,10 0 0 1 10,10 v 28 a 10,10 0 0 1 -10,10 h -75 l -8,12 l -8,-12 h -89 a 10,10 0 0 1 -10,-10 v -28 a 10,10 0 0 1 10,-10 z" fill="#1e293b" stroke="#334155" stroke-width="1"/>
</symbol>
`;

// Inject symbols into SVG string (before closing </svg>)
export function injectSymbols(svgCode: string): string {
  if (!svgCode.includes('</svg>')) return svgCode;

  // Check if there's a <defs> block to append to
  if (svgCode.includes('</defs>')) {
    return svgCode.replace('</defs>', SVG_SYMBOLS + '</defs>');
  }

  // Otherwise inject defs block after opening <svg...> tag
  return svgCode.replace(/(<svg[^>]*>)/, `$1<defs>${SVG_SYMBOLS}</defs>`);
}
