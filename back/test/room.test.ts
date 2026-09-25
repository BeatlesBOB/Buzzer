import { describe, expect, it } from "vitest";
import * as game from "../src/game/room";
import { GameError, Room } from "../src/game/types";

const rules = { answerTimeoutMs: 10_000, falseStartPenaltyMs: 1_000 };

const player = (id: string) => ({ id, name: id, teamId: "", token: `token-${id}` });

const setup = (): Room => {
  const room = game.createRoom("room");
  game.addTeam(room, { id: "A", name: "A" }, player("a1"));
  game.addTeam(room, { id: "B", name: "B" }, player("b1"));
  game.addPlayer(room, "A", player("a2"));
  return room;
};

const code = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return (e as GameError).code;
  }
  return "OK";
};

describe("buzzer", () => {
  it("un seul buzz est accepté par round, toutes équipes confondues", () => {
    const room = setup();
    game.open(room);
    game.press(room, "a1", 0, rules);
    expect(code(() => game.press(room, "b1", 1, rules))).toBe("TOO_LATE");
    expect(code(() => game.press(room, "a2", 1, rules))).toBe("TOO_LATE");
    expect(room.buzz).toMatchObject({ teamId: "A", playerId: "a1" });
  });

  it("appuyer buzzer fermé = faux départ, et chaque appui prolonge la pénalité", () => {
    const room = setup();
    game.open(room);
    game.pause(room);
    expect(code(() => game.press(room, "b1", 0, rules))).toBe("FALSE_START");
    expect(code(() => game.press(room, "b1", 900, rules))).toBe("PENALIZED");
    game.open(room);
    // 1 500 ms après le premier appui, mais seulement 600 ms après le dernier
    expect(code(() => game.press(room, "b1", 1_500, rules))).toBe("PENALIZED");
    game.press(room, "a1", 1_500, rules);
    expect(room.buzz?.playerId).toBe("a1");
  });

  it("un joueur non pénalisé peut buzzer dès l'ouverture", () => {
    const room = setup();
    game.open(room);
    game.pause(room);
    game.open(room);
    expect(code(() => game.press(room, "b1", 0, rules))).toBe("OK");
  });

  it("mauvaise réponse : l'équipe est bloquée et le buzzer rouvert pour les autres", () => {
    const room = setup();
    game.open(room);
    game.press(room, "a1", 0, rules);
    game.judge(room, false);
    expect(room.phase).toBe("open");
    expect(code(() => game.press(room, "a2", 5_000, rules))).toBe("TEAM_LOCKED");
    game.press(room, "b1", 5_000, rules);
    game.judge(room, true);
    expect(room.teams.find((t) => t.id === "B")?.point).toBe(1);
    expect(room.phase).toBe("paused");
    expect(room.teams.every((t) => !t.locked)).toBe(true);
  });

  it("un timer d'un ancien round ne rouvre pas le buzz en cours", () => {
    const room = setup();
    game.open(room);
    const first = game.press(room, "a1", 0, rules);
    game.release(room);
    game.press(room, "b1", 10, rules);
    expect(game.expireBuzz(room, first.round)).toBe(false);
    expect(room.buzz?.playerId).toBe("b1");
  });

  it("si le joueur qui a la main part, le buzzer se rouvre", () => {
    const room = setup();
    game.open(room);
    game.press(room, "b1", 0, rules);
    game.removePlayer(room, "b1");
    expect(room.phase).toBe("open");
    expect(room.teams.map((t) => t.id)).toEqual(["A"]);
  });

  it("on ne rejoint pas une partie en cours, seulement en lobby ou en pause", () => {
    const room = setup();
    game.open(room);
    expect(code(() => game.addPlayer(room, "B", player("late")))).toBe("GAME_RUNNING");
    game.pause(room);
    expect(code(() => game.addPlayer(room, "B", player("late")))).toBe("OK");
  });

  it("le nombre d'équipes par room est limité", () => {
    const room = game.createRoom("room");
    for (let i = 0; i < game.MAX_TEAMS; i++) game.addTeam(room, { id: `t${i}`, name: `t${i}` }, player(`p${i}`));
    expect(code(() => game.addTeam(room, { id: "extra", name: "extra" }, player("extra")))).toBe("ROOM_FULL");
  });

  it("l'état public ne contient aucun token", () => {
    const room = setup();
    const json = JSON.stringify(game.toPublicRoom(room, () => true, 0));
    expect(json).not.toContain("token");
  });
});
