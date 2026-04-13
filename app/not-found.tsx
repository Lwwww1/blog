import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-block">
      <h1>Not Found</h1>
      <p className="empty-state">The page you are looking for does not exist.</p>
      <p>
        <Link className="button-link" href="/">
          Back to home
        </Link>
      </p>
    </section>
  );
}
