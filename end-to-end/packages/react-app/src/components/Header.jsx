import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/mukurgupta/NFT-Miting-dApp-with-Neural-Style-Transfer" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="NFT Minting dApp with Neural Style Transfer"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
