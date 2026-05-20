export const rooms: Room[] = [
  {
    id: 'R001', name: 'The Zenith Studio', location: 'Jakarta Selatan', category: 'Studio Foto', rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80',
    amenities: ['Ultra Wi-Fi', 'AC Central', 'Projector'],
    description: 'Studio foto profesional dengan backdrop putih.',
    pricing: { harian: { label: 'Full day', price: 200000 }, bulanan: { label: '30 hari', price: 5000000 }, tahunan: { label: 'Annual', price: 50000000 } }
  },
  {
    id: 'R002', name: 'Nexus Boardroom', location: 'SCBD, Jakarta', category: 'Boardroom', rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    amenities: ['WiFi', 'AC', 'Projector'],
    description: 'Ruang rapat premium kapasitas 12 orang.',
    pricing: { harian: { label: 'Full day', price: 200000 }, bulanan: { label: '30 hari', price: 5000000 }, tahunan: { label: 'Annual', price: 50000000 } }
  },
  {
    id: 'R003', name: 'The Hub Cowork', location: 'Kemang, Jakarta', category: 'Coworking', rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80',
    amenities: ['Wi-Fi', 'AC'],
    description: 'Coworking space modern buat startup.',
    pricing: { harian: { label: 'Full day', price: 200000 }, bulanan: { label: '30 hari', price: 5000000 }, tahunan: { label: 'Annual', price: 50000000 } }
  },
  {
    id: 'R004', name: 'Elite Boardroom', location: 'Sudirman, Jakarta', category: 'Boardroom', rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80',
    amenities: ['WiFi', 'AC', 'Pantry'],
    description: 'Ruang eksekutif untuk meeting penting.',
    pricing: { harian: { label: 'Full day', price: 200000 }, bulanan: { label: '30 hari', price: 5000000 }, tahunan: { label: 'Annual', price: 50000000 } }
  },
  {
    id: 'R005', name: 'Creative Loft', location: 'Menteng, Jakarta', category: 'Studio Foto', rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80',
    amenities: ['WiFi', 'AC'],
    description: 'Studio industrial untuk konten kreatif.',
    pricing: { harian: { label: 'Full day', price: 200000 }, bulanan: { label: '30 hari', price: 5000000 }, tahunan: { label: 'Annual', price: 50000000 } }
  },
  {
    id: 'R006', name: 'Meeting Box A', location: 'Kuningan, Jakarta', category: 'Meeting Room', rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&q=80',
    amenities: ['WiFi', 'TV'],
    description: 'Ruang meeting kecil untuk 4-6 orang.',
    pricing: { harian: { label: 'Full day', price: 150000 }, bulanan: { label: '30 hari', price: 3000000 }, tahunan: { label: 'Annual', price: 30000000 } }
  },
  {
    id: 'R007', name: 'Cowork Space B', location: 'Tebet, Jakarta', category: 'Coworking', rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&q=80',
    amenities: ['WiFi', 'Coffee'],
    description: 'Area santai buat ngerjain tugas.',
    pricing: { harian: { label: 'Full day', price: 100000 }, bulanan: { label: '30 hari', price: 2000000 }, tahunan: { label: 'Annual', price: 20000000 } }
  },
  {
    id: 'R008', name: 'Main Hall Studio', location: 'Grogol, Jakarta', category: 'Studio Foto', rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&q=80',
    amenities: ['WiFi', 'Lights'],
    description: 'Studio luas untuk foto group.',
    pricing: { harian: { label: 'Full day', price: 300000 }, bulanan: { label: '30 hari', price: 6000000 }, tahunan: { label: 'Annual', price: 60000000 } }
  },
  {
    id: 'R009', name: 'Strategy Room', location: 'Senayan, Jakarta', category: 'Boardroom', rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=600&q=80',
    amenities: ['WiFi', 'Projector'],
    description: 'Ruang meeting dengan teknologi canggih.',
    pricing: { harian: { label: 'Full day', price: 250000 }, bulanan: { label: '30 hari', price: 5500000 }, tahunan: { label: 'Annual', price: 55000000 } }
  },
  {
    id: 'R010', name: 'Meeting Box B', location: 'Pluit, Jakarta', category: 'Meeting Room', rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c594fdcc538d?w=600&q=80',
    amenities: ['WiFi', 'AC'],
    description: 'Ruang meeting efisien harga terjangkau.',
    pricing: { harian: { label: 'Full day', price: 120000 }, bulanan: { label: '30 hari', price: 2500000 }, tahunan: { label: 'Annual', price: 25000000 } }
  },
  {
    id: 'R011', name: 'Pod Workspace', location: 'Cilandak, Jakarta', category: 'Coworking', rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80',
    amenities: ['WiFi', 'AC'],
    description: 'Workspace tenang untuk fokus kerja.',
    pricing: { harian: { label: 'Full day', price: 150000 }, bulanan: { label: '30 hari', price: 3000000 }, tahunan: { label: 'Annual', price: 30000000 } }
  },
  {
    id: 'R012', name: 'Minimalist Studio', location: 'Pondok Indah, Jakarta', category: 'Studio Foto', rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-06fd8d3e81cc?w=600&q=80',
    amenities: ['WiFi', 'Lights'],
    description: 'Studio minimalis untuk foto fashion.',
    pricing: { harian: { label: 'Full day', price: 220000 }, bulanan: { label: '30 hari', price: 4500000 }, tahunan: { label: 'Annual', price: 45000000 } }
  },
  {
    id: 'R013', name: 'Focus Room', location: 'Blok M, Jakarta', category: 'Meeting Room', rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1582653291997-079a83b44a50?w=600&q=80',
    amenities: ['WiFi', 'Coffee'],
    description: 'Ruang kerja fokus tanpa gangguan.',
    pricing: { harian: { label: 'Full day', price: 180000 }, bulanan: { label: '30 hari', price: 3500000 }, tahunan: { label: 'Annual', price: 35000000 } }
  },
  {
    id: 'R014', name: 'Global Hub', location: 'Thamrin, Jakarta', category: 'Coworking', rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
    amenities: ['WiFi', 'AC', 'Pantry'],
    description: 'Coworking premium di tengah pusat kota.',
    pricing: { harian: { label: 'Full day', price: 300000 }, bulanan: { label: '30 hari', price: 7000000 }, tahunan: { label: 'Annual', price: 70000000 } }
  },
  {
    id: 'R015', name: 'Conference Suite', location: 'Kelapa Gading, Jakarta', category: 'Boardroom', rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=600&q=80',
    amenities: ['WiFi', 'Projector', 'AC'],
    description: 'Suite konferensi besar untuk event.',
    pricing: { harian: { label: 'Full day', price: 400000 }, bulanan: { label: '30 hari', price: 8000000 }, tahunan: { label: 'Annual', price: 80000000 } }
  },
];

// // // TODO: Ganti dummyRooms dengan ini saat API siap
// // export async function fetchRoomsFromApi() {
// //   const response = await fetch('/api/rooms');
// //   const json = await response.json();
// //   return json.data; // sesuai struktur ApiMessage::success
// // }

// export interface Room {
//   id: string;
//   name: string;
//   location: string;
//   category: 'Studio Foto' | 'Meeting Room' | 'Coworking' | 'Boardroom';
//   rating: number;
//   imageUrl: string;
//   amenities: string[];
//   description: string;
//   pricing: {
//     harian: { label: string; price: number };
//     bulanan: { label: string; price: number };
//     tahunan: { label: string; price: number };
//   };
// }

// export const rooms: Room[] = [
//   {
//     id: 'R001',
//     name: 'The Zenith Studio',
//     location: 'Jakarta Selatan',
//     category: 'Studio Foto',
//     rating: 4.9,
//     imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80',
//     amenities: ['Ultra Wi-Fi', 'AC Central', 'Projector'],
//     description: 'Studio foto profesional dengan backdrop putih dan pencahayaan premium. Cocok untuk pemotretan produk, fashion, dan konten kreator.',
//     pricing: {
//       harian:  { label: 'Full day access (08:00-20:00)', price: 200000 },
//       bulanan: { label: '30 hari akses penuh',           price: 5000000 },
//       tahunan: { label: 'Annual membership',             price: 50000000 },
//     },
//   },
//   {
//     id: 'R002',
//     name: 'Nexus Boardroom',
//     location: 'SCBD, Jakarta',
//     category: 'Boardroom',
//     rating: 4.8,
//     imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
//     amenities: ['High-Speed WiFi', 'AC Central', 'Projector', 'Pantry'],
//     description: 'Ruang boardroom premium dengan pemandangan kota. Kapasitas 12 orang, dilengkapi sistem presentasi terintegrasi dan pencahayaan otomatis.',
//     pricing: {
//       harian:  { label: 'Full day access (09:00-18:00)', price: 200000 },
//       bulanan: { label: '30 hari akses penuh',           price: 5000000 },
//       tahunan: { label: 'Annual membership',             price: 50000000 },
//     },
//   },
//   {
//     id: 'R003',
//     name: 'The Hub Cowork',
//     location: 'Kemang, Jakarta',
//     category: 'Coworking',
//     rating: 4.7,
//     imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80',
//     amenities: ['Wi-Fi', 'AC Central', 'Pantry'],
//     description: 'Coworking space modern dan nyaman di Kemang. Lingkungan kolaboratif dengan komunitas startup dan freelancer aktif.',
//     pricing: {
//       harian:  { label: 'Full day access',    price: 200000 },
//       bulanan: { label: '30 hari akses penuh', price: 5000000 },
//       tahunan: { label: 'Annual membership',  price: 50000000 },
//     },
//   },
//   {
//     id: 'R004',
//     name: 'Elite Executive Boardroom',
//     location: 'Sudirman CBD, Jakarta',
//     category: 'Boardroom',
//     rating: 4.9,
//     imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80',
//     amenities: ['High-Speed WiFi', 'Climate Ctrl', 'Projector', 'Pantry'],
//     description: 'Ruang boardroom eksklusif untuk high-stakes meeting. 24 kursi Italian leather, soundproofing penuh, dan teknologi audiovisual terkini.',
//     pricing: {
//       harian:  { label: 'Full day access (09:00-18:00)', price: 200000 },
//       bulanan: { label: '30 hari akses penuh',           price: 5000000 },
//       tahunan: { label: 'Annual membership',             price: 50000000 },
//     },
//   },
//   {
//     id: 'R005',
//     name: 'Creative Loft Studio',
//     location: 'Menteng, Jakarta',
//     category: 'Studio Foto',
//     rating: 4.6,
//     imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80',
//     amenities: ['Wi-Fi', 'AC Central', 'Projector'],
//     description: 'Studio kreatif dengan nuansa industrial chic. Ideal untuk foto produk, video YouTube, podcast, dan workshop kreatif.',
//     pricing: {
//       harian:  { label: 'Full day access',     price: 200000 },
//       bulanan: { label: '30 hari akses penuh', price: 5000000 },
//       tahunan: { label: 'Annual membership',   price: 50000000 },
//     },
//   },
// ];