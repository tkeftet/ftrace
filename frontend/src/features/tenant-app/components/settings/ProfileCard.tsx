import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/endpoints/auth.api";
import {
  STAFF_ROLE_LABELS,
  ROLE_COLORS,
  type StaffRole,
} from "@/types/staff.types";
import { extractError } from "@/utils/extractError";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileCardProps {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function ProfileCard({ onSuccess, onError }: ProfileCardProps) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const role = user?.role as StaffRole | undefined;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });

  const mutation = useMutation({
    mutationFn: (data: ProfileFormValues) => authApi.updateProfile(data),
    onSuccess: (res) => {
      updateUser({ name: res.data.user.name, email: res.data.user.email });
      onSuccess("Profile updated successfully");
    },
    onError: (err) => onError(extractError(err)),
  });

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <PersonIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={600}>
            Profile
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Avatar
            sx={{
              width: 72,
              height: 72,
              fontSize: "1.5rem",
              fontWeight: 700,
              bgcolor: "primary.main",
              mb: 1.5,
            }}
          >
            {initials}
          </Avatar>
          {role && (
            <Chip
              label={STAFF_ROLE_LABELS[role]}
              color={ROLE_COLORS[role]}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        <Box
          component="form"
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Full name"
                size="small"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email address"
                type="email"
                size="small"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!isDirty || mutation.isPending}
            sx={{ alignSelf: "flex-end", minWidth: 120 }}
          >
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
