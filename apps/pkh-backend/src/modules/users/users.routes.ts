import { Router } from 'express';
import { adminAuthMiddleware, requireAuth } from '../../middleware';
import { db } from '../../db';
import { users, pendampings } from '../../db/schema';
import { eq, count, desc } from 'drizzle-orm';
import { calculateOffset, paginate } from '../../lib/utils';
import { ApiError } from '../../middleware/error';

const router = Router();

// Get current user's pendamping profile (requires auth, not admin)
router.get('/me/profile', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw ApiError.unauthorized('User not authenticated');
        }

        // Get pendamping data for current user
        const pendamping = await db.query.pendampings.findFirst({
            where: eq(pendampings.userId, userId),
        });

        res.json({
            success: true,
            data: pendamping ? {
                wilayahBinaan: pendamping.wilayahBinaan,
                nik: pendamping.nik,
                noHp: pendamping.noHp,
            } : null
        });
    } catch (error) {
        next(error);
    }
});

// Admin routes below
router.use(adminAuthMiddleware);

// List all users
router.get('/', async (req, res, next) => {
    try {
        const { page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const offset = calculateOffset(pageNum, limitNum);

        const [data, [{ total }]] = await Promise.all([
            db.query.users.findMany({
                columns: { id: true, name: true, email: true, role: true, createdAt: true },
                orderBy: desc(users.createdAt),
                limit: limitNum,
                offset,
            }),
            db.select({ total: count() }).from(users),
        ]);

        res.json({ success: true, ...paginate(data, total, { page: pageNum, limit: limitNum }) });
    } catch (error) { next(error); }
});

// Get user by ID
router.get('/:id', async (req, res, next) => {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, req.params.id),
            columns: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
        });
        if (!user) throw ApiError.notFound('User tidak ditemukan');
        res.json({ success: true, data: user });
    } catch (error) { next(error); }
});

// Update user role
router.patch('/:id/role', async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!role || !['admin', 'pendamping'].includes(role)) {
            throw ApiError.badRequest('Role harus admin atau pendamping');
        }

        const [updated] = await db
            .update(users)
            .set({ role, updatedAt: new Date() })
            .where(eq(users.id, req.params.id))
            .returning();

        if (!updated) throw ApiError.notFound('User tidak ditemukan');
        res.json({ success: true, message: 'Role berhasil diperbarui', data: updated });
    } catch (error) { next(error); }
});

// Delete user
router.delete('/:id', async (req, res, next) => {
    try {
        // Prevent self-deletion
        if (req.params.id === req.user?.id) {
            throw ApiError.badRequest('Tidak dapat menghapus akun sendiri');
        }

        const [deleted] = await db.delete(users).where(eq(users.id, req.params.id)).returning();
        if (!deleted) throw ApiError.notFound('User tidak ditemukan');
        res.json({ success: true, message: 'User berhasil dihapus' });
    } catch (error) { next(error); }
});

export const usersRoutes = router;
