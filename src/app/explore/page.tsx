import { CollectionGallery } from "@/components/collection";
import { DashboardShell, SectionHeading } from "@/components/site";

export default function Explore() {
  return <DashboardShell active="Collection"><main className="dashboard-main"><SectionHeading kicker="COLLECTION / 10,000 ITEMS" title="Find your signal." text="Discover characters, rare traits, and evolving levels across the Pixel Boyz universe." /><div className="mt-10"><CollectionGallery /></div></main></DashboardShell>;
}
