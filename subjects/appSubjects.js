import Subject from "../util/subject";

export const subjects = {
  gameState: new Subject("inactive"),
  rankingState: new Subject("hide"),
  availableCommandsCount: new Subject(1),
  orbs: new Subject([]),
  currentLog: new Subject(),
  controllers: new Subject(),
  unnamedClients: new Subject(),
  notifications: new Subject(),
  spheroServerEvents: new Subject(),
  addOrb: new Subject(),
  addClient: new Subject(),
  removeClient: new Subject(),
  setNameClient: new Subject(),
  isTestMode: new Subject(false),
  checkBattery: new Subject(),
  updateLink: new Subject(),
};

export function initialize() {
  Object.keys(subjects).forEach(subjectName => {
    subjects[subjectName].flowCurrentValue();
  });
}

