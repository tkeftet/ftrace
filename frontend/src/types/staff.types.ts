export type StaffRole =
  | "admin"
  | "manager"
  | "waiter"
  | "barman"
  | "kitchen"
  | "cashier";

export interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
  role?: StaffRole;
  password?: string;
}

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  admin: "Admin",
  manager: "Manager",
  waiter: "Waiter",
  barman: "Barman",
  kitchen: "Kitchen",
  cashier: "Cashier",
};

export const ASSIGNABLE_ROLES: StaffRole[] = [
  "manager",
  "waiter",
  "barman",
  "kitchen",
  "cashier",
];

export const ROLE_COLORS: Record<
  StaffRole,
  "default" | "primary" | "success" | "warning" | "error" | "info" | "secondary"
> = {
  admin: "primary",
  manager: "secondary",
  waiter: "info",
  barman: "warning",
  kitchen: "error",
  cashier: "success",
};
