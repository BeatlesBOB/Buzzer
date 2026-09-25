import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { PublicTeam } from "../../../shared/protocol";
import Button from "../components/Button";
import Modal from "../components/Modal";
import TeamList from "../components/TeamList";
import useGame from "../hook/useGame";
import useAction from "../hook/useAction";
import { request } from "../lib/socket";

export default function Lobby() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { room, session, me, myTeam, readyRoomId, watch, startSession, forgetSession, leave } = useGame();
  const act = useAction();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<PublicTeam | undefined>();

  useEffect(() => watch(id), [id, watch]);

  useEffect(() => {
    if (readyRoomId !== id) return;
    if (session?.role === "admin" && session.roomId === id) navigate(`/admin/${id}`, { replace: true });
    else if (!room) navigate("/", { replace: true });
    else if (me && room.phase !== "lobby") navigate(`/buzzer/${id}`);
  }, [readyRoomId, room, me, session, id, navigate]);

  const canJoin = !!room && (room.phase === "lobby" || room.phase === "paused");

  const openForm = (team?: PublicTeam) => {
    setSelectedTeam(team);
    setIsOpen(true);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const playerName = form.get("playerName")?.toString() ?? "";
    const res = await act(
      selectedTeam
        ? request("team:join", { roomId: id, teamId: selectedTeam.id, playerName })
        : request("team:create", { roomId: id, teamName: form.get("teamName")?.toString() ?? "", playerName })
    );
    if (!res.ok) return;
    startSession(res.data.session);
    setIsOpen(false);
  };

  const leaveTeam = async () => {
    const res = await act(request("team:leave"));
    if (res.ok) forgetSession();
  };

  const backHome = () => {
    if (confirm("Tu veux vraiment revenir en arrière ?")) {
      if (me) request("team:leave");
      leave();
      navigate("/");
    }
  };

  return (
    <>
      <div className="h-dvh p-5">
        <div className="flex flex-col h-full">
          {room && !canJoin && !me && (
            <p className="font-primary p-4 border border-black">
              La partie a commencé : tu pourras rejoindre à la prochaine pause.
            </p>
          )}
          <TeamList
            teams={room?.teams ?? []}
            player={{
              myTeamId: myTeam?.id,
              joinTeam: !me && canJoin ? openForm : undefined,
              leaveTeam,
            }}
          />
          <div className="mt-auto py-5 flex gap-5">
            {!me && (
              <Button variant="primary" handleClick={() => openForm()} label="Crée ton équipe" disabled={!canJoin} />
            )}
            <Button variant="primary" label="Retour" handleClick={backHome} />
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <form onSubmit={submit} className="flex flex-col gap-y-5 p-5">
          {selectedTeam ? (
            <p className="font-primary">Rejoindre {selectedTeam.name}</p>
          ) : (
            <input type="text" name="teamName" className="border-b-2" placeholder="Nom d'équipe" maxLength={30} required />
          )}
          <input type="text" name="playerName" className="border-b-2" placeholder="Ton pti nom" maxLength={30} required />
          <Button type="submit" variant="primary" label="Lezzzz Go" />
        </form>
      </Modal>
    </>
  );
}
