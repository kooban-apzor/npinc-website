import { useListDocuments } from "@workspace/api-client-react";
import { Download, FolderOpen } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function DocumentsPage() {
  const { data: documents, isLoading } = useListDocuments();

  return (
    <PublicLayout>
      <section className="py-12 px-6 max-w-4xl mx-auto">
        <div className="mb-16">
          <p className="text-[#C6A15B] text-xs uppercase tracking-[0.25em] mb-4">Resources</p>
          <h1 className="text-5xl md:text-6xl font-serif text-[#F7F4EE]" data-testid="text-documents-title">Public Documents</h1>
          <p className="text-[#B8B8B8] mt-6 max-w-2xl text-lg leading-relaxed">
            Download circulars, guides, and other resources published by Nike Pillay Inc.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="border border-[#2A2A2A] p-6 animate-pulse h-20" />)}
          </div>
        ) : (documents ?? []).length === 0 ? (
          <div className="border border-[#2A2A2A] p-16 text-center">
            <FolderOpen size={40} className="text-[#B8B8B8] mx-auto mb-4" />
            <p className="text-[#B8B8B8]">No documents available at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(documents ?? []).map((doc) => (
              <a
                key={doc.id}
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`link-document-${doc.id}`}
                className="group flex items-center justify-between border border-[#2A2A2A] hover:border-[#C6A15B]/30 transition-colors p-6"
              >
                <div>
                  {doc.category && <p className="text-[#C6A15B] text-xs uppercase tracking-widest mb-1">{doc.category}</p>}
                  <h2 className="text-[#F7F4EE] font-serif group-hover:text-[#C6A15B] transition-colors">{doc.title}</h2>
                  {doc.description && <p className="text-[#B8B8B8] text-sm mt-1">{doc.description}</p>}
                </div>
                <Download size={18} className="text-[#C6A15B] shrink-0 ml-6" />
              </a>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
