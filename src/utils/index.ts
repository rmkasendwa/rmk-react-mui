export const parseNameAndEmailAddressCombination = (
  inputName: string
): {
  name: string;
  email?: string;
} => {
  inputName = inputName.trim();

  const emailMatchinRegex =
    /<([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)>$/;

  const match = inputName.match(emailMatchinRegex);
  if (match) {
    const [, email] = match;
    return {
      name: inputName.replace(emailMatchinRegex, '').trim(),
      email,
    };
  }

  return {
    name: inputName,
  };
};
