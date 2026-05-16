import b300 from "./b300.js";
import challenger604 from "./challenger604.js";
import g450 from "./g450.js";
import universal from "./universal.js";

export const AIRCRAFT = [b300, challenger604, g450, universal];
export const DEFAULT_AIRCRAFT_ID = "b300";
export const getAircraft = id => AIRCRAFT.find(a => a.id === id) ?? AIRCRAFT[0];
