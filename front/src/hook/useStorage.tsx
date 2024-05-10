export default function useStorage() {
  
    const setData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const getData = (key: string) => {
    const data = localStorage.getItem(key);
    return JSON.parse(data ?? "{}");
  };

  const removeData = (key: string) => {
    localStorage.removeItem(key);
  };

  const clearData = () => {
    localStorage.clear();
  };

  return {
    setData,
    getData,
    removeData,
    clearData,
  };
}
