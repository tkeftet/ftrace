import { Avatar } from "@mui/material";
import { getAvatarColor } from "../utils";

interface Props {
  name: string;
}

export function TenantAvatar({ name }: Props) {
  const color = getAvatarColor(name);
  return (
    <Avatar
      sx={{
        bgcolor: color,
        width: 36,
        height: 36,
        fontSize: 14,
        fontWeight: 700,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </Avatar>
  );
}
