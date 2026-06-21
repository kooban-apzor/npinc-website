import { useState } from "react";
import { useAdminListCalculatorRates, useCreateCalculatorRate, useUpdateCalculatorRate, useDeleteCalculatorRate, getAdminListCalculatorRatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
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
  const openEdit = (r: NonNullable<typeof rates>[0]) => setModal({ mode: "edit", id: r.id, form: { rateType: r.rateType, label: r.label, value: String(r.value), effectiveFrom: r.effectiveFrom ?? "", notes: r.notes ?? "" } });
  const buildPayload = (form: Form) => ({
    ...form,
    effectiveFrom: form.effectiveFrom.trim() === "" ? null : form.effectiveFrom,
  });

  const handleSave = () => {
    if (!modal) return;
    if (modal.mode === "create") {
      create.mutate({ data: buildPayload(modal.form) as never }, { onSuccess: () => { invalidate(); setModal(null); toast({ title: "Rate created" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
    } else {
      update.mutate({ id: modal.id!, data: buildPayload(modal.form) as never }, { onSuccess: () => { invalidate(); setModal(null); toast({ title: "Rate updated" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
    }
  };
  const handleDelete = (id: number) => {
    if (!confirm("Delete this rate?")) return;
    remove.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Deleted" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
  };

  return (
    <AdminLayout>
      <div className="p-8 md:p-12">
        <div className="flex items-center justify-between mb-10">
          <div><h1 className="text-3xl font-serif text-[#F7F4EE]">Calculator Rates</h1><p className="text-[#B8B8B8] mt-1">Manage conveyancing calculator rates and thresholds.</p></div>
          <button onClick={openCreate} data-testid="button-create-rate" className="flex items-center gap-2 bg-[#C6A15B] text-[#0E0E0E] px-5 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors"><Plus size={16} /> Add Rate</button>
        </div>
        {isLoading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-[#151515] border border-[#2A2A2A]" />)}</div> : (
          <div className="space-y-3">
            {(rates ?? []).map(r => (
              <div key={r.id} data-testid={`row-rate-${r.id}`} className="flex items-center justify-between bg-[#151515] border border-[#2A2A2A] px-6 py-4">
                <div><h3 className="text-[#F7F4EE] font-serif">{r.label}</h3><p className="text-[#B8B8B8] text-xs mt-1">{r.rateType} · Value: {r.value}{r.notes ? ` · ${r.notes}` : ""}</p></div>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(r)} data-testid={`button-edit-rate-${r.id}`} className="text-[#B8B8B8] hover:text-[#C6A15B] p-2"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(r.id)} data-testid={`button-delete-rate-${r.id}`} className="text-[#B8B8B8] hover:text-red-400 p-2"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#2A2A2A] p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-serif text-[#F7F4EE]">{modal.mode === "create" ? "Add Rate" : "Edit Rate"}</h2><button onClick={() => setModal(null)}><X size={20} className="text-[#B8B8B8]" /></button></div>
            <div className="space-y-4">
              {[{ l: "Rate Type", k: "rateType" }, { l: "Label", k: "label" }, { l: "Value", k: "value" }, { l: "Effective From (YYYY-MM-DD)", k: "effectiveFrom" }, { l: "Notes", k: "notes" }].map(({ l, k }) => (
                <div key={k}>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">{l}</label>
                  <input type="text" value={(modal.form as never)[k]} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, [k]: e.target.value } }))} className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={handleSave} data-testid="button-save-rate" className="bg-[#C6A15B] text-[#0E0E0E] px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors">Save</button>
              <button onClick={() => setModal(null)} className="border border-[#2A2A2A] text-[#B8B8B8] px-8 py-3 text-sm hover:border-[#C6A15B] transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
