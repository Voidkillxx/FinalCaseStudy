import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Nav, Spinner } from 'react-bootstrap'; 
import { fetchOrders, cancelOrder } from '../utils/api';
import '../Styles/OrderHistory.css';


const formatToPesos = (amount) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
};

const STATUS_FILTERS = {
    'All': 'All',
    'Pending': 'To Pay / Pending',
    'Processing': 'To Ship / Processed',
    'Shipped': 'Shipping',
    'Delivered': 'Completed',
    'Cancelled': 'Cancelled',
};

const CancelConfirmModal = ({ show, handleClose, handleConfirm, orderId }) => {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="bg-warning text-dark">
                <Modal.Title><i className="bi bi-exclamation-triangle-fill"></i> Confirm Cancellation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to cancel Order <strong>#{orderId}</strong>?</p>
                <p className="text-danger fw-bold">This action cannot be undone, and the product stock will be returned to inventory.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Keep Order
                </Button>
                <Button variant="danger" onClick={handleConfirm}>
                    Yes, Cancel Order
                </Button>
            </Modal.Footer>
        </Modal>
    );
};


const OrderHistory = ({ showAlert }) => { 
    const [allOrders, setAllOrders] = useState([]); 
    const [filteredOrders, setFilteredOrders] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All'); 
    
    const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);

    const getOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchOrders(); 
            const sortedData = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setAllOrders(sortedData);
        } catch (err) {
            setError('Failed to fetch orders. Please check your network or try logging in again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        getOrders();
    }, [getOrders]);

    useEffect(() => {
        if (activeFilter === 'All') {
            setFilteredOrders(allOrders);
        } else {
            const statusKey = activeFilter; 
            const filtered = allOrders.filter(order => order.status.toLowerCase() === statusKey.toLowerCase());
            setFilteredOrders(filtered);
        }
    }, [allOrders, activeFilter]);


    const handleOpenCancelModal = (orderId) => {
        setOrderToCancel(orderId);
        setShowConfirmCancelModal(true);
    };

    const handleCloseCancelModal = () => {
        setShowConfirmCancelModal(false);
        setOrderToCancel(null);
    };

    const handleConfirmCancellation = async () => {
        if (!orderToCancel) return;

        handleCloseCancelModal();

        try {
            await cancelOrder(orderToCancel); 
            
            if(showAlert) {
                showAlert('Order successfully cancelled! The product stock has been restored.', 'success');
            } else {
                alert('Order successfully cancelled! The product stock has been restored.');
            }
            getOrders();
        } catch (err) {
            const message = err.message || 'Failed to cancel order due to an unexpected server issue.'; 
            if(showAlert) {
                showAlert(`Cancellation Error: ${message}`, 'danger');
            } else {
                alert(`Cancellation Error: ${message}`);
            }
            console.error('Cancellation failed:', err);
        }
    };

    const renderOrderItems = (orderItems) => (
        <ul className="order-items-list">
            {orderItems.map(item => (
                <li key={item.id} className="order-item-detail">
                    <span className="item-name"><strong>{item.product?.product_name || 'Product Not Found'}</strong></span>
                    <span className="item-qty">Qty: {item.quantity}</span>
                    <span className="item-price">{formatToPesos(item.price_at_purchase)}</span>
                </li>
            ))}
        </ul>
    );

    if (isLoading) {
        return (
            <div className="order-history-container text-center py-5">
                <Spinner animation="border" variant="success" className="me-2" />
                <h2 className="d-inline ms-2 text-success">Loading Orders...</h2>
            </div>
        );
    }

    if (error) {
        return <div className="order-history-container"><h2 className="error-message">{error}</h2></div>;
    }

    return (
        <div className="order-history-container">
            <h1>My Order History</h1>
            
            <Nav variant="tabs" defaultActiveKey="All" className="order-status-tabs">
                {Object.entries(STATUS_FILTERS).map(([key, label]) => (
                    <Nav.Item key={key}>
                        <Nav.Link 
                            eventKey={key} 
                            active={activeFilter === key} 
                            onClick={() => setActiveFilter(key)}
                        >
                            {label} ({allOrders.filter(o => key === 'All' ? true : o.status.toLowerCase() === key.toLowerCase()).length})
                        </Nav.Link>
                    </Nav.Item>
                ))}
            </Nav>

            <div className="order-list">
                {filteredOrders.length === 0 ? (
                    <h4 className="text-center text-muted p-5">
                        No orders found in the <strong>{STATUS_FILTERS[activeFilter]}</strong> category.
                    </h4>
                ) : (
                    filteredOrders.map(order => (
                        <div 
                            key={order.id} 
                            className={`order-card status-${order.status.toLowerCase().replace(/\s/g, '-')}`}
                        >
                            <div className="order-header">
                                <h2>Order ID: #{order.id}</h2>
                                <span className="order-status">{order.status}</span>
                            </div>

                            <p>Total Amount: <strong>{formatToPesos(order.total_amount)}</strong></p>
                            <p>Payment Type: <strong>{order.payment_type}</strong></p>
                            <p className="order-date">Placed On: {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}</p>
                            <p>Shipping Address: <strong>{order.shipping_address}</strong></p>
                            
                            <h3>Order Items:</h3>
                            {order.order_items && renderOrderItems(order.order_items)}

                            <div className="order-card-footer">
                                {(order.status === 'Pending' || order.status === 'Processing') && (
                                    <button 
                                        className="cancel-button" 
                                        onClick={() => handleOpenCancelModal(order.id)} 
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <CancelConfirmModal
                show={showConfirmCancelModal}
                handleClose={handleCloseCancelModal}
                handleConfirm={handleConfirmCancellation}
                orderId={orderToCancel}
            />
        </div>
    );
};

export default OrderHistory;