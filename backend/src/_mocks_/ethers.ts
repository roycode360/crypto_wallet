const ethers = jest.requireActual('ethers');

module.exports = {
  ...ethers,
  verifyMessage: jest.fn(),
};
