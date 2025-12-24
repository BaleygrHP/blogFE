// Mock gallery data

export interface GalleryImage {
  id: number;
  url: string;
  caption?: string;
  date: string;
  location?: string;
  category: string;
}

export const galleryImages: GalleryImage[] = [
  {
    id: 1,
    url: 'https://res.cloudinary.com/dtav370xx/image/upload/v1766236106/newspaper/photo-1506905925346-21bda4d32df4_h4farw.jpg',
    caption: 'Mountain Morning',
    date: 'December 10, 2025',
    location: 'Swiss Alps',
    category: 'Travel'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    caption: 'Forest Path',
    date: 'December 8, 2025',
    location: 'Black Forest',
    category: 'Nature'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
    caption: 'Coastal Sunset',
    date: 'December 5, 2025',
    location: 'Big Sur',
    category: 'Nature'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800&q=80',
    caption: 'City Lights',
    date: 'December 3, 2025',
    location: 'Tokyo',
    category: 'Urban'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
    caption: 'Winter Lake',
    date: 'December 1, 2025',
    location: 'Lake District',
    category: 'Nature'
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',
    caption: 'Desert Dunes',
    date: 'November 28, 2025',
    location: 'Sahara',
    category: 'Travel'
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    caption: 'Ocean Blues',
    date: 'November 25, 2025',
    location: 'Maldives',
    category: 'Travel'
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
    caption: 'Autumn Trail',
    date: 'November 20, 2025',
    location: 'Vermont',
    category: 'Nature'
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80',
    caption: 'Northern Lights',
    date: 'November 15, 2025',
    location: 'Iceland',
    category: 'Travel'
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&q=80',
    caption: 'Garden Blooms',
    date: 'November 12, 2025',
    location: 'Kyoto',
    category: 'Nature'
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    caption: 'Rocky Summit',
    date: 'November 8, 2025',
    location: 'Dolomites',
    category: 'Travel'
  },
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80',
    caption: 'River Valley',
    date: 'November 5, 2025',
    location: 'New Zealand',
    category: 'Nature'
  },
  {
    id: 13,
    url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
    caption: 'Downtown Streets',
    date: 'November 2, 2025',
    location: 'New York',
    category: 'Urban'
  },
  {
    id: 14,
    url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80',
    caption: 'Beach Sunset',
    date: 'October 28, 2025',
    location: 'Bali',
    category: 'Travel'
  },
  {
    id: 15,
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    caption: 'Mountain Range',
    date: 'October 25, 2025',
    location: 'Patagonia',
    category: 'Nature'
  },
  {
    id: 16,
    url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
    caption: 'City Skyline',
    date: 'October 22, 2025',
    location: 'Singapore',
    category: 'Urban'
  },
  {
    id: 17,
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    caption: 'Alpine Lake',
    date: 'October 18, 2025',
    location: 'Canada',
    category: 'Nature'
  },
  {
    id: 18,
    url: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80',
    caption: 'Coffee Shop',
    date: 'October 15, 2025',
    location: 'Paris',
    category: 'Urban'
  },
  {
    id: 19,
    url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80',
    caption: 'Temple Visit',
    date: 'October 12, 2025',
    location: 'Bangkok',
    category: 'Travel'
  },
  {
    id: 20,
    url: 'https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=800&q=80',
    caption: 'Waterfall',
    date: 'October 8, 2025',
    location: 'Costa Rica',
    category: 'Nature'
  },
  {
    id: 21,
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    caption: 'Festival Night',
    date: 'October 5, 2025',
    location: 'Barcelona',
    category: 'Events'
  },
  {
    id: 22,
    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&q=80',
    caption: 'Concert Hall',
    date: 'October 1, 2025',
    location: 'Vienna',
    category: 'Events'
  },
  {
    id: 23,
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    caption: 'Wedding Day',
    date: 'September 28, 2025',
    location: 'Tuscany',
    category: 'Events'
  },
  {
    id: 24,
    url: 'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=800&q=80',
    caption: 'Birthday Party',
    date: 'September 25, 2025',
    location: 'Home',
    category: 'Events'
  }
];

export function getAllGalleryImages() {
  return galleryImages;
}

export function getGalleryImageById(id: number) {
  return galleryImages.find(img => img.id === id);
}

export function getGalleryImagesByCategory(category: string) {
  return galleryImages.filter(img => img.category === category);
}