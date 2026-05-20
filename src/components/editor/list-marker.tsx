type ListMarkerProps = {
  listStyle: "unordered" | "ordered";
  index: number;
};

export function ListMarker({ listStyle, index }: ListMarkerProps) {
  return (
    <span
      className="mr-2.5 flex w-6 shrink-0 justify-end text-slate-400"
      aria-hidden
    >
      {listStyle === "ordered" ? (
        <span className="text-xs font-medium leading-relaxed tabular-nums">
          {index + 1}.
        </span>
      ) : (
        <span className="mt-[6px] text-[8px] leading-none">●</span>
      )}
    </span>
  );
}
