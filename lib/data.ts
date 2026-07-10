import "server-only";
import type { Category, CodeProject, Museum, MuseumData, Piece } from "./types";
import seed from "@/data/seed.json";

const seedData = seed as unknown as MuseumData;

/**
 * Returns all museum content. Reads Neon when DATABASE_URL is set,
 * otherwise falls back to the bundled seed.json so the site works
 * before the database exists.
 */
export async function getMuseumData(): Promise<MuseumData> {
  if (!process.env.DATABASE_URL) return seedData;
  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL);
    const [museumRows, categoryRows, pieceRows, codeRows] = await Promise.all([
      sql`SELECT name, tagline, about, contact FROM museum WHERE id = 1`,
      sql`SELECT slug, name, wing, color, color_name, ordinal, blurb FROM categories ORDER BY ordinal`,
      sql`SELECT slug, title, category_slug, year, year_is_placeholder, image, catalog_no, description, description_is_placeholder FROM pieces ORDER BY year, catalog_no`,
      sql`SELECT slug, title, description, tech, github, live, appstore, image, featured, ordinal FROM code_projects ORDER BY ordinal`,
    ]);
    if (categoryRows.length === 0 || pieceRows.length === 0) return seedData;
    const museum: Museum = (museumRows[0] as Museum | undefined) ?? seedData.museum;
    const categories: Category[] = categoryRows.map((r) => ({
      slug: r.slug,
      name: r.name,
      wing: r.wing,
      color: r.color,
      colorName: r.color_name,
      ordinal: r.ordinal,
      blurb: r.blurb,
    }));
    const pieces: Piece[] = pieceRows.map((r) => ({
      slug: r.slug,
      title: r.title,
      category: r.category_slug,
      year: r.year,
      yearIsPlaceholder: r.year_is_placeholder,
      image: r.image,
      catalogNo: r.catalog_no,
      description: r.description,
      descriptionIsPlaceholder: r.description_is_placeholder,
    }));
    const codeProjects: CodeProject[] =
      codeRows.length > 0
        ? codeRows.map((r) => ({
            slug: r.slug,
            title: r.title,
            description: r.description,
            tech: r.tech,
            github: r.github,
            live: r.live,
            appstore: r.appstore,
            image: r.image,
            featured: r.featured,
            ordinal: r.ordinal,
          }))
        : seedData.codeProjects;
    return { museum, categories, pieces, codeProjects };
  } catch (err) {
    console.error("Neon query failed, serving seed data:", err);
    return seedData;
  }
}
