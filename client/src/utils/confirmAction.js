let confirmImpl = async (message) => window.confirm(message);

export function setConfirmImplementation(fn) {
  confirmImpl = fn;
}

export function resetConfirmImplementation() {
  confirmImpl = async (message) => window.confirm(message);
}

export function confirmAction(message, options = {}) {
  return confirmImpl(message, options);
}
