import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import { FC } from 'react';
import { Link } from 'react-router-dom';

import ErrorAlert from './ErrorAlert';

export interface IconLoadingScreenProps {
  recordLabelPlural?: string;
  recordLabelSingular?: string;
  noRecordsStatement?: string;
  recordsCount?: number;
  pathToAddNew?: string;
  Icon?: FC<any>;
  LoadingIcon?: FC<any>;
  loading?: boolean;
  errorMessage?: string;
  load?: () => void;
}

export const IconLoadingScreen: FC<IconLoadingScreenProps> = ({
  recordLabelPlural = 'Records',
  recordLabelSingular,
  noRecordsStatement,
  recordsCount,
  pathToAddNew = '',
  Icon = CloudSyncIcon,
  LoadingIcon,
  loading,
  errorMessage,
  load,
}) => {
  recordLabelSingular ||
    (recordLabelSingular = recordLabelPlural.replace(/s$/gi, ''));

  const lowercaseRecordLabelPlural = recordLabelPlural.toLowerCase();
  const lowercaseRecordLabelSingular = recordLabelSingular.toLowerCase();
  noRecordsStatement ||
    (noRecordsStatement = `Add ${lowercaseRecordLabelSingular}.`);

  const { spacing } = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        height: '100%',
        minHeight: 200,
      }}
    >
      <Stack sx={{ alignItems: 'center', gap: 1 }}>
        {(() => {
          if (loading && LoadingIcon) {
            return (
              <LoadingIcon
                sx={{
                  fontSize: 48,
                }}
              />
            );
          }
          return (
            <Icon
              sx={{
                fontSize: 48,
              }}
            />
          );
        })()}
        {(() => {
          if (loading) {
            return (
              <Typography align="center" variant="body2">
                Loading {lowercaseRecordLabelPlural}...
              </Typography>
            );
          }
          if (errorMessage) {
            return <ErrorAlert message={errorMessage} retry={load} />;
          }
          if (pathToAddNew) {
            return (
              <>
                <Typography
                  align="center"
                  sx={{
                    fontWeight: 500,
                    fontSize: 22,
                  }}
                >
                  {noRecordsStatement}
                </Typography>
                <Typography align="center" variant="body2">
                  Specify the {lowercaseRecordLabelSingular} details.
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to={pathToAddNew}
                  size="small"
                  sx={{ mt: `${spacing(2)} !important` }}
                >
                  Add New {recordLabelSingular}
                </Button>
              </>
            );
          }
          if (recordsCount != null && recordsCount <= 0) {
            return (
              <Typography align="center" variant="body2">
                No {lowercaseRecordLabelPlural} found.
              </Typography>
            );
          }
        })()}
      </Stack>
    </Box>
  );
};

export default IconLoadingScreen;
