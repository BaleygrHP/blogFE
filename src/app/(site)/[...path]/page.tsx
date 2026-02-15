import { FrontPage } from "@/app/(site)/components/FrontPage";
import { EditorialPage } from "@/app/(site)/components/EditorialPage";
import { NotesPage } from "@/app/(site)/components/NotesPage";
import { DiaryPage } from "@/app/(site)/components/DiaryPage";
import { GalleryPage } from "@/app/(site)/components/GalleryPage";
import { ArchivePage } from "@/app/(site)/components/ArchivePage";
import { AboutPage } from "@/app/(site)/components/AboutPage";
import { ArticlePage } from "@/app/(site)/components/ArticlePage";

type Props = {
  params: Promise<{ path?: string[] }>;
};

export default async function SiteCatchAllPage({ params }: Props) {
  const { path = [] } = await params;
  const [seg1] = path;

  // Defensive: if for some reason seg1 is empty, show front page.
  let content = <FrontPage />;

  if (seg1 === "editorial") content = <EditorialPage />;
  else if (seg1 === "notes") content = <NotesPage />;
  else if (seg1 === "diary") content = <DiaryPage />;
  else if (seg1 === "gallery") content = <GalleryPage />;
  else if (seg1 === "archive") content = <ArchivePage />;
  else if (seg1 === "about") content = <AboutPage />;
  else if (seg1) content = <ArticlePage slug={seg1} />;

  return content;
}
