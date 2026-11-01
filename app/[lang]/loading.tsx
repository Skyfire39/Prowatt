import { PageSkeleton } from "@/components/skeleton";

/** Affiché tout de suite pendant un changement de page, le temps que le contenu arrive. */
export default function Loading() {
  return <PageSkeleton />;
}
