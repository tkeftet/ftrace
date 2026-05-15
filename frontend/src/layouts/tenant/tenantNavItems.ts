import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TableBarIcon from "@mui/icons-material/TableBar";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import { ROUTES } from "@/router/routes";
import type { SvgIconComponent } from "@mui/icons-material";
import type { StaffRole } from "@/types/staff.types";

export interface TenantNavItem {
  label: string;
  icon: SvgIconComponent;
  path: string;
  allowedRoles: StaffRole[];
  /** Show in the mobile bottom nav (false = profile-dropdown only) */
  showInBottomNav: boolean;
}

export const TENANT_NAV_ITEMS: TenantNavItem[] = [
  {
    label: "Overview",
    icon: DashboardIcon,
    path: ROUTES.TENANT_DASHBOARD,
    allowedRoles: [
      "admin",
      "manager",
      "waiter",
      "barman",
      "kitchen",
      "cashier",
    ],
    showInBottomNav: true,
  },
  {
    label: "Orders",
    icon: ReceiptLongIcon,
    path: ROUTES.TENANT_ORDERS,
    allowedRoles: [
      "admin",
      "manager",
      "waiter",
      "barman",
      "kitchen",
      "cashier",
    ],
    showInBottomNav: true,
  },
  {
    label: "Menu",
    icon: MenuBookIcon,
    path: ROUTES.TENANT_MENU,
    allowedRoles: ["admin", "manager"],
    showInBottomNav: true,
  },
  {
    label: "Tables",
    icon: TableBarIcon,
    path: ROUTES.TENANT_TABLES,
    allowedRoles: ["admin", "manager", "waiter"],
    showInBottomNav: true,
  },
  {
    label: "Staff",
    icon: PeopleIcon,
    path: ROUTES.TENANT_STAFF,
    allowedRoles: ["admin"],
    showInBottomNav: false,
  },
  {
    label: "Settings",
    icon: SettingsIcon,
    path: ROUTES.TENANT_SETTINGS,
    allowedRoles: [
      "admin",
      "manager",
      "waiter",
      "barman",
      "kitchen",
      "cashier",
    ],
    showInBottomNav: false,
  },
];
