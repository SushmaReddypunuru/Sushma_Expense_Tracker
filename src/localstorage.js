export const AddToLs = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const GetFromLs = (key) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};
