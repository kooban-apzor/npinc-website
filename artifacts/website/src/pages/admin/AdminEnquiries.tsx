import { useState } from "react";
import { useListContactEnquiries, useDeleteContactEnquiry, getListContactEnquiriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { AdminPage, AdminGrid, AdminLoading, AdminEmpty, ConfirmDialog, mutationError } from "@/components/admin/ui";
import { Trash2, Mail, Phone, User, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminEnquiries() {
  const { data: enquiries, isLoading } = useListContactEnquiries();
  const remove = useDeleteContactEnquiry();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState<number | null>(null);

  const confirmDelete = () => {
    if (deleting == null) return;
    remove.mutate({ id: deleting }, {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getListContactEnquiriesQueryKey() }); setDeleting(null); toast({ title: "Deleted" }); },
      onError: (err: unknown) => { setDeleting(null); toast({ title: mutationError(err), variant: "destructive" }); },
    });
  };

  return (
    <AdminLayout>
      <AdminPage title="Contact Enquiries" count={enquiries?.length} countLabel={enquiries?.length === 1 ? "enquiry" : "enquiries"}>
        {isLoading ? <AdminLoading /> : (enquiries ?? []).length === 0 ? <AdminEmpty message="No enquiries yet." /> : (
          <AdminGrid>
            {(enquiries ?? []).map(e => (
              <div key={e.id} data-testid={`row-enquiry-${e.id}`} className="bg-panel border border-line p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 text-paper font-serif truncate"><User size={14} className="text-brand shrink-0" />{e.name}</div>
                    <div className="flex items-center gap-2 text-fog text-sm truncate"><Mail size={13} className="text-brand shrink-0" /><a href={`mailto:${e.email}`} className="hover:text-brand truncate">{e.email}</a></div>
                    {e.phone && <div className="flex items-center gap-2 text-fog text-sm"><Phone size={13} className="text-brand shrink-0" />{e.phone}</div>}
                    {e.subject && <p className="text-paper text-sm font-medium truncate">{e.subject}</p>}
                    <div className="flex items-start gap-2 text-fog text-sm"><MessageSquare size={13} className="text-brand mt-0.5 shrink-0" /><p className="line-clamp-3">{e.message}</p></div>
                    <p className="text-fog/60 text-xs">{e.createdAt && new Date(e.createdAt).toLocaleDateString("en-ZA")}</p>
                  </div>
                  <button onClick={() => setDeleting(e.id)} data-testid={`button-delete-enquiry-${e.id}`} aria-label="Delete enquiry" title="Delete enquiry" className="text-fog hover:text-red-400 p-2 shrink-0"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </AdminGrid>
        )}
      </AdminPage>

      {deleting != null && (
        <ConfirmDialog title="Delete this enquiry?" onConfirm={confirmDelete} onCancel={() => setDeleting(null)} pending={remove.isPending} />
      )}
    </AdminLayout>
  );
}
