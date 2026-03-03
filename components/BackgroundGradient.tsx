'use client';

export default function BackgroundGradient() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
            {/* Animated gradient blobs */}
            <div
                className="absolute w-[500px] h-[500px] rounded-full blur-[80px] animate-first"
                style={{
                    background: 'radial-gradient(circle at center, #4F46E5 0%, transparent 70%)',
                    top: '10%',
                    left: '15%',
                    opacity: 0.25,
                }}
            />
            <div
                className="absolute w-[400px] h-[400px] rounded-full blur-[80px] animate-second"
                style={{
                    background: 'radial-gradient(circle at center, #3B82F6 0%, transparent 70%)',
                    top: '40%',
                    right: '10%',
                    opacity: 0.2,
                }}
            />
            <div
                className="absolute w-[600px] h-[600px] rounded-full blur-[100px] animate-third"
                style={{
                    background: 'radial-gradient(circle at center, #8B5CF6 0%, transparent 70%)',
                    bottom: '5%',
                    left: '30%',
                    opacity: 0.2,
                }}
            />
            <div
                className="absolute w-[350px] h-[350px] rounded-full blur-[80px] animate-fourth"
                style={{
                    background: 'radial-gradient(circle at center, #06B6D4 0%, transparent 70%)',
                    top: '60%',
                    left: '5%',
                    opacity: 0.2,
                }}
            />
            <div
                className="absolute w-[450px] h-[450px] rounded-full blur-[90px] animate-fifth"
                style={{
                    background: 'radial-gradient(circle at center, #EC4899 0%, transparent 70%)',
                    top: '5%',
                    right: '25%',
                    opacity: 0.15,
                }}
            />
        </div>
    );
}
