import { getPublishedBlogPosts } from './blog';
import { publicSiteContent } from './site-content';
export async function getEditableBlogPosts() {
  const values = await publicSiteContent();
  return getPublishedBlogPosts().map(post => {
    const text = (key:string, fallback:string) => values[`blog:${post.slug}:${key}`] ?? fallback;
    return {...post, title:text('title',post.title), description:text('description',post.description), category:text('category',post.category), readTime:text('readTime',post.readTime),
      sections:post.sections.map((s,i)=>({...s,heading:text(`section:${i}:heading`,s.heading),body:s.body.map((p,j)=>text(`section:${i}:body:${j}`,p))})),
      promotion:post.promotion ? {...post.promotion,eyebrow:text('promotion:eyebrow',post.promotion.eyebrow),headline:text('promotion:headline',post.promotion.headline)} : undefined};
  });
}
