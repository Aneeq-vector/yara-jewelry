'use server';

import { validateSession, getAdminClient } from '@/lib/pocketbase-server';


export async function getCustomersAction(page = 1, perPage = 20, search = '', status = 'All Status') {
  try {
    await validateSession();
    const adminPb = await getAdminClient();
    
    // Build filter string for users
    const filters: string[] = ['role = "customer"'];
    if (search) {
      filters.push(`(name ~ "${search}" || email ~ "${search}")`);
    }
    if (status === 'Active') {
      filters.push(`status = "Active"`);
    } else if (status === 'Inactive') {
      filters.push(`status = "Inactive"`);
    }
    
    // 1. Fetch paginated users
    const usersRes = await adminPb.collection('users').getList(page, perPage, {
      $autoCancel: false,
      filter: filters.join(' && '),
      sort: '-created',
      fields: 'id,name,email,phone,status,created,updated,avatar'
    });

    const userIds = usersRes.items.map(u => `"${u.id}"`).join(',');

    let orders: any[] = [];
    let addresses: any[] = [];

    // 2. Fetch orders and addresses ONLY for these specific users
    if (usersRes.items.length > 0) {
      // Use IN-like syntax in PocketBase (or || conditions)
      // PocketBase filter syntax for multiple IDs: id ?= "val1" || id ?= "val2"
      // Actually, PocketBase supports IN operator as of recent versions, but fallback to multiple ORs is safer
      const userIdFilter = usersRes.items.map(u => `user = "${u.id}"`).join(' || ');
      
      const [ordersRes, addressesRes] = await Promise.all([
        adminPb.collection('orders').getFullList({
          filter: userIdFilter,
          fields: 'user,totalAmount'
        }),
        adminPb.collection('addresses').getFullList({
          filter: userIdFilter,
          fields: 'id,user,name,street,city,state,zip,phone,isDefault'
        })
      ]);
      orders = ordersRes;
      addresses = addressesRes;
    }
    
    const customers = usersRes.items.map((record) => {
      // Find orders for this customer
      const customerOrders = orders.filter((o: any) => o.user === record.id);
      
      const orderCount = customerOrders.length;
      const spentAmount = customerOrders.reduce((total: number, order: any) => total + (Number(order.totalAmount) || 0), 0);
      
      const joinedDate = new Date(record.created).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      return {
        id: record.id,
        name: record.name || 'Unknown',
        email: record.email,
        phone: record.phone || '',
        orders: orderCount,
        spent: `Rs. ${spentAmount.toLocaleString()}`,
        joined: joinedDate,
        status: record.status || 'Active', // Default to Active if not set
        avatar: record.avatar || '',
        addresses: addresses.reduce((acc: any[], a: any) => {
          if (a.user === record.id) {
            acc.push({
              id: a.id,
              name: a.name,
              street: a.street,
              city: a.city,
              state: a.state,
              zipCode: a.zip,
              phone: a.phone,
              isDefault: a.isDefault
            });
          }
          return acc;
        }, [])
      };
    });
    
    return { 
      success: true, 
      customers,
      totalItems: usersRes.totalItems,
      totalPages: usersRes.totalPages
    };
  } catch (error: any) {
    console.error('getCustomersAction error:', error.message);
    return { success: false, error: error.message || 'Failed to fetch customers' };
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    await validateSession();
    const adminPb = await getAdminClient();
    await adminPb.collection('users').delete(id);
    
    // Realtime invalidation covers Admin UI
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete customer:', error);
    return { success: false, error: error.message || 'Failed to delete customer' };
  }
}

export async function deleteCustomersAction(ids: string[]) {
  try {
    await validateSession();
    const adminPb = await getAdminClient();
    
    // Delete all selected customers concurrently
    await Promise.all(
      ids.map(id => adminPb.collection('users').delete(id))
    );

    // Realtime invalidation covers Admin UI
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete customers:', error);
    return { success: false, error: error.message || 'Failed to delete customers' };
  }
}

export async function updateCustomerStatusAction(id: string, status: string) {
  try {
    await validateSession();
    const adminPb = await getAdminClient();
    // Update the customer record with the new status
    // Note: This requires a 'status' field to exist in the 'users' collection in PocketBase.
    await adminPb.collection('users').update(id, { status });
    
    // Realtime invalidation covers Admin UI
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update customer status:', error);
    return { success: false, error: error.message || 'Failed to update customer status' };
  }
}
