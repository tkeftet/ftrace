export const tenantKeys = {
  all: ["tenants"] as const,
  list: (page: number) => ["tenants", "list", page] as const,
  stats: () => ["tenants", "stats"] as const,
  detail: (id: string) => ["tenants", "detail", id] as const,
  verify: (slug: string) => ["tenants", "verify", slug] as const,
};

export const staffKeys = {
  all: ["staff"] as const,
  list: () => ["staff", "list"] as const,
};

export const menuKeys = {
  all: ["menu"] as const,
  categories: () => ["menu", "categories"] as const,
  items: (categoryId?: string) =>
    categoryId
      ? (["menu", "items", categoryId] as const)
      : (["menu", "items"] as const),
};

export const tableKeys = {
  all: ["tables"] as const,
  list: () => ["tables", "list"] as const,
};

export const sectionKeys = {
  all: ["sections"] as const,
  list: () => ["sections", "list"] as const,
};

export const floorKeys = {
  all: ["floors"] as const,
  list: () => ["floors", "list"] as const,
};

export const orderKeys = {
  all: ["orders"] as const,
  list: (status?: string) =>
    status
      ? (["orders", "list", status] as const)
      : (["orders", "list"] as const),
};
