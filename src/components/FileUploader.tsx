import { formatBytes } from '@infinite-debugger/rmk-utils/bytes';
import CloseIcon from '@mui/icons-material/Close';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Card, IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/system/colorManipulator';
import { Fragment, forwardRef, useEffect, useState } from 'react';

import { useFileUpload } from '../hooks/Files';
import {
  FileContainer,
  FileDownloadFunction,
  FileUploadFunction,
} from '../models/Utils';
import { flickerElement } from '../utils/page';
import FileIcon from './FileIcon';
import { TextFieldProps } from './InputFields/TextField';
import Tooltip from './Tooltip';

export interface FileUploaderProps
  extends Pick<
    TextFieldProps,
    'helperText' | 'error' | 'onChange' | 'name' | 'id'
  > {
  value?: FileContainer[];
  upload?: FileUploadFunction;
  download?: FileDownloadFunction;
}

export const FileUploader = forwardRef<HTMLDivElement, FileUploaderProps>(
  function FileUploader(
    { helperText, error, onChange, name, id, value, upload, download },
    ref
  ) {
    const { palette } = useTheme();
    const [fileListContainer, setFileListContainer] =
      useState<HTMLUListElement | null>(null);

    const [fileField, setFileField] = useState<HTMLInputElement | null>(null);
    const { files, setFiles, duplicateFileSelections } = useFileUpload({
      fileField,
      upload,
      download,
      name,
      id,
      value,
      onChange,
      convertFilesToBase64: false,
    });

    const removeFile = (index: number) => {
      files.splice(index, 1);
      setFiles([...files]);
    };

    useEffect(() => {
      if (fileListContainer && duplicateFileSelections.length > 0) {
        [...fileListContainer.querySelectorAll('.file-uploader-file-list-item')]
          .filter((_, index) => {
            return duplicateFileSelections.includes(index);
          })
          .forEach((fileLIstItem) => flickerElement(fileLIstItem));
      }
    }, [duplicateFileSelections, fileListContainer]);

    return (
      <FormControl ref={ref} fullWidth error={error}>
        <input
          type="file"
          ref={(fileField) => {
            setFileField(fileField);
          }}
          multiple
          style={{ display: 'none' }}
        />
        <Grid container columnSpacing={3}>
          <Grid
            item
            xs={files.length <= 0}
            sx={{
              width: files.length > 0 ? 320 : undefined,
            }}
          >
            <Card
              sx={{
                bgcolor: alpha(palette.text.primary, 0.1),
                cursor: 'pointer',
                borderWidth: 2,
                borderStyle: 'dashed',
              }}
              onClick={() => {
                fileField?.click();
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  minWidth: 220,
                  height: 220,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CloudUploadIcon
                  sx={{
                    fontSize: 80,
                    display: 'block',
                    color: alpha(palette.text.primary, 0.2),
                  }}
                />
                <Button variant="contained" color="success" sx={{ mb: 1 }}>
                  Upload File
                </Button>
                <Typography
                  variant="body2"
                  sx={{
                    color: alpha(palette.text.primary, 0.2),
                    fontWeight: 'bold',
                  }}
                >
                  20MB Maximum file size
                </Typography>
              </Box>
            </Card>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
          </Grid>
          {files.length > 0 ? (
            <Grid item xs>
              <Grid container alignItems="center">
                <Grid item xs>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {files.length} file{files.length === 1 ? null : 's'}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    sx={{
                      color: palette.success.main,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    Download All
                  </Typography>
                </Grid>
              </Grid>
              <List
                ref={(fileListContainer) => {
                  setFileListContainer(fileListContainer);
                }}
                className="file-uploader-file-list"
                sx={{ width: '100%' }}
              >
                {files.map(
                  (
                    {
                      uploading,
                      uploadProgress,
                      uploadError,
                      cancelUpload,
                      retryUpload,

                      download,
                      downloading,
                      downloadProgress,
                      downloadError,
                      cancelDownload,
                      retryDownload,

                      name,
                      size,
                    },
                    index
                  ) => {
                    return (
                      <Fragment key={index}>
                        {index === 0 ? null : <Divider />}
                        <ListItem
                          className="file-uploader-file-list-item"
                          sx={{
                            px: 0,
                            py: 0.5,
                            '&:hover': {
                              backgroundColor: alpha(palette.primary.main, 0.1),
                            },
                            gap: 2,
                          }}
                        >
                          <ListItemAvatar sx={{ minWidth: 40 }}>
                            <FileIcon
                              fileName={name}
                              sx={{
                                svg: {
                                  width: 40,
                                },
                              }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={name}
                            primaryTypographyProps={{
                              noWrap: true,
                            }}
                            secondary={formatBytes(size)}
                            secondaryTypographyProps={{
                              sx: {
                                fontSize: 12,
                              },
                            }}
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              wordBreak: 'break-all',
                            }}
                          />
                          <Box sx={{ display: 'flex' }}>
                            {download &&
                            !uploading &&
                            !uploadError &&
                            !downloading &&
                            !downloadError ? (
                              <Tooltip title="Dowload">
                                <IconButton onClick={() => download()}>
                                  <CloudDownloadIcon />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                            {!uploading &&
                            !uploadError &&
                            !downloading &&
                            !downloadError ? (
                              <Tooltip title="Delete">
                                <IconButton
                                  onClick={() => {
                                    removeFile(index);
                                    cancelUpload && cancelUpload();
                                    cancelDownload && cancelDownload();
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            ) : null}

                            {/* Upload components */}
                            {uploadError && retryUpload ? (
                              <Tooltip title={uploadError}>
                                <IconButton onClick={() => retryUpload()}>
                                  <RefreshIcon />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                            {uploading || uploadError ? (
                              <Tooltip title="Cancel Upload">
                                <IconButton
                                  onClick={() => {
                                    removeFile(index);
                                    cancelUpload && cancelUpload();
                                  }}
                                >
                                  <CloseIcon />
                                </IconButton>
                              </Tooltip>
                            ) : null}

                            {/* Download components */}
                            {downloadError && retryDownload ? (
                              <Tooltip title={downloadError}>
                                <IconButton onClick={() => retryDownload()}>
                                  <RefreshIcon />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                            {downloading || downloadError ? (
                              <Tooltip title="Cancel Download">
                                <IconButton
                                  onClick={() => {
                                    cancelDownload && cancelDownload();
                                  }}
                                >
                                  <CloseIcon />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                          </Box>
                        </ListItem>
                        {uploadProgress && (uploading || uploadError) ? (
                          <LinearProgress
                            value={uploadProgress}
                            variant="determinate"
                            color={uploadError ? 'error' : 'info'}
                          />
                        ) : null}
                        {downloadProgress && (downloading || downloadError) ? (
                          <LinearProgress
                            value={downloadProgress}
                            variant="determinate"
                            color={downloadError ? 'error' : 'info'}
                          />
                        ) : null}
                      </Fragment>
                    );
                  }
                )}
              </List>
            </Grid>
          ) : null}
        </Grid>
      </FormControl>
    );
  }
);

export default FileUploader;
