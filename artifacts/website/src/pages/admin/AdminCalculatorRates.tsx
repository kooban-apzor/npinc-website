import { useState } from "react";
import { useAdminListCalculatorRates, useCreateCalculatorRate, useUpdateCalculatorRate, useDeleteCalculatorRate, getAdminListCalculatorRatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import AdminDateField from "@/components/admin/AdminDateField";
import { AdminPage, AdminRow, AdminGrid, AdminLoading, AdminEmpty, AdminModal, ConfirmDialog, AdminField, mutationError } from "@/components/admin/ui";
import { useToast } from "@/hooks/use-toast";

type Form = { rateType: string; label: string; value: string; effectiveFrom: string; notes: string };
const empty: Form = { rateType: "", label: "", value: "", effectiveFrom: "", notes: "" };

export default function AdminCalculatorRates() {
  const { data: rates, isLoading } = useAdminListCalculatorRates();
  const create = useCreateCalculatorRate();
  const update = useUpdateCalculatorRate();
  const remove = useDeleteCalculatorRate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; id?: number; form: Form } | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListCalculatorRatesQueryKey() });
  const saving = create.isPending || update.isPending;
  const openCreate = () => setModal({ mode: "create", form: { ...empty } });
  const openEdit = (r: NonNullable<typeof rates>[0]) => setModal({
    mode: "edit", id: r.id,
    form: { rateType: r.rateType, label: r.label, value: String(r.value), effectiveFrom: r.effectiveFrom ? r.effectiveFrom.slice(0, 10) : "", notes: r.notes ?? "" }
  });
  const buildPayload = (form: Form) => {
    const payload: Record<string, unknown> = { ...form };
    if ((payload.effectiveFrom as string).trim() === "") delete payload.effectiveFrom;
    return payload;
  };

  const handleSave = () => {
    if (!modal) return;
    const done = (msg: string) => { invalidate(); setModal(null); toast({ title: msg }); };
    const fail = (err: unknown) => toast({ title: mutationError(err), variant: "destructive" });
    if (modal.mode === "create") {
      create.mutate({ data: buildPayload(modal.form) as never }, { onSuccess: () => done("Rate created"), onError: fail });
    } else {
      update.mutate({ id: modal.id!, data: buildPayload(modal.form) as never }, { onSuccess: () => done("Rate updated"), onError: fail });
    }
  };

  const confirmDelete = () => {
    if (deleting == null) return;
    remove.mutate({ id: deleting }, {
      onSuccess: () => { invalidate(); setDeleting(null); toast({ title: "Deleted" }); },
      onError: (err: unknown) => { setDeleting(null); toast({ title: mutationError(err), variant: "destructive" }); },
    });
  };

  const set = (patch: Partial<Form>) => setModal(m => m && ({ ...m, form: { ...m.form, ...patch } }));

  return (
    <AdminLayout>
      <AdminPage title="Calculator Rates" count={rates?.length} countLabel="rates" actionLabel="Add Rate" onAction={openCreate} actionTestId="button-create-rate">
        {isLoading ? <AdminLoading /> : (rates ?? []).length === 0 ? <AdminEmpty message="No rates yet." /> : (
          <AdminGrid>
            {(rates ?? []).map(r => (
              <AdminRow key={r.id} testId={`row-rate-${r.id}`} title={r.label}
                meta={`${r.rateType} · ${r.value}`}
                onEdit={() => openEdit(r)} editTestId={`button-edit-rate-${r.id}`}
                onDelete={() => setDeleting(r.id)} deleteTestId={`button-delete-rate-${r.id}`} />
            ))}
          </AdminGrid>
        )}
      </AdminPage>

      {modal && (
        <AdminModal title={modal.mode === "create" ? "Add Rate" : "Edit Rate"}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving} saveTestId="button-save-rate">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="Rate Type" value={modal.form.rateType} onChange={v => set({ rateType: v })} />
            <AdminField label="Label" value={modal.form.label} onChange={v => set({ label: v })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="Value" value={modal.form.value} onChange={v => set({ value: v })} />
            <AdminDateField
              label="Effective From"
              value={modal.form.effectiveFrom}
              onChange={v => set({ effectiveFrom: v })}
              onClear={() => set({ effectiveFrom: "" })}
            />
          </div>
          <AdminField label="Notes" value={modal.form.notes} onChange={v => set({ notes: v })} textarea rows={2} />
        </AdminModal>
      )}

      {deleting != null && (
        <ConfirmDialog title="Delete this rate?" message="The conveyancing calculator will stop using it."
          onConfirm={confirmDelete} onCancel={() => setDeleting(null)} pending={remove.isPending} />
      )}
    </AdminLayout>
  );
}
