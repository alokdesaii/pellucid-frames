// Lucide-style inline SVG icons — stroke, currentColor, conflict-free with React.
const PF_ICON_PATHS = {
  power: <><path d="M12 2v10" /><path d="M18.4 6.6a9 9 0 1 1-12.77.04" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  arrowUpRight: <><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  volume: <><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M16 9a5 5 0 0 1 0 6" /><path d="M19.5 6.5a9 9 0 0 1 0 11" /></>,
  layers: <><path d="m12 2 9 5-9 5-9-5 9-5z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>,
  radio: <><circle cx="12" cy="12" r="2" /><path d="M4.9 7.5a10 10 0 0 0 0 9" /><path d="M19.1 16.5a10 10 0 0 0 0-9" /><path d="M7.8 10.3a6 6 0 0 0 0 3.4" /><path d="M16.2 13.7a6 6 0 0 0 0-3.4" /></>,
  film: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 3v18M17 3v18M3 8h4M17 8h4M3 16h4M17 16h4" /></>,
  circle: <circle cx="12" cy="12" r="9" />,
  arrowDown: <><path d="M12 5v14" /><path d="m5 12 7 7 7-7" /></>,
};

function Icon({ name, size = 20, stroke = 1.6, className = "", style = {} }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
      strokeLinejoin="round" className={className} style={style} aria-hidden="true"
    >
      {PF_ICON_PATHS[name] || null}
    </svg>
  );
}

Object.assign(window, { Icon });
