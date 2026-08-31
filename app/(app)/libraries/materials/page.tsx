import type { Metadata } from "next";

import { LibraryView } from "@/components/techpack/library-view";
import { getLibrary } from "@/lib/data/libraries";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getLibrary("materials");
  return { title: `${content.title} | Custm.ink Studio` };
}

export default async function Page() {
  const content = await getLibrary("materials");
  return <LibraryView libraryKey="materials" content={content} />;
}
