"use client";

import { useEffect, useState } from 'react';
import { Star, Plus, ArrowLeft, Layout } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  getFrontPageItems, 
  setFeaturedPost, 
  addCuratedPost, 
  getAdminPosts,
  type FrontPageItemDto,
  type AdminPostDto
} from '@/lib/adminApiClient';

interface FrontPageManagerProps {
  onNavigate?: (page: string) => void;
  // onLogout?: () => void;
}

export function FrontPageManager({ onNavigate }: FrontPageManagerProps) {
  const router = useRouter();
  const nav = (page: string) =>
    onNavigate ? onNavigate(page) : router.push(`/admin/${page}`);

  const [frontPageItems, setFrontPageItems] = useState<FrontPageItemDto[]>([]);
  const [candidates, setCandidates] = useState<AdminPostDto[]>([]);
  // const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Derived state
  const featuredItemId = frontPageItems.find(i => i.section === 'featured')?.postId;
  const curatedItemIds = frontPageItems
    .filter(i => i.section === 'curated')
    .map(i => i.postId);

  const featuredPost = candidates.find(p => p.id === featuredItemId);
  const curatedPosts = candidates.filter(p => curatedItemIds.includes(p.id));

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // setLoading(true);
      const [fsItems, postsRes] = await Promise.all([
        getFrontPageItems(),
        getAdminPosts({ page: 0, size: 100, status: 'published' }) // Load enough published posts
      ]);
      setFrontPageItems(fsItems);
      setCandidates(postsRes.content);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      // setLoading(false);
    }
  }

  const handleSetFeatured = async (postId: string) => {
    try {
      await setFeaturedPost(postId);
      await loadData(); // Reload to refresh state
    } catch (error) {
      console.error("Failed to set featured:", error);
      alert("Failed to set featured post");
    }
  };

  const handleAddCurated = async (postId: string) => {
    try {
      if (curatedItemIds.includes(postId)) return;
      await addCuratedPost({
        postId,
        position: curatedItemIds.length,
        active: true
      });
      await loadData();
    } catch (error) {
      console.error("Failed to add curated:", error);
      alert("Failed to add curated post");
    }
  };

  // Filter candidates for search
  const filteredCandidates = candidates.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button
              onClick={() => nav('dashboard')}
              className="flex items-center gap-2 meta hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-xl font-medium">Front Page Curation</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Current State */}
        <div>
           <h2 className="text-lg font-medium mb-6 pb-4 border-b border-border flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Current Layout
           </h2>

           {/* Featured */}
           <div className="mb-8">
             <div className="text-sm text-muted-foreground uppercase tracking-wider mb-3">Featured Article</div>
             {featuredPost ? (
               <div className="bg-card border border-foreground p-4">
                 <div className="text-xl font-medium mb-2">{featuredPost.title}</div>
                 <div className="meta text-muted-foreground">{featuredPost.excerpt}</div>
               </div>
             ) : (
               <div className="p-4 border border-dashed border-border text-center text-muted-foreground">
                 No featured post selected
               </div>
             )}
           </div>

           {/* Curated */}
           <div>
             <div className="text-sm text-muted-foreground uppercase tracking-wider mb-3">Curated List</div>
             <div className="space-y-3">
               {curatedPosts.length > 0 ? (
                 curatedPosts.map(p => (
                   <div key={p.id} className="bg-card border border-border p-3 flex justify-between items-center">
                     <span className="font-medium">{p.title}</span>
                     {/* Remove not supported by api client yet, so just show info */}
                   </div>
                 ))
               ) : (
                 <div className="text-muted-foreground italic">No curated posts</div>
               )}
             </div>
           </div>
        </div>

        {/* Right: Selection */}
        <div>
          <h2 className="text-lg font-medium mb-6 pb-4 border-b border-border flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Content
           </h2>
          
          <div className="mb-6">
            <input 
              type="text" 
              placeholder="Search published posts..." 
              className="w-full px-4 py-2 border border-border bg-background"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredCandidates.map(p => (
              <div key={p.id} className="group p-3 border border-border hover:border-foreground transition-colors bg-card">
                <div className="font-medium mb-1">{p.title}</div>
                <div className="flex items-center gap-2 mt-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleSetFeatured(p.id)}
                    disabled={p.id === featuredItemId}
                    className="text-xs flex items-center gap-1 bg-foreground text-background px-3 py-1 disabled:opacity-50"
                  >
                    <Star className="w-3 h-3" />
                    Set Featured
                  </button>
                  <button 
                    onClick={() => handleAddCurated(p.id)}
                    disabled={curatedItemIds.includes(p.id)}
                    className="text-xs flex items-center gap-1 border border-foreground px-3 py-1 hover:bg-muted disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3" />
                    Add to Curated
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
