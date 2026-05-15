import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import { ROUTES } from "@/router/routes";
import type { SvgIconComponent } from "@mui/icons-material";

export interface NavItem {
  label: string;
  icon: SvgIconComponent;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: DashboardIcon, path: ROUTES.DASHBOARD_OVERVIEW },
  { label: "Tenants", icon: BusinessIcon, path: ROUTES.TENANTS },
  { label: "Analytics", icon: BarChartIcon, path: ROUTES.ANALYTICS },
  { label: "Settings", icon: SettingsIcon, path: ROUTES.DASHBOARD_SETTINGS },
];
