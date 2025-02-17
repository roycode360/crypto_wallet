import Image from "next/image";
import ConnectWalletButton from "./components/ConnectWalletButton";

export default function Home() {
  return (
    <div>
      <Image
        src="/images/matic-logo.webp"
        alt="Profile picture"
        width={40}
        height={40}
        className="rounded-full my-10 mx-4 absolute"
      />
      <main className="flex items-center justify-center flex-col w-full h-dvh">
        <h1 className="mb-3 text-2xl">Web Based Wallet</h1>
        <ConnectWalletButton />
      </main>
    </div>
  );
}
