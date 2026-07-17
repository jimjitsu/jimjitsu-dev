/**
 * Migration 0002 — Add profile fields to siteSettings.
 *
 * Adds heroTitle, heroBio, sidebarBio, skills (JSON), and attributes (JSON)
 * so editorial content previously hard-coded in page.tsx and sidebar.tsx
 * can be managed in Contentful.
 *
 * Run via:
 *   node scripts/run-migration.cjs migrations/0002-site-settings-profile-fields.cjs
 *
 * @param {import('contentful-migration').default} migration
 */
module.exports = function (migration) {
  const siteSettings = migration.editContentType("siteSettings");

  siteSettings.createField("heroTitle").name("Hero title").type("Symbol").required(false);

  siteSettings.createField("heroBio").name("Hero bio").type("Text").required(false);

  siteSettings.createField("sidebarBio").name("Sidebar bio").type("Symbol").required(false);

  // JSON shape: Array<{ label: string; items: string[] }>
  siteSettings.createField("skills").name("Skills").type("Object").required(false);

  // JSON shape: string[]
  siteSettings.createField("attributes").name("Attributes").type("Object").required(false);
};
