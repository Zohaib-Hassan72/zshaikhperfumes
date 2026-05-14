import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Page } from "@/lib/types";

export const Route = createFileRoute("/pages/$slug")({
  component: PageView,
});

function PageView() {
  const { slug } = Route.useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("pages").select("*").eq("slug", slug).eq("published", true).maybeSingle()
      .then(({ data }) => { setPage(data as Page | null); setLoading(false); });
  }, [slug]);

  if (loading) return <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">Loading…</div>;
  if (!page) return <div className="container mx-auto px-4 py-24 text-center"><h1 className="font-display text-4xl">Page not found</h1></div>;

  return (
    <article className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="font-display text-5xl text-center">{page.title}</h1>
      <div className="mt-10 prose prose-neutral max-w-none prose-headings:font-display prose-h2:text-2xl prose-a:text-gold" dangerouslySetInnerHTML={{ __html: page.content }} />
    </article>
  );
}
