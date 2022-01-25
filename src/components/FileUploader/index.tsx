import './style.scss';

import CancelIcon from '@mui/icons-material/Cancel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { FC, Fragment, useEffect, useRef, useState } from 'react';

import { formatBytes } from '../../utils/bytes';
import { flickerElement } from '../../utils/page';
import Card from '../Card';

export interface IFileUploaderProps {}

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

export const FileUploader: FC<IFileUploaderProps> = () => {
  const theme = useTheme();
  const fileInputFieldRef = useRef<HTMLInputElement | null>(null);
  const fileListContainerRef = useRef<HTMLUListElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [duplicateSelections, setDuplicateSelections] = useState<File[]>([]);

  useEffect(() => {
    if (duplicateSelections.length > 0 && fileListContainerRef.current) {
      const duplicateSelectionIndexes = duplicateSelections
        .map((duplicateSelection) => {
          return files.indexOf(duplicateSelection);
        })
        .filter((index) => index != null);
      fileListContainerRef.current
        .querySelectorAll('li')
        .forEach((fileListItem, index) => {
          if (duplicateSelectionIndexes.includes(index)) {
            flickerElement(fileListItem);
          }
        });
    }
  }, [duplicateSelections, files]);

  return (
    <>
      <input
        ref={fileInputFieldRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(event) => {
          if (event.target.files) {
            const selectedFiles: File[] = [];
            const filesAlreadyAttached: File[] = [];
            for (let i = 0, j = event.target.files.length; i < j; i++) {
              const { name: currentFileName, size: currentFileSize } =
                event.target.files[i];
              const attachedFile = files.find(({ name, size }) => {
                return name === currentFileName && size === currentFileSize;
              });
              if (attachedFile) {
                filesAlreadyAttached.push(attachedFile);
              } else {
                selectedFiles.push(event.target.files[i]);
              }
            }
            setFiles((prevFiles) => {
              return [...prevFiles, ...selectedFiles];
            });
            setDuplicateSelections(filesAlreadyAttached);
            event.target.value = '';
          }
        }}
      />
      <Grid container columnSpacing={3}>
        <Grid item xs={files.length <= 0}>
          <Card
            sx={{
              backgroundColor: alpha(theme.palette.text.primary, 0.1),
              cursor: 'pointer',
            }}
            onClick={() => {
              if (fileInputFieldRef.current) {
                fileInputFieldRef.current.click();
              }
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
                  color: alpha(theme.palette.text.primary, 0.2),
                }}
              />
              <Button variant="contained" color="success" sx={{ mb: 1 }}>
                Upload File
              </Button>
              <Typography
                variant="body2"
                sx={{
                  color: alpha(theme.palette.text.primary, 0.2),
                  fontWeight: 'bold',
                }}
              >
                20MB Maximum file size
              </Typography>
            </Box>
          </Card>
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
                    color: theme.palette.success.main,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Download All
                </Typography>
              </Grid>
            </Grid>
            <List ref={fileListContainerRef} sx={{ width: '100%' }}>
              {files.map(({ name, size }, index) => {
                const fileIconClassNames = ['file-icon', 'file-icon-small'];
                const fileExtensionMatch = /\.(\w+)$/g.exec(name);
                if (
                  fileExtensionMatch &&
                  supportedFileIcons.includes(
                    fileExtensionMatch[1].toLowerCase()
                  )
                ) {
                  const fileExtension = fileExtensionMatch[1].toLowerCase();
                  fileIconClassNames.push(
                    fileIconAliases[fileExtension] || fileExtension
                  );
                }
                return (
                  <Fragment key={index}>
                    {index === 0 ? null : <Divider />}
                    <ListItem
                      sx={{
                        px: 0,
                        py: 0.5,
                        '&:hover': {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                        },
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 48 }}>
                        <Box
                          className={fileIconClassNames.join(' ')}
                          sx={{ width: 30, height: 40 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={name}
                        secondary={
                          <>
                            {formatBytes(size)}{' '}
                            <Typography
                              variant="body2"
                              component="span"
                              color={theme.palette.success.main}
                            >
                              •
                            </Typography>{' '}
                            Ronald M. Kasendwa
                          </>
                        }
                        secondaryTypographyProps={{
                          sx: {
                            fontSize: 12,
                          },
                        }}
                        sx={{ flex: 1, minWidth: 0, wordBreak: 'break-all' }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          startIcon={<CloudUploadIcon />}
                          variant="outlined"
                          color="success"
                        >
                          Download
                        </Button>
                        <Button
                          startIcon={<DeleteIcon />}
                          variant="outlined"
                          color="error"
                        >
                          Delete
                        </Button>
                        <Button
                          startIcon={<CancelIcon />}
                          variant="outlined"
                          color="warning"
                        >
                          Cancel
                        </Button>
                      </Box>
                    </ListItem>
                    <LinearProgress
                      value={23}
                      variant="determinate"
                      color="error"
                    />
                  </Fragment>
                );
              })}
            </List>
          </Grid>
        ) : null}
      </Grid>
    </>
  );
};

export default FileUploader;
