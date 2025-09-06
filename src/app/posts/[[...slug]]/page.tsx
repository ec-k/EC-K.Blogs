import { getAllPostSlugs, getPostData } from "@/lib/posts";

export async function generateStaticParams() {
  console.log("generateStaticParams: Executing...");
  const posts = getAllPostSlugs();
  console.log("generateStaticParams: Slugs found:", posts);
  return posts.map((post) => ({
    slug: post.slug.split("/"),
  }));
}

export default async function Post({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await paramsPromise;
  const slugString = params.slug.join("/");
  const postData = await getPostData(slugString);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{postData.title}</h1>
      <p className="text-gray-500 mb-4">
        {postData.date} by {postData.author}
      </p>
      <div
        className="prose lg:prose-xl"
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
      />
    </div>
  );
}
