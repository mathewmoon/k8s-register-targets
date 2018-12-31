#!/bin/bash

PUSH=false
TAG=latest
CACHE=--no-cache
REPOSITORY=bashism/eks-register-targets

function usage(){
  cat<<EOF
Build docker image.
  Usage:  ./build.sh [OPTIONS]

  Options:
    -p push to registry
    -t <tag> tag
    -b <branch> git branch to use
    -c use cache (dev purposes)
    -r specify repository to push to
EOF
}

while [[ ! -z $1 ]]; do
  case $1 in
    -t|--tag)
      shift
      TAG="$1"
      ;;
    -p|--push)
      PUSH="true"
      ;;
    -b|--branch)
      shift
      BRANCH="$1"
      ;;
    -c|--cache)
      shift
      CACHE=""
      ;;
    -r|--repository)
      shift
      REPOSITORY="$1"
      ;;
    *)
      usage
      exit 1
      ;;
  esac
  shift
done

CMD="docker build ${CACHE} -t ${REPOSITORY}:${TAG} ."

echo "#################################################"
echo "#         Running build with: $CMD              #"
echo "#################################################"

${CMD}

if [ $? -gt 0 ]; then
  echo "Build failed" && exit 1
fi

if [[ ${PUSH} != false ]]; then
  echo -e "\n*** ${REPOSITORY}:${TAG} ***\n"
  docker push ${REPOSITORY}:${TAG}
fi
