import {
  Box,
  BoxProps,
  Card,
  Chip,
  ClickAwayListener,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  Grid,
  Grow,
  Popper,
  Typography,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  typographyClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { ReactNode, forwardRef, useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';

import {
  PaginatedRecordsFinderOptions,
  usePaginatedRecords,
} from '../hooks/Utils';
import { isDescendant } from '../utils/html';
import TextField from './InputFields/TextField';
import PaginatedDropdownOptionList, {
  DropdownOption,
} from './PaginatedDropdownOptionList';
import ProfileGravatar, { ProfileGravatarProps } from './ProfileGravatar';
import Tooltip from './Tooltip';

export interface EmailAddressSelectorClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type EmailAddressSelectorClassKey = keyof EmailAddressSelectorClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiEmailAddressSelector: EmailAddressSelectorProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiEmailAddressSelector: keyof EmailAddressSelectorClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiEmailAddressSelector?: {
      defaultProps?: ComponentsProps['MuiEmailAddressSelector'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiEmailAddressSelector'];
      variants?: ComponentsVariants['MuiEmailAddressSelector'];
    };
  }
}
//#endregion

export const getEmailAddressSelectorUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiEmailAddressSelector', slot);
};

const slots: Record<
  EmailAddressSelectorClassKey,
  [EmailAddressSelectorClassKey]
> = {
  root: ['root'],
};

export const emailAddressSelectorClasses: EmailAddressSelectorClasses =
  generateUtilityClasses(
    'MuiEmailAddressSelector',
    Object.keys(slots) as EmailAddressSelectorClassKey[]
  );

export interface EmailAddressHolder {
  name: string;
  email: string;
  profilePictureUrl?: string;
}

export type EmailAddressHolderResolverFunction = (
  options: PaginatedRecordsFinderOptions
) => Promise<EmailAddressHolder[]>;

const OPTION_HEIGHT = 50;

export interface EmailAddressSelectorProps extends Partial<BoxProps> {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  emailAddresses?: string[];
  onChangeSelectedEmailAddresses?: (emailAddresses: string[]) => void;
  getEmailAddressHolders?: EmailAddressHolderResolverFunction;
  ProfileGravatarProps?: ProfileGravatarProps;
}

export const EmailAddressSelector = forwardRef<
  HTMLDivElement,
  EmailAddressSelectorProps
>(function EmailAddressSelector(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiEmailAddressSelector',
  });
  const {
    className,
    startAdornment,
    endAdornment,
    onChangeSelectedEmailAddresses,
    emailAddresses: emailAddressesProp,
    getEmailAddressHolders,
    ProfileGravatarProps = {},
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getEmailAddressSelectorUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { ...ProfileGravatarPropsRest } = ProfileGravatarProps;

  const [searchTerm, setSearchTerm] = useState('');

  const {
    load: loadEmailAddressHolders,
    allPageRecords: emailAddressHolders,
    reset: resetEmailAddressHoldersState,
  } = usePaginatedRecords(
    async ({ limit, offset, getRequestController }) => {
      if (getEmailAddressHolders) {
        const optionsResponse = await getEmailAddressHolders({
          searchTerm,
          limit,
          offset,
          getRequestController,
        });
        return {
          records: optionsResponse,
          recordsTotalCount: optionsResponse.length,
        };
      }
      return { records: [], recordsTotalCount: 0 };
    },
    {
      loadOnMount: false,
      autoSync: false,
      limit: 11,
      searchTerm,
    }
  );

  // Refs
  const isInitialMountRef = useRef(true);
  const anchorRef = useRef<HTMLDivElement | null>();
  const searchFieldRef = useRef<HTMLInputElement | null>();
  const onChangeSelectedEmailAddressesRef = useRef(
    onChangeSelectedEmailAddresses
  );
  const emailAddressHoldersRef = useRef(emailAddressHolders);
  useEffect(() => {
    onChangeSelectedEmailAddressesRef.current = onChangeSelectedEmailAddresses;
    emailAddressHoldersRef.current = emailAddressHolders;
  }, [emailAddressHolders, onChangeSelectedEmailAddresses]);

  const [selectedEmailAddressHolders, setSelectedEmailAddressHolders] =
    useState<(string | EmailAddressHolder)[]>([]);
  const [selectedEmailAddress, setSelectedEmailAddress] = useState<
    string | undefined
  >(undefined);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (selectedEmailAddress) {
      setSelectedEmailAddressHolders((prevEmailAddresses) => {
        const selectedEmailAddressHolder = emailAddressHoldersRef.current.find(
          ({ email }) => {
            return email === selectedEmailAddress;
          }
        );
        return [
          ...prevEmailAddresses,
          selectedEmailAddressHolder || selectedEmailAddress,
        ];
      });
      setSelectedEmailAddress(undefined);
    }
  }, [selectedEmailAddress]);

  useEffect(() => {
    if (!isInitialMountRef.current && emailAddressesProp) {
      setSelectedEmailAddressHolders((prevEmailAddressHolders) => {
        const emailAddresses = prevEmailAddressHolders.map((emailAddress) => {
          if (typeof emailAddress === 'string') {
            return emailAddress;
          }
          return emailAddress.email;
        });
        if (emailAddressesProp.join(';') !== emailAddresses.join(';')) {
          return emailAddressesProp.map((emailAddress) => {
            const existingEmailAddressHolder = prevEmailAddressHolders.find(
              (emailAddressHolder) => {
                return (
                  typeof emailAddressHolder !== 'string' &&
                  emailAddressHolder.email === emailAddress
                );
              }
            );
            if (existingEmailAddressHolder) {
              return existingEmailAddressHolder;
            }
            return emailAddress;
          });
        }
        return prevEmailAddressHolders;
      });
    }
  }, [emailAddressesProp]);

  useEffect(() => {
    resetEmailAddressHoldersState();
    if (isFocused && searchTerm.length > 0) {
      loadEmailAddressHolders();
    }
  }, [isFocused, loadEmailAddressHolders, resetEmailAddressHoldersState, searchTerm.length]);

  useEffect(() => {
    if (!isInitialMountRef.current) {
      onChangeSelectedEmailAddressesRef.current &&
        onChangeSelectedEmailAddressesRef.current(
          selectedEmailAddressHolders.map((emailAddress) => {
            if (typeof emailAddress === 'string') {
              return emailAddress;
            }
            return emailAddress.email;
          })
        );
    }
  }, [selectedEmailAddressHolders]);

  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

  const validEmailAddress = Yup.string()
    .email()
    .required()
    .isValidSync(searchTerm)
    ? searchTerm
    : undefined;

  const options = [
    ...emailAddressHolders,
    ...(() => {
      if (validEmailAddress) {
        return [validEmailAddress];
      }
      return [];
    })(),
  ].map((validEmailAddress) => {
    const { email, name, profilePictureUrl } = ((): {
      email: string;
      name?: string;
      profilePictureUrl?: string;
    } => {
      if (typeof validEmailAddress === 'string') {
        return {
          email: validEmailAddress,
        };
      }
      return validEmailAddress;
    })();

    const selectedEmailAddresses = selectedEmailAddressHolders.map(
      (emailAddress) => {
        if (typeof emailAddress === 'string') {
          return emailAddress;
        }
        return emailAddress.email;
      }
    );

    return {
      label: (
        <Grid
          container
          spacing={1}
          sx={{
            height: OPTION_HEIGHT,
          }}
        >
          <Grid item>
            <ProfileGravatar
              {...ProfileGravatarPropsRest}
              size={32}
              email={email}
              label={name}
              src={profilePictureUrl}
            />
          </Grid>
          <Grid
            item
            xs
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              variant="body2"
              noWrap
              sx={{
                fontWeight: 600,
              }}
            >
              {name || email}
            </Typography>
            <Typography
              variant="body2"
              noWrap
              sx={{
                fontSize: 12,
              }}
            >
              {email}
            </Typography>
          </Grid>
        </Grid>
      ),
      value: email,
      selectable: !selectedEmailAddresses.includes(email),
    } as DropdownOption;
  });

  const isOpen = Boolean(
    (validEmailAddress || emailAddressHolders.length > 0) &&
      isFocused &&
      options.length > 0 &&
      searchTerm.length > 0
  );

  return (
    <Box ref={ref} {...rest} className={clsx(classes.root)}>
      <Grid
        container
        sx={{
          gap: 1,
          mb: 1,
          [`&,.${typographyClasses.root}`]: {
            lineHeight: '32px',
          },
        }}
      >
        {startAdornment ? (
          <Grid
            item
            sx={{
              display: 'flex',
              alignItems: 'start',
            }}
          >
            <Box
              sx={{
                height: 32,
              }}
            >
              {startAdornment}
            </Box>
          </Grid>
        ) : null}
        <Grid
          item
          xs
          sx={{
            minWidth: 0,
          }}
        >
          <Grid
            container
            sx={{
              gap: 1,
            }}
          >
            {selectedEmailAddressHolders.map((emailAddress, index) => {
              const { email, name, profilePictureUrl } = ((): {
                email: string;
                name?: string;
                profilePictureUrl?: string;
              } => {
                if (typeof emailAddress === 'string') {
                  return {
                    email: emailAddress,
                  };
                }
                return emailAddress;
              })();
              return (
                <Chip
                  key={index}
                  avatar={
                    <Tooltip
                      title={
                        <Card
                          sx={{
                            p: 2,
                            width: 360,
                          }}
                        >
                          <Grid
                            container
                            spacing={2}
                            sx={{
                              alignItems: 'center',
                            }}
                          >
                            <Grid item>
                              <ProfileGravatar
                                {...ProfileGravatarPropsRest}
                                size={64}
                                email={email}
                                label={name}
                                src={profilePictureUrl}
                              />
                            </Grid>
                            <Grid
                              item
                              xs
                              sx={{
                                minWidth: 0,
                              }}
                            >
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{
                                  fontWeight: 600,
                                  fontSize: 20,
                                }}
                              >
                                {name || email}
                              </Typography>
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{
                                  fontSize: 18,
                                }}
                              >
                                {email}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Card>
                      }
                      enterDelay={1000}
                      enterNextDelay={500}
                      componentsProps={{
                        tooltip: {
                          sx: {
                            p: 0,
                            maxWidth: 'none',
                          },
                        },
                      }}
                    >
                      <ProfileGravatar
                        {...ProfileGravatarPropsRest}
                        email={email}
                        label={name}
                        src={profilePictureUrl}
                        size={24}
                      />
                    </Tooltip>
                  }
                  label={name || email}
                  onDelete={() => {
                    setSelectedEmailAddressHolders((prevPeople) => {
                      const nextPeople = [...prevPeople];
                      if (nextPeople.includes(emailAddress)) {
                        nextPeople.splice(nextPeople.indexOf(emailAddress), 1);
                      }
                      return nextPeople;
                    });
                  }}
                  sx={{
                    height: 32,
                  }}
                />
              );
            })}
            <Grid item xs>
              <TextField
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    input: {
                      height: 32,
                      p: 0,
                    },
                  },
                  ref: anchorRef,
                }}
                inputProps={{
                  ref: searchFieldRef,
                  onFocus: () => {
                    setIsFocused(true);
                  },
                  onBlur: () => {
                    setIsFocused(false);
                  },
                  sx: {
                    minWidth: 80,
                  },
                }}
                enableLoadingState={false}
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                }}
                showClearButton={false}
              />
              <Popper
                open={isOpen}
                anchorEl={anchorRef.current}
                transition
                placement="bottom-start"
                sx={{
                  zIndex: 9999,
                }}
              >
                {({ TransitionProps }) => {
                  return (
                    <Grow
                      {...TransitionProps}
                      style={{ transformOrigin: '0 0 0' }}
                    >
                      <Box>
                        <ClickAwayListener
                          onClickAway={(event) => {
                            if (anchorRef.current) {
                              setIsFocused(
                                isDescendant(
                                  anchorRef.current,
                                  event.target as any
                                )
                              );
                            }
                          }}
                        >
                          <PaginatedDropdownOptionList
                            options={options}
                            onSelectOption={({ value }) => {
                              setSelectedEmailAddress(String(value));
                              setSearchTerm('');
                            }}
                            keyboardFocusElement={searchFieldRef.current}
                            minWidth={
                              anchorRef.current
                                ? anchorRef.current.offsetWidth
                                : undefined
                            }
                            optionHeight={OPTION_HEIGHT}
                            showNoOptionsFoundMessage={false}
                          />
                        </ClickAwayListener>
                      </Box>
                    </Grow>
                  );
                }}
              </Popper>
            </Grid>
          </Grid>
        </Grid>
        {endAdornment ? (
          <Grid
            item
            sx={{
              display: 'flex',
              alignItems: 'end',
            }}
          >
            {endAdornment}
          </Grid>
        ) : null}
      </Grid>
      <Divider />
    </Box>
  );
});

export default EmailAddressSelector;
