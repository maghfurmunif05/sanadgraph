import { SanadNode, SanadEdge, SanadEvent } from './types';

export const INITIAL_NODES: SanadNode[] = [
  {
    id: 'n-kholil',
    label: 'Syaikhona Kholil Bangkalan',
    type: 'Guru',
    description: 'Ulama karismatik Madura, guru dari pendiri organisasi Islam terbesar di Indonesia (NU).',
    detail: {
      birthYear: '1835',
      deathYear: '1925',
      location: 'Kademangan, Bangkalan, Madura',
      customFields: [
        { id: 'c1', key: 'Gelar', value: 'Syaikhul Masyaikh (Gurunya Para Guru)' },
        { id: 'c2', key: 'Garis Keturunan', value: 'Wali Songo melalui Sunan Gunung Jati' },
        { id: 'c3', key: 'Kepakaran Utama', value: 'Nahwu, Sharaf, Fiqih, dan Tasawuf' }
      ],
      events: [
        {
          id: 'ev-kholil-birth',
          nodeId: 'n-kholil',
          title: 'Kelahiran Syaikhona Kholil',
          year: 1835,
          displayYear: '1252 H / 1835 M',
          description: 'Lahir di Kademangan, Bangkalan, dari keluarga Kiai Abdul Lathif.',
          location: 'Bangkalan'
        },
        {
          id: 'ev-kholil-mecca',
          nodeId: 'n-kholil',
          title: 'Keberangkatan ke Tanah Suci Mekkah',
          year: 1859,
          displayYear: '1276 H / 1859 M',
          description: 'Berangkat ke Mekkah untuk memperdalam berbagai macam disiplin ilmu Islam kepada ulama-ulama Masjidil Haram.',
          location: 'Mekkah, Arab Saudi'
        },
        {
          id: 'ev-kholil-pesantren',
          nodeId: 'n-kholil',
          title: 'Pendirian Pondok Pesantren Kademangan',
          year: 1861,
          displayYear: '1278 H / 1861 M',
          description: 'Sepulang dari beberapa tahun menuntut ilmu, beliau mendirikan pesantren di Kademangan untuk menampung murid dari berbagai daerah Jawa-Madura.',
          location: 'Bangkalan'
        },
        {
          id: 'ev-kholil-death',
          nodeId: 'n-kholil',
          title: 'Wafatnya Syaikhona Kholil',
          year: 1925,
          displayYear: '1343 H / 1925 M',
          description: 'Wafat di Bangkalan dan meninggalkan warisan intelektual luar biasa yang tersebar di ratusan pesantren Nusantara.',
          location: 'Bangkalan'
        }
      ]
    }
  },
  {
    id: 'n-minangkabawi',
    label: 'Syaikh Ahmad Khatib al-Minangkabawi',
    type: 'Guru',
    description: 'Imam besar Madzhab Syafi’i di Masjidil Haram, Mekkah asal Minangkabau.',
    detail: {
      birthYear: '1860',
      deathYear: '1916',
      location: 'Mekkah al-Mukarramah',
      customFields: [
        { id: 'c4', key: 'Gelar', value: 'Mufti Besar Madzhab Syafi’i' },
        { id: 'c5', key: 'Karya Terkenal', value: 'Izhaarul Khulaashoh fi ' },
        { id: 'c6', key: 'Pengaruh', value: 'Menjadi guru bagi mayoritas pendiri gerakan Islam di Indonesia awal abad ke-20' }
      ],
      events: [
        {
          id: 'ev-minang-birth',
          nodeId: 'n-minangkabawi',
          title: 'Kelahiran Syaikh Ahmad Khatib',
          year: 1860,
          description: 'Lahir di Koto Tuo, Balenggek, Minangkabau.',
          location: 'Minangkabau, Sumatera Barat'
        },
        {
          id: 'ev-minang-imam',
          nodeId: 'n-minangkabawi',
          title: 'Diangkat Menjadi Imam Besar Masjidil Haram',
          year: 1888,
          description: 'Diangkat menjadi Imam dan Khatib Masjidil Haram di bawah perlindungan Syarif Mekkah karena kecerdasannya yang luar biasa.',
          location: 'Mekkah'
        }
      ]
    }
  },
  {
    id: 'n-hasyim',
    label: 'KH. M. Hasyim Asy’ari',
    type: 'Murid',
    description: 'Pendiri Pesantren Tebuireng dan Pendiri Nahdlatul Ulama (NU), Hadratussyaikh penentu perjuangan nasional.',
    detail: {
      birthYear: '1871',
      deathYear: '1947',
      location: 'Tebuireng, Jombang',
      customFields: [
        { id: 'c7', key: 'Gelar', value: 'Hadratussyaikh (Maha Guru)' },
        { id: 'c8', key: 'Karya Utama', value: 'Adabul Alim wal Muta’allim' },
        { id: 'c9', key: 'Sanad Utama', value: 'Sanad Shahih al-Bukhari yang tersambung ke Syaikh Mahfudz al-Tarmasi' }
      ],
      events: [
        {
          id: 'ev-hasyim-birth',
          nodeId: 'n-hasyim',
          title: 'Kelahiran KH. Hasyim Asy’ari',
          year: 1871,
          description: 'Lahir di Gedang, Tambakrejo, Jombang dari pasangan Kiai Asy’ari dan Nyai Halimah.',
          location: 'Jombang'
        },
        {
          id: 'ev-hasyim-bangkalan',
          nodeId: 'n-hasyim',
          title: 'Mengaji ke Syaikhona Kholil Bangkalan',
          year: 1891,
          description: 'Belajar berbagai macam kitab kuning dan menerima isyarat spiritual kepemimpinan dari Syaikhona Kholil Madura.',
          location: 'Bangkalan, Madura'
        },
        {
          id: 'ev-hasyim-mecca',
          nodeId: 'n-hasyim',
          title: 'Belajar di Mekkah Al-Mukarramah',
          year: 1893,
          description: 'Bertolak ke Mekkah, berguru kepada Syaikh Ahmad Khatib dan terutama Syaikh Mahfudz al-Tarmasi dalam bidang Ilmu Hadits.',
          location: 'Mekkah, Arab Saudi'
        },
        {
          id: 'ev-hasyim-tebuireng',
          nodeId: 'n-hasyim',
          title: 'Mendirikan Pondok Pesantren Tebuireng',
          year: 1899,
          displayYear: '1899 M',
          description: 'Membuka lahan hutan belantara Tebuireng untuk dijadikan pusat pengajaran Islam yang memerangi maksiat dan kolonialisme.',
          location: 'Jombang'
        }
      ]
    }
  },
  {
    id: 'n-dahlan',
    label: 'KH. Ahmad Dahlan',
    type: 'Murid',
    description: 'Pendiri Muhammadiyah, pahlawan nasional yang melakukan pembaruan pendidikan Islam.',
    detail: {
      birthYear: '1868',
      deathYear: '1923',
      location: 'Kauman, Yogyakarta',
      customFields: [
        { id: 'c10', key: 'Nama Kecil', value: 'Muhammad Darwis' },
        { id: 'c11', key: 'Pemikiran', value: 'Aktif menyelaraskan pendidikan agama dan umum secara modern' },
        { id: 'c12', key: 'Teman Sekamar', value: 'Menginap dan belajar bersama KH. Hasyim Asy’ari selama di Mekkah' }
      ],
      events: [
        {
          id: 'ev-dahlan-birth',
          nodeId: 'n-dahlan',
          title: 'Kelahiran Muhammad Darwis',
          year: 1868,
          description: 'Lahir di Kauman, Yogyakarta dari Kiai Abu Bakar (Imam khatib Masjid Besar Kauman).',
          location: 'Yogyakarta'
        },
        {
          id: 'ev-dahlan-mecca',
          nodeId: 'n-dahlan',
          title: 'Belajar Bersama Murid Nusantara di Mekkah',
          year: 1890,
          description: 'Menuntut ilmu ke Mekkah, berinteraksi dengan pemikiran reformasi Islam Abduh dan Rida, serta mengaji kepada Syaikh Ahmad Khatib.',
          location: 'Mekkah'
        },
        {
          id: 'ev-dahlan-muh',
          nodeId: 'n-dahlan',
          title: 'Deklarasi Pendirian Muhammadiyah',
          year: 1912,
          description: 'Mendirikan Muhammadiyah sebagai organisasi dakwah kultural dan sosial kemasyarakatan.',
          location: 'Yogyakarta'
        }
      ]
    }
  },
  {
    id: 'n-tarmasi',
    label: 'Syaikh Mahfudz al-Tarmasi',
    type: 'Guru',
    description: 'Ulama hadits asal Termas (Pacitan) yang menjadi rujukan sanad utama kitab Shahih Bukhari di Indonesia.',
    detail: {
      birthYear: '1842',
      deathYear: '1920',
      location: 'Termas, Pacitan & Mekkah',
      customFields: [
        { id: 'c13', key: 'Keahlian', value: 'Ilmu Hadits & Qiraah' },
        { id: 'c14', key: 'Kitab Sunan', value: 'Diakui sebagai pemegang rantai sanad hadits Bukhari-Muslim yang kokoh' }
      ],
      events: [
        {
          id: 'ev-tarmas-birth',
          nodeId: 'n-tarmasi',
          title: 'Kelahiran Syaikh Mahfudz',
          year: 1842,
          description: 'Lahir di Termas, Pacitan, dari keluarga pengasuh pesantren yang sangat ketat menjaga tradisi keilmuan.',
          location: 'Pacitan, Jawa Timur'
        }
      ]
    }
  },
  {
    id: 'n-bukhari',
    label: 'Kitab Shahih al-Bukhari',
    type: 'Kitab',
    description: 'Kitab referensi hadits tershahih yang diajarkan lintas generasi dengan sanad yang ketat.',
    detail: {
      author: 'Imam Muhammad al-Bukhari',
      location: 'Tansmisi di Masjidil Haram & Pesantren',
      customFields: [
        { id: 'c15', key: 'Jumlah Hadits', value: '7275 Hadits' },
        { id: 'c16', key: 'Kedudukan', value: 'Sumber hukum Islam kedua setelah Al-Qur’an' }
      ],
      events: [
        {
          id: 'ev-bukhari-comp',
          nodeId: 'n-bukhari',
          title: 'Kodifikasi Kitab Shahih Bukhari',
          year: 846,
          description: 'Disisir secara teliti oleh Imam Bukhari selama 16 tahun untuk meyakinkan keabsahan setiap sanad.',
          location: 'Bukhara / Madinah'
        }
      ]
    }
  },
  {
    id: 'n-manuskrip-fath',
    label: 'Manuskrip Syarah Fathal Qarib',
    type: 'Manuskrip',
    description: 'Naskah kuno catatan santri dari abad ke-19 yang berisi draf penjelasan fiqih dengan glosarium lokal.',
    detail: {
      author: 'Ibnu Qasim al-Ghazi (Disalin oleh Kiai Madura)',
      location: 'Perpustakaan Kuno Pesantren Kademangan',
      customFields: [
        { id: 'c17', key: 'Media', value: 'Kertas Dluwang (Plat Tradisional dari Kulit Pohon)' },
        { id: 'c18', key: 'Tinta', value: 'Tinta Gentur lokal anti luntur' }
      ],
      events: [
        {
          id: 'ev-manu-copy',
          nodeId: 'n-manuskrip-fath',
          title: 'Penyalinan Naskah Fathal Qarib',
          year: 1888,
          description: 'Penyalinan naskah oleh santri senior di Bangkalan sebagai tugas kelulusan pemahaman fiqih Syafi’i.',
          location: 'Bangkalan, Madura'
        }
      ]
    }
  },
  {
    id: 'n-ijazah-bukhari',
    label: 'Ijazah Sanad Shahih Al-Bukhari KH Hasyim',
    type: 'Ijazah',
    description: 'Dokumen ijazah sanad hadits tertulis dari Syaikh Mahfudz al-Tarmasi kepada KH Hasyim Asy’ari.',
    detail: {
      location: 'Koleksi Arsip Tebuireng',
      customFields: [
        { id: 'c19', key: 'Penerima', value: 'Hadratussyaikh KH Hasyim Asy’ari' },
        { id: 'c20', key: 'Jenis Ijazah', value: 'Sama’ wa Qira’ah (Didengar langsung & dibacakan)' }
      ],
      events: [
        {
          id: 'ev-ijazah',
          nodeId: 'n-ijazah-bukhari',
          title: 'Serah Terima Ijazah Bukhari di Mekkah',
          year: 1895,
          description: 'Hasyim Asy’ari menyelesaikan khataman hadits Bukhari di bawah bimbingan Syaikh Mahfudz al-Tarmasi dan dianugerahi lembar ijazah resmi dengan silsilah sanad yang tidak terputus sampai Rasulullah SAW.',
          location: 'Mekkah, Arab Saudi'
        }
      ]
    }
  },
  {
    id: 'n-tebuireng',
    label: 'Pondok Pesantren Tebuireng',
    type: 'Pesantren',
    description: 'Pusat transmisi pengetahuan Islam legendaris di tanah Jawa yang didirikan oleh Kiai Hasyim Asy’ari.',
    detail: {
      establishedYear: '1899',
      location: 'Jombang, Jawa Timur',
      customFields: [
        { id: 'c21', key: 'Fokus Ajaran', value: 'Hadits Bukhari-Muslim, Fiqih, Nahwu Saraf' },
        { id: 'c22', key: 'Alumni Terkenal', value: 'KH. Wahid Hasyim, KH. Wahab Chasbullah, KH. Bisri Syansuri' }
      ],
      events: [
        {
          id: 'ev-teb-founder',
          nodeId: 'n-tebuireng',
          title: 'Babat Alas Tebuireng',
          year: 1899,
          description: 'Awal pendirian pesantren di tengah pemukiman industri gula cukir yang sarat kemasyarakatan buruk.',
          location: 'Jombang'
        },
        {
          id: 'ev-teb-resolusi',
          nodeId: 'n-tebuireng',
          title: 'Resolusi Jihad Ditandatangani',
          year: 1945,
          description: 'Pesantren Tebuireng menjadi markas konsolidasi ulama se-Jawa Madura untuk mencetuskan Resolusi Jihad melawan kembalinya Sekutu.',
          location: 'Jombang'
        }
      ]
    }
  },
  {
    id: 'n-kademangan',
    label: 'Pondok Pesantren Kademangan',
    type: 'Pesantren',
    description: 'Pesantren bersejarah di Bangkalan tempat ditempanya puluhan Kiai kharismanik Jawa-Madura.',
    detail: {
      establishedYear: '1861',
      location: 'Bangkalan, Madura',
      customFields: [
        { id: 'c23', key: 'Pendiri', value: 'Syaikhona Kholil Bangkalan' },
        { id: 'c24', key: 'Keistimewaan', value: 'Kekuatan spritual pesantren dan kedalaman ilmu bahasa Arab' }
      ],
      events: [
        {
          id: 'ev-kad-est',
          nodeId: 'n-kademangan',
          title: 'Peresmian Pesantren Kademangan',
          year: 1861,
          description: 'Syaikhona Kholil mengawali dakwah pesantren terstruktur di Madura Barat.',
          location: 'Bangkalan, Madura'
        }
      ]
    }
  },
  {
    id: 'n-wahab',
    label: 'KH. Abdul Wahab Chasbullah',
    type: 'Alumni',
    description: 'Inisiator pendirian NU, tokoh diplomatik Islam Nusantara, dan organisator ulama muda.',
    detail: {
      birthYear: '1888',
      deathYear: '1971',
      location: 'Tambakberas, Jombang',
      customFields: [
        { id: 'c25', key: 'Peran', value: 'Mendirikan Tashwirul Afkar (kelompok diskusi pendidikan)' },
        { id: 'c26', key: 'Status Kealumnian', value: 'Selesai nyantri 7 tahun di Tebuireng' },
        { id: 'c27', key: 'Sumbangsih', value: 'Penggubah lagu Syubbanul Wathan' }
      ],
      events: [
        {
          id: 'ev-wahab-birth',
          nodeId: 'n-wahab',
          title: 'Kelahiran KH Wahab Chasbullah',
          year: 1888,
          description: 'Lahir di Tambakberas, Jombang.',
          location: 'Jombang'
        },
        {
          id: 'ev-wahab-nyantri',
          nodeId: 'n-wahab',
          title: 'Masuk Pesantren Tebuireng sebagai Santri',
          year: 1904,
          description: 'Mulai digembleng langsung oleh KH Hasyim Asy’ari dalam studi Fiqih tingkat lanjut dan Hadits.',
          location: 'Tebuireng, Jombang'
        }
      ]
    }
  },
  {
    id: 'n-bandongan',
    label: 'Sistem Pembelajaran Bandongan / Wetonan',
    type: 'Tradisi Pembelajaran',
    description: 'Metode pengajaran kolektif di mana Kiai membaca kitab, santri menyimak, menerjemahkan dan mencatat.',
    detail: {
      practices: 'Kiai membaca per kata secara melodi (ngabsah/jenggotan), menerangkan, santri memaknai dalam bahasa daerah (Pegon Jawa/Madura).',
      location: 'Semua Pesantren Salafiyah',
      customFields: [
        { id: 'c28', key: 'Ciri Utama', value: 'Bersifat massal, melatih pendengaran kritis dan pembendaharaan kata Pegon' },
        { id: 'c29', key: 'Bahasa Pengantar', value: 'Bahasa Jawa/Sunda/Madura beraksara Arab Pegon' }
      ],
      events: [
        {
          id: 'ev-bandongan-history',
          nodeId: 'n-bandongan',
          title: 'Pengadopsian Metode Wetonan-Bandongan',
          year: 1500,
          description: 'Dipraktikkan sejak zaman Wali Songo untuk mentransfer keilmuan secara masif tanpa membatasi jumlah santri yang hadir.',
          location: 'Seluruh Jawa dan Madura'
        }
      ]
    }
  },
  {
    id: 'n-sorogan',
    label: 'Metode Pembelajaran Sorogan',
    type: 'Tradisi Pembelajaran',
    description: 'Sistem asistensi privat di mana santri maju satu demi satu menghadap Kiai untuk membacakan kitab secara aktif.',
    detail: {
      practices: 'Santri mandiri mendemonstrasikan kelancaran membaca struktur nahu-sorof di hadapan guru penguji.',
      location: 'Halaqah Kelas Menengah-Atas Pesantren',
      customFields: [
        { id: 'c30', key: 'Tingkat Akurasi', value: 'Sangat tinggi, penjamin keabsahan makhraj dan nahu dari setiap kosakata' }
      ],
      events: [
        {
          id: 'ev-soro-desc',
          nodeId: 'n-sorogan',
          title: 'Sistem Standardisasi Sorogan Santri',
          year: 1600,
          description: 'Digunakan oleh Kiai untuk menguji kelayakan santri meraih ijazah mengajar mandiri di kampung halaman.',
          location: 'Pesantren Jawa'
        }
      ]
    }
  }
];

export const INITIAL_EDGES: SanadEdge[] = [
  {
    id: 'e1',
    source: 'n-hasyim',
    target: 'n-kholil',
    type: 'belajar_kepada',
    notes: 'Kiai Hasyim menyerap spritualitas kiai, tata bahasa Arab, dan diajarkan kesabaran berdakwah.',
    year: 1891
  },
  {
    id: 'e2',
    source: 'n-hasyim',
    target: 'n-minangkabawi',
    type: 'belajar_kepada',
    notes: 'Belajar metode penetapan hukum (Fiqih Istinbathi) di Mekkah.',
    year: 1893
  },
  {
    id: 'e3',
    source: 'n-dahlan',
    target: 'n-minangkabawi',
    type: 'belajar_kepada',
    notes: 'Mendapat wawasan reformasi hukum Islam dan astronomi (Ilmu Falak).',
    year: 1890
  },
  {
    id: 'e4',
    source: 'n-kholil',
    target: 'n-tarmasi',
    type: 'belajar_kepada',
    notes: 'Menyambungkan keturunan sanad di Mekkah untuk ranah hadits dan qira’at.',
    year: 1870
  },
  {
    id: 'e5',
    source: 'n-hasyim',
    target: 'n-tarmasi',
    type: 'belajar_kepada',
    notes: 'Belajar dan menyerap periwayatan sanad Shahih Bukhari dari Syaikh Mahfudz al-Tarmasi selama menetap di Mekkah.',
    year: 1894
  },
  {
    id: 'e6',
    source: 'n-hasyim',
    target: 'n-tebuireng',
    type: 'alumni', // OR 'mendirikan'
    notes: 'Hadratussyaikh bertindak sebagai pendiri utama sekaligus pengasuh pertama Pesantren Tebuireng.',
    year: 1899
  },
  {
    id: 'e7',
    source: 'n-wahab',
    target: 'n-hasyim',
    type: 'belajar_kepada',
    notes: 'Kiai Wahab belajar langsung kepada Kiai Hasyim, mengabdi dan menjadi santri terpercaya di Tebuireng.',
    year: 1904
  },
  {
    id: 'e8',
    source: 'n-wahab',
    target: 'n-tebuireng',
    type: 'alumni',
    notes: 'Menjadi alumni angkatan awal Tebuireng sebelum pergi bertualang menuntut ilmu ke Mekkah.',
    year: 1911
  },
  {
    id: 'e9',
    source: 'n-kholil',
    target: 'n-kademangan',
    type: 'alumni', // OR 'mendirikan'
    notes: 'Mendirikan Kademangan setelah kembali dari petualangan panjang di berbagai pesantren jawa.',
    year: 1861
  },
  {
    id: 'e10',
    source: 'n-manuskrip-fath',
    target: 'n-kholil',
    type: 'memiliki',
    notes: 'Transkrip naskah pesantren salaf Fathal Qarib peninggalan era kepemimpinan Syaikh Kholil.',
    year: 1888
  },
  {
    id: 'e11',
    source: 'n-ijazah-bukhari',
    target: 'n-hasyim',
    type: 'memberi_ijazah',
    notes: 'Transmisi legalitas keilmuan hadits dari Syaikh Mahfudz Tarmasi di Mekkah.',
    year: 1895
  },
  {
    id: 'e12',
    source: 'n-ijazah-bukhari',
    target: 'n-bukhari',
    type: 'memiliki',
    notes: 'Sertifikat ijazah ini mengabsahkan pewarisan langsung teks Kitab Shahih Bukhari.',
    year: 1895
  },
  {
    id: 'e13',
    source: 'n-tebuireng',
    target: 'n-bandongan',
    type: 'belajar_melalui',
    notes: 'Sistem Bandongan rutin diselenggarakan ba’da subuh dan ashar mengulas kajian hadits Bukhari oleh Kiai Hasyim.',
    year: 1899
  },
  {
    id: 'e14',
    source: 'n-kademangan',
    target: 'n-sorogan',
    type: 'belajar_melalui',
    notes: 'Kademangan menerapkan sorogan ketat untuk melatih kepakaran nahu-sharaf murni bagi santri senior.',
    year: 1861
  }
];

// LocalStorage helpers
export const STORAGE_KEYS = {
  NODES: 'sanad_nodes_data',
  EDGES: 'sanad_edges_data'
};

export function getStoredData() {
  try {
    const nodesJson = localStorage.getItem(STORAGE_KEYS.NODES);
    const edgesJson = localStorage.getItem(STORAGE_KEYS.EDGES);

    if (nodesJson && edgesJson) {
      return {
        nodes: JSON.parse(nodesJson) as SanadNode[],
        edges: JSON.parse(edgesJson) as SanadEdge[]
      };
    }
  } catch (e) {
    console.error('Gagal memuat data dari localStorage, fallback ke data awal.', e);
  }

  // Fallback to initial
  return {
    nodes: INITIAL_NODES,
    edges: INITIAL_EDGES
  };
}

export function saveStoredData(nodes: SanadNode[], edges: SanadEdge[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
    localStorage.setItem(STORAGE_KEYS.EDGES, JSON.stringify(edges));
  } catch (e) {
    console.error('Gagal menyimpan data ke localStorage', e);
  }
}

export function clearAndResetData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.NODES);
    localStorage.removeItem(STORAGE_KEYS.EDGES);
    return {
      nodes: INITIAL_NODES,
      edges: INITIAL_EDGES
    };
  } catch (e) {
    console.error('Gagal me-reset data', e);
    return {
      nodes: INITIAL_NODES,
      edges: INITIAL_EDGES
    };
  }
}
