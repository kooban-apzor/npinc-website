import { useState } from "react";
import { useAdminListCalculatorRates, useCreateCalculatorRate, useUpdateCalculatorRate, useDeleteCalculatorRate, getAdminListCalculatorRatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { adminModalPanelClass } from "@/components/admin-panel-classes";
import AdminLayout from "@/components/AdminLayout";
import AdminDateField from "@/components/admin/AdminDateField";
import { Plus, Pencil, Trash2, X } from "lucide-react";
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

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListCalculatorRatesQueryKey() });
  const openCreate = () => setModal({ mode: "create", form: { ...empty } });
  const openEdit = (r: NonNullable<typeof rates>[0]) => setModal({ mode: "edit", id: r.id, form: { rateType: r.rateType, label: r.label, value: String(r.value), effectiveFrom: r.effectiveFrom ? r.effectiveFrom.slice(0, 10) : "", notes: r.notes ?? "" } });
  const buildPayload = (form: Form) => {
    const payload: Record<string, unknown> = { ...form };
    if ((payload.effectiveFrom as string).trim() === "") delete payload.effectiveFrom;
    return payload;
  };

  const handleSave = () => {
    if (!modal) return;
    if (modal.mode === "create") {
      create.mutate({ data: buildPayload(modal.form) as never }, { onSuccess: () => { invalidate(); setModal(null); toast({ title: "Rate created" }); }, onError: (err: unknown) => { const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Operation failed"; toast({ title: msg, variant: "destructive" }); } });
    } else {
      update.mutate({ id: modal.id!, data: buildPayload(modal.form) as never }, { onSuccess: () => { invalidate(); setModal(null); toast({ title: "Rate updated" }); }, onError: (err: unknown) => { const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Operation failed"; toast({ title: msg, variant: "destructive" }); } });
    }
  };
  const handleDelete = (id: number) => {
    if (!confirm("Delete this rate?")) return;
    remove.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Deleted" }); }, onError: (err: unknown) => { const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Operation failed"; toast({ title: msg, variant: "destructive" }); } });
  };

  return (
    <AdminLayout>
      <div className="p-8 md:p-12">
        <div className="flex items-center justify-between mb-10">
          <div><h1 className="text-3xl font-serif text-paper">Calculator Rates</h1><p className="text-fog mt-1">Manage conveyancing calculator rates and thresholds.</p></div>
          <button onClick={openCreate} data-testid="button-create-rate" className="flex items-center gap-2 bg-brand text-ink px-5 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-brand-deep transition-colors"><Plus size={16} /> Add Rate</button>
        </div>
        {isLoading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-panel border border-line" />)}</div> : (
          <div className="space-y-3">
            {(rates ?? []).map(r => (
              <div key={r.id} data-testid={`row-rate-${r.id}`} className="flex items-center justify-between bg-panel border border-line px-6 py-4">
                <div><h3 className="text-paper font-serif">{r.label}</h3><p className="text-fog text-xs mt-1">{r.rateType} · Value: {r.value}{r.notes ? ` · ${r.notes}` : ""}</p></div>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(r)} data-testid={`button-edit-rate-${r.id}`} className="text-fog hover:text-brand p-2"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(r.id)} data-testid={`button-delete-rate-${r.id}`} className="text-fog hover:text-red-400 p-2"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={adminModalPanelClass}>
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-serif text-paper">{modal.mode === "create" ? "Add Rate" : "Edit Rate"}</h2><button onClick={() => setModal(null)}><X size={20} className="text-fog" /></button></div>
            <div className="space-y-4">
              {[{ l: "Rate Type", k: "rateType" }, { l: "Label", k: "label" }, { l: "Value", k: "value" }, { l: "Notes", k: "notes" }].map(({ l, k }) => (
                <div key={k}>
                  <label className="block text-fog text-xs uppercase tracking-widest mb-2">{l}</label>
                  <input type="text" value={(modal.form as never)[k]} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, [k]: e.target.value } }))} className="w-full bg-ink border border-line text-paper px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                </div>
              ))}
              <AdminDateField
                label="Effective From"
                value={modal.form.effectiveFrom}
                onChange={v => setModal(m => m && ({ ...m, form: { ...m.form, effectiveFrom: v } }))}
                onClear={() => setModal(m => m && ({ ...m, form: { ...m.form, effectiveFrom: "" } }))}
              />
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={handleSave} data-testid="button-save-rate" className="bg-brand text-ink px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-brand-deep transition-colors">Save</button>
              <button onClick={() => setModal(null)} className="border border-line text-fog px-8 py-3 text-sm hover:border-brand transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
