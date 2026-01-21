import { Login } from "@/app/admin/components/Login";
import { Dashboard } from "@/app/admin/components/Dashboard";
import { PostsList } from "@/app/admin/components/PostsList";
import { PostEditor } from "@/app/admin/components/PostEditor";
import { GalleryManager } from "@/app/admin/components/GalleryManager";
import { CategoryManager } from "@/app/admin/components/CategoryManager";

type Props = {
  params: { path?: string[] };
};

export default function AdminCatchAllPage({ params }: Props) {
  const path = params.path ?? [];
  const [seg1, seg2] = path;

  // /admin/login
  if (seg1 === "login") return <Login />;

  // /admin or /admin/dashboard
  if (!seg1 || seg1 === "dashboard") return <Dashboard />;

  // /admin/posts
  if (seg1 === "posts" && !seg2) return <PostsList />;

  // /admin/posts/new
  if (seg1 === "posts" && seg2 === "new") {
    return <PostEditor mode="create" postId={null} />;
  }

  // /admin/posts/:id
  if (seg1 === "posts" && seg2) {
    return <PostEditor mode="edit" postId={seg2} />;
  }

  // /admin/gallery
  if (seg1 === "gallery") return <GalleryManager />;

  // /admin/categories
  if (seg1 === "categories") return <CategoryManager />;

  return <div style={{ padding: 24 }}>Admin page not found.</div>;
}
