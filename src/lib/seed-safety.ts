type SeedSafetyOptions = {
  operationName: string;
  allowClear?: boolean;
};

function isProductionLikeEnvironment() {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
}

function isProductionProjectId(projectId?: string) {
  if (!projectId) return false;
  return /(prod|production)/i.test(projectId);
}

export function assertSeedSafety(options: SeedSafetyOptions) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const prodLike = isProductionLikeEnvironment() || isProductionProjectId(projectId);

  if (!prodLike) {
    return;
  }

  const confirmProdSeed = process.env.CONFIRM_PROD_SEED === 'true';
  if (!confirmProdSeed) {
    throw new Error(
      `Seed blocked for operation "${options.operationName}" in production-like environment. Set CONFIRM_PROD_SEED=true to proceed intentionally.`
    );
  }

  if (options.allowClear) {
    const confirmClear = process.env.CONFIRM_SEED_CLEAR === 'true';
    if (!confirmClear) {
      throw new Error(
        `Destructive seed clear blocked for "${options.operationName}". Set CONFIRM_SEED_CLEAR=true for explicit destructive operations.`
      );
    }
  }
}
