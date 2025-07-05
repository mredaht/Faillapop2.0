import React, { useState, useEffect } from 'react';
import { Item, ItemState, ItemStateHelpers } from '../types/Item';
import { ContractService } from '../services/ContractService';

interface SellerProfileProps {
  userAddress: string;
  contractService: ContractService;
}

// Helper function to get CSS class for status badge
const getStatusBadgeClass = (state: number): string => {
  switch (state) {
    case 1: return 'available';      // Selling
    case 2: return 'pending';        // Pending 
    case 3: return 'disputed';       // Disputed
    case 4: return 'sold';           // Sold
    case 5: return 'vacation';       // Vacation
    default: return 'undefined';     // Undefined/Unknown
  }
};

export const SellerProfile: React.FC<SellerProfileProps> = ({ userAddress, contractService }) => {
  const [sellerItems, setSellerItems] = useState<Item[]>([]);
  const [totalSales, setTotalSales] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [isContractReady, setIsContractReady] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [disputeReply, setDisputeReply] = useState<{[key: number]: string}>({});
  const [isVacationMode, setIsVacationMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkContract = async () => {
      try {
        const isReady = await contractService.isInitialized();
        setIsContractReady(isReady);
      } catch (error) {
        console.error('Error checking contract:', error);
        setIsContractReady(false);
      }
    };

    checkContract();
  }, [contractService]);

  useEffect(() => {
    if (isContractReady && userAddress) {
      loadSellerData();
    }
  }, [userAddress, isContractReady]);

  const loadSellerData = async () => {
    try {
      setIsLoading(true);
      const items = await contractService.getSellerItems(userAddress);
      setSellerItems(items);
      
      // Calcular ventas totales usando el nuevo método que incluye transacciones completadas
      const totalSalesIncludingCompleted = await contractService.getTotalSalesBySeller(userAddress);
      setTotalSales(totalSalesIncludingCompleted);
      
    } catch (error) {
      console.error('Error loading seller data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVacationMode = async () => {
    try {
      setError(null);
      await contractService.setVacationMode(!isVacationMode);
      setIsVacationMode(!isVacationMode);
      await loadSellerData();
    } catch (error) {
      console.error('Error toggling vacation mode:', error);
      setError('Error toggling vacation mode');
    }
  };

  const handleDisputeReply = async (itemId: number) => {
    const reply = disputeReply[itemId];
    if (!reply) return;

    try {
      setActionLoading(itemId);
      setError(null);
      await contractService.disputedSaleReply(itemId, reply);
      await loadSellerData();
      setDisputeReply(prev => ({ ...prev, [itemId]: '' }));
    } catch (error) {
      console.error('Error replying to dispute:', error);
      setError('Error replying to dispute');
    } finally {
      setActionLoading(null);
    }
  };

  const updateDisputeReply = (itemId: number, reply: string) => {
    setDisputeReply(prev => ({ ...prev, [itemId]: reply }));
  };

  if (!isContractReady) {
    return <div className="loading">Waiting for contract initialization...</div>;
  }

  if (isLoading) {
    return <div className="loading">Loading seller profile...</div>;
  }

  return (
    <div className="seller-profile">
      {error && <div className="error-message">{error}</div>}
      
      <div className="seller-stats">
        <div className="seller-header">
          <h2>Seller Profile</h2>
          <button 
            onClick={handleVacationMode}
            className={`button ${isVacationMode ? 'warning' : 'success'}`}
          >
            {isVacationMode ? '🏖️ Exit Vacation Mode' : '🏖️ Enter Vacation Mode'}
          </button>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Items</h3>
            <p>{sellerItems.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Sales</h3>
            <p>{totalSales} ETH</p>
          </div>
          <div className="stat-card">
            <h3>Active Listings</h3>
            <p>{sellerItems.filter(item => ItemStateHelpers.isAvailableForPurchase(item.state)).length}</p>
          </div>
        </div>
      </div>

      <div className="seller-items">
        <h3>Your Items</h3>
        <div className="items-grid">
          {sellerItems.map(item => (
            <div key={item.id} className="item-card">
              <h4>{item.name}</h4>
              <p>{item.description}</p>
              <p className="price">{item.price} ETH</p>
              {/* Enhanced status badge */}
              <div 
                className={`status-badge ${getStatusBadgeClass(item.state)}`}
                style={{ backgroundColor: ItemStateHelpers.getStateColor(item.state) }}
              >
                {ItemStateHelpers.getStateLabel(item.state)}
              </div>
              {item.buyer && (
                <p className="buyer">Buyer: {item.buyer.slice(0, 6)}...{item.buyer.slice(-4)}</p>
              )}
              
              {/* Acciones del vendedor */}
              <div className="seller-actions">
                {/* Responder a disputa */}
                {ItemStateHelpers.isDisputed(item.state) && (
                  <div className="dispute-reply-section">
                    <textarea
                      value={disputeReply[item.id] || ''}
                      onChange={(e) => updateDisputeReply(item.id, e.target.value)}
                      placeholder="Enter your response to the dispute..."
                      className="dispute-input"
                    />
                    <button
                      onClick={() => handleDisputeReply(item.id)}
                      disabled={!disputeReply[item.id] || actionLoading === item.id}
                      className="button warning"
                    >
                      {actionLoading === item.id ? 'Replying...' : 'Reply to Dispute'}
                    </button>
                  </div>
                )}
                
                {/* Note: Return Item functionality is only available through DAO dispute resolution */}
                {/* Sellers cannot directly return items - this is handled by DAO when disputes are resolved */}
                
                {/* Información adicional según el estado */}
                {ItemStateHelpers.isPending(item.state) && (
                  <div className="pending-info">
                    <small>⏳ Waiting for buyer to confirm receipt</small>
                  </div>
                )}
                
                {ItemStateHelpers.isInVacation(item.state) && (
                  <div className="vacation-info">
                    <small>🏖️ Item is in vacation mode</small>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 