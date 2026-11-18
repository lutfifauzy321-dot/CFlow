"use client";

import { useState, useTransition, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ImagePlus, Trash2, Eye } from "lucide-react";
import type { Category, Transaction } from "@/types";
import {
  transactionSchema,
  type TransactionInput,
} from "@/lib/validations/transaction";
import type { TransactionActionResult } from "@/actions/transaction";

type TransactionFormProps = {
  categories: Category[];
  transaction?: Transaction | null;
  onSave: (values: TransactionInput) => Promise<TransactionActionResult>;
  onCancel: () => void;
  onSuccess: () => void;
};

const fieldClassName =
  "mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:bg-surface-alt";

export function TransactionForm({
  categories,
  transaction,
  onSave,
  onCancel,
  onSuccess,
}: TransactionFormProps) {
  const [serverError, setServerError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const [buktiPreview, setBuktiPreview] = useState<string | null>(
    transaction?.bukti_url ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          id: transaction.id,
          keterangan: transaction.keterangan,
          tipe: transaction.tipe,
          category_id: transaction.category_id,
          tanggal: transaction.tanggal,
          nominal: transaction.nominal,
          bukti_url: transaction.bukti_url ?? null,
        }
      : {
          keterangan: "",
          tipe: "keluar",
          category_id: "",
          tanggal: new Date().toISOString().slice(0, 10),
          nominal: undefined,
          bukti_url: null,
        },
  });

  const selectedType = form.watch("tipe");
  const availableCategories = categories.filter(
    (category) => category.tipe === selectedType,
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setServerError("File harus berupa gambar (JPG, PNG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress & resize image to max 900px dimension
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 900;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setBuktiPreview(compressedDataUrl);
          form.setValue("bukti_url", compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveBukti() {
    setBuktiPreview(null);
    form.setValue("bukti_url", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function submit(values: TransactionInput) {
    setServerError(undefined);
    startTransition(async () => {
      const result = await onSave(values);
      if (result.success) {
        onSuccess();
      } else {
        setServerError(result.error ?? "Transaksi gagal disimpan.");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
      <label className="block text-sm font-medium text-foreground-soft">
        Keterangan
        <input
          {...form.register("keterangan")}
          className={fieldClassName}
          placeholder="Contoh: Belanja bulanan / Gaji"
          maxLength={160}
        />
        {form.formState.errors.keterangan && (
          <span className="mt-1 block text-xs text-danger">
            {form.formState.errors.keterangan.message}
          </span>
        )}
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-foreground-soft">
          Jenis Transaksi
          <select
            {...form.register("tipe", {
              onChange: () => form.setValue("category_id", "", { shouldValidate: true }),
            })}
            className={fieldClassName}
          >
            <option value="keluar">Pengeluaran (Keluar)</option>
            <option value="masuk">Pemasukan (Masuk)</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-foreground-soft">
          Kategori
          <select
            {...form.register("category_id")}
            className={fieldClassName}
            disabled={availableCategories.length === 0}
          >
            <option value="">Pilih kategori</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nama}
              </option>
            ))}
          </select>
          {form.formState.errors.category_id && (
            <span className="mt-1 block text-xs text-danger">
              {form.formState.errors.category_id.message}
            </span>
          )}
          {categories.length > 0 && availableCategories.length === 0 && (
            <span className="mt-1 block text-xs text-danger">
              Belum ada kategori untuk jenis ini.
            </span>
          )}
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-foreground-soft">
          Tanggal
          <input
            {...form.register("tanggal")}
            type="date"
            className={fieldClassName}
          />
          {form.formState.errors.tanggal && (
            <span className="mt-1 block text-xs text-danger">
              {form.formState.errors.tanggal.message}
            </span>
          )}
        </label>
        <label className="block text-sm font-medium text-foreground-soft">
          Nominal (Rp)
          <input
            {...form.register("nominal", { valueAsNumber: true })}
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            className={fieldClassName}
            placeholder="0"
          />
          {form.formState.errors.nominal && (
            <span className="mt-1 block text-xs text-danger">
              {form.formState.errors.nominal.message}
            </span>
          )}
        </label>
      </div>

      {/* Bukti Transaksi (Struk / Nota / Transfer) Upload Section */}
      <div className="space-y-1.5 pt-1">
        <span className="block text-sm font-medium text-foreground-soft">
          Bukti Transaksi (Struk / Nota / Bukti Transfer)
        </span>

        {buktiPreview ? (
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-alt p-3">
            <div className="flex items-center gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={buktiPreview}
                  alt="Bukti transaksi"
                  className="size-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  Bukti terlampir
                </p>
                <p className="text-[11px] text-muted">
                  Gambar siap disimpan bersama transaksi ini.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveBukti}
                className="grid size-9 place-items-center rounded-xl bg-danger-soft text-danger hover:bg-danger/20 transition"
                title="Hapus bukti"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-4 px-3 text-center transition hover:border-primary/50 hover:bg-surface-alt"
          >
            <span className="grid size-9 place-items-center rounded-full bg-primary-soft text-primary mb-1.5">
              <ImagePlus size={18} />
            </span>
            <p className="text-xs font-medium text-foreground-soft">
              Klik untuk unggah foto struk / nota
            </p>
            <p className="text-[11px] text-muted">
              Format JPG, PNG, atau WebP
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {serverError && (
        <p
          role="alert"
          className="rounded-xl border border-danger bg-danger-soft px-3.5 py-2.5 text-xs sm:text-sm text-danger"
        >
          {serverError}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-border-soft pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-xl px-4 text-sm font-medium text-muted hover:bg-surface-alt transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending || categories.length === 0}
          className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : transaction ? "Simpan perubahan" : "Simpan transaksi"}
        </button>
      </div>
    </form>
  );
}
