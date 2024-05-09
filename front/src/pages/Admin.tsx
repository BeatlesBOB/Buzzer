import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { GameContext } from "../contexts/GameContextProvider";
import Users from "../components/Users";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { Room, Team, User } from "../types/interfaces";
import useSocket from "../hook/useSocket";
import Title from "../components/Title";
import BuzzerSound from "../assets/sound/Buzzer.mp3";

export default function Admin() {
  const { room, isAdmin, setRoom } = useContext(GameContext);
  const [isSelectedModalOpen, setIsSelectedModalOpen] = useState(false);
  const [isAnswerModalOpen, setAnswerModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);
  const { dispatch, subscribe, unSubscribe } = useSocket();
  const [answer, setAnswer] = useState<
    | {
        user: User;
        team: Team;
      }
    | undefined
  >(undefined);
  const [isBuzzerTypeModalOpen, setIsBuzzerTypeModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleTeamsUpdate = (payload: { room: Room }) => {
      const { room } = payload;
      setRoom(room);
    };

    const handleAnswer = (payload: { team: Team; user: User }) => {
      const { team, user } = payload;
      new Audio(BuzzerSound).play();

      setAnswer({
        team,
        user,
      });
      setAnswerModalOpen(true);
    };

    subscribe("room:join", handleTeamsUpdate);
    subscribe("room:start", handleTeamsUpdate);
    subscribe("game:status", handleTeamsUpdate);
    subscribe("room:leave", handleTeamsUpdate);
    subscribe("game:answer", handleAnswer);
    subscribe("room:pause", handleTeamsUpdate);

    return () => {
      unSubscribe("room:join", handleTeamsUpdate);
      unSubscribe("game:status", handleTeamsUpdate);
      unSubscribe("room:leave", handleTeamsUpdate);
      unSubscribe("room:start", handleTeamsUpdate);
      unSubscribe("room:pause", handleTeamsUpdate);
      unSubscribe("game:answer", handleAnswer);
    };
  }, []);

  useEffect(() => {
    dispatch("room:info");

    const handleRoomInfo = (payload: { room: Room }) => {
      const { room } = payload;
      setRoom(room);
    };
    subscribe("room:info", handleRoomInfo);

    return () => {
      unSubscribe("room:info", handleRoomInfo);
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
          isAdmin={isAdmin}
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
