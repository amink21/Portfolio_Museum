import { getMuseumData } from "@/lib/data";
import FloorPlan from "@/components/timeline/FloorPlan";

export const revalidate = 300;

export const metadata = {
  title: "The Kadawala Collection — Design Museum",
};

export default async function MuseumPage() {
  const data = await getMuseumData();
  return <FloorPlan data={data} />;
}
