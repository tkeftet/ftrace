import { MenuItem, TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import type {
  Control,
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";

const PLANS = ["free", "starter", "pro", "enterprise"] as const;
export const CURRENCIES = ["MAD", "USD", "EUR", "GBP", "AED", "SAR"] as const;
export const TIMEZONES = [
  "Africa/Casablanca",
  "Europe/Paris",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Tokyo",
  "UTC",
] as const;

interface Errors {
  name?: FieldError;
  slug?: FieldError;
  plan?: FieldError;
  ownerName?: FieldError;
  ownerEmail?: FieldError;
  currency?: FieldError;
  timezone?: FieldError;
}

interface Props<T extends FieldValues> {
  register: UseFormRegister<T>;
  control: Control<T>;
  errors: Errors;
}

export function TenantFormFields<T extends FieldValues>({
  register,
  control,
  errors,
}: Props<T>) {
  return (
    <>
      <TextField
        label="Restaurant Name"
        {...register("name" as Path<T>)}
        error={!!errors.name}
        helperText={errors.name?.message}
      />
      <TextField
        label="Slug"
        {...register("slug" as Path<T>)}
        error={!!errors.slug}
        helperText={errors.slug?.message ?? "e.g. my-restaurant"}
      />
      <TextField
        label="Owner Name"
        {...register("ownerName" as Path<T>)}
        error={!!errors.ownerName}
        helperText={errors.ownerName?.message}
      />
      <TextField
        label="Owner Email"
        type="email"
        {...register("ownerEmail" as Path<T>)}
        error={!!errors.ownerEmail}
        helperText={errors.ownerEmail?.message}
      />
      <Controller
        name={"currency" as Path<T>}
        control={control}
        defaultValue={"MAD" as never}
        render={({ field }) => (
          <TextField
            select
            label="Currency"
            {...field}
            error={!!errors.currency}
            helperText={errors.currency?.message}
          >
            {CURRENCIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <Controller
        name={"timezone" as Path<T>}
        control={control}
        defaultValue={"Africa/Casablanca" as never}
        render={({ field }) => (
          <TextField
            select
            label="Timezone"
            {...field}
            error={!!errors.timezone}
            helperText={errors.timezone?.message}
          >
            {TIMEZONES.map((tz) => (
              <MenuItem key={tz} value={tz}>
                {tz}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <Controller
        name={"plan" as Path<T>}
        control={control}
        render={({ field }) => (
          <TextField
            select
            label="Plan"
            {...field}
            error={!!errors.plan}
            helperText={errors.plan?.message}
          >
            {PLANS.map((plan) => (
              <MenuItem key={plan} value={plan}>
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    </>
  );
}
