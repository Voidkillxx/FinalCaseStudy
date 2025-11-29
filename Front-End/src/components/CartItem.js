import React, { useContext, useState } from 'react';
import { Row, Col, Image, Button, Form } from 'react-bootstrap';
import { CartContext } from '../context/CartContext';
import RemoveItemModal from './RemoveItemModal';
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

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null); 
  
  const handleShowRemoveModal = (item) => {
    setItemToRemove(item);
    setShowRemoveModal(true);
  };

  const handleCloseRemoveModal = () => {
    setShowRemoveModal(false);
    setItemToRemove(null); 
  };

  const handleConfirmRemove = async (itemId) => {
    handleCloseRemoveModal(); 
    await removeFromCart(itemId); 
  };

  if (!item) return null;

  const product = item.product || {};

  const isSelected = selectedItems.includes(item.id);

  const handleRemove = () => {
    // Explicit Remove: Always triggers the modal
    handleShowRemoveModal(item);
  };

  const handleDecrease = () => {
    // Decrease Quantity: If quantity is 1, trigger the modal, NOT direct removal.
    if (item.quantity === 1) {
      handleShowRemoveModal(item); 
    } else {
      decreaseQuantity(item.id); 
    }
  };

  const handleIncrease = () => {
    const currentQuantity = item.quantity || 0;
    const stock = product.stock || 0;

    if (currentQuantity + 1 > stock) {
      // FIX: Using alert() here, you may want to change this to a dialog later!
      alert(`Cannot add more than ${stock} units of ${product.product_name}.`);
      return;
    }

    increaseQuantity(item.id);
  };

  const quantity = item.quantity || 0;
  
  const price = parseFloat(product.price) || 0;
  const discount = parseFloat(product.discount) || 0;
  
  const sellingPrice = calculateSellingPrice(price, discount);

  return (
    <>
      <Row className="align-items-center cart-item-row g-0 shadow-sm mb-3 bg-white rounded border"> 
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
                  src={product.image_url} 
                  alt={product.product_name} 
                  fluid 
                  rounded 
                  style={{width: '100%', height: '100%', objectFit: 'cover'}}
              />
          </div>
        </Col>

        <Col xs={4} md={4} className="ps-2">
          <h5 className="cart-item-name text-truncate mb-1" title={product.product_name}>
              {product.product_name || 'Unknown Product'}
          </h5> 
          <p className="cart-item-unit-price mb-0 text-muted small">
              Unit: ₱{sellingPrice.toFixed(2)}
          </p> 
        </Col>

        <Col xs={4} md={6}>
          <div className="cart-item-actions d-flex flex-column flex-md-row align-items-end align-items-md-center justify-content-md-between p-2">
              
              <div className="qty-controls d-flex align-items-center mb-1 mb-md-0">
                  <Button variant="outline-secondary" size="sm" className="qty-btn" onClick={handleDecrease} disabled={loading}>-</Button>
                  <span className="qty-val mx-2 fw-bold">{quantity}</span>
                  <Button variant="outline-secondary" size="sm" className="qty-btn" onClick={handleIncrease} disabled={loading}>+</Button>
              </div>

              <strong className="cart-item-total mb-1 mb-md-0 mx-md-3 text-success">
                  ₱{(quantity * sellingPrice).toFixed(2)}
              </strong> 
              
              <div onClick={handleRemove} className="cart-item-remove text-danger" role="button" style={{cursor: 'pointer'}}>
                  <small><i className="bi bi-trash"></i> Remove</small>
              </div>
          </div>
        </Col>
      </Row>

      <RemoveItemModal
          show={showRemoveModal}
          handleClose={handleCloseRemoveModal}
          item={itemToRemove} 
          handleConfirmRemove={handleConfirmRemove}
      />
    </>
  );
};

export default CartItem;