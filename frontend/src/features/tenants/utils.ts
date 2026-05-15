import type { Tenant, TenantOwner } from "./types";

export function resolveOwner(owner: Tenant["owner"]): TenantOwner | null {
  if (owner && typeof owner === "object") return owner as TenantOwner;
  return null;
}

const AVATAR_COLORS = [
  "#b45309",
  "#1565c0",
  "#0277bd",
  "#00838f",
  "#2e7d32",
  "#558b2f",
  "#f57f17",
  "#e65100",
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
