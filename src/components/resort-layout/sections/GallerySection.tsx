import { useState } from "react";
import { SectionProps, GalleryImage } from "./types";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function GallerySection({ data, device, settings }: SectionProps) {
  const isMobile = device === "mobile";
  const images: GalleryImage[] = data.images || [];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const headingFont = settings?.typography.headingFont || "'Space Grotesk', sans-serif";

  if (!images.length) return null;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  // Masonry layout for desktop, simple grid for mobile
  const masonryLayout = !isMobile && images.length >= 4;

  return (
    <>
      <section className="py-16 md:py-24 px-6 bg-gray-50">
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

          {masonryLayout ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
              {/* Featured large image */}
              <div className="col-span-2 row-span-2 overflow-hidden rounded-2xl">
                <img
                  src={images[0]?.url}
                  alt={images[0]?.alt || "Gallery"}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                  onClick={() => openLightbox(0)}
                />
              </div>

              {/* Remaining images */}
              {images.slice(1, 7).map((img, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden rounded-2xl"
                  style={{ height: idx % 2 === 0 ? "200px" : "250px" }}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `Gallery ${idx + 2}`}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                    onClick={() => openLightbox(idx + 1)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)",
              }}
            >
              {images.slice(0, 9).map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square overflow-hidden rounded-xl cursor-pointer group"
                  onClick={() => openLightbox(idx)}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `Gallery ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          )}

          {!masonryLayout && images.length > 9 && (
            <div className="text-center mt-8">
              <button
                className="px-6 py-2 text-sm font-semibold rounded-full border transition-all hover:shadow-md"
                style={{ borderColor: settings?.colors.primary, color: settings?.colors.primary }}
              >
                View All Photos
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>

          <button
            className="absolute left-4 p-2 text-white/70 hover:text-white transition"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            className="absolute right-4 p-2 text-white/70 hover:text-white transition"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="max-w-5xl max-h-[90vh] px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[currentIndex]?.url}
              alt=""
              className="max-w-full max-h-[85vh] object-contain"
            />
            {images[currentIndex]?.caption && (
              <p className="text-center text-white/70 text-sm mt-4">{images[currentIndex].caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
