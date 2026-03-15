




export const DEFAULT_THEME = {
  // --------------------------------------------------------------------------
  // TYPOGRAPHY
  // --------------------------------------------------------------------------
  typography: {
    variants: {
      H1: 'text-4xl md:text-6xl font-black tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-br from-white via-indigo-100 to-indigo-400 drop-shadow-sm',
      H2: 'text-3xl md:text-4xl font-bold tracking-tight leading-tight text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]',
      H3: 'text-xl md:text-2xl font-semibold tracking-tight text-slate-100',
      BODY: 'text-sm md:text-base leading-7 text-slate-300 font-medium opacity-90',
      CAPTION: 'text-[11px] uppercase tracking-widest font-bold text-indigo-400/80',
      CODE: 'font-mono text-xs bg-black/40 border border-white/10 px-1.5 py-0.5 rounded text-indigo-300 shadow-inner'
    },
    colors: {
      DEFAULT: 'text-slate-200',
      MUTED: 'text-slate-500',
      PRIMARY: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.4)]',
      ACCENT: 'text-violet-400',
      DANGER: 'text-rose-400',
      SUCCESS: 'text-emerald-400'
    },
    fonts: {
      SANS: 'font-sans',
      SERIF: 'font-["Playfair_Display",serif]',
      CURSIVE: 'font-["Great_Vibes",cursive]'
    }
  },

  // --------------------------------------------------------------------------
  // BUTTONS
  // --------------------------------------------------------------------------
  button: {
    base: "inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg",
    variants: {
      PRIMARY: 'bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 hover:from-indigo-500 hover:to-violet-500 text-white shadow-[0_4px_20px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_6px_25px_rgba(99,102,241,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] border border-white/10',
      SECONDARY: 'bg-zinc-800/80 hover:bg-zinc-700/80 text-slate-200 border border-white/10 hover:border-white/30 shadow-lg hover:shadow-xl',
      GHOST: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white shadow-none',
      DANGER: 'bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-[0_4px_15px_rgba(225,29,72,0.4)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.6)] border border-rose-500/50',
      GLOW: 'bg-black/60 text-white border border-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.4),inset_0_0_10px_rgba(99,102,241,0.2)] hover:shadow-[0_0_35px_rgba(99,102,241,0.7),inset_0_0_20px_rgba(99,102,241,0.4)] hover:border-indigo-400',
      OUTLINE: 'bg-transparent border border-zinc-600 text-zinc-300 hover:border-white hover:text-white hover:bg-white/5 shadow-none',
      SOFT: 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/10 hover:border-indigo-500/30',
      GRADIENT: 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:via-purple-500 hover:to-indigo-500 text-white shadow-[0_0_25px_rgba(192,38,211,0.4)] border border-white/10'
    }
  },

  // --------------------------------------------------------------------------
  // BADGES
  // --------------------------------------------------------------------------
  badge: {
    base: "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border shadow-lg",
    colors: {
      BLUE: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 shadow-[inset_0_0_10px_rgba(99,102,241,0.1)]',
      GREEN: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]',
      RED: 'bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[inset_0_0_10px_rgba(244,63,94,0.1)]',
      GRAY: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      PURPLE: 'bg-purple-500/10 text-purple-300 border-purple-500/20 shadow-[inset_0_0_10px_rgba(168,85,247,0.1)]',
    }
  },

  // --------------------------------------------------------------------------
  // CONTAINER
  // --------------------------------------------------------------------------
  container: {
    base: "flex w-full transition-all relative z-0",
    layouts: {
      COL: 'flex-col',
      ROW: 'flex-row flex-wrap items-center',
      GRID: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    },
    gaps: { 
      GAP_SM: 'gap-3', 
      GAP_MD: 'gap-6', 
      GAP_LG: 'gap-8', 
      GAP_XL: 'gap-12'
    },
    backgrounds: {
      DEFAULT: '',
      // Updated Surface to be more translucent
      SURFACE: 'bg-zinc-900/80 border border-white/10 rounded-3xl shadow-2xl ring-1 ring-white/5',
      GLASS: 'bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-sm border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-3xl ring-1 ring-white/5'
    }
  },

  // --------------------------------------------------------------------------
  // CARDS
  // --------------------------------------------------------------------------
  card: {
    base: "rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-500 group relative",
    variants: {
      // DEFAULT: Less black, more colored tint
      DEFAULT: 'bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-indigo-950/40 border border-white/10 hover:border-indigo-500/30 shadow-lg',
      GLASS: 'bg-white/[0.03] backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:border-white/20 ring-1 ring-white/5 hover:bg-white/[0.05]',
      NEON: 'bg-black/80 border border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.15),inset_0_0_20px_rgba(99,102,241,0.05)] hover:shadow-[0_0_40px_rgba(99,102,241,0.35)] hover:border-indigo-400',
      OUTLINED: 'bg-transparent border border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-white/5',
      ELEVATED: 'bg-zinc-800/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border-t border-white/10 hover:-translate-y-1',
      FROSTED: 'bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-tr before:from-white/5 before:to-transparent before:pointer-events-none'
    }
  },

  // --------------------------------------------------------------------------
  // STATS
  // --------------------------------------------------------------------------
  stat: {
    base: "bg-zinc-900/60 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden shadow-xl hover:bg-zinc-900/70",
    label: "text-xs font-bold text-slate-500 uppercase tracking-widest mb-3",
    value: "text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-200 to-slate-400 tracking-tight drop-shadow-sm",
    trend: {
        base: "text-[10px] font-bold px-2 py-1 rounded-lg flex items-center border",
        UP: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
        DOWN: "text-rose-300 bg-rose-500/10 border-rose-500/20",
        NEUTRAL: "text-slate-400 bg-slate-500/10 border-slate-500/20"
    },
    decorator: "absolute -top-10 -right-10 p-12 opacity-20 group-hover:opacity-30 transition-all duration-1000 ease-in-out group-hover:scale-110 mix-blend-screen",
    decoratorBlur: "w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-[50px]"
  },

  // --------------------------------------------------------------------------
  // INPUTS & CONTROLS
  // --------------------------------------------------------------------------
  input: {
     base: "flex flex-col gap-2 w-full group relative",
     label: "text-xs font-bold text-slate-500 uppercase tracking-wider transition-colors group-focus-within:text-indigo-400 ml-1",
     field: "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-slate-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]",
     error: "border-rose-500 focus:border-rose-500 focus:ring-rose-500/30 pr-10",
     errorMessage: "text-[10px] text-rose-400 font-bold ml-1 animate-in slide-in-from-left-2"
  },

  textarea: {
    base: "flex flex-col gap-2 w-full group relative",
    label: "text-xs font-bold text-slate-500 uppercase tracking-wider transition-colors group-focus-within:text-indigo-400 ml-1",
    field: "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-slate-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] min-h-[100px] resize-y",
  },
  
  switch: {
    base: "flex items-center justify-between py-2 w-full",
    label: "text-sm font-medium text-slate-300",
    track: "w-11 h-6 bg-zinc-700 rounded-full peer-checked:after:translate-x-full peer-focus:outline-none relative transition-colors duration-300 cursor-pointer",
    trackActive: "bg-indigo-600",
    thumb: "absolute top-[2px] left-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-transform duration-300 shadow-md"
  },

  slider: {
    base: "flex flex-col gap-3 w-full",
    label: "flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider",
    track: "w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer overflow-hidden shadow-inner",
    thumb: "h-2 bg-indigo-500 rounded-lg appearance-none" 
  },

  tabs: {
    variants: {
      DEFAULT: 'bg-zinc-900/40 p-1 rounded-xl border border-white/5',
      PILLS: 'gap-2',
      UNDERLINE: 'gap-4 border-b border-white/5 px-2'
    }
  },

  stepper: {
    container: "w-full",
    header: "flex items-center justify-between mb-8 relative",
    step: "flex flex-col items-center relative z-10 gap-2 cursor-pointer group",
    dot: {
      base: "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500",
      active: "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110",
      completed: "bg-emerald-500/20 border-emerald-500 text-emerald-400",
      inactive: "bg-zinc-900 border-zinc-700 text-zinc-500 group-hover:border-zinc-500 group-hover:text-zinc-400"
    },
    line: {
      base: "absolute top-4 left-0 w-full h-0.5 bg-zinc-800 -z-0",
      progress: "h-full bg-indigo-600 transition-all duration-500 ease-out"
    },
    label: {
      base: "text-[10px] uppercase tracking-wider font-bold transition-colors duration-300",
      active: "text-indigo-400",
      completed: "text-emerald-400",
      inactive: "text-zinc-600"
    }
  },

  timeline: {
    container: "w-full relative pl-6 border-l border-zinc-800 space-y-8 my-4",
    dot: "absolute -left-[5px] w-2.5 h-2.5 rounded-full ring-4 ring-black",
    item: "relative flex flex-col gap-1",
    time: "text-[10px] font-mono text-zinc-500",
    title: "text-sm font-bold text-slate-200",
    desc: "text-xs text-slate-400 leading-relaxed",
    variants: {
      DEFAULT: 'border-zinc-800',
      GLOW: 'border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
    }
  },

  codeblock: {
    container: "w-full rounded-xl overflow-hidden bg-[#0d1117] border border-zinc-800 shadow-xl my-4",
    header: "flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5",
    body: "p-4 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
  },

  // --------------------------------------------------------------------------
  // TABLES
  // --------------------------------------------------------------------------
  table: {
    base: "w-full overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60 shadow-xl flex flex-col",
    controls: "p-4 border-b border-white/5 flex items-center justify-between gap-4 bg-white/[0.02]",
    searchInput: "bg-zinc-900/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 min-w-[200px]",
    header: "text-xs font-bold uppercase tracking-wider bg-black/20 text-slate-400 border-b border-white/5 select-none",
    row: "hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-0",
    cell: "px-6 py-4 whitespace-nowrap text-slate-300 text-sm",
    pagination: {
       base: "flex items-center justify-between p-4 border-t border-white/5 bg-white/[0.02]",
       button: "p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
    }
  },

  // --------------------------------------------------------------------------
  // SPLIT PANE (NEW)
  // --------------------------------------------------------------------------
  splitPane: {
    container: "w-full h-full flex overflow-hidden rounded-xl border border-white/5 bg-zinc-900/40",
    divider: "relative z-10 flex items-center justify-center bg-black/50 hover:bg-indigo-500/50 transition-colors group",
    handle: "w-1 h-8 rounded-full bg-zinc-600 group-hover:bg-white transition-colors"
  },

  // --------------------------------------------------------------------------
  // CALENDAR (NEW)
  // --------------------------------------------------------------------------
  calendar: {
    base: "p-4 bg-zinc-900/60 border border-white/10 rounded-2xl shadow-xl w-full max-w-sm",
    header: "flex items-center justify-between mb-4",
    title: "font-bold text-slate-200",
    navBtn: "p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors",
    grid: "grid grid-cols-7 gap-1 text-center",
    weekday: "text-[10px] font-bold text-zinc-500 uppercase tracking-wide py-2",
    day: "h-9 w-9 rounded-lg flex items-center justify-center text-sm transition-all relative group",
    dayDefault: "text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer",
    daySelected: "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 font-bold scale-105 z-10",
    dayToday: "ring-1 ring-indigo-500/50 text-indigo-400",
    dayOutside: "text-zinc-700 pointer-events-none"
  },

  // --------------------------------------------------------------------------
  // SEPARATOR
  // --------------------------------------------------------------------------
  separator: {
    base: "h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent my-8 w-full opacity-50"
  },

  // --------------------------------------------------------------------------
  // HERO
  // --------------------------------------------------------------------------
  hero: {
    base: "relative w-full overflow-hidden rounded-[2.5rem] bg-black/40 backdrop-blur-sm border border-white/10 p-12 md:p-32 flex flex-col shadow-2xl ring-1 ring-white/5",
    gradients: {
      BLUE_PURPLE: 'from-blue-600/30 via-indigo-500/20 to-purple-600/30',
      ORANGE_RED: 'from-orange-500/30 via-red-500/20 to-pink-500/30',
      GREEN_TEAL: 'from-emerald-500/30 via-teal-500/20 to-cyan-500/30',
      AURORA: 'from-indigo-500/20 via-purple-500/20 to-emerald-500/20',
      CYBER: 'from-fuchsia-600/20 via-violet-600/20 to-cyan-500/20'
    }
  },

  // --------------------------------------------------------------------------
  // PROGRESS
  // --------------------------------------------------------------------------
  progress: {
    colors: {
      BLUE: 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]',
      GREEN: 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
      ORANGE: 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]',
      RED: 'bg-gradient-to-r from-rose-500 to-red-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
    }
  },

  // --------------------------------------------------------------------------
  // ALERTS
  // --------------------------------------------------------------------------
  alert: {
    base: "p-4 rounded-xl border flex gap-4 items-start shadow-lg relative overflow-hidden",
    variants: {
      INFO: 'bg-blue-900/20 border-blue-500/30 text-blue-200 shadow-[0_4px_20px_rgba(59,130,246,0.1)]',
      SUCCESS: 'bg-emerald-900/20 border-emerald-500/30 text-emerald-200 shadow-[0_4px_20px_rgba(16,185,129,0.1)]',
      WARNING: 'bg-orange-900/20 border-orange-500/30 text-orange-200 shadow-[0_4px_20px_rgba(249,115,22,0.1)]',
      ERROR: 'bg-red-900/20 border-red-500/30 text-red-200 shadow-[0_4px_20px_rgba(239,68,68,0.1)]',
    }
  },

  // --------------------------------------------------------------------------
  // AVATARS
  // --------------------------------------------------------------------------
  avatar: {
    status: {
      ONLINE: 'bg-emerald-500 ring-2 ring-black shadow-[0_0_8px_rgba(16,185,129,0.8)]',
      OFFLINE: 'bg-slate-500 ring-2 ring-black',
      BUSY: 'bg-rose-500 ring-2 ring-black shadow-[0_0_8px_rgba(244,63,94,0.8)]'
    }
  },

  // --------------------------------------------------------------------------
  // IMAGES
  // --------------------------------------------------------------------------
  image: {
    ratios: {
      VIDEO: 'aspect-video',
      SQUARE: 'aspect-square',
      WIDE: 'aspect-[21/9]',
      PORTRAIT: 'aspect-[3/4]'
    }
  },

  // --------------------------------------------------------------------------
  // MAPS
  // --------------------------------------------------------------------------
  map: {
    styles: {
      DARK: { bg: '#09090b', grid: '#27272a' },
      LIGHT: { bg: '#cbd5e1', grid: '#94a3b8' },
      SATELLITE: { bg: '#020617', grid: '#1e293b' }
    }
  },

  // --------------------------------------------------------------------------
  // ACCORDION
  // --------------------------------------------------------------------------
  accordion: {
    container: {
      DEFAULT: 'divide-y divide-white/5 border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]',
      SEPARATED: 'space-y-4'
    },
    item: {
      DEFAULT: 'bg-transparent',
      SEPARATED: 'border border-white/10 rounded-2xl bg-zinc-900/60 overflow-hidden hover:border-white/20 transition-colors'
    }
  }
};

export type ThemeType = typeof DEFAULT_THEME;