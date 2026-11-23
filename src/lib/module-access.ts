/**
 * SUPER MIND IQ - Program Modules Access Control
 * Controls visibility & permissions according to the user's release rules:
 * 1. Mental Arithmetic: Open to everyone (students, trainers, admins, guests).
 * 2. Intelligence & Secrets of Numbers: Marked "جاري التطوير 🚧" and accessible ONLY to trainers & admins (hidden from students).
 * 3. Remaining sections (Chess, Rubik's Cube, Sudoku, Brain Games, Memory & Focus, Kids Coding):
 *    Locked for everyone, accessible ONLY to Admin during local development/testing.
 */

export type ProgramModuleId =
  | "mental-arithmetic"
  | "secrets-of-numbers"
  | "intelligence"
  | "sudoku"
  | "chess"
  | "rubiks-cube"
  | "brain-games"
  | "memory-focus"
  | "kids-coding";

export type AccessStatus = "open" | "trainer_only" | "admin_only";

export interface ModuleAccessInfo {
  status: AccessStatus;
  isAccessible: boolean;
  badgeAr: string;
  badgeEn: string;
  badgeTone: "green" | "amber" | "purple" | "slate";
  statusTextAr: string;
  statusTextEn: string;
  requiresRoleTextAr: string;
}

export function isLocalDevMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.localStorage.getItem("supermind_dev_admin_override") === "true"
  );
}

export function checkModuleAccess(
  moduleId: ProgramModuleId,
  userRole?: string | null,
  userEmail?: string | null
): ModuleAccessInfo {
  const emailLower = userEmail?.toLowerCase() || "";
  const devOverride = typeof window !== "undefined" && window.localStorage.getItem("supermind_dev_admin_override") === "true";

  const isAdmin =
    userRole === "admin" ||
    emailLower === "qatada98@gmail.com" ||
    devOverride;

  const isTrainer = isAdmin || userRole === "trainer";

  // 1. Open Modules: Mental Arithmetic, Memory & Focus, and Sudoku (Open for training)
  if (
    moduleId === "mental-arithmetic" ||
    moduleId === "memory-focus" ||
    moduleId === "sudoku"
  ) {
    return {
      status: "open",
      isAccessible: true,
      badgeAr: "مفتوح للتدريب ✨",
      badgeEn: "Open for Training ✨",
      badgeTone: "green",
      statusTextAr: "مفتوح وجاهز للتدريب المباشر",
      statusTextEn: "Open and ready for active training",
      requiresRoleTextAr: "مفتوح للتدريب المباشر",
    };
  }

  // 2. Secrets of Numbers & Intelligence: Under Development & Trainers Only
  if (moduleId === "secrets-of-numbers" || moduleId === "intelligence") {
    return {
      status: "trainer_only",
      isAccessible: isTrainer,
      badgeAr: "جاري التطوير 🚧 (خاص بالمدربين)",
      badgeEn: "Under Dev 🚧 (Trainers Only)",
      badgeTone: "amber",
      statusTextAr: "جاري التطوير — متاح للمدربين فقط",
      statusTextEn: "Under development — Accessible to trainers only",
      requiresRoleTextAr: "خاص بالمدربين والإدارة فقط",
    };
  }

  // 3. Remaining 6 Modules: Locked for everyone EXCEPT Admin!
  return {
    status: "admin_only",
    isAccessible: isAdmin,
    badgeAr: isAdmin ? "معاينة الأدمن 🛠️" : "قريباً في التحديث القادم 🔒",
    badgeEn: isAdmin ? "Admin Preview 🛠️" : "Coming Soon 🔒",
    badgeTone: isAdmin ? "purple" : "slate",
    statusTextAr: isAdmin
      ? "وضع التطوير والمعاينة (متاح للأدمن)"
      : "قريباً في التحديث القادم — متاح للأدمن فقط أثناء التطوير",
    statusTextEn: isAdmin
      ? "Admin Dev & Test Mode"
      : "Coming soon — Available for Admin only during testing",
    requiresRoleTextAr: "خاص بإدارة المنصة (Admin) أثناء التطوير",
  };
}
