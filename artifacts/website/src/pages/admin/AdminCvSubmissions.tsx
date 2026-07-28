import { useListCvSubmissions, useDeleteCvSubmission, getListCvSubmissionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Trash2, Mail, Phone, User, Paperclip, Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Attachment = { filename: string; mimetype: string; data: string };

function downloadAttachment(attachment: Attachment) {
  const byteChars = atob(attachment.data);
  const byteNums = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
  const blob = new Blob([new Uint8Array(byteNums)], { type: attachment.mimetype });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = attachment.filename;
  a.click();
  URL.revokeObjectURL(url);
}

function printApplication(s: {
  name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  coverLetter?: string | null;
  createdAt?: string;
  attachments?: unknown;
}) {
  const attachments = (s.attachments ?? []) as Attachment[];
  const date = s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" }) : "";

  const attachmentRows = attachments.length
    ? attachments.map(a => `<li style="margin:4px 0;">${a.filename}</li>`).join("")
    : "<li style='color:#666;'>No attachments</li>";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Application – ${s.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; color: #111; background: #fff; padding: 48px; max-width: 720px; margin: 0 auto; }
    .header { border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 28px; }
    .firm { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #666; margin-bottom: 6px; }
    h1 { font-size: 26px; font-weight: normal; margin-bottom: 4px; }
    .meta { font-size: 12px; color: #666; }
    .section { margin-bottom: 24px; }
    .label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #888; margin-bottom: 4px; }
    .value { font-size: 15px; }
    .message-box { background: #f7f7f7; border-left: 3px solid #c6a15b; padding: 16px; font-size: 14px; line-height: 1.7; white-space: pre-wrap; }
    ul { padding-left: 18px; font-size: 14px; }
    .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 12px; font-size: 11px; color: #aaa; }
    @media print { body { padding: 32px; } }
  </style>
</head>
<body>
  <div class="header">
    <p class="firm">Nike Pillay Inc — Application</p>
    <h1>${s.name}</h1>
    <p class="meta">Received: ${date}</p>
  </div>

  <div class="section">
    <p class="label">Email</p>
    <p class="value">${s.email}</p>
  </div>

  ${s.phone ? `<div class="section"><p class="label">Phone</p><p class="value">${s.phone}</p></div>` : ""}
  ${s.position ? `<div class="section"><p class="label">Position Applying For</p><p class="value">${s.position}</p></div>` : ""}

  <div class="section">
    <p class="label">Message</p>
    ${s.coverLetter
      ? `<div class="message-box">${s.coverLetter.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`
      : `<p class="value" style="color:#888;">No message provided.</p>`
    }
  </div>

  <div class="section">
    <p class="label">Attached Documents (${attachments.length})</p>
    <ul>${attachmentRows}</ul>
  </div>

  <div class="footer">Printed from NP Inc Admin &middot; ${new Date().toLocaleString("en-ZA")}</div>

  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=800,height=900");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

export default function AdminCvSubmissions() {
  const { data: submissions, isLoading } = useListCvSubmissions();
  const remove = useDeleteCvSubmission();
  const qc = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (!confirm("Delete this CV submission?")) return;
    remove.mutate({ id }, {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getListCvSubmissionsQueryKey() }); toast({ title: "Deleted" }); },
      onError: () => toast({ title: "Error", variant: "destructive" })
    });
  };

  return (
    <AdminLayout>
      <div className="p-8 md:p-12">
        <div className="mb-10">
          <h1 className="text-3xl font-serif text-[#F7F4EE]">CV Submissions</h1>
          <p className="text-[#B8B8B8] mt-1">{submissions?.length ?? 0} submission(s) received.</p>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-[#151515] border border-[#2A2A2A]" />)}</div>
        ) : (submissions ?? []).length === 0 ? (
          <div className="border border-[#2A2A2A] p-16 text-center text-[#B8B8B8]">No submissions yet.</div>
        ) : (
          <div className="space-y-4">
            {(submissions ?? []).map(s => {
              const attachments = (s.attachments ?? []) as Attachment[];
              return (
                <div key={s.id} data-testid={`row-cv-${s.id}`} className="bg-[#151515] border border-[#2A2A2A] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[#F7F4EE] font-serif">
                        <User size={14} className="text-[#C6A15B] shrink-0" />{s.name}
                      </div>
                      <div className="flex items-center gap-2 text-[#B8B8B8] text-sm">
                        <Mail size={13} className="text-[#C6A15B] shrink-0" />
                        <a href={`mailto:${s.email}`} className="hover:text-[#C6A15B] transition-colors">{s.email}</a>
                      </div>
                      {s.phone && (
                        <div className="flex items-center gap-2 text-[#B8B8B8] text-sm">
                          <Phone size={13} className="text-[#C6A15B] shrink-0" />{s.phone}
                        </div>
                      )}
                      {s.position && (
                        <p className="text-[#B8B8B8] text-sm">
                          Position: <span className="text-[#F7F4EE]">{s.position}</span>
                        </p>
                      )}
                      {s.coverLetter && (
                        <p className="text-[#B8B8B8] text-sm mt-2 line-clamp-3 whitespace-pre-line">{s.coverLetter}</p>
                      )}

                      {/* Attachments */}
                      {attachments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
                          <p className="text-[#B8B8B8] text-xs uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Paperclip size={11} className="text-[#C6A15B]" />
                            {attachments.length} attachment{attachments.length !== 1 ? "s" : ""}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {attachments.map((att, i) => (
                              <button
                                key={i}
                                onClick={() => downloadAttachment(att)}
                                className="flex items-center gap-2 bg-[#0E0E0E] border border-[#2A2A2A] hover:border-[#C6A15B]/50 px-3 py-2 text-xs text-[#B8B8B8] hover:text-[#C6A15B] transition-colors"
                                title={`Download ${att.filename}`}
                              >
                                <Download size={11} />
                                {att.filename}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-[#B8B8B8] text-xs mt-2">
                        {s.createdAt && new Date(s.createdAt).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <button
                        onClick={() => printApplication(s)}
                        title="Print / save full application"
                        className="text-[#B8B8B8] hover:text-[#C6A15B] p-2 transition-colors"
                      >
                        <Printer size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        data-testid={`button-delete-cv-${s.id}`}
                        title="Delete submission"
                        className="text-[#B8B8B8] hover:text-red-400 p-2 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
