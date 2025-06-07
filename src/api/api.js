const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getToken = () => localStorage.getItem('accessToken');

const api = {
  getBusiness: async ({ pageNumber = 1, pageSize = 10, category = '', province = '', businessName = '' } = {}) => {
    const queryParams = new URLSearchParams({
      pageNumber,
      pageSize,
      ...(category && { category }),
      ...(province && { province }),
      ...(businessName && { businessName }),
    }).toString();

    const response = await fetch(`${API_BASE_URL}/api/v1/business/get-business?${queryParams}`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch businesses: ${response.status}`);
    }

    return response.json();
  },

  getBusinessDetail: async (businessId) => {
    if (!businessId) {
      throw new Error('businessId is required');
    }
    const token = getToken();
    try {
      const queryParams = new URLSearchParams({ businessId }).toString();
      const response = await fetch(`${API_BASE_URL}/api/v1/business/get-business-detail?${queryParams}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error(`Fetch business detail failed with status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching business detail for businessId ${businessId}:`, error);
      throw error;
    }
  },

  deleteBusiness: async (businessId) => {
    if (!businessId) {
      throw new Error('businessId is required');
    }
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/business/delete-business/${businessId}`, {
        method: 'DELETE',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Delete business failed with status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error deleting business with businessId ${businessId}:`, error);
      throw error;
    }
  },
  createBusinessOwner: async (formData) => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/business/create-business-owner`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData, // Sử dụng FormData để gửi file và dữ liệu
      });
      if (!response.ok) {
        throw new Error(`Create business owner failed with status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating business owner:', error);
      throw error;
    }
  },
  
  getCategories: async ({ page = 1, size = 1000, sortBy = '', isAsc = true } = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(sortBy && { sortBy }),
      ...(isAsc && { isAsc: isAsc.toString() }),
    }).toString();
  
    const response = await fetch(`${API_BASE_URL}/api/v1/categories?${queryParams}`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${getToken()}`,
      },
    });
  
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
  
    return response.json();
  },
  getUsers: async ({ page = 1, size = 10, sortBy = '', isAsc = true } = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(sortBy && { sortBy }),
      ...(isAsc && { isAsc: isAsc.toString() }),
    }).toString();

    const response = await fetch(`${API_BASE_URL}/api/v1/users?${queryParams}`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    return response.json();
  },

  deleteUser: async (id) => {
    if (!id) {
      throw new Error('id is required');
    }
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${id}/remove`, {
        method: 'DELETE',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Delete user failed with status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error deleting user with id ${id}:`, error);
      throw error;
    }
  },
};

export default api;