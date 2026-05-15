export interface TenantOwner {
  _id: string;
  name: string;
  email: string;
}

export interface Tenant {
  _id: string;
  name: string;
  slug: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  currency: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner: TenantOwner | string | null;
  __v: number;
}

export interface TenantListResponse {
  tenants: Tenant[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateTenantPayload {
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  plan: Tenant["plan"];
  currency: string;
  timezone: string;
}

export interface UpdateTenantPayload {
  name: string;
  slug: string;
  plan: Tenant["plan"];
  currency: string;
  timezone: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}
