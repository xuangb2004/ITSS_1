let io = null;

module.exports = {
  setIO(serverIO) {
    io = serverIO;
  },

  emitNotification(userId, payload) {
    try {
      if (!io) return;
      // Emit to room for that user
      io.to(`user_${userId}`).emit('notification', payload);
    } catch (err) {
      console.error('Emit notification error', err);
    }
  }
};
