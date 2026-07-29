import { useListAwards } from "@workspace/api-client-react";
import { Trophy } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function AwardsPage() {
  const { data: awards, isLoading } = useListAwards();

  return (
    <PublicLayout>
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-[#C6A15B] text-xs uppercase tracking-[0.25em] mb-4">Recognition</p>
          <h1 className="text-5xl md:text-6xl font-serif text-[#F7F4EE]" data-testid="text-awards-title">Awards & Honours</h1>
          <p className="text-[#B8B8B8] mt-6 max-w-2xl text-lg leading-relaxed">
            Recognition from the legal community and business world reflects our ongoing commitment to excellence.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="border border-[#2A2A2A] p-8 animate-pulse h-40" />)}
          </div>
        ) : (awards ?? []).length === 0 ? (
          <div className="text-center py-16 text-[#B8B8B8]">No awards listed yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(awards ?? []).map((award) => (
              <div key={award.id} data-testid={`card-award-${award.id}`} className="border border-[#2A2A2A] p-10">
                <Trophy size={28} className="text-[#C6A15B] mb-6" />
                <p className="text-[#C6A15B] text-xs uppercase tracking-widest mb-2">{award.year}</p>
                <h2 className="text-xl font-serif text-[#F7F4EE] mb-2">{award.title}</h2>
                {award.awardingBody && <p className="text-[#B8B8B8] text-sm mb-4 font-medium">{award.awardingBody}</p>}
                {award.description && <p className="text-[#B8B8B8] text-sm leading-relaxed">{award.description}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
