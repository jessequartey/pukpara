type FormDataType = Record<string, unknown>;

const STORAGE_KEYS = {
	ORGANIZATION: "admin-organization-draft",
	USER: "admin-user-draft",
	FARMER: "admin-farmer-draft",
} as const;

export class FormPersistence {
	private static isClient = typeof window !== "undefined";

	static save<T extends FormDataType>(
		key: keyof typeof STORAGE_KEYS,
		data: T,
	): void {
		if (!FormPersistence.isClient) return;

		try {
			const serializedData = JSON.stringify(data);
			localStorage.setItem(STORAGE_KEYS[key], serializedData);
		} catch (error) {
			console.error(`Failed to save form data for ${key}:`, error);
		}
	}

	static load<T extends FormDataType>(
		key: keyof typeof STORAGE_KEYS,
	): T | null {
		if (!FormPersistence.isClient) return null;

		try {
			const serializedData = localStorage.getItem(STORAGE_KEYS[key]);
			if (!serializedData) return null;

			const parsedData = JSON.parse(serializedData);
			return parsedData as T;
		} catch (error) {
			console.error(`Failed to load form data for ${key}:`, error);
			return null;
		}
	}

	static clear(key: keyof typeof STORAGE_KEYS): void {
		if (!FormPersistence.isClient) return;

		try {
			localStorage.removeItem(STORAGE_KEYS[key]);
		} catch (error) {
			console.error(`Failed to clear form data for ${key}:`, error);
		}
	}

	static hasSavedData(key: keyof typeof STORAGE_KEYS): boolean {
		if (!FormPersistence.isClient) return false;

		return localStorage.getItem(STORAGE_KEYS[key]) !== null;
	}

	static getSavedTimestamp(key: keyof typeof STORAGE_KEYS): number | null {
		if (!FormPersistence.isClient) return null;

		try {
			const serializedData = localStorage.getItem(STORAGE_KEYS[key]);
			if (!serializedData) return null;

			const parsedData = JSON.parse(serializedData);
			return parsedData._timestamp || null;
		} catch (error) {
			console.error(`Failed to get timestamp for ${key}:`, error);
			return null;
		}
	}

	static clearAll(): void {
		if (!FormPersistence.isClient) return;

		Object.values(STORAGE_KEYS).forEach((key) => {
			try {
				localStorage.removeItem(key);
			} catch (error) {
				console.error(`Failed to clear form data for ${key}:`, error);
			}
		});
	}
}

export function withTimestamp<T extends FormDataType>(
	data: T,
): T & { _timestamp: number } {
	return {
		...data,
		_timestamp: Date.now(),
	};
}

export function stripTimestamp<T extends FormDataType>(
	data: T & { _timestamp?: number },
): T {
	const { _timestamp, ...rest } = data;
	return rest as T;
}

export function formatTimestamp(timestamp: number): string {
	const date = new Date(timestamp);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMins < 1) return "just now";
	if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
	if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

	return date.toLocaleDateString();
}
