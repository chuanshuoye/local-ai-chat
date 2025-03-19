import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { MDXContent } from '@/components/doc/mdx-content';
import { serialize } from 'next-mdx-remote/serialize';
import { DocHeader } from '@/components/doc/doc-header';
import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// 添加代码块语言别名映射
const languageAliases = {
  'bash': 'shell',
  'sh': 'shell',
  'zsh': 'shell',
  'typescript': 'ts',
  'javascript': 'js',
} as const;

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

// 构建指向MDX文件的路径
function buildFilePath(slug: string[]) {
  if (slug.length === 0) {
    return path.join(process.cwd(), 'src/app/docs/page.mdx');
  }
  
  return path.join(process.cwd(), 'src/app/docs', ...slug, 'page.mdx');
} 

// 处理MDX文件的导入和编译
async function getMdxContent(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const source = fs.readFileSync(filePath, 'utf8');
    
    // 使用serialize替代compileMDX
    const mdxSource = await serialize(source, {
      mdxOptions: {
        rehypePlugins: [
          // 配置 rehype-prism-plus
          [rehypePrism, {
            // 添加更多语言支持
            ignoreMissing: true, // 忽略未找到的语言定义
            aliases: languageAliases, // 语言别名映射
            showLineNumbers: true, // 显示行号
          }],
          rehypeSlug, // 给标题添加ID
          [rehypeAutolinkHeadings, { behavior: 'wrap' }], // 给标题添加链接
        ],
      },
      parseFrontmatter: true,
    });
    
    return mdxSource;
  } catch (error) {
    console.error('Error loading MDX:', error);
    return null;
  }
}

// 从路径获取标题
function getTitle(slug: string[]) {
  if (slug.length === 0) {
    return '本地AI聊天助手';
  }
  
  // 将路径最后一部分转换为标题（将-替换为空格，首字母大写）
  const lastSegment = slug[slug.length - 1];
  return lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function DocPage({ params }: PageProps) {
  // 确保 params 是一个 Promise
  const resolvedParams = await params ; // 确保 params 被解析
  const { slug = [] } = resolvedParams ; // 解构 slug
  const filePath = buildFilePath(slug);
  const mdxSource = await getMdxContent(filePath);
  
  if (!mdxSource) {
    notFound();
  }
  
  const title = getTitle(slug);
  
  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <DocHeader title={title} />
      <div className="p-6 bg-white rounded-lg shadow">
        <MDXContent source={mdxSource} />
      </div>
    </div>
  );
} 