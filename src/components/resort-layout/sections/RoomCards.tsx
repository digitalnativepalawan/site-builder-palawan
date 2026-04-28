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
              className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200"
              style={{
                boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px ${primaryColor}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`;
              }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                {room.imageUrl ? (
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
                  >
                    <span className="text-6xl">🏨</span>
                  </div>
                )}

                {room.recommended && (
                  <div
                    className="absolute top-4 right-4 px-4 py-2 text-xs font-bold text-white rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg transform rotate-3"
                  >
                    Most Popular
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-8 bg-gradient-to-b from-white to-gray-50">
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">{room.name}</h3>

                {room.description && (
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">{room.description}</p>
                )}

                {/* Features */}
                {room.features && room.features.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {room.features.slice(0, 3).map((feature, fIdx) => (
                      <span
                        key={fIdx}
                        className="text-xs px-3 py-2 rounded-full bg-gray-100 text-gray-700 font-medium border border-gray-200"
                      >
                        {feature}
                      </span>
                    ))}
                    {room.features.length > 3 && (
                      <span className="text-xs px-3 py-2 rounded-full bg-gray-100 text-gray-600 font-medium border border-gray-200">
                        +{room.features.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div>
                    <span className="text-3xl font-bold tracking-tight" style={{ color: primaryColor }}>
                      {room.price}
                    </span>
                    {room.price?.includes("/") ? (
                      <span className="text-gray-500 text-sm ml-1">night</span>
                    ) : (
                      <span className="text-gray-500 text-sm ml-1">/ night</span>
                    )}
                  </div>

                  {room.buttonText && (
                    <a
                      href={room.buttonUrl || "#"}
                      className="px-6 py-3 text-sm font-semibold rounded-full transition-all duration-300 hover:scale-105 transform"
                      style={{
                        backgroundColor: primaryColor,
                        color: "white",
                        boxShadow: `0 4px 14px 0 ${primaryColor}40`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 8px 25px 0 ${primaryColor}60, 0 0 30px ${primaryColor}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = `0 4px 14px 0 ${primaryColor}40`;
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
