import { GraphNode, GraphEdge } from '../types';

export const initialNodes: GraphNode[] = [
  {
    id: "node-nawawi",
    name: "Syekh Nawawi al-Bantani",
    type: "Tokoh / Kiai",
    metadata: {
      tahun_lahir: 1813,
      tahun_wafat: 1897,
      tahun_ke_mekkah: 1830,
      lokasi: "Banten & Makkah al-Mukarramah",
      catatan_perjalanan: "Menjelajah ke Makkah untuk menuntut ilmu pada usia muda dan menjadi salah satu Imam Masjidil Haram serta guru besar yang mengajar di halaqah Masjidil Haram.",
      biografi: "Ulama kharismatik asal Banten, Jawa Barat yang diakui secara internasional sebagai Sayyidul Hijaz (Pemimpin para Ulama Hijaz). Karya-karyanya menjadi rujukan utama di pesantren-pesantren Nusantara dan Timur Tengah."
    }
  },
  {
    id: "node-kholil",
    name: "Syekh Kholil al-Bangkalani",
    type: "Tokoh / Kiai",
    metadata: {
      tahun_lahir: 1820,
      tahun_wafat: 1925,
      tahun_ke_mekkah: 1859,
      lokasi: "Bangkalan, Madura",
      catatan_perjalanan: "Belajar di berbagai pesantren di Jawa sebelum melanjutkan studi mendalam di Makkah al-Mukarramah, berguru kepada para ulama mu'tabar.",
      biografi: "Ulama besar penentu sanad guru-guru di Jawa dan Madura. Beliau dikenal memiliki kecerdasan luar biasa dan karamah spiritual yang mendalam, membimbing calon-calon pendiri organisasi besar Islam di Indonesia."
    }
  },
  {
    id: "node-hasyim",
    name: "K.H. M. Hasyim Asy'ari",
    type: "Tokoh / Kiai",
    metadata: {
      tahun_lahir: 1871,
      tahun_wafat: 1947,
      tahun_ke_mekkah: 1892,
      lokasi: "Jombang, Jawa Timur",
      catatan_perjalanan: "Mengembara mencari ilmu ke Purworejo, Madura, Kediri hingga menetap di Makkah untuk melengkapi ilmu hadits dari Syekh Mahfuzh al-Tarmasi.",
      biografi: "Hadratussyaikh (Maha Guru) pendiri Nahdlatul Ulama (NU). Beliau merupakan poros perlawanan budaya terhadap penjajah kolonial dan pelestari tradisi intelektual Islam tradisional berbasis pesantren."
    }
  },
  {
    id: "node-dahlan",
    name: "K.H. Ahmad Dahlan",
    type: "Tokoh / Kiai",
    metadata: {
      tahun_lahir: 1868,
      tahun_wafat: 1923,
      tahun_ke_mekkah: 1890,
      lokasi: "Yogyakarta",
      catatan_perjalanan: "Pergi ke Makkah tahun 1890 dan berinteraksi dengan gagasan pembaruan Islam seperti pemikiran Abduh, Rida, dan Al-Afghani.",
      biografi: "Sang Pencerah, pendiri Muhammadiyah. Berfokus pada pembaruan pendidikan Islam, purifikasi akidah, serta pelayanan sosial/kesehatan modern di Nusantara tanpa mencabut akar ortodoksi teologinya."
    }
  },
  {
    id: "node-mahfuzh",
    name: "Syekh Mahfuzh al-Tarmasi",
    type: "Tokoh / Kiai",
    metadata: {
      tahun_lahir: 1842,
      tahun_wafat: 1920,
      tahun_ke_mekkah: 1874,
      lokasi: "Pacitan & Makkah",
      catatan_perjalanan: "Lahir di Termas, Pacitan. Ayahnya adalah ulama besar Jawa. Beliau menetap dan wafat di Makkah sebagai pemegang sanad tertinggi kitab Shahih Bukhari.",
      biografi: "Ulama ahli hadits kelas dunia asal Termas, Pacitan. Beliau adalah guru utama bidang hadits bagi KH Hasyim Asy'ari dan memiliki otoritas menyandarkan sanad qira'ah serta hadits mu'tabar."
    }
  },
  {
    id: "node-marah-labid",
    name: "Kitab Tafsir Marah Labid",
    type: "Kitab / Manuskrip",
    metadata: {
      penulis: "Syekh Nawawi al-Bantani",
      tahun_penulisan: 1884,
      bahasa: "Arab",
      deskripsi: "Juga dikenal sebagai Tafsir al-Munir li Ma'alimit Tanzil. Kitab tafsir dua jilid yang ditulis secara komprehensif di Makkah dan dicetak di Kairo, menjadikannya tonggak kebanggaan intelektual Nusantara."
    }
  },
  {
    id: "node-singkili",
    name: "Syekh Abdur-Rauf as-Singkili",
    type: "Tokoh / Kiai",
    metadata: {
      tahun_lahir: 1615,
      tahun_wafat: 1693,
      tahun_ke_mekkah: 1643,
      lokasi: "Singkil & Banda Aceh",
      catatan_perjalanan: "Kira-kira 19 tahun bermukim di Timur Tengah (Makkah, Madinah, Yaman, dll) mempelajari hukum Islam, tasawuf, dan silsilah tarekat Syattariyah.",
      biografi: "Mufti Agung Kesultanan Aceh Darussalam. Beliau adalah mufassir pertama di Nusantara yang menerjemahkan Al-Qur'an lengkap dalam bahasa Melayu klasik."
    }
  },
  {
    id: "node-tarjuman",
    name: "Manuskrip Tarjuman al-Mustafid",
    type: "Kitab / Manuskrip",
    metadata: {
      penulis: "Syekh Abdur-Rauf as-Singkili",
      tahun_penulisan: 1675,
      bahasa: "Melayu (Aksara Jawi)",
      deskripsi: "Manuskrip tafsir Al-Qur'an pertama yang utuh di Nusantara. Ditransmisikan melalui salinan tangan berbahan kertas dluwang di berbagai pusat tarekat Syattariyah Nusantara."
    }
  },
  {
    id: "node-tebuireng",
    name: "Pesantren Tebuireng",
    type: "Pesantren",
    metadata: {
      tahun_berdiri: 1899,
      pendiri: "K.H. M. Hasyim Asy'ari",
      lokasi: "Jombang, Jawa Timur",
      deskripsi: "Pusat gerakan intelektual pesantren abad ke-20. Didirikan sebagai respon moral dan dakwah di tengah kawasan perkebunan tebu kolonial Belanda yang sarat kriminalitas."
    }
  },
  {
    id: "node-kademangan",
    name: "Pesantren Syaikhona Kholil Kademangan",
    type: "Pesantren",
    metadata: {
      tahun_berdiri: 1861,
      pendiri: "Syekh Kholil al-Bangkalani",
      lokasi: "Bangkalan, Madura",
      deskripsi: "Pondok pesantren legendaris di ujung barat Pulau Madura yang menjadi kawah candradimuka ratusan ulama pelopor pesantren di tanah Jawa."
    }
  },
  {
    id: "node-ijazah-bukhari",
    name: "Ijazah Sanad Shahih Bukhari",
    type: "Ijazah",
    metadata: {
      penerbit: "Syekh Mahfuzh al-Tarmasi",
      penerima: "K.H. M. Hasyim Asy'ari",
      tahun_penyerahan: 1895,
      lokasi: "Makkah al-Mukarramah",
      deskripsi: "Ijazah transmisi hadits dengan silsilah sanad muttashil bersambung langsung hingga Imam al-Bukhari. Penanda transfer pemikiran hadits mutakhir di Nusantara."
    }
  },
  {
    id: "node-alumni-tebuireng",
    name: "K.H. Wahid Hasyim (Alumni)",
    type: "Alumni",
    metadata: {
      tahun_lahir: 1914,
      tahun_wafat: 1953,
      lokasi: "Jombang & Jakarta",
      deskripsi: "Putra dari KH Hasyim Asy'ari, alumni terkemuka Tebuireng yang menjabat sebagai Menteri Agama pertama RI dan perumus Piagam Jakarta dalam BPUPKI."
    }
  },
  {
    id: "node-bandongan",
    name: "Tradisi Pembelajaran Bandongan",
    type: "Tradisi Pembelajaran",
    metadata: {
      tahun_berdiri: 1700,
      deskripsi: "Metode pembelajaran klasikal pesantren di mana Kyai membaca, menerjemahkan, menerangkan, sedangkan santri menyimak dan memberi catatan (ngabsahi/maknani) pada kitab gundul mereka."
    }
  }
];

export const initialEdges: GraphEdge[] = [
  {
    id: "edge-kholil-learn-nawawi",
    source_node_id: "node-kholil",
    target_node_id: "node-nawawi",
    edge_type: "belajar_kepada",
    year_context: 1860
  },
  {
    id: "edge-hasyim-learn-kholil",
    source_node_id: "node-hasyim",
    target_node_id: "node-kholil",
    edge_type: "belajar_kepada",
    year_context: 1885
  },
  {
    id: "edge-hasyim-learn-mahfuzh",
    source_node_id: "node-hasyim",
    target_node_id: "node-mahfuzh",
    edge_type: "belajar_kepada",
    year_context: 1893
  },
  {
    id: "edge-dahlan-learn-nawawi",
    source_node_id: "node-dahlan",
    target_node_id: "node-nawawi",
    edge_type: "belajar_kepada",
    year_context: 1890
  },
  {
    id: "edge-nawawi-write-marah",
    source_node_id: "node-marah-labid",
    target_node_id: "node-nawawi",
    edge_type: "menyalin",
    year_context: 1884
  },
  {
    id: "edge-singkili-write-tarjuman",
    source_node_id: "node-tarjuman",
    target_node_id: "node-singkili",
    edge_type: "menyalin",
    year_context: 1675
  },
  {
    id: "edge-tebuireng-hasyim",
    source_node_id: "node-hasyim",
    target_node_id: "node-tebuireng",
    edge_type: "mengajar",
    year_context: 1899
  },
  {
    id: "edge-kademangan-kholil",
    source_node_id: "node-kholil",
    target_node_id: "node-kademangan",
    edge_type: "mengajar",
    year_context: 1861
  },
  {
    id: "edge-hasyim-get-ijazah",
    source_node_id: "node-hasyim",
    target_node_id: "node-ijazah-bukhari",
    edge_type: "memberi_ijazah",
    year_context: 1895
  },
  {
    id: "edge-mahfuzh-give-ijazah",
    source_node_id: "node-mahfuzh",
    target_node_id: "node-ijazah-bukhari",
    edge_type: "memiliki",
    year_context: 1895
  },
  {
    id: "edge-wahid-alumni-tebuireng",
    source_node_id: "node-alumni-tebuireng",
    target_node_id: "node-tebuireng",
    edge_type: "alumni",
    year_context: 1932
  },
  {
    id: "edge-tebuireng-bandongan",
    source_node_id: "node-tebuireng",
    target_node_id: "node-bandongan",
    edge_type: "tradisi_bandongan",
    year_context: 1899
  },
  {
    id: "edge-kademangan-bandongan",
    source_node_id: "node-kademangan",
    target_node_id: "node-bandongan",
    edge_type: "tradisi_bandongan",
    year_context: 1861
  }
];
