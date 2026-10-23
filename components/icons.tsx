import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export const SunIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const MoonIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
  </svg>
);

export const MenuIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 8h16M4 16h16" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ArrowIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const BoltIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </svg>
);

export const BatteryIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="7" width="16" height="10" rx="2" />
    <path d="M22 11v2M8 10v4M12 10v4" />
  </svg>
);

export const HomeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 11 12 3l9 8M5 10v10h14V10" />
  </svg>
);

export const PanelIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 17 7 6h13l-3 11H4ZM6 12h13M10 6l-1.5 11M15 6l-1.5 11M12 21h4" />
  </svg>
);

export const LampIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" />
  </svg>
);

export const LeafIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20 4C9 4 4 9 4 15c0 2 1 4 3 5 7 0 13-5 13-16ZM4 21c3-5 6-8 11-10" />
  </svg>
);

export const WrenchIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M14.7 6.3a4 4 0 0 0 5 5L21 12.6l-8.4 8.4a2.1 2.1 0 0 1-3-3L18 9.6 14.7 6.3ZM15 3a4 4 0 0 0-3.7 5.5L3 17a2.1 2.1 0 0 0 3 3l8.4-8.4" />
  </svg>
);

export const ShieldIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3ZM9 12l2 2 4-4" />
  </svg>
);

export const MapPinIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

export const ChatIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 5h16v11H9l-5 4V5Z" />
  </svg>
);

export const ChevronIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const PhoneIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);

export const MailIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const ClockIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const DropIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.800 6-11 6-11Z" />
  </svg>
);

export const GridIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3v18M3 12h18M7 3h10l3 5H4l3-5Z" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m5 12 5 5 9-10" />
  </svg>
);

export const BuildingIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 21V4h10v17M15 9h4v12M3 21h18M9 8h2M9 12h2M9 16h2" />
  </svg>
);

export const FactoryIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 21V10l6 4v-4l6 4V6h3v15H3ZM7 17h2M12 17h2" />
  </svg>
);

export const QuoteIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M10 7H6v5h3c0 2-1 3-3 3M18 7h-4v5h3c0 2-1 3-3 3" />
  </svg>
);

export const UsersIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.900 3-6 7-6s7 2.100 7 6M17.500 4.500l.6 1.300 1.400.2-1 1 .2 1.400-1.200-.7-1.200.7.2-1.400-1-1 1.400-.2.6-1.300Z" />
  </svg>
);

export const GlobeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
  </svg>
);
