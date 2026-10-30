import type { ReactNode } from "react";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const ChatIcon = () => (
  <Icon>
    <path d="M4 5h16v11H9l-5 4z" />
  </Icon>
);

export const TasksIcon = () => (
  <Icon>
    <path d="M4 6l1.5 1.5L8 5" />
    <path d="M11 6.5h9" />
    <path d="M4 13l1.5 1.5L8 12" />
    <path d="M11 13.5h9" />
    <path d="M4 19.5h4" />
    <path d="M11 19.5h9" />
  </Icon>
);

export const GoalsIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </Icon>
);

export const PermissionsIcon = () => (
  <Icon>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
    <path d="M9 12l2 2 4-4" />
  </Icon>
);
