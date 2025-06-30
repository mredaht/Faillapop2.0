import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Item, ItemState, ItemStateHelpers } from '../types/Item';
import { ContractService } from '../services/ContractService';

interface SellerProfileProps {
  userAddress: string;
  contractService: ContractService;
}

export const SellerProfile: React.FC<SellerProfileProps> = ({ userAddress, contractService }) => {
  const [sellerItems, setSellerItems] = useState<Item[]>([]);
  const [totalSales, setTotalSales] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [isContractReady, setIsContractReady] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [disputeReply, setDisputeReply] = useState<{[key: number]: string}>({});
  const [isVacationMode, setIsVacationMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '' });
  const [validSales, setValidSales] = useState(0);
  const [canClaimBadge, setCanClaimBadge] = useState(false);
  const [weeksElapsed, setWeeksElapsed] = useState(0);

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
      
      // Calcular ventas totales
      const sales = items
        .filter(item => ItemStateHelpers.isSold(item.state))
        .reduce((acc, item) => acc + Number(item.price), 0);
      setTotalSales(sales.toFixed(4));

      // Cargar estadísticas de Powerseller
      const badgeInfo = await contractService.canClaimPowersellerBadge(userAddress);
      setValidSales(badgeInfo.validSales);
      setCanClaimBadge(badgeInfo.canClaim);
      setWeeksElapsed(badgeInfo.weeksElapsed);
    } catch (error) {
      console.error('Error loading seller data:', error);
    } finally {
      setIsLoading(false);
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

  const handleReturnItem = async (itemId: number) => {
    try {
      setActionLoading(itemId);
      setError(null);
      await contractService.returnItem(itemId);
      await loadSellerData();
    } catch (error) {
      console.error('Error returning item:', error);
      setError('Error returning item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVacationMode = async () => {
    try {
      setError(null);
      await contractService.setVacationMode(!isVacationMode);
      setIsVacationMode(!isVacationMode);
    } catch (error) {
      console.error('Error setting vacation mode:', error);
      setError('Error setting vacation mode');
    }
  };

  const updateDisputeReply = (itemId: number, reply: string) => {
    setDisputeReply(prev => ({ ...prev, [itemId]: reply }));
  };

  const startEditing = (item: Item) => {
    setEditingItem(item.id);
    setEditForm({
      title: item.name,
      description: item.description,
      price: item.price
    });
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditForm({ title: '', description: '', price: '' });
  };

  const handleEditItem = async (itemId: number) => {
    try {
      setActionLoading(itemId);
      setError(null);
      await contractService.modifyItem(itemId, editForm.title, editForm.description, editForm.price);
      await loadSellerData();
      cancelEditing();
    } catch (error) {
      console.error('Error editing item:', error);
      setError('Error editing item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to cancel this item? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(itemId);
      setError(null);
      await contractService.cancelItem(itemId);
      await loadSellerData();
    } catch (error) {
      console.error('Error canceling item:', error);
      setError('Error canceling item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClaimPowersellerBadge = async () => {
    try {
      setError(null);
      await contractService.claimPowersellerBadge();
      alert('🏆 Powerseller badge claimed successfully!');
      await loadSellerData();
    } catch (error) {
      console.error('Error claiming Powerseller badge:', error);
      setError('Error claiming Powerseller badge. Make sure you meet the requirements.');
    }
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
          <div className="stat-card">
            <h3>Valid Sales</h3>
            <p>{validSales}/10</p>
            <small>{validSales >= 10 ? '✅ Eligible!' : `${10 - validSales} more needed`}</small>
          </div>
        </div>
        
        {/* Powerseller Badge Section */}
        <div className="powerseller-section">
          <h3>🏆 Powerseller Badge</h3>
          <div className="badge-info">
            <p>Requirements: 10+ valid sales & 5+ weeks since first sale</p>
            <div className="badge-status">
              <span>Sales: {validSales}/10 {validSales >= 10 ? '✅' : '❌'}</span>
              <span>Time: {weeksElapsed}/5 weeks {weeksElapsed >= 5 ? '✅' : '❌'}</span>
            </div>
            {canClaimBadge ? (
              <button 
                onClick={handleClaimPowersellerBadge}
                className="button success powerseller-claim"
              >
                🏆 Claim Powerseller Badge!
              </button>
            ) : (
              <p className="badge-unavailable">
                {validSales < 10 ? `Need ${10 - validSales} more valid sales` : `Need ${Math.ceil(5 - weeksElapsed)} more weeks`}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="seller-items">
        <h3>Your Items</h3>
        <div className="items-grid">
          {sellerItems.map(item => (
            <div key={item.id} className="item-card">
              {editingItem === item.id ? (
                // Formulario de edición
                <div className="edit-form">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    placeholder="Title"
                    className="edit-input"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    placeholder="Description"
                    className="edit-textarea"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    placeholder="Price in ETH"
                    className="edit-input"
                  />
                  <div className="edit-actions">
                    <button
                      onClick={() => handleEditItem(item.id)}
                      disabled={actionLoading === item.id}
                      className="button success"
                    >
                      {actionLoading === item.id ? 'Saving...' : '💾 Save'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="button secondary"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Vista normal del item
                <>
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                  <p className="price">{item.price} ETH</p>
                  <div className="status-badge" style={{ backgroundColor: ItemStateHelpers.getStateColor(item.state) }}>
                    {ItemStateHelpers.getStateLabel(item.state)}
                  </div>
                  {item.buyer && (
                    <p className="buyer">Buyer: {item.buyer.slice(0, 6)}...{item.buyer.slice(-4)}</p>
                  )}
                  
                  {/* Botones de gestión de item */}
                  {ItemStateHelpers.isAvailableForPurchase(item.state) && (
                    <div className="item-management">
                      <button
                        onClick={() => startEditing(item)}
                        className="button edit-btn"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleCancelItem(item.id)}
                        disabled={actionLoading === item.id}
                        className="button danger cancel-btn"
                      >
                        {actionLoading === item.id ? 'Canceling...' : '🗑️ Cancel'}
                      </button>
                    </div>
                  )}
                </>
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
                
                {/* Devolver item (cuando está en pending o disputado) */}
                {(ItemStateHelpers.isPending(item.state) || ItemStateHelpers.isDisputed(item.state)) && (
                  <button
                    onClick={() => handleReturnItem(item.id)}
                    disabled={actionLoading === item.id}
                    className="button danger"
                  >
                    {actionLoading === item.id ? 'Processing...' : 'Return Item'}
                  </button>
                )}
                
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