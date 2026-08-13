export default function CompassRose() {
  return (
    <svg
      className="compass-signature"
      viewBox="0 0 340 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="170" cy="170" r="150" stroke="#C6A15B" strokeWidth="1" />
      <circle cx="170" cy="170" r="118" stroke="#C6A15B" strokeWidth="0.75" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const x1 = 170 + Math.sin(angle) * 100;
        const y1 = 170 - Math.cos(angle) * 100;
        const x2 = 170 + Math.sin(angle) * 150;
        const y2 = 170 - Math.cos(angle) * 150;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#C6A15B"
            strokeWidth={i % 2 === 0 ? 1 : 0.5}
          />
        );
      })}
      {/* North marker — small diamond */}
      <path d="M170 8 L177 22 L170 36 L163 22 Z" fill="#C6A15B" />
      <circle cx="170" cy="170" r="4" fill="#C6A15B" />
    </svg>
  );
}
