import express from "express";

export function startServer(port: number) {
  return express().listen(port);
}
