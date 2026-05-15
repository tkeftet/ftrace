import { useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

import type { MenuItem as IMenuItem } from "@/api/endpoints/menu.api";
import { useCategories } from "../../hooks/menu";
import { useMenuItems } from "../../hooks/menu";
import { MenuItemCard } from "./MenuItemCard";
import { CategoryTabBar } from "./CategoryTabBar";

// Re-export for backward compatibility
export { MenuItemCard } from "./MenuItemCard";
export type { MenuItemCardProps } from "./MenuItemCard";
export { CategoryTabBar } from "./CategoryTabBar";
export type { CategoryTabBarProps } from "./CategoryTabBar";

// Minimal cart shape required by MenuBrowser
interface CartLike {
  menuItemId: string;
  quantity: number;
}

// ── MenuBrowser (compound — used in OrdersPage new-order modal) ───
export interface MenuBrowserProps {
  cart: CartLike[];
  onAdd: (item: IMenuItem) => void;
  onRemove: (id: string) => void;
}

export function MenuBrowser({ cart, onAdd, onRemove }: MenuBrowserProps) {
  const { data: categories = [], isLoading: loadingCats } = useCategories();
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const effectiveCat = activeCat ?? categories[0]?._id ?? null;
  const { data: items = [], isLoading: loadingItems } = useMenuItems(
    effectiveCat ?? undefined,
  );

  if (loadingCats) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={28} sx={{ color: "#b45309" }} />
      </Box>
    );
  }

  if (categories.length === 0) {
    return (
      <Box sx={{ px: 3, py: 8, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No menu categories. Set up your menu first.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CategoryTabBar
        categories={categories}
        activeId={effectiveCat}
        onSelect={setActiveCat}
      />

      {loadingItems ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={24} sx={{ color: "#b45309" }} />
        </Box>
      ) : items.length === 0 ? (
        <Box sx={{ px: 3, py: 8, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No items in this category.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 1.5,
            p: 2,
            pb: 4,
          }}
        >
          {items.map((item) => {
            const qty =
              cart.find((c) => c.menuItemId === item._id)?.quantity ?? 0;
            return (
              <MenuItemCard
                key={item._id}
                item={item}
                quantity={qty}
                onAdd={() => onAdd(item)}
                onRemove={() => onRemove(item._id)}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
}
