import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Addr, PandaSigner, PubKey, UTXO, bsv, findSig } from 'scrypt-ts';
import { OneSatApis, OrdiMethodCallOptions, OrdiNFTP2PKH, OrdiProvider } from 'scrypt-ord';
import { Box, Button, Tab, Tabs } from '@mui/material';
import ItemViewWallet from './ItemViewWallet';

function App() {


  const signerRef = useRef<PandaSigner>(null);
  

  const [isConnected, setIsConnected] = useState(false);

  const [walletItems, setWalletItems] = useState([]);
  const [marketItems, setMarketItems] = useState([]);

  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadMarketItems();
    loadWalletItems();
  }, []);

  async function loadMarketItems() {
    const marketItemsRaw = localStorage.getItem('marketItems') ;
    if (marketItemsRaw) {
      const marketItems = JSON.parse(marketItemsRaw) ;
      setMarketItems(marketItems) ;
    }
  }

  async function loadWalletItems() {
    const signer = signerRef.current as PandaSigner;

    if (signer) {
      try {
        const connectedOrdinalAddress = await signer.getOrdAddress();
        const url = `https://ordinals.gorillapool.io/api/txos/address/${connectedOrdinalAddress.toString()}/unspent?bsv20=false`;
        const response = await fetch(url);
        const data = await response.json();
        const filterData = data.filter(e => marketItems[e.origin.outpoint] == undefined);

        setWalletItems(filterData);

      } catch (error) {
        console.error('Error loading wallet items:', error)
      }
    }
  }
  const handleList = async(idx) => {

  } ;

  const handleConnect = async () => {
    const provider = new OrdiProvider(bsv.Networks.mainnet);
    const signer = new PandaSigner(provider);
    signerRef.current = signer;

    const { isAuthenticated, error } = await signer.requestAuth();
    if (!isAuthenticated) {
      throw new Error(`Authentication failed: ${error}`);
    }  
    setIsConnected(true);
  }

  const handleTabChange = (e, tabIndex) => {
    if (tabIndex == 0) {
      loadWalletItems();
    }  else if (tabIndex == 1) {
      loadMarketItems();
    setActiveTab(tabIndex);
    }
  }
  return (
    <div className="App">
      {isConnected ? (
            <div>
              <Box>
                <Tabs value={activeTab} onChange={handleTabChange} >
                  <Tab label="My BSV Ordinal's  in this browser Extension's YOURS wallet " />
                  <Tab label="BSV ORDINALS listed for sale on this Market" />
                </Tabs>
              </Box>
              {activeTab === 0 && (
                <Box>
                    {walletItems.map((item, idx) => {
                      return <ItemViewWallet key={idx} item={item} idx={idx} onList={handleList} />
                    })
                  }
                </Box>
              )}
            </div>
      ) : (
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center' ,  alignItems: 'center'}}>
          <Button variant='contained' size="large" onClick={handleConnect}>
            Connect the YOURS wallet 
            -- the YOURS wallet was erstwhile named as the panda Wallet
          </Button>
        </div>
      )
    
      }
    </div>
  );
}

export default App