import { useGetAdminMe, useListServices, useListPeople, useListArticles, useListVacancies, useListCvSubmissions, useListContactEnquiries } from "@workspace/api-client-react";
import AdminLayout from "@/components/AdminLayout";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Briefcase, Users, Newspaper, FileText, FileCheck, MessageSquare } from "lucide-react";

export default function AdminDashboard() {
  const { data: me, isError } = useGetAdminMe({ query: { retry: false } });
  const { data: services } = useListServices();
  const { data: people } = useListPeople({});
  const { data: articles } = useListArticles({});
  const { data: vacancies } = useListVacancies();
  const { data: cvSubs } = useListCvSubmissions({ query: { retry: false } });
  const { data: enquiries } = useListContactEnquiries({ query: { retry: false } });
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

  return (
    <AdminLayout>
      <div className="p-8 md:p-12">
        <div className="mb-10">
          <p className="text-[#C6A15B] text-xs uppercase tracking-[0.25em] mb-2">CMS Dashboard</p>
          <h1 className="text-3xl font-serif text-[#F7F4EE]" data-testid="text-admin-title">
            Welcome{me ? `, ${me.username}` : ""}
          </h1>
          <p className="text-[#B8B8B8] mt-2">Manage all content for the Nike Pillay Inc website.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {stats.map(({ label, value, icon: Icon, href }) => (
            <a
              key={label}
              href={href}
              data-testid={`card-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="bg-[#151515] border border-[#2A2A2A] hover:border-[#C6A15B]/30 transition-colors p-6"
            >
              <Icon size={20} className="text-[#C6A15B] mb-4" />
              <p className="text-3xl font-serif text-[#F7F4EE] mb-1">{value}</p>
              <p className="text-[#B8B8B8] text-xs uppercase tracking-widest">{label}</p>
            </a>
          ))}
        </div>

        <div className="border border-[#2A2A2A] p-8">
          <h2 className="text-lg font-serif text-[#F7F4EE] mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            {[
              { label: "Add Article", href: "/admin/articles" },
              { label: "Add Event", href: "/admin/events" },
              { label: "Manage Team", href: "/admin/people" },
              { label: "View Enquiries", href: "/admin/enquiries" },
              { label: "Update Calculator Rates", href: "/admin/calculator-rates" },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="border border-[#2A2A2A] hover:border-[#C6A15B] text-[#B8B8B8] hover:text-[#C6A15B] px-6 py-3 text-sm transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
