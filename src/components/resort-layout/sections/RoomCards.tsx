import { SectionProps, RoomData } from "./types";

export function RoomCards({ data, device, settings }: SectionProps) {
  const isMobile = device === "mobile";
  const rooms: RoomData[] = data.plans || data.rooms || [];
  const primaryColor = settings?.colors.primary || "#0EA5E9";
  const headingFont = settings?.typography.headingFont || "'Space Grotesk', sans-serif";

  if (!rooms.length) return null;

  const columns = isMobile ? 1 : rooms.length === 1 ? 1 : rooms.length === 2 ? 2 : 3;

  return (
    <section className="py-16 md:py-24 px-6 bg-gray-50">
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

        {/* Rooms Grid */}
        <div
          className="grid gap-6 md:gap-8"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            maxWidth: columns === 1 ? "600px" : "none",
            margin: columns === 1 ? "0 auto" : "0",
          }}
        >
          {rooms.map((room, idx) => (
            <div
              key={idx}
              className={`group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                room.recommended ? "ring-2 ring-offset-2" : ""
              }`}
              style={{ ringColor: room.recommended ? primaryColor : undefined }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                {room.imageUrl ? (
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}10` }}
                  >
                    <span className="text-6xl">🏨</span>
                  </div>
                )}

                {room.recommended && (
                  <div
                    className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold text-white rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Most Popular
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl md:text-2xl font-bold mb-1">{room.name}</h3>

                {room.description && (
                  <p className="text-gray-500 text-sm mb-4">{room.description}</p>
                )}

                {/* Features */}
                {room.features && room.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.features.slice(0, 3).map((feature, fIdx) => (
                      <span
                        key={fIdx}
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                      >
                        {feature}
                      </span>
                    ))}
                    {room.features.length > 3 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                        +{room.features.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                      {room.price}
                    </span>
                    {room.price?.includes("/") ? (
                      <span className="text-gray-500 text-sm"> night</span>
                    ) : (
                      <span className="text-gray-500 text-sm"> / night</span>
                    )}
                  </div>

                  {room.buttonText && (
                    <a
                      href={room.buttonUrl || "#"}
                      className="px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 hover:shadow-md"
                      style={{
                        backgroundColor: primaryColor,
                        color: "white",
                      }}
                    >
                      {room.buttonText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
