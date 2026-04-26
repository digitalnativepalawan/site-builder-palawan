import { SectionProps } from "./types";
import { Wifi, Waves, UtensilsCrossed, Sun, Car, Heart, Coffee, Sparkles } from "lucide-react";

// Icon mapping for common service types
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  beach: Waves,
  pool: Waves,
  restaurant: UtensilsCrossed,
  bar: Coffee,
  spa: Sparkles,
  parking: Car,
  breakfast: Sun,
  concierge: Heart,
};

export function ServicesGrid({ data, device, settings }: SectionProps) {
  const isMobile = device === "mobile";
  const services = data.services || data.items || [];
  const columns = data.columns || (isMobile ? 2 : services.length === 4 ? 4 : 3);
  const headingFont = settings?.typography.headingFont || "'Space Grotesk', sans-serif";
  const primaryColor = settings?.colors.primary || "#0EA5E9";

  if (!services.length) return null;

  return (
    <section className="py-16 md:py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {data.headline && (
          <div className="text-center mb-12 md:mb-16">
            <h2
              className="text-2xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: headingFont, color: settings?.colors.heading || "#1e293b" }}
            >
              {data.headline}
            </h2>
            {data.subheadline && (
              <p className="text-gray-600 max-w-2xl mx-auto">{data.subheadline}</p>
            )}
          </div>
        )}

        {/* Services Grid */}
        <div
          className="grid gap-6 md:gap-8"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {services.map((service: any, idx: number) => {
            const Icon = iconMap[service.icon?.toLowerCase()] || Sparkles;
            const hasImage = !!service.imageUrl;

            return (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl bg-gray-50 hover:bg-white transition-all duration-300 hover:shadow-xl"
              >
                {hasImage ? (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <div
                      className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: primaryColor }} />
                    </div>
                    <h3
                      className="text-lg md:text-xl font-semibold mb-2"
                      style={{ fontFamily: headingFont }}
                    >
                      {service.title}
                    </h3>
                    {service.description && (
                      <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                    )}
                  </div>
                )}

                {hasImage && (
                  <div className="p-5">
                    <h3 className="text-lg md:text-xl font-semibold mb-1">{service.title}</h3>
                    {service.description && (
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
