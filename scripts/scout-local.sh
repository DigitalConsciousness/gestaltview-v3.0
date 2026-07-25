#!/bin/bash
# Ollama Scout - raw code assist with repo awareness
# No personality layer, just fast local inference

SCOUT_MODEL="${SCOUT_MODEL:-qwen2.5-coder:7b}"
OLLAMA_HOST="${OLLAMA_HOST:-http://localhost:11434}"

# Build repo context snapshot
REPO_SNAPSHOT=$(find . -type f \
  -not -path './.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort | head -80 | tr '\n' ' ')

echo "🔭 Scout Mode | $SCOUT_MODEL | Repo-aware"
echo "Files indexed: $(echo $REPO_SNAPSHOT | wc -w)"

while true; do
  printf "\nScout » "
  read -r INPUT
  [[ "$INPUT" == "quit" ]] && break

  curl -s "$OLLAMA_HOST/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"$SCOUT_MODEL\",
      \"messages\": [
        {\"role\": \"system\", \"content\": \"You are Scout, a raw code assistant for the GestaltView repo. Repo file tree: $REPO_SNAPSHOT. Be direct and code-focused.\"},
        {\"role\": \"user\", \"content\": $(echo "$INPUT" | jq -Rs .)}
      ]
    }" | jq -r '.choices[0].message.content'
done
