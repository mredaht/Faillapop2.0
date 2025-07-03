import React, { useState } from 'react';
import { ContractService } from '../services/ContractService';

interface QuickStakeProps {
  contractService: ContractService;
  userAddress: string | null;
  onStakeComplete?: () => void;
}

const QuickStake: React.FC<QuickStakeProps> = ({ contractService, userAddress, onStakeComplete }) => {
  const [amount, setAmount] = useState('0.1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleQuickStake = async () => {
    if (!userAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await contractService.stake(amount);
      setSuccess(`Successfully staked ${amount} ETH!`);
      if (onStakeComplete) {
        onStakeComplete();
      }
    } catch (err) {
      console.error('Stake failed:', err);
      setError(err instanceof Error ? err.message : 'Stake failed');
    } finally {
      setLoading(false);
    }
  };

  if (!userAddress) {
    return null;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '20px',
      color: 'white',
      textAlign: 'center'
    }}>
      <h3>🏦 Quick Stake</h3>
      <p>Stake ETH to your vault before creating items</p>
      
      <div style={{ margin: '15px 0' }}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (ETH)"
          step="0.01"
          min="0"
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            marginRight: '10px',
            width: '120px'
          }}
        />
        <button
          onClick={handleQuickStake}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Staking...' : `Stake ${amount} ETH`}
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(255, 0, 0, 0.2)',
          padding: '10px',
          borderRadius: '8px',
          margin: '10px 0',
          border: '1px solid rgba(255, 0, 0, 0.5)'
        }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{
          background: 'rgba(0, 255, 0, 0.2)',
          padding: '10px',
          borderRadius: '8px',
          margin: '10px 0',
          border: '1px solid rgba(0, 255, 0, 0.5)'
        }}>
          ✅ {success}
        </div>
      )}
    </div>
  );
};

export default QuickStake; 