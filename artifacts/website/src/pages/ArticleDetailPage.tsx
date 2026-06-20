import { useGetArticle, getGetArticleQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

interface Props { slug: string; }

export default function ArticleDetailPage({ slug }: Props) {
  const { data: article, isLoading } = useGetArticle(slug, { query: { queryKey: getGetArticleQueryKey(slug) } });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="py-24 px-6 max-w-3xl mx-auto animate-pulse">
          <div className="h-8 bg-[#2A2A2A] rounded w-1/4 mb-8" />
          <div className="h-16 bg-[#2A2A2A] rounded mb-6" />
          <div className="h-64 bg-[#2A2A2A] rounded" />
        </div>
      </PublicLayout>
    );
  }

  if (!article) {
    return (
      <PublicLayout>
        <div className="py-24 px-6 text-center">
          <h1 className="text-4xl font-serif text-[#F7F4EE] mb-4">Article Not Found</h1>
          <Link href="/insights" className="text-[#C6A15B]">← Insights</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/insights" className="inline-flex items-center gap-2 text-[#C6A15B] text-sm uppercase tracking-widest mb-12 hover:gap-3 transition-all" data-testid="link-back-insights">
          <ArrowLeft size={14} /> Insights
        </Link>

        <span className="text-[#C6A15B] text-xs uppercase tracking-[0.25em] mb-4 block">{article.category}</span>
        <h1 className="text-4xl md:text-5xl font-serif text-[#F7F4EE] mb-6 leading-tight" data-testid="text-article-title">
          {article.title}
        </h1>

        {(article.author || article.publishedAt) && (
          <div className="flex gap-6 text-[#B8B8B8] text-sm mb-12 border-b border-[#2A2A2A] pb-6">
            {article.author && <span>{article.author}</span>}
            {article.publishedAt && (
              <span>{new Date(article.publishedAt).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</span>
            )}
          </div>
        )}

        {article.summary && (
          <p className="text-[#B8B8B8] text-xl leading-relaxed mb-10 font-light italic border-l-2 border-[#C6A15B] pl-6">
            {article.summary}
          </p>
        )}

        {article.content && (
          <div className="text-[#B8B8B8] leading-relaxed text-lg space-y-6 whitespace-pre-wrap">
            {article.content}
          </div>
        )}

        <div className="mt-16 border-t border-[#2A2A2A] pt-10">
          <Link href="/contact" className="inline-flex items-center gap-3 border border-[#C6A15B] text-[#C6A15B] px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#C6A15B] hover:text-[#0E0E0E] transition-colors" data-testid="link-contact-cta">
            Discuss This With Us
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
