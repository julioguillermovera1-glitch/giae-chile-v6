const STORAGE_KEY = "giae_chile_v1_workspace";

export const state = {
  profile: null,
  currentProject: {
    name: "Proyecto sin nombre",
    client: "",
    installer: "",
    company: "",
    supplyType: "monofasico",
    distributor: "cge",
    loads: []
  }
};

export function setProfile(profile) {
  state.profile = profile;
  persist();
}

export function clearProfile() {
  state.profile = null;
  persist();
}

export function updateProject(patch) {
  state.currentProject = { ...state.currentProject, ...patch };
  persist();
}

export function addLoad(load) {
  state.currentProject.loads.push(load);
  persist();
}

export function clearLoads() {
  state.currentProject.loads = [];
  persist();
}

export function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function restore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return state;
  try {
    const saved = JSON.parse(raw);
    Object.assign(state, saved);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return state;
}
