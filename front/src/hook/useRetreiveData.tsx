import { useContext, useEffect } from "react";
import useStorage from "./useStorage";
import useSocket from "./useSocket";
import { Room, User } from "../types/interfaces";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../contexts/GameContextProvider";

export default function useRetreiveData() {
  const { setUser, setRoom } = useContext(GameContext);
  const navigate = useNavigate();
  const { getStorageData, setStorageData } = useStorage();
  const { dispatch, subscribe, unSubscribe } = useSocket();
  useEffect(() => {
    dispatch("room:info", {
      room: getStorageData("room"),
      user: getStorageData("user"),
    });

    const handleRoomInfo = (payload: { room: Room; user: User }) => {
      const { room, user } = payload;

      if (!room || !user || !user.isAdmin) {
        return navigate("..");
      }

      setRoom(room);
      setUser(user);
      setStorageData("room", room.id);
      setStorageData("user", user.id);
    };
    subscribe("room:info", handleRoomInfo);

    return () => {
      unSubscribe("room:info", handleRoomInfo);
    };
  }, []);
  return {};
}
