// Provide dummy Contentful env so importing src/lib/contentful.ts in unit tests
// doesn't hit its fail-fast module-init throw. Real Contentful calls are mocked
// per-test, so these placeholders never reach the network.
process.env.CONTENTFUL_SPACE_ID ||= "test-space";
process.env.CONTENTFUL_DELIVERY_TOKEN ||= "test-delivery-token";
