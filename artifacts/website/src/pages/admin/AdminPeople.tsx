import { useState, useRef } from "react";
import {
  useAdminListPeople, useCreatePerson, useUpdatePerson, useDeletePerson, getAdminListPeopleQueryKey,
  useCreateArticle,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Pencil, Trash2, X, UserCheck, UserMinus, Upload, ImageOff, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PRESET_ROLES = ["Partner", "Director", "Associate", "CandidateAttorney", "Consultant", "Support"];
const CUSTOM_ROLE_VALUE = "__custom__";

type Form = {
  slug: string; firstName: string; lastName: string; role: string;
  title: string; qualifications: string; admissions: string; bio: string;
  email: string; phone: string; photoUrl: string; practiceAreas: string;
  sortOrder: number; isPublished: boolean;
  joinedAt: string; leftAt: string;
};

type DraftArticle = { enabled: boolean; type: "joined" | "departed" | null };

const emptyForm = (nextOrder: number): Form => ({
  slug: "", firstName: "", lastName: "", role: "Associate", title: "",
  qualifications: "", admissions: "", bio: "", email: "", phone: "",
  photoUrl: "", practiceAreas: "", sortOrder: nextOrder, isPublished: true,
  joinedAt: "", leftAt: "",
});

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── Grayscale photo upload ───────────────────────────────────────────────────
// Output is always 300×300 square (center-top crop) to match the existing
// person photo standard used throughout the public site.

const TARGET_SIZE = 300;

function toGrayscaleDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Scale so the shorter dimension fills TARGET_SIZE (cover mode)
      const scale = TARGET_SIZE / Math.min(img.naturalWidth, img.naturalHeight);
      const scaledW = Math.round(img.naturalWidth * scale);
      const scaledH = Math.round(img.naturalHeight * scale);

      // Center-horizontal, top-biased crop (keeps face in frame)
      const sx = Math.round((scaledW - TARGET_SIZE) / 2);
      const sy = Math.round((scaledH - TARGET_SIZE) * 0.15); // 15% from top

      const canvas = document.createElement("canvas");
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;
      const ctx = canvas.getContext("2d")!;
      ctx.filter = "grayscale(100%)";
      ctx.drawImage(img, -sx, -sy, scaledW, scaledH);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Image load failed")); };
    img.src = objectUrl;
  });
}

function PhotoUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [converting, setConverting] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file.", variant: "destructive" });
      return;
    }
    setConverting(true);
    try {
      const dataUrl = await toGrayscaleDataUrl(file);
      onChange(dataUrl);
    } catch {
      toast({ title: "Could not process image. Please try another file.", variant: "destructive" });
    } finally {
      setConverting(false);
    }
  };

  return (
    <div>
      <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Photo</label>
      {value ? (
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img src={value} alt="Preview" className="w-24 h-24 object-cover grayscale border border-[#2A2A2A]" />
            {value.startsWith("data:") && (
              <span className="absolute -top-1 -right-1 bg-[#C6A15B] text-[#0E0E0E] text-[9px] px-1 leading-tight uppercase tracking-widest">B&W</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={converting}
              className="flex items-center gap-2 border border-[#2A2A2A] hover:border-[#C6A15B]/50 text-[#B8B8B8] hover:text-[#C6A15B] px-3 py-2 text-xs transition-colors disabled:opacity-50">
              <Upload size={12} />{converting ? "Converting…" : "Replace photo"}
            </button>
            <button type="button" onClick={() => onChange("")}
              className="flex items-center gap-2 border border-[#2A2A2A] hover:border-red-400/40 text-[#B8B8B8] hover:text-red-400 px-3 py-2 text-xs transition-colors">
              <ImageOff size={12} />Remove photo
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-[#2A2A2A] hover:border-[#C6A15B]/50 p-5 text-center cursor-pointer transition-colors"
          onClick={() => fileRef.current?.click()}>
          {converting ? <p className="text-[#B8B8B8] text-sm">Converting to black & white…</p> : (
            <>
              <Upload size={18} className="text-[#C6A15B] mx-auto mb-2" />
              <p className="text-[#B8B8B8] text-sm">Click to upload a photo</p>
              <p className="text-[#B8B8B8]/50 text-xs mt-1">Automatically converted to black & white</p>
            </>
          )}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function AdminPeople() {
  const { data: people, isLoading } = useAdminListPeople();
  const create = useCreatePerson();
  const update = useUpdatePerson();
  const remove = useDeletePerson();
  const createArticle = useCreateArticle();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [modal, setModal] = useState<{ mode: "create" | "edit"; id?: number; form: Form; draft: DraftArticle } | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListPeopleQueryKey() });

  const nextSortOrder = () => {
    const orders = (people ?? []).map(p => p.sortOrder);
    return orders.length ? Math.max(...orders) + 1 : 1;
  };

  const openCreate = () => setModal({ mode: "create", form: emptyForm(nextSortOrder()), draft: { enabled: false, type: null } });
  const openEdit = (p: NonNullable<typeof people>[0]) => setModal({
    mode: "edit", id: p.id,
    form: {
      slug: p.slug, firstName: p.firstName, lastName: p.lastName, role: p.role,
      title: p.title ?? "", qualifications: p.qualifications ?? "",
      admissions: p.admissions ?? "", bio: p.bio ?? "",
      email: p.email ?? "", phone: p.phone ?? "", photoUrl: p.photoUrl ?? "",
      practiceAreas: (p.practiceAreas ?? []).join(", "),
      sortOrder: p.sortOrder, isPublished: p.isPublished,
      joinedAt: p.joinedAt ? p.joinedAt.slice(0, 10) : "",
      leftAt: p.leftAt ? p.leftAt.slice(0, 10) : "",
    },
    draft: { enabled: false, type: null },
  });

  const setForm = (patch: Partial<Form>) =>
    setModal(m => m ? { ...m, form: { ...m.form, ...patch } } : null);

  const setDraft = (patch: Partial<DraftArticle>) =>
    setModal(m => m ? { ...m, draft: { ...m.draft, ...patch } } : null);

  const markJoined = () => {
    setForm({ joinedAt: todayISO(), leftAt: "" });
    setDraft({ enabled: true, type: "joined" });
  };
  const markDeparted = () => {
    setForm({ leftAt: todayISO() });
    setDraft({ enabled: true, type: "departed" });
  };

  const createDraftArticle = (form: Form, type: "joined" | "departed") => {
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    const today = todayISO();
    const isJoin = type === "joined";
    const title = isJoin
      ? `NP Inc Welcomes ${fullName}`
      : `${fullName} Departs NP Inc`;
    const summary = isJoin
      ? `Nike Pillay Inc is pleased to welcome ${fullName} to the team${form.role ? ` as ${form.role}` : ""}.`
      : `Nike Pillay Inc bids farewell to ${fullName}${form.role ? `, ${form.role}` : ""}, and wishes them well in their future endeavours.`;
    const content = isJoin
      ? `Nike Pillay Inc is delighted to announce the appointment of ${fullName}${form.role ? ` as ${form.role}` : ""}.\n\n[Add details about their background, expertise, and what they bring to the firm.]\n\n${form.qualifications ? `Qualifications: ${form.qualifications}\n\n` : ""}We look forward to the contribution ${form.firstName} will make to our team and clients.`
      : `Nike Pillay Inc announces that ${fullName}${form.role ? `, ${form.role}` : ""}, has departed the firm.\n\n[Add a note about their time at the firm and any farewell message.]\n\nWe thank ${form.firstName} for their valued contribution and wish them every success in the future.`;

    createArticle.mutate({
      data: {
        slug: slugify(`${fullName}-${isJoin ? "joins" : "departs"}-np-inc-${today}`),
        title,
        category: "StaffMovement",
        summary,
        content,
        author: "NP Inc",
        publishedAt: today,
        isPublished: false,
      } as never,
    }, {
      onSuccess: () => toast({ title: "Draft article created", description: `"${title}" saved as a draft in Insights.` }),
      onError: () => toast({ title: "Could not create article draft", variant: "destructive" }),
    });
  };

  const handleSave = () => {
    if (!modal) return;
    const areas = modal.form.practiceAreas.split(",").map(s => s.trim()).filter(Boolean);
    const data = {
      ...modal.form,
      practiceAreas: areas,
      joinedAt: modal.form.joinedAt || null,
      leftAt: modal.form.leftAt || null,
    };
    const afterSave = () => {
      invalidate();
      setModal(null);
      if (modal.draft.enabled && modal.draft.type) {
        createDraftArticle(modal.form, modal.draft.type);
      }
    };
    if (modal.mode === "create") {
      create.mutate({ data: data as never }, {
        onSuccess: () => { afterSave(); toast({ title: "Person created" }); },
        onError: () => toast({ title: "Error", variant: "destructive" })
      });
    } else {
      update.mutate({ id: modal.id!, data: data as never }, {
        onSuccess: () => { afterSave(); toast({ title: "Person updated" }); },
        onError: () => toast({ title: "Error", variant: "destructive" })
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this person?")) return;
    remove.mutate({ id }, {
      onSuccess: () => { invalidate(); toast({ title: "Person deleted" }); },
      onError: () => toast({ title: "Error", variant: "destructive" })
    });
  };

  const statusBadge = (p: NonNullable<typeof people>[0]) => {
    if ((p as never as Record<string, unknown>).memberStatus === "just_joined") {
      return <span className="text-[0.6rem] bg-[#C6A15B]/15 text-[#C6A15B] border border-[#C6A15B]/30 px-2 py-0.5 uppercase tracking-widest">Just Joined</span>;
    }
    if ((p as never as Record<string, unknown>).memberStatus === "left") {
      return <span className="text-[0.6rem] bg-[#555]/20 text-[#B8B8B8] border border-[#555]/40 px-2 py-0.5 uppercase tracking-widest">Left Practice</span>;
    }
    return null;
  };

  return (
    <AdminLayout>
      <div className="p-8 md:p-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-serif text-[#F7F4EE]">People</h1>
            <p className="text-[#B8B8B8] mt-1">Manage team members and profiles.</p>
          </div>
          <button onClick={openCreate} data-testid="button-create-person"
            className="flex items-center gap-2 bg-[#C6A15B] text-[#0E0E0E] px-5 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors">
            <Plus size={16} /> Add Person
          </button>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-[#151515] border border-[#2A2A2A]" />)}</div>
        ) : (
          <div className="space-y-3">
            {(people ?? []).map(p => (
              <div key={p.id} data-testid={`row-person-${p.id}`}
                className="flex items-center justify-between bg-[#151515] border border-[#2A2A2A] px-6 py-4">
                <div className="flex items-center gap-4">
                  {p.photoUrl ? (
                    <img src={p.photoUrl} alt="" className="w-10 h-10 object-cover grayscale shrink-0 border border-[#2A2A2A]" />
                  ) : (
                    <div className="w-10 h-10 bg-[#2A2A2A] shrink-0 flex items-center justify-center text-[#555]">
                      <ImageOff size={14} />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-[#F7F4EE] font-serif">{p.firstName} {p.lastName}</h3>
                      {statusBadge(p)}
                    </div>
                    <p className="text-[#B8B8B8] text-xs">{p.role} · #{p.sortOrder} · {p.isPublished ? <span className="text-green-400">Published</span> : <span className="text-red-400">Draft</span>}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(p)} data-testid={`button-edit-person-${p.id}`} className="text-[#B8B8B8] hover:text-[#C6A15B] p-2"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(p.id)} data-testid={`button-delete-person-${p.id}`} className="text-[#B8B8B8] hover:text-red-400 p-2"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#2A2A2A] p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif text-[#F7F4EE]">{modal.mode === "create" ? "Add Person" : "Edit Person"}</h2>
              <button onClick={() => setModal(null)} className="text-[#B8B8B8] hover:text-[#F7F4EE]"><X size={20} /></button>
            </div>

            <div className="space-y-5">
              {/* Photo */}
              <PhotoUpload value={modal.form.photoUrl} onChange={url => setForm({ photoUrl: url })} />

              {/* Row: Role + Sort Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Role</label>
                  <select
                    value={PRESET_ROLES.includes(modal.form.role) ? modal.form.role : CUSTOM_ROLE_VALUE}
                    onChange={e => {
                      if (e.target.value === CUSTOM_ROLE_VALUE) {
                        setForm({ role: "" });
                      } else {
                        setForm({ role: e.target.value });
                      }
                    }}
                    className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none"
                  >
                    {PRESET_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    <option value={CUSTOM_ROLE_VALUE}>Custom…</option>
                  </select>
                  {(!PRESET_ROLES.includes(modal.form.role)) && (
                    <input
                      type="text"
                      value={modal.form.role}
                      onChange={e => setForm({ role: e.target.value })}
                      placeholder="Enter custom role title"
                      autoFocus
                      className="mt-2 w-full bg-[#0E0E0E] border border-[#C6A15B]/40 text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none placeholder:text-[#555]"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Display Order</label>
                  <input type="number" value={modal.form.sortOrder}
                    onChange={e => setForm({ sortOrder: Number(e.target.value) })}
                    className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />
                  <p className="text-[#555] text-xs mt-1">Lower number = appears earlier in the list</p>
                </div>
              </div>

              {/* Row: First Name + Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">First Name</label>
                  <input type="text" value={modal.form.firstName} onChange={e => setForm({ firstName: e.target.value })}
                    className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Last Name</label>
                  <input type="text" value={modal.form.lastName} onChange={e => setForm({ lastName: e.target.value })}
                    className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />
                </div>
              </div>

              {/* Row: Title + Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Title (Mr/Ms/Dr)</label>
                  <input type="text" value={modal.form.title} onChange={e => setForm({ title: e.target.value })}
                    className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Slug</label>
                  <input type="text" value={modal.form.slug} onChange={e => setForm({ slug: e.target.value })}
                    className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />
                </div>
              </div>

              {/* Row: Email + Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Email</label>
                  <input type="text" value={modal.form.email} onChange={e => setForm({ email: e.target.value })}
                    className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Phone</label>
                  <input type="text" value={modal.form.phone} onChange={e => setForm({ phone: e.target.value })}
                    className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />
                </div>
              </div>

              {/* Row: Qualifications + Admissions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Qualifications</label>
                  <input type="text" value={modal.form.qualifications} onChange={e => setForm({ qualifications: e.target.value })}
                    className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Admissions</label>
                  <input type="text" value={modal.form.admissions} onChange={e => setForm({ admissions: e.target.value })}
                    className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Bio</label>
                <textarea rows={4} value={modal.form.bio} onChange={e => setForm({ bio: e.target.value })}
                  className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none resize-none" />
              </div>

              {/* Practice Areas */}
              <div>
                <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Practice Areas <span className="normal-case text-[#555]">(comma-separated)</span></label>
                <input type="text" value={modal.form.practiceAreas} onChange={e => setForm({ practiceAreas: e.target.value })}
                  className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none"
                  placeholder="e.g. Litigation, Labour, Corporate & Commercial" />
              </div>

              {/* Published */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="published" checked={modal.form.isPublished}
                  onChange={e => setForm({ isPublished: e.target.checked })} className="w-4 h-4 accent-[#C6A15B]" />
                <label htmlFor="published" className="text-[#B8B8B8] text-sm">Published (visible on public site)</label>
              </div>

              {/* ─── Staff Status ─── */}
              <div className="border-t border-[#2A2A2A] pt-6">
                <p className="text-[#C6A15B] text-xs uppercase tracking-widest mb-3">Staff Status</p>
                <p className="text-[#B8B8B8] text-xs leading-relaxed mb-5">
                  "Just Joined" shows a gold badge for 90 days. "Left the Practice" keeps them visible for 90 days then hides them automatically.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <button type="button" onClick={markJoined}
                    className="flex items-center justify-center gap-2 border border-[#C6A15B]/40 text-[#C6A15B] px-4 py-3 text-xs uppercase tracking-widest hover:bg-[#C6A15B]/10 transition-colors">
                    <UserCheck size={14} /> Just Joined Today
                  </button>
                  <button type="button" onClick={markDeparted}
                    className="flex items-center justify-center gap-2 border border-[#555]/40 text-[#B8B8B8] px-4 py-3 text-xs uppercase tracking-widest hover:bg-[#555]/10 transition-colors">
                    <UserMinus size={14} /> Mark as Departed
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Join Date</label>
                    <input type="date" value={modal.form.joinedAt} onChange={e => setForm({ joinedAt: e.target.value })}
                      className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />
                    {modal.form.joinedAt && (
                      <button type="button" onClick={() => setForm({ joinedAt: "" })} className="text-[#555] text-xs mt-1 hover:text-[#B8B8B8]">Clear</button>
                    )}
                  </div>
                  <div>
                    <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Departure Date</label>
                    <input type="date" value={modal.form.leftAt} onChange={e => setForm({ leftAt: e.target.value })}
                      className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />
                    {modal.form.leftAt && (
                      <button type="button" onClick={() => setForm({ leftAt: "" })} className="text-[#555] text-xs mt-1 hover:text-[#B8B8B8]">Clear</button>
                    )}
                  </div>
                </div>

                {/* Draft article checkbox — appears only when a status button was clicked */}
                {modal.draft.type && (
                  <div className="bg-[#0E0E0E] border border-[#C6A15B]/20 px-4 py-4 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="draft-article"
                      checked={modal.draft.enabled}
                      onChange={e => setDraft({ enabled: e.target.checked })}
                      className="w-4 h-4 accent-[#C6A15B] mt-0.5 shrink-0"
                    />
                    <label htmlFor="draft-article" className="cursor-pointer">
                      <span className="flex items-center gap-2 text-[#C6A15B] text-xs uppercase tracking-widest mb-1">
                        <FileText size={12} />
                        Create a Staff Movements article draft
                      </span>
                      <p className="text-[#B8B8B8] text-xs leading-relaxed">
                        {modal.draft.type === "joined"
                          ? `A pre-filled "Welcome ${modal.form.firstName || "…"}" draft will be saved to Insights — ready for you to review and publish.`
                          : `A pre-filled departure note for ${modal.form.firstName || "…"} will be saved as a draft in Insights.`}
                      </p>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={handleSave} data-testid="button-save-person"
                className="bg-[#C6A15B] text-[#0E0E0E] px-10 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors">
                Save
              </button>
              <button onClick={() => setModal(null)}
                className="border border-[#2A2A2A] text-[#B8B8B8] px-8 py-3 text-sm hover:border-[#C6A15B] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
