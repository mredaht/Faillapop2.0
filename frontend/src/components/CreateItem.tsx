import React, { useState } from 'react';
import '../styles/CreateItem.css';

interface CreateItemProps {
  onCreate: (name: string, description: string, price: string, image?: File) => Promise<void>;
}

const CreateItem: React.FC<CreateItemProps> = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onCreate(name, description, price, image || undefined);
      setSuccessMessage('Item created successfully! 🎉');
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setImage(null);
      setPreviewUrl(null);
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
      
      {/* Info about staking */}
      <div className="staking-info">
        <p>ℹ️ <strong>Note:</strong> To sell items, you need to stake ETH. The system will automatically stake the required amount if needed.</p>
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
          <label htmlFor="image">Image:</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isLoading}
          />
          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" />
            </div>
          )}
        </div>

        {error && <div className="error-message">❌ {error}</div>}
        {successMessage && <div className="success-message">✅ {successMessage}</div>}

        <button type="submit" disabled={isLoading} className="create-button">
          {isLoading ? 'Creating...' : 'Create Item'}
        </button>
      </form>
    </div>
  );
};

export default CreateItem; 