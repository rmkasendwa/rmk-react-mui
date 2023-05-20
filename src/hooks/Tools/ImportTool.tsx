import { parseCSV } from '@infinite-debugger/rmk-utils/data';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Box,
  Button,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useTheme,
} from '@mui/material';
import { useRef, useState } from 'react';

import ImportIcon from '../../components/Icons/ImportIcon';
import ModalPopup from '../../components/ModalPopup';
import { RecordsExplorer } from '../../components/RecordsExplorer';
import { ButtonTool } from '../../components/SearchSyncToolbar';
import { TableColumn } from '../../components/Table';

const steps = ['Upload a file', 'Preview data', 'Map data', 'Import'] as const;
type Step = (typeof steps)[number];

export interface ImportToolOptions {}

export const useImportTool = ({}: ImportToolOptions = {}): ButtonTool => {
  const inputFieldRef = useRef<HTMLInputElement | null>(null);
  const { palette } = useTheme();
  const [open, setOpen] = useState(true);
  const [activeStep, setActiveStep] = useState<Step>('Upload a file');
  const [data, setData] = useState<any[]>([]);
  const [dataColumns, setDataColumns] = useState<TableColumn[]>([]);

  return {
    label: 'Import',
    icon: <ImportIcon />,
    type: 'button',
    onClick: () => {
      setOpen(true);
    },
    popupElement: (
      <ModalPopup
        {...{ open }}
        headerElement={
          <Box
            sx={{
              px: 3,
              py: 2,
            }}
          >
            <Stepper activeStep={steps.indexOf(activeStep)} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        }
        onClose={() => {
          setOpen(false);
        }}
        CardProps={{
          sx: {
            maxHeight: 'none',
            ...(() => {
              switch (activeStep) {
                case 'Preview data':
                case 'Map data':
                  return {
                    maxWidth: 960,
                    height: '80%',
                  };
              }
            })(),
          },
        }}
        {...(() => {
          if (activeStep === 'Preview data') {
            return {
              actionButtons: [
                <Button
                  key={0}
                  variant="contained"
                  onClick={() => {
                    setActiveStep('Map data');
                  }}
                >
                  Confirm your file
                </Button>,
              ],
            };
          }
        })()}
        showHeaderToolbar={false}
        CardBodyProps={{
          sx: {
            position: 'relative',
            ...(() => {
              if (activeStep === 'Preview data') {
                return {
                  p: 0,
                };
              }
              return {
                py: 3,
              };
            })(),
          },
        }}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {(() => {
          switch (activeStep) {
            case 'Upload a file':
              return (
                <>
                  <input
                    ref={inputFieldRef}
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    style={{ display: 'none' }}
                    onChange={(event) => {
                      if (event.target.files && event.target.files.length > 0) {
                        const reader = new FileReader();
                        reader.onload = function (event) {
                          const fileData = event.target?.result;
                          if (fileData) {
                            const data = parseCSV(fileData as string);
                            if (data.length > 0) {
                              setActiveStep('Preview data');
                              setData(data);
                              setDataColumns(
                                Object.keys(data[0]).map((key) => {
                                  return {
                                    id: key,
                                    label: key,
                                  };
                                })
                              );
                            } else {
                              // TODO: 'Show error message';
                            }
                          }
                        };
                        reader.onerror = function (err) {
                          console.error(err);
                        };
                        reader.readAsText(event.target.files[0]);
                      }
                    }}
                  />
                  <Box
                    sx={{
                      border: `2px dashed ${palette.divider}`,
                      borderRadius: '4px',
                    }}
                  >
                    <Stack
                      sx={{
                        gap: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '300px',
                      }}
                    >
                      <CloudUploadIcon
                        sx={{
                          fontSize: 80,
                        }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 'bold',
                        }}
                      >
                        Drag and drop files here
                      </Typography>
                      <Typography variant="body2">or</Typography>
                      <Button
                        onClick={() => {
                          inputFieldRef.current?.click();
                        }}
                        variant="contained"
                        size="medium"
                      >
                        Browse files
                      </Button>
                    </Stack>
                  </Box>
                </>
              );
            case 'Preview data':
              return (
                <RecordsExplorer
                  title="Preview first 10 lines of your file"
                  data={data.slice(0, 10)}
                  views={[
                    {
                      type: 'List',
                      columns: dataColumns,
                    },
                  ]}
                  elevation={0}
                />
              );
          }
        })()}
      </ModalPopup>
    ),
  };
};
