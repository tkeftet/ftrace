import { useEffect, useRef } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import type { MenuCategory } from "@/api/endpoints/menu.api";

export interface CategoryTabBarProps {
  categories: MenuCategory[];
  activeId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

export function CategoryTabBar({
  categories,
  activeId,
  onSelect,
  loading,
}: CategoryTabBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active pill into view when it changes
  useEffect(() => {
    if (!scrollRef.current || !activeId) return;
    const el = scrollRef.current.querySelector<HTMLElement>(
      `[data-cat-id="${activeId}"]`,
    );
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress size={22} sx={{ color: "#b45309" }} />
      </Box>
    );
  }

  if (categories.length === 0) return null;

  return (
    <Box
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid",
        borderColor: "divider",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Fade hint on right edge so waiter knows it scrolls */}
      <Box sx={{ position: "relative" }}>
        <Box
          ref={scrollRef}
          sx={{
            display: "grid",
            gridTemplateRows: "repeat(2, auto)",
            gridAutoFlow: "column",
            overflowX: "auto",
            gap: 0.75,
            px: { xs: 1.5, sm: 2 },
            py: 1.25,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            pr: { xs: "40px", sm: "48px" },
          }}
        >
          {categories.map((c) => {
            const active = activeId === c._id;
            return (
              <Box
                key={c._id}
                data-cat-id={c._id}
                onClick={() => onSelect(c._id)}
                sx={{
                  flexShrink: 0,
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.6, sm: 0.75 },
                  borderRadius: 10,
                  cursor: "pointer",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                  bgcolor: active ? "#b45309" : "#f1f5f9",
                  border: "1.5px solid",
                  borderColor: active ? "#b45309" : "transparent",
                  boxShadow: active ? "0 2px 10px rgba(180,83,9,0.28)" : "none",
                  transition: "all .15s cubic-bezier(.4,0,.2,1)",
                  "&:active": { transform: "scale(0.93)" },
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: "12px", sm: "13px" },
                    fontWeight: active ? 800 : 600,
                    whiteSpace: "nowrap",
                    color: active ? "white" : "#475569",
                    lineHeight: 1.2,
                    transition: "color .15s",
                  }}
                >
                  {c.name}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Right-edge fade overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: 40,
            background: "linear-gradient(to right, transparent, white 80%)",
            pointerEvents: "none",
          }}
        />
      </Box>
    </Box>
  );
}
