import { Card, Upload, Input, InputNumber, Space } from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import React, { useState } from "react";
import { useContractLoader } from "../hooks";
import Account from "./Account";
import { useParams } from "react-router-dom";

const DEFAULT_CONTRACT_NAME = "NFTMinter";

// rewrite ipfs:// uris to dweb.link gateway URLs
function makeGatewayURL(ipfsURI) {
  return ipfsURI.replace(/^ipfs:\/\//, "https://dweb.link/ipfs/");
}

async function fetchIPFSJSON(ipfsURI) {
  const url = makeGatewayURL(ipfsURI);
  const resp = await fetch(url);
  return resp.json();
}

async function getNFT({contract, provider, tokenId}) {
  const metadataURI = await contract.tokenURI(tokenId);
  console.log('metadata uri: ', metadataURI);
  
  const metadata = await fetchIPFSJSON(metadataURI);
  console.log('metadata: ', metadata)

  if (metadata.image) {
    metadata.image = makeGatewayURL(metadata.image);
  }

  return metadata;
}

function NFTCard({
  contract,
  provider,
  tokenId,
  nftData,
}) {
  return (
    <Card>
      <img src={nftData.image} style={{maxWidth: "800px"}}/>
      <div>
        Name: {nftData.name}
      </div>
      <div>
        Description: {nftData.description}
      </div>
    </Card>
  );
}

export default function NFTViewer({
  customContract,
  account,
  gasPrice,
  signer,
  provider,
  name,
  price,
  blockExplorer,
}) {
  const contracts = useContractLoader(provider);
  let contract;
  if (!name) {
    name = DEFAULT_CONTRACT_NAME;
  }
  if (!customContract) {
    contract = contracts ? contracts[name] : "";
  } else {
    contract = customContract;
  }

  const address = contract ? contract.address : "";

  const [selectedToken, setSelectedToken] = useState(null);
  const [nftData, setNFTData] = useState(null);
  const [loading, setLoading] = useState(selectedToken && !nftData);
  const [errorMessage, setErrorMessage] = useState(null);

  let tokenView = "";
  if (nftData) {
    tokenView = NFTCard({ contract, provider, tokenId: selectedToken, nftData });
  }

  let errorView = "";
  if (errorMessage) {
    errorView = <div>
      <span style={{color: "red"}}>{errorMessage}</span>
    </div>;
  }

  const tokenIdChanged = newTokenId => {
    if (!newTokenId) {
      return;
    }
    setSelectedToken(newTokenId);
    setLoading(true);
    getNFT({ contract, provider, tokenId: newTokenId }).then(nft => {
      setNFTData(nft);
      setLoading(false);
      setErrorMessage("");
    }).catch(e => {
      console.log('error getting token: ', e);
      setLoading(false);
      setErrorMessage(e.message);
      setNFTData(null);
    })
  }

  return (
    <div style={{ margin: "auto", width: "70vw" }}>
      <Card
        title={
          <div>
            View an NFT
            <div style={{ float: "right" }}>
              <Account
                address={address}
                localProvider={provider}
                injectedProvider={provider}
                mainnetProvider={provider}
                price={price}
                blockExplorer={blockExplorer}
              />
              {account}
            </div>
          </div>
        }
        size="large"
        style={{ marginTop: 25, width: "100%" }}
        loading={false}
      >
        <Space>
          Token ID:
          <InputNumber value={selectedToken} onChange={tokenIdChanged}/>
        </Space>
        {loading && <LoadingOutlined/>}
        {tokenView}
        {errorView}
      </Card>
    </div>
  );
}
