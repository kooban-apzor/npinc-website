import { useListCvSubmissions, useDeleteCvSubmission, getListCvSubmissionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Trash2, Mail, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCvSubmissions() {
  const { data: submissions, isLoading } = useListCvSubmissions();
  const remove = useDeleteCvSubmission();
  const qc = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (!confirm("Delete this CV submission?")) return;
    remove.mutate({ id }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListCvSubmissionsQueryKey() }); toast({ title: "Deleted" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
  };

  return (
    <AdminLayout>
      <div className="p-8 md:p-12">
        <div className="mb-10">
          <h1 className="text-3xl font-serif text-[#F7F4EE]">CV Submissions</h1>
          <p className="text-[#B8B8B8] mt-1">{submissions?.length ?? 0} submission(s) received.</p>
        </div>
        {isLoading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-[#151515] border border-[#2A2A2A]" />)}</div> :
          (submissions ?? []).length === 0 ? <div className="border border-[#2A2A2A] p-16 text-center text-[#B8B8B8]">No submissions yet.</div> : (
            <div className="space-y-4">
              {(submissions ?? []).map(s => (
                <div key={s.id} data-testid={`row-cv-${s.id}`} className="bg-[#151515] border border-[#2A2A2A] p-6 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#F7F4EE] font-serif"><User size={14} className="text-[#C6A15B]" />{s.name}</div>
                    <div className="flex items-center gap-2 text-[#B8B8B8] text-sm"><Mail size={13} className="text-[#C6A15B]" /><a href={`mailto:${s.email}`} className="hover:text-[#C6A15B]">{s.email}</a></div>
                    {s.phone && <div className="flex items-center gap-2 text-[#B8B8B8] text-sm"><Phone size={13} className="text-[#C6A15B]" />{s.phone}</div>}
                    {s.position && <p className="text-[#B8B8B8] text-sm">Position: <span className="text-[#F7F4EE]">{s.position}</span></p>}
                    {s.coverLetter && <p className="text-[#B8B8B8] text-sm mt-2 line-clamp-2">{s.coverLetter}</p>}
                    <p className="text-[#B8B8B8] text-xs mt-2">{new Date(s.createdAt).toLocaleDateString("en-ZA")}</p>
                  </div>
                  <button onClick={() => handleDelete(s.id)} data-testid={`button-delete-cv-${s.id}`} className="text-[#B8B8B8] hover:text-red-400 p-2 shrink-0"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          )}
      </div>
    </AdminLayout>
  );
}
