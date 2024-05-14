export default function useStorage() {
  const setLocalStorageData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const getLocalStorageData = (key: string) => {
    const data = localStorage.getItem(key);
    return JSON.parse(data ?? "{}");
  };

  const removeData = (key: string) => {
    localStorage.removeItem(key);
  };

  const clearLocalStorageData = () => {
    localStorage.clear();
  };

  return {
    setLocalStorageData,
    getLocalStorageData,
    removeData,
    clearLocalStorageData,
  };
}
