import { IconButton, InputAdornment, Stack, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function TenantSearchBar({ value, onChange }: Props) {
  return (
    <Stack direction="row" spacing={1} mb={3}>
      <TextField
        fullWidth
        placeholder="Search tenants..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ bgcolor: "background.paper", borderRadius: 2 }}
      />
      <IconButton
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <FilterListIcon />
      </IconButton>
    </Stack>
  );
}
