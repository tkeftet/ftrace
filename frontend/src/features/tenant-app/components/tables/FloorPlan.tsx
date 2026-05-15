import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Box, Chip, Typography } from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import type { Table } from "@/api/endpoints/table.api";
import { TableTile } from "./TableTile";

const CARD_W = 136;
const CARD_H = 148;

const CANVAS_W = 1100;
const MIN_CANVAS_H = 640;

const COLS = 5;
const COL_GAP = 44;
const ROW_GAP = 44;

interface Position {
  x: number;
  y: number;
}

type Layout = Record<string, Position>;

function buildDefaultLayout(tables: Table[]): Layout {
  const rowStep = CARD_H + ROW_GAP;
  // Pick enough columns so all rows fit inside MIN_CANVAS_H
  const maxRows = Math.max(
    1,
    Math.floor((MIN_CANVAS_H - 36 - CARD_H) / rowStep) + 1,
  );
  const cols = Math.max(COLS, Math.ceil(tables.length / maxRows));

  return Object.fromEntries(
    tables.map((table, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return [
        table._id,
        {
          x: col * (CARD_W + COL_GAP) + 36,
          y: row * rowStep + 36,
        },
      ];
    }),
  );
}

interface FloorPlanProps {
  tables: Table[];
  canEdit: boolean;
  onEdit: (table: Table) => void;
  onDelete: (table: Table) => void;
  storageKey: string;
}

export function FloorPlan({
  tables,
  canEdit,
  onEdit,
  onDelete,
  storageKey,
}: FloorPlanProps) {
  const [isArranging, setIsArranging] = useState(false);

  const [layout, setLayout] = useState<Layout>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as Layout;
    } catch {
      /* ignore corrupt data */
    }
    return {};
  });

  useEffect(() => {
    setLayout((prev) => {
      const defaults = buildDefaultLayout(tables);
      let changed = false;
      const next = { ...prev };
      for (const table of tables) {
        if (!next[table._id]) {
          next[table._id] = defaults[table._id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [tables]);

  // Canvas height grows to include any table that would otherwise be clipped
  const dynamicCanvasH = useMemo(() => {
    const positions = Object.values(layout);
    if (positions.length === 0) return MIN_CANVAS_H;
    const maxBottom = Math.max(...positions.map((p) => p.y + CARD_H));
    return Math.max(MIN_CANVAS_H, maxBottom + ROW_GAP);
  }, [layout]);

  const dynamicCanvasHRef = useRef(dynamicCanvasH);
  useEffect(() => {
    dynamicCanvasHRef.current = dynamicCanvasH;
  }, [dynamicCanvasH]);

  // ── Scale: fit to container width only ───────────────────────────────────
  // Tables stay at full readable size. If the canvas is taller than the
  // container, the wrapper scrolls vertically (internal scroll only).
  const [containerWidth, setContainerWidth] = useState(CANVAS_W);
  const scaleRef = useRef<number>(1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = (w: number) => {
      if (w > 0) {
        setContainerWidth(w);
        scaleRef.current = w / CANVAS_W;
      }
    };
    const ro = new ResizeObserver((entries) => {
      update(entries[0].contentRect.width);
    });
    ro.observe(el);
    update(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const scale = containerWidth / CANVAS_W;

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Visual canvas dimensions used by the scroll-size envelope
  const visualW = CANVAS_W * scale; // always = containerWidth
  const visualH = dynamicCanvasH * scale;

  // ── Drag state ───────────────────────────────────────────────────────────
  const dragRef = useRef<{
    id: string;
    startPointerX: number;
    startPointerY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  const layoutRef = useRef<Layout>(layout);
  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  const updatePosition = useCallback(() => {
    const d = dragRef.current;
    if (!d) return;
    const { x: clientX, y: clientY } = lastPointerRef.current;
    const s = scaleRef.current || 1;
    const newX = Math.max(
      0,
      Math.min(d.origX + (clientX - d.startPointerX) / s, CANVAS_W - CARD_W),
    );
    const newY = Math.max(
      0,
      Math.min(
        d.origY + (clientY - d.startPointerY) / s,
        dynamicCanvasHRef.current - CARD_H,
      ),
    );
    setLayout((prev) => ({ ...prev, [d.id]: { x: newX, y: newY } }));
  }, []);

  const startDrag = useCallback(
    (id: string, clientX: number, clientY: number) => {
      const pos = layoutRef.current[id] ?? { x: 0, y: 0 };
      lastPointerRef.current = { x: clientX, y: clientY };
      dragRef.current = {
        id,
        startPointerX: clientX,
        startPointerY: clientY,
        origX: pos.x,
        origY: pos.y,
      };
      setActiveDragId(id);
    },
    [],
  );

  const moveDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragRef.current) return;
      lastPointerRef.current = { x: clientX, y: clientY };
      updatePosition();
    },
    [updatePosition],
  );

  const endDrag = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setActiveDragId(null);
    setLayout((latest) => {
      localStorage.setItem(storageKey, JSON.stringify(latest));
      return latest;
    });
  }, [storageKey]);

  useEffect(() => {
    if (!isArranging) return;

    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = () => endDrag();
    const onTouchMove = (e: TouchEvent) => {
      if (!dragRef.current) return;
      e.preventDefault();
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => endDrag();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isArranging, moveDrag, endDrag]);

  const handleTableMouseDown = useCallback(
    (e: React.MouseEvent, table: Table) => {
      if (!isArranging) return;
      e.preventDefault();
      startDrag(table._id, e.clientX, e.clientY);
    },
    [isArranging, startDrag],
  );

  const handleTableTouchStart = useCallback(
    (e: React.TouchEvent, table: Table) => {
      if (!isArranging) return;
      e.stopPropagation();
      startDrag(table._id, e.touches[0].clientX, e.touches[0].clientY);
    },
    [isArranging, startDrag],
  );

  const handleToggleArranging = () => {
    if (isArranging) {
      setLayout((latest) => {
        localStorage.setItem(storageKey, JSON.stringify(latest));
        return latest;
      });
    }
    setIsArranging((v) => !v);
  };

  const handleResetLayout = () => {
    const def = buildDefaultLayout(tables);
    setLayout(def);
    localStorage.setItem(storageKey, JSON.stringify(def));
  };

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Controls bar */}
      {canEdit && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            px: 2,
            py: 0.75,
            flexShrink: 0,
            flexWrap: "wrap",
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "white",
          }}
        >
          <Chip
            icon={isArranging ? <LockOpenIcon /> : <LockIcon />}
            label={
              isArranging
                ? "Arranging — drag tables to position"
                : "Layout locked — tap to arrange"
            }
            onClick={handleToggleArranging}
            color={isArranging ? "warning" : "default"}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          {isArranging && (
            <Chip
              icon={<GridViewIcon />}
              label="Reset to grid"
              onClick={handleResetLayout}
              size="small"
              variant="outlined"
              color="primary"
            />
          )}
        </Box>
      )}

      {/*
        Scroll wrapper: fills remaining height, scrolls vertically when the
        canvas is taller than the viewport. No horizontal scroll (canvas is
        always scaled to container width).
      */}
      <Box
        ref={wrapperRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          touchAction: isArranging ? "none" : "auto",
          bgcolor: "#faf6ee",
          backgroundImage:
            "radial-gradient(circle, #d0c0a4 1.2px, transparent 1.2px)",
          backgroundSize: "30px 30px",
        }}
      >
        {/*
          Envelope box: its CSS dimensions match the scaled canvas visual size
          so the browser knows the correct scrollable area height.
        */}
        <Box sx={{ width: visualW, height: visualH, position: "relative" }}>
          {/*
            Canvas: always CANVAS_W × dynamicCanvasH in logical units,
            scaled by CSS transform so it visually fills the container width.
            transform-origin: top-left keeps coordinates aligned with scroll.
          */}
          <Box
            ref={canvasRef}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: CANVAS_W,
              height: dynamicCanvasH,
              transform: `scale(${scale})`,
              transformOrigin: "0 0",
              cursor: isArranging ? "default" : "auto",
            }}
          >
            <Typography
              sx={{
                position: "absolute",
                bottom: 10,
                right: 16,
                fontSize: 10,
                color: "#c4b49a",
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              Floor Plan
            </Typography>

            {tables.map((table) => {
              const pos = layout[table._id] ?? { x: 20, y: 20 };
              const isDragging = activeDragId === table._id;
              return (
                <Box
                  key={table._id}
                  sx={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    zIndex: isDragging ? 50 : 1,
                    transition: isDragging
                      ? "none"
                      : "filter 0.15s, transform 0.15s",
                    filter: isDragging
                      ? "drop-shadow(0 8px 20px rgba(0,0,0,0.22))"
                      : "none",
                    transform: isDragging ? "scale(1.06)" : "scale(1)",
                    touchAction: isArranging ? "none" : "auto",
                  }}
                >
                  <TableTile
                    table={table}
                    canEdit={canEdit}
                    onEdit={() => onEdit(table)}
                    onDelete={() => onDelete(table)}
                    isArranging={isArranging}
                    onMouseDown={(e) => handleTableMouseDown(e, table)}
                    onTouchStart={(e) => handleTableTouchStart(e, table)}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
