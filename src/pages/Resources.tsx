import { ExternalLink, PlayCircle, Code2, Rocket, Briefcase } from 'lucide-react';

const RESOURCES = [
  {
    category: "Core Courses",
    icon: <PlayCircle className="w-4 h-4 text-[var(--color-muted)]" />,
    items: [
      { title: "Complete Web Dev Course", desc: "Hitesh Choudhary (Udemy)", url: "https://www.udemy.com/course/web-dev-master/" },
      { title: "TUF+ DSA Sheet", desc: "Striver (takeUforward)", url: "https://takeuforward.org/plus" }
    ]
  },
  {
    category: "Practice & Reference",
    icon: <Code2 className="w-4 h-4 text-[var(--color-muted)]" />,
    items: [
      { title: "LeetCode", desc: "Daily problem solving", url: "https://leetcode.com/" },
      { title: "MDN Web Docs", desc: "The ultimate web reference", url: "https://developer.mozilla.org/" },
      { title: "TypeScript Handbook", desc: "Official docs", url: "https://www.typescriptlang.org/docs/handbook/" }
    ]
  },
  {
    category: "Deploy",
    icon: <Rocket className="w-4 h-4 text-[var(--color-muted)]" />,
    items: [
      { title: "Vercel", desc: "Frontend hosting", url: "https://vercel.com/" },
      { title: "Render", desc: "Backend & DB hosting", url: "https://render.com/" },
      { title: "GitHub", desc: "Version control & portfolio", url: "https://github.com/" }
    ]
  },
  {
    category: "Jobs",
    icon: <Briefcase className="w-4 h-4 text-[var(--color-muted)]" />,
    items: [
      { title: "LinkedIn", desc: "Networking & Jobs", url: "https://www.linkedin.com/jobs/" },
      { title: "Naukri Campus", desc: "Fresher hiring", url: "https://www.naukri.com/campus/" },
      { title: "Internshala", desc: "Internships", url: "https://internshala.com/" },
      { title: "Wellfound", desc: "Startup jobs", url: "https://wellfound.com/" }
    ]
  }
];

export default function Resources() {
  return (
    <div className="max-w-3xl animate-in fade-in duration-300">
      <header className="mb-8 border-b border-[var(--color-border)] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)] mb-1">Resource Hub</h1>
        <p className="text-[var(--color-muted)] text-sm">Your complete toolkit for the next 6 months.</p>
      </header>

      <div className="space-y-8">
        {RESOURCES.map((group, i) => (
          <div key={i} className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)] border-b border-[var(--color-border)] pb-2">
              {group.icon}
              {group.category}
            </h2>
            <div className="grid gap-2">
              {group.items.map((item, j) => (
                <a 
                  key={j}
                  href={item.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-colors group bg-[var(--color-background)]"
                >
                  <div>
                    <h3 className="text-sm font-medium text-[var(--color-foreground)] transition-colors">{item.title}</h3>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">{item.desc}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[var(--color-muted)] group-hover:text-[var(--color-foreground)] transition-colors" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
