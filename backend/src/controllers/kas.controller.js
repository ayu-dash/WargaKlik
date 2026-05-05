const { KasHarian, User, Pembayaran } = require('../models');
const { success, error, paginate } = require('../utils/response');

/**
 * GET /api/kas
 */
const getAllKas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { jenis, bulan, tahun } = req.query;
    let where = {};
    
    if (jenis) where.jenis = jenis;
    
    // For specific month/year filtering, use raw queries or Op.and with sequelize.fn
    if (bulan && tahun) {
      const sequelize = require('../config/database');
      const { Op } = require('sequelize');
      where[Op.and] = [
        sequelize.where(sequelize.fn('MONTH', sequelize.col('tanggal')), bulan),
        sequelize.where(sequelize.fn('YEAR', sequelize.col('tanggal')), tahun)
      ];
    }

    const { count, rows } = await KasHarian.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { model: User, as: 'pencatat', attributes: ['name'] },
        { model: Pembayaran, as: 'pembayaran', attributes: ['id', 'metode'] }
      ],
      order: [['tanggal', 'DESC'], ['id', 'DESC']]
    });

    // Get summary for the query
    const summaryMasuk = await KasHarian.sum('nominal', { where: { ...where, jenis: 'masuk' } });
    const summaryKeluar = await KasHarian.sum('nominal', { where: { ...where, jenis: 'keluar' } });

    return paginate(res, rows, {
      total: count,
      page,
      total_pages: Math.ceil(count / limit),
      summary: {
        masuk: summaryMasuk || 0,
        keluar: summaryKeluar || 0,
        saldo: (summaryMasuk || 0) - (summaryKeluar || 0)
      }
    });
  } catch (err) {
    console.error('Get kas error:', err);
    return error(res, 'Gagal mengambil data kas', 500);
  }
};

/**
 * POST /api/kas
 * Create manual cash entry (usually expense)
 */
const createKas = async (req, res) => {
  try {
    const { tanggal, jenis, kategori, keterangan, nominal } = req.body;
    let bukti_url = null;
    if (req.file) {
      bukti_url = `/uploads/${req.file.filename}`;
    }

    const kas = await KasHarian.create({
      tanggal,
      jenis,
      kategori,
      keterangan,
      nominal,
      bukti_url,
      dicatat_oleh: req.user.id
    });

    return success(res, kas, 'Data kas berhasil dicatat', 201);
  } catch (err) {
    console.error('Create kas error:', err);
    return error(res, 'Gagal mencatat kas', 500);
  }
};

module.exports = { getAllKas, createKas };
