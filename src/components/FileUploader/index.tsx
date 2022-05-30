import CancelIcon from '@mui/icons-material/Cancel';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ReplayIcon from '@mui/icons-material/Replay';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/system/colorManipulator';
import {
  CSSProperties,
  Fragment,
  forwardRef,
  useEffect,
  useState,
} from 'react';

import { useFileUpload } from '../../hooks/Files';
import {
  IFile,
  TFileDownloadFunction,
  TFileUploadFunction,
} from '../../interfaces/Utils';
import { formatBytes } from '../../utils/bytes';
import { flickerElement } from '../../utils/page';
import Card from '../Card';
import { ITextFieldProps } from '../InputFields/TextField';
import fileTypeIcons from './img/file-type-icons.png';

export interface IFileUploaderProps
  extends Pick<
    ITextFieldProps,
    'helperText' | 'error' | 'onChange' | 'name' | 'id'
  > {
  value?: IFile[];
  upload?: TFileUploadFunction;
  download?: TFileDownloadFunction;
}

const supportedFileIcons = [
  'pdf',
  'jpg',
  'png',
  'ppt',
  'doc',
  'zip',
  'exe',
  'wav',
  'mpg',
  'mp4',
  'mov',
  'html',
  'xlsx',
  'svg',
  'docx',
  'jar',
  'json',
  'csv',
  'py',
  'xml',
  'mp3',
  'css',
  'js',
  'txt',
  'reg',
  'psd',
  'ink',
  'inf',
];

const supportedSmallFileIconStyles = supportedFileIcons.reduce(
  (accumulator, fileExtension, index) => {
    const columnIndex = index % 12;
    const rowIndex = Math.floor(index / 12);
    accumulator[fileExtension] = {
      backgroundPosition: `${-columnIndex * 68}px ${-rowIndex * 90}px`,
    };
    return accumulator;
  },
  {} as Record<string, CSSProperties>
);

const iconGroups: Record<string, string[]> = {
  jpg: ['jpeg'],
  zip: ['rar', '7z', 'gz', 'tar'],
  jar: ['war', 'jad'],
  xlsx: ['xltx'],
  ink: ['lnk'],
  inf: ['nfo'],
};

const fileIconAliases = Object.keys(iconGroups).reduce((accumlator, key) => {
  iconGroups[key].forEach((alias) => (accumlator[alias] = key));
  return accumlator;
}, {} as Record<string, string>);

supportedFileIcons.push(...Object.keys(fileIconAliases));

export const FileUploader = forwardRef<HTMLDivElement, IFileUploaderProps>(
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
                backgroundColor: alpha(palette.text.primary, 0.1),
                cursor: 'pointer',
                borderStyle: error ? 'dashed' : 'solid',
                borderColor: error ? palette.error.main : 'divider',
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
                    const fileExtension = (() => {
                      const fileExtensionMatch = /\.(\w+)$/g.exec(name);
                      if (
                        fileExtensionMatch &&
                        supportedFileIcons.includes(
                          fileExtensionMatch[1].toLowerCase()
                        )
                      ) {
                        const fileExtension =
                          fileExtensionMatch[1].toLowerCase();
                        return fileIconAliases[fileExtension] || fileExtension;
                      }
                      return false;
                    })();
                    return (
                      <Fragment key={index}>
                        {index === 0 ? null : <Divider />}
                        <ListItem
                          className="file-uploader-file-list-item"
                          sx={{
                            pl: 0,
                            pr: 1,
                            py: 0.5,
                            '&:hover': {
                              backgroundColor: alpha(palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <ListItemAvatar sx={{ minWidth: 40 }}>
                            {fileExtension ? (
                              <Box
                                sx={{
                                  width: 30,
                                  height: 40,
                                  '&:after': {
                                    content: '""',
                                    display: `block`,
                                    width: 68,
                                    height: 90,
                                    position: `absolute`,
                                    top: 14,
                                    left: 7,
                                    backgroundImage: `url('${fileTypeIcons}')`,
                                    backgroundSize: 816,
                                    backgroundRepeat: `no-repeat`,
                                    transformOrigin: `top left`,
                                    transform: `scale(0.36)`,
                                    ...supportedSmallFileIconStyles[
                                      fileExtension
                                    ],
                                  },
                                }}
                              />
                            ) : (
                              <InsertDriveFileIcon sx={{ fontSize: 36 }} />
                            )}
                          </ListItemAvatar>
                          <ListItemText
                            primary={name}
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
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {download &&
                            !uploading &&
                            !uploadError &&
                            !downloading &&
                            !downloadError ? (
                              <Button
                                startIcon={<CloudDownloadIcon />}
                                variant="outlined"
                                color="success"
                                onClick={() => download()}
                              >
                                Download
                              </Button>
                            ) : null}
                            {!uploading &&
                            !uploadError &&
                            !downloading &&
                            !downloadError ? (
                              <Button
                                startIcon={<DeleteIcon />}
                                variant="outlined"
                                color="error"
                                onClick={() => {
                                  removeFile(index);
                                  cancelUpload && cancelUpload();
                                  cancelDownload && cancelDownload();
                                }}
                              >
                                Delete
                              </Button>
                            ) : null}

                            {/* Upload components */}
                            {uploadError && retryUpload ? (
                              <Tooltip title={uploadError}>
                                <Button
                                  startIcon={<ReplayIcon />}
                                  variant="outlined"
                                  color="info"
                                  onClick={() => {
                                    retryUpload();
                                  }}
                                >
                                  Try Again
                                </Button>
                              </Tooltip>
                            ) : null}
                            {uploading || uploadError ? (
                              <Button
                                startIcon={<CancelIcon />}
                                variant="outlined"
                                color="warning"
                                onClick={() => {
                                  removeFile(index);
                                  cancelUpload && cancelUpload();
                                }}
                              >
                                Cancel Upload
                              </Button>
                            ) : null}

                            {/* Download components */}
                            {downloadError && retryDownload ? (
                              <Tooltip title={downloadError}>
                                <Button
                                  startIcon={<ReplayIcon />}
                                  variant="outlined"
                                  color="info"
                                  onClick={() => {
                                    retryDownload();
                                  }}
                                >
                                  Try Again
                                </Button>
                              </Tooltip>
                            ) : null}
                            {downloading || downloadError ? (
                              <Button
                                startIcon={<CancelIcon />}
                                variant="outlined"
                                color="warning"
                                onClick={() => {
                                  cancelDownload && cancelDownload();
                                }}
                              >
                                Cancel Download
                              </Button>
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
