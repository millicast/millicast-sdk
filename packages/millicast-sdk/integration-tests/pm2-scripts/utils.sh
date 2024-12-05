#!/bin/bash

runApp(){
  echo "######################"
  echo "Start the $1 app in dev mode"
  echo "######################"
  local CONFIG_FILE=$1

  pm2 flush ${CONFIG_FILE}
  echo pm2 start ${CONFIG_FILE}
  pm2 start ${CONFIG_FILE}
}

verifyAppState(){
  local CONFIG_FILE=$1

  ./node_modules/node-jq/bin/jq -c '.apps[]' ${CONFIG_FILE} | while read APP; do
      NAME=$(echo $APP | ./node_modules/node-jq/bin/jq -r .name)
      SUCCESS=$(echo $APP | ./node_modules/node-jq/bin/jq -r .data.logs.SUCCESS_MSG)
      FAIL=$(echo $APP | ./node_modules/node-jq/bin/jq -r .data.logs.FAILURE_MSG)
      GREP_CMD=$(echo $APP | ./node_modules/node-jq/bin/jq -r .data.url_grep_cmd)
      ENV_NAME=$(echo $APP | ./node_modules/node-jq/bin/jq -r .data.url_env)

      verifyServerLogs ${NAME} "${SUCCESS}" "${FAIL}"

      getAppURL ${NAME} "${GREP_CMD}" ${ENV_NAME}
  done
}

verifyServerLogs(){
  echo "###################"
  echo "Verify $1 server logs"
  echo "####################"
  local NAME=$1
  local SUCCESS=$2
  local FAIL=$3
  local started="false"

  local retry=1
  while [ ${retry} -lt 40 ]
  do
      sleep 3
      local LOGS=$(pm2 logs ${NAME} --nostream --lines 25 | grep -v ".log")
      echo "${LOGS}"
      local URL_LINE=$(pm2 logs ${NAME} --nostream --lines 25 | grep "${SUCCESS}")
      echo "Server Status: ${URL_LINE}"
      if [[ ${LOGS} =~ ${FAIL} ]]; then
        echo "Failed to start the development server"
        pm2 logs ${NAME} --nostream --lines 25
        exit 1
      elif [[ ${LOGS} =~ ${SUCCESS} ]]; then
        echo "App compiled and started successfully!"
        pm2 logs ${NAME} --nostream --lines 25
        started="true"
        break
      fi

      echo "Starting the development server..." ${retry}
      ((retry=retry+1))
  done

  if [[ ${started} != "true" ]]; then
    echo "Failed to start the development server"
    pm2 logs ${NAME} --nostream --lines 100
    exit 1
  fi
}

getAppURL(){
  echo "###################"
  echo "Get $1 App URL as env variable"
  echo "####################"
  local NAME=$1
  local GREP_CMD=$2
  local ENV=$3

  echo "pm2 logs ${NAME} --nostream --lines 25 | strip-ansi | ${GREP_CMD}"
  local URL=$(pm2 logs ${NAME} --nostream --lines 25 | eval "${GREP_CMD}")
  echo "URL: ${URL}"
  echo "${ENV}=$URL" > .${NAME}.test.env
  export $ENV=$URL
}

stopApp(){
  echo "###################"
  echo "Stop the dev server"
  echo "####################"
  local CONFIG_FILE=$1

  pm2 delete ${CONFIG_FILE}
  pm2 flush
  rm -f ~/.pm2/logs/*
  rm -f .${NAME}.test.env
}

checkOS(){
  local unameOut="$(uname -s)"
  echo "OS Name: "${unameOut}
  case "${unameOut}" in
      Linux*)     machine=LINUX;;
      Darwin*)    machine=MAC;;
      *)          echo "OS Not Supported!"; exit 1;;
  esac
  echo ${machine}
  eval "${1}=${machine}"
}

cleanUpPm2Logs(){
  echo "######################"
  echo "Cleanup the $1 app pm2 logs"
  echo "######################"
  local CONFIG_FILE=$1

  ./node_modules/node-jq/bin/jq -c '.apps[]' ${CONFIG_FILE} | while read APP; do
      NAME=$(echo $APP | ./node_modules/node-jq/bin/jq -r .name)
      rm -f ~/.pm2/logs/${NAME}-error.log
      rm -f ~/.pm2/logs/${NAME}-out.log
  done
}
