import { getMuseumData } from "@/lib/data";
import GalleryClient from "@/components/gallery/GalleryClient";

export const revalidate = 300;

export const metadata = {
  title: "The Collection — Amin Kadawala",
};

export default async function MuseumPage() {
  const data = await getMuseumData();
  return (
    <GalleryClient
      categories={data.categories}
      pieces={data.pieces}
    />
  );
}
