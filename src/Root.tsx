import React from 'react';
import { Composition } from 'remotion';
import { GuanduMVP } from './GuanduMVP';
import { battle } from './data/battle';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id={battle.meta.id}
      component={GuanduMVP}
      durationInFrames={battle.meta.durationInFrames}
      fps={battle.meta.fps}
      width={battle.meta.width}
      height={battle.meta.height}
    />
  );
};
