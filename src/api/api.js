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
        body: formData,
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
  editBusiness: async (businessId, formData) => {
    if (!businessId) {
      throw new Error('businessId is required');
    }
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/business/edit-business/${businessId}`, {
        method: 'PATCH',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Edit business failed with status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error editing business with businessId ${businessId}:`, error);
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
  getCategories: async ({ page = 1, size = 30, sortBy = '', isAsc = true } = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(sortBy && { sortBy }),
      isAsc: isAsc.toString(),
    }).toString();

    const response = await fetch(`${API_BASE_URL}/api/v1/categories?${queryParams}`, {
      method: 'GET',
      headers: {
        'accept': 'text/plain',
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    return response.json();
  },

  createCategory: async ({ name, image }) => {
    if (!name) {
      throw new Error('Name is required');
    }
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/categories`, {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, image }),
      });
      if (!response.ok) {
        throw new Error(`Create category failed with status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  updateCategory: async ({ id, name, image }) => {
    if (!id) {
      throw new Error('Category ID is required');
    }
    if (!name) {
      throw new Error('Name is required');
    }
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'accept': 'text/plain',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, image }),
      });
      if (!response.ok) {
        throw new Error(`Update category failed with status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating category with id ${id}:`, error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    if (!id) {
      throw new Error('Category ID is required');
    }
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Delete category failed with status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error deleting category with id ${id}:`, error);
      throw error;
    }
  },
  getBusinessByOwner: async ({ pageNumber = 1, pageSize = 10 } = {}) => {
    const queryParams = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    }).toString();

    const response = await fetch(`${API_BASE_URL}/api/v1/business/get-business-by-owner?${queryParams}`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch businesses by owner: ${response.status}`);
    }

    return response.json();
  },
  createEvent: async (formData) => {
    const token = getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }
    try {
        console.log('Sending FormData:', Array.from(formData.entries())); // Debug FormData
        const response = await fetch(`${API_BASE_URL}/api/v1/events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Create event failed with status: ${response.status} - ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
},


  // ... existing functions remain unchanged ...

  getReviews: async ({ page = 1, size = 10, sortBy = '', isAsc = true, businessId = '' } = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(sortBy && { sortBy }),
      isAsc: isAsc.toString(),
      ...(businessId && { businessId }),
    }).toString();

    const response = await fetch(`${API_BASE_URL}/api/v1/reviews?${queryParams}`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.status}`);
    }

    return response.json();
  },
  
  editVoucher: async (voucherId, data) => {
    if (!voucherId) {
      throw new Error('voucherId is required');
    }
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/voucher/edit-voucher/${voucherId}`, {
        method: 'PATCH',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Edit voucher failed with status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error editing voucher with voucherId ${voucherId}:`, error);
      throw error;
    }
  },

  // Thêm hàm DELETE delete-voucher
  deleteVoucher: async (voucherId) => {
    if (!voucherId) {
      throw new Error('voucherId is required');
    }
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/voucher/delete-voucher/${voucherId}`, {
        method: 'DELETE',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Delete voucher failed with status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error deleting voucher with voucherId ${voucherId}:`, error);
      throw error;
    }
  },
  getMyEvents: async ({ page = 1, size = 10 } = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    }).toString();
  
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/events/my?${queryParams}`, {
        method: 'GET', // Thay POST thành GET
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch my events: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error fetching my events:', error);
      throw error;
    }
  },
  getEvent: async (eventId) => {
    if (!eventId) {
      throw new Error('eventId is required');
    }
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const queryParams = new URLSearchParams({ eventId }).toString();
      const response = await fetch(`${API_BASE_URL}/api/v1/get-event?${queryParams}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch event: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching event with eventId ${eventId}:`, error);
      throw error;
    }
  },
  deleteEvent: async (eventId) => {
    if (!eventId) {
      throw new Error('eventId is required');
    }
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/delete-event/${eventId}`, {
        method: 'DELETE',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Delete event failed with status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error deleting event with eventId ${eventId}:`, error);
      throw error;
    }
  },
  editEvent: async (eventId, formData) => {
    if (!eventId) {
      throw new Error('eventId is required');
    }
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/edit-event/${eventId}`, {
        method: 'PATCH',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Edit event failed with status: ${response.status} - ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error editing event with eventId ${eventId}:`, error);
      throw error;
    }
  },
  getVoucherByBusinessOwner: async ({ pageNumber = 1, pageSize = 10 } = {}) => {
    const queryParams = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    }).toString();
  
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/voucher/get-voucher-by-businees-owner?${queryParams}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch vouchers by business owner: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error fetching vouchers by business owner:', error);
      throw error;
    }
  },
  editVoucher: async (voucherId, data) => {
    if (!voucherId) {
      throw new Error('voucherId is required');
    }
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/voucher/edit-voucher/${voucherId}`, {
        method: 'PATCH',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Edit voucher failed with status: ${response.status} - ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error editing voucher with voucherId ${voucherId}:`, error);
      throw error;
    }
  },

  // Hàm xóa voucher
  deleteVoucher: async (voucherId) => {
    if (!voucherId) {
      throw new Error('voucherId is required');
    }
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/voucher/delete-voucher/${voucherId}`, {
        method: 'DELETE',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete voucher failed with status: ${response.status} - ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error deleting voucher with voucherId ${voucherId}:`, error);
      throw error;
    }
  },
  createVoucher: async (voucherData) => {
    if (!voucherData || !voucherData.percent || !voucherData.voucherName || !voucherData.validFrom || !voucherData.validTo || !voucherData.quantity) {
      throw new Error('All voucher fields (percent, voucherName, validFrom, validTo, quantity) are required');
    }
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/voucher/create-voucher`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(voucherData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Create voucher failed with status: ${response.status} - ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating voucher:', error);
      throw error;
    }
  },

};

export default api;