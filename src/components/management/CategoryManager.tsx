"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useNotification } from "@/components/providers/NotificationProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  BriefcaseBusiness,
  Car,
  CircleEllipsis,
  Clapperboard,
  Gift,
  HeartPulse,
  Home,
  Pencil,
  Plus,
  ShoppingBag,
  Tags,
  Trash2,
  Utensils,
  Wallet,
  X,
  GraduationCap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  deleteCategoryAction,
  saveCategoryAction,
} from "@/actions/category";
import {
  categorySchema,
  type CategoryInput,
} from "@/lib/validations/management";
import type { Category } from "@/types";

const icons: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  "shopping-bag": ShoppingBag,
  clapperboard: Clapperboard,
  wallet: Wallet,
  home: Home,
  health: HeartPulse,
  work: BriefcaseBusiness,
  education: GraduationCap,
  gift: Gift,
  "circle-ellipsis": CircleEllipsis,
};

const iconOptions = [
  { name: "utensils", label: "Makanan" },
  { name: "car", label: "Transportasi" },
  { name: "shopping-bag", label: "Belanja" },
  { name: "clapperboard", label: "Hiburan" },
  { name: "wallet", label: "Keuangan" },
  { name: "home", label: "Rumah" },
  { name: "health", label: "Kesehatan" },
  { name: "work", label: "Pekerjaan" },
  { name: "education", label: "Pendidikan" },
  { name: "gift", label: "Hadiah" },
  { name: "circle-ellipsis", label: "Lainnya" },
];
const iconLabels = Object.fromEntries(iconOptions.map((option) => [option.name, option.label]));
const colorOptions = [
  { token: "--primary", label: "Hijau utama" },
  { token: "--category-2", label: "Kuning" },
  { token: "--category-3", label: "Hijau sedang" },
  { token: "--category-4", label: "Kuning tua" },
  { token: "--category-5", label: "Hijau netral" },
  { token: "--category-6", label: "Abu hijau" },
];

const inputClassName =
  "mt-1.5 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-focus/25";

function CategoryForm({
  category,
  onCancel,
  onSaved,
}: {
  category?: Category | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [serverError, setServerError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const [swatchColors, setSwatchColors] = useState<Record<string, string>>({});
  const { resolvedTheme } = useTheme();
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          id: category.id,
          nama: category.nama,
          tipe: category.tipe,
          ikon: category.ikon,
          warna: category.warna,
        }
      : { nama: "", tipe: "keluar", ikon: "circle-ellipsis", warna: "" },
  });
  const { setValue } = form;
  const selectedColor = form.watch("warna");
  const selectedIcon = form.watch("ikon");
  const PreviewIcon = icons[selectedIcon] ?? CircleEllipsis;

  useEffect(() => {
    const colors = Object.fromEntries(
      colorOptions.map(({ token }) => [
        token,
        getComputedStyle(document.documentElement).getPropertyValue(token).trim(),
      ]),
    );
    setSwatchColors(colors);
    if (!category && colors["--primary"]) {
      setValue("warna", colors["--primary"].toUpperCase(), { shouldValidate: true });
    }
  }, [category, resolvedTheme, setValue]);

  function submit(values: CategoryInput) {
    setServerError(undefined);
    startTransition(async () => {
      const result = await saveCategoryAction(values);
      if (result.success) onSaved();
      else setServerError(result.error ?? "Kategori gagal disimpan.");
    });
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
      <label className="block text-sm font-medium text-foreground-soft">
        Nama kategori
        <input {...form.register("nama")} maxLength={60} className={inputClassName} placeholder="Contoh: Transportasi" />
        {form.formState.errors.nama && <span className="mt-1 block text-xs text-danger">{form.formState.errors.nama.message}</span>}
      </label>

      <label className="block text-sm font-medium text-foreground-soft">
        Jenis
        <select {...form.register("tipe")} className={inputClassName}>
          <option value="keluar">Pengeluaran</option>
          <option value="masuk">Pemasukan</option>
        </select>
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-foreground-soft">Ikon</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {iconOptions.map(({ name, label }) => {
            const Icon = icons[name];
            return (
              <button
                key={name}
                type="button"
                aria-label={`Pilih ikon ${label}`}
                aria-pressed={selectedIcon === name}
                onClick={() => form.setValue("ikon", name, { shouldValidate: true })}
                className={`grid size-11 place-items-center rounded-lg border transition ${selectedIcon === name ? "border-primary bg-primary-soft text-primary-strong" : "border-border text-muted hover:bg-surface-alt"}`}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-foreground-soft">Warna</legend>
        <div className="mt-2 flex flex-wrap items-center gap-2.5">
          {colorOptions.map(({ token, label }) => {
            const color = swatchColors[token];
            return (
              <button
                key={token}
                type="button"
                aria-label={`Pilih warna ${label}`}
                aria-pressed={Boolean(color && selectedColor.toLowerCase() === color.toLowerCase())}
                onClick={() => color && form.setValue("warna", color.toUpperCase(), { shouldValidate: true })}
                disabled={!color}
                className={`grid size-10 place-items-center rounded-md border border-border ${color && selectedColor.toLowerCase() === color.toLowerCase() ? "ring-2 ring-focus ring-offset-2 ring-offset-surface" : ""}`}
                style={{ backgroundColor: color || "var(--surface-alt)" }}
              />
            );
          })}
          {/^#[0-9A-Fa-f]{6}$/.test(selectedColor) && (
            <label className="relative grid size-10 cursor-pointer place-items-center overflow-hidden rounded-md border border-border" title="Warna lain">
              <input
                type="color"
                value={selectedColor}
                onChange={(event) => form.setValue("warna", event.target.value.toUpperCase(), { shouldValidate: true })}
                className="absolute -inset-2 size-14 cursor-pointer"
                aria-label="Pilih warna khusus"
              />
            </label>
          )}
          <span className="text-xs font-medium text-muted">{selectedColor}</span>
        </div>
      </fieldset>

      <div className="flex items-center gap-2 rounded-lg bg-surface-alt px-3 py-2.5">
        <span className="grid size-8 place-items-center rounded-md" style={{ color: selectedColor, backgroundColor: `color-mix(in srgb, ${selectedColor} 15%, var(--surface))` }}>
          <PreviewIcon size={17} />
        </span>
        <span className="text-sm font-medium text-foreground-soft">Pratinjau kategori</span>
      </div>

      {serverError && <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">{serverError}</p>}
      <div className="flex justify-end gap-2 border-t border-border-soft pt-4">
        <button type="button" onClick={onCancel} className="h-11 rounded-lg px-4 text-sm font-medium text-muted hover:bg-surface-alt">Batal</button>
        <button type="submit" disabled={isPending} className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-hover disabled:opacity-60">
          {isPending ? "Menyimpan..." : category ? "Simpan perubahan" : "Tambah kategori"}
        </button>
      </div>
    </form>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { confirm, toast } = useNotification();
  const [editing, setEditing] = useState<Category | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const expense = categories.filter((category) => category.tipe === "keluar");
  const income = categories.filter((category) => category.tipe === "masuk");

  useEffect(() => {
    if (!modalOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setModalOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  function openCreate() {
    setEditing(null);
    setFeedback(undefined);
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setFeedback(undefined);
    setModalOpen(true);
  }

  async function remove(category: Category) {
    const ok = await confirm({
      title: "Hapus Kategori",
      message: `Apakah Anda yakin ingin menghapus kategori "${category.nama}"? Kategori yang sudah memiliki transaksi tidak dapat dihapus.`,
      confirmLabel: "Ya, Hapus",
    });
    if (!ok) return;
    setFeedback(undefined);
    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);
      if (result.success) {
        toast.success(`Kategori "${category.nama}" berhasil dihapus.`);
        router.refresh();
      } else {
        const msg = result.error ?? "Kategori gagal dihapus.";
        setFeedback(msg);
        toast.error(msg);
      }
    });
  }

  function renderGroup(title: string, items: Category[]) {
    return (
      <section className="overflow-hidden rounded-3xl border border-border/80 bg-surface shadow-xs">
        <div className="flex items-center justify-between border-b border-border-soft px-4 py-3.5 sm:px-5">
          <h2 className="text-sm font-semibold text-foreground-soft">{title}</h2>
          <span className="text-xs tabular-nums text-muted">{items.length}</span>
        </div>
        {items.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">Belum ada kategori.</p>
        ) : (
          <ul className="divide-y divide-border-soft">
            {items.map((category) => {
              const Icon = icons[category.ikon] ?? CircleEllipsis;
              return (
                <li key={category.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg" style={{ color: category.warna, backgroundColor: `color-mix(in srgb, ${category.warna} 15%, var(--surface))` }}>
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground-soft">{category.nama}</span>
                  <span className="hidden text-xs text-muted sm:block">{iconLabels[category.ikon] ?? "Ikon kategori"}</span>
                  <button type="button" onClick={() => openEdit(category)} aria-label={`Ubah ${category.nama}`} title="Ubah kategori" className="grid size-11 place-items-center rounded-lg text-muted hover:bg-primary-soft hover:text-primary">
                    <Pencil size={16} />
                  </button>
                  <button type="button" onClick={() => remove(category)} disabled={isPending} aria-label={`Hapus ${category.nama}`} title="Hapus kategori" className="grid size-11 place-items-center rounded-lg text-expense hover:bg-expense-soft hover:text-expense-text disabled:opacity-50">
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/80 bg-surface px-5 py-3.5 shadow-xs">
        <p className="text-xs sm:text-sm text-muted">
          Kelompokkan pemasukan dan pengeluaranmu dengan ikon serta warna khusus.
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="flex h-10.5 items-center gap-2 rounded-xl bg-primary px-4 text-xs sm:text-sm font-semibold text-on-primary shadow-sm transition hover:bg-primary-hover active:scale-95"
        >
          <Plus size={16} strokeWidth={2.4} /> Tambah Kategori
        </button>
      </div>
      {feedback && <p role="status" className={`rounded-lg px-4 py-3 text-sm ${feedback === "Kategori dihapus." ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>{feedback}</p>}
      <div className="grid gap-5 xl:grid-cols-2">
        {renderGroup("Pengeluaran", expense)}
        {renderGroup("Pemasukan", income)}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-60 flex items-end justify-center bg-foreground/50 sm:items-center sm:p-5">
          <section role="dialog" aria-modal="true" aria-labelledby="category-modal-title" className="max-h-[92vh] w-full max-w-140 overflow-y-auto rounded-t-3xl border border-border bg-white/95 dark:bg-[#161032]/95 p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary-strong"><Tags size={18} /></span>
                <div>
                  <h2 id="category-modal-title" className="text-lg font-semibold text-foreground">{editing ? "Ubah kategori" : "Tambah kategori"}</h2>
                  <p className="mt-1 text-sm text-muted">Pilih ikon dan warna agar mudah dikenali.</p>
                </div>
              </div>
              <button type="button" aria-label="Tutup" onClick={() => setModalOpen(false)} className="grid size-11 place-items-center rounded-lg text-muted hover:bg-surface-alt"><X size={18} /></button>
            </div>
            <CategoryForm
              category={editing}
              onCancel={() => setModalOpen(false)}
              onSaved={() => {
                setModalOpen(false);
                toast.success(
                  editing ? "Kategori berhasil diperbarui." : "Kategori baru berhasil ditambahkan.",
                );
                router.refresh();
              }}
            />
          </section>
        </div>
      )}
    </div>
  );
}