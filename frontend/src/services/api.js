// Use environment variable for API base URL, fallback to "/api" for development proxy
// If VITE_API_BASE_URL is set (production), ensure it ends with /api
const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
const API_BASE_URL = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;

export const login = async (email, password) => {
	const response = await fetch(`${API_BASE_URL}/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, password }),
	});

	if (!response.ok) {
		const error = await response.json();
		// Handle validation errors (400) with details field
		const errorMessage = error.details || error.message || "Login failed";
		throw new Error(errorMessage);
	}

	return response.json();
};

export const signUp = async (name, email, password) => {
	const response = await fetch(`${API_BASE_URL}/auth/signup`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name, email, password }),
	});

	if (!response.ok) {
		const error = await response.json();
		// Handle validation errors (400) with details field
		const errorMessage = error.details || error.message || "Sign up failed";
		throw new Error(errorMessage);
	}

	return response.json();
};
