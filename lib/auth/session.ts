"use client";

import { useSyncExternalStore } from "react";

const ACCESS_TOKEN_KEY = "blog_access_token";
const SESSION_CHANGE_EVENT = "blog-session-change";

function subscribeToSession(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SESSION_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SESSION_CHANGE_EVENT, onChange);
  };
}

function getSessionToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getSessionReady() {
  return true;
}

function getServerSessionReady() {
  return false;
}

export function useAccessToken() {
  return useSyncExternalStore(subscribeToSession, getSessionToken, () => null);
}

export function useSessionReady() {
  return useSyncExternalStore(
    subscribeToSession,
    getSessionReady,
    getServerSessionReady,
  );
}

export function saveAccessToken(token: string) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

export function clearAccessToken() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}
