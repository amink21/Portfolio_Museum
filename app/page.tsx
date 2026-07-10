import { getMuseumData } from "@/lib/data";
import FloorPlan from "@/components/timeline/FloorPlan";

export const revalidate = 300;

export default async function Home() {
  const data = await getMuseumData();
  return <FloorPlan data={data} />;
}
