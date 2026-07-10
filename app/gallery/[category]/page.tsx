import { notFound } from "next/navigation";
import { getMuseumData } from "@/lib/data";
import GalleryClient from "@/components/gallery/GalleryClient";

export const revalidate = 300;

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const data = await getMuseumData();
  const cat = data.categories.find((c) => c.slug === category);
  if (!cat) notFound();
  const pieces = data.pieces
    .filter((p) => p.category === category)
    .sort((a, b) => a.year - b.year || a.catalogNo.localeCompare(b.catalogNo));
  return <GalleryClient category={cat} pieces={pieces} museum={data.museum} />;
}

export async function generateStaticParams() {
  const data = await getMuseumData();
  return data.categories.map((c) => ({ category: c.slug }));
}
