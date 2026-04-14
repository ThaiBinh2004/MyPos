"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2 } from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/sales.service";
import type { Category } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableTh,
  TableTd,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { isAdmin } from "@/lib/permissions";
import { useAuth } from "@/contexts/auth-context";

const schema = z.object({
  categoryName: z.string().min(1, "Bắt buộc"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CategoriesPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const admin = isAdmin(user?.role ?? '');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  function openCreate() {
    setEditing(null);
    reset({ categoryName: "", description: "" });
    setShowModal(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    reset({ categoryName: cat.categoryName, description: cat.description ?? "" });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    reset();
  }

  function onSubmit(data: FormData) {
    if (editing) {
      updateMutation.mutate({ id: editing.categoryId, payload: data });
    } else {
      createMutation.mutate(data);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 space-y-4">
      {admin && (
        <div className="flex justify-end">
          <Button onClick={openCreate}>Thêm danh mục</Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>Tên danh mục</TableTh>
                <TableTh>Mô tả</TableTh>
                <TableTh>Thao tác</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableTd colSpan={3} className="text-center py-8 text-gray-500">
                    Đang tải...
                  </TableTd>
                </TableRow>
              ) : !categories?.length ? (
                <TableRow>
                  <TableTd colSpan={3} className="text-center py-8 text-gray-500">
                    Chưa có danh mục
                  </TableTd>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.categoryId}>
                    <TableTd className="font-medium">{cat.categoryName}</TableTd>
                    <TableTd>{cat.description ?? "—"}</TableTd>
                    <TableTd>
                      {admin && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(cat)}>
                            <Pencil size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => deleteMutation.mutate(cat.categoryId)}
                            loading={deleteMutation.isPending}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </TableTd>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editing ? "Sửa danh mục" : "Thêm danh mục"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Tên danh mục *"
            {...register("categoryName")}
            error={errors.categoryName?.message}
          />
          <Input
            label="Mô tả"
            {...register("description")}
            error={errors.description?.message}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Hủy
            </Button>
            <Button type="submit" loading={isPending}>
              {editing ? "Lưu" : "Tạo"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
