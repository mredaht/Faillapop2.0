import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Item } from '../types/Item';
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
        .filter(item => item.isSold)
        .reduce((acc, item) => acc + Number(ethers.utils.formatEther(item.price)), 0);
      setTotalSales(sales.toFixed(4));
    } catch (error) {
      console.error('Error loading seller data:', error);
    } finally {
      setIsLoading(false);
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
      <div className="seller-stats">
        <h2>Seller Profile</h2>
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
            <p>{sellerItems.filter(item => !item.isSold).length}</p>
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
              <p className="price">{ethers.utils.formatEther(item.price)} ETH</p>
              <span className={`status ${item.isSold ? 'sold' : 'active'}`}>
                {item.isSold ? 'Sold' : 'Active'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 