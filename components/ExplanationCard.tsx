export default function ExplanationCard({ text }: { text: string }) {
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  return (
    <div className="glass-panel !rounded-xl p-6 border-l-4 border-l-green-500">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💡</span>
        <h3 className="text-xl font-bold text-text-main">Explanation</h3>
      </div>
      <div className="prose prose-lg max-w-none text-text-muted leading-relaxed">
        {text.split('\n').map((paragraph, index) => (
          paragraph.trim() && (
            <p
              key={index}
              className="mb-4 last:mb-0 text-text-main/80"
              dangerouslySetInnerHTML={{ __html: formatText(paragraph) }}
            />
          )
        ))}
      </div>
    </div>
  );
}