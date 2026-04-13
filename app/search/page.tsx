import type { Metadata } from "next";
import { PagefindSearch } from "@/components/pagefind-search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search blog content with Pagefind.",
};

export default function SearchPage() {
  return (
    <>
      <header className="list-page-header">
        <h1>Search</h1>
        <p>Pagefind index is generated after each static build.</p>
      </header>
      <section className="search-shell">
        <PagefindSearch />
      </section>
    </>
  );
}
