# Blog Architecture and Data Flow

This document explains the architecture and data flow of the blog application, which is designed to efficiently generate and display static blog content from Markdown files.

## 1. Components and Layers

The blog is composed of the following key components and layers:

*   **Content Layer (`/contents/`)**:
    *   This is where the source Markdown files for blog posts are stored. Each file contains "front matter" (metadata like title, date, author) and the main Markdown content of the article.

*   **Data Access Layer (`lib/posts.ts`)**:
    *   This layer provides an abstraction for reading and processing Markdown files from the filesystem.
    *   **`getSortedPostsData()`**: Reads all Markdown files, parses their front matter, and returns a sorted list of article metadata (slug, title, date, author).
    *   **`getPostData(slug)`**: Reads the Markdown file corresponding to a specific slug, parses its front matter, converts the Markdown content to HTML, and returns the complete article data (metadata and HTML content).
    *   **`getAllPostSlugs()`**: Returns a list of slugs (filenames) for all Markdown files.
    *   **Internal Workings**: It uses the `fs` module to read files, `gray-matter` to parse front matter, and `remark` with `remark-html` to convert Markdown to HTML. The returned data ensures that all properties, including dates, are treated as plain strings to avoid Next.js serialization issues.

*   **Presentation Layer (Next.js App Router Pages)**:
    *   This layer is responsible for rendering the user interface based on the data obtained from the Data Access Layer.
    *   **`src/app/page.tsx` (Home Page)**:
        *   Calls `getSortedPostsData()` at build time to fetch all blog post metadata.
        *   Displays a list of post titles and dates, providing links to each article.
    *   **`src/app/posts/[slug]/page.tsx` (Post Detail Page)**:
        *   **`generateStaticParams()`**: Informs Next.js about all available `[slug]` values (i.e., which articles exist) by calling `getAllPostSlugs()`.
        *   **`Post` Component**: For each slug, it calls `getPostData(slug)` at build time to fetch the complete content of the specific article.
        *   Renders the obtained data (title, date, author, HTML content) to generate individual article pages.

*   **Layout/Styling Layer (`src/app/layout.tsx`, `globals.css`, Tailwind CSS)**:
    *   Provides a consistent user interface and styling across the application.
    *   **`src/app/layout.tsx`**: Defines the common layout applied to all pages, including the header, main content area, and footer.
    *   **`globals.css` and Tailwind CSS**: Handle the visual styling of the application.

## 2. Data Flow (Step-by-Step)

Data is primarily processed and generated as static HTML files during the **build time**.

*   **Build Time (Static Site Generation - SSG)**:
    1.  The `pnpm run build` command is executed, initiating the Next.js build process.
    2.  **Home Page (`/`) Generation**:
        *   Next.js processes `src/app/page.tsx`.
        *   `getSortedPostsData()` is called within `src/app/page.tsx`.
        *   `getSortedPostsData()` reads all `.md` files from the `/contents/` directory, parses their front matter, converts Markdown to HTML, and returns an array of article metadata with dates formatted as strings.
        *   Next.js receives this data and pre-renders the static HTML for the home page.
    3.  **Article Detail Pages (`/posts/[slug]`) Generation**:
        *   Next.js processes `src/app/posts/[slug]/page.tsx`.
        *   First, `generateStaticParams()` is called, which obtains a list of all possible `slug` values (e.g., `first-post`) from the `.md` filenames in `/contents/` via `getAllPostSlugs()`.
        *   For each obtained `slug`, Next.js then calls `getPostData(slug)`.
        *   `getPostData(slug)` reads the corresponding `.md` file, parses its front matter, converts the Markdown content to HTML, and returns the complete article data (metadata and HTML content).
        *   Next.js receives this data and pre-renders the static HTML for each individual article page.
    4.  All pages are output as static HTML files into the `.next` directory.

*   **Runtime (Client-side)**:
    1.  A user requests a page in their browser.
    2.  Next.js serves the pre-rendered static HTML file to the user's browser.
    3.  Client-side JavaScript then "hydrates" the page (adds dynamic functionality), enabling interactive operations like clicking links.

## 3. Key Architectural Principles

*   **Separation of Concerns**: There is a clear distinction between content (Markdown files), data access logic (`lib/posts.ts`), and presentation (Next.js components).
*   **Static Site Generation (SSG)**: All pages are pre-built during the build process, leading to high performance, excellent SEO, and enhanced security.
*   **Data Abstraction**: `lib/posts.ts` hides the complexities of filesystem operations and Markdown parsing, allowing components to receive clean, structured data.
*   **Dynamic Routing**: A single component (`src/app/posts/[slug]/page.tsx`) efficiently handles multiple article pages.
*   **Scalability**: Adding new articles is as simple as placing new Markdown files into the `/contents/` directory, requiring no code changes.