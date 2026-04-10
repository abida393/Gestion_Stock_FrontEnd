/**
 * Checks if the current user has a specific permission.
 * Assumes the user object in localStorage has a 'permissions' array.
 * 
 * @param {string} permission - The permission name to check (e.g., 'produit.create')
 * @returns {boolean}
 */
export function hasPermission(permission) {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    // If user is admin by role, they might have all permissions bypass
    // but here we check the explicit permissions array as requested.
    return user?.permissions?.includes(permission) || user?.roles?.includes('admin');
  } catch {
    return false;
  }
}
