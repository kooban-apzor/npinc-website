import { useState } from "react";
import { useListArticles, getListArticlesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import PageSEO from "@/components/PageSEO";

const CATEGORIES = ["All", "LegalUpdate", "FirmNews", "StaffMovement", "Notice", "Event", "Award", "Career"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  All: "All",
  LegalUpdate: "Legal Updates",
  FirmNews: "Firm News",
  StaffMovement: "Staff Movements",
  Notice: "Notices",
  Event: "Events",
  Award: "Awards",
  Career: "Careers",
};

export default function InsightsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const { data: articles, isLoading } = useListArticles(
    activeCategory === "All" ? {} : { category: activeCategory as never },
    { query: { queryKey: getListArticlesQueryKey(activeCategory === "All" ? {} : { category: activeCategory as never }) } }
  );

  return (
    <PublicLayout>
      <PageSEO page="insights" />
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-[#C6A15B] text-xs uppercase tracking-[0.25em] mb-4">Publications</p>
          <h1 className="text-5xl md:text-6xl font-serif text-[#F7F4EE]" data-testid="text-insights-title">Insights</h1>
          <p className="text-[#B8B8B8] mt-6 max-w-2xl text-lg leading-relaxed">
            Legal updates, firm news, and thought leadership from the NP Inc team.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              data-testid={`button-category-${cat.toLowerCase()}`}
              className={`px-5 py-2 text-xs uppercase tracking-widest border transition-colors ${
                activeCategory === cat
                  ? "bg-[#C6A15B] text-[#0E0E0E] border-[#C6A15B]"
                  : "border-[#2A2A2A] text-[#B8B8B8] hover:border-[#C6A15B] hover:text-[#C6A15B]"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="border border-[#2A2A2A] p-8 animate-pulse">
                <div className="h-4 bg-[#2A2A2A] rounded mb-4 w-1/3" />
                <div className="h-6 bg-[#2A2A2A] rounded mb-3" />
                <div className="h-20 bg-[#2A2A2A] rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(articles ?? []).map((article) => (
              <Link
                key={article.id}
                href={`/insights/${article.slug}`}
                data-testid={`card-article-${article.id}`}
                className="group border border-[#2A2A2A] hover:border-[#C6A15B]/30 transition-colors p-8 flex flex-col"
              >
                <span className="text-[#C6A15B] text-xs uppercase tracking-widest mb-3">
                  {CATEGORY_LABELS[article.category] ?? article.category}
                </span>
                <h2 className="text-xl font-serif text-[#F7F4EE] mb-4 leading-snug group-hover:text-[#C6A15B] transition-colors flex-1">
                  {article.title}
                </h2>
                {article.summary && (
                  <p className="text-[#B8B8B8] text-sm leading-relaxed mb-6 line-clamp-3">{article.summary}</p>
                )}
                {article.author && <p className="text-[#B8B8B8] text-xs mb-4">{article.author}</p>}
                <span className="text-[#C6A15B] text-xs uppercase tracking-widest inline-flex items-center gap-2 group-hover:gap-3 transition-all mt-auto">
                  Read more <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && (articles ?? []).length === 0 && (
          <div className="text-center py-16 text-[#B8B8B8]">No articles found.</div>
        )}
      </section>
    </PublicLayout>
  );
}
