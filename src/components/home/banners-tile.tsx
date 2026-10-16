import { getBanners } from "@/lib/api";
import { BannerCarousel } from "./banner-carousel";
import { Tile } from "./tile";

export async function BannersTile({ className = "" }: { className?: string }) {
  const banners = await getBanners();
  return (
    <Tile as="div" className={`overflow-hidden ${className}`}>
      <BannerCarousel banners={banners} />
    </Tile>
  );
}
