const ICONS = {
  train: <path d="M8 4h8a2 2 0 0 1 2 2v6a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V6a2 2 0 0 1 2-2Zm1 10h6m-5 4 2-2m2 0 2 2M9.5 8h.01M14.5 8h.01" />,
  tram: <path d="M9 5h6a3 3 0 0 1 3 3v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8a3 3 0 0 1 3-3Zm3-2v2m0 11v3m-3 0 3-3 3 3M8 9h8" />,
  bus: <path d="M8 5h8a3 3 0 0 1 3 3v3a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5V8a3 3 0 0 1 3-3Zm1 9h6m-5 4 1.5-2m2.5 0 1.5 2M9.5 9h.01M14.5 9h.01" />,
  schools: <path d="m4 10 8-4 8 4-8 4-8-4Zm3 1.5V15c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-3.5M20 10v4" />,
  school: <path d="m4 10 8-4 8 4-8 4-8-4Zm3 1.5V15c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-3.5M20 10v4" />,
  health: <path d="M12 5v14M5 12h14" />,
  retail: <path d="M5 9h14l-1 9H6L5 9Zm2-3h10l1 3H6l1-3Zm5 4v5" />,
  parks_sport: <path d="M12 4c-1.8 2-4 3.4-4 6a4 4 0 0 0 8 0c0-2.6-2.2-4-4-6Zm0 8v8M8 16h8" />,
  sport: <path d="M12 4c-1.8 2-4 3.4-4 6a4 4 0 0 0 8 0c0-2.6-2.2-4-4-6Zm0 8v8M8 16h8" />,
  planning: <path d="M6 5h8l4 4v10H6V5Zm8 0v4h4M9 13h6M9 16h4" />,
  planningContext: <path d="M6 5h8l4 4v10H6V5Zm8 0v4h4M9 13h6M9 16h4" />,
  overall: <path d="M12 5 14.2 9.5 19 10.2l-3.5 3.4.8 4.8L12 16l-4.3 2.4.8-4.8L5 10.2l4.8-.7L12 5Z" />
};

export default function CategoryIcon({ category, label }) {
  return (
    <span className={`category-icon category-icon-${category}`} aria-hidden="true" title={label || category}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[category] || ICONS.planning}
      </svg>
    </span>
  );
}