import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'contents');

export function getSortedPostsData() {
  const allPostsData: PostData[] = [];
  const rawCategories = fs.readdirSync(postsDirectory);
  const categories = rawCategories
    .filter(name => fs.statSync(path.join(postsDirectory, name)).isDirectory() && !name.startsWith('.'));

  categories.forEach(category => {
    const categoryPath = path.join(postsDirectory, category);
    const articlesOrSubCategories = fs.readdirSync(categoryPath);

    articlesOrSubCategories.forEach(item => {
      const itemPath = path.join(categoryPath, item);
      if (fs.statSync(itemPath).isDirectory()) {
        const mainMdPath = path.join(itemPath, 'main.md');
        if (fs.existsSync(mainMdPath)) {
          const fileContents = fs.readFileSync(mainMdPath, 'utf8');
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
            slug: `${category}/${item}`,
            title,
            date: dateString,
            author,
          });
        } else {
          const articlesInSubCategory = fs.readdirSync(itemPath);
          articlesInSubCategory.forEach(articleTitle => {
            const fullPath = path.join(itemPath, articleTitle, 'main.md');
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
                slug: `${category}/${item}/${articleTitle}`,
                title,
                date: dateString,
                author,
              });
            }
          });
        }
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
  export function getSortedPostsData() {
  const allPostsData: PostData[] = [];
  const rawCategories = fs.readdirSync(postsDirectory);
  const categories = rawCategories
    .filter(name => fs.statSync(path.join(postsDirectory, name)).isDirectory() && !name.startsWith('.'));

  categories.forEach(category => {
    const categoryPath = path.join(postsDirectory, category);
    const articlesOrSubCategories = fs.readdirSync(categoryPath);

    articlesOrSubCategories.forEach(item => {
      const itemPath = path.join(categoryPath, item);
      if (fs.statSync(itemPath).isDirectory()) {
        const mainMdPath = path.join(itemPath, 'main.md');
        if (fs.existsSync(mainMdPath)) {
          const fileContents = fs.readFileSync(mainMdPath, 'utf8');
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
            slug: `${category}/${item}`,
            title,
            date: dateString,
            author,
          });
        } else {
          const articlesInSubCategory = fs.readdirSync(itemPath);
          articlesInSubCategory.forEach(articleTitle => {
            const fullPath = path.join(itemPath, articleTitle, 'main.md');
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
                slug: `${category}/${item}/${articleTitle}`,
                title,
                date: dateString,
                author,
              });
            }
          });
        }
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
  const slugParts = decodedSlug.split('/');

  let category: string;
  let subCategory: string | undefined;
  let articleTitle: string;

  if (slugParts.length === 2) {
    category = slugParts[0];
    articleTitle = slugParts[1];
  } else if (slugParts.length === 3) {
    category = slugParts[0];
    subCategory = slugParts[1];
    articleTitle = slugParts[2];
  } else {
    throw new Error(`Invalid slug format: ${slug}`);
  }

  const fullPath = subCategory
    ? path.join(postsDirectory, category, subCategory, articleTitle, 'main.md')
    : path.join(postsDirectory, category, articleTitle, 'main.md');
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found for slug: ${slug}`);
  }
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  let contentHtml: string;
  if (!matterResult.content || matterResult.content.trim() === '') {
    contentHtml = '<p>No content available for this post.</p>';
  } else {
    const processedContent = await remark().use(html).process(matterResult.content);
    contentHtml = processedContent.toString();
    // Adjust image paths to point to the public/assets directory
    contentHtml = contentHtml.replace(/src="images\//g, `src="/assets/${category}/${articleTitle}/images/`);
    // Adjust sound paths to point to the public/assets directory
    contentHtml = contentHtml.replace(/src="sounds\//g, `src="/assets/${category}/${articleTitle}/sounds/`);
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
  const rawCategories = fs.readdirSync(postsDirectory);
  const categories = rawCategories
    .filter(name => fs.statSync(path.join(postsDirectory, name)).isDirectory() && !name.startsWith('.'));

  categories.forEach(category => {
    const categoryPath = path.join(postsDirectory, category);
    const articlesOrSubCategories = fs.readdirSync(categoryPath);

    articlesOrSubCategories.forEach(item => {
      const itemPath = path.join(categoryPath, item);
      if (fs.statSync(itemPath).isDirectory()) {
        const mainMdPath = path.join(itemPath, 'main.md');
        if (fs.existsSync(mainMdPath)) {
          const generatedSlug = `${category}/${item}`;
          slugs.push({
            slug: generatedSlug,
          });
        } else {
          const articlesInSubCategory = fs.readdirSync(itemPath);
          articlesInSubCategory.forEach(articleTitle => {
            const fullPath = path.join(itemPath, articleTitle, 'main.md');
            if (fs.existsSync(fullPath)) {
              const generatedSlug = `${category}/${item}/${articleTitle}`;
              slugs.push({
                slug: generatedSlug,
              });
            }
          });
        }
      }
    });
  });
  return slugs;
}
  const decodedSlug = decodeURIComponent(slug);
  console.log('getPostData: Decoded slug:', decodedSlug);
  const slugParts = decodedSlug.split('/');
  let category: string;
  let subCategory: string | undefined;
  let articleTitle: string;

  if (slugParts.length === 2) {
    category = slugParts[0];
    articleTitle = slugParts[1];
  } else if (slugParts.length === 3) {
    category = slugParts[0];
    subCategory = slugParts[1];
    articleTitle = slugParts[2];
  } else {
    throw new Error(`Invalid slug format: ${slug}`);
  }

  console.log('getPostData: Category:', category, 'SubCategory:', subCategory, 'Article Title:', articleTitle);

  const fullPath = subCategory
    ? path.join(postsDirectory, category, subCategory, articleTitle, 'main.md')
    : path.join(postsDirectory, category, articleTitle, 'main.md');
  console.log('getPostData: Attempting to read file from:', fullPath);
  if (!fs.existsSync(fullPath)) {
    console.error('getPostData: File not found at:', fullPath);
    throw new Error(`Post not found for slug: ${slug}`);
  }
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  let contentHtml: string;
  if (!matterResult.content || matterResult.content.trim() === '') {
    contentHtml = '<p>No content available for this post.</p>';
  } else {
    const processedContent = await remark().use(html).process(matterResult.content);
    contentHtml = processedContent.toString();
    // Adjust image paths to point to the public/assets directory
    contentHtml = contentHtml.replace(/src="images\//g, `src="/assets/${category}/${articleTitle}/images/`);
    // Adjust sound paths to point to the public/assets directory
    contentHtml = contentHtml.replace(/src="sounds\//g, `src="/assets/${category}/${articleTitle}/sounds/`);
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
  const rawCategories = fs.readdirSync(postsDirectory);
  const categories = rawCategories
    .filter(name => fs.statSync(path.join(postsDirectory, name)).isDirectory() && !name.startsWith('.'));

  categories.forEach(category => {
    const categoryPath = path.join(postsDirectory, category);
    const articlesOrSubCategories = fs.readdirSync(categoryPath);

    articlesOrSubCategories.forEach(item => {
      const itemPath = path.join(categoryPath, item);
      if (fs.statSync(itemPath).isDirectory()) {
        const mainMdPath = path.join(itemPath, 'main.md');
        if (fs.existsSync(mainMdPath)) {
          const generatedSlug = `${category}/${item}`;
          slugs.push({
            slug: generatedSlug,
          });
        } else {
          const articlesInSubCategory = fs.readdirSync(itemPath);
          articlesInSubCategory.forEach(articleTitle => {
            const fullPath = path.join(itemPath, articleTitle, 'main.md');
            if (fs.existsSync(fullPath)) {
              const generatedSlug = `${category}/${item}/${articleTitle}`;
              slugs.push({
                slug: generatedSlug,
              });
            }
          });
        }
      }
    });
  });
  return slugs;
}