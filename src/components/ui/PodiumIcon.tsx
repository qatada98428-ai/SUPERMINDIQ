import React from "react";

interface PodiumIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * أيقونة منصة التتويج ثلاثية المراكز (1st, 2nd, 3rd) مع تاج النصر والدرجات
 * مخصصة لحلبة تحدي الفرق والبطولات
 */
export default function PodiumIcon({
  className = "w-5 h-5",
  size,
  ...props
}: PodiumIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* قاعدة المنصة السفلية */}
      <rect
        x="1.5"
        y="19"
        width="21"
        height="2.5"
        rx="1"
        fill="currentColor"
        fillOpacity="0.4"
        stroke="currentColor"
      />

      {/* المركز الثاني (اليسار - درجة متوسطة) */}
      <path
        d="M2.5 19V11.5C2.5 10.95 2.95 10.5 3.5 10.5H8.5V19H2.5Z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
      />
      {/* رقم 2 */}
      <path
        d="M4.5 13.5H6.5V14.5L4.5 16.5H6.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* المركز الأول (الوسط - الدرجة العليا) */}
      <path
        d="M8.5 19V7.5C8.5 6.95 8.95 6.5 9.5 6.5H14.5C15.05 6.5 15.5 6.95 15.5 7.5V19H8.5Z"
        fill="currentColor"
        fillOpacity="0.55"
        stroke="currentColor"
      />
      {/* رقم 1 */}
      <path
        d="M11.2 10.2L12 9.5V15.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* المركز الثالث (اليمين - أدنى درجة) */}
      <path
        d="M15.5 19V13.5C15.5 12.95 15.95 12.5 16.5 12.5H21.5V19H15.5Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
      />
      {/* رقم 3 */}
      <path
        d="M17.5 14.5H19.5L18.5 15.5H19.5V17.5H17.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* تاج النصر أو النجمة فوق المركز الأول */}
      <path
        d="M10 4.2L11 2L12 3.8L13 2L14 4.2H10Z"
        fill="#F59E0B"
        stroke="#F59E0B"
        strokeWidth="1"
      />
    </svg>
  );
}
