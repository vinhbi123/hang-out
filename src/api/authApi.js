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
    };
export default authApi;