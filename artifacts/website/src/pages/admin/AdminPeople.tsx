import { useState, useRef } from "react";
import { useAdminListPeople, useCreatePerson, useUpdatePerson, useDeletePerson, getAdminListPeopleQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Pencil, Trash2, X, UserCheck, UserMinus, Upload, ImageOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ROLES = ["Partner", "Director", "Associate", "CandidateAttorney", "Consultant", "Support"];

type Form = {
  slug: string; firstName: string; lastName: string; role: string;
  title: string; qualifications: string; admissions: string; bio: string;
  email: string; phone: string; photoUrl: string; practiceAreas: string;
  sortOrder: number; isPublished: boolean;
  joinedAt: string; leftAt: string;
};

const empty: Form = {
  slug: "", firstName: "", lastName: "", role: "Associate", title: "",
  qualifications: "", admissions: "", bio: "", email: "", phone: "",
  photoUrl: "", practiceAreas: "", sortOrder: 0, isPublished: true,
  joinedAt: "", leftAt: "",
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const MAX_PX = 800;

function toGrayscaleDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, MAX_PX / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.filter = "grayscale(100%)";
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
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
    if (!fileRef.current) fileRef.current = e.target;
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

  const isDataUrl = value.startsWith("data:");
  const hasPhoto = Boolean(value);

  return (
    <div>
      <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Photo</label>

      {hasPhoto ? (
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={value}
              alt="Preview"
              className="w-24 h-24 object-cover grayscale border border-[#2A2A2A]"
            />
            {isDataUrl && (
              <span className="absolute -top-1 -right-1 bg-[#C6A15B] text-[#0E0E0E] text-[9px] px-1 leading-tight uppercase tracking-widest">
                B&W
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={converting}
              className="flex items-center gap-2 border border-[#2A2A2A] hover:border-[#C6A15B]/50 text-[#B8B8B8] hover:text-[#C6A15B] px-3 py-2 text-xs transition-colors disabled:opacity-50"
            >
              <Upload size={12} />
              {converting ? "Converting to B&W…" : "Replace photo"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-2 border border-[#2A2A2A] hover:border-red-400/40 text-[#B8B8B8] hover:text-red-400 px-3 py-2 text-xs transition-colors"
            >
              <ImageOff size={12} />
              Remove photo
            </button>
          </div>
        </div>
      ) : (
        <div
          className="border border-dashed border-[#2A2A2A] hover:border-[#C6A15B]/50 p-6 text-center cursor-pointer transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {converting ? (
            <p className="text-[#B8B8B8] text-sm">Converting to black & white…</p>
          ) : (
            <>
              <Upload size={18} className="text-[#C6A15B] mx-auto mb-2" />
              <p className="text-[#B8B8B8] text-sm">Click to upload a photo</p>
              <p className="text-[#B8B8B8]/50 text-xs mt-1">Automatically converted to black & white on save</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

export default function AdminPeople() {
  const { data: people, isLoading } = useAdminListPeople();
  const create = useCreatePerson();
  const update = useUpdatePerson();
  const remove = useDeletePerson();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; id?: number; form: Form } | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListPeopleQueryKey() });

  const openCreate = () => setModal({ mode: "create", form: { ...empty } });
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
    }
  });

  const setForm = (patch: Partial<Form>) =>
    setModal(m => m ? { ...m, form: { ...m.form, ...patch } } : null);

  const handleSave = () => {
    if (!modal) return;
    const areas = modal.form.practiceAreas.split(",").map(s => s.trim()).filter(Boolean);
    const data = {
      ...modal.form,
      practiceAreas: areas,
      joinedAt: modal.form.joinedAt || null,
      leftAt: modal.form.leftAt || null,
    };
    if (modal.mode === "create") {
      create.mutate({ data: data as never }, {
        onSuccess: () => { invalidate(); setModal(null); toast({ title: "Person created" }); },
        onError: () => toast({ title: "Error", variant: "destructive" })
      });
    } else {
      update.mutate({ id: modal.id!, data: data as never }, {
        onSuccess: () => { invalidate(); setModal(null); toast({ title: "Person updated" }); },
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

  const textFields: { label: string; key: keyof Form; ta?: boolean; num?: boolean }[] = [
    { label: "Slug", key: "slug" }, { label: "First Name", key: "firstName" }, { label: "Last Name", key: "lastName" },
    { label: "Title (Mr/Ms/Dr)", key: "title" }, { label: "Qualifications", key: "qualifications" },
    { label: "Admissions", key: "admissions" }, { label: "Bio", key: "bio", ta: true },
    { label: "Email", key: "email" }, { label: "Phone", key: "phone" },
    { label: "Practice Areas (comma-separated)", key: "practiceAreas" }, { label: "Sort Order", key: "sortOrder", num: true },
  ];

  return (
    <AdminLayout>
      <div className="p-8 md:p-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-serif text-[#F7F4EE]">People</h1>
            <p className="text-[#B8B8B8] mt-1">Manage team members and profiles.</p>
          </div>
          <button onClick={openCreate} data-testid="button-create-person" className="flex items-center gap-2 bg-[#C6A15B] text-[#0E0E0E] px-5 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors">
            <Plus size={16} /> Add Person
          </button>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-[#151515] border border-[#2A2A2A]" />)}</div>
        ) : (
          <div className="space-y-3">
            {(people ?? []).map(p => (
              <div key={p.id} data-testid={`row-person-${p.id}`} className="flex items-center justify-between bg-[#151515] border border-[#2A2A2A] px-6 py-4">
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
                    <p className="text-[#B8B8B8] text-xs">{p.role} · {p.isPublished ? <span className="text-green-400">Published</span> : <span className="text-red-400">Draft</span>}</p>
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
          <div className="bg-[#151515] border border-[#2A2A2A] p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif text-[#F7F4EE]">{modal.mode === "create" ? "Add Person" : "Edit Person"}</h2>
              <button onClick={() => setModal(null)} className="text-[#B8B8B8] hover:text-[#F7F4EE]"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {/* Role */}
              <div>
                <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Role</label>
                <select value={modal.form.role} onChange={e => setForm({ role: e.target.value })}
                  className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Photo upload */}
              <PhotoUpload
                value={modal.form.photoUrl}
                onChange={url => setForm({ photoUrl: url })}
              />

              {/* Text fields (Photo URL removed) */}
              {textFields.map(({ label, key, ta, num }) => (
                <div key={key}>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">{label}</label>
                  {ta ? (
                    <textarea rows={3} value={modal.form[key] as string} onChange={e => setForm({ [key]: e.target.value })}
                      className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none resize-none" />
                  ) : (
                    <input type={num ? "number" : "text"} value={modal.form[key] as string | number}
                      onChange={e => setForm({ [key]: num ? Number(e.target.value) : e.target.value })}
                      className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />
                  )}
                </div>
              ))}

              {/* Published */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="published" checked={modal.form.isPublished} onChange={e => setForm({ isPublished: e.target.checked })} className="w-4 h-4 accent-[#C6A15B]" />
                <label htmlFor="published" className="text-[#B8B8B8] text-sm">Published</label>
              </div>

              {/* Staff status section */}
              <div className="border-t border-[#2A2A2A] pt-5 mt-2">
                <p className="text-[#C6A15B] text-xs uppercase tracking-widest mb-4">Staff Status</p>
                <p className="text-[#B8B8B8] text-xs leading-relaxed mb-5">
                  "Just Joined" shows a gold badge on their profile for 90 days after the join date.<br />
                  "Left the Practice" shows a badge and keeps them visible for 90 days, then hides them automatically.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <button
                    type="button"
                    onClick={() => setForm({ joinedAt: todayISO(), leftAt: "" })}
                    className="flex items-center justify-center gap-2 border border-[#C6A15B]/40 text-[#C6A15B] px-4 py-3 text-xs uppercase tracking-widest hover:bg-[#C6A15B]/10 transition-colors"
                  >
                    <UserCheck size={14} /> Just Joined Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ leftAt: todayISO() })}
                    className="flex items-center justify-center gap-2 border border-[#555]/40 text-[#B8B8B8] px-4 py-3 text-xs uppercase tracking-widest hover:bg-[#555]/10 transition-colors"
                  >
                    <UserMinus size={14} /> Mark as Departed
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={handleSave} data-testid="button-save-person" className="bg-[#C6A15B] text-[#0E0E0E] px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors">Save</button>
              <button onClick={() => setModal(null)} className="border border-[#2A2A2A] text-[#B8B8B8] px-8 py-3 text-sm hover:border-[#C6A15B] transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
