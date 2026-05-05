const cron = require('node-cron');
const { Warga, IuranMaster, Tagihan, TagihanItem } = require('../models');

/**
 * Generate monthly tagihan for all active warga
 * Runs on the 1st of every month at 00:01
 */
const setupGenerateTagihan = () => {
  cron.schedule('1 0 1 * *', async () => {
    console.log('⏰ [CRON] Generating tagihan otomatis...');
    try {
      const now = new Date();
      const bulan = now.getMonth() + 1;
      const tahun = now.getFullYear();

      // Get all active iuran
      const iuranList = await IuranMaster.findAll({ where: { is_active: true } });
      if (iuranList.length === 0) {
        console.log('⏰ [CRON] Tidak ada iuran aktif, skip.');
        return;
      }

      // Get all active warga
      const wargaList = await Warga.findAll({ where: { is_active: true } });

      let created = 0;
      let skipped = 0;

      for (const warga of wargaList) {
        // Check if tagihan already exists
        const existing = await Tagihan.findOne({
          where: { warga_id: warga.id, bulan, tahun }
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Calculate total
        const bulananIuran = iuranList.filter(i => i.periode === 'bulanan');
        // Add tahunan only in January
        const tahunanIuran = bulan === 1 ? iuranList.filter(i => i.periode === 'tahunan') : [];
        const applicableIuran = [...bulananIuran, ...tahunanIuran];

        if (applicableIuran.length === 0) continue;

        const totalNominal = applicableIuran.reduce((sum, i) => sum + parseFloat(i.nominal), 0);

        // Create tagihan
        const tagihan = await Tagihan.create({
          warga_id: warga.id,
          bulan,
          tahun,
          periode_mulai: new Date(tahun, bulan - 1, 1),
          periode_selesai: new Date(tahun, bulan, 0),
          total_nominal: totalNominal,
          status: 'belum_bayar'
        });

        // Create tagihan items
        for (const iuran of applicableIuran) {
          await TagihanItem.create({
            tagihan_id: tagihan.id,
            iuran_master_id: iuran.id,
            nominal: iuran.nominal,
            keterangan: iuran.nama
          });
        }

        created++;
      }

      console.log(`✅ [CRON] Tagihan generated: ${created} created, ${skipped} skipped`);
    } catch (err) {
      console.error('❌ [CRON] Generate tagihan error:', err);
    }
  });

  console.log('📅 Cron: Generate tagihan scheduled (1st of every month, 00:01)');
};

module.exports = setupGenerateTagihan;
