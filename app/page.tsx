import { getMuseumData } from "@/lib/data";
import Landing from "@/components/landing/Landing";

export const revalidate = 300;

export default async function Home() {
  const data = await getMuseumData();
  return <Landing data={data} />;
}
