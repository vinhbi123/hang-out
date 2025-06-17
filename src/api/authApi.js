const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authApi = {
    authenticate: async (authData) => {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'text/plain',
            },
            body: JSON.stringify(authData),
        });
        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.status}`);
        }
        return response.json();
    },

    registerBusiness: async (formData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/business/register-business-account`, {
                method: 'POST',
                body: formData, // FormData tự động set Content-Type: multipart/form-data
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Business registration failed with status: ${response.status} - ${errorData.message || 'No details provided'}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error registering business:', error.message);
            throw error;
        }
    },

    getCategories: async ({ page, size }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/categories?page=${page}&size=${size}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch categories: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    requestOtp: async (otpData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'text/plain',
                },
                body: JSON.stringify(otpData),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Request OTP failed with status: ${response.status} - ${errorData.message || 'No details provided'}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error requesting OTP:', error);
            throw error;
        }
    },
};

export default authApi;