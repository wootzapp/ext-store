import { useState, useEffect } from "react";
import { defineChain } from "thirdweb/chains";
import { createThirdwebClient, getContract, resolveMethod } from "thirdweb";
import { useReadContract } from "thirdweb/react";

export function useSecretKey({ userIdentity, account, userAddress, omniKeyStore, omniAbi, authUser, onSuccess }) {
  const [keyReq, setKeyReq] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  // Initialize chain and client
  const web3Chain = process.env.REACT_APP_ENVIRONMENT === "production" 
    ? defineChain(23294) 
    : defineChain(23295);

  const client = createThirdwebClient({ 
    clientId: process.env.REACT_APP_THIRDWEB_CLIENT_ID 
  });

  const contract = getContract({ 
    client, 
    chain: web3Chain, 
    address: omniKeyStore, 
    abi: omniAbi 
  });

  console.log('🔐 Contract:', contract);
  
  // Read contract data
  const { data: secretKey, isLoading } = useReadContract({
    contract,
    method: resolveMethod("getKey"),
    params: keyReq ? [keyReq] : null,
  });

  // Handle key generation
  const handleGetKey = async () => {
    try {
      setButtonLoading(true);

      const keyRequest = {
        identity: userIdentity,
        requester: userAddress,
        expiry: Math.floor(Date.now() / 1000) + 5 * 60,
      };
      
      console.log('🔐 Key request:', keyRequest);

      const domain = {
        name: "OmniKeyStore",
        version: "1",
        chainId: web3Chain.id,
        verifyingContract: omniKeyStore,
      };
      
      console.log('🔐 Domain:', domain);

      const types = {
        KeyRequest: [
          { name: "identity", type: "uint256" },
          { name: "requester", type: "address" },
          { name: "expiry", type: "uint256" },
        ],
      };

      console.log('🔐 Types:', types);

      console.log('🔐 Account:', account);

      const signature = await account.signTypedData({ 
        domain, 
        types, 
        message: keyRequest 
      });

      console.log('🔐 Signature:', signature);
      const signedKeyReq = {
        req: keyRequest,
        sig: signature,
      };

      console.log('🔐 Signed key request:', signedKeyReq);

      setKeyReq(signedKeyReq);
      console.log('🔐 Key request set:', keyReq);
    } catch (error) {
      console.error("Error generating key:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  // Handle secret key updates
  useEffect(() => {
    if (!keyReq || !authUser || isLoading || !secretKey) {
      return;
    }
    console.log('🔐 Secret key:', secretKey);

    onSuccess?.(secretKey, authUser.uid);
  }, [keyReq, authUser, isLoading, secretKey, onSuccess]);

  return {
    handleGetKey,
    secretKey,
    isLoading,
    buttonLoading
  };
} 