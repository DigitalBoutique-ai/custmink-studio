/**
 * Name-to-component registry for the lucide icons the shell uses.
 *
 * Navigation and metric config live in plain data modules that may be imported
 * on the server, so they name icons instead of importing components directly.
 */

import {
  Archive,
  ClipboardList,
  FileArchive,
  FileImage,
  FileText,
  FolderKanban,
  History,
  Layers3,
  LayoutDashboard,
  PackageCheck,
  Palette,
  Ruler,
  Send,
  Shirt,
  ShoppingBag,
  SwatchBook,
  TableProperties,
  Tags,
  Truck,
  type LucideIcon,
} from "lucide-react";

export const iconRegistry = {
  archive: Archive,
  "clipboard-list": ClipboardList,
  "file-archive": FileArchive,
  "file-image": FileImage,
  "file-text": FileText,
  "folder-kanban": FolderKanban,
  history: History,
  "layers-3": Layers3,
  "layout-dashboard": LayoutDashboard,
  "package-check": PackageCheck,
  palette: Palette,
  ruler: Ruler,
  send: Send,
  shirt: Shirt,
  "shopping-bag": ShoppingBag,
  "swatch-book": SwatchBook,
  "table-properties": TableProperties,
  tags: Tags,
  truck: Truck,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconRegistry;

export function Icon({ name, ...props }: { name: IconName } & React.ComponentProps<LucideIcon>) {
  const Component = iconRegistry[name];
  return <Component {...props} />;
}
