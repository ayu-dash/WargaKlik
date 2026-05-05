const { Tagihan, TagihanItem, Warga, User, Pembayaran } = require('../models');
const { success, error, paginate } = require('../utils/response');
const { Op } = require('sequelize');

/**
 * GET /api/tagihan
 */
const getAllTagihan = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Filters
    const { status, bulan, tahun } = req.query;
    let where = {};
    
    if (status) where.status = status;
    if (bulan) where.bulan = bulan;
    if (tahun) where.tahun = tahun;

    // Role check: if warga, only see their own tagihan
    if (req.user.role === 'warga') {
      const warga = await Warga.findOne({ where: { user_id: req.user.id } });
      if (!warga) return error(res, 'Data warga tidak ditemukan', 404);
      where.warga_id = warga.id;
    }

    const { count, rows } = await Tagihan.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { 
          model: Warga, 
          as: 'warga',
          attributes: ['id', 'no_rumah', 'kepala_keluarga']
        },
        {
          model: Pembayaran,
          as: 'pembayaran',
          where: { status: 'success' },
          required: false
        }
      ],
      order: [['tahun', 'DESC'], ['bulan', 'DESC'], ['id', 'DESC']]
    });

    return paginate(res, rows, {
      total: count,
      page,
      total_pages: Math.ceil(count / limit)
    });
  } catch (err) {
    console.error('Get tagihan error:', err);
    return error(res, 'Gagal mengambil data tagihan', 500);
  }
};

/**
 * GET /api/tagihan/:id
 */
const getTagihanById = async (req, res) => {
  try {
    const tagihan = await Tagihan.findByPk(req.params.id, {
      include: [
        { model: Warga, as: 'warga' },
        { model: TagihanItem, as: 'items', include: ['iuran_master'] },
        { model: Pembayaran, as: 'pembayaran' }
      ]
    });

    if (!tagihan) return error(res, 'Tagihan tidak ditemukan', 404);

    // Auth check for warga
    if (req.user.role === 'warga') {
      const warga = await Warga.findOne({ where: { user_id: req.user.id } });
      if (!warga || tagihan.warga_id !== warga.id) {
        return error(res, 'Akses ditolak', 403);
      }
    }

    return success(res, tagihan);
  } catch (err) {
    return error(res, 'Gagal mengambil detail tagihan', 500);
  }
};

/**
 * POST /api/tagihan/generate (Admin manual trigger)
 * Generate tagihan for specific bulan/tahun
 */
const generateTagihan = async (req, res) => {
  try {
    const { bulan, tahun } = req.body;
    if (!bulan || !tahun) return error(res, 'Bulan dan tahun wajib diisi', 400);

    // Use the existing generateTagihan job logic as a helper, or duplicate core logic here
    const { IuranMaster } = require('../models');
    
    const iuranList = await IuranMaster.findAll({ where: { is_active: true } });
    if (iuranList.length === 0) return error(res, 'Tidak ada iuran aktif', 400);

    const wargaList = await Warga.findAll({ where: { is_active: true } });
    
    let created = 0;
    let skipped = 0;

    for (const warga of wargaList) {
      const existing = await Tagihan.findOne({
        where: { warga_id: warga.id, bulan, tahun }
      });

      if (existing) {
        skipped++;
        continue;
      }

      const bulananIuran = iuranList.filter(i => i.periode === 'bulanan');
      const tahunanIuran = (parseInt(bulan) === 1) ? iuranList.filter(i => i.periode === 'tahunan') : [];
      const applicableIuran = [...bulananIuran, ...tahunanIuran];

      if (applicableIuran.length === 0) continue;

      const totalNominal = applicableIuran.reduce((sum, i) => sum + parseFloat(i.nominal), 0);

      const tagihan = await Tagihan.create({
        warga_id: warga.id,
        bulan,
        tahun,
        periode_mulai: new Date(tahun, bulan - 1, 1),
        periode_selesai: new Date(tahun, bulan, 0),
        total_nominal: totalNominal,
        status: 'belum_bayar'
      });

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

    return success(res, { created, skipped }, `Berhasil generate ${created} tagihan. ${skipped} tagihan dilewati (sudah ada).`);
  } catch (err) {
    console.error('Generate tagihan error:', err);
    return error(res, 'Gagal generate tagihan', 500);
  }
};

module.exports = { getAllTagihan, getTagihanById, generateTagihan };
