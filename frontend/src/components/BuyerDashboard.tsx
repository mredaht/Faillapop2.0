import React, { useState, useEffect } from 'react';
import { Item, ItemState, ItemStateHelpers } from '../types/Item';
import { ContractService } from '../services/ContractService';

interface BuyerDashboardProps {
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

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ userAddress, contractService }) => {
  const [buyerItems, setBuyerItems] = useState<Item[]>([]);
  const [totalSpent, setTotalSpent] = useState<string>('0');
  const [totalPurchases, setTotalPurchases] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isContractReady, setIsContractReady] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [disputeReason, setDisputeReason] = useState<{[key: number]: string}>({});
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
      loadBuyerData();
    }
  }, [userAddress, isContractReady]);

  const loadBuyerData = async () => {
    try {
      setIsLoading(true);
      
      // Obtener todos los items y filtrar los que compró este usuario
      const allItems = await contractService.getAllItems();
      const userBuyerItems = allItems.filter(item => 
        item.buyer && 
        item.buyer.toLowerCase() === userAddress.toLowerCase() &&
        item.state !== ItemState.Canceled // Filtro adicional para evitar items cancelados
      );
      
      setBuyerItems(userBuyerItems);
      
      // Calcular gasto total usando el nuevo método que incluye transacciones completadas
      const totalSpentIncludingCompleted = await contractService.getTotalSpentByUser(userAddress);
      setTotalSpent(totalSpentIncludingCompleted);
      
      // Calcular total acumulativo de compras (incluyendo transacciones completadas)
      const totalPurchasesIncludingCompleted = await contractService.getTotalPurchasesByUser(userAddress);
      setTotalPurchases(totalPurchasesIncludingCompleted);
      
    } catch (error) {
      console.error('Error loading buyer data:', error);
      setError('Error loading your purchases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReceipt = async (itemId: number) => {
    try {
      setActionLoading(itemId);
      setError(null);
      
      // Primero actualizar el estado localmente para mostrar "Completada"
      setBuyerItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, state: ItemState.Sold }
            : item
        )
      );
      
      // Ejecutar la transacción
      await contractService.itemReceived(itemId);
      
      // Mostrar mensaje de éxito
      alert('✅ Receipt confirmed! Transaction completed successfully.');
      
      // Esperar 3 segundos para que el usuario vea el estado "Completada"
      // Luego recargar los datos (el item habrá desaparecido del contrato)
      setTimeout(async () => {
        await loadBuyerData();
      }, 3000);
      
    } catch (error) {
      console.error('Error confirming receipt:', error);
      setError('Error confirming receipt');
      // Revertir el cambio de estado si falla la transacción
      await loadBuyerData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleDispute = async (itemId: number) => {
    const reason = disputeReason[itemId];
    if (!reason) return;

    try {
      setActionLoading(itemId);
      setError(null);
      await contractService.disputeSale(itemId, reason);
      await loadBuyerData();
      setDisputeReason(prev => ({ ...prev, [itemId]: '' }));
    } catch (error) {
      console.error('Error opening dispute:', error);
      setError('Error opening dispute');
    } finally {
      setActionLoading(null);
    }
  };

  const updateDisputeReason = (itemId: number, reason: string) => {
    setDisputeReason(prev => ({ ...prev, [itemId]: reason }));
  };

  if (!isContractReady) {
    return <div className="loading">Waiting for contract initialization...</div>;
  }

  if (isLoading) {
    return <div className="loading">Loading your purchases...</div>;
  }

  return (
    <div className="buyer-dashboard">
      {error && <div className="error-message">{error}</div>}
      
      <div className="buyer-stats">
        <h2>My Purchases</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Purchases</h3>
            <p>{totalPurchases}</p>
          </div>
          <div className="stat-card">
            <h3>Total Spent</h3>
            <p>{totalSpent} ETH</p>
          </div>
          <div className="stat-card">
            <h3>Active Items</h3>
            <p>{buyerItems.length}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Confirmations</h3>
            <p>{buyerItems.filter(item => ItemStateHelpers.isPending(item.state)).length}</p>
          </div>
        </div>
      </div>

      <div className="buyer-items">
        <h3>Active Purchases</h3>
        <div className="info-note">
          <small>💡 Note: Once you confirm receipt of an item, the transaction is completed and the item will be removed from this list after a few seconds. Your total purchases and total spent will continue to include completed transactions.</small>
        </div>
        {buyerItems.length === 0 ? (
          <div className="no-items">
            <p>{totalPurchases === 0 ? 'No purchases yet. Start shopping!' : 'No pending purchases. All your transactions have been completed!'}</p>
          </div>
        ) : (
          <div className="items-grid">
            {buyerItems.map(item => (
              <div key={item.id} className="item-card">
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <p className="price">{item.price} ETH</p>
                <p className="seller">Seller: {item.seller.slice(0, 6)}...{item.seller.slice(-4)}</p>
                
                {/* Enhanced status badge */}
                <div 
                  className={`status-badge ${getStatusBadgeClass(item.state)}`}
                  style={{ backgroundColor: ItemStateHelpers.getStateColor(item.state) }}
                >
                  {ItemStateHelpers.getStateLabel(item.state)}
                </div>
                
                {item.buyTimestamp && (
                  <p className="purchase-date">
                    Purchased: {new Date(item.buyTimestamp * 1000).toLocaleDateString()}
                  </p>
                )}
                
                {/* Acciones del comprador */}
                <div className="buyer-actions">
                  {/* Confirmar recepción */}
                  {ItemStateHelpers.canConfirmReceipt(item.state) && (
                    <div className="confirm-section">
                      <p className="action-info">📦 Have you received this item?</p>
                      <button
                        onClick={() => handleConfirmReceipt(item.id)}
                        disabled={actionLoading === item.id}
                        className="button success"
                      >
                        {actionLoading === item.id ? 'Confirming...' : '✅ Confirm Receipt'}
                      </button>
                    </div>
                  )}
                  
                  {/* Abrir disputa */}
                  {ItemStateHelpers.canDispute(item.state) && (
                    <div className="dispute-section">
                      <p className="action-info">⚠️ Having issues with this purchase?</p>
                      <textarea
                        value={disputeReason[item.id] || ''}
                        onChange={(e) => updateDisputeReason(item.id, e.target.value)}
                        placeholder="Describe the issue with your purchase..."
                        className="dispute-input"
                      />
                      <button
                        onClick={() => handleDispute(item.id)}
                        disabled={!disputeReason[item.id] || actionLoading === item.id}
                        className="button warning"
                      >
                        {actionLoading === item.id ? 'Opening...' : '⚠️ Open Dispute'}
                      </button>
                    </div>
                  )}
                  
                  {/* Información adicional según el estado */}
                  {ItemStateHelpers.isDisputed(item.state) && (
                    <div className="dispute-info">
                      <small>⚖️ Dispute is being resolved</small>
                    </div>
                  )}
                  
                  {ItemStateHelpers.isSold(item.state) && (
                    <div className="completed-info">
                      <small>✅ Transaction completed</small>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 