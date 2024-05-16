import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { GameContext } from "../contexts/GameContextProvider";
import Users from "../components/Users";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { Answer, Room, Team, User } from "../types/interfaces";
import useSocket from "../hook/useSocket";
import Title from "../components/Title";
import BuzzerSound from "../assets/sound/Buzzer.mp3";
import useStorage from "../hook/useStorage";
import useToasts from "../hook/useToasts";

const audio = new Audio(BuzzerSound);

export default function Admin() {
  const { room, setRoom, setUser, user } = useContext(GameContext);
  const [isSelectedModalOpen, setIsSelectedModalOpen] = useState(false);
  const [isAnswerModalOpen, setAnswerModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);
  const { dispatch, subscribe, unSubscribe } = useSocket();
  const [answer, setAnswer] = useState<Answer | undefined>(undefined);
  const [isBuzzerTypeModalOpen, setIsBuzzerTypeModalOpen] = useState(false);
  const navigate = useNavigate();
  const { getStorageData, setStorageData, clearStorageData } = useStorage();
  const { pushToast } = useToasts();

  useEffect(() => {
    dispatch("room:info", {
      room: getStorageData("room"),
      user: getStorageData("user"),
    });

    const handleRoomInfo = (payload: { room: Room; user: User }) => {
      const { room, user } = payload;

      if (!room || !user || !user.isAdmin) {
        clearStorageData();
        return navigate("..");
      }

      setRoom(room);
      setUser(user);
      dispatch("room:join", { room: room.id });

      setStorageData("room", room.id);
      setStorageData("user", user.id);
    };

    subscribe("room:info", handleRoomInfo);

    return () => {
      unSubscribe("room:info", handleRoomInfo);
    };
  }, []);

  useEffect(() => {
    const handleRoomUpdate = (payload: { room: Room }) => {
      const { room } = payload;
      setRoom(room);
    };

    const handleAnswer = (payload: { team: Team; user: User }) => {
      const { team, user } = payload;
      audio.play();
      setAnswer({
        team,
        user,
      });
      setAnswerModalOpen(true);
    };

    const handleError = (payload: { msg: string }) => {
      pushToast({
        title: "Whooops, nan mais on savait que ça pouvait pas être parfait",
        desc: payload.msg,
      });
    };

    subscribe("game:start", handleRoomUpdate);
    subscribe("buzzer:notification", handleError);

    subscribe("room:join", handleRoomUpdate);
    subscribe("room:leave", handleRoomUpdate);

    subscribe("team:create", handleRoomUpdate);
    subscribe("team:join", handleRoomUpdate);
    subscribe("team:leave", handleRoomUpdate);

    subscribe("game:answer", handleAnswer);
    subscribe("room:pause", handleRoomUpdate);

    return () => {
      unSubscribe("game:start", handleRoomUpdate);
      unSubscribe("buzzer:notification", handleError);

      unSubscribe("room:join", handleRoomUpdate);
      unSubscribe("room:leave", handleRoomUpdate);

      unSubscribe("team:create", handleRoomUpdate);
      unSubscribe("team:join", handleRoomUpdate);
      unSubscribe("team:leave", handleRoomUpdate);
      unSubscribe("game:answer", handleAnswer);
      unSubscribe("room:pause", handleRoomUpdate);
    };
  }, []);

  const resetTeamBuzzer = (team: Team) => {
    dispatch("game:buzzer:reset:team", { team: team.id });
  };

  const updateTeamPoint = (team: Team, point: number) => {
    dispatch("game:point", { team: team.id, point });
  };

  const startGame = () => {
    dispatch("room:start");
  };

  const pauseGame = () => {
    dispatch("room:pause");
  };

  const resetAllBuzzer = () => {
    dispatch("game:buzzer:reset");
  };

  const resetAllPoints = () => {
    dispatch("game:point:reset");
  };

  const copyRoomId = () => {
    const roomId = room?.id || "L'a pétée la Room...";
    navigator.clipboard.writeText(roomId);
  };

  const homePath = () => {
    let path = `/`;
    if (confirm("Tu veux vraiment revenir en arrière et flinguer la game ?")) {
      navigate(path);
    }
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 h-dvh p-5">
        <Users
          resetTeamBuzzer={resetTeamBuzzer}
          leaveTeam={(team) => {
            setSelectedTeam(team);
            setIsSelectedModalOpen(true);
          }}
          isAdmin={user?.isAdmin}
          teams={room?.teams}
          updateTeamPoint={updateTeamPoint}
        />
        <div className="flex flex-col items-center justify-center gap-6 h-full">
          <Title />
          <Button
            type="primary"
            label={room?.id || "L'a pétée la Room..."}
            handleClick={copyRoomId}
          />
          <QRCode value={room?.id || ""} />
          <div className="flex gap-5 flex-wrap justify-center">
            <div className="basis-full flex justify-center">
              <Button
                type="primary"
                label={room?.hasStarted ? "Pause" : "Start"}
                handleClick={room?.hasStarted ? pauseGame : startGame}
              />
            </div>

            <Button
              label="Reset tous les buzzer"
              handleClick={resetAllBuzzer}
            />
            <Button
              label="Reset tous les points"
              handleClick={resetAllPoints}
            />

            <Button
              label="Change buzzer type"
              handleClick={() => setIsBuzzerTypeModalOpen(true)}
            />
            <div className="basis-full flex justify-center">
              <Button type="primary" label="Retour" handleClick={homePath} />
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isSelectedModalOpen} setIsOpen={setIsSelectedModalOpen}>
        <div className="p-5">
          {selectedTeam && (
            <>
              <ul className="flex flex-col gap-5 mb-5">
                {selectedTeam?.users.map((user: User) => {
                  return (
                    <li className="p-5 flex items-center justify-between border border-black">
                      <p>{user.name}</p>
                      <Button
                        label="Jme barre"
                        handleClick={() => {
                          dispatch("room:leave", {
                            team: selectedTeam?.id,
                            user: user.id,
                          });
                        }}
                      ></Button>
                    </li>
                  );
                })}
              </ul>
              <Button
                label="Delete team"
                handleClick={() => {
                  dispatch("room:leave", { team: selectedTeam?.id });
                }}
              />
            </>
          )}
        </div>
      </Modal>
      <Modal isOpen={isAnswerModalOpen} setIsOpen={setAnswerModalOpen}>
        <div className="p-5">
          {answer && (
            <div className="flex flex-col gap-5">
              <h1 className="font-semibold text-2xl">{answer.team.name}</h1>
              <h2 className="font-medium text-xl">{answer.team.point}</h2>
              <h3 className="font-medium text-lg">{answer.user.name}</h3>
            </div>
          )}
        </div>
      </Modal>
      <Modal
        isOpen={isBuzzerTypeModalOpen}
        setIsOpen={setIsBuzzerTypeModalOpen}
      >
        <div className="p-5">
          <form
            className="group flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input type="radio" value="speed" required name="type" />
            <input type="radio" value="choice" required name="type" />
            <input
              type="number"
              name="number"
              className="group-has-[input[value='choice']:checked]:block"
            />
            <input type="radio" value="text" required name="type" />
            <Button label="change" type="primary" />
          </form>
        </div>
      </Modal>
    </>
  );
}
