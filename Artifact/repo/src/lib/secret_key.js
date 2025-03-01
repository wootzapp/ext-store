// /* global chrome */
// import { defineChain } from "thirdweb/chains";
// import { createThirdwebClient, getContract } from "thirdweb";
// import { useActiveAccount, useReadContract } from "thirdweb/react";

// export class SecretKeyGenerator {
//   constructor() {
//     this.web3Chain = process.env.REACT_APP_ENVIRONMENT === "production"
//       ? defineChain(23294)
//       : defineChain(11155111);

//     this.client = createThirdwebClient({
//       clientId: process.env.REACT_APP_THIRDWEB_CLIENT_ID
//     });

//     this.contractAddresses = {
//       development: {
//         OmniKeyStore: "0x2a935BE53f0b7Ce44E1CDaE81f200582eBd2f8a8",
//       },
//       production: {
//         OmniKeyStore: "0x23B71aA8ac3325070611099667B04556958e09Cb",
//       },
//     };
//   }

//   async initialize(userIdentity, account, omniAbi) {
//     console.log('🔑 Starting initialize..');
//     try {
//       console.log('🔑 Starting secret key initialization...', {
//         hasUserIdentity: !!userIdentity,
//         hasAccount: !!account,
//         accountMethods: Object.keys(account || {}),
//         accountType: account?.constructor?.name,
//         address: account?.address,
//         hasSignTypedData: !!account?.signTypedData,
//         allProperties: Object.getOwnPropertyNames(account || {}),
//         hasAccountAddress: account?.address,
//         hasOmniAbi: !!omniAbi
//       });

//       const env = process.env.REACT_APP_ENVIRONMENT || 'development';
//       const omniKeyStore = this.contractAddresses[env].OmniKeyStore;

//       console.log('📝 Contract configuration:', {
//         environment: env,
//         omniKeyStore,
//         chainId: this.web3Chain.id
//       });

//       const contract = getContract({
//         client: this.client,
//         chain: this.web3Chain,
//         address: omniKeyStore,
//         abi: omniAbi
//       });

//       console.log('📄 Contract initialized:', {
//         hasContract: !!contract,
//         contractAddress: contract?.address
//       });

//       const keyRequest = {
//         identity: userIdentity,
//         requester: account.address,
//         expiry: Math.floor(Date.now() / 1000) + 300, // 5 minutes
//       };

//       console.log('🔐 Generated key request:', {
//         identity: keyRequest.identity,
//         requester: keyRequest.requester,
//         expiry: new Date(keyRequest.expiry * 1000).toISOString()
//       });

//       const domain = {
//         name: "OmniKeyStore",
//         version: "1",
//         chainId: this.web3Chain.id,
//         verifyingContract: omniKeyStore,
//       };

//       const types = {
//         KeyRequest: [
//           { name: "identity", type: "uint256" },
//           { name: "requester", type: "address" },
//           { name: "expiry", type: "uint256" },
//         ],
//       };

//       console.log('📝 Preparing to sign data with domain:', domain);

//       if (!account.signTypedData) {
//         console.error('❌ Account missing signTypedData method');
//         throw new Error('Account does not support signTypedData');
//       }


//       console.log('🔍 SignTypedData Requirements Check:', {
//         // Account checks
//         account: {
//           hasSignTypedData: !!account?.signTypedData,
//           hasAddress: !!account?.address,
//           address: account?.address,
//           availableMethods: Object.keys(account || {}),
//           type: account?.constructor?.name
//         },

//         // Domain checks
//         domain: {
//           hasAllFields: !!(domain.name && domain.version && domain.chainId && domain.verifyingContract),
//           fields: domain,
//           chainIdType: typeof domain.chainId
//         },

//         // Types checks
//         types: {
//           hasKeyRequest: !!types.KeyRequest,
//           keyRequestFields: types.KeyRequest,
//           allTypes: Object.keys(types)
//         },

//         // Message checks
//         message: {
//           hasAllFields: !!(keyRequest.identity && keyRequest.requester && keyRequest.expiry),
//           fields: keyRequest,
//           identityType: typeof keyRequest.identity,
//           requesterType: typeof keyRequest.requester,
//           expiryType: typeof keyRequest.expiry
//         },

//         // Full signing params
//         signingParams: {
//           domain,
//           types,
//           message: keyRequest,
//           primaryType: 'KeyRequest'
//         }
//       });

//       console.log('📝 Full SignTypedData Input:', JSON.stringify({
//         domain,
//         types,
//         message: keyRequest,
//       }, null, 2));


//       const typedData = {
//         types,
//         domain,
//         message: keyRequest,
//         primaryType: 'KeyRequest'
//       };
//       const signature = await account.signTypedData(typedData);

//       console.log('✍️ Signature generated:');
//       console.log('✍️ Signature generated:', {
//         signatureLength: signature.length,
//         signatureStart: signature.substring(0, 10) + '...'
//       });

//       const signedKeyReq = {
//         req: keyRequest,
//         sig: signature,
//       };

//       console.log('🔑 Requesting secret key from contract...');

//       // Get the key using the contract
//       const secretKey = await contract.read.getKey([signedKeyReq]);

//       console.log('🎉 Secret key generated successfully:', {
//         hasSecretKey: !!secretKey,
//         secretKeyLength: secretKey ? secretKey.length : 0
//       });

//       // Store in chrome storage
//       await new Promise((resolve) => {
//         chrome.storage.local.set({ secretKey }, () => {
//           console.log('💾 Secret key stored in chrome storage');
//           resolve();
//         });
//       });

//       return secretKey;

//     } catch (error) {
//       console.error('❌ Error in secret key generation:', {
//         errorName: error.name,
//         errorMessage: error.message,
//         errorStack: error.stack
//       });

//       // Log specific error types
//       if (error.code) {
//         console.error('Contract error code:', error.code);
//       }
//       if (error.data) {
//         console.error('Contract error data:', error.data);
//       }

//       throw error;
//     }
//   }
// }