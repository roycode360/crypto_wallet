export const shortenPublicKey = (publicKey: string | null) => {
  const firstHalf = publicKey?.slice(0, 7);
  const lastHalf = publicKey?.slice(-3);
  return firstHalf + "..." + lastHalf;
};
