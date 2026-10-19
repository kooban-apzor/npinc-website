import { useState } from "react";
import { useAdminListServices, useCreateService, useUpdateService, useDeleteService, getAdminListServicesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { AdminPage, AdminRow, AdminGrid, AdminLoading, AdminEmpty, AdminModal, ConfirmDialog, AdminField, AdminCheck, mutationError } from "@/components/admin/ui";
import { useToast } from "@/hooks/use-toast";

type ServiceForm = { slug: string; title: string; summary: string; howWeAssist: string; typicalMatters: string; sortOrder: number; isPublished: boolean };
const empty: ServiceForm = { slug: "", title: "", summary: "", howWeAssist: "", typicalMatters: "", sortOrder: 0, isPublished: true };

export default function AdminServices() {
  const { data: services, isLoading } = useAdminListServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; id?: number; form: ServiceForm } | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListServicesQueryKey() });
  const saving = createService.isPending || updateService.isPending;

  const openCreate = () => setModal({ mode: "create", form: { ...empty } });
  const openEdit = (s: NonNullable<typeof services>[0]) => setModal({
    mode: "edit", id: s.id,
    form: { slug: s.slug, title: s.title, summary: s.summary ?? "", howWeAssist: s.howWeAssist ?? "", typicalMatters: (s.typicalMatters ?? []).join("\n"), sortOrder: s.sortOrder ?? 0, isPublished: s.isPublished ?? false }
  });

  const handleSave = () => {
    if (!modal) return;
    const matters = modal.form.typicalMatters.split("\n").map(s => s.trim()).filter(Boolean);
    const data = { ...modal.form, typicalMatters: matters };
    const done = (msg: string) => { invalidate(); setModal(null); toast({ title: msg }); };
    const fail = (err: unknown) => toast({ title: mutationError(err), variant: "destructive" });
    if (modal.mode === "create") {
      createService.mutate({ data }, { onSuccess: () => done("Service created"), onError: fail });
    } else {
      updateService.mutate({ id: modal.id!, data }, { onSuccess: () => done("Service updated"), onError: fail });
    }
  };

  const confirmDelete = () => {
    if (deleting == null) return;
    deleteService.mutate({ id: deleting }, {
      onSuccess: () => { invalidate(); setDeleting(null); toast({ title: "Service deleted" }); },
      onError: (err: unknown) => { setDeleting(null); toast({ title: mutationError(err), variant: "destructive" }); },
    });
  };

  const set = (patch: Partial<ServiceForm>) => setModal(m => m && ({ ...m, form: { ...m.form, ...patch } }));

  return (
    <AdminLayout>
      <AdminPage title="Practice Areas" count={services?.length} actionLabel="Add Service" onAction={openCreate} actionTestId="button-create-service">
        {isLoading ? <AdminLoading /> : (services ?? []).length === 0 ? <AdminEmpty message="No services yet." /> : (
          <AdminGrid>
            {(services ?? []).map(s => (
              <AdminRow key={s.id} testId={`row-service-${s.id}`} title={s.title}
                meta={`${s.slug} · Sort ${s.sortOrder}`} published={s.isPublished ?? undefined}
                onEdit={() => openEdit(s)} editTestId={`button-edit-service-${s.id}`}
                onDelete={() => setDeleting(s.id)} deleteTestId={`button-delete-service-${s.id}`} />
            ))}
          </AdminGrid>
        )}
      </AdminPage>

      {modal && (
        <AdminModal title={modal.mode === "create" ? "Add Service" : "Edit Service"}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving} saveTestId="button-save-service" wide>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="Slug" value={modal.form.slug} onChange={v => set({ slug: v })} />
            <AdminField label="Title" value={modal.form.title} onChange={v => set({ title: v })} />
          </div>
          <AdminField label="Summary" value={modal.form.summary} onChange={v => set({ summary: v })} textarea />
          <AdminField label="How We Assist" value={modal.form.howWeAssist} onChange={v => set({ howWeAssist: v })} textarea />
          <AdminField label="Typical Matters (one per line)" value={modal.form.typicalMatters} onChange={v => set({ typicalMatters: v })} textarea />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="Sort Order" type="number" value={modal.form.sortOrder} onChange={v => set({ sortOrder: Number(v) })} />
            <div className="flex items-end pb-1"><AdminCheck id="svc-pub" label="Published" checked={modal.form.isPublished} onChange={v => set({ isPublished: v })} /></div>
          </div>
        </AdminModal>
      )}

      {deleting != null && (
        <ConfirmDialog title="Delete this service?" message="It will be removed from the public site immediately."
          onConfirm={confirmDelete} onCancel={() => setDeleting(null)} pending={deleteService.isPending} />
      )}
    </AdminLayout>
  );
}
