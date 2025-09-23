/**
 * Check if a user has admin roles
 */
export function isUserAdmin(user: unknown): boolean {
	if (!user || typeof user !== "object") {
		return false;
	}

	const userRecord = user as
		| {
				role?: unknown;
				roles?: unknown;
				admin?: { roles?: unknown };
		  }
		| undefined;

	const roleField = userRecord?.role;
	const directRole = typeof roleField === "string" ? roleField : null;
	const rolesField = userRecord?.roles;
	const arrayRoles = Array.isArray(rolesField)
		? rolesField.filter((role): role is string => typeof role === "string")
		: [];
	const adminField = userRecord?.admin;
	const pluginRolesRaw = adminField?.roles;
	const pluginRoles = Array.isArray(pluginRolesRaw)
		? pluginRolesRaw.filter((role): role is string => typeof role === "string")
		: [];

	const rolesToCheck = [directRole, ...arrayRoles, ...pluginRoles].filter(
		(role): role is string => typeof role === "string" && role.length > 0,
	);
	const adminRoles = new Set(["admin", "supportAdmin", "userAc"]);

	return rolesToCheck.some((role) => adminRoles.has(role));
}
