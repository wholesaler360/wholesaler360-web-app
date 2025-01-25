
// Helper function to convert decimal to permissions object
const getPermissionsFromNumber = (num) => {
  return {
    read: Boolean(num & 8),
    write: Boolean(num & 4),
    update: Boolean(num & 2),
    delete: Boolean(num & 1),
  };
};

// Helper function to convert permissions object to decimal
const getNumberFromPermissions = (permissions) => {
  let num = 0;
  if (permissions.read) num += 8;
  if (permissions.write) num += 4;
  if (permissions.update) num += 2;
  if (permissions.delete) num += 1;
  return num;
};

export { getPermissionsFromNumber, getNumberFromPermissions };
