import {getManagedBlogPosts} from './blog.server';
import {isVisiblePost,readingTime} from './blog-editor';
export async function getEditableBlogPosts() {
  return (await getManagedBlogPosts()).filter(post=>isVisiblePost(post)).map(post=>({...post,readTime:readingTime(post.sections)}));
}
