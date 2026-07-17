import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/** Exits Draft Mode and returns to the published site. */
export async function GET() {
  (await draftMode()).disable();
  redirect("/");
}
