import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base: P = {
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
const make = (d: string) =>
  function Icon(p: P) {
    return (
      <svg {...base} {...p}>
        <path d={d} />
      </svg>
    );
  };

export const DashboardIcon = make("M4 4h7v7H4z M13 4h7v4h-7z M13 11h7v9h-7z M4 14h7v6H4z");
export const BoxIcon = make("M21 8l-9-5-9 5v8l9 5 9-5z M3 8l9 5 9-5 M12 13v8");
export const QuoteIcon = make("M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 13h6 M9 17h4");
export const InvoiceIcon = make("M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6");
export const ScooterIcon = make("M6 18a2 2 0 1 0 0-.01 M19 18a2 2 0 1 0 0-.01 M8 18h7 M15 18l3-9h-3 M12 6h3 M5 14l2-4h4");
export const ProjectsIcon = make("M3 20h18 M5 20V10l7-5 7 5v10 M9 20v-6h6v6");
export const ImageIcon = make("M4 5h16v14H4z M4 16l4-4 4 4 3-3 5 5 M9 9.5h.01");
export const SlidersIcon = make("M4 7h10 M18 7h2 M4 17h2 M10 17h10 M14 5v4 M6 15v4");
export const PrinterIcon = make("M7 8V4h10v4 M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2 M7 14h10v6H7z");
export const EditIcon = make("M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16z M14 7l3 3");
export const LogoutIcon = make("M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3 M16 8l4 4-4 4 M20 12H9");
export const StarIcon = make("M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.2 9.4l6.1-.8z");
export const HistoryIcon = make("M3 12a9 9 0 1 0 3-6.7 M3 4v5h5 M12 7v5l3 2");
export const UserCogIcon = make("M15 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1 M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7 M19 8v3 M19 16v3 M16 13.5l2.6-1.5 M21.4 15l-2.6 1.5 M16 16.5l2.6 1.5 M21.4 12l-2.6 1.5");
export const TrendIcon = make("M3 17l6-6 4 4 8-9 M15 6h6v6");
export const WalletIcon = make("M4 7a2 2 0 0 1 2-2h12v4 M4 7v10a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2 M16 14h.01");
export const ClockAlertIcon = make("M12 8v4l2.5 2.5 M21 12a9 9 0 1 1-3-6.7 M20 4v4h-4");
export const HandshakeIcon = make("M3 12l4-4 4 1 4-1 4 4-6 6-3 1-4-3z M11 9l3 3");
export const EyeIcon = make("M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6");
export const LockIcon = make("M6 11h12v9H6z M8 11V8a4 4 0 0 1 8 0v3");
export const UploadIcon = make("M12 16V4 M7 9l5-5 5 5 M5 20h14");
export const ArrowLeftIcon = make("M19 12H5 M11 6l-6 6 6 6");
export const FilterIcon = make("M4 5h16l-6 8v6l-4-2v-4z");
export const MailOffIcon = make("M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M3 7l9 6 3-2 M4 4l16 16");
export const MailCheckIcon = make("M21 12V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h9 M3 7l9 6 9-6 M16 19l2 2 4-4");
export const TruckIcon = make("M3 6h11v10H3z M14 10h4l3 3v3h-7 M7 19a1.5 1.5 0 1 0 0-.01 M17 19a1.5 1.5 0 1 0 0-.01");
