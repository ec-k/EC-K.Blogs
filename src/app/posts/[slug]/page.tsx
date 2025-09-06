import { getAllPostSlugs, getPostData } from '../../../../lib/posts';

export async function generateStaticParams() {
  const posts = getAllPostSlugs();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Post({ params }: { params: { slug: string } }) {
  const postData = await getPostData(params.slug);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{postData.title}</h1>
      <p className="text-gray-500 mb-4">{postData.date} by {postData.author}</p>
      <div className="prose lg:prose-xl" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
    </div>
  );
}
