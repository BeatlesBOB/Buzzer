export default function useStorage() {
  const setStorageData = (key: string, data: any) => {
    sessionStorage.setItem(key, JSON.stringify(data));
  };

  const getStorageData = (key: string) => {
    const data = sessionStorage.getItem(key);
    return JSON.parse(data ?? "{}");
  };

  const removeStorageData = (key: string) => {
    sessionStorage.removeItem(key);
  };

  const clearStorageData = () => {
    sessionStorage.clear();
  };

  return {
    setStorageData,
    getStorageData,
    removeStorageData,
    clearStorageData,
  };
}
