#!/bin/bash
cd /home/kavia/workspace/code-generation/goalmap-105183-046d2e3c/goal_roadmap_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

