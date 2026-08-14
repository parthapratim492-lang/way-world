import PlaceDetailClient from "@/components/PlaceDetailClient";

export default async function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlaceDetailClient id={id} />;
}
