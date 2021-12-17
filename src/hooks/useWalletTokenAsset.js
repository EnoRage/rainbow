import { find, matchesProperty } from 'lodash';
import { useMemo } from 'react';
import useAccountAssets from './useAccountAssets';
import { AssetTypes } from '@rainbow-me/entities';

// this is meant to be used for assets under balances
// NFTs are not included in this hook
export default function useWalletTokenAsset(type, uniqueId) {
  const { allAssets } = useAccountAssets();

  return useMemo(() => {
    if (!uniqueId) return null;

    let matched = null;
    if (type === AssetTypes.token) {
      matched = find(allAssets, matchesProperty('uniqueId', uniqueId));
    }
    return matched;
  }, [allAssets, type, uniqueId]);
}
