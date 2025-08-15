export const metadata = { title: 'About • TireScan AI' };

export default function AboutPage() {
  return (
    <div className="prose prose-sm max-w-2xl">
      <h1 className="font-bold text-3xl tracking-tight mb-4">About TireScan AI</h1>
      <p>TireScan AI lets drivers instantly decode sidewall tire information and assess condition using computer vision + LLM reasoning. We then match inventory from nearby registered shops so you can compare availability and pricing fast.</p>
      <p>This MVP uses an in-memory data store and OpenAI vision models. Upcoming releases will add secure shop auth, persistent database, and smarter tread wear heuristics.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">Why it matters</h2>
      <ul>
        <li>Removes guesswork from tire replacements.</li>
        <li>Promotes safety with quick condition feedback.</li>
        <li>Connects local inventory to on-the-go needs.</li>
      </ul>
      <p className="mt-8 text-zinc-600 text-xs">Beta build – not for production diagnostics.</p>
    </div>
  );
}
