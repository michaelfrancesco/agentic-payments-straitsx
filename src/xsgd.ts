import { createPublicClient, http, parseAbi } from "viem";
import { avalancheFuji } from "viem/chains";

const XSGD_CONTRACT_ADDRESS = "0xd769410dc8772695A7f55a304d2125320A65c2a5";
const XSGD_DECIMALS = 6;

const erc20Abi = parseAbi(["function balanceOf(address account) view returns (uint256)"]);

const client = createPublicClient({
  chain: avalancheFuji,
  transport: http(process.env.FUJI_RPC),
});

export async function getXsgdBalance(address: string): Promise<number> {
  try {
    const raw = await client.readContract({
      address: XSGD_CONTRACT_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    });
    return Number(raw) / 10 ** XSGD_DECIMALS;
  } catch (error) {
    console.warn(`getXsgdBalance: failed to read balance for ${address}`, error);
    return 0;
  }
}
