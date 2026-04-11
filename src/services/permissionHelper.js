/**
 * RBAC helpers — reads the user object stored in localStorage by authService.
 *
 * The UserResource returned by Laravel includes:
 *   { roles: ["admin"] | ["user"], permissions: ["produit.create", ...] }
 */

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    return {};
  }
}

/**
 * Returns true if the current user is an Administrator.
 * Uses multiple detection strategies to be resilient to different user object shapes.
 */
export function isAdmin() {
  try {
    const user = getUser();
    if (!user || !user.id) return false;

    // Strategy 1: Spatie getRoleNames() → array of strings ["admin"]
    const roles = user?.roles ?? [];
    if (Array.isArray(roles)) {
      const found = roles.some(r => {
        const name = (typeof r === 'string' ? r : r?.name ?? '').toLowerCase();
        return name === 'admin' || name === 'administrateur';
      });
      if (found) return true;
    }

    // Strategy 2: roles as a single string
    if (typeof roles === 'string') {
      if (roles.toLowerCase().includes('admin')) return true;
    }

    // Strategy 3: role_id or role as integer (1 = admin)
    if (user?.role_id === 1 || user?.role === 1) return true;

    // Strategy 4: JSON stringify fallback (catches any nested structure)
    const dump = JSON.stringify(user.roles ?? user.role ?? '').toLowerCase();
    if (dump.includes('"admin"') || dump.includes("'admin'")) return true;

    return false;
  } catch {
    return false;
  }
}

/**
 * Returns true if the current user has the given role name.
 * @param {string} role  e.g. 'admin' | 'user'
 */
export function hasRole(role) {
  if (role === 'admin') return isAdmin();
  try {
    const user = getUser();
    const roles = user?.roles ?? [];
    if (Array.isArray(roles)) {
      return roles.some(r =>
        (typeof r === 'string' ? r : r?.name ?? '').toLowerCase() === role.toLowerCase()
      );
    }
    return JSON.stringify(roles).toLowerCase().includes(role.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Checks if the current user has a specific Spatie permission.
 * Admins implicitly have every permission.
 * @param {string} permission  e.g. 'produit.create'
 */
export function hasPermission(permission) {
  try {
    if (isAdmin()) return true;
    const user = getUser();
    const perms = user?.permissions ?? [];
    return perms.some(p =>
      (typeof p === 'string' ? p : p?.name ?? '') === permission
    );
  } catch {
    return false;
  }
}
