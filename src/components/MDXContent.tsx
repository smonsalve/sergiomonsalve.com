import { MDXRemote } from 'next-mdx-remote/rsc'

function Step({ number, children }: { number?: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 mb-4 not-italic">
      {number != null && (
        <span className="font-mono text-xs text-accent shrink-0 pt-1">{number}.</span>
      )}
      <div>{children}</div>
    </div>
  )
}

const components = { Step }

export default function MDXContent({ source }: { source: string }) {
  return (
    <div className="mdx-prose">
      <MDXRemote source={source} components={components} />
    </div>
  )
}
