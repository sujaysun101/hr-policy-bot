declare module "@clerk/nextjs/dist/esm/server/keyless-node.js" {
  export function keyless(): {
    resolveKeysWithKeylessFallback(
      publishableKey?: string,
      secretKey?: string,
    ): Promise<{
      publishableKey?: string
      secretKey?: string
      claimUrl?: string
      apiKeysUrl?: string
    }>
  }
}
