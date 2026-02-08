export const alt = "Qunt Edge Update";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const runtime = "nodejs";
export const revalidate = 3600;

export { generateStaticParams, default } from "../../_updates/[slug]/opengraph-image";
