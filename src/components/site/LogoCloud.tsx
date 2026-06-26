/**
 * Partner / customer ribbon — official brand wordmarks via Simple Icons CDN.
 * Simple Icons (https://simpleicons.org) serves SVG brand icons; trademarks
 * remain with their respective owners and are used here for nominative
 * "trusted by" attribution.
 */
type Brand = { slug: string; name: string };

const brands: Brand[] = [
  { slug: "aetna", name: "Aetna" },
  { slug: "cigna", name: "Cigna" },
  { slug: "anthem", name: "Anthem" },
  { slug: "cvshealth", name: "CVS Health" },
  { slug: "kaiserpermanente", name: "Kaiser Permanente" },
  { slug: "humana", name: "Humana" },
  { slug: "unitedhealthgroup", name: "UnitedHealth Group" },
  { slug: "optum", name: "Optum" },
];

// White glyphs for dark theme; Simple Icons CDN supports `/slug/{hex}`.
const logoUrl = (slug: string) => `https://cdn.simpleicons.org/${slug}/F1F6F4`;

export default function LogoCloud() {
  return (
    <section
      aria-label="Trusted by leading healthcare companies"
      className="py-12 sm:py-14 border-y border-foreground/5"
    >
      <div className="container-px mx-auto max-w-7xl">
        <p className="text-center eyebrow">// trusted across regulated industries</p>
        <div
          className="mt-8 relative overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
          }}
        >
          <div className="marquee flex items-center gap-14 sm:gap-20 w-max">
            {[...brands, ...brands].map((b, i) => (
              <div
                key={i}
                className="group flex items-center justify-center h-10 sm:h-11 shrink-0"
                title={b.name}
              >
                <img
                  src={logoUrl(b.slug)}
                  alt={`${b.name} logo`}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="h-full w-auto max-w-[160px] object-contain opacity-60 group-hover:opacity-100 transition-[opacity,transform,filter] duration-200 ease-out group-hover:scale-105 group-hover:[filter:drop-shadow(0_0_14px_hsl(48_100%_50%/.35))]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
