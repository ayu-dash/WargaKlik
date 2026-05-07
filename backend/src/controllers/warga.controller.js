const { Warga, User, WargaIuran, Tagihan } = require('../models');
const sequelize = require('../config/database');
const { success, error, paginate } = require('../utils/response');
const bcrypt = require('bcryptjs');

/**
 * GET /api/warga
 */
const getAllWarga = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Warga.findAndCountAll({
      limit,
      offset,
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM tagihan AS t
              WHERE t.warga_id = Warga.id
              AND t.status = 'belum_bayar'
            )`),
            'unpaid_count'
          ]
        ]
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'no_telepon', 'role']
        },
        {
          model: WargaIuran,
          as: 'iuran_custom',
          attributes: ['id', 'nominal_custom', 'is_excluded']
        }
      ],
      order: [['no_rumah', 'ASC']]
    });

    return paginate(res, rows, {
      total: count,
      page,
      total_pages: Math.ceil(count / limit)
    });
  } catch (err) {
    console.error('Get warga error:', err);
    return error(res, 'Gagal mengambil data warga', 500);
  }
};

/**
 * GET /api/warga/:id
 */
const getWargaById = async (req, res) => {
  try {
    const warga = await Warga.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'no_telepon', 'role']
        },
        {
          model: WargaIuran,
          as: 'iuran_custom',
          attributes: ['id', 'nominal_custom', 'is_excluded']
        }
      ]
    });

    if (!warga) return error(res, 'Warga tidak ditemukan', 404);
    return success(res, warga);
  } catch (err) {
    return error(res, 'Gagal mengambil data warga', 500);
  }
};

/**
 * POST /api/warga
 */
const createWarga = async (req, res) => {
  try {
    const { 
      name, email, no_telepon, 
      no_rumah, no_kk, jumlah_anggota, status_rumah 
    } = req.body;

    // 1. Check email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return error(res, 'Email sudah terdaftar', 400);

    // 2. Create User with a random unguessable password
    // Users MUST activate their account to set their real password
    const crypto = require('crypto');
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      no_telepon,
      role: 'warga'
    });

    // 3. Create Warga
    const warga = await Warga.create({
      no_rumah,
      kepala_keluarga: name,
      no_kk,
      jumlah_anggota: jumlah_anggota || 1,
      status_rumah: status_rumah || 'tetap',
      user_id: user.id
    });

    return success(res, warga, 'Data warga berhasil ditambahkan', 201);
  } catch (err) {
    console.error('Create warga error:', err);
    return error(res, 'Gagal menambahkan warga', 500);
  }
};

/**
 * PUT /api/warga/:id
 */
const updateWarga = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, no_telepon, no_rumah, no_kk, jumlah_anggota, status_rumah, is_active } = req.body;

    const warga = await Warga.findByPk(id, { include: ['user'] });
    if (!warga) return error(res, 'Warga tidak ditemukan', 404);

    // Update User
    if (warga.user) {
      const userUpdate = {};
      if (name) userUpdate.name = name;
      if (no_telepon !== undefined) userUpdate.no_telepon = no_telepon;
      if (email && email !== warga.user.email) {
        const existing = await User.findOne({ where: { email } });
        if (existing) return error(res, 'Email sudah digunakan oleh akun lain', 400);
        userUpdate.email = email;
      }
      await warga.user.update(userUpdate);
    }

    // Update Warga
    await warga.update({
      no_rumah: no_rumah || warga.no_rumah,
      kepala_keluarga: name || warga.kepala_keluarga,
      no_kk: no_kk || warga.no_kk,
      jumlah_anggota: jumlah_anggota || warga.jumlah_anggota,
      status_rumah: status_rumah || warga.status_rumah,
      is_active: is_active !== undefined ? is_active : warga.is_active
    });

    return success(res, warga, 'Data warga berhasil diupdate');
  } catch (err) {
    console.error('Update warga error:', err);
    return error(res, 'Gagal mengupdate warga', 500);
  }
};

/**
 * DELETE /api/warga/:id
 */
const deleteWarga = async (req, res) => {
  try {
    const warga = await Warga.findByPk(req.params.id);
    if (!warga) return error(res, 'Warga tidak ditemukan', 404);

    // Check for outstanding bills
    const outstandingBills = await Tagihan.count({
      where: {
        warga_id: warga.id,
        status: 'belum_bayar'
      }
    });

    if (outstandingBills > 0) {
      return error(res, `Warga ini memiliki ${outstandingBills} tagihan yang belum lunas. Data tidak dapat dihapus sampai semua tunggakan diselesaikan.`, 400);
    }

    // Soft delete via is_active
    await warga.update({ is_active: false });

    return success(res, null, 'Warga berhasil dinonaktifkan');
  } catch (err) {
    console.error('Delete warga error:', err);
    return error(res, 'Gagal menghapus warga', 500);
  }
};

module.exports = { getAllWarga, getWargaById, createWarga, updateWarga, deleteWarga };
