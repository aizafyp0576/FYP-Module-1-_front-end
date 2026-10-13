type P = { className?: string };
const base = (d: React.ReactNode) =>
  function Icon({ className = "h-5 w-5" }: P) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {d}
      </svg>
    );
  };

export const IconDashboard = base(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>);
export const IconUsers = base(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.5 3.3-5.5 6.5-5.5s5.9 2 6.5 5.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.7c2 .8 3.2 2.6 3.5 5.3" /></>);
export const IconBuilding = base(<><path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16" /><path d="M15 9h4a1 1 0 0 1 1 1v11M2 21h20M8 8h3M8 12h3M8 16h3" /></>);
export const IconClock = base(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
export const IconShield = base(<><path d="M12 3 4.5 6v5.5c0 4.5 3.2 8.3 7.5 9.5 4.3-1.2 7.5-5 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-4" /></>);
export const IconLogout = base(<><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l-5-5 5-5M5 12h11" /></>);
export const IconPlus = base(<path d="M12 5v14M5 12h14" />);
export const IconX = base(<path d="M6 6l12 12M18 6 6 18" />);
export const IconSearch = base(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);
export const IconMenu = base(<path d="M4 6h16M4 12h16M4 18h16" />);
export const IconPencil = base(<><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>);
export const IconCheck = base(<path d="m5 12 5 5 9-10" />);
export const IconArrowRight = base(<path d="M5 12h14M13 6l6 6-6 6" />);
