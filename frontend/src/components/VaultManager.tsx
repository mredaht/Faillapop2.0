import React, { useState, useEffect } from 'react';
import { ContractService } from '../services/ContractService';

interface VaultManagerProps {
  contractService: ContractService;
  userAddress: string | null;
}

interface VaultData {
  userBalance: string;
  userLockedBalance: string;
  vaultBalance: string;
  maxClaimableAmount: string;
  rewardsClaimed: string;
  totalSlashed: string;
}

const VaultManager: React.FC<VaultManagerProps> = ({ contractService, userAddress }) => {
  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userAddress) {
      loadVaultData();
    }
  }, [userAddress]);

  const loadVaultData = async () => {
    if (!userAddress) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const [
        userBalance,
        userLockedBalance,
        vaultBalance,
        maxClaimableAmount,
        rewardsClaimed,
        totalSlashed
      ] = await Promise.all([
        contractService.getUserBalance(userAddress),
        contractService.getUserLockedBalance(userAddress),
        contractService.getVaultBalance(),
        contractService.getMaxClaimableAmount(),
        contractService.getRewardsClaimed(userAddress),
        contractService.getTotalSlashed()
      ]);

      setVaultData({
        userBalance,
        userLockedBalance,
        vaultBalance,
        maxClaimableAmount,
        rewardsClaimed,
        totalSlashed
      });
    } catch (err) {
      console.error('Error loading vault data:', err);
      setError(err instanceof Error ? err.message : 'Error loading vault data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError('Please enter a valid amount to stake');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      await contractService.stake(stakeAmount);
      setSuccessMessage(`Successfully staked ${stakeAmount} ETH`);
      setStakeAmount('');
      await loadVaultData();
    } catch (err) {
      console.error('Error staking:', err);
      setError(err instanceof Error ? err.message : 'Error staking');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setError('Please enter a valid amount to unstake');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      await contractService.unstake(unstakeAmount);
      setSuccessMessage(`Successfully unstaked ${unstakeAmount} ETH`);
      setUnstakeAmount('');
      await loadVaultData();
    } catch (err) {
      console.error('Error unstaking:', err);
      setError(err instanceof Error ? err.message : 'Error unstaking');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      await contractService.claimRewards();
      setSuccessMessage('Successfully claimed rewards');
      await loadVaultData();
    } catch (err) {
      console.error('Error claiming rewards:', err);
      setError(err instanceof Error ? err.message : 'Error claiming rewards');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableBalance = (): string => {
    if (!vaultData) return '0';
    const userBalance = parseFloat(vaultData.userBalance);
    const lockedBalance = parseFloat(vaultData.userLockedBalance);
    return (userBalance - lockedBalance).toFixed(4);
  };

  const getAvailableRewards = (): string => {
    if (!vaultData) return '0';
    const maxClaimable = parseFloat(vaultData.maxClaimableAmount);
    const claimed = parseFloat(vaultData.rewardsClaimed);
    return (maxClaimable - claimed).toFixed(4);
  };

  if (!userAddress) {
    return (
      <div className="vault-manager">
        <h2>Vault Manager</h2>
        <p>Please connect your wallet to manage your vault.</p>
      </div>
    );
  }

  return (
    <div className="vault-manager">
      <h2>Vault Manager</h2>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      {isLoading && <div className="loading">Loading vault data...</div>}
      
      {vaultData && (
        <div className="vault-stats">
          <div className="stat-grid">
            <div className="stat-card">
              <h3>Your Balance</h3>
              <p className="stat-value">{vaultData.userBalance} ETH</p>
            </div>
            <div className="stat-card">
              <h3>Available Balance</h3>
              <p className="stat-value">{getAvailableBalance()} ETH</p>
            </div>
            <div className="stat-card">
              <h3>Locked Balance</h3>
              <p className="stat-value">{vaultData.userLockedBalance} ETH</p>
            </div>
            <div className="stat-card">
              <h3>Vault Total</h3>
              <p className="stat-value">{vaultData.vaultBalance} ETH</p>
            </div>
            <div className="stat-card">
              <h3>Available Rewards</h3>
              <p className="stat-value">{getAvailableRewards()} ETH</p>
            </div>
            <div className="stat-card">
              <h3>Total Slashed</h3>
              <p className="stat-value">{vaultData.totalSlashed} ETH</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="vault-actions">
        <div className="action-section">
          <h3>Stake ETH</h3>
          <div className="input-group">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="Amount in ETH"
              min="0"
              step="0.01"
              disabled={isLoading}
            />
            <button 
              onClick={handleStake} 
              disabled={isLoading || !stakeAmount}
              className="action-button stake-button"
            >
              {isLoading ? 'Staking...' : 'Stake'}
            </button>
          </div>
        </div>
        
        <div className="action-section">
          <h3>Unstake ETH</h3>
          <div className="input-group">
            <input
              type="number"
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
              placeholder="Amount in ETH"
              min="0"
              step="0.01"
              disabled={isLoading}
            />
            <button 
              onClick={handleUnstake} 
              disabled={isLoading || !unstakeAmount}
              className="action-button unstake-button"
            >
              {isLoading ? 'Unstaking...' : 'Unstake'}
            </button>
          </div>
        </div>
        
        <div className="action-section">
          <h3>Claim Rewards</h3>
          <button 
            onClick={handleClaimRewards} 
            disabled={isLoading || parseFloat(getAvailableRewards()) <= 0}
            className="action-button claim-button"
          >
            {isLoading ? 'Claiming...' : 'Claim Rewards'}
          </button>
        </div>
      </div>
      
      <div className="vault-info">
        <h3>How it works</h3>
        <ul>
          <li><strong>Stake:</strong> Lock your ETH in the vault to enable selling items</li>
          <li><strong>Locked Balance:</strong> ETH locked for active sales (automatically managed)</li>
          <li><strong>Available Balance:</strong> ETH you can unstake (total - locked)</li>
          <li><strong>Rewards:</strong> Earn rewards from slashed malicious sellers (requires Powerseller NFT)</li>
        </ul>
      </div>
    </div>
  );
};

export default VaultManager; 