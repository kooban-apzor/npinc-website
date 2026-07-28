import { useListContactEnquiries, useDeleteContactEnquiry, getListContactEnquiriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Trash2, Mail, Phone, User, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminEnquiries() {
  const { data: enquiries, isLoading } = useListContactEnquiries();
  const remove = useDeleteContactEnquiry();
  const qc = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (!confirm("Delete this enquiry?")) return;
    remove.mutate({ id }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListContactEnquiriesQueryKey() }); toast({ title: "Deleted" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
  };

  return (
    <AdminLayout>
      <div className="p-8 md:p-12">
        <div className="mb-10">
          <h1 className="text-3xl font-serif text-[#F7F4EE]">Contact Enquiries</h1>
          <p className="text-[#B8B8B8] mt-1">{enquiries?.length ?? 0} enquiry(ies).</p>
        </div>
        {isLoading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-[#151515] border border-[#2A2A2A]" />)}</div> :
          (enquiries ?? []).length === 0 ? <div className="border border-[#2A2A2A] p-16 text-center text-[#B8B8B8]">No enquiries yet.</div> : (
            <div className="space-y-4">
              {(enquiries ?? []).map(e => (
                <div key={e.id} data-testid={`row-enquiry-${e.id}`} className="bg-[#151515] border border-[#2A2A2A] p-6 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#F7F4EE] font-serif"><User size={14} className="text-[#C6A15B]" />{e.name}</div>
                    <div className="flex items-center gap-2 text-[#B8B8B8] text-sm"><Mail size={13} className="text-[#C6A15B]" /><a href={`mailto:${e.email}`} className="hover:text-[#C6A15B]">{e.email}</a></div>
                    {e.phone && <div className="flex items-center gap-2 text-[#B8B8B8] text-sm"><Phone size={13} className="text-[#C6A15B]" />{e.phone}</div>}
                    {e.subject && <p className="text-[#B8B8B8] text-sm font-medium">Subject: {e.subject}</p>}
                    <div className="flex items-start gap-2 text-[#B8B8B8] text-sm mt-2"><MessageSquare size={13} className="text-[#C6A15B] mt-0.5 shrink-0" /><p className="line-clamp-3">{e.message}</p></div>
                    <p className="text-[#B8B8B8] text-xs mt-2">{e.createdAt && new Date(e.createdAt).toLocaleDateString("en-ZA")}</p>
                  </div>
                  <button onClick={() => handleDelete(e.id)} data-testid={`button-delete-enquiry-${e.id}`} className="text-[#B8B8B8] hover:text-red-400 p-2 shrink-0"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          )}
      </div>
    </AdminLayout>
  );
}
