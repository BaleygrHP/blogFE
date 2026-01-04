import { Twitter, Linkedin, Github, Rss } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="uppercase tracking-wide mb-4">Sections</h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li><a href="#" className="hover:text-white">Technology</a></li>
              <li><a href="#" className="hover:text-white">Lifestyle</a></li>
              <li><a href="#" className="hover:text-white">Travel</a></li>
              <li><a href="#" className="hover:text-white">Opinion</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="uppercase tracking-wide mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li><a href="#" className="hover:text-white">About Me</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Newsletter</a></li>
              <li><a href="#" className="hover:text-white">RSS Feed</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="uppercase tracking-wide mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Use</a></li>
              <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="uppercase tracking-wide mb-4">Follow</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-neutral-300 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-neutral-300 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-neutral-300 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-neutral-300 transition-colors">
                <Rss className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 pt-8 text-center text-sm text-neutral-400">
          <p>© 2025 The Daily Chronicle. All rights reserved.</p>
          <p className="mt-2 italic">&quot;All the News That Matters to Me&quot;</p>
        </div>
      </div>
    </footer>
  );
}
