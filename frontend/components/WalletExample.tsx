// Example of how to use the wallet hook in your components/pages

import { useWallet } from '../hooks/useWallet';

export default function ExampleComponent() {
  const { address, isConnected, provider, getSigner } = useWallet();

  const handleTransaction = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const signer = await getSigner();
      if (!signer) return;

      // Example: Get balance
      const balance = await provider?.getBalance(address!);
      console.log('Balance:', balance?.toString());

      // Example: Send transaction
      // const tx = await signer.sendTransaction({
      //   to: '0x...',
      //   value: ethers.parseEther('0.001')
      // });
      // await tx.wait();
    } catch (error) {
      console.error('Transaction error:', error);
    }
  };

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={handleTransaction}>Send Transaction</button>
        </div>
      ) : (
        <p>Please connect your wallet using the button in the navigation bar</p>
      )}
    </div>
  );
}
