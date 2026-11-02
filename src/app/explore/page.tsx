import { CollectionGallery } from "@/components/collection";
import { SectionHeading, SiteShell } from "@/components/site";

export default function Explore() {
  return <SiteShell active="Explore"><main className="mx-auto min-h-[750px] max-w-7xl px-5 pb-24 pt-40 lg:px-8"><SectionHeading kicker="THE COLLECTION" title="Find your signal." text="Search, filter, and inspect every character through the configured Cloudflare R2 gateway and verified ownership index." /><div className="mt-12"><CollectionGallery /></div></main></SiteShell>;
}
