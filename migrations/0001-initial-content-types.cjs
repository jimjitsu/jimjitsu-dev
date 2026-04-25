/**
 * Migration 0001 — Initial content types.
 *
 * Defines:
 *   - author        (a person who writes content)
 *   - project       (portfolio case study)
 *   - blogPost      (long-form article)
 *   - siteSettings  (singleton — global site config)
 *
 * All long-form body fields are Long text (markdown), per spec §7.
 *
 * Run via:  pnpm contentful:migrate:initial
 *
 * @param {import('contentful-migration').default} migration
 */
module.exports = function (migration) {
  // ---------- Author ----------
  const author = migration
    .createContentType("author")
    .name("Author")
    .description("A person who writes content on the site.")
    .displayField("name");

  author.createField("name").name("Name").type("Symbol").required(true);

  author
    .createField("bio")
    .name("Bio")
    .type("Text") // Long text → markdown
    .required(false);

  author.createField("avatar").name("Avatar").type("Link").linkType("Asset").required(false);

  author
    .createField("socialLinks")
    .name("Social links")
    .type("Object") // JSON — flexible shape, e.g. { github, linkedin, x }
    .required(false);

  // ---------- Project ----------
  const project = migration
    .createContentType("project")
    .name("Project")
    .description("A portfolio project / case study.")
    .displayField("title");

  project.createField("title").name("Title").type("Symbol").required(true);

  project
    .createField("slug")
    .name("Slug")
    .type("Symbol")
    .required(true)
    .validations([{ unique: true }, { regexp: { pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" } }]);

  project
    .createField("summary")
    .name("Summary")
    .type("Symbol")
    .required(true)
    .validations([{ size: { max: 200 } }]);

  project
    .createField("coverImage")
    .name("Cover image")
    .type("Link")
    .linkType("Asset")
    .required(true);

  project
    .createField("gallery")
    .name("Gallery")
    .type("Array")
    .items({ type: "Link", linkType: "Asset" })
    .required(false);

  project.createField("role").name("Role").type("Symbol").required(false);

  project
    .createField("technologies")
    .name("Technologies")
    .type("Array")
    .items({ type: "Symbol" })
    .required(false);

  project.createField("liveUrl").name("Live URL").type("Symbol").required(false);

  project.createField("repoUrl").name("Repo URL").type("Symbol").required(false);

  project
    .createField("body")
    .name("Body (markdown)")
    .type("Text") // Long text → markdown editor in Contentful
    .required(false);

  project.createField("featured").name("Featured").type("Boolean").required(false);

  project.createField("publishDate").name("Publish date").type("Date").required(false);

  project
    .createField("order")
    .name("Sort order")
    .type("Integer")
    .required(false);

  // Set the markdown editor for the body field in the Contentful UI.
  project.changeFieldControl("body", "builtin", "markdown");

  // ---------- BlogPost ----------
  const blogPost = migration
    .createContentType("blogPost")
    .name("Blog post")
    .description("A long-form blog post.")
    .displayField("title");

  blogPost.createField("title").name("Title").type("Symbol").required(true);

  blogPost
    .createField("slug")
    .name("Slug")
    .type("Symbol")
    .required(true)
    .validations([{ unique: true }, { regexp: { pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" } }]);

  blogPost
    .createField("excerpt")
    .name("Excerpt")
    .type("Symbol")
    .required(false)
    .validations([{ size: { max: 240 } }]);

  blogPost
    .createField("coverImage")
    .name("Cover image")
    .type("Link")
    .linkType("Asset")
    .required(false);

  blogPost
    .createField("body")
    .name("Body (markdown)")
    .type("Text")
    .required(true);

  blogPost
    .createField("tags")
    .name("Tags")
    .type("Array")
    .items({ type: "Symbol" })
    .required(false);

  blogPost.createField("publishDate").name("Publish date").type("Date").required(true);

  blogPost
    .createField("author")
    .name("Author")
    .type("Link")
    .linkType("Entry")
    .validations([{ linkContentType: ["author"] }])
    .required(false);

  blogPost
    .createField("canonicalUrl")
    .name("Canonical URL")
    .type("Symbol")
    .required(false);

  blogPost.createField("featured").name("Featured").type("Boolean").required(false);

  blogPost.changeFieldControl("body", "builtin", "markdown");

  // ---------- SiteSettings (singleton) ----------
  // Convention: there should only ever be ONE entry of this type. Authors
  // create it manually after the migration runs.
  const siteSettings = migration
    .createContentType("siteSettings")
    .name("Site settings")
    .description("Global site configuration (singleton — only create one entry).")
    .displayField("siteTitle");

  siteSettings.createField("siteTitle").name("Site title").type("Symbol").required(true);

  siteSettings
    .createField("siteDescription")
    .name("Site description")
    .type("Symbol")
    .required(true)
    .validations([{ size: { max: 240 } }]);

  siteSettings
    .createField("ogImage")
    .name("OG image (default)")
    .type("Link")
    .linkType("Asset")
    .required(false);

  siteSettings
    .createField("navLinks")
    .name("Nav links")
    .type("Object") // JSON: [{ label, href }]
    .required(false);

  siteSettings
    .createField("footerLinks")
    .name("Footer links")
    .type("Object")
    .required(false);

  siteSettings
    .createField("socialLinks")
    .name("Social links")
    .type("Object") // JSON: { github, linkedin, x, ... }
    .required(false);
};
