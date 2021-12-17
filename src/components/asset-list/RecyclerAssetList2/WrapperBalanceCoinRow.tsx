import React from 'react';
import { BalanceCoinRow } from '../../coin-row';
import { AssetType } from '@rainbow-me/entities';
import { useWalletTokenAsset } from '@rainbow-me/hooks';

export default React.memo(function WrapperBalanceCoinRow({
  uniqueId,
}: {
  uniqueId: string;
}) {
  const token = useWalletTokenAsset(AssetType.token, uniqueId);

  return <BalanceCoinRow item={token} />;
});
