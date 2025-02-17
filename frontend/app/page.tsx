import ConnectWalletButton from "./components/ConnectWalletButton";

export default function Home() {
  return (
    <div>
      <main className="flex items-center justify-center flex-col w-full h-dvh">
        <h1 className="mb-3">Web Based Wallet</h1>
        <ConnectWalletButton />
      </main>
    </div>
  );
}
