import Link from "next/link";

export const SiteHeader = () => (
  <header className="site-header">
    <div className="site-header__inner">
      <Link className="site-header__brand" href="/">
        LOUO Blog
      </Link>
      <nav className="site-nav">
        <Link href="/posts">Posts</Link>
        <Link href="/search">Search</Link>
        <Link href="/about">About</Link>
      </nav>
    </div>
  </header>
);
