import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { CategoryTabBar } from "../components/menu/CategoryTabBar";
import { MenuItemCard } from "../components/menu/MenuItemCard";
import { CategoryDialog } from "../components/menu/CategoryDialog";
import { ItemDialog } from "../components/menu/ItemDialog";
import type { CategoryForm, ItemForm } from "../schemas/menuSchemas";

import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
} from "../hooks/menu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { AppSnackbar } from "@/components/common/AppSnackbar";
import { useSnackbar } from "@/hooks/useSnackbar";
import { extractError } from "@/utils/extractError";
import MenuImportDialog from "../components/menu/MenuImportDialog";
import type {
  MenuCategory,
  MenuItem as IMenuItem,
} from "@/api/endpoints/menu.api";

export default function MenuPage() {
  const { snackbar, show, close: closeSnackbar } = useSnackbar();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { data: categories = [], isLoading: loadingCats } = useCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<MenuCategory | null>(null);
  const [deleteCatTarget, setDeleteCatTarget] = useState<MenuCategory | null>(
    null,
  );

  const effectiveCatId = selectedCatId ?? categories[0]?._id ?? null;

  const { data: items = [], isLoading: loadingItems } = useMenuItems(
    effectiveCatId ?? undefined,
  );
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem(effectiveCatId ?? undefined);
  const deleteItem = useDeleteMenuItem(effectiveCatId ?? undefined);

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IMenuItem | null>(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState<IMenuItem | null>(
    null,
  );

  const displayedCategory =
    categories.find((c) => c._id === effectiveCatId) ?? null;

  const handleCatSubmit = (data: CategoryForm) => {
    if (editingCat) {
      updateCat.mutate(
        { id: editingCat._id, payload: data },
        {
          onSuccess: () => {
            show("Category updated.", "success");
            setCatDialogOpen(false);
            setEditingCat(null);
          },
          onError: (err) => show(extractError(err), "error"),
        },
      );
    } else {
      createCat.mutate(data, {
        onSuccess: (cat) => {
          show("Category created.", "success");
          setCatDialogOpen(false);
          setSelectedCatId(cat._id);
        },
        onError: (err) => show(extractError(err), "error"),
      });
    }
  };

  const handleDeleteCat = () => {
    if (!deleteCatTarget) return;
    deleteCat.mutate(deleteCatTarget._id, {
      onSuccess: () => {
        show("Category deleted.", "success");
        if (selectedCatId === deleteCatTarget._id) setSelectedCatId(null);
        setDeleteCatTarget(null);
      },
      onError: (err) => show(extractError(err), "error"),
    });
  };

  const handleItemSubmit = (data: ItemForm) => {
    if (!effectiveCatId) return;
    if (editingItem) {
      updateItem.mutate(
        { id: editingItem._id, payload: data },
        {
          onSuccess: () => {
            show("Item updated.", "success");
            setItemDialogOpen(false);
            setEditingItem(null);
          },
          onError: (err) => show(extractError(err), "error"),
        },
      );
    } else {
      createItem.mutate(
        { ...data, category: effectiveCatId },
        {
          onSuccess: () => {
            show("Item added.", "success");
            setItemDialogOpen(false);
          },
          onError: (err) => show(extractError(err), "error"),
        },
      );
    }
  };

  const handleDeleteItem = () => {
    if (!deleteItemTarget) return;
    deleteItem.mutate(deleteItemTarget._id, {
      onSuccess: () => {
        show("Item removed.", "success");
        setDeleteItemTarget(null);
      },
      onError: (err) => show(extractError(err), "error"),
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 6 }}>
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          pt: { xs: 2.5, md: 3 },
          pb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <RestaurantMenuIcon sx={{ color: "#b45309", fontSize: 26 }} />
          <Typography variant="h5" fontWeight={800} sx={{ color: "#b45309" }}>
            Menu
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {isMobile ? (
            <>
              <Tooltip title="Import PDF">
                <IconButton
                  size="small"
                  onClick={() => setImportDialogOpen(true)}
                  sx={{
                    border: "1.5px solid #b45309",
                    borderRadius: 2,
                    color: "#b45309",
                    p: 0.75,
                  }}
                >
                  <UploadFileIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add Category">
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditingCat(null);
                    setCatDialogOpen(true);
                  }}
                  sx={{
                    border: "1.5px solid #b45309",
                    borderRadius: 2,
                    color: "#b45309",
                    p: 0.75,
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Button
                size="small"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => setImportDialogOpen(true)}
                sx={{
                  borderColor: "#b45309",
                  color: "#b45309",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                Import PDF
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingCat(null);
                  setCatDialogOpen(true);
                }}
                sx={{
                  borderColor: "#b45309",
                  color: "#b45309",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                Category
              </Button>
            </>
          )}
        </Box>
      </Box>

      {loadingCats ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={26} sx={{ color: "#b45309" }} />
        </Box>
      ) : categories.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 12, px: 3 }}>
          <RestaurantMenuIcon sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            No categories yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Add your first category to start building the menu.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingCat(null);
              setCatDialogOpen(true);
            }}
            sx={{
              bgcolor: "#b45309",
              "&:hover": { bgcolor: "#92400e" },
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Add Category
          </Button>
        </Box>
      ) : (
        <>
          <CategoryTabBar
            categories={categories}
            activeId={effectiveCatId}
            onSelect={setSelectedCatId}
          />

          {displayedCategory && (
            <Box
              sx={{
                px: { xs: 2, md: 3 },
                py: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "white",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ color: "#64748b" }}
              >
                {displayedCategory.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {isMobile ? (
                  <Tooltip title="Add Item">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingItem(null);
                        setItemDialogOpen(true);
                      }}
                      sx={{
                        bgcolor: "#b45309",
                        color: "white",
                        borderRadius: 1.5,
                        p: 0.6,
                        "&:hover": { bgcolor: "#92400e" },
                      }}
                    >
                      <AddIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingItem(null);
                      setItemDialogOpen(true);
                    }}
                    sx={{
                      bgcolor: "#b45309",
                      "&:hover": { bgcolor: "#92400e" },
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 12,
                      py: 0.45,
                      borderRadius: 1.5,
                    }}
                  >
                    Add Item
                  </Button>
                )}
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditingCat(displayedCategory);
                    setCatDialogOpen(true);
                  }}
                  sx={{
                    color: "#64748b",
                    "&:hover": {
                      color: "#b45309",
                      bgcolor: "rgba(26,58,92,0.06)",
                    },
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setDeleteCatTarget(displayedCategory)}
                  sx={{ "&:hover": { bgcolor: "rgba(239,68,68,0.07)" } }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          )}

          <Box sx={{ px: { xs: 2, md: 3 }, pt: 2.5, pb: 2 }}>
            {loadingItems ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                <CircularProgress sx={{ color: "#b45309" }} />
              </Box>
            ) : items.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <RestaurantMenuIcon
                  sx={{ fontSize: 52, color: "#cbd5e1", mb: 1.5 }}
                />
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight={600}
                >
                  No items yet
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  sx={{ mt: 1.5, textTransform: "none" }}
                  onClick={() => {
                    setEditingItem(null);
                    setItemDialogOpen(true);
                  }}
                >
                  Add first item
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: { xs: 1, sm: 1.5, md: 2 },
                }}
              >
                {items.map((item) => (
                  <MenuItemCard
                    key={item._id}
                    item={item}
                    onEdit={() => {
                      setEditingItem(item);
                      setItemDialogOpen(true);
                    }}
                    onDelete={() => setDeleteItemTarget(item)}
                  />
                ))}
              </Box>
            )}
          </Box>
        </>
      )}

      <CategoryDialog
        open={catDialogOpen}
        editing={editingCat}
        loading={createCat.isPending || updateCat.isPending}
        onClose={() => {
          setCatDialogOpen(false);
          setEditingCat(null);
        }}
        onSubmit={handleCatSubmit}
      />

      <ItemDialog
        open={itemDialogOpen}
        editing={editingItem}
        loading={createItem.isPending || updateItem.isPending}
        onClose={() => {
          setItemDialogOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleItemSubmit}
      />

      <ConfirmDialog
        open={!!deleteCatTarget}
        title="Delete category?"
        message={`"${deleteCatTarget?.name}" and all its items will be removed. This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteCat.isPending}
        onConfirm={handleDeleteCat}
        onCancel={() => setDeleteCatTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteItemTarget}
        title="Remove item?"
        message={`"${deleteItemTarget?.name}" will be removed from the menu.`}
        confirmLabel="Remove"
        loading={deleteItem.isPending}
        onConfirm={handleDeleteItem}
        onCancel={() => setDeleteItemTarget(null)}
      />

      <MenuImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={(cats, items) =>
          show(
            `Imported ${cats.length} categor${cats.length === 1 ? "y" : "ies"} and ${items.length} item${items.length === 1 ? "" : "s"}.`,
            "success",
          )
        }
      />

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </Box>
  );
}
