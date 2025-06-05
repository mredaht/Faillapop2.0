import React, { useState } from 'react';
import { Item, ItemState } from '../types/Item';
import { ethers } from 'ethers';

interface ItemDetailsProps {
  item: Item;
  onClose: () => void;
  onBuy: (item: Item) => Promise<void>;
  onDispute?: (item: Item, reason: string) => Promise<void>;
  onConfirmReceipt?: (item: Item) => Promise<void>;
  userAddress?: string | null;
  isOpen: boolean;
}

export const ItemDetails: React.FC<ItemDetailsProps> = ({
  item,
  onClose,
  onBuy,
  onDispute,
  onConfirmReceipt,
  userAddress,
  isOpen
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  if (!isOpen) return null;

  const handleBuy = async () => {
    try {
      setLoading(true);
      setError(null);
      await onBuy(item);
      onClose();
    } catch (error) {
      setError('Error buying item');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!onDispute || !disputeReason) return;
    
    try {
      setLoading(true);
      setError(null);
      await onDispute(item, disputeReason);
      onClose();
    } catch (error) {
      setError('Error disputing item');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!onConfirmReceipt) return;
    
    try {
      setLoading(true);
      setError(null);
      await onConfirmReceipt(item);
      onClose();
    } catch (error) {
      setError('Error confirming receipt');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Simplified state checks based on isSold
  const canBuy = !item.isSold && userAddress && userAddress.toLowerCase() !== item.seller.toLowerCase();
  const canDispute = false; // Disabled for now as we don't have dispute state
  const canConfirmReceipt = false; // Disabled for now as we don't have receipt confirmation state

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button onClick={onClose} className="modal-close">×</button>

        <h2>{item.name}</h2>
        <p className="description">{item.description}</p>
        
        <div className="details">
          <p><strong>Price:</strong> {item.price} ETH</p>
          <p><strong>Seller:</strong> {`${item.seller.slice(0, 6)}...${item.seller.slice(-4)}`}</p>
          <p><strong>Status:</strong> {item.isSold ? 'Sold' : 'Available'}</p>
        </div>

        {canBuy && (
          <button
            onClick={handleBuy}
            disabled={loading}
            className="button primary"
          >
            {loading ? 'Processing...' : 'Buy Now'}
          </button>
        )}

        {canDispute && (
          <div className="dispute-section">
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Enter your reason for dispute..."
              className="dispute-input"
            />
            <button
              onClick={handleDispute}
              disabled={loading || !disputeReason}
              className="button warning"
            >
              {loading ? 'Processing...' : 'Open Dispute'}
            </button>
          </div>
        )}

        {canConfirmReceipt && (
          <button
            onClick={handleConfirmReceipt}
            disabled={loading}
            className="button success"
          >
            {loading ? 'Processing...' : 'Confirm Receipt'}
          </button>
        )}

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}; 