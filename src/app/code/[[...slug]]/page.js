import connectDB from '../../../lib/mongodb';
import Analysis from '../../../models/Analysis';
import CodeClient from '../CodeClient';

// Helper function to get base URL
const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
    if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
    return process.env.NODE_ENV === 'production'
        ? 'https://learncode.life'
        : 'http://localhost:3000';
};

const getDefaultMetadata = (baseUrl) => {
    return {
        title: 'Code Analysis & Learning Path Generator | LearnCode.life',
        description: 'Paste any code snippet and get a structured learning roadmap with AI-powered explanations.',
        openGraph: {
            title: 'Code Analysis & Learning Path Generator | LearnCode.life',
            description: 'Paste any code snippet and get a structured learning roadmap with AI-powered explanations.',
            url: `${baseUrl}/code`,
            siteName: 'LearnCode.life',
            images: [{ url: `${baseUrl}/logo.png`, width: 1200, height: 630 }],
        },
    };
};

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const id = slug && slug.length > 0 ? slug[0] : null;
    const baseUrl = getBaseUrl();

    if (!id || id === 'code') {
        return getDefaultMetadata(baseUrl);
    }

    try {
        await connectDB();
        const analysis = await Analysis.findById(id).lean();
        if (!analysis) return getDefaultMetadata(baseUrl);

        const title = `${analysis.title || 'Code Analysis'}${analysis.language ? ` - ${analysis.language}` : ''}`;
        const description = `Learn ${analysis.language || 'programming'} concepts with this personalized learning path for ${analysis.title}.`;

        return {
            title,
            description,
            openGraph: {
                title: `${title} | LearnCode.life`,
                description,
                url: `${baseUrl}/code/${id}`,
                images: [{ url: `${baseUrl}/logo.png`, width: 1200, height: 630 }],
            },
        };
    } catch (error) {
        return getDefaultMetadata(baseUrl);
    }
}

export default function UnifiedCodePage() {
    return null;
}
