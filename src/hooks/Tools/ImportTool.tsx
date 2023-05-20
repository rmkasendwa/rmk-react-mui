import { parseCSV } from '@infinite-debugger/rmk-utils/data';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Box,
  Button,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { omit } from 'lodash';
import { useRef, useState } from 'react';

import ImportIcon from '../../components/Icons/ImportIcon';
import DataDropdownField from '../../components/InputFields/DataDropdownField';
import ModalPopup from '../../components/ModalPopup';
import {
  RecordsExplorer,
  RecordsExplorerProps,
} from '../../components/RecordsExplorer';
import { ButtonTool } from '../../components/SearchSyncToolbar';
import { TableColumn } from '../../components/Table';
import { DropdownOption } from '../../interfaces/Utils';

const steps = ['Upload a file', 'Preview data', 'Map data', 'Import'] as const;
type Step = (typeof steps)[number];

export interface ImportToolOptions
  extends Partial<
    Pick<RecordsExplorerProps, 'recordLabelPlural' | 'recordLabelSingular'>
  > {
  importFields: DropdownOption[];
}

export const useImportTool = ({
  recordLabelPlural,
  recordLabelSingular,
  importFields,
}: ImportToolOptions): ButtonTool => {
  if (!recordLabelPlural) {
    recordLabelPlural = 'Records';
  }

  recordLabelSingular ||
    (recordLabelSingular = recordLabelPlural.replace(/s$/gi, ''));

  const inputFieldRef = useRef<HTMLInputElement | null>(null);
  const { palette } = useTheme();
  const [open, setOpen] = useState(true);
  const [activeStep, setActiveStep] = useState<Step>('Upload a file');
  const [data, setData] = useState<any[]>([]);
  const [dataColumns, setDataColumns] = useState<TableColumn[]>([]);
  const [mappedFields, setMappedFields] = useState<Record<string, string>>({});

  return {
    label: 'Import',
    icon: <ImportIcon />,
    type: 'button',
    onClick: () => {
      setOpen(true);
    },
    popupElement: (
      <ModalPopup
        title={`Import ${recordLabelPlural}`}
        open={open}
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
          switch (activeStep) {
            case 'Preview data':
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
            case 'Map data':
              return {
                actionButtons: [
                  <Button
                    key={0}
                    variant="contained"
                    onClick={() => {
                      setActiveStep('Import');
                    }}
                  >
                    Confirm mapping
                  </Button>,
                ],
              };
          }
        })()}
        {...(() => {
          if (activeStep === 'Map data') {
            const importedColumnCount = Object.keys(mappedFields).length;
            const ignoredColumnCount = dataColumns.length - importedColumnCount;
            return {
              popupStatsElement: (
                <Typography variant="body2" noWrap>
                  <strong>
                    {importedColumnCount} column
                    {importedColumnCount === 1 ? '' : 's'}
                  </strong>{' '}
                  to be imported. Ignored {ignoredColumnCount} column
                  {ignoredColumnCount === 1 ? '' : 's'}
                </Typography>
              ),
            };
          }
        })()}
        CardBodyProps={{
          sx: {
            p: 0,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
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
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            ...(() => {
              switch (activeStep) {
                case 'Upload a file':
                case 'Map data':
                case 'Import':
                  return {
                    p: 3,
                  };
              }
            })(),
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
                        if (
                          event.target.files &&
                          event.target.files.length > 0
                        ) {
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
                    {...{ recordLabelPlural, recordLabelSingular }}
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
              case 'Map data':
                return (
                  <Stack
                    sx={{
                      gap: 3,
                    }}
                  >
                    <Grid
                      container
                      sx={{
                        px: 3,
                      }}
                    >
                      <Grid
                        item
                        sx={{
                          width: 220,
                        }}
                      >
                        <Typography variant="body2" noWrap>
                          File Field Header
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs
                        sx={{
                          minWidth: 0,
                        }}
                      >
                        <Typography variant="body2" noWrap>
                          Data
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        sx={{
                          width: 250,
                        }}
                      >
                        <Typography variant="body2" noWrap>
                          {recordLabelSingular} Attribute
                        </Typography>
                      </Grid>
                    </Grid>

                    {dataColumns.map(({ id: columnId, label }, index) => {
                      const isFieldMapped = Boolean(
                        mappedFields[String(columnId)]
                      );
                      return (
                        <Box
                          key={index}
                          sx={{
                            p: 3,
                            bgcolor: alpha(palette.primary.main, 0.05),
                            borderRadius: '4px',
                            border: `1px solid ${
                              isFieldMapped
                                ? alpha(palette.primary.main, 0.7)
                                : palette.divider
                            }`,
                          }}
                        >
                          <Grid container>
                            <Grid
                              item
                              sx={{
                                width: 220,
                              }}
                            >
                              <Typography variant="body2" noWrap>
                                {label}
                              </Typography>
                            </Grid>
                            <Grid
                              item
                              xs
                              sx={{
                                minWidth: 0,
                              }}
                            >
                              {data.slice(0, 3).map((row, index) => {
                                return (
                                  <Typography
                                    key={index}
                                    variant="body2"
                                    noWrap
                                  >
                                    {row[columnId]}
                                  </Typography>
                                );
                              })}
                            </Grid>
                            <Grid
                              item
                              sx={{
                                width: 250,
                              }}
                            >
                              <DataDropdownField
                                options={[
                                  {
                                    label: 'Do not import',
                                    value: 'do_not_import',
                                  },
                                  ...importFields,
                                ]}
                                value="do_not_import"
                                onChange={(event) => {
                                  if (
                                    !event.target.value ||
                                    event.target.value === 'do_not_import'
                                  ) {
                                    setMappedFields((prevMappedFields) => {
                                      return omit(prevMappedFields, columnId);
                                    });
                                  } else {
                                    setMappedFields((prevMappedFields) => {
                                      return {
                                        ...prevMappedFields,
                                        [columnId]: event.target.value,
                                      };
                                    });
                                  }
                                }}
                                fullWidth
                                InputProps={{
                                  sx: {
                                    bgcolor: palette.background.paper,
                                  },
                                }}
                                showClearButton={false}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      );
                    })}
                  </Stack>
                );
            }
          })()}
        </Box>
      </ModalPopup>
    ),
  };
};
