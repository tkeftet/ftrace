import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useLogin, useTenantLogin } from "../hooks";
import { getTenantSlug, isSuperAdminDomain } from "@/utils/tenant";
import { extractError } from "@/utils/extractError";
import axios from "axios";

// ── Validation schema ─────────────────────────────────────────────
const loginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ── Field label component ─────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      component="label"
      sx={{
        display: "block",
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        color: "#64748B",
        mb: 1,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Typography>
  );
}

// ── Main card ─────────────────────────────────────────────────────
export function LoginFormCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isSuperAdmin = isSuperAdminDomain();
  const slug = getTenantSlug();

  const superAdminMutation = useLogin();
  const tenantMutation = useTenantLogin();
  const mutation = isSuperAdmin ? superAdminMutation : tenantMutation;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormValues> = (data) => {
    if (!isSuperAdmin && !slug) {
      setServerError(
        "Could not determine the restaurant. Please check the URL.",
      );
      return;
    }
    setServerError(null);

    const payload = isSuperAdmin
      ? { email: data.email, password: data.password }
      : { email: data.email, password: data.password, slug: slug! };

    mutation.mutate(payload as never, {
      onError: (error) => {
        // Status-code-specific messages improve UX for predictable failure modes.
        // For all other cases we fall back to the shared extractError utility
        // so error surfacing stays consistent across the app.
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (!isSuperAdmin && status === 404) {
            setServerError(
              "Restaurant not found or inactive. Please check the URL.",
            );
            return;
          }
          if (status === 401) {
            setServerError("Invalid email or password.");
            return;
          }
        }
        setServerError(extractError(error));
      },
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 480,
        mx: "auto",
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        p: { xs: 3.5, sm: 5 },
        bgcolor: "white",
      }}
    >
      {/* Tenant badge */}
      {!isSuperAdmin && slug && (
        <Typography
          variant="overline"
          sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 1.5 }}
          display="block"
          mb={0.5}
        >
          {slug}
        </Typography>
      )}

      <Typography
        id="login-heading"
        variant="h5"
        sx={{ fontWeight: 700, color: "#0B1437", mb: 4, fontSize: "1.5rem" }}
      >
        {isSuperAdmin ? "Sign In" : "Staff Sign In"}
      </Typography>

      {serverError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {serverError}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-labelledby="login-heading"
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        {/* Email */}
        <Box>
          <FieldLabel>Email Address</FieldLabel>
          <TextField
            {...register("email")}
            fullWidth
            placeholder={
              isSuperAdmin ? "name@executive.com" : "staff@restaurant.com"
            }
            type="email"
            autoComplete="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            sx={inputSx}
          />
        </Box>

        {/* Password */}
        <Box>
          <FieldLabel>Password</FieldLabel>
          <TextField
            {...register("password")}
            fullWidth
            placeholder="••••••••"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon sx={{ fontSize: 18 }} />
                      ) : (
                        <VisibilityIcon sx={{ fontSize: 18 }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={inputSx}
          />
        </Box>

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={mutation.isPending}
          sx={{
            bgcolor: "#0B1437",
            "&:hover": { bgcolor: "#152054" },
            py: 1.75,
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "0.95rem",
            boxShadow: "none",
            mt: 1,
          }}
        >
          {mutation.isPending
            ? "Signing in…"
            : isSuperAdmin
              ? "Sign In to Dashboard"
              : "Sign In"}
        </Button>
      </Box>

      {isSuperAdmin && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography
            variant="caption"
            align="center"
            display="block"
            sx={{ color: "text.secondary", lineHeight: 1.8 }}
          >
            Authorized access only. By proceeding, you agree to our{" "}
            <Link
              href="#"
              underline="always"
              sx={{ color: "text.primary", fontWeight: 600 }}
            >
              Security Protocols
            </Link>
            .
          </Typography>
        </>
      )}
    </Paper>
  );
}

// ── Shared input style ────────────────────────────────────────────
const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#F1F5F9",
    borderRadius: 2,
    "& fieldset": { border: "none" },
    "&:hover fieldset": { border: "none" },
    "&.Mui-focused fieldset": {
      border: "1.5px solid #2563EB",
    },
    "&.Mui-error fieldset": {
      border: "1.5px solid",
      borderColor: "error.main",
    },
  },
  "& input::placeholder": {
    color: "#94A3B8",
    opacity: 1,
  },
};
