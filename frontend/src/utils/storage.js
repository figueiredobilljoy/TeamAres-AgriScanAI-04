const LOCATION_KEY = 'agriscan_location';
const LATEST_RESULT_KEY = 'agriscan_latest_result';

export function getSavedLocation() {
  return readJson(LOCATION_KEY);
}

export function saveLocation(location) {
  localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
}

export function getLatestResult() {
  return readJson(LATEST_RESULT_KEY);
}

export function saveLatestResult(result) {
  localStorage.setItem(LATEST_RESULT_KEY, JSON.stringify(result));
}

function readJson(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}
