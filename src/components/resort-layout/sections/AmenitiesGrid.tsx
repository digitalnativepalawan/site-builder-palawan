import { SectionProps } from "./types";
import { Check } from "lucide-react";

export function AmenitiesGrid({ data, device, settings }: SectionProps) {
  const isMobile = device === "mobile";
  const items = data.items || data.amenities || [];
  const headingFont = settings?.typography.headingFont || "'Space Grotesk', sans-serif";

  if (!items.length) return null;

  const columns = isMobile ? 2 : data.listLayout === "two-col" ? 2 : 4;

  return (
    <section className="py-16 md:py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {data.headline && (
          <div className="text-center mb-12">
            <h2
              className="text-2xl md:text-4xl font-bold"
              style={{ fontFamily: headingFont, color: settings?.colors.heading || "#1e293b" }}
            >
              {data.headline}
            </h2>
          </div>
        )}

        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {items.map((item: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <Check className="w-5 h-5 flex-shrink-0" style={{ color: settings?.colors.primary || "#0EA5E9" }} />
              <span className="text-gray-700 text-sm md:text-base">
                {typeof item === "string" ? item : item.text || item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
