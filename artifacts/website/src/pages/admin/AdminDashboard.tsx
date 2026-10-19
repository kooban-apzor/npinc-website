import { useGetAdminMe, useListServices, useListPeople, useListArticles, useListVacancies, useListCvSubmissions, useListContactEnquiries } from "@workspace/api-client-react";
import AdminLayout from "@/components/AdminLayout";
import { AdminPage, AdminLoading } from "@/components/admin/ui";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Briefcase, Users, Newspaper, FileText, FileCheck, MessageSquare, Plus, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const { data: me, isError } = useGetAdminMe({ query: { queryKey: ['admin-me'], retry: false } });
  const { data: services, isLoading: l1 } = useListServices();
  const { data: people, isLoading: l2 } = useListPeople({});
  const { data: articles, isLoading: l3 } = useListArticles({});
  const { data: vacancies, isLoading: l4 } = useListVacancies();
  const { data: cvSubs } = useListCvSubmissions({ query: { queryKey: ['cv-submissions'], retry: false } });
  const { data: enquiries } = useListContactEnquiries({ query: { queryKey: ['contact-enquiries'], retry: false } });
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isError) setLocation("/admin/login");
  }, [isError, setLocation]);

  const stats = [
    { label: "Practice Areas", value: services?.length ?? 0, icon: Briefcase, href: "/admin/services" },
    { label: "Team Members", value: people?.length ?? 0, icon: Users, href: "/admin/people" },
    { label: "Articles", value: articles?.length ?? 0, icon: Newspaper, href: "/admin/articles" },
    { label: "Vacancies", value: vacancies?.length ?? 0, icon: FileText, href: "/admin/vacancies" },
    { label: "CV Submissions", value: cvSubs?.length ?? 0, icon: FileCheck, href: "/admin/cv-submissions" },
    { label: "Enquiries", value: enquiries?.length ?? 0, icon: MessageSquare, href: "/admin/enquiries" },
  ];

  const loading = l1 || l2 || l3 || l4;

  return (
    <AdminLayout>
      <AdminPage title={`Welcome${me ? `, ${me.username}` : ""}`}>
        {loading ? <AdminLoading rows={4} /> : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              {stats.map(({ label, value, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  data-testid={`card-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className="group bg-panel border border-line hover:border-brand/40 transition-colors p-5 flex items-center gap-4"
                >
                  <span className="w-10 h-10 shrink-0 flex items-center justify-center border border-line group-hover:border-brand/40 transition-colors">
                    <Icon size={18} className="text-brand" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-2xl font-serif text-paper leading-none">{value}</span>
                    <span className="block text-fog text-xs uppercase tracking-widest mt-1 truncate">{label}</span>
                  </span>
                  <ArrowRight size={14} className="ml-auto text-fog/40 group-hover:text-brand shrink-0 transition-colors" />
                </a>
              ))}
            </div>

            <div className="border border-line p-5 md:p-6">
              <h2 className="text-brand text-xs uppercase tracking-widest mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Article", href: "/admin/articles" },
                  { label: "Event", href: "/admin/events" },
                  { label: "Team Member", href: "/admin/people" },
                  { label: "Vacancy", href: "/admin/vacancies" },
                ].map(({ label, href }) => (
                  <a
                    key={href}
                    href={href}
                    className="flex items-center gap-2 border border-line hover:border-brand text-fog hover:text-brand px-4 py-2.5 text-xs uppercase tracking-widest transition-colors"
                  >
                    <Plus size={13} /> {label}
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </AdminPage>
    </AdminLayout>
  );
}
