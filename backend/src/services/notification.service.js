const { Notifikasi, User } = require('../models');
const mailService = require('./mail.service');
const waService = require('./whatsapp.service');

/**
 * Send notification to a single user
 * @param {number} userId
 * @param {object} opts - { title, message, type, refId, refType, channels }
 *   channels: ['inapp', 'email', 'whatsapp'] (default: ['inapp'])
 */
const notify = async (userId, opts) => {
  const { title, message, type = 'sistem', refId = null, refType = null, channels = ['inapp'] } = opts;

  // 1. Always create in-app notification
  await Notifikasi.create({
    user_id: userId,
    title,
    message,
    type,
    ref_id: refId,
    ref_type: refType
  });

  // Get user details for email/WA
  if (channels.includes('email') || channels.includes('whatsapp')) {
    const user = await User.findByPk(userId);
    if (!user) return;

    // 2. Send email
    if (channels.includes('email') && user.email) {
      try {
        await mailService.sendReminder(user.email, { bulan: '', tahun: '', total: message });
      } catch (err) {
        console.error('Email notification error:', err.message);
      }
    }

    // 3. Send WhatsApp
    if (channels.includes('whatsapp') && user.no_telepon) {
      try {
        await waService.sendMessage(user.no_telepon, `*${title}*\n\n${message}`);
      } catch (err) {
        console.error('WA notification error:', err.message);
      }
    }
  }
};

/**
 * Send notification to all users matching target role
 * @param {string} targetRole - 'semua', 'warga', 'pengurus'
 * @param {object} opts - same as notify()
 */
const notifyAll = async (targetRole, opts) => {
  let whereClause = {};

  if (targetRole === 'warga') {
    whereClause.role = 'warga';
  } else if (targetRole === 'pengurus') {
    whereClause.role = ['sekretaris', 'bendahara', 'rt', 'wakil_rt'];
  }
  // 'semua' = no filter

  const users = await User.findAll({ where: whereClause, attributes: ['id'] });

  for (const user of users) {
    await notify(user.id, opts);
  }
};

module.exports = { notify, notifyAll };
