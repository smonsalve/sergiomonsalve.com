import { MDXRemote } from 'next-mdx-remote/rsc'

export default function MDXContent({ source }: { source: string }) {
  return (
    <div className="mdx-prose">
      <MDXRemote source={source} />
    </div>
  )
}
