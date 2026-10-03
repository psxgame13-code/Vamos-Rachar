const base = {
  width: 22, height: 22, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round",
};

export const IconCobrar = () => (
  <svg {...base}><rect x="3" y="6" width="18" height="12" rx="3" /><circle cx="12" cy="12" r="2.6" /><path d="M6.5 9.5v.01M17.5 14.5v.01" /></svg>
);
export const IconRacha = () => (
  <svg {...base}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.6-3 2.7-4.5 5.5-4.5s4.9 1.5 5.5 4.5" /><path d="M16 5.5a3 3 0 0 1 0 5.6M17.5 14.7c1.8.5 3 1.9 3.5 4.3" /></svg>
);
export const IconWhats = () => (
  <svg {...base}><path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 18.8L4 20z" /><path d="M9 9.5c.3 2.2 2.3 4.2 4.5 4.5l1.2-1.2-1.8-1-.8.7c-.9-.4-1.6-1.1-2-2l.7-.8-1-1.8L9 9.5z" /></svg>
);
export const IconCopy = () => (
  <svg {...base}><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" /></svg>
);
export const IconCheck = () => (
  <svg {...base}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const IconEdit = () => (
  <svg {...base}><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></svg>
);
export const IconBolt = () => (
  <svg {...base}><path d="M13 3L5 13.5h6L10 21l8-10.5h-6L13 3z" /></svg>
);
/** Logo mark do Cobra Fácil — raio sólido */
export const LogoMark = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M13.2 2.5 4.8 13.2h6.1l-1.3 8.3 8.4-10.7h-6.1L13.2 2.5z"
      fill="currentColor"
    />
  </svg>
);
export const IconLista = () => (
  <svg {...base}><path d="M8 6h12M8 12h12M8 18h12" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></svg>
);
export const IconTrash = () => (
  <svg {...base}><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
);
export const IconRepeat = () => (
  <svg {...base}><path d="M4 11a8 8 0 0 1 14-4l2 2M20 13a8 8 0 0 1-14 4l-2-2" /><path d="M20 4v5h-5M4 20v-5h5" /></svg>
);