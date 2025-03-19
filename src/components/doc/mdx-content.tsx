'use client';

/**  */
// import { MDXRemote, MDXRemoteProps } from 'next-mdx-remote';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from './code-block';
import { Link } from 'react-router-dom';
// import Image from 'next/image';
import { cn } from '@/lib/utils';

const components = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn('mt-2 scroll-m-20 text-3xl font-bold tracking-tight', className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn('mt-10 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0', className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn('mt-8 scroll-m-20 text-xl font-semibold tracking-tight', className)}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className={cn('mt-8 scroll-m-20 text-lg font-semibold tracking-tight', className)}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn('my-6 ml-6 list-disc', className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn('my-6 ml-6 list-decimal', className)} {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn('mt-2', className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn('mt-6 border-l-2 border-gray-300 pl-6 italic text-gray-800', className)}
      {...props}
    />
  ),
  img: ({ className, alt, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // 使用标准 img 标签代替 Next.js Image 组件
    <img
      src={src || ''}
      className={cn('rounded-md border max-w-full h-auto', className)}
      alt={alt || ''}
      {...props}
    />
  ),
  a: ({ className, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <Link
      to={href || ''}
      className={cn('font-medium text-blue-600 underline underline-offset-4', className)}
      {...props}
    />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn('relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm', className)}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={cn('mb-4 mt-6 overflow-x-auto rounded-lg bg-gray-900 p-4', className)}
      {...props}
    />
  ),
  CodeBlock,
};

interface MDXContentProps {
  source: string; // Markdown 源代码内容
}

export function MDXContent({ source }: MDXContentProps) {
  return (
    <div className="mdx-content prose prose-gray max-w-none dark:prose-invert">
      <ReactMarkdown components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
} 