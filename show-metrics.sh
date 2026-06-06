#!/bin/bash
   docker run --rm -ti \
     --name=infra-monitor \
     --volume=/var/run/docker.sock:/var/run/docker.sock:ro \
     quay.io/vektorlab/ctop:latest
