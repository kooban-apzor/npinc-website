import { useState } from "react";
import { useAdminListEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, getAdminListEventsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Pencil, Trash2, X } from "lucide-react";
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

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListEventsQueryKey() });
  const openCreate = () => setModal({ mode: "create", form: { ...empty } });
  const openEdit = (e: NonNullable<typeof events>[0]) => setModal({ mode: "edit", id: e.id, form: { slug: e.slug, title: e.title, description: e.description ?? "", location: e.location ?? "", eventDate: e.eventDate, eventEndDate: e.eventEndDate ?? "", registrationUrl: e.registrationUrl ?? "", isPublished: e.isPublished } });
  const handleSave = () => {
    if (!modal) return;
    const data = { ...modal.form, eventEndDate: modal.form.eventEndDate || undefined, registrationUrl: modal.form.registrationUrl || undefined } as never;
    if (modal.mode === "create") {
      create.mutate({ data }, { onSuccess: () => { invalidate(); setModal(null); toast({ title: "Event created" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
    } else {
      update.mutate({ id: modal.id!, data }, { onSuccess: () => { invalidate(); setModal(null); toast({ title: "Event updated" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
    }
  };
  const handleDelete = (id: number) => {
    if (!confirm("Delete this event?")) return;
    remove.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Deleted" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
  };

  return (
    <AdminLayout>
      <div className="p-8 md:p-12">
        <div className="flex items-center justify-between mb-10">
          <div><h1 className="text-3xl font-serif text-[#F7F4EE]">Events</h1><p className="text-[#B8B8B8] mt-1">Manage upcoming events and conferences.</p></div>
          <button onClick={openCreate} data-testid="button-create-event" className="flex items-center gap-2 bg-[#C6A15B] text-[#0E0E0E] px-5 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors"><Plus size={16} /> Add Event</button>
        </div>
        {isLoading ? <div className="animate-pulse space-y-3">{[1,2].map(i => <div key={i} className="h-16 bg-[#151515] border border-[#2A2A2A]" />)}</div> : (
          <div className="space-y-3">
            {(events ?? []).map(e => (
              <div key={e.id} data-testid={`row-event-${e.id}`} className="flex items-center justify-between bg-[#151515] border border-[#2A2A2A] px-6 py-4">
                <div><h3 className="text-[#F7F4EE] font-serif">{e.title}</h3><p className="text-[#B8B8B8] text-xs mt-1">{e.eventDate}{e.location ? ` · ${e.location}` : ""} · {e.isPublished ? <span className="text-green-400">Published</span> : <span className="text-red-400">Draft</span>}</p></div>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(e)} data-testid={`button-edit-event-${e.id}`} className="text-[#B8B8B8] hover:text-[#C6A15B] p-2"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(e.id)} data-testid={`button-delete-event-${e.id}`} className="text-[#B8B8B8] hover:text-red-400 p-2"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#2A2A2A] p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-serif text-[#F7F4EE]">{modal.mode === "create" ? "Add Event" : "Edit Event"}</h2><button onClick={() => setModal(null)}><X size={20} className="text-[#B8B8B8]" /></button></div>
            <div className="space-y-4">
              {[{ l: "Slug", k: "slug" }, { l: "Title", k: "title" }, { l: "Description", k: "description", ta: true }, { l: "Location", k: "location" }, { l: "Event Date (YYYY-MM-DD)", k: "eventDate" }, { l: "End Date (YYYY-MM-DD)", k: "eventEndDate" }, { l: "Registration URL", k: "registrationUrl" }].map(({ l, k, ta }) => (
                <div key={k}>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">{l}</label>
                  {ta ? <textarea rows={3} value={(modal.form as never)[k]} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, [k]: e.target.value } }))} className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none resize-none" />
                  : <input type="text" value={(modal.form as never)[k]} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, [k]: e.target.value } }))} className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />}
                </div>
              ))}
              <div className="flex items-center gap-3"><input type="checkbox" checked={modal.form.isPublished} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, isPublished: e.target.checked } }))} className="w-4 h-4 accent-[#C6A15B]" /><span className="text-[#B8B8B8] text-sm">Published</span></div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={handleSave} data-testid="button-save-event" className="bg-[#C6A15B] text-[#0E0E0E] px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors">Save</button>
              <button onClick={() => setModal(null)} className="border border-[#2A2A2A] text-[#B8B8B8] px-8 py-3 text-sm hover:border-[#C6A15B] transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
