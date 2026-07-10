/**
 * Pushes data/seed.json into Neon. Requires DATABASE_URL in .env.local.
 * Run with: npm run db:seed
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { join } from "node:path";

config({ path: join(process.cwd(), ".env.local") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not found in .env.local — add it, then rerun.");
  process.exit(1);
}

const sql = neon(url);
const data = JSON.parse(readFileSync(join(process.cwd(), "data", "seed.json"), "utf8"));

async function main() {
  const schema = readFileSync(join(process.cwd(), "db", "schema.sql"), "utf8");
  for (const stmt of schema.split(";").map((s) => s.trim()).filter(Boolean)) {
    await sql.query(stmt);
  }

  const m = data.museum;
  await sql`
    INSERT INTO museum (id, name, tagline, about, contact)
    VALUES (1, ${m.name}, ${m.tagline}, ${m.about}, ${m.contact})
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, tagline = EXCLUDED.tagline,
      about = EXCLUDED.about, contact = EXCLUDED.contact`;

  for (const c of data.categories) {
    await sql`
      INSERT INTO categories (slug, name, wing, color, color_name, ordinal, blurb)
      VALUES (${c.slug}, ${c.name}, ${c.wing}, ${c.color}, ${c.colorName}, ${c.ordinal}, ${c.blurb})
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, wing = EXCLUDED.wing,
        color = EXCLUDED.color, color_name = EXCLUDED.color_name,
        ordinal = EXCLUDED.ordinal, blurb = EXCLUDED.blurb`;
  }

  for (const p of data.pieces) {
    await sql`
      INSERT INTO pieces (slug, title, category_slug, year, year_is_placeholder, image, catalog_no, description, description_is_placeholder)
      VALUES (${p.slug}, ${p.title}, ${p.category}, ${p.year}, ${p.yearIsPlaceholder}, ${p.image}, ${p.catalogNo}, ${p.description}, ${p.descriptionIsPlaceholder})
      ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, category_slug = EXCLUDED.category_slug,
        year = EXCLUDED.year, year_is_placeholder = EXCLUDED.year_is_placeholder,
        image = EXCLUDED.image, catalog_no = EXCLUDED.catalog_no,
        description = EXCLUDED.description, description_is_placeholder = EXCLUDED.description_is_placeholder`;
  }

  for (const p of data.codeProjects) {
    await sql`
      INSERT INTO code_projects (slug, title, description, tech, github, live, image, featured, ordinal)
      VALUES (${p.slug}, ${p.title}, ${p.description}, ${p.tech}, ${p.github}, ${p.live}, ${p.image}, ${p.featured}, ${p.ordinal})
      ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
        tech = EXCLUDED.tech, github = EXCLUDED.github, live = EXCLUDED.live,
        image = EXCLUDED.image, featured = EXCLUDED.featured, ordinal = EXCLUDED.ordinal`;
  }

  console.log(
    `Seeded ${data.categories.length} categories, ${data.pieces.length} pieces, ${data.codeProjects.length} code projects.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
