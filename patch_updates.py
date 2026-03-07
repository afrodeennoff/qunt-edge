import re

filepath = 'app/[locale]/(landing)/_updates/[slug]/page.tsx'

with open(filepath, 'r') as f:
    content = f.read()

page_orig = '''export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  const post = await getPostBySlug(slug, locale)

  if (!post) {
    notFound()
  }

  const t = await getI18n()
  const Content = (await import(`@/content/${post.slug}.mdx`)).default

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] pt-24 sm:pt-32 pb-16 sm:pb-24">
        {/* Navigation Header */}
        <div className="fixed top-[64px] z-40 w-full border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md">
          <div className="container max-w-3xl py-3 px-4 flex items-center justify-between">
            <Link
              href={`/${locale}/updates`}
              className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('landing.updates.backToUpdates')}
            </Link>
          </div>
        </div>

        <article className="container max-w-3xl px-4 sm:px-6 pt-8 sm:pt-12">
          {/* Header */}
          <header className="mb-12 sm:mb-16">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/40 mb-6 sm:mb-8 font-mono">
              <time dateTime={post.date}>
                {format(new Date(post.date), 'MMMM d, yyyy')}
              </time>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                {post.readingTime} min read
              </span>
              <span>•</span>
              <span className="capitalize">{post.type}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              {post.title}
            </h1>

            <p className="text-lg sm:text-xl text-white/60 leading-relaxed max-w-2xl">
              {post.description}
            </p>

            {/* Author */}
            {post.author && (
              <div className="mt-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-white/80">
                      {post.author.name[0]}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white/90">{post.author.name}</div>
                  <div className="text-xs text-white/50">{post.author.role}</div>
                </div>
              </div>
            )}
          </header>

          {/* Content */}
          <div className="prose prose-invert prose-p:text-white/70 prose-headings:text-white/90 prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-white/90 max-w-none prose-img:rounded-xl prose-img:border prose-img:border-white/10">
            <Content />
          </div>

          {/* Footer Actions */}
          <footer className="mt-16 sm:mt-24 pt-8 sm:pt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link
              href={`/${locale}/updates`}
              className="group flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              {t('landing.updates.backToUpdates')}
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-sm text-white/40">Share this update</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-white/50 hover:text-white hover:bg-white/10" asChild>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://quntedge.com/${locale}/updates/${post.slug}`)}`} target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.96H5.078z"/></svg>
                  </a>
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-white/50 hover:text-white hover:bg-white/10" asChild>
                  <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://quntedge.com/${locale}/updates/${post.slug}`)}&title=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"/></svg>
                  </a>
                </Button>
              </div>
            </div>
          </footer>
        </article>
      </main>
      <Footer />
    </>
  )
}'''

page_new = '''
function PostHeader({ post }: { post: any }) {
  return (
    <header className="mb-12 sm:mb-16">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/40 mb-6 sm:mb-8 font-mono">
        <time dateTime={post.date}>
          {format(new Date(post.date), 'MMMM d, yyyy')}
        </time>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
          {post.readingTime} min read
        </span>
        <span>•</span>
        <span className="capitalize">{post.type}</span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
        {post.title}
      </h1>

      <p className="text-lg sm:text-xl text-white/60 leading-relaxed max-w-2xl">
        {post.description}
      </p>

      {/* Author */}
      {post.author && (
        <div className="mt-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-white/80">
                {post.author.name[0]}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-white/90">{post.author.name}</div>
            <div className="text-xs text-white/50">{post.author.role}</div>
          </div>
        </div>
      )}
    </header>
  );
}

function PostFooter({ post, locale, t }: { post: any, locale: string, t: any }) {
  return (
    <footer className="mt-16 sm:mt-24 pt-8 sm:pt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
      <Link
        href={`/${locale}/updates`}
        className="group flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        {t('landing.updates.backToUpdates')}
      </Link>

      <div className="flex items-center gap-4">
        <span className="text-sm text-white/40">Share this update</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-white/50 hover:text-white hover:bg-white/10" asChild>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://quntedge.com/${locale}/updates/${post.slug}`)}`} target="_blank" rel="noopener noreferrer">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.96H5.078z"/></svg>
            </a>
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-white/50 hover:text-white hover:bg-white/10" asChild>
            <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://quntedge.com/${locale}/updates/${post.slug}`)}&title=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"/></svg>
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  const post = await getPostBySlug(slug, locale)

  if (!post) {
    notFound()
  }

  const t = await getI18n()
  const Content = (await import(`@/content/${post.slug}.mdx`)).default

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] pt-24 sm:pt-32 pb-16 sm:pb-24">
        {/* Navigation Header */}
        <div className="fixed top-[64px] z-40 w-full border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md">
          <div className="container max-w-3xl py-3 px-4 flex items-center justify-between">
            <Link
              href={`/${locale}/updates`}
              className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('landing.updates.backToUpdates')}
            </Link>
          </div>
        </div>

        <article className="container max-w-3xl px-4 sm:px-6 pt-8 sm:pt-12">
          <PostHeader post={post} />

          {/* Content */}
          <div className="prose prose-invert prose-p:text-white/70 prose-headings:text-white/90 prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-white/90 max-w-none prose-img:rounded-xl prose-img:border prose-img:border-white/10">
            <Content />
          </div>

          <PostFooter post={post} locale={locale} t={t} />
        </article>
      </main>
      <Footer />
    </>
  )
}'''

content = content.replace(page_orig, page_new)

with open(filepath, 'w') as f:
    f.write(content)
