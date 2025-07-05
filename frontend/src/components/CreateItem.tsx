import React, { useState } from 'react';
import { ContractService } from '../services/ContractService';
import '../styles/CreateItem.css';

interface CreateItemProps {
  onCreate: (name: string, description: string, price: string, image?: File) => Promise<void>;
  contractService: ContractService;
  userAddress: string | null;
}

const CreateItem: React.FC<CreateItemProps> = ({ onCreate, contractService, userAddress }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [vaultInfo, setVaultInfo] = useState<{ balance: string; locked: string; available: string } | null>(null);

  // Load vault info when component mounts
  React.useEffect(() => {
    if (userAddress) {
      loadVaultInfo();
    }
  }, [userAddress]);

  const loadVaultInfo = async () => {
    if (!userAddress) return;
    
    try {
      // Wait for contract service to be fully initialized
      const isInitialized = await contractService.isInitialized();
      if (!isInitialized) {
        console.log('ContractService not initialized yet, skipping vault info load');
        return;
      }

      const [balance, locked] = await Promise.all([
        contractService.getUserBalance(userAddress),
        contractService.getUserLockedBalance(userAddress)
      ]);
      
      const available = (parseFloat(balance) - parseFloat(locked)).toFixed(4);
      setVaultInfo({ balance, locked, available });
    } catch (err) {
      console.error('Error loading vault info:', err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      // Crear URL de preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price) {
      setError('Please fill in all fields');
      return;
    }

    if (!userAddress) {
      setError('Please connect your wallet');
      return;
    }

    // Check if user has enough staked funds
    if (vaultInfo && parseFloat(vaultInfo.available) < parseFloat(price)) {
      setError(`Insufficient staked funds. You need at least ${price} ETH staked. Current available: ${vaultInfo.available} ETH`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onCreate(name, description, price, image || undefined);
      
      // Determinar el mensaje de éxito basado en si había imagen
      const hasImage = !!image;
      if (hasImage) {
        setSuccessMessage('Item created successfully! 🎉 Check the console and alert for IPFS upload details!');
      } else {
        setSuccessMessage('Item created successfully! 🎉');
      }
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setImage(null);
      setPreviewUrl(null);
      // Reload vault info
      await loadVaultInfo();
    } catch (err: any) {
      console.error('Error creating item:', err);
      setError(err.message || 'Failed to create item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-item-container">
      <h2>Create New Item</h2>
      
      {/* Vault info */}
      {vaultInfo && (
        <div className="vault-status">
          <h3>Your Vault Status</h3>
          <div className="vault-stats-mini">
            <div className="vault-stat">
              <span className="label">Total Staked:</span>
              <span className="value">{vaultInfo.balance} ETH</span>
            </div>
            <div className="vault-stat">
              <span className="label">Locked:</span>
              <span className="value">{vaultInfo.locked} ETH</span>
            </div>
            <div className="vault-stat">
              <span className="label">Available:</span>
              <span className="value">{vaultInfo.available} ETH</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Info about staking */}
      <div className="staking-info">
        <p>ℹ️ <strong>Note:</strong> To sell items, you need to have enough ETH staked in the vault. The required amount will be automatically locked when you create an item.</p>
        {vaultInfo && parseFloat(vaultInfo.available) < parseFloat(price || '0') && (
          <p className="warning">⚠️ <strong>Warning:</strong> You don't have enough staked funds. Please stake more ETH in the Vault tab.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="create-item-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter item name"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter item description"
            rows={4}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (ETH):</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.1"
            step="0.001"
            min="0"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Image (Optional):</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isLoading}
          />
          <small className="form-note">
            📷 Image upload enabled via IPFS! Your images will be stored on the decentralized IPFS network.<br/>
            ⚠️ Note: The current smart contract doesn't store image URLs on-chain, but you can verify IPFS upload works!
          </small>
          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" />
            </div>
          )}
        </div>

        {error && <div className="error-message">❌ {error}</div>}
        {successMessage && <div className="success-message">✅ {successMessage}</div>}

        <div className="button-group">
          <button type="submit" disabled={isLoading} className="button button-primary">
            {isLoading ? 'Creating...' : 'Create Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateItem; 