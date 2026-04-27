import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Fetch a post by ID from the API
async function fetchPostById(id: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/anonymous-feed/posts/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.post || null;
}

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params;
    const post = await fetchPostById(id);
    if (!post) return {};
    return {
        title: 'Anonymous Post on Networkqy',
        description: post.content,
        openGraph: {
            title: 'Anonymous Post on Networkqy',
            description: post.content,
            url: `https://www.networkqy.com/anonymous-feed/${id}`,
            images: [
                {
                    url: 'https://www.networkqy.com/imagetemplate.png',
                    width: 1200,
                    height: 630,
                    alt: 'Networkqy Post Preview',
                },
            ],
            type: 'article',
        },
    };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await fetchPostById(id);
    if (!post) return notFound();
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="max-w-xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-purple-200/50 dark:border-white/20">
                <h1 className="text-2xl font-bold mb-4 text-purple-700 dark:text-purple-300">Anonymous Post</h1>
                <p className="text-gray-900 dark:text-white text-lg mb-4">{post.content}</p>
                {(post.company_name || post.industry) && (
                    <div className="flex gap-4 mb-4">
                        {post.company_name && <span className="text-sm text-gray-600 dark:text-gray-400">🏢 {post.company_name}</span>}
                        {post.industry && <span className="text-sm text-gray-600 dark:text-gray-400">💼 {post.industry}</span>}
                    </div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400">Posted on {new Date(post.created_at).toLocaleString()}</div>
            </div>
        </div>
    );
} 