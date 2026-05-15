import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as tenantService from '../services/tenant.service';
import User from '../models/User';

export async function getTenantInfo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = req.user!.tenantId;
    const tenant = await (await import('../models/Tenant')).default.findById(tenantId);
    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }
    res.json(tenant);
  } catch (err) {
    next(err);
  }
}

export async function getStaff(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = req.user!.tenantId;
    const users = await User.find({ tenantId }).select('-password');
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function addStaff(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = req.user!.tenantId;
    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !role) {
      res.status(400).json({ error: 'email, password, name, role required' });
      return;
    }
    const user = await User.create({ tenantId, email, password, name, role });
    res.status(201).json({ id: user._id, name: user.name, role: user.role, email: user.email });
  } catch (err) {
    next(err);
  }
}

export async function removeStaff(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = req.user!.tenantId;
    await User.findOneAndUpdate({ _id: req.params.id, tenantId }, { isActive: false });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function resolveTenantBySlug(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenant = await tenantService.getTenantBySlug(req.params.slug);
    res.json({
      id: tenant._id,
      name: tenant.name,
      slug: tenant.slug,
      logo: tenant.logo,
      currency: tenant.currency,
    });
  } catch (err) {
    next(err);
  }
}
