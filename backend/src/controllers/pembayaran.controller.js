const { Pembayaran, Tagihan, KasHarian, User, Warga } = require('../models');
const { success, error, paginate } = require('../utils/response');
const midtransService = require('../services/midtrans.service');
const notificationService = require('../services/notification.service');
const sequelize = require('../config/database');

/**
 * GET /api/pembayaran
 */
const getAllPembayaran = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let where = {};
    if (req.user.role === 'warga') {
      const warga = await Warga.findOne({ where: { user_id: req.user.id } });
      if (!warga) return error(res, 'Data warga tidak ditemukan', 404);
      
      const tagihans = await Tagihan.findAll({ where: { warga_id: warga.id }, attributes: ['id'] });
      const tagihanIds = tagihans.map(t => t.id);
      where.tagihan_id = tagihanIds;
    }

    const { count, rows } = await Pembayaran.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { 
          model: Tagihan, 
          as: 'tagihan',
          include: [{ model: Warga, as: 'warga', attributes: ['no_rumah', 'kepala_keluarga'] }]
        },
        { model: User, as: 'pencatat', attributes: ['name'] }
      ],
      order: [['tanggal_bayar', 'DESC'], ['id', 'DESC']]
    });

    return paginate(res, rows, {
      total: count,
      page,
      total_pages: Math.ceil(count / limit)
    });
  } catch (err) {
    console.error('Get pembayaran error:', err);
    return error(res, 'Gagal mengambil data pembayaran', 500);
  }
};

/**
 * POST /api/pembayaran/midtrans/snap
 * Request Snap Token for a Tagihan
 */
const createMidtransTransaction = async (req, res) => {
  try {
    const { tagihan_id } = req.body;
    
    const tagihan = await Tagihan.findByPk(tagihan_id, {
      include: [
        { model: Warga, as: 'warga', include: [{ model: User, as: 'user' }] }
      ]
    });

    if (!tagihan) return error(res, 'Tagihan tidak ditemukan', 404);
    if (tagihan.status === 'lunas') return error(res, 'Tagihan sudah lunas', 400);

    // Auth check for warga
    if (req.user.role === 'warga' && tagihan.warga.user_id !== req.user.id) {
      return error(res, 'Akses ditolak', 403);
    }

    const orderId = midtransService.generateOrderId(tagihan.id);
    const grossAmount = Math.round(parseFloat(tagihan.total_nominal));

    const customerDetails = {
      first_name: tagihan.warga.kepala_keluarga,
      email: tagihan.warga.user?.email || '',
      phone: tagihan.warga.user?.no_telepon || ''
    };

    const itemDetails = [{
      id: `TAGIHAN-${tagihan.bulan}-${tagihan.tahun}`,
      price: grossAmount,
      quantity: 1,
      name: `Iuran RT ${tagihan.bulan}/${tagihan.tahun} (${tagihan.warga.no_rumah})`
    }];

    const snapData = await midtransService.createTransaction(orderId, grossAmount, customerDetails, itemDetails);

    // Record pending payment
    await Pembayaran.create({
      tagihan_id: tagihan.id,
      metode: 'midtrans',
      jumlah_bayar: grossAmount,
      tanggal_bayar: new Date(),
      reference_id: orderId,
      status: 'pending'
    });

    return success(res, snapData, 'Token Midtrans berhasil digenerate');
  } catch (err) {
    console.error('Midtrans create error:', err);
    return error(res, 'Gagal membuat transaksi', 500);
  }
};

/**
 * POST /api/pembayaran/midtrans/webhook
 */
const midtransWebhook = async (req, res) => {
  try {
    const { order_id, transaction_status, status_code, gross_amount, signature_key } = req.body;

    const calculatedSignature = midtransService.verifySignature(order_id, status_code, gross_amount);
    if (calculatedSignature !== signature_key) {
      return res.status(403).json({ message: 'Invalid signature' });
    }

    const pembayaran = await Pembayaran.findOne({ where: { reference_id: order_id } });
    if (!pembayaran) {
      return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });
    }

    const tagihan = await Tagihan.findByPk(pembayaran.tagihan_id, {
      include: [{ model: Warga, as: 'warga', include: [{ model: User, as: 'user' }] }]
    });

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      await sequelize.transaction(async (t) => {
        await pembayaran.update({ status: 'success' }, { transaction: t });
        await tagihan.update({ status: 'lunas' }, { transaction: t });
        
        await KasHarian.create({
          pembayaran_id: pembayaran.id,
          tanggal: new Date(),
          jenis: 'masuk',
          kategori: 'iuran',
          keterangan: `Pembayaran Iuran RT ${tagihan.bulan}/${tagihan.tahun} - ${tagihan.warga.no_rumah}`,
          nominal: pembayaran.jumlah_bayar,
          dicatat_oleh: tagihan.warga.user_id // System logic usually attributes to the payer if via midtrans
        }, { transaction: t });
      });

      // Send notification
      if (tagihan.warga.user_id) {
        await notificationService.notify(tagihan.warga.user_id, {
          title: 'Pembayaran Berhasil',
          message: `Pembayaran iuran bulan ${tagihan.bulan}/${tagihan.tahun} sebesar Rp ${Number(pembayaran.jumlah_bayar).toLocaleString('id-ID')} telah berhasil.`,
          type: 'pembayaran',
          refId: pembayaran.id,
          refType: 'pembayaran',
          channels: ['inapp', 'email', 'whatsapp']
        });
      }
    } else if (transaction_status === 'expire' || transaction_status === 'cancel' || transaction_status === 'deny') {
      await pembayaran.update({ status: transaction_status === 'expire' ? 'expired' : 'failed' });
    }

    return res.status(200).json({ message: 'Webhook processed' });
  } catch (err) {
    console.error('Midtrans webhook error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * POST /api/pembayaran/manual
 */
const createManualPayment = async (req, res) => {
  try {
    const { tagihan_id, jumlah_bayar, tanggal_bayar, catatan } = req.body;
    let bukti_url = null;
    if (req.file) {
      bukti_url = `/uploads/${req.file.filename}`;
    }

    const tagihan = await Tagihan.findByPk(tagihan_id, {
      include: [{ model: Warga, as: 'warga' }]
    });

    if (!tagihan) return error(res, 'Tagihan tidak ditemukan', 404);
    if (tagihan.status === 'lunas') return error(res, 'Tagihan sudah lunas', 400);

    await sequelize.transaction(async (t) => {
      const pembayaran = await Pembayaran.create({
        tagihan_id,
        dicatat_oleh: req.user.id,
        metode: 'manual',
        jumlah_bayar,
        tanggal_bayar,
        status: 'success',
        bukti_url,
        catatan
      }, { transaction: t });

      // Cek apakah sudah lunas
      // Logic sederhana: jika jumlah_bayar >= sisa tagihan, lunas.
      // Untuk Iuran RT biasanya bayar full.
      if (parseFloat(jumlah_bayar) >= parseFloat(tagihan.total_nominal)) {
        await tagihan.update({ status: 'lunas' }, { transaction: t });
      } else {
        await tagihan.update({ status: 'sebagian' }, { transaction: t });
      }

      await KasHarian.create({
        pembayaran_id: pembayaran.id,
        tanggal: tanggal_bayar,
        jenis: 'masuk',
        kategori: 'iuran',
        keterangan: `Penerimaan Tunai: Iuran RT ${tagihan.bulan}/${tagihan.tahun} - ${tagihan.warga.no_rumah}`,
        nominal: jumlah_bayar,
        bukti_url,
        dicatat_oleh: req.user.id
      }, { transaction: t });

      if (tagihan.warga.user_id) {
        await notificationService.notify(tagihan.warga.user_id, {
          title: 'Pembayaran Diterima',
          message: `Pembayaran iuran manual bulan ${tagihan.bulan}/${tagihan.tahun} sebesar Rp ${Number(jumlah_bayar).toLocaleString('id-ID')} telah dicatat oleh pengurus.`,
          type: 'pembayaran',
          refId: pembayaran.id,
          refType: 'pembayaran',
          channels: ['inapp', 'email'] // Maybe WhatsApp too
        });
      }
    });

    return success(res, null, 'Pembayaran manual berhasil dicatat', 201);
  } catch (err) {
    console.error('Manual payment error:', err);
    return error(res, 'Gagal mencatat pembayaran', 500);
  }
};

module.exports = { getAllPembayaran, createMidtransTransaction, midtransWebhook, createManualPayment };
