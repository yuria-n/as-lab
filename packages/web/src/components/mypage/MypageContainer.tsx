import React, { memo, useCallback, useState } from 'react';
import { FaFileDownload, FaFileUpload } from 'react-icons/fa';

import { Button, Grid, Page } from '../universal';
import { ImportDialog } from './ImportDialog';
import { Path, mypageLinks, titleMap } from '../../constants';
import { useUserData } from '../../hooks';

interface Props {
  active: Path;
  description: React.ReactNode;
  children: React.ReactNode;
}

export const MypageContainer = memo(Component);

function Component({ active, ...props }: Props) {
  const [open, setOpen] = useState(false);
  const { exportUserData } = useUserData();
  const onBackUpClick = useCallback(() => exportUserData(), [exportUserData]);
  const onOpen = useCallback(() => setOpen(true), [setOpen]);
  const onClose = useCallback(() => setOpen(false), [setOpen]);

  return (
    <Page
      title={titleMap[Path.Mypage]}
      actions={
        <>
          <Grid columns="repeat(3, auto)" gap="0.5rem">
            <Button mode="secondary" onClick={onBackUpClick}>
              <FaFileDownload />
              バックアップ
            </Button>
            <Button onClick={onOpen}>
              <FaFileUpload />
              データを復元
            </Button>
          </Grid>
          <ImportDialog open={open} onClose={onClose} />
        </>
      }
      links={mypageLinks}
      active={`${Path.Mypage}${active}`}
      {...props}
    />
  );
}
