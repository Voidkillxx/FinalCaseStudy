import React, { useContext, useState } from 'react'; // Added useState
import { Row, Col, Image, Button, Form, Modal } from 'react-bootstrap'; // Added Modal
import { CartContext } from '../context/CartContext';
import { calculateSellingPrice } from '../utils/PricingUtils'; 
import '../Styles/CartItem.css'; 

const CartItem = ({ item }) => {
  const {
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    selectedItems,
    toggleSelectItem,
    loading 
  } = useContext(CartContext);

  // --- NEW: State for the Delete Confirmation Modal ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!item) return null;

  const product = item.product || {};
  const isSelected = selectedItems.includes(item.id);

  // --- Handlers ---
  
  // 1. Opens the modal instead of window.confirm
  const initiateRemove = () => {
      setShowDeleteModal(true);
  };

  // 2. Closes the modal without deleting
  const handleCloseModal = () => {
      setShowDeleteModal(false);
  };

  // 3. Actually performs the delete (called by "Yes" button in modal)
  const confirmRemove = () => {
      removeFromCart(item.id);
      setShowDeleteModal(false);
  };

  const handleDecrease = () => {
      if (item.quantity === 1) {
          // If quantity is 1, ask for confirmation via Modal
          initiateRemove();
      } else {
          decreaseQuantity(item.id);
      }
  };

  const handleIncrease = () => {
      const currentQuantity = item.quantity || 0;
      const stock = product.stock || 0;

      if (currentQuantity + 1 > stock) {
          // You could also make this a Modal, but alert is okay for errors
          alert(`Cannot add more than ${stock} units of ${product.product_name}.`);
          return;
      }

      increaseQuantity(item.id);
  };
  // ---------------------------------

  const quantity = item.quantity || 0;
  const price = parseFloat(product.price) || 0;
  const discount = parseFloat(product.discount) || 0;
  const sellingPrice = calculateSellingPrice(price, discount);

  return (
    <>
      <Row className="align-items-center cart-item-row g-0 shadow-sm mb-3 bg-white rounded border"> 
        {/* 1. Left: Checkbox & Image */}
        <Col xs={4} md={2} className="d-flex align-items-center p-2">
          <Form.Check
            type="checkbox"
            id={`select-item-${item.id}`}
            checked={isSelected}
            onChange={() => toggleSelectItem(item.id)}
            aria-label={`Select ${product.product_name}`}
            className="me-2"
          />
          <div className="cart-item-img-wrapper" style={{width: '80px', height: '80px'}}>
             <Image 
                src={product.image_url || '/img/placeholder.png'} 
                alt={product.product_name} 
                fluid 
                rounded 
                style={{width: '100%', height: '100%', objectFit: 'cover'}}
             />
          </div>
        </Col>

        {/* 2. Middle: Info */}
        <Col xs={4} md={4} className="ps-2">
          <h5 className="cart-item-name text-truncate mb-1" title={product.product_name}>
              {product.product_name || 'Unknown Product'}
          </h5> 
          <p className="cart-item-unit-price mb-0 text-muted small">
              Unit: ₱{sellingPrice.toFixed(2)}
          </p> 
        </Col>

        {/* 3. Right: Actions (Qty, Total, Remove) */}
        <Col xs={4} md={6}>
          <div className="cart-item-actions d-flex flex-column flex-md-row align-items-end align-items-md-center justify-content-md-between p-2">
              
              {/* Qty Controls */}
              <div className="qty-controls d-flex align-items-center mb-1 mb-md-0">
                  <Button variant="outline-secondary" size="sm" className="qty-btn" onClick={handleDecrease} disabled={loading}>-</Button>
                  <span className="qty-val mx-2 fw-bold">{quantity}</span>
                  <Button variant="outline-secondary" size="sm" className="qty-btn" onClick={handleIncrease} disabled={loading}>+</Button>
              </div>

              {/* Total Price */}
              <strong className="cart-item-total mb-1 mb-md-0 mx-md-3 text-success">
                  ₱{(quantity * sellingPrice).toFixed(2)}
              </strong> 
              
              {/* Remove Link -> Triggers initiateRemove */}
              <div onClick={initiateRemove} className="cart-item-remove text-danger" role="button" style={{cursor: 'pointer'}}>
                  <small><i className="bi bi-trash"></i> Remove</small>
              </div>
          </div>
        </Col>
      </Row>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Modal show={showDeleteModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Remove Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove <strong>{product.product_name}</strong> from your cart?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmRemove}>
            Remove
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CartItem;