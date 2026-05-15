import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { authApi } from "@/api/endpoints/auth.api";
import { extractError } from "@/utils/extractError";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
type PasswordFormValues = z.infer<typeof passwordSchema>;

interface SecurityCardProps {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function SecurityCard({ onSuccess, onError }: SecurityCardProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: PasswordFormValues) =>
      authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      reset();
      onSuccess("Password changed successfully");
    },
    onError: (err) => onError(extractError(err)),
  });

  const eyeAdornment = (show: boolean, toggle: () => void) => ({
    endAdornment: (
      <InputAdornment position="end">
        <IconButton size="small" onClick={toggle} edge="end">
          {show ? (
            <VisibilityOff fontSize="small" />
          ) : (
            <Visibility fontSize="small" />
          )}
        </IconButton>
      </InputAdornment>
    ),
  });

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <LockIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={600}>
            Change password
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Controller
            name="currentPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Current password"
                type={showCurrent ? "text" : "password"}
                size="small"
                fullWidth
                error={!!errors.currentPassword}
                helperText={errors.currentPassword?.message}
                InputProps={eyeAdornment(showCurrent, () =>
                  setShowCurrent((v) => !v),
                )}
              />
            )}
          />
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="New password"
                type={showNew ? "text" : "password"}
                size="small"
                fullWidth
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
                InputProps={eyeAdornment(showNew, () => setShowNew((v) => !v))}
              />
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Confirm new password"
                type={showConfirm ? "text" : "password"}
                size="small"
                fullWidth
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={eyeAdornment(showConfirm, () =>
                  setShowConfirm((v) => !v),
                )}
              />
            )}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
            sx={{ alignSelf: "flex-end", minWidth: 140 }}
          >
            {mutation.isPending ? "Updating…" : "Update password"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
