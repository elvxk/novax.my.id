export default function ParamTable({ params }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink/15 my-3">
      <table className="w-full text-left text-xs">
        <thead className="bg-cream/60 border-b border-ink/10">
          <tr>
            <th className="py-2 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">Parameter</th>
            <th className="py-2 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">Type</th>
            <th className="py-2 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">Required</th>
            <th className="py-2 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/8 bg-parchment">
          {params.map((p) => (
            <tr key={p.name}>
              <td className="py-2.5 px-3 font-mono font-bold text-ink">{p.name}</td>
              <td className="py-2.5 px-3 text-ink/60 font-mono text-[11px]">{p.type}</td>
              <td className="py-2.5 px-3">
                {p.required ? (
                  <span className="text-[10px] font-black uppercase text-red-600 bg-red-100/60 px-2 py-0.5 rounded-full border border-red-200">
                    Yes
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-ink/40">Optional</span>
                )}
              </td>
              <td className="py-2.5 px-3 text-ink/80 font-medium leading-relaxed">{p.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
