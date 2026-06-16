import axiosInstance from "../axiosInstance";

export interface MenuCategory {
  _id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  _id: string;
  category: string | { _id: string; name: string };
  name: string;
  description?: string;
  price: number;
  image?: string;
  target: "bar" | "kitchen";
  isAvailable: boolean;
  preparationTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  displayOrder?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  displayOrder?: number;
}

export interface CreateMenuItemPayload {
  category: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  target: "bar" | "kitchen";
  preparationTime?: number;
}

export interface UpdateMenuItemPayload {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  target?: "bar" | "kitchen";
  preparationTime?: number;
  isAvailable?: boolean;
}

export interface ExtractedItem {
  name: string;
  description: string;
  price: number;
  target: "bar" | "kitchen";
}

export interface ExtractedCategory {
  categoryName: string;
  items: ExtractedItem[];
}

export interface ParseMenuResponse {
  categories: ExtractedCategory[];
}

export interface ImportConfirmResponse {
  message: string;
  createdCategories: string[];
  reusedCategories: string[];
  createdItems: string[];
}

export const menuApi = {
  // Categories
  getCategories: () => axiosInstance.get<MenuCategory[]>("/menu/categories"),

  createCategory: (payload: CreateCategoryPayload) =>
    axiosInstance.post<MenuCategory>("/menu/categories", payload),

  updateCategory: (id: string, payload: UpdateCategoryPayload) =>
    axiosInstance.put<MenuCategory>(`/menu/categories/${id}`, payload),

  deleteCategory: (id: string) =>
    axiosInstance.delete(`/menu/categories/${id}`),

  // Items
  getItems: (categoryId?: string) =>
    axiosInstance.get<MenuItem[]>("/menu/items", {
      params: categoryId ? { category: categoryId } : undefined,
    }),

  createItem: (payload: CreateMenuItemPayload) =>
    axiosInstance.post<MenuItem>("/menu/items", payload),

  updateItem: (id: string, payload: UpdateMenuItemPayload) =>
    axiosInstance.put<MenuItem>(`/menu/items/${id}`, payload),

  deleteItem: (id: string) => axiosInstance.delete(`/menu/items/${id}`),

  // Menu Import (PDF, Word, or image)
  parseMenu: (file: File) => {
    const formData = new FormData();
    formData.append("menu", file);
    return axiosInstance.post<ParseMenuResponse>(
      "/menu/import/parse",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },

  confirmImport: (categories: ExtractedCategory[]) =>
    axiosInstance.post<ImportConfirmResponse>("/menu/import/confirm", {
      categories,
    }),
};
