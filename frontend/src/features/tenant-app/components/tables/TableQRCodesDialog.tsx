import { useRef } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import CloseIcon from "@mui/icons-material/Close";
import { QRCodeSVG } from "qrcode.react";
import type { Table } from "@/api/endpoints/table.api";
import { getTableOrderUrl } from "@/utils/tenant";

interface Props {
  open: boolean;
  onClose: () => void;
  tables: Table[];
  slug: string | null;
  /** Restaurant name, shown on each printed card. */
  tenantName?: string;
}

const tableLabel = (t: Table) => t.label || `Table ${t.number}`;

export function TableQRCodesDialog({
  open,
  onClose,
  tables,
  slug,
  tenantName,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(`<!doctype html>
<html>
  <head>
    <title>Table QR Codes${tenantName ? ` — ${tenantName}` : ""}</title>
    <style>
      * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 16px; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      .card {
        border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px;
        display: flex; flex-direction: column; align-items: center; text-align: center;
        page-break-inside: avoid;
      }
      .card .name { font-size: 18px; font-weight: 800; margin: 0 0 4px; color: #0f172a; }
      .card .hint { font-size: 12px; color: #64748b; margin: 8px 0 0; }
      .card .biz { font-size: 12px; color: #b45309; font-weight: 700; margin: 0 0 10px; }
      @media print { .grid { grid-template-columns: repeat(3, 1fr); } }
    </style>
  </head>
  <body>
    <div class="grid">${printRef.current.innerHTML}</div>
    <script>window.onload = function () { window.focus(); window.print(); };<\/script>
  </body>
</html>`);
    win.document.close();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        Table QR codes
        <Typography variant="body2" color="text.secondary" fontWeight={400}>
          Customers scan a table's code to open the menu and order.
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {!slug ? (
          <Typography color="error">
            Could not determine the workspace for these QR codes.
          </Typography>
        ) : tables.length === 0 ? (
          <Typography color="text.secondary">No tables to generate.</Typography>
        ) : (
          <Box
            ref={printRef}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {tables.map((t) => (
              <Box
                key={t._id}
                className="card"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Typography className="name" fontWeight={800}>
                  {tableLabel(t)}
                </Typography>
                {tenantName && (
                  <Typography
                    className="biz"
                    fontSize={12}
                    fontWeight={700}
                    color="#b45309"
                    mb={1}
                  >
                    {tenantName}
                  </Typography>
                )}
                <QRCodeSVG
                  value={getTableOrderUrl(slug, t._id)}
                  size={140}
                  level="M"
                  marginSize={2}
                />
                <Typography className="hint" fontSize={12} color="text.secondary" mt={1}>
                  Scan to order
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} startIcon={<CloseIcon />} sx={{ textTransform: "none" }}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handlePrint}
          startIcon={<PrintIcon />}
          disabled={!slug || tables.length === 0}
          sx={{
            bgcolor: "#b45309",
            "&:hover": { bgcolor: "#92400e" },
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Print all
        </Button>
      </DialogActions>
    </Dialog>
  );
}
