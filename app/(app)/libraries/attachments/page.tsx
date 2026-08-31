import type { Metadata } from "next";

import { LibraryView } from "@/components/techpack/library-view";
import { getLibrary } from "@/lib/data/libraries";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getLibrary("attachments");
  return { title: `${content.title} | Custm.ink Studio` };
}

export default async function Page() {
  const content = await getLibrary("attachments");
  return <LibraryView libraryKey="attachments" content={content} />;
}
