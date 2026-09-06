import type { Metadata } from "next";

import { LibraryView } from "@/components/techpack/library-view";
import { getLibrary } from "@/lib/data/libraries";
import { pageTitle } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getLibrary("collections");
  return { title: pageTitle(content.title) };
}

export default async function Page() {
  const content = await getLibrary("collections");
  return <LibraryView libraryKey="collections" content={content} />;
}
