#!/usr/bin/env bash

load_env_file() {
  local env_file="$1"
  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$env_file"
    set +a
  fi
}

load_repo_env() {
  local repo_root="$1"

  load_env_file "$repo_root/.env"
  load_env_file "$repo_root/.env.codex"
  load_env_file "$repo_root/client/.env"
}
