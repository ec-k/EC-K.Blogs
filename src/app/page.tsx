import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export default function Home() {
  const allPostsData = getSortedPostsData();
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Blog Posts</h2>
        <ul className="space-y-4">
          {allPostsData.map(({ slug, date, title }) => (
            <li key={slug} className="border p-4 rounded-lg shadow-sm">
              <Link href={`/posts/${slug}`} className="text-xl font-medium text-blue-600 hover:underline">
                {title}
              </Link>
              <br />
              <small className="text-gray-500">
                {date}
              </small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
