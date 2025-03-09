import axiosClient from './axiosClient';

const orderService = {
    getOrders: async (userId) => {
        // {
        //     "userId": 0,
        //     "productId": 0,
        //     "quantity": 0
        //   }
        try {
            const response = await axiosClient.get('/api/Orders');
            const values = response['$values'];
            const orderByUser = values.filter(order => order.userId === userId);
            return orderByUser;
            // {
            //     "$id": "1",
            //     "$values": [
            //       {
            //         "$id": "2",
            //         "orderId": 14,
            //         "userId": 1,
            //         "orderDate": "2025-03-05T15:37:02.253",
            //         "orderStatus": "Paid",
            //         "deliveryStatus": "Not Delivered",
            //         "deliveryAddress": null,
            //         "totalAmount": 498000,
            //         "note": null,
            //         "voucherId": null,
            //         "cancelRequests": {
            //           "$id": "3",
            //           "$values": []
            //         },
            //         "orderItems": {
            //           "$id": "4",
            //           "$values": []
            //         },
            //         "payments": {
            //           "$id": "5",
            //           "$values": []
            //         },
            //         "user": null,
            //         "voucher": null
            //       },
            //       {
            //         "$id": "6",
            //         "orderId": 15,
            //         "userId": 2,
            //         "orderDate": "2025-03-05T15:38:38.337",
            //         "orderStatus": "Paid",
            //         "deliveryStatus": "Not Delivered",
            //         "deliveryAddress": null,
            //         "totalAmount": 646380,
            //         "note": null,
            //         "voucherId": 1,
            //         "cancelRequests": {
            //           "$id": "7",
            //           "$values": []
            //         },
            //         "orderItems": {
            //           "$id": "8",
            //           "$values": []
            //         },
            //         "payments": {
            //           "$id": "9",
            //           "$values": []
            //         },
            //         "user": null,
            //         "voucher": null
            //       },
            //       {
            //         "$id": "10",
            //         "orderId": 17,
            //         "userId": 2,
            //         "orderDate": "2025-03-05T15:52:04.953",
            //         "orderStatus": "Paid",
            //         "deliveryStatus": "Not Delivered",
            //         "deliveryAddress": null,
            //         "totalAmount": 850500,
            //         "note": null,
            //         "voucherId": 1,
            //         "cancelRequests": {
            //           "$id": "11",
            //           "$values": []
            //         },
            //         "orderItems": {
            //           "$id": "12",
            //           "$values": []
            //         },
            //         "payments": {
            //           "$id": "13",
            //           "$values": []
            //         },
            //         "user": null,
            //         "voucher": null
            //       },
            //       {
            //         "$id": "14",
            //         "orderId": 18,
            //         "userId": 1,
            //         "orderDate": "2025-03-07T03:12:07.303",
            //         "orderStatus": "Pending",
            //         "deliveryStatus": "Not Delivered",
            //         "deliveryAddress": null,
            //         "totalAmount": 1603000,
            //         "note": null,
            //         "voucherId": null,
            //         "cancelRequests": {
            //           "$id": "15",
            //           "$values": []
            //         },
            //         "orderItems": {
            //           "$id": "16",
            //           "$values": []
            //         },
            //         "payments": {
            //           "$id": "17",
            //           "$values": []
            //         },
            //         "user": null,
            //         "voucher": null
            //       }
            //     ]
            //   }
        } catch (error) {
            console.error('Error:', error);
            throw error; 
        }
    },
    addtocard: async (userId, productId, quantity) => {
        // {
        //     "userId": 0,
        //     "productId": 0,
        //     "quantity": 0
        //   }
        try {
            const response = await axiosClient.post('/api/Orders/addtocart', {
                userId,
                productId,
                quantity
            });
            return response; 
        } catch (error) {
            console.error('Error:', error);
            throw error; 
        }
    },
    updatecartitem: async (orderItemId, quantity) => {
        try {
            const response = await axiosClient.put('/api/Orders/updatecartitem', {
                orderItemId,
                quantity
            });
            return response; 
        } catch (error) {
            console.error('Error:', error);
            throw error; 
        }
    },
    removefromcart: async (orderItemId) => {
        try {
            const response = await axiosClient.delete(`/api/Orders/removefromcart/${orderItemId}`);
            return response;
        } catch (error) {
            console.error('Error saving skin type:', error);
            throw error;
        }
    },
    applyvoucher: async (orderId,voucherId) => {
        try {
            const response = await axiosClient.get(`/api/Orders/applyvoucher`,{
                orderId,
                voucherId
            });
            return response; 
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error; 
        }
    },
    confirmpayment: async (orderId) => {
        try {
            const response = await axiosClient.get(`/api/Orders/confirmpayment`,{
                orderId,
            });
            return response; 
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error; 
        }
    }
};

export default orderService; 