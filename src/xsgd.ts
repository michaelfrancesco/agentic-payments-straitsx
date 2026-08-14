import { createPublicClient, formatUnits, http } from "viem";
import { avalancheFuji } from "viem/chains";

const XSGD_ADDRESS_FUJI = "0xd769410dc8772695a7f55a304d2125320a65c2a5" as const;

const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const;

const client = createPublicClient({
  chain: avalancheFuji,
  transport: http(process.env.FUJI_RPC),
});

export async function getXsgdBalance(address: `0x${string}`): Promise<number> {
  const [raw, decimals] = await Promise.all([
    client.readContract({
      address: XSGD_ADDRESS_FUJI,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    }),
    client.readContract({
      address: XSGD_ADDRESS_FUJI,
      abi: erc20Abi,
      functionName: "decimals",
    }),
  ]);
  return Number(formatUnits(raw, decimals));
}
