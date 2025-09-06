import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

interface PostData {
  slug: string;
  title: string;
  date: string;
  author: string;
}

const postsDirectory = path.join(process.cwd(), 'contents');

export function getSortedPostsData() {
  const allPostsData: PostData[] = [];
  const categories = fs.readdirSync(postsDirectory);

  categories.forEach(category => {
    const categoryPath = path.join(postsDirectory, category);
    const articles = fs.readdirSync(categoryPath);

    articles.forEach(articleTitle => {
      const fullPath = path.join(categoryPath, articleTitle, 'main.md');
      // Check if main.md exists
      if (fs.existsSync(fullPath)) {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        let dateString: string;
        const parsedDate = new Date(matterResult.data.date as string);
        if (isNaN(parsedDate.getTime())) {
          dateString = 'YYYY-MM-DD';
        } else {
          dateString = parsedDate.toISOString().substring(0, 10);
        }

        const title = (matterResult.data.title as string) || 'Untitled Post';
        const author = (matterResult.data.author as string) || 'Unknown Author';

        allPostsData.push({
          slug: `${category}/${articleTitle}`,
          title,
          date: dateString,
          author,
        });
      }
    });
  });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostData(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  const [category, articleTitle] = decodedSlug.split('/');
  const fullPath = path.join(postsDirectory, category, articleTitle, 'main.md');
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  let contentHtml: string;
  if (!matterResult.content || matterResult.content.trim() === '') {
    contentHtml = '<p>No content available for this post.</p>';
  } else {
    const processedContent = await remark().use(html).process(matterResult.content);
    contentHtml = processedContent.toString();
    // Adjust image paths to point to the public/assets directory
    contentHtml = contentHtml.replace(/src=\"images\/g, `src=\"/assets/${category}/${articleTitle}/images/`);
    // Adjust sound paths to point to the public/assets directory
    contentHtml = contentHtml.replace(/src=\"sounds\/g, `src=\"/assets/${category}/${articleTitle}/sounds/`);
  }

  let dateString: string;
  const parsedDate = new Date(matterResult.data.date as string);
  if (isNaN(parsedDate.getTime())) {
    dateString = 'YYYY-MM-DD';
  } else {
    dateString = parsedDate.toISOString().substring(0, 10);
  }

  const title = (matterResult.data.title as string) || 'Untitled Post';
  const author = (matterResult.data.author as string) || 'Unknown Author';

  return {
    slug,
    title,
    date: dateString,
    author,
    contentHtml,
  };
}

export function getAllPostSlugs() {
  const slugs: { slug: string }[] = [];
  const categories = fs.readdirSync(postsDirectory);

  categories.forEach(category => {
    const categoryPath = path.join(postsDirectory, category);
    const articles = fs.readdirSync(categoryPath);

    articles.forEach(articleTitle => {
      const fullPath = path.join(categoryPath, articleTitle, 'main.md');
      // Only add slug if main.md exists
      if (fs.existsSync(fullPath)) {
        const generatedSlug = `${category}/${articleTitle}`;
        slugs.push({
          slug: generatedSlug,
        });
      }
    });
  });
  return slugs;
}