import prisma from "../services/prisma.js";

const PAGE_SIZE = 20;

/** GET /api/notifications — paginated, most recent first */
async function listNotifications(req, res, next) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  try {
    const [notifications, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where: { userId: req.user.sub },
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.notification.count({ where: { userId: req.user.sub } }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.sub, isRead: false },
    });

    return res.json({
      notifications,
      total,
      unreadCount,
      page,
      pages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    return next(error);
  }
}

/** PATCH /api/notifications/:id/read — mark one as read */
async function markRead(req, res, next) {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });
    if (notification.userId !== req.user.sub)
      return res.status(403).json({ message: "Access denied" });

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    return res.json({ notification: updated });
  } catch (error) {
    return next(error);
  }
}

/** PATCH /api/notifications/read-all — mark all user's as read */
async function markAllRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.sub, isRead: false },
      data: { isRead: true },
    });
    return res.json({ message: "All notifications marked as read" });
  } catch (error) {
    return next(error);
  }
}

export { listNotifications, markRead, markAllRead };
