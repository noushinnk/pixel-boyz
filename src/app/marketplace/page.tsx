import { CollectionGallery } from "@/components/collection";
import { SectionHeading, SiteShell } from "@/components/site";
export default function Marketplace() { return <SiteShell active="Marketplace"><main className="mx-auto min-h-[750px] max-w-7xl px-5 pb-24 pt-40 lg:px-8"><SectionHeading kicker="SECONDARY MARKET / 2.5% FEE" title="Trade the universe." text="Verified listings, offers, and sales powered by the PixelBoyzMarketplace contract. Seller proceeds and fees are calculated on-chain." /><div className="mt-12"><CollectionGallery /></div></main></SiteShell>; }
