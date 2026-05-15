import { Box, Typography } from "@mui/material";
import type { Table } from "@/api/endpoints/table.api";

interface TablePillsProps {
  tables: Table[];
  selected: string | null;
  onSelect: (id: string) => void;
}

export function TablePills({ tables, selected, onSelect }: TablePillsProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1.5,
        py: 1.5,
        px: 2,
      }}
    >
      {tables.map((t) => {
        const isSel = selected === t._id;
        return (
          <Box
            key={t._id}
            onClick={() => onSelect(t._id)}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 68,
              height: 76,
              borderRadius: 2.5,
              cursor: "pointer",
              border: "2px solid",
              borderColor: isSel
                ? "#b45309"
                : t.isOccupied
                  ? "#f97316"
                  : "#22c55e",
              background: isSel
                ? "linear-gradient(145deg, #b45309 0%, #2d5a8e 100%)"
                : t.isOccupied
                  ? "linear-gradient(145deg, #fff7ed, #fed7aa)"
                  : "linear-gradient(145deg, #f0fdf4, #bbf7d0)",
              boxShadow: isSel
                ? "0 4px 14px rgba(26,58,92,0.35)"
                : "0 1px 3px rgba(0,0,0,0.08)",
              transition: "all .12s",
              WebkitTapHighlightColor: "transparent",
              "&:active": { transform: "scale(0.93)" },
            }}
          >
            <Typography
              variant="h6"
              fontWeight={800}
              lineHeight={1}
              sx={{
                color: isSel ? "#fff" : t.isOccupied ? "#92400e" : "#14532d",
              }}
            >
              {t.number}
            </Typography>
            {t.label && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: 9,
                  lineHeight: 1.3,
                  mt: 0.25,
                  color: isSel ? "rgba(255,255,255,0.75)" : "text.secondary",
                  textAlign: "center",
                  px: 0.5,
                  maxWidth: 64,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {t.label}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
