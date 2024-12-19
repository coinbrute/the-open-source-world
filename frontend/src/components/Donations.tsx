import React, { useState } from 'react';

const Donations: React.FC = () => {
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

  const coins = [
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      address: '37yrfgby8VApVrNuKyCeKkF9RxvNdBrWkX',
      qr: '/images/btc_qr.png',
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      address: '0xB5AD2276991174BF7E0D5a53389471643b60CC21',
      qr: '/images/eth_qr.png',
    },
    {
      name: 'Solana',
      symbol: 'SOL',
      address: 'CxxqP9sN84xsHgoCeK42Q3zcJj4W4PBUVEfg6LgMkz4Y',
      qr: '/images/sol_qr.png',
    },
  ];

  return (
    <div className="donations">
      <h3>Support Us</h3>
      <div className="wallet">
        {coins.map(coin => (
          <div
            key={coin.symbol}
            className="wallet-option"
            onClick={() => setSelectedCoin(coin.symbol)}
            style={{ cursor: 'pointer' }}
          >
            <img src={`/images/${coin.symbol.toLowerCase()}_qr.png`} alt={coin.name} />
            <p>{coin.symbol}: {coin.address}</p>
          </div>
        ))}
      </div>
      {selectedCoin && (
        <div className="qr-modal" onClick={() => setSelectedCoin(null)}>
          <div className="qr-content" onClick={e => e.stopPropagation()}>
            <img src={`/images/${selectedCoin.toLowerCase()}_qr.png`} alt={`${selectedCoin} QR`} />
            <p>Scan to donate {selectedCoin}</p>
            <button onClick={() => setSelectedCoin(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donations;