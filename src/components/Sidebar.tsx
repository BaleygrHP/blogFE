import { TrendingUp, Mail } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="space-y-8">
      {/* Trending Topics */}
      <section className="border-2 border-black p-4 bg-white">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-black">
          <TrendingUp className="w-5 h-5" />
          <h3 className="uppercase tracking-wide">Trending Now</h3>
        </div>
        <ol className="space-y-3">
          {[
            'The Evolution of Web Design',
            'Coffee Culture Around the World',
            'Best Productivity Apps of 2025',
            'Photography Tips for Beginners',
            'Mental Health in Tech Industry'
          ].map((topic, index) => (
            <li key={index} className="border-b border-neutral-300 pb-2 last:border-0">
              <a href="#" className="hover:underline flex gap-3">
                <span className="text-2xl">{index + 1}.</span>
                <span>{topic}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      {/* Newsletter */}
      <section className="border-2 border-black p-4 bg-black text-white">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5" />
          <h3 className="uppercase tracking-wide">Newsletter</h3>
        </div>
        <p className="mb-4 text-sm">
          Get the latest stories delivered to your inbox every week.
        </p>
        <input 
          type="email" 
          placeholder="Your email address"
          className="w-full px-3 py-2 mb-3 text-black border border-white"
        />
        <button className="w-full bg-white text-black py-2 uppercase tracking-wide hover:bg-neutral-200 transition-colors">
          Subscribe
        </button>
      </section>

      {/* About */}
      <section className="border-2 border-black p-4 bg-neutral-100">
        <h3 className="uppercase tracking-wide mb-3 pb-2 border-b-2 border-black">
          About This Blog
        </h3>
        <p className="text-sm leading-relaxed">
          The Daily Chronicle is a personal exploration of technology, lifestyle, and culture. 
          Join me as I document insights, experiences, and perspectives on the modern world.
        </p>
      </section>

      {/* Archives */}
      <section className="border-2 border-black p-4 bg-white">
        <h3 className="uppercase tracking-wide mb-3 pb-2 border-b-2 border-black">
          Archives
        </h3>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:underline">December 2025</a></li>
          <li><a href="#" className="hover:underline">November 2025</a></li>
          <li><a href="#" className="hover:underline">October 2025</a></li>
          <li><a href="#" className="hover:underline">September 2025</a></li>
          <li><a href="#" className="hover:underline">View All →</a></li>
        </ul>
      </section>
    </aside>
  );
}
