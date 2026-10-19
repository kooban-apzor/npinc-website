import { useState } from "react";
import { useAdminListEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, getAdminListEventsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import AdminDateField from "@/components/admin/AdminDateField";
import { AdminPage, AdminRow, AdminGrid, AdminLoading, AdminEmpty, AdminModal, ConfirmDialog, AdminField, AdminCheck, mutationError } from "@/components/admin/ui";
import { useToast } from "@/hooks/use-toast";

type Form = { slug: string; title: string; description: string; location: string; eventDate: string; eventEndDate: string; registrationUrl: string; isPublished: boolean };
const empty: Form = { slug: "", title: "", description: "", location: "", eventDate: "", eventEndDate: "", registrationUrl: "", isPublished: true };

export default function AdminEvents() {
  const { data: events, isLoading } = useAdminListEvents();
  const create = useCreateEvent();
  const update = useUpdateEvent();
  const remove = useDeleteEvent();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; id?: number; form: Form } | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListEventsQueryKey() });
  const saving = create.isPending || update.isPending;
  const openCreate = () => setModal({ mode: "create", form: { ...empty } });
  const openEdit = (e: NonNullable<typeof events>[0]) => setModal({
    mode: "edit", id: e.id,
    form: { slug: e.slug, title: e.title, description: e.description ?? "", location: e.location ?? "", eventDate: e.eventDate?.slice(0, 10) ?? e.eventDate, eventEndDate: e.eventEndDate ? e.eventEndDate.slice(0, 10) : "", registrationUrl: e.registrationUrl ?? "", isPublished: e.isPublished ?? false }
  });

  const handleSave = () => {
    if (!modal) return;
    const data = { ...modal.form, eventEndDate: modal.form.eventEndDate || undefined, registrationUrl: modal.form.registrationUrl || undefined } as never;
    const done = (msg: string) => { invalidate(); setModal(null); toast({ title: msg }); };
    const fail = (err: unknown) => toast({ title: mutationError(err), variant: "destructive" });
    if (modal.mode === "create") {
      create.mutate({ data }, { onSuccess: () => done("Event created"), onError: fail });
    } else {
      update.mutate({ id: modal.id!, data }, { onSuccess: () => done("Event updated"), onError: fail });
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
      <AdminPage title="Events" count={events?.length} actionLabel="Add Event" onAction={openCreate} actionTestId="button-create-event">
        {isLoading ? <AdminLoading /> : (events ?? []).length === 0 ? <AdminEmpty message="No events yet." /> : (
          <AdminGrid>
            {(events ?? []).map(e => (
              <AdminRow key={e.id} testId={`row-event-${e.id}`} title={e.title}
                meta={[e.eventDate, e.location].filter(Boolean).join(" · ")} published={e.isPublished ?? undefined}
                onEdit={() => openEdit(e)} editTestId={`button-edit-event-${e.id}`}
                onDelete={() => setDeleting(e.id)} deleteTestId={`button-delete-event-${e.id}`} />
            ))}
          </AdminGrid>
        )}
      </AdminPage>

      {modal && (
        <AdminModal title={modal.mode === "create" ? "Add Event" : "Edit Event"}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving} saveTestId="button-save-event" wide>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="Slug" value={modal.form.slug} onChange={v => set({ slug: v })} />
            <AdminField label="Title" value={modal.form.title} onChange={v => set({ title: v })} />
          </div>
          <AdminField label="Description" value={modal.form.description} onChange={v => set({ description: v })} textarea />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="Location" value={modal.form.location} onChange={v => set({ location: v })} />
            <AdminField label="Registration URL" value={modal.form.registrationUrl} onChange={v => set({ registrationUrl: v })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminDateField label="Event Date" value={modal.form.eventDate} onChange={v => set({ eventDate: v })} />
            <AdminDateField label="End Date" value={modal.form.eventEndDate} onChange={v => set({ eventEndDate: v })} onClear={() => set({ eventEndDate: "" })} />
            <div className="flex items-end pb-1"><AdminCheck id="ev-pub" label="Published" checked={modal.form.isPublished} onChange={v => set({ isPublished: v })} /></div>
          </div>
        </AdminModal>
      )}

      {deleting != null && (
        <ConfirmDialog title="Delete this event?" onConfirm={confirmDelete} onCancel={() => setDeleting(null)} pending={remove.isPending} />
      )}
    </AdminLayout>
  );
}
