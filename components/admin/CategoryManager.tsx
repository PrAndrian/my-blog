"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { handleMutationError } from "@/lib/errors";
import { showError, showSuccess } from "@/lib/toast";
import { useMutation, useQuery } from "convex/react";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export function CategoryManager() {
  const categories = useQuery(api.categories.list);
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const deleteCategory = useMutation(api.categories.remove);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id?: Id<"categories">;
    slug: string;
    name_en: string;
    name_fr: string;
    section?: string;
    redirectUrl?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<Id<"categories"> | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setIsLoading(true);
    try {
      if (editingCategory.id) {
        await updateCategory({
          id: editingCategory.id,
          slug: editingCategory.slug,
          name_en: editingCategory.name_en,
          name_fr: editingCategory.name_fr,
          section: editingCategory.section || undefined,
          redirectUrl: editingCategory.redirectUrl || undefined,
        });
        showSuccess("Category updated successfully");
      } else {
        await createCategory({
          slug: editingCategory.slug,
          name_en: editingCategory.name_en,
          name_fr: editingCategory.name_fr,
          section: editingCategory.section || undefined,
          redirectUrl: editingCategory.redirectUrl || undefined,
        });
        showSuccess("Category created successfully");
      }
      setIsDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
      const errorMessage = handleMutationError(error);
      showError(errorMessage || "Failed to save category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteCategory({ id: deleteId });
      showSuccess("Category deleted successfully");
      setDeleteId(null);
    } catch (error) {
      const errorMessage = handleMutationError(error);
      showError(errorMessage || "Failed to delete category");
    }
  };

  const openCreateDialog = () => {
    setEditingCategory({
      slug: "",
      name_en: "",
      name_fr: "",
      section: "",
      redirectUrl: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: any) => {
    setEditingCategory({
      id: category._id,
      slug: category.slug,
      name_en: category.name_en,
      name_fr: category.name_fr,
      section: category.section || "",
      redirectUrl: category.redirectUrl || "",
    });
    setIsDialogOpen(true);
  };

  if (categories === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Manage blog categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Manage blog categories and their translations
            </CardDescription>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>English Name</TableHead>
                <TableHead>French Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Redirect</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No categories found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-mono text-sm">
                      {category.slug}
                    </TableCell>
                    <TableCell>{category.name_en}</TableCell>
                    <TableCell>{category.name_fr}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.section || <span className="italic">None</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[150px] truncate">
                      {category.redirectUrl || (
                        <span className="italic">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(category._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory?.id ? "Edit Category" : "Create Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory?.id
                ? "Update the category details and translations."
                : "Add a new category with English and French translations."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={editingCategory?.slug || ""}
                onChange={(e) =>
                  setEditingCategory((prev) =>
                    prev ? { ...prev, slug: e.target.value } : null
                  )
                }
                placeholder="e.g., technology"
                required
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs and code. Should be lowercase and unique.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section (Optional)</Label>
              <Input
                id="section"
                value={editingCategory?.section || ""}
                onChange={(e) =>
                  setEditingCategory((prev) =>
                    prev ? { ...prev, section: e.target.value } : null
                  )
                }
                placeholder="e.g., Articles, Resources, Efficy Labs"
              />
              <p className="text-xs text-muted-foreground">
                Group categories into sections for better organization.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="redirectUrl">Redirect URL (Optional)</Label>
              <Input
                id="redirectUrl"
                value={editingCategory?.redirectUrl || ""}
                onChange={(e) =>
                  setEditingCategory((prev) =>
                    prev ? { ...prev, redirectUrl: e.target.value } : null
                  )
                }
                placeholder="e.g., https://google.com"
              />
              <p className="text-xs text-muted-foreground">
                If set, clicking this category will redirect to this URL instead
                of showing posts.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name_en">English Name</Label>
                <Input
                  id="name_en"
                  value={editingCategory?.name_en || ""}
                  onChange={(e) =>
                    setEditingCategory((prev) =>
                      prev ? { ...prev, name_en: e.target.value } : null
                    )
                  }
                  placeholder="Technology"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_fr">French Name</Label>
                <Input
                  id="name_fr"
                  value={editingCategory?.name_fr || ""}
                  onChange={(e) =>
                    setEditingCategory((prev) =>
                      prev ? { ...prev, name_fr: e.target.value } : null
                    )
                  }
                  placeholder="Technologie"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCategory?.id ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
