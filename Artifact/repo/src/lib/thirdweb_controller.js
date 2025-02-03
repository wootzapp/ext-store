import { createThirdwebClient } from "thirdweb";
import { avalanche, avalancheFuji } from "thirdweb/chains";
import { useConnect } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";

// export function useThirdwebController() {
//   const wallet = inAppWallet();


//   const { connect, isConnecting, error } = useConnect();
//   console.log('🔑 isConnecting:', isConnecting);
//   console.log('🔑 error:', error);
//   console.log('🔑 connect:', connect);
//   console.log('🔑 wallet:', wallet);

//   const thirdwebAuth = async (uid, idToken) => {

   
//       const client = createThirdwebClient({ clientId: process.env.REACT_APP_THIRDWEB_CLIENT_ID });
      
//       const chain = process.env.REACT_APP_MORALIS_ACTIVE_CHAIN === "AVALANCHE_TESTNET" ? avalancheFuji : avalanche;
//       console.log('🔑 idToken',idToken);
//       console.log('🔑 uid',uid);
//       console.log('🔑 chain',chain);
//       console.log('🔑 client',client);
//       let walletAddress;
//       if(isConnecting===false){
        
//         const userWallet = await connect(async () => {

//           await wallet.connect({
//             strategy: "jwt",
//             jwt: idToken,
//             chain,
//             client,
//             encryptionKey:uid,
//           });
//           console.log('🔑 userWallet:', userWallet);
//           return wallet;
//         });
  
//       console.log('🔑 Inside thirdwebAuth isConnecting:', isConnecting);
//       console.log('🔑 Inside thirdwebAuth error:', error);
//       console.log('🔑 Inside thirdwebAuth connect:', connect);

//       const account = userWallet.getAccount();
//       walletAddress = account.address;

//       }

//       return { walletAddress };

   
//   };

//   return { thirdwebAuth };
// }

export async function loadWallets(token, uid) {
  const wallet = inAppWallet()
  const client = createThirdwebClient({ clientId: process.env.REACT_APP_THIRDWEB_CLIENT_ID });
  const chain = process.env.REACT_APP_MORALIS_ACTIVE_CHAIN === "AVALANCHE_TESTNET" ? avalancheFuji : avalanche;
  return (
    wallet
      .connect({
        client,
        chain,
        strategy: 'jwt',
        jwt: token ,
        encryptionKey:uid,
      })
  )
}